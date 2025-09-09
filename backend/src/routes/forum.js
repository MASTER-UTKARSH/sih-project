const express = require('express');
const { models } = require('../config/database');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Get forum posts
router.get('/', async (req, res) => {
  try {
    const { category = 'general', limit = 20, offset = 0 } = req.query;
    
    const posts = await models.ForumPost.findByCategory(category, parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      data: { posts }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create post
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, content, category = 'general', isAnonymous = true } = req.body;
    
    const post = await models.ForumPost.create({
      userId: req.user.id,
      title,
      content,
      category,
      isAnonymous
    });
    
    res.json({
      success: true,
      data: { post }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
