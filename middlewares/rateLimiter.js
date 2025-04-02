// ptilms-api/middlewares/rateLimiter.js
import rateLimit from 'express-rate-limit';
import config from '../config/config.cjs'; // Correct: Default import
const { rateLimiter } = config; // Correct: Destructure after default import
import { RateLimitError } from '../utils/errors.js';

const apiLimiter = rateLimit({
  windowMs: rateLimiter.windowMs,
  max: rateLimiter.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new RateLimitError('Too many requests, please try again later'));
  },
  trustProxy: (address, index) => {  // <-- ADD this function
    return index === 0; // Trust the first proxy (ngrok)
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

export default { apiLimiter, loginLimiter };