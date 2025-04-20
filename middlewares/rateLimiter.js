// ptilms-api/middlewares/rateLimiter.js
import rateLimit from 'express-rate-limit';
import RedisRateLimitStore from '../utils/rateLimitStore.js';
import config from '../config/config.cjs';
import { RateLimitError } from '../utils/errors.js';

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: config.rateLimiter.windowMs,
  max: config.rateLimiter.max,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisRateLimitStore({ prefix: 'api-limit:' }),
  handler: (req, res, next) => {
    next(new RateLimitError('Too many requests, please try again later'));
  },
  keyGenerator: (req) => {
    return req.headers['x-forwarded-for'] || req.ip;
  }
});

// Stricter limits for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisRateLimitStore({ prefix: 'auth-limit:' }),
  handler: (req, res, next) => {
    next(new RateLimitError('Too many login attempts, please try again after 15 minutes'));
  }
});

// File upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisRateLimitStore({ prefix: 'upload-limit:' }),
  handler: (req, res, next) => {
    next(new RateLimitError('Upload limit exceeded, please try again later'));
  }
});

// Course creation rate limiter
const courseCreationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 50, // 50 courses per day
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisRateLimitStore({ prefix: 'course-limit:' }),
  handler: (req, res, next) => {
    next(new RateLimitError('Course creation limit exceeded, please try again tomorrow'));
  }
});

export default {
  apiLimiter,
  authLimiter,
  uploadLimiter,
  courseCreationLimiter
};