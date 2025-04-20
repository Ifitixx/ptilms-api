import os from 'os';
import { createClient } from 'redis';
import { sequelize } from '../models/index.js';
import config from '../config/config.cjs';
import logger from '../utils/logger.js';

class MonitoringService {
  constructor() {
    if (!MonitoringService.instance) {
      this.metrics = {
        requestsPerMinute: 0,
        totalRequests: 0,
        totalErrors: 0,
        startTime: Date.now(),
        lastMinuteRequests: [],
        activeUsers: new Set(),
      };

      this.redis = createClient({
        url: `redis://${config.redis.host}:${config.redis.port}`,
        password: config.redis.password
      });

      this.redis.on('error', (err) => {
        logger.error('Redis monitoring connection error:', err);
      });

      this.redis.on('ready', () => {
        logger.info('Redis monitoring connection ready');
      });

      this.redis.on('reconnecting', () => {
        logger.info('Redis monitoring connection reconnecting');
      });

      // Connect to Redis
      (async () => {
        try {
          await this.redis.connect();
          logger.info('Connected to Redis for monitoring');
        } catch (err) {
          logger.error('Failed to connect to Redis:', err);
        }
      })();

      // Clean up old metrics every minute
      this.cleanupInterval = setInterval(() => this._cleanupOldMetrics(), 60000);

      MonitoringService.instance = this;
    }

    return MonitoringService.instance;
  }

  async close() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    if (this.redis) {
      await this.redis.quit();
    }
  }

  async _cleanupOldMetrics() {
    const now = Date.now();
    this.metrics.lastMinuteRequests = this.metrics.lastMinuteRequests.filter(
      req => now - req.timestamp < 60000
    );
  }

  recordRequest() {
    this.metrics.totalRequests++;
    this.metrics.lastMinuteRequests.push({ timestamp: Date.now() });
    this._updateRequestsPerMinute();
  }

  recordError() {
    this.metrics.totalErrors++;
  }

  addActiveUser(userId) {
    this.metrics.activeUsers.add(userId);
  }

  removeActiveUser(userId) {
    this.metrics.activeUsers.delete(userId);
  }

  _updateRequestsPerMinute() {
    const now = Date.now();
    this.metrics.requestsPerMinute = this.metrics.lastMinuteRequests.filter(
      req => now - req.timestamp < 60000
    ).length;
  }

  async getHealth() {
    try {
      // Check database connection
      await sequelize.authenticate();
      const [dbResult] = await sequelize.query('SELECT COUNT(*) as count FROM information_schema.tables');
      const tableCount = dbResult[0].count;

      // Get system metrics
      const systemMetrics = {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: os.cpus(),
        loadAvg: os.loadavg(),
      };

      // Get Redis info
      const redisInfo = await this.redis.info();

      // Calculate pool utilization
      const pool = await sequelize.connectionManager.getConnection();
      await sequelize.connectionManager.releaseConnection(pool);
      const poolStats = sequelize.connectionManager.pool.stats();

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: systemMetrics.uptime,
        memory: {
          used: systemMetrics.memory.heapUsed,
          total: systemMetrics.memory.heapTotal,
        },
        cpu: {
          cores: systemMetrics.cpu.length,
          load: systemMetrics.loadAvg[0],
        },
        database: {
          connected: true,
          tableCount,
          poolUtilization: poolStats,
        },
        redis: {
          connected: this.redis.isOpen,
          info: redisInfo,
        },
        metrics: {
          requestsPerMinute: this.metrics.requestsPerMinute,
          totalRequests: this.metrics.totalRequests,
          totalErrors: this.metrics.totalErrors,
          activeUsers: this.metrics.activeUsers.size,
        },
      };
    } catch (error) {
      return {
        status: 'critical',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
    }
  }
}

export default MonitoringService;