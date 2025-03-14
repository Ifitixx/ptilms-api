const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal Server Error' });
};

module.exports = errorHandler;
