// ptilms-api/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');
const { isBlacklisted } = require('../utils/tokenBlacklist');
const config = require('../config/config');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new UnauthorizedError('No token provided'));
  }

  if (await isBlacklisted(token)) {
    return next(new UnauthorizedError('Token has been revoked'));
  }

  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      return next(new UnauthorizedError('Invalid token'));
    }
    req.user = user;
    next();
  });
};

const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRole };