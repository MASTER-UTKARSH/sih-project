const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Screening = sequelize.define('Screening', {
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
    tool: {
      type: DataTypes.ENUM('PHQ-9', 'GAD-7'),
      allowNull: false
    },
    responses: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: 'Array of question responses'
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    severity: {
      type: DataTypes.ENUM('minimal', 'mild', 'moderate', 'moderately-severe', 'severe'),
      allowNull: false
    },
    consentForAnalytics: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    completedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    followUpRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    followUpAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    indexes: [
      { fields: ['userId'] },
      { fields: ['tool'] },
      { fields: ['severity'] },
      { fields: ['completedAt'] },
      { fields: ['followUpRequired'] },
      { fields: ['consentForAnalytics'] }
    ]
  });

  // Class methods for scoring
  Screening.calculatePHQ9Score = function(responses) {
    if (!Array.isArray(responses) || responses.length !== 9) {
      throw new Error('PHQ-9 requires exactly 9 responses');
    }
    
    const score = responses.reduce((sum, response) => {
      const value = parseInt(response);
      if (isNaN(value) || value < 0 || value > 3) {
        throw new Error('PHQ-9 responses must be between 0 and 3');
      }
      return sum + value;
    }, 0);
    
    let severity;
    if (score <= 4) severity = 'minimal';
    else if (score <= 9) severity = 'mild';
    else if (score <= 14) severity = 'moderate';
    else if (score <= 19) severity = 'moderately-severe';
    else severity = 'severe';
    
    return { score, severity };
  };

  Screening.calculateGAD7Score = function(responses) {
    if (!Array.isArray(responses) || responses.length !== 7) {
      throw new Error('GAD-7 requires exactly 7 responses');
    }
    
    const score = responses.reduce((sum, response) => {
      const value = parseInt(response);
      if (isNaN(value) || value < 0 || value > 3) {
        throw new Error('GAD-7 responses must be between 0 and 3');
      }
      return sum + value;
    }, 0);
    
    let severity;
    if (score <= 4) severity = 'minimal';
    else if (score <= 9) severity = 'mild';
    else if (score <= 14) severity = 'moderate';
    else severity = 'severe';
    
    return { score, severity };
  };

  // Instance methods
  Screening.prototype.requiresFollowUp = function() {
    return this.severity === 'moderately-severe' || this.severity === 'severe';
  };

  Screening.prototype.isCritical = function() {
    return this.severity === 'severe';
  };

  Screening.prototype.getRecommendations = function() {
    switch (this.severity) {
      case 'minimal':
        return {
          level: 'self-help',
          message: 'Your responses suggest minimal symptoms. Consider maintaining healthy habits and using our resource library.',
          resources: ['mindfulness', 'sleep-hygiene', 'stress-management']
        };
      case 'mild':
        return {
          level: 'monitor',
          message: 'Your responses suggest mild symptoms. Consider using our chatbot for support and exploring our resources.',
          resources: ['coping-strategies', 'relaxation', 'peer-support']
        };
      case 'moderate':
        return {
          level: 'intervention',
          message: 'Your responses suggest moderate symptoms. We recommend speaking with a counselor and using our support tools.',
          resources: ['counseling', 'cognitive-techniques', 'support-groups']
        };
      case 'moderately-severe':
        return {
          level: 'professional-help',
          message: 'Your responses suggest moderately severe symptoms. Please consider booking a counseling session soon.',
          resources: ['immediate-counseling', 'crisis-resources', 'professional-support']
        };
      case 'severe':
        return {
          level: 'urgent',
          message: 'Your responses suggest severe symptoms. Please reach out for immediate professional support.',
          resources: ['crisis-hotline', 'emergency-counseling', 'immediate-intervention']
        };
      default:
        return {
          level: 'unknown',
          message: 'Please retake the assessment for accurate recommendations.',
          resources: []
        };
    }
  };

  // Associations
  Screening.associate = (models) => {
    Screening.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Screening;
};
