// authMiddleware.js
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const db = require('../config/db');

// In-memory token blacklist (for simplicity)
const tokenBlacklist = new Set();

// Helper function to add token to blacklist
const blacklistToken = (token) => {
  tokenBlacklist.add(token);
};

// Helper function to check if token is blacklisted
const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

// Middleware to authenticate JWT token
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Check if the token is blacklisted
  if (isTokenBlacklisted(token)) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      logger.error(`Invalid token: ${err.message}`);
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  });
};

// Middleware to authorize user role
exports.authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    next();
  };
};
