const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
