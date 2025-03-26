// ptilms-api/middlewares/errorMiddleware.js
import { ValidationError, UnauthorizedError, BadRequestError, NotFoundError, ConflictError } from '../utils/errors';
import { error as _error } from '../utils/logger.js';

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors;

  if (err instanceof ValidationError) {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.errors;
  } else if (err instanceof UnauthorizedError) {
    statusCode = 401;
    message = err.message || 'Unauthorized';
  } else if (err instanceof BadRequestError) {
    statusCode = 400;
    message = err.message || 'Bad Request';
  } else if (err instanceof NotFoundError) {
    statusCode = 404;
    message = err.message || 'Not Found';
  } else if (err instanceof ConflictError) {
    statusCode = 409;
    message = err.message || 'Conflict';
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Database Validation Error';
    errors = err.errors.map(e => ({ field: e.path, message: e.message }));
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Database Unique Constraint Error';
    errors = err.errors.map(e => ({ field: e.path, message: e.message }));
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
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  };

  res.status(statusCode).json(response);
};

export default { errorHandler };