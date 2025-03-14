// middlewares/errorHandler.js
const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  logger.error(err.stack);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({ message: 'Not Found' });
  }

  if (err.name === 'ConflictError') {
    return res.status(409).json({ message: 'Conflict' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token Expired' });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Invalid Token' });
  }

  res.status(500).json({ message: 'Internal server error' });
};

module.exports = errorHandler;
