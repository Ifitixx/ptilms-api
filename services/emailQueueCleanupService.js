import Queue from 'bull';
import config from '../config/config.cjs';
import logger from '../utils/logger.js';

class EmailQueueCleanupService {
  constructor() {
    // Initialize the cleanup queue
    this.cleanupQueue = new Queue('email-cleanup', {
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password
      }
    });

    // Reference to the email queue we'll be cleaning
    this.emailQueue = new Queue('email', {
      redis: {
        host: config.redis.host,
        port: config.redis.port,
        password: config.redis.password
      }
    });

    // Schedule cleanup job to run every day at midnight
    this.cleanupQueue.add(
      {},
      {
        repeat: {
          cron: '0 0 * * *' // Every day at midnight
        }
      }
    );

    // Process cleanup jobs
    this.cleanupQueue.process(async (job) => {
      try {
        const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000; // 14 days in milliseconds
        const ONE_MONTH = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

        // Clean up completed jobs older than 2 weeks
        const completedCount = await this.emailQueue.clean(TWO_WEEKS, 'completed');
        
        // Clean up failed jobs older than 1 month
        const failedCount = await this.emailQueue.clean(ONE_MONTH, 'failed');

        logger.info('Email queue cleanup completed', {
          completedJobsRemoved: completedCount,
          failedJobsRemoved: failedCount,
          timestamp: new Date().toISOString()
        });

        return { completedCount, failedCount };
      } catch (error) {
        logger.error('Error during email queue cleanup:', error);
        throw error;
      }
    });

    // Handle cleanup job completion
    this.cleanupQueue.on('completed', (job, result) => {
      logger.info('Queue cleanup job completed', {
        jobId: job.id,
        result
      });
    });

    // Handle cleanup job failures
    this.cleanupQueue.on('failed', (job, error) => {
      logger.error('Queue cleanup job failed', {
        jobId: job.id,
        error: error.message
      });
    });
  }

  /**
   * Manually trigger a cleanup
   */
  async triggerCleanup() {
    try {
      const job = await this.cleanupQueue.add({}, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000
        }
      });

      return job.id;
    } catch (error) {
      logger.error('Error triggering cleanup:', error);
      throw error;
    }
  }

  /**
   * Get cleanup queue statistics
   */
  async getStats() {
    try {
      const [completed, failed, delayed, active, waiting] = await Promise.all([
        this.cleanupQueue.getCompletedCount(),
        this.cleanupQueue.getFailedCount(),
        this.cleanupQueue.getDelayedCount(),
        this.cleanupQueue.getActiveCount(),
        this.cleanupQueue.getWaitingCount()
      ]);

      return {
        completed,
        failed,
        delayed,
        active,
        waiting
      };
    } catch (error) {
      logger.error('Error getting cleanup queue stats:', error);
      throw error;
    }
  }

  /**
   * Close the cleanup queue
   */
  async close() {
    await this.cleanupQueue.close();
    await this.emailQueue.close();
  }
}

export default EmailQueueCleanupService;