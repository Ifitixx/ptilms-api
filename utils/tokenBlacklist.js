// ptilms-api/utils/tokenBlacklist.js
const Redis = require('ioredis');
const config = require('../config/config');
const logger = require('./logger');

const redis = new Redis(config.redis);

const addToken = async (token, expiry) => {
  try {
    await redis.set(token, 'blacklisted', 'EX', expiry);
  } catch (error) {
    logger.error(`Error adding token to blacklist: ${error.message}`);
    throw error;
  }
};

const isBlacklisted = async (token) => {
  try {
    const result = await redis.get(token);
    return result === 'blacklisted';
  } catch (error) {
    logger.error(`Error checking token blacklist: ${error.message}`);
    throw error;
  }
};

module.exports = { addToken, isBlacklisted };