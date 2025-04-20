// ptilms-api/utils/logger.js
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata(),
  winston.format.printf(({ level, message, timestamp, metadata, stack }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    // Add request information if available
    if (metadata.req) {
      const { method, url, ip, requestId } = metadata.req;
      log += `\n  Request: ${method} ${url}`;
      log += `\n  IP: ${ip}`;
      log += `\n  RequestID: ${requestId}`;
    }

    // Add error information if available
    if (metadata.error) {
      log += `\n  Error: ${metadata.error.message}`;
      if (metadata.error.code) {
        log += `\n  Code: ${metadata.error.code}`;
      }
    }

    // Add stack trace for errors in development
    if (process.env.NODE_ENV !== 'production' && stack) {
      log += `\n  Stack: ${stack}`;
    }

    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(__dirname, '..', 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    }),
    // Write all errors to error.log
    new winston.transports.File({
      filename: path.join(__dirname, '..', 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    )
  }));
}

// Helper functions for structured logging
const formatError = (error, req = null) => {
  const errorInfo = {
    message: error.message,
    name: error.name,
    code: error.code,
    stack: error.stack
  };

  if (req) {
    errorInfo.req = {
      method: req.method,
      url: req.originalUrl || req.url,
      ip: req.ip,
      requestId: req.requestId
    };
  }

  return errorInfo;
};

// Structured logging methods
export const info = (message, metadata = {}) => {
  logger.info(message, { metadata });
};

export const error = (message, error = null, req = null) => {
  const errorInfo = error ? formatError(error, req) : {};
  logger.error(message, { metadata: { ...errorInfo, req: req ? formatError(error, req).req : null } });
};

export const warn = (message, metadata = {}) => {
  logger.warn(message, { metadata });
};

export const debug = (message, metadata = {}) => {
  logger.debug(message, { metadata });
};

export const http = (req, res, responseTime) => {
  const { method, originalUrl, ip, requestId } = req;
  logger.http(`${method} ${originalUrl}`, {
    metadata: {
      req: { method, url: originalUrl, ip, requestId },
      responseTime,
      statusCode: res.statusCode
    }
  });
};

export default {
  info,
  error,
  warn,
  debug,
  http
};