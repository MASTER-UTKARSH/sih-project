const { DataTypes } = require('sequelize');
const { encrypt, decrypt } = require('../utils/encryption');

module.exports = (sequelize) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    counselorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Counselor',
        key: 'id'
      }
    },
    anonymousToken: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'For anonymous bookings'
    },
    scheduledAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 60,
      comment: 'Duration in minutes'
    },
    type: {
      type: DataTypes.ENUM('in-person', 'video', 'voice', 'chat'),
      defaultValue: 'video'
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'),
      defaultValue: 'scheduled'
    },
    notesEncrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Encrypted notes from user'
    },
    counselorNotesEncrypted: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Encrypted notes from counselor'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    reminderSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    consentForRecording: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    meetingUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    meetingId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    rescheduledFrom: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Booking',
        key: 'id'
      }
    },
    cancelledBy: {
      type: DataTypes.ENUM('user', 'counselor', 'system'),
      allowNull: true
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    followUpRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    hooks: {
      beforeSave: (booking) => {
        if (booking.changed('notesEncrypted') && booking.notesEncrypted) {
          booking.notesEncrypted = encrypt(booking.notesEncrypted);
        }
        if (booking.changed('counselorNotesEncrypted') && booking.counselorNotesEncrypted) {
          booking.counselorNotesEncrypted = encrypt(booking.counselorNotesEncrypted);
        }
      }
    },
    indexes: [
      { fields: ['userId'] },
      { fields: ['counselorId'] },
      { fields: ['scheduledAt'] },
      { fields: ['status'] },
      { fields: ['priority'] },
      { fields: ['anonymousToken'] }
    ]
  });

  // Instance methods
  Booking.prototype.getDecryptedNotes = function() {
    if (!this.notesEncrypted) return null;
    try {
      return decrypt(this.notesEncrypted);
    } catch (error) {
      return null;
    }
  };

  Booking.prototype.getDecryptedCounselorNotes = function() {
    if (!this.counselorNotesEncrypted) return null;
    try {
      return decrypt(this.counselorNotesEncrypted);
    } catch (error) {
      return null;
    }
  };

  Booking.prototype.canReschedule = function() {
    const now = new Date();
    const scheduledTime = new Date(this.scheduledAt);
    const hoursDiff = (scheduledTime - now) / (1000 * 60 * 60);
    
    return this.status === 'scheduled' && hoursDiff > 24; // 24 hours notice
  };

  Booking.prototype.canCancel = function() {
    const now = new Date();
    const scheduledTime = new Date(this.scheduledAt);
    const hoursDiff = (scheduledTime - now) / (1000 * 60 * 60);
    
    return this.status === 'scheduled' && hoursDiff > 2; // 2 hours notice
  };

  Booking.prototype.isUpcoming = function() {
    const now = new Date();
    const scheduledTime = new Date(this.scheduledAt);
    const hoursDiff = (scheduledTime - now) / (1000 * 60 * 60);
    
    return this.status === 'scheduled' && hoursDiff > 0 && hoursDiff <= 24;
  };

  Booking.prototype.reschedule = async function(newTime) {
    if (!this.canReschedule()) {
      throw new Error('Cannot reschedule this booking');
    }
    
    const originalBooking = await Booking.create({
      ...this.dataValues,
      id: undefined,
      scheduledAt: newTime,
      rescheduledFrom: this.id,
      reminderSent: false
    });
    
    this.status = 'cancelled';
    this.cancelledBy = 'user';
    this.cancellationReason = 'Rescheduled';
    await this.save();
    
    return originalBooking;
  };

  // Class methods
  Booking.findUpcoming = async function(userId, hours = 24) {
    const now = new Date();
    const future = new Date(now.getTime() + (hours * 60 * 60 * 1000));
    
    return await this.findAll({
      where: {
        userId,
        status: ['scheduled', 'confirmed'],
        scheduledAt: {
          [sequelize.Sequelize.Op.between]: [now, future]
        }
      },
      order: [['scheduledAt', 'ASC']]
    });
  };

  // Associations
  Booking.associate = (models) => {
    Booking.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    Booking.belongsTo(models.Counselor, {
      foreignKey: 'counselorId',
      as: 'counselor'
    });
    
    Booking.belongsTo(Booking, {
      foreignKey: 'rescheduledFrom',
      as: 'originalBooking'
    });
  };

  return Booking;
};
