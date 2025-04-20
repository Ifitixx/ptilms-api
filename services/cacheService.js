import Redis from 'ioredis';
import config from '../config/config.cjs';
import logger from '../utils/logger.js';

const { info, error } = logger;

class CacheService {
  constructor() {
    if (!CacheService.instance) {
      this.redis = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password,
        enableReadyCheck: true,
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        reconnectOnError: (err) => {
          const targetError = 'READONLY';
          return err.message.includes(targetError);
        }
      });

      this.redis.on('error', (err) => {
        error('Redis Client Error:', err);
      });

      this.redis.on('connect', () => {
        info('Redis Client Connected');
      });

      this.redis.on('ready', () => {
        info('Redis Client Ready');
      });

      this.redis.on('reconnecting', () => {
        info('Redis Client Reconnecting');
      });

      process.on('SIGTERM', async () => {
        await this.close();
      });

      process.on('SIGINT', async () => {
        await this.close();
      });

      CacheService.instance = this;
    }

    return CacheService.instance;
  }

  static getInstance() {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  getRedisClient() {
    return this.redis;
  }

  async close() {
    if (this.redis) {
      info('Closing Redis connection');
      await this.redis.quit();
      this.redis = null;
    }
  }

  async get(key) {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (err) {
      error(`Error getting cache key ${key}:`, err);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (err) {
      error(`Error setting cache key ${key}:`, err);
    }
  }

  async del(key) {
    try {
      await this.redis.del(key);
    } catch (err) {
      error(`Error deleting cache key ${key}:`, err);
    }
  }

  async flushAll() {
    try {
      await this.redis.flushall();
    } catch (err) {
      error('Error flushing cache:', err);
    }
  }

  // Cache key generator
  static get CACHE_KEYS() {
    return {
      USER: 'user',
      ROLE: 'role',
      PERMISSION: 'permission',
      COURSE: 'course',
      ASSIGNMENT: 'assignment',
      ANNOUNCEMENT: 'announcement',
      DEPARTMENT: 'department',
      LEVEL: 'level'
    };
  }

  generateKey(...parts) {
    return parts.join(':');
  }
}

export default CacheService;