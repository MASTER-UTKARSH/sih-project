const express = require('express');
const { models } = require('../config/database');
const { authenticateToken } = require('./auth');
const router = express.Router();

// Create booking
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { counselorId, scheduledAt, type = 'video', notes, priority = 'medium' } = req.body;
    
    const booking = await models.Booking.create({
      userId: req.user.id,
      counselorId,
      scheduledAt: new Date(scheduledAt),
      type,
      notesEncrypted: notes,
      priority
    });
    
    res.json({
      success: true,
      data: { booking }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user's bookings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const bookings = await models.Booking.findAll({
      where: { userId: req.user.id },
      include: [{
        model: models.Counselor,
        as: 'counselor',
        attributes: ['name', 'specializations']
      }],
      order: [['scheduledAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: { bookings }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get available counselors
router.get('/counselors', authenticateToken, async (req, res) => {
  try {
    const counselors = await models.Counselor.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'specializations', 'languages', 'bio', 'rating']
    });
    
    res.json({
      success: true,
      data: { counselors }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
