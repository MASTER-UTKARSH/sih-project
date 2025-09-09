const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Conversation = sequelize.define('Conversation', {
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
    sessionId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    messages: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of conversation messages'
    },
    riskLevel: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'low'
    },
    riskFlags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Array of detected risk keywords/patterns'
    },
    escalated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    escalatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    escalatedTo: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'counselor, hotline, admin'
    },
    mood: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Detected mood from conversation'
    },
    topics: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      comment: 'Topics discussed in conversation'
    },
    sentiment: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Overall sentiment score (-1 to 1)'
    },
    lastActiveAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    endedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    feedback: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'User feedback about the conversation'
    }
  }, {
    indexes: [
      { fields: ['userId'] },
      { fields: ['sessionId'] },
      { fields: ['riskLevel'] },
      { fields: ['escalated'] },
      { fields: ['lastActiveAt'] },
      { fields: ['createdAt'] }
    ]
  });

  // Crisis keywords for immediate escalation
  const CRISIS_KEYWORDS = [
    'suicide', 'kill myself', 'end it all', 'want to die', 
    'harm myself', 'self harm', 'cut myself', 'overdose',
    'not worth living', 'better off dead', 'end my life'
  ];

  const HIGH_RISK_KEYWORDS = [
    'hopeless', 'worthless', 'trapped', 'burden', 
    'alone', 'desperate', 'cant take it', 'give up'
  ];

  const MEDIUM_RISK_KEYWORDS = [
    'depressed', 'anxious', 'stressed', 'overwhelmed',
    'sad', 'worried', 'panic', 'fear'
  ];

  // Instance methods
  Conversation.prototype.addMessage = async function(message) {
    // Analyze message for risk
    const riskAnalysis = this.analyzeMessageRisk(message.content);
    
    // Add message to conversation
    this.messages = [...this.messages, {
      ...message,
      timestamp: new Date(),
      riskScore: riskAnalysis.score
    }];
    
    // Update risk level if necessary
    if (riskAnalysis.level > this.getRiskLevelNumber(this.riskLevel)) {
      this.riskLevel = riskAnalysis.level;
      this.riskFlags = [...new Set([...this.riskFlags, ...riskAnalysis.flags])];
    }
    
    this.lastActiveAt = new Date();
    
    // Auto-escalate if critical
    if (riskAnalysis.level === 'critical' && !this.escalated) {
      await this.escalate('crisis-detected');
    }
    
    await this.save();
    return this;
  };

  Conversation.prototype.analyzeMessageRisk = function(content) {
    const lowerContent = content.toLowerCase();
    const flags = [];
    let riskScore = 0;
    let riskLevel = 'low';
    
    // Check for crisis keywords
    for (const keyword of CRISIS_KEYWORDS) {
      if (lowerContent.includes(keyword)) {
        flags.push(`crisis:${keyword}`);
        riskScore += 10;
        riskLevel = 'critical';
      }
    }
    
    // Check for high risk keywords
    for (const keyword of HIGH_RISK_KEYWORDS) {
      if (lowerContent.includes(keyword)) {
        flags.push(`high:${keyword}`);
        riskScore += 5;
        if (riskLevel !== 'critical') riskLevel = 'high';
      }
    }
    
    // Check for medium risk keywords
    for (const keyword of MEDIUM_RISK_KEYWORDS) {
      if (lowerContent.includes(keyword)) {
        flags.push(`medium:${keyword}`);
        riskScore += 2;
        if (riskLevel === 'low') riskLevel = 'medium';
      }
    }
    
    return { score: riskScore, level: riskLevel, flags };
  };

  Conversation.prototype.getRiskLevelNumber = function(level) {
    const levels = { low: 0, medium: 1, high: 2, critical: 3 };
    return levels[level] || 0;
  };

  Conversation.prototype.escalate = async function(reason = 'manual') {
    this.escalated = true;
    this.escalatedAt = new Date();
    this.escalatedTo = this.riskLevel === 'critical' ? 'hotline' : 'counselor';
    
    // Add escalation message
    const escalationMessage = {
      role: 'system',
      content: `Conversation escalated due to: ${reason}`,
      timestamp: new Date(),
      type: 'escalation'
    };
    
    this.messages = [...this.messages, escalationMessage];
    await this.save();
    
    // Trigger notification (would be handled by service layer)
    return this;
  };

  Conversation.prototype.endConversation = async function(feedback = null) {
    this.endedAt = new Date();
    if (feedback) {
      this.feedback = feedback;
    }
    await this.save();
    return this;
  };

  Conversation.prototype.getSummary = function() {
    return {
      id: this.id,
      duration: this.endedAt ? 
        (new Date(this.endedAt) - new Date(this.createdAt)) / 1000 / 60 : // minutes
        (new Date() - new Date(this.createdAt)) / 1000 / 60,
      messageCount: this.messages.length,
      riskLevel: this.riskLevel,
      escalated: this.escalated,
      topics: this.topics,
      mood: this.mood,
      sentiment: this.sentiment
    };
  };

  // Class methods
  Conversation.findActiveByUser = async function(userId) {
    return await this.findOne({
      where: {
        userId,
        endedAt: null
      },
      order: [['lastActiveAt', 'DESC']]
    });
  };

  Conversation.findEscalated = async function(timeRange = '24h') {
    const since = new Date();
    switch (timeRange) {
      case '1h': since.setHours(since.getHours() - 1); break;
      case '24h': since.setDate(since.getDate() - 1); break;
      case '7d': since.setDate(since.getDate() - 7); break;
    }
    
    return await this.findAll({
      where: {
        escalated: true,
        escalatedAt: {
          [sequelize.Sequelize.Op.gte]: since
        }
      },
      order: [['escalatedAt', 'DESC']]
    });
  };

  // Associations
  Conversation.associate = (models) => {
    Conversation.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Conversation;
};
