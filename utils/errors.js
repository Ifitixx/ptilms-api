// ptilms-api/utils/errors.js
class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends CustomError {
  constructor(errors) {
    super('Validation Error');
    this.errors = errors;
  }
}

class UnauthorizedError extends CustomError {
  constructor(message = 'Unauthorized') {
    super(message);
  }
}

class BadRequestError extends CustomError {
  constructor(message = 'Bad Request') {
    super(message);
  }
}

class NotFoundError extends CustomError {
  constructor(message = 'Not Found') {
    super(message);
  }
}

class ConflictError extends CustomError {
  constructor(message = 'Conflict') {
    super(message);
  }
}

module.exports = {
  CustomError,
  ValidationError,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
  ConflictError,
};