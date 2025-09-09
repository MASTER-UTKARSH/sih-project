const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Crisis keywords for detection
const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'die', 'death', 'hurt myself',
  'self harm', 'cutting', 'overdose', 'pills', 'jump', 'hanging',
  'worthless', 'hopeless', 'better off dead', 'no point', 'can\'t go on'
];

const URGENT_KEYWORDS = [
  'panic', 'anxiety attack', 'can\'t breathe', 'heart racing', 'dizzy',
  'emergency', 'urgent', 'help me', 'crisis', 'desperate'
];

// In-memory storage for conversations (in production, use database)
const conversations = new Map();

// AI Response Templates
const AI_RESPONSES = {
  greeting: [
    "Hello! I'm here to listen and support you. How are you feeling today?",
    "Hi there! I'm glad you reached out. What would you like to talk about?",
    "Welcome! I'm here to provide a safe space for you. How can I help you today?"
  ],
  
  crisis: [
    "I'm very concerned about what you've shared. Your life has value and there is help available. Please contact emergency services (911) or call our crisis hotline at +91-9152987821 immediately.",
    "I hear that you're in a lot of pain right now. Please know that you're not alone and there are people who want to help. Can you reach out to someone you trust or call +91-9152987821?",
    "What you're feeling is valid, but please don't give up. There are trained counselors available 24/7 at +91-9152987821 who can help you through this difficult time."
  ],
  
  anxiety: [
    "It sounds like you're experiencing anxiety. Let's try some grounding techniques. Can you name 5 things you can see around you right now?",
    "Anxiety can feel overwhelming, but you're safe right now. Try taking slow, deep breaths. Breathe in for 4 counts, hold for 4, exhale for 6.",
    "I understand anxiety can be frightening. Remember that this feeling will pass. Can you think of a time when you felt anxious before and it got better?"
  ],
  
  depression: [
    "Thank you for sharing how you're feeling. Depression can make everything feel heavy, but you've taken a brave step by reaching out.",
    "I hear that you're struggling right now. Even small steps matter - like talking to me today. What's one tiny thing that brought you even a moment of comfort recently?",
    "Depression can make it hard to see hope, but you are worthy of support and healing. Have you been able to maintain any daily routines that help you feel grounded?"
  ],
  
  stress: [
    "Stress can feel overwhelming. Let's break it down - what's the biggest thing weighing on your mind right now?",
    "It sounds like you have a lot on your plate. Sometimes it helps to write down your concerns and tackle them one by one. What feels most urgent?",
    "I understand you're feeling stressed. What coping strategies have helped you in the past when you've felt this way?"
  ],
  
  supportive: [
    "That sounds really difficult. Thank you for trusting me with this. You're not alone in feeling this way.",
    "I appreciate you sharing that with me. It takes courage to open up about these feelings.",
    "Your feelings are valid and it's okay to feel this way. How can we work together to help you feel a bit better?",
    "I'm glad you're here talking about this. That shows real strength, even if it doesn't feel that way right now."
  ],
  
  coping: [
    "Here are some coping strategies that many people find helpful: deep breathing, progressive muscle relaxation, or going for a short walk. What appeals to you?",
    "When we're overwhelmed, grounding techniques can help. Try the 5-4-3-2-1 method: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste.",
    "Self-care isn't selfish. Some simple things: drink water, get some fresh air, listen to calming music, or reach out to a friend. What feels doable right now?"
  ]
};

// Helper functions
function detectCrisis(message) {
  const lowercaseMessage = message.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => 
    lowercaseMessage.includes(keyword.toLowerCase())
  );
}

function detectUrgent(message) {
  const lowercaseMessage = message.toLowerCase();
  return URGENT_KEYWORDS.some(keyword => 
    lowercaseMessage.includes(keyword.toLowerCase())
  );
}

function categorizeMessage(message) {
  const lowercaseMessage = message.toLowerCase();
  
  if (detectCrisis(message)) return 'crisis';
  if (detectUrgent(message)) return 'anxiety';
  
  if (lowercaseMessage.includes('anxious') || lowercaseMessage.includes('panic') || lowercaseMessage.includes('worry')) {
    return 'anxiety';
  }
  if (lowercaseMessage.includes('depressed') || lowercaseMessage.includes('sad') || lowercaseMessage.includes('hopeless')) {
    return 'depression';
  }
  if (lowercaseMessage.includes('stress') || lowercaseMessage.includes('overwhelmed') || lowercaseMessage.includes('pressure')) {
    return 'stress';
  }
  
  return 'supportive';
}

function generateAIResponse(message, conversationHistory = []) {
  const category = categorizeMessage(message);
  const responses = AI_RESPONSES[category] || AI_RESPONSES.supportive;
  
  // Simple response selection based on message
  const response = responses[Math.floor(Math.random() * responses.length)];
  
  // Add coping suggestions for non-crisis situations
  let fullResponse = response;
  if (category !== 'crisis' && Math.random() > 0.5) {
    const copingResponse = AI_RESPONSES.coping[Math.floor(Math.random() * AI_RESPONSES.coping.length)];
    fullResponse += "\n\n" + copingResponse;
  }
  
  return {
    text: fullResponse,
    category,
    isCrisis: category === 'crisis',
    isUrgent: category === 'anxiety' && detectUrgent(message),
    timestamp: new Date().toISOString()
  };
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'DPIS Chat Service is running!',
    timestamp: new Date().toISOString()
  });
});

// Start new conversation
app.post('/api/chat/start', (req, res) => {
  const { userId } = req.body;
  const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const conversation = {
    id: conversationId,
    userId: userId || 'anonymous',
    messages: [],
    startedAt: new Date().toISOString(),
    isActive: true,
    metadata: {
      crisisDetected: false,
      riskLevel: 'LOW'
    }
  };
  
  conversations.set(conversationId, conversation);
  
  // Send initial greeting
  const greeting = AI_RESPONSES.greeting[Math.floor(Math.random() * AI_RESPONSES.greeting.length)];
  const initialMessage = {
    id: `msg_${Date.now()}`,
    sender: 'ai',
    text: greeting,
    timestamp: new Date().toISOString(),
    category: 'greeting'
  };
  
  conversation.messages.push(initialMessage);
  
  res.json({
    conversationId,
    message: initialMessage,
    conversation: {
      id: conversationId,
      isActive: true,
      startedAt: conversation.startedAt
    }
  });
});

// Send message
app.post('/api/chat/message', (req, res) => {
  const { conversationId, message, userId } = req.body;
  
  if (!conversationId || !message) {
    return res.status(400).json({ error: 'Conversation ID and message are required' });
  }
  
  const conversation = conversations.get(conversationId);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  // Add user message
  const userMessage = {
    id: `msg_${Date.now()}`,
    sender: 'user',
    text: message,
    timestamp: new Date().toISOString()
  };
  
  conversation.messages.push(userMessage);
  
  // Generate AI response
  const aiResponse = generateAIResponse(message, conversation.messages);
  const aiMessage = {
    id: `msg_${Date.now() + 1}`,
    sender: 'ai',
    text: aiResponse.text,
    timestamp: aiResponse.timestamp,
    category: aiResponse.category,
    isCrisis: aiResponse.isCrisis,
    isUrgent: aiResponse.isUrgent
  };
  
  conversation.messages.push(aiMessage);
  
  // Update conversation metadata
  if (aiResponse.isCrisis) {
    conversation.metadata.crisisDetected = true;
    conversation.metadata.riskLevel = 'HIGH';
    console.log(`🚨 CRISIS DETECTED in conversation ${conversationId}`);
  } else if (aiResponse.isUrgent) {
    conversation.metadata.riskLevel = 'MODERATE';
  }
  
  conversation.lastActivity = new Date().toISOString();
  
  res.json({
    userMessage,
    aiMessage,
    conversation: {
      id: conversationId,
      messageCount: conversation.messages.length,
      riskLevel: conversation.metadata.riskLevel,
      crisisDetected: conversation.metadata.crisisDetected
    },
    resources: aiResponse.isCrisis ? getCrisisResources() : getGeneralResources()
  });
});

// Get conversation history
app.get('/api/chat/conversation/:conversationId', (req, res) => {
  const { conversationId } = req.params;
  const conversation = conversations.get(conversationId);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  res.json({
    conversation: {
      id: conversation.id,
      messages: conversation.messages,
      startedAt: conversation.startedAt,
      lastActivity: conversation.lastActivity,
      isActive: conversation.isActive,
      metadata: conversation.metadata
    }
  });
});

// End conversation
app.post('/api/chat/end', (req, res) => {
  const { conversationId, feedback } = req.body;
  const conversation = conversations.get(conversationId);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  
  conversation.isActive = false;
  conversation.endedAt = new Date().toISOString();
  conversation.feedback = feedback;
  
  res.json({
    message: 'Conversation ended successfully',
    summary: {
      duration: new Date(conversation.endedAt) - new Date(conversation.startedAt),
      messageCount: conversation.messages.length,
      riskLevel: conversation.metadata.riskLevel,
      crisisDetected: conversation.metadata.crisisDetected
    }
  });
});

function getCrisisResources() {
  return [
    {
      type: 'emergency',
      title: 'Emergency Services',
      description: 'If you are in immediate danger',
      contact: '911',
      action: 'Call Now'
    },
    {
      type: 'crisis_hotline',
      title: 'Crisis Helpline',
      description: '24/7 crisis support',
      contact: '+91-9152987821',
      action: 'Call Now'
    },
    {
      type: 'text_crisis',
      title: 'Crisis Text Line',
      description: 'Text support available',
      contact: 'Text HOME to 741741',
      action: 'Text Now'
    }
  ];
}

function getGeneralResources() {
  return [
    {
      type: 'counseling',
      title: 'Professional Counseling',
      description: 'Schedule with a qualified therapist',
      action: 'Book Session'
    },
    {
      type: 'support_groups',
      title: 'Support Groups',
      description: 'Connect with others who understand',
      action: 'Find Groups'
    },
    {
      type: 'self_help',
      title: 'Self-Help Resources',
      description: 'Tools and techniques for managing mental health',
      action: 'Explore Tools'
    }
  ];
}

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`💬 DPIS Chat Service running on port ${PORT}`);
});

module.exports = app;
