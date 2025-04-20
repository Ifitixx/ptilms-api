import { randomBytes } from 'crypto';
import logger from '../utils/logger.js';

const generateTraceId = () => {
  return randomBytes(16).toString('hex');
};

const tracingMiddleware = () => {
  return (req, res, next) => {
    // Generate or use existing trace ID
    const traceId = req.headers['x-trace-id'] || generateTraceId();
    const startTime = Date.now();

    // Add trace ID to request
    req.traceId = traceId;
    
    // Add trace ID to response headers
    res.setHeader('X-Trace-ID', traceId);

    // Log request start
    logger.info('Request started', {
      traceId,
      method: req.method,
      url: req.originalUrl,
      userAgent: req.get('user-agent'),
      ip: req.ip
    });

    // Override end function to log response
    const originalEnd = res.end;
    res.end = function(...args) {
      const duration = Date.now() - startTime;
      
      // Log request completion
      logger.info('Request completed', {
        traceId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`
      });

      originalEnd.apply(res, args);
    };

    // Error handling
    const errorHandler = (error) => {
      logger.error('Request error', {
        traceId,
        error,
        method: req.method,
        url: req.originalUrl
      });
    };

    res.on('error', errorHandler);
    next();
  };
};

export default tracingMiddleware;