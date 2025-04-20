import Bull from 'bull';
import nodemailer from 'nodemailer';
import config from '../config/config.cjs';
import logger from '../utils/logger.js';
import { sequelize } from '../models/index.js';

const { info, error: _error } = logger;

class EmailQueueService {
  constructor() {
    this.emailQueue = new Bull('email-queue', {
      redis: config.redis,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      }
    });

    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass
      }
    });

    this.setupQueueHandlers();
  }

  setupQueueHandlers() {
    this.emailQueue.on('completed', job => {
      info(`Email job ${job.id} completed successfully`);
    });

    this.emailQueue.on('failed', (job, err) => {
      _error(`Email job ${job.id} failed:`, err);
    });

    this.emailQueue.process(async job => {
      const { to, subject, text, html } = job.data;
      
      try {
        await this.checkDatabaseHealth();
        await this.transporter.sendMail({
          from: config.email.from,
          to,
          subject,
          text,
          html
        });
      } catch (err) {
        _error('Error processing email job:', err);
        throw err;
      }
    });
  }

  async checkDatabaseHealth() {
    try {
      await sequelize.authenticate();
      const poolStats = await this.getConnectionPoolStats();
      
      // Log pool statistics for monitoring
      info('Connection pool stats:', poolStats);
      
      // If we're close to max connections, log a warning
      if (poolStats.used / poolStats.max > 0.8) {
        _error('Warning: Database connection pool nearing capacity');
      }
    } catch (err) {
      _error('Database connection check failed:', err);
      throw err;
    }
  }

  async getConnectionPoolStats() {
    const pool = sequelize.connectionManager.pool;
    return {
      total: pool.size,
      used: pool.used,
      available: pool.available,
      max: pool.max,
      min: pool.min
    };
  }

  async addToQueue(emailData) {
    try {
      const job = await this.emailQueue.add(emailData);
      info(`Email job ${job.id} added to queue`);
      return job;
    } catch (err) {
      _error('Error adding email to queue:', err);
      throw err;
    }
  }

  async getQueueStats() {
    try {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        this.emailQueue.getWaitingCount(),
        this.emailQueue.getActiveCount(),
        this.emailQueue.getCompletedCount(),
        this.emailQueue.getFailedCount(),
        this.emailQueue.getDelayedCount()
      ]);

      return {
        waiting,
        active,
        completed,
        failed,
        delayed
      };
    } catch (err) {
      _error('Error getting queue stats:', err);
      throw err;
    }
  }
}

export default EmailQueueService;