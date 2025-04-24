// ptilms-api/monitoringMiddleware.js
import logger from '../utils/logger.js';

const getSlowThreshold = (url) => {
  if (url.includes('/api/assignments') || url.includes('/api/courses')) {
    return 800; // Lower threshold for core features
  }
  return 1000; // Default threshold
};

const monitoringMiddleware = (monitoringService) => {
  return async (req, res, next) => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;
    const requestId = Math.random().toString(36).substring(7);

    // Add request ID to the request object for tracking
    req.requestId = requestId;

    // Track the request
    monitoringService.trackRequest();

    // Log request start
    logger.info('Request started', {
      requestId,
      method: req.method,
      url: req.url,
      userAgent: req.get('user-agent'),
      ip: req.ip
    });

    // Override end function to capture response
    const originalEnd = res.end;
    res.end = function(...args) {
      const duration = Date.now() - startTime;
      const memoryUsed = process.memoryUsage().heapUsed - startMemory;
      const slowThreshold = getSlowThreshold(req.url);
      
      // Log request completion
      logger.info('Request completed', {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        memoryUsed: `${Math.round(memoryUsed / 1024 / 1024 * 100) / 100}MB`
      });

      // Track performance metrics
      monitoringService.trackMetric('requestDuration', duration);
      monitoringService.trackMetric('memoryUsage', memoryUsed);

      // Track slow requests with dynamic threshold
      if (duration > slowThreshold) {
        logger.warn('Slow request detected', {
          requestId,
          method: req.method,
          url: req.url,
          duration: `${duration}ms`,
          threshold: `${slowThreshold}ms`,
          memoryUsed: `${Math.round(memoryUsed / 1024 / 1024 * 100) / 100}MB`
        });
        monitoringService.trackSlowRequest({ url: req.url, duration, memoryUsed });
      }

      originalEnd.apply(res, args);
    };

    // Capture errors
    const errorHandler = (error) => {
      monitoringService.trackError(error);
      logger.error('Request error', {
        requestId,
        method: req.method,
        url: req.url,
        error: error.message,
        stack: error.stack
      });
    };

    res.on('error', errorHandler);
    next();
  };
};

export default monitoringMiddleware;