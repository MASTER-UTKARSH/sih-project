const express = require('express');
const { models } = require('../config/database');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Create screening
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { tool, responses, consentForAnalytics } = req.body;
    
    let scoreData;
    if (tool === 'PHQ-9') {
      scoreData = models.Screening.calculatePHQ9Score(responses);
    } else if (tool === 'GAD-7') {
      scoreData = models.Screening.calculateGAD7Score(responses);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid screening tool'
      });
    }

    const screening = await models.Screening.create({
      userId: req.user.id,
      tool,
      responses,
      score: scoreData.score,
      severity: scoreData.severity,
      consentForAnalytics: consentForAnalytics || false,
      followUpRequired: scoreData.severity === 'moderately-severe' || scoreData.severity === 'severe'
    });

    res.json({
      success: true,
      data: {
        screening: {
          id: screening.id,
          tool: screening.tool,
          score: screening.score,
          severity: screening.severity,
          recommendations: screening.getRecommendations(),
          completedAt: screening.completedAt
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

// Get user's screening history
router.get('/', authenticateToken, async (req, res) => {
  try {
    const screenings = await models.Screening.findAll({
      where: { userId: req.user.id },
      order: [['completedAt', 'DESC']],
      attributes: ['id', 'tool', 'score', 'severity', 'completedAt']
    });

    res.json({
      success: true,
      data: { screenings }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
