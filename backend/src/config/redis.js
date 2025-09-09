const redis = require('redis');
const logger = require('../utils/logger');

let redisClient = null;

async function connectRedis() {
  try {
    const redisConfig = {
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
      },
      password: process.env.REDIS_PASSWORD || undefined,
    };

    redisClient = redis.createClient(redisConfig);

    redisClient.on('error', (err) => {
      logger.error('Redis error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected successfully');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready to use');
    });

    redisClient.on('end', () => {
      logger.info('Redis client connection ended');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    
    // Return a mock client if Redis is not available (for development)
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Using mock Redis client for development');
      return createMockRedisClient();
    }
    
    throw error;
  }
}

// Mock Redis client for development when Redis is not available
function createMockRedisClient() {
  const mockStore = new Map();
  
  return {
    get: async (key) => mockStore.get(key) || null,
    set: async (key, value, options = {}) => {
      mockStore.set(key, value);
      if (options.EX) {
        setTimeout(() => mockStore.delete(key), options.EX * 1000);
      }
      return 'OK';
    },
    del: async (key) => {
      const existed = mockStore.has(key);
      mockStore.delete(key);
      return existed ? 1 : 0;
    },
    exists: async (key) => mockStore.has(key) ? 1 : 0,
    expire: async (key, seconds) => {
      if (mockStore.has(key)) {
        setTimeout(() => mockStore.delete(key), seconds * 1000);
        return 1;
      }
      return 0;
    },
    flushAll: async () => {
      mockStore.clear();
      return 'OK';
    },
    disconnect: async () => {
      mockStore.clear();
      return 'OK';
    }
  };
}

function getRedisClient() {
  return redisClient;
}

// Cache helper functions
const cache = {
  async get(key) {
    try {
      if (!redisClient) return null;
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  },

  async set(key, value, ttlSeconds = 3600) {
    try {
      if (!redisClient) return false;
      const serialized = JSON.stringify(value);
      await redisClient.set(key, serialized, { EX: ttlSeconds });
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  },

  async del(key) {
    try {
      if (!redisClient) return false;
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  },

  async exists(key) {
    try {
      if (!redisClient) return false;
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  cache
};
