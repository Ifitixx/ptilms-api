// ptilms-api/config/config.js
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file

const { UnauthorizedError } = require('../utils/errors');
const logger = require('../utils/logger');

// Check if JWT_SECRET and JWT_REFRESH_SECRET are set
if (!process.env.JWT_SECRET) {
  logger.error('Error: JWT_SECRET environment variable is not set.');
  throw new UnauthorizedError('JWT_SECRET environment variable is not set.');
}

if (!process.env.JWT_REFRESH_SECRET) {
  logger.error('Error: JWT_REFRESH_SECRET environment variable is not set.');
  throw new UnauthorizedError('JWT_REFRESH_SECRET environment variable is not set.');
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  cors: {
    origins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:8080'],
    methods: process.env.CORS_METHODS ? process.env.CORS_METHODS.split(',') : ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
  database: {
    url: process.env.DATABASE_URL || 'mysql://ptilms_user:Macpizzy00719991@localhost:3306/ptilms',
    dialect: process.env.DATABASE_DIALECT || 'mysql',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || 'Macpizzy00719991',
  },
  rateLimiter: {
    windowMs: process.env.RATE_LIMIT_WINDOW_MS || '900000',
    max: process.env.RATE_LIMIT_MAX || 100,
  },
  saltRounds: process.env.SALT_ROUNDS || 12,
};