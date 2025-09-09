const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Resource = sequelize.define('Resource', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('video', 'audio', 'text', 'guide', 'exercise', 'worksheet'),
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('mindfulness', 'sleep-hygiene', 'stress-management', 'coping-strategies', 'relaxation', 'cognitive-techniques', 'crisis-resources'),
      allowNull: false
    },
    language: {
      type: DataTypes.STRING,
      defaultValue: 'en'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    thumbnailUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Duration in seconds'
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    downloadable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    ratingCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    indexes: [
      { fields: ['type'] },
      { fields: ['category'] },
      { fields: ['language'] },
      { fields: ['isPublic'] },
      { fields: ['tags'], using: 'gin' }
    ]
  });

  return Resource;
};

// Counselor model
const CounselorModel = (sequelize) => {
  const Counselor = sequelize.define('Counselor', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    specializations: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    languages: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['en']
    },
    availableHours: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Weekly availability schedule'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    maxDailyBookings: {
      type: DataTypes.INTEGER,
      defaultValue: 8
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    credentials: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    rating: {
      type: DataTypes.FLOAT,
      defaultValue: 0
    },
    totalSessions: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  });

  Counselor.associate = (models) => {
    Counselor.hasMany(models.Booking, {
      foreignKey: 'counselorId',
      as: 'bookings'
    });
  };

  return Counselor;
};

module.exports.Counselor = CounselorModel;
