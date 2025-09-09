const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ForumPost = sequelize.define('ForumPost', {
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
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'ForumPost',
        key: 'id'
      },
      comment: 'For threaded replies'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Only for top-level posts'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    contentHash: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Hash for duplicate detection'
    },
    category: {
      type: DataTypes.ENUM('general', 'academic-stress', 'relationships', 'anxiety', 'depression', 'support', 'resources'),
      defaultValue: 'general'
    },
    isAnonymous: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    status: {
      type: DataTypes.ENUM('active', 'flagged', 'under-review', 'approved', 'removed'),
      defaultValue: 'active'
    },
    flaggedCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    upvoteCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    downvoteCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    replyCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    moderatorNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: []
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastActivityAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    hooks: {
      beforeCreate: (post) => {
        // Generate content hash for duplicate detection
        const crypto = require('crypto');
        post.contentHash = crypto.createHash('sha256').update(post.content).digest('hex');
      },
      afterCreate: async (post) => {
        // Update parent reply count
        if (post.parentId) {
          await ForumPost.increment('replyCount', { where: { id: post.parentId } });
          await ForumPost.update({ lastActivityAt: new Date() }, { where: { id: post.parentId } });
        }
      }
    },
    indexes: [
      { fields: ['userId'] },
      { fields: ['parentId'] },
      { fields: ['category'] },
      { fields: ['status'] },
      { fields: ['contentHash'] },
      { fields: ['lastActivityAt'] },
      { fields: ['isPinned'] }
    ]
  });

  // Instance methods
  ForumPost.prototype.flag = async function(reason = 'inappropriate') {
    this.flaggedCount += 1;
    if (this.flaggedCount >= 3) {
      this.status = 'under-review';
    }
    await this.save();
  };

  ForumPost.prototype.upvote = async function() {
    this.upvoteCount += 1;
    await this.save();
  };

  ForumPost.prototype.downvote = async function() {
    this.downvoteCount += 1;
    await this.save();
  };

  ForumPost.prototype.getScore = function() {
    return this.upvoteCount - this.downvoteCount;
  };

  // Class methods
  ForumPost.findByCategory = async function(category, limit = 20, offset = 0) {
    return await this.findAll({
      where: {
        category,
        status: 'active',
        parentId: null // Top-level posts only
      },
      order: [
        ['isPinned', 'DESC'],
        ['lastActivityAt', 'DESC']
      ],
      limit,
      offset,
      include: [{
        model: this,
        as: 'replies',
        limit: 5,
        order: [['createdAt', 'ASC']]
      }]
    });
  };

  ForumPost.findFlagged = async function() {
    return await this.findAll({
      where: {
        status: ['flagged', 'under-review']
      },
      order: [['flaggedCount', 'DESC'], ['createdAt', 'ASC']]
    });
  };

  // Associations
  ForumPost.associate = (models) => {
    ForumPost.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    
    ForumPost.belongsTo(ForumPost, {
      foreignKey: 'parentId',
      as: 'parent'
    });
    
    ForumPost.hasMany(ForumPost, {
      foreignKey: 'parentId',
      as: 'replies'
    });
  };

  return ForumPost;
};
