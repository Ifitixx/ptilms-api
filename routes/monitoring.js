import { Router } from 'express';
import { authenticateToken, authorizeRole } from '../middlewares/authMiddleware.js';
import { sequelize } from '../models/index.js';
import { ROLES } from '../config/constants.mjs';

const createMonitoringRoutes = (monitoringService, emailQueueCleanupService) => {
  const router = Router();

  // Secure all monitoring endpoints to admin only
  router.use(authenticateToken, authorizeRole([ROLES.ADMIN]));

  /**
   * @swagger
   * /monitoring/health:
   *   get:
   *     summary: Get system health status
   *     tags: [Monitoring]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: System health information
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [healthy, degraded, unhealthy]
   *                 uptime:
   *                   type: number
   *                 memory:
   *                   type: object
   *                 cpu:
   *                   type: object
   *                 redis:
   *                   type: object
   *                 database:
   *                   type: object
   */
  router.get('/health', async (req, res) => {
    const health = await monitoringService.getHealthStatus();
    res.json(health);
  });

  /**
   * @swagger
   * /monitoring/metrics:
   *   get:
   *     summary: Get system performance metrics
   *     tags: [Monitoring]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: System performance metrics
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/PerformanceMetrics'
   */
  router.get('/metrics', async (req, res) => {
    const metrics = await monitoringService.getMetrics();
    res.json(metrics);
  });

  /**
   * @swagger
   * /monitoring/email-queue:
   *   get:
   *     summary: Get email queue status
   *     tags: [Monitoring]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Email queue status
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 waiting:
   *                   type: number
   *                   description: Number of emails waiting to be processed
   *                 active:
   *                   type: number
   *                   description: Number of emails being processed
   *                 completed:
   *                   type: number
   *                   description: Number of emails successfully sent
   *                 failed:
   *                   type: number
   *                   description: Number of failed email attempts
   *                 delayed:
   *                   type: number
   *                   description: Number of delayed email jobs
   */
  router.get('/email-queue', async (req, res) => {
    const queueStats = await monitoringService.getEmailQueueStats();
    res.json(queueStats);
  });

  /**
   * @swagger
   * /monitoring/email-queue/stream:
   *   get:
   *     summary: Get real-time email queue updates using Server-Sent Events
   *     tags: [Monitoring]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Server-sent events stream of email queue updates
   *         content:
   *           text/event-stream:
   *             schema:
   *               type: string
   *               description: Stream of email queue status updates
   */
  router.get('/email-queue/stream', async (req, res) => {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial queue stats
    const initialStats = await monitoringService.getEmailQueueStats();
    res.write(`data: ${JSON.stringify(initialStats)}\n\n`);

    // Set up interval to send updates
    const intervalId = setInterval(async () => {
      try {
        const stats = await monitoringService.getEmailQueueStats();
        if (!res.writableEnded) {
          res.write(`data: ${JSON.stringify(stats)}\n\n`);
        }
      } catch (error) {
        console.error('Error sending SSE update:', error);
      }
    }, 5000); // Update every 5 seconds

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(intervalId);
      res.end();
    });
  });

  /**
   * @swagger
   * /monitoring/email-queue/cleanup:
   *   post:
   *     summary: Manually trigger email queue cleanup
   *     tags: [Monitoring]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Cleanup job triggered successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   description: Success message
   *                 jobId:
   *                   type: string
   *                   description: ID of the cleanup job
   */
  router.post('/email-queue/cleanup', async (req, res) => {
    try {
      const jobId = await emailQueueCleanupService.triggerCleanup();
      res.json({
        message: 'Email queue cleanup job triggered successfully',
        jobId
      });
    } catch (error) {
      res.status(500).json({
        message: 'Failed to trigger email queue cleanup',
        error: error.message
      });
    }
  });

  /**
   * @swagger
   * /monitoring/email-queue/cleanup/status:
   *   get:
   *     summary: Get email queue cleanup status
   *     tags: [Monitoring]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Current status of the cleanup queue
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 completed:
   *                   type: number
   *                   description: Number of completed cleanup jobs
   *                 failed:
   *                   type: number
   *                   description: Number of failed cleanup jobs
   *                 delayed:
   *                   type: number
   *                   description: Number of delayed cleanup jobs
   *                 active:
   *                   type: number
   *                   description: Number of active cleanup jobs
   *                 waiting:
   *                   type: number
   *                   description: Number of waiting cleanup jobs
   */
  router.get('/email-queue/cleanup/status', async (req, res) => {
    try {
      const stats = await emailQueueCleanupService.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to get cleanup queue status',
        error: error.message
      });
    }
  });

  /**
   * @swagger
   * /monitoring/database/pool:
   *   get:
   *     summary: Get database connection pool status
   *     tags: [Monitoring]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Database connection pool statistics
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 total:
   *                   type: number
   *                   description: Total number of connections in the pool
   *                 used:
   *                   type: number
   *                   description: Number of connections currently in use
   *                 available:
   *                   type: number
   *                   description: Number of available connections
   *                 max:
   *                   type: number
   *                   description: Maximum number of connections allowed
   *                 min:
   *                   type: number
   *                   description: Minimum number of connections maintained
   */
  router.get('/database/pool', async (req, res) => {
    try {
      const stats = await monitoringService.getDatabasePoolStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({
        message: 'Failed to get database pool statistics',
        error: error.message
      });
    }
  });

  /**
   * @swagger
   * /monitoring/database/health:
   *   get:
   *     summary: Check database connection health
   *     tags: [Monitoring]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Database connection health status
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   enum: [healthy, warning, critical]
   *                 poolUtilization:
   *                   type: number
   *                   description: Percentage of pool utilization
   *                 message:
   *                   type: string
   *                   description: Health status message
   */
  router.get('/database/health', async (req, res) => {
    try {
      const health = await monitoringService.checkDatabaseHealth();
      res.status(health.status === 'critical' ? 503 : 200).json(health);
    } catch (error) {
      res.status(500).json({
        status: 'critical',
        poolUtilization: null,
        message: `Database connection error: ${error.message}`
      });
    }
  });

  return router;
};

export default createMonitoringRoutes;