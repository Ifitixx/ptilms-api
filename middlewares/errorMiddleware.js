// ptilms-api/middlewares/errorMiddleware.js
import {
  ValidationError,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
  ConflictError,
  BaseError,
  ForbiddenError,
} from '../utils/errors.js';
import { error as _error } from '../utils/logger.js';
import jsonwebtoken from 'jsonwebtoken';
const { JsonWebTokenError, TokenExpiredError } = jsonwebtoken;

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let fields;
  let internalCode;

  if (err instanceof BaseError) {
    statusCode = err.statusCode;
    message = err.message;
    if (err.errors) {
      fields = err.errors;
    }
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = process.env.NODE_ENV === 'production' ? 'Invalid data provided.' : 'Database Validation Error';
    fields = err.errors.map((e) => ({ field: e.path, message: e.message }));
    internalCode = 'INVALID_INPUT';
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = process.env.NODE_ENV === 'production' ? 'The data you provided conflicts with existing records.' : 'Database Unique Constraint Error';
    fields = err.errors.map(e => ({ field: e.path, message: e.message }));
    internalCode = 'DATA_CONFLICT';
  } else if (err instanceof ConflictError) {
    statusCode = 409;
    message = err.message;
  } else if (err instanceof JsonWebTokenError) {
    statusCode = 401;
    message = process.env.NODE_ENV === 'production' ? 'You are not authorized to access this resource.' : 'Invalid token';
    internalCode = 'INVALID_TOKEN';
  } else if (err instanceof TokenExpiredError) {
    statusCode = 401;
    message = process.env.NODE_ENV === 'production' ? 'You are not authorized to access this resource.' : 'Token expired';
    internalCode = 'TOKEN_EXPIRED';
  } else if (err instanceof UnauthorizedError) {
    statusCode = 401;
    message = process.env.NODE_ENV === 'production' ? 'You are not authorized to access this resource.' : err.message;
    internalCode = 'UNAUTHORIZED';
  } else if (err instanceof ForbiddenError) {
    statusCode = 403;
    message = process.env.NODE_ENV === 'production' ? 'You do not have permission to perform this action.' : err.message;
    internalCode = 'FORBIDDEN';
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    message = process.env.NODE_ENV === 'production' ? 'The requested resource was not found.' : err.message;
    internalCode = 'NOT_FOUND';
  } else if (err instanceof BadRequestError) {
    statusCode = 400;
    message = process.env.NODE_ENV === 'production' ? 'Invalid request.' : err.message;
    internalCode = 'BAD_REQUEST';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'File size too large. Max size is 5MB';
    internalCode = 'FILE_TOO_LARGE';
  } else if (err.message === 'Invalid file type. Only PDF, JPEG, and PNG are allowed.') {
    statusCode = 400;
    message = err.message;
    internalCode = 'INVALID_FILE_TYPE';
  } else if (err.message === 'No file uploaded') {
    statusCode = 400;
    message = err.message;
    internalCode = 'NO_FILE_UPLOADED';
  } else {
    _error(`Unhandled error: ${err.message} - ${req.method} ${req.url}`);
    _error(err.stack);
    message = process.env.NODE_ENV === 'production' ? 'An unexpected error occurred. Please try again later.' : err.message;
    internalCode = 'UNHANDLED_ERROR';
  }

  // Add internal code for specific errors (example)
  if (err instanceof ConflictError && err.message === 'Email already exists') {
    internalCode = 'EMAIL_ALREADY_EXISTS';
    message = process.env.NODE_ENV === 'production' ? 'The email address is already in use.' : message;
  }

  const response = {
    success: false,
    error: {
      code: statusCode,
      message: message,
      ...(fields && { fields }),
      ...(internalCode && { internalCode }),
    },
  };

  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

export default errorHandler;