const express = require('express');
const { models } = require('../config/database');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Get resources
router.get('/', async (req, res) => {
  try {
    const { category, type, language = 'en', limit = 20, offset = 0 } = req.query;
    
    const where = { isPublic: true };
    if (category) where.category = category;
    if (type) where.type = type;
    if (language) where.language = language;
    
    const resources = await models.Resource.findAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['rating', 'DESC'], ['viewCount', 'DESC']]
    });
    
    res.json({
      success: true,
      data: { resources }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
