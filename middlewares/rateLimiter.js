// ptilms-api/middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');
const config = require('../config/config');
const { RateLimitError } = require('../utils/errors');

const apiLimiter = rateLimit({
  windowMs: config.rateLimiter.windowMs,
  max: config.rateLimiter.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new RateLimitError('Too many requests, please try again later'));
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new RateLimitError('Too many login attempts, please try again after 15 minutes'));
  },
});

module.exports = { apiLimiter, loginLimiter };