// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors'); // Import ForbiddenError
const { isBlacklisted } = require('../utils/tokenBlacklist');
const config = require('../config/config');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new UnauthorizedError('No token provided'));
  }

  try {
    const isTokenInBlacklist = await isBlacklisted(token);
    if (isTokenInBlacklist) {
      return next(new UnauthorizedError('Token is blacklisted'));
    }

    jwt.verify(token, config.jwt.secret, (err, user) => {
      if (err) {
        return next(new UnauthorizedError('Invalid token'));
      }
      req.user = user;
      next();
    });
  } catch (err) {
    next(err);
  }
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
