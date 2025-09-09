const express = require('express');
const { sequelize } = require('../config/database');
const { getRedisClient } = require('../config/redis');
const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    // Check database connection
    try {
      await sequelize.authenticate();
      health.database = 'connected';
    } catch (error) {
      health.database = 'disconnected';
      health.status = 'degraded';
    }

    // Check Redis connection
    try {
      const redisClient = getRedisClient();
      if (redisClient) {
        await redisClient.ping();
        health.redis = 'connected';
      } else {
        health.redis = 'disconnected';
        health.status = 'degraded';
      }
    } catch (error) {
      health.redis = 'disconnected';
      health.status = 'degraded';
    }

    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
