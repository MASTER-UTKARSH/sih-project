const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { encrypt, decrypt } = require('../utils/encryption');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    anonId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      allowNull: false
    },
    authType: {
      type: DataTypes.ENUM('email', 'sso', 'anonymous'),
      allowNull: false,
      defaultValue: 'anonymous'
    },
    email: {
      type: DataTypes.TEXT, // Encrypted
      allowNull: true,
      unique: true
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: true
    },
    roles: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: ['student'],
      allowNull: false
    },
    consentFlags: {
      type: DataTypes.JSONB,
      defaultValue: {
        analytics: false,
        research: false,
        marketing: false
      }
    },
    profileData: {
      type: DataTypes.JSONB, // Encrypted sensitive fields
      defaultValue: {}
    },
    lastActive: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    preferences: {
      type: DataTypes.JSONB,
      defaultValue: {
        language: 'en',
        theme: 'light',
        notifications: true
      }
    }
  }, {
    hooks: {
      beforeCreate: async (user) => {
        // Hash password if provided
        if (user.passwordHash) {
          user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
        }
        
        // Encrypt email if provided
        if (user.email) {
          user.email = encrypt(user.email);
        }
      },
      beforeUpdate: async (user) => {
        // Hash password if being updated
        if (user.changed('passwordHash') && user.passwordHash) {
          user.passwordHash = await bcrypt.hash(user.passwordHash, 12);
        }
        
        // Encrypt email if being updated
        if (user.changed('email') && user.email) {
          user.email = encrypt(user.email);
        }
      }
    },
    indexes: [
      { fields: ['anonId'] },
      { fields: ['email'] },
      { fields: ['authType'] },
      { fields: ['isActive'] },
      { fields: ['lastActive'] }
    ]
  });

  // Instance methods
  User.prototype.validatePassword = async function(password) {
    if (!this.passwordHash) return false;
    return await bcrypt.compare(password, this.passwordHash);
  };

  User.prototype.getDecryptedEmail = function() {
    if (!this.email) return null;
    try {
      return decrypt(this.email);
    } catch (error) {
      return null;
    }
  };

  User.prototype.toSafeJSON = function() {
    const user = this.toJSON();
    delete user.passwordHash;
    delete user.email; // Keep encrypted
    return user;
  };

  User.prototype.updateLastActive = async function() {
    this.lastActive = new Date();
    await this.save();
  };

  // Class methods
  User.findByEmail = async function(email) {
    const encryptedEmail = encrypt(email);
    return await this.findOne({ where: { email: encryptedEmail } });
  };

  User.findByAnonId = async function(anonId) {
    return await this.findOne({ where: { anonId } });
  };

  User.createAnonymous = async function() {
    return await this.create({
      authType: 'anonymous',
      anonId: uuidv4()
    });
  };

  // Associations
  User.associate = (models) => {
    User.hasMany(models.Screening, {
      foreignKey: 'userId',
      as: 'screenings'
    });
    
    User.hasMany(models.Conversation, {
      foreignKey: 'userId',
      as: 'conversations'
    });
    
    User.hasMany(models.Booking, {
      foreignKey: 'userId',
      as: 'bookings'
    });
    
    User.hasMany(models.ForumPost, {
      foreignKey: 'userId',
      as: 'posts'
    });
    
    User.hasMany(models.AuditLog, {
      foreignKey: 'userId',
      as: 'auditLogs'
    });
  };

  return User;
};
