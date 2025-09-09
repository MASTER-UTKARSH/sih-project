require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// In-memory storage for demo (replace with database in full version)
const users = new Map();
const conversations = new Map();

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'DPIS Backend is running!',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication endpoints
app.post('/api/auth/anonymous', (req, res) => {
  try {
    const anonId = uuidv4();
    const userId = uuidv4();
    
    const user = {
      id: userId,
      anonId,
      authType: 'anonymous',
      roles: ['student'],
      consentFlags: {
        analytics: false,
        research: false,
        marketing: false
      },
      preferences: {
        language: 'en',
        theme: 'light',
        notifications: true
      },
      createdAt: new Date()
    };
    
    users.set(userId, user);
    
    const token = jwt.sign(
      { userId, anonId },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          anonId: user.anonId,
          authType: user.authType,
          roles: user.roles,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, consentFlags } = req.body;
    
    // Check if user exists
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }
    
    const userId = uuidv4();
    const anonId = uuidv4();
    
    const user = {
      id: userId,
      anonId,
      email,
      authType: 'email',
      roles: ['student'],
      consentFlags: consentFlags || {},
      preferences: {
        language: 'en',
        theme: 'light',
        notifications: true
      },
      createdAt: new Date()
    };
    
    users.set(userId, user);
    
    const token = jwt.sign(
      { userId, anonId },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          anonId: user.anonId,
          authType: user.authType,
          roles: user.roles,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    const token = jwt.sign(
      { userId: user.id, anonId: user.anonId },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          anonId: user.anonId,
          authType: user.authType,
          roles: user.roles,
          preferences: user.preferences
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Simple chatbot endpoint
app.post('/api/chatbot/chat', (req, res) => {
  try {
    const { message, conversationId } = req.body;
    
    // Simple response logic
    let response = "Thank you for reaching out. I'm here to support you. ";
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('sad') || lowerMessage.includes('depressed')) {
      response += "I hear that you're feeling sad. It's important to know that you're not alone, and these feelings are valid. Have you tried any breathing exercises or talking to someone you trust?";
    } else if (lowerMessage.includes('anxious') || lowerMessage.includes('worried')) {
      response += "Anxiety can be overwhelming. Try the 5-4-3-2-1 grounding technique: name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste.";
    } else if (lowerMessage.includes('stress')) {
      response += "Academic stress is very common. Remember to take breaks, get enough sleep, and break large tasks into smaller ones. Would you like some specific study tips?";
    } else {
      response += "I understand you're going through something difficult. Can you tell me more about how you're feeling today?";
    }
    
    // Check for crisis keywords
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'want to die', 'harm myself'];
    const hasCrisisContent = crisisKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (hasCrisisContent) {
      response = "I'm very concerned about what you're sharing. Your safety is the most important thing. Please reach out for immediate help: 🚨 Crisis Hotline: +91-9152987821. You don't have to go through this alone.";
    }
    
    res.json({
      success: true,
      data: {
        conversationId: conversationId || uuidv4(),
        message: response,
        riskLevel: hasCrisisContent ? 'critical' : 'low',
        escalated: hasCrisisContent,
        resources: hasCrisisContent ? [
          { name: 'Crisis Hotline', contact: '+91-9152987821', available: '24/7' }
        ] : []
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Unable to process message'
    });
  }
});

// Placeholder endpoints
app.get('/api/resources', (req, res) => {
  res.json({
    success: true,
    data: {
      resources: [
        {
          id: '1',
          title: '5-4-3-2-1 Grounding Technique',
          description: 'A simple grounding exercise to help manage anxiety',
          type: 'guide',
          category: 'coping-strategies'
        },
        {
          id: '2',
          title: 'Box Breathing Exercise',
          description: 'A breathing technique to reduce stress',
          type: 'exercise',
          category: 'relaxation'
        }
      ]
    }
  });
});

app.get('/api/booking/counselors', (req, res) => {
  res.json({
    success: true,
    data: {
      counselors: [
        {
          id: '1',
          name: 'Dr. Priya Sharma',
          specializations: ['Depression', 'Anxiety', 'Academic Stress'],
          languages: ['en', 'hi'],
          rating: 4.8
        }
      ]
    }
  });
});

app.get('/api/forum', (req, res) => {
  res.json({
    success: true,
    data: {
      posts: [
        {
          id: '1',
          title: 'Managing exam stress',
          content: 'How do you all manage stress during exam season?',
          category: 'academic-stress',
          isAnonymous: true,
          upvoteCount: 5,
          replyCount: 3
        }
      ]
    }
  });
});

// Error handling
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 DPIS Minimal Backend is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test anonymous auth: POST http://localhost:${PORT}/api/auth/anonymous`);
  console.log(`💬 Google AI API Key: ${process.env.GOOGLE_AI_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
});
