// ptilms-api/utils/tokenBlacklist.js
import Redis from 'ioredis';
import config from '../config/config.cjs'; // Correct: Default import
import logger from './logger.js';

const { redis: _redis } = config; // Correct: Destructure after default import

const redis = new Redis(_redis);

export const addToBlacklist = async (token, expiry) => { // expiry is now optional
  try {
    if (expiry !== undefined && expiry > 0) {
      await redis.set(token, 'blacklisted', 'EX', expiry); // Set with expiry if provided and > 0
    } else {
      await redis.set(token, 'blacklisted'); // Set without expiry for indefinite blacklisting
    }
  } catch (error) {
    logger.error(`Error adding token to blacklist: ${error.message}`);
    throw error;
  }
};

export const isBlacklisted = async (token) => {
  try {
    const result = await redis.get(token);
    return result === 'blacklisted';
  } catch (error) {
    logger.error(`Error checking token blacklist: ${error.message}`);
    throw error;
  }
};