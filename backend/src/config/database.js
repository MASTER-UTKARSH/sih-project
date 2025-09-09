const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

// Database connection configuration
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'dpis_db',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
  dialect: 'postgres',
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
  },
  logging: (msg) => logger.debug(msg),
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
    paranoid: true, // Soft deletes
  }
});

// Test database connection
async function connectDB() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    return sequelize;
  } catch (error) {
    logger.error('Unable to connect to database:', error);
    throw error;
  }
}

// Import and initialize models
const User = require('../models/User');
const Screening = require('../models/Screening');
const Conversation = require('../models/Conversation');
const Booking = require('../models/Booking');
const ForumPost = require('../models/ForumPost');
const AuditLog = require('../models/AuditLog');
const Resource = require('../models/Resource');
const Counselor = require('../models/Counselor');

// Initialize models
const models = {
  User: User(sequelize),
  Screening: Screening(sequelize),
  Conversation: Conversation(sequelize),
  Booking: Booking(sequelize),
  ForumPost: ForumPost(sequelize),
  AuditLog: AuditLog(sequelize),
  Resource: Resource(sequelize),
  Counselor: Counselor(sequelize)
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Sync database models
async function syncDatabase(options = {}) {
  try {
    // In development, you might want to set force: true to recreate tables
    const syncOptions = {
      force: process.env.NODE_ENV === 'development' && process.env.DB_FORCE_SYNC === 'true',
      alter: process.env.NODE_ENV === 'development',
      ...options
    };
    
    await sequelize.sync(syncOptions);
    logger.info('Database models synchronized successfully');
    
    // Run seeders in development
    if (process.env.NODE_ENV === 'development') {
      await runSeeders();
    }
    
    return true;
  } catch (error) {
    logger.error('Failed to sync database models:', error);
    throw error;
  }
}

// Run database seeders
async function runSeeders() {
  try {
    const { createDefaultCounselors } = require('../seeders/counselorSeeders');
    const { createDefaultResources } = require('../seeders/resourceSeeders');
    
    await createDefaultCounselors(models);
    await createDefaultResources(models);
    
    logger.info('Database seeders completed successfully');
  } catch (error) {
    logger.warn('Error running seeders:', error.message);
  }
}

module.exports = {
  sequelize,
  models,
  connectDB,
  syncDatabase
};
