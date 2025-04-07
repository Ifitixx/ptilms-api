// ptilms-api/utils/logger.js
import { createLogger, format as _format, transports as _transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: _format.combine(
    _format.timestamp(),
    _format.json()
  ),
  transports: [
    new _transports.Console({
      format: _format.combine(
        _format.colorize(),
        _format.simple()
      ),
    }),
    new _transports.File({ filename: 'error.log', level: 'error' }),
    new _transports.File({ filename: 'combined.log' }),
  ],
});

// Export error and info functions
export const error = (message) => {
  logger.error(message);
};

export const info = (message) => {
  logger.info(message);
};

export default logger;