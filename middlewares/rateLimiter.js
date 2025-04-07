// ptilms-api/middlewares/rateLimiter.js
import rateLimit from 'express-rate-limit';
import config from '../config/config.cjs';
// Remove this line: const { rateLimiter } = config;
import { RateLimitError } from '../utils/errors.js';

const apiLimiter = rateLimit({
  windowMs: config.rateLimiter.windowMs, // Use config.rateLimiter
  max: config.rateLimiter.max,           // Use config.rateLimiter
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new RateLimitError('Too many requests, please try again later'));
  },
  trustProxy: (address, index) => {
    return index === 0; // Trust the first proxy (e.g., ngrok)
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new RateLimitError('Too many login attempts, please try again after 15 minutes'));
  },
});

export default { apiLimiter, loginLimiter };