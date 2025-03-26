// ptilms-api/utils/errors.js
class BaseError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends BaseError {
  constructor(errors) {
    super('Validation Error', 400);
    this.errors = errors;
  }
}

class UnauthorizedError extends BaseError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
  }
}

class BadRequestError extends BaseError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

class NotFoundError extends BaseError {
  constructor(message = 'Not Found') {
    super(message, 404);
  }
}

class ConflictError extends BaseError {
  constructor(message = 'Conflict') {
    super(message, 409);
  }
}

class RateLimitError extends BaseError {
  constructor(message = 'Too Many Requests') {
    super(message, 429); // 429 Too Many Requests
  }
}

class ForbiddenError extends BaseError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

class EmailAlreadyExistsError extends ConflictError {
  constructor(message = 'Email already exists') {
    super(message);
  }
}

class UserNotFoundError extends NotFoundError {
  constructor(message = 'User not found') {
    super(message);
  }
}

class InvalidCredentialsError extends UnauthorizedError {
  constructor(message = 'Invalid credentials') {
    super(message);
  }
}

class InvalidTokenError extends UnauthorizedError {
  constructor(message = 'Invalid token') {
    super(message);
  }
}

class AnnouncementNotFoundError extends NotFoundError {
  constructor(message = 'Announcement not found') {
    super(message);
  }
}

class AssignmentNotFoundError extends NotFoundError {
  constructor(message = 'Assignment not found') {
    super(message);
  }
}

class ChatNotFoundError extends NotFoundError {
  constructor(message = 'Chat not found') {
    super(message);
  }
}

class ChatMessageNotFoundError extends NotFoundError {
  constructor(message = 'Chat message not found') {
    super(message);
  }
}

class CourseNotFoundError extends NotFoundError {
  constructor(message = 'Course not found') {
    super(message);
  }
}

class CourseMaterialNotFoundError extends NotFoundError {
  constructor(message = 'Course material not found') {
    super(message);
  }
}

class DepartmentNotFoundError extends NotFoundError {
  constructor(message = 'Department not found') {
    super(message);
  }
}

class LevelNotFoundError extends NotFoundError {
  constructor(message = 'Level not found') {
    super(message);
  }
}
class PermissionNotFoundError extends NotFoundError {
  constructor(message = 'Permission not found') {
    super(message);
  }
}
class RoleNotFoundError extends NotFoundError {
  constructor(message = 'Role not found') {
    super(message);
  }
}
class RolePermissionNotFoundError extends NotFoundError {
  constructor(message = 'Role permission not found') {
    super(message);
  }
}

export {
  BaseError,
  ValidationError,
  UnauthorizedError,
  BadRequestError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ForbiddenError,
  EmailAlreadyExistsError,
  UserNotFoundError,
  InvalidCredentialsError,
  InvalidTokenError,
  AnnouncementNotFoundError,
  AssignmentNotFoundError,
  ChatNotFoundError,
  ChatMessageNotFoundError,
  CourseNotFoundError,
  CourseMaterialNotFoundError,
  DepartmentNotFoundError,
  LevelNotFoundError,
  PermissionNotFoundError,
  RoleNotFoundError,
  RolePermissionNotFoundError,
};