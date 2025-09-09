const express = require('express');
const jwt = require('jsonwebtoken');
const { models } = require('../config/database');
const { generateToken } = require('../utils/encryption');
const router = express.Router();

// Create anonymous session
router.post('/anonymous', async (req, res) => {
  try {
    const user = await models.User.createAnonymous();
    
    const token = jwt.sign(
      { userId: user.id, anonId: user.anonId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: user.toSafeJSON()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Email registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, consentFlags } = req.body;
    
    // Check if user already exists
    const existingUser = await models.User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    const user = await models.User.create({
      email,
      passwordHash: password,
      authType: 'email',
      consentFlags: consentFlags || {}
    });

    const token = jwt.sign(
      { userId: user.id, anonId: user.anonId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: user.toSafeJSON()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Email login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await models.User.findByEmail(email);
    if (!user || !await user.validatePassword(password)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    await user.updateLastActive();

    const token = jwt.sign(
      { userId: user.id, anonId: user.anonId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: user.toSafeJSON()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Middleware to verify token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await models.User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid token'
    });
  }
};

module.exports = { router, authenticateToken };
