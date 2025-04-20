import CacheService from '../services/cacheService.js';
import logger from './logger.js';

class RedisRateLimitStore {
  constructor(options = {}) {
    this.cache = new CacheService();
    this.prefix = options.prefix || 'ratelimit:';
  }

  /**
   * Increment the counter for an IP and check if it's over limit
   */
  async increment(key, options) {
    const redisKey = this.prefix + key;
    
    try {
      // Use Redis MULTI for atomic operations
      const multi = this.cache.redis.multi();
      
      // Increment the counter
      multi.incr(redisKey);
      
      // Set expiry if the key is new
      multi.expire(redisKey, Math.floor(options.windowMs / 1000));
      
      // Execute both commands atomically
      const results = await multi.exec();
      const counter = results[0][1]; // Get the new counter value
      
      return {
        totalHits: counter,
        resetTime: Date.now() + options.windowMs
      };
    } catch (error) {
      logger.error('Rate limit store error:', error);
      // Fail open - allow the request in case of Redis error
      return {
        totalHits: 0,
        resetTime: Date.now() + options.windowMs
      };
    }
  }

  /**
   * Decrement the counter (used for rolling windows)
   */
  async decrement(key) {
    const redisKey = this.prefix + key;
    
    try {
      await this.cache.redis.decr(redisKey);
    } catch (error) {
      logger.error('Rate limit store decrement error:', error);
    }
  }

  /**
   * Reset counter for an IP
   */
  async resetKey(key) {
    const redisKey = this.prefix + key;
    
    try {
      await this.cache.redis.del(redisKey);
    } catch (error) {
      logger.error('Rate limit store reset error:', error);
    }
  }
}

export default RedisRateLimitStore;