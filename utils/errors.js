// utils/errors.js
class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  class ValidationError extends AppError {
    constructor(message) {
      super(message, 400);
      this.name = 'ValidationError';
    }
  }
  
  class UnauthorizedError extends AppError {
    constructor(message) {
      super(message, 401);
      this.name = 'UnauthorizedError';
    }
  }
  
  class ForbiddenError extends AppError {
    constructor(message) {
      super(message, 403);
      this.name = 'ForbiddenError';
    }
  }
  
  class NotFoundError extends AppError {
    constructor(message) {
      super(message, 404);
      this.name = 'NotFoundError';
    }
  }
  
  class ConflictError extends AppError {
    constructor(message) {
      super(message, 409);
      this.name = 'ConflictError';
    }
  }
  class BadRequestError extends AppError {
    constructor(message) {
      super(message, 400);
      this.name = 'BadRequestError';
    }
  }
  class InternalServerError extends AppError {
    constructor(message) {
      super(message, 500);
      this.name = 'InternalServerError';
    }
  }
  
  module.exports = {
    AppError,
    ValidationError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    BadRequestError,
    InternalServerError
  };
  