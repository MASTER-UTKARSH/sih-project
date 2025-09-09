const { models } = require('../config/database');
const logger = require('../utils/logger');

const auditLogger = async (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log the action after response is sent
    setImmediate(async () => {
      try {
        const userId = req.user?.id || null;
        const action = `${req.method} ${req.path}`;
        const details = {
          method: req.method,
          path: req.path,
          query: req.query,
          statusCode: res.statusCode,
          userAgent: req.get('User-Agent'),
          timestamp: new Date()
        };

        // Only log significant actions, not health checks
        if (!req.path.includes('/health') && !req.path.includes('/static')) {
          await models.AuditLog.logAction(userId, action, details, req);
        }
      } catch (error) {
        logger.error('Audit logging error:', error);
      }
    });
    
    originalSend.call(this, data);
  };
  
  next();
};

module.exports = auditLogger;
