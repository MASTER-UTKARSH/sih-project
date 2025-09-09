const express = require('express');
const { models } = require('../config/database');
const { authenticateToken } = require('./auth');
const { Op } = require('sequelize');
const router = express.Router();

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (!req.user.roles.includes('admin') && !req.user.roles.includes('counselor')) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// Get dashboard analytics
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (timeRange) {
      case '24h': startDate.setDate(now.getDate() - 1); break;
      case '7d': startDate.setDate(now.getDate() - 7); break;
      case '30d': startDate.setDate(now.getDate() - 30); break;
      default: startDate.setDate(now.getDate() - 7);
    }
    
    // Get screening statistics
    const screeningStats = await models.Screening.findAll({
      where: {
        consentForAnalytics: true,
        createdAt: { [Op.gte]: startDate }
      },
      attributes: ['severity', 'tool', 'createdAt'],
      raw: true
    });
    
    // Get conversation statistics
    const conversationStats = await models.Conversation.findAll({
      where: {
        createdAt: { [Op.gte]: startDate }
      },
      attributes: ['riskLevel', 'escalated', 'createdAt'],
      raw: true
    });
    
    // Get booking statistics
    const bookingStats = await models.Booking.findAll({
      where: {
        createdAt: { [Op.gte]: startDate }
      },
      attributes: ['status', 'priority', 'createdAt'],
      raw: true
    });
    
    // Get flagged forum posts
    const flaggedPosts = await models.ForumPost.findFlagged();
    
    // Process data for dashboard
    const analytics = {
      screenings: {
        total: screeningStats.length,
        byTool: screeningStats.reduce((acc, s) => {
          acc[s.tool] = (acc[s.tool] || 0) + 1;
          return acc;
        }, {}),
        bySeverity: screeningStats.reduce((acc, s) => {
          acc[s.severity] = (acc[s.severity] || 0) + 1;
          return acc;
        }, {})
      },
      conversations: {
        total: conversationStats.length,
        escalated: conversationStats.filter(c => c.escalated).length,
        byRiskLevel: conversationStats.reduce((acc, c) => {
          acc[c.riskLevel] = (acc[c.riskLevel] || 0) + 1;
          return acc;
        }, {})
      },
      bookings: {
        total: bookingStats.length,
        byStatus: bookingStats.reduce((acc, b) => {
          acc[b.status] = (acc[b.status] || 0) + 1;
          return acc;
        }, {}),
        byPriority: bookingStats.reduce((acc, b) => {
          acc[b.priority] = (acc[b.priority] || 0) + 1;
          return acc;
        }, {})
      },
      moderation: {
        flaggedPosts: flaggedPosts.length,
        pendingReview: flaggedPosts.filter(p => p.status === 'under-review').length
      }
    };
    
    res.json({
      success: true,
      data: { analytics, timeRange }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get crisis alerts
router.get('/alerts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const escalatedConversations = await models.Conversation.findEscalated('24h');
    
    res.json({
      success: true,
      data: { alerts: escalatedConversations }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get moderation queue
router.get('/moderation', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const flaggedPosts = await models.ForumPost.findFlagged();
    
    res.json({
      success: true,
      data: { flaggedPosts }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
