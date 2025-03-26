// ptilms-api/middlewares/errorMiddleware.js
import {
  ValidationError,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
  ConflictError,
  BaseError,
} from '../utils/errors.js';
import { error as _error } from '../utils/logger.js';

// Correctly import jsonwebtoken as a CommonJS module
import jsonwebtoken from 'jsonwebtoken';

// Destructure the needed properties
const { JsonWebTokenError, TokenExpiredError } = jsonwebtoken;

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors;

  if (err instanceof BaseError) {
    statusCode = err.statusCode;
    message = err.message;
    if (err.errors) {
      errors = err.errors;
    }
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Database Validation Error';
    errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Database Unique Constraint Error';
    errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
  } else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size too large. Max size is 5MB';
  } else if (err.message === 'Invalid file type. Only PDF, JPEG, and PNG are allowed.') {
    statusCode = 400;
    message = err.message;
  } else if (err.message === 'No file uploaded') {
    statusCode = 400;
    message = err.message;
  } else {
    _error(`Unhandled error: ${err.message}`);
    _error(err.stack);
  }

  // Add error details in development
  const response = {
    success: false,
    error: {
      code: statusCode,
      message,
      ...(errors && { details: errors }),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  };

  res.status(statusCode).json(response);
};

export default { errorHandler };