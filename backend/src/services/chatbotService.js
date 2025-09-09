const { GoogleGenerativeAI } = require('@google/generative-ai');
const logger = require('../utils/logger');

// Initialize Google AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

class ChatbotService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
    this.systemPrompt = `You are a compassionate mental health support chatbot for college students. You provide empathetic, supportive responses while following these guidelines:

1. SAFETY FIRST: If you detect any mention of self-harm, suicide, or immediate danger, respond with immediate support resources and escalate.
2. Be warm, understanding, and non-judgmental
3. Provide practical coping strategies and techniques
4. Encourage professional help when appropriate
5. Keep responses concise but meaningful (2-3 sentences typically)
6. Use simple, accessible language
7. Always validate the user's feelings
8. Don't provide medical diagnoses or replace professional therapy
9. Include breathing exercises, grounding techniques, or mindfulness practices when helpful

Remember: You're providing first-aid mental health support, not therapy. Your goal is to offer immediate comfort and guide users to appropriate resources.`;

    // Predefined responses for common scenarios
    this.predefinedResponses = {
      greeting: [
        "Hello! I'm here to support you. How are you feeling today?",
        "Hi there! I'm glad you reached out. What's on your mind?",
        "Welcome! I'm here to listen and help. How can I support you right now?"
      ],
      crisis: [
        "I'm really concerned about what you're sharing. You're not alone in this. Let me connect you with someone who can help right now.",
        "Your safety is the most important thing. Please reach out to a counselor immediately or call the crisis hotline.",
        "I hear that you're in a lot of pain right now. Please know that there are people who want to help. Let's get you connected with professional support immediately."
      ],
      anxiety: [
        "It sounds like you're feeling anxious. Let's try a quick grounding exercise: name 5 things you can see, 4 things you can touch, 3 things you can hear.",
        "Anxiety can feel overwhelming, but you're taking a positive step by reaching out. Try taking slow, deep breaths - in for 4, hold for 4, out for 6.",
        "I understand anxiety can be really difficult. One thing that often helps is the 4-7-8 breathing technique. Would you like to try it with me?"
      ],
      depression: [
        "Thank you for sharing how you're feeling. Depression can make everything feel heavy, but please know that these feelings can improve with support.",
        "I hear that you're struggling right now. Even small steps, like reaching out here, show incredible strength. Have you been able to talk to anyone about how you're feeling?",
        "It takes courage to acknowledge these feelings. You don't have to go through this alone - there are people who want to help."
      ],
      stress: [
        "Academic stress is really common, and it sounds like you're dealing with a lot right now. What's feeling most overwhelming?",
        "Stress can feel all-consuming, but there are ways to manage it. Sometimes breaking things into smaller, manageable steps helps. What's one small thing you could do today?",
        "I understand you're feeling stressed. Let's focus on what you can control right now. What's one thing that usually helps you feel a bit calmer?"
      ]
    };

    // Crisis keywords for immediate escalation
    this.crisisKeywords = [
      'suicide', 'kill myself', 'end it all', 'want to die', 'harm myself', 
      'self harm', 'cut myself', 'overdose', 'not worth living', 'better off dead',
      'end my life', 'jump off', 'pills', 'razor', 'rope'
    ];

    // High-risk keywords for elevated support
    this.highRiskKeywords = [
      'hopeless', 'worthless', 'trapped', 'burden', 'alone', 'desperate',
      'cant take it', 'give up', 'nothing matters', 'pointless', 'useless'
    ];
  }

  /**
   * Process user message and generate appropriate response
   */
  async processMessage(message, conversationHistory = [], userContext = {}) {
    try {
      const startTime = Date.now();
      
      // Analyze risk level first
      const riskAnalysis = this.analyzeRisk(message);
      
      // If crisis detected, return immediate crisis response
      if (riskAnalysis.level === 'critical') {
        logger.crisis(userContext.userId, 'critical', { message, riskAnalysis });
        return {
          response: this.getCrisisResponse(),
          riskLevel: 'critical',
          escalate: true,
          resources: this.getCrisisResources()
        };
      }

      // Determine response type based on content
      const responseType = this.determineResponseType(message);
      
      let response;
      
      // Use predefined responses for common scenarios (faster)
      if (this.shouldUsePredefined(message, responseType)) {
        response = this.getPredefinedResponse(responseType);
      } else {
        // Use AI for more complex or unique queries
        response = await this.generateAIResponse(message, conversationHistory, userContext);
      }

      const duration = Date.now() - startTime;
      logger.performance('chatbot_response', duration, { 
        responseType, 
        useAI: !this.shouldUsePredefined(message, responseType) 
      });

      return {
        response,
        riskLevel: riskAnalysis.level,
        escalate: riskAnalysis.level === 'high',
        resources: this.getRecommendedResources(responseType, riskAnalysis.level),
        coping: this.getCopingTechniques(responseType)
      };

    } catch (error) {
      logger.error('Chatbot service error:', error);
      return this.getFallbackResponse();
    }
  }

  /**
   * Analyze message for risk keywords and patterns
   */
  analyzeRisk(message) {
    const lowerMessage = message.toLowerCase();
    let riskLevel = 'low';
    const flags = [];

    // Check for crisis keywords
    for (const keyword of this.crisisKeywords) {
      if (lowerMessage.includes(keyword)) {
        flags.push(`crisis:${keyword}`);
        riskLevel = 'critical';
        break;
      }
    }

    // Check for high-risk keywords if not already critical
    if (riskLevel !== 'critical') {
      for (const keyword of this.highRiskKeywords) {
        if (lowerMessage.includes(keyword)) {
          flags.push(`high:${keyword}`);
          riskLevel = 'high';
        }
      }
    }

    // Additional pattern analysis
    if (lowerMessage.includes('anxious') || lowerMessage.includes('panic')) {
      flags.push('anxiety');
      if (riskLevel === 'low') riskLevel = 'medium';
    }

    if (lowerMessage.includes('depressed') || lowerMessage.includes('sad')) {
      flags.push('depression');
      if (riskLevel === 'low') riskLevel = 'medium';
    }

    return { level: riskLevel, flags };
  }

  /**
   * Determine appropriate response type based on message content
   */
  determineResponseType(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'greeting';
    }
    
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('panic')) {
      return 'anxiety';
    }
    
    if (lowerMessage.includes('depressed') || lowerMessage.includes('depression') || lowerMessage.includes('sad')) {
      return 'depression';
    }
    
    if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed') || lowerMessage.includes('exam')) {
      return 'stress';
    }
    
    return 'general';
  }

  /**
   * Check if predefined response should be used
   */
  shouldUsePredefined(message, responseType) {
    // Use predefined for simple greetings and common scenarios
    return ['greeting', 'anxiety', 'depression', 'stress'].includes(responseType) && 
           message.length < 200; // For longer messages, use AI for more personalized response
  }

  /**
   * Get predefined response for common scenarios
   */
  getPredefinedResponse(type) {
    const responses = this.predefinedResponses[type] || this.predefinedResponses.general;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Generate AI response using Google Generative AI
   */
  async generateAIResponse(message, conversationHistory = [], userContext = {}) {
    try {
      // Build conversation context
      let prompt = this.systemPrompt + "\n\n";
      
      // Add conversation history for context
      if (conversationHistory.length > 0) {
        prompt += "Previous conversation:\n";
        conversationHistory.slice(-6).forEach(msg => { // Last 6 messages for context
          prompt += `${msg.role}: ${msg.content}\n`;
        });
      }
      
      prompt += `\nStudent: ${message}\nChatbot:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Ensure response follows safety guidelines
      return this.sanitizeResponse(text);

    } catch (error) {
      logger.error('Google AI API error:', error);
      return this.getFallbackResponse().response;
    }
  }

  /**
   * Sanitize AI response to ensure it follows guidelines
   */
  sanitizeResponse(response) {
    // Remove any inappropriate content or medical advice
    response = response.replace(/I am a doctor|I can diagnose|medical diagnosis/gi, 
                                'I recommend speaking with a healthcare professional');
    
    // Ensure response isn't too long
    if (response.length > 500) {
      response = response.substring(0, 497) + '...';
    }
    
    return response.trim();
  }

  /**
   * Get crisis response with immediate support resources
   */
  getCrisisResponse() {
    return `I'm very concerned about you right now. Your safety is the most important thing. Please reach out for immediate help:

🚨 Crisis Hotline: ${process.env.CRISIS_HOTLINE || '+91-9152987821'}
📧 Counselor: ${process.env.COUNSELOR_EMAIL || 'counselor@college.edu'}

You don't have to go through this alone. There are people who care and want to help you. Would you like me to help you book an urgent counseling session?`;
  }

  /**
   * Get crisis resources
   */
  getCrisisResources() {
    return [
      {
        type: 'hotline',
        name: 'Crisis Hotline',
        contact: process.env.CRISIS_HOTLINE || '+91-9152987821',
        available: '24/7'
      },
      {
        type: 'counselor',
        name: 'College Counselor',
        contact: process.env.COUNSELOR_EMAIL || 'counselor@college.edu',
        available: 'Office hours'
      },
      {
        type: 'emergency',
        name: 'Emergency Services',
        contact: '112',
        available: '24/7'
      }
    ];
  }

  /**
   * Get recommended resources based on response type and risk level
   */
  getRecommendedResources(type, riskLevel) {
    const resources = [];
    
    if (riskLevel === 'critical') {
      return this.getCrisisResources();
    }
    
    switch (type) {
      case 'anxiety':
        resources.push(
          { name: 'Breathing Exercises', type: 'technique' },
          { name: 'Grounding Techniques', type: 'technique' },
          { name: 'Anxiety Management Guide', type: 'resource' }
        );
        break;
      case 'depression':
        resources.push(
          { name: 'Depression Support Resources', type: 'resource' },
          { name: 'Mood Tracking Tools', type: 'tool' },
          { name: 'Counseling Services', type: 'service' }
        );
        break;
      case 'stress':
        resources.push(
          { name: 'Stress Management Techniques', type: 'technique' },
          { name: 'Time Management Tools', type: 'tool' },
          { name: 'Study Skills Resources', type: 'resource' }
        );
        break;
    }
    
    return resources;
  }

  /**
   * Get coping techniques based on response type
   */
  getCopingTechniques(type) {
    const techniques = {
      anxiety: [
        '4-7-8 Breathing: Inhale for 4, hold for 7, exhale for 8',
        '5-4-3-2-1 Grounding: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste',
        'Progressive muscle relaxation: Tense and release muscle groups'
      ],
      depression: [
        'Gentle movement: Take a short walk or do light stretching',
        'Connect with someone: Reach out to a friend or family member',
        'Small accomplishments: Do one small task you can complete'
      ],
      stress: [
        'Deep breathing: Take 5 slow, deep breaths',
        'Break it down: Divide overwhelming tasks into smaller steps',
        'Take breaks: Use the Pomodoro technique (25 min work, 5 min break)'
      ]
    };
    
    return techniques[type] || techniques.stress;
  }

  /**
   * Fallback response when other methods fail
   */
  getFallbackResponse() {
    return {
      response: "I'm here to listen and support you. Sometimes I might not have the perfect response, but please know that what you're feeling is valid. If you're in crisis or need immediate help, please reach out to a counselor or crisis hotline.",
      riskLevel: 'medium',
      escalate: false,
      resources: [
        { name: 'Talk to a Counselor', type: 'service' },
        { name: 'Crisis Support', type: 'service' }
      ]
    };
  }
}

module.exports = new ChatbotService();
