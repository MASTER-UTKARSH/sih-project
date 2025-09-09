const express = require('express');
const { models } = require('../config/database');
const { authenticateToken } = require('./auth');
const chatbotService = require('../services/chatbotService');
const logger = require('../utils/logger');
const router = express.Router();

// Start or continue conversation
router.post('/chat', authenticateToken, async (req, res) => {
  try {
    const { message, conversationId } = req.body;
    
    let conversation;
    
    // Get existing conversation or create new one
    if (conversationId) {
      conversation = await models.Conversation.findOne({
        where: { id: conversationId, userId: req.user.id }
      });
    } else {
      conversation = await models.Conversation.findActiveByUser(req.user.id);
    }
    
    if (!conversation) {
      conversation = await models.Conversation.create({
        userId: req.user.id
      });
    }
    
    // Process message with chatbot service
    const botResponse = await chatbotService.processMessage(
      message,
      conversation.messages,
      { userId: req.user.anonId }
    );
    
    // Add user message to conversation
    await conversation.addMessage({
      role: 'user',
      content: message
    });
    
    // Add bot response to conversation
    await conversation.addMessage({
      role: 'assistant',
      content: botResponse.response,
      resources: botResponse.resources,
      coping: botResponse.coping
    });
    
    // Handle escalation if needed
    if (botResponse.escalate || botResponse.riskLevel === 'critical') {
      await conversation.escalate('high-risk-detected');
      
      // Emit crisis alert via socket.io
      const { io } = require('../index');
      io.emit('crisis-alert', {
        userId: req.user.anonId,
        conversationId: conversation.id,
        riskLevel: botResponse.riskLevel,
        timestamp: new Date()
      });
      
      logger.crisis(req.user.anonId, botResponse.riskLevel, {
        conversationId: conversation.id,
        message: message
      });
    }
    
    res.json({
      success: true,
      data: {
        conversationId: conversation.id,
        message: botResponse.response,
        riskLevel: botResponse.riskLevel,
        resources: botResponse.resources,
        coping: botResponse.coping,
        escalated: conversation.escalated
      }
    });
    
  } catch (error) {
    logger.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      error: 'Unable to process message'
    });
  }
});

// Get conversation history
router.get('/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const conversation = await models.Conversation.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        conversation: {
          id: conversation.id,
          messages: conversation.messages,
          riskLevel: conversation.riskLevel,
          escalated: conversation.escalated,
          createdAt: conversation.createdAt
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

// End conversation
router.post('/conversations/:id/end', authenticateToken, async (req, res) => {
  try {
    const { feedback } = req.body;
    
    const conversation = await models.Conversation.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    await conversation.endConversation(feedback);
    
    res.json({
      success: true,
      data: {
        message: 'Conversation ended successfully',
        summary: conversation.getSummary()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
