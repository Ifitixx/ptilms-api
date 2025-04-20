// ptilms-api/middlewares/validationMiddleware.js
import { body, validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';
import { COURSES_MATERIAL_TYPES } from '../config/constants.mjs';

// Common validation chains
const commonValidations = {
  email: () => body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),
    
  password: () => body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
  username: () => body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),

  title: () => body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be between 1 and 255 characters'),

  description: () => body('description')
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),

  code: () => body('code')
    .trim()
    .isLength({ min: 3, max: 20 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Code must be between 3 and 20 characters and contain only uppercase letters and numbers'),

  departmentId: () => body('departmentId')
    .isUUID()
    .withMessage('Valid department ID is required'),

  levelId: () => body('levelId')
    .isUUID()
    .withMessage('Valid level ID is required'),

  courseId: () => body('courseId')
    .isUUID()
    .withMessage('Valid course ID is required'),

  message: () => body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 5000 })
    .withMessage('Message content must not exceed 5000 characters'),

  materialType: () => body('type')
    .trim()
    .notEmpty()
    .withMessage('Material type is required')
    .isIn(Object.values(COURSES_MATERIAL_TYPES))
    .withMessage('Invalid material type'),

  materialPath: () => body('path')
    .trim()
    .notEmpty()
    .withMessage('Material path is required')
    .isLength({ max: 500 })
    .withMessage('Path must not exceed 500 characters')
};

// Validation schemas for different routes
const validationSchemas = {
  register: [
    commonValidations.username(),
    commonValidations.email(),
    commonValidations.password()
  ],

  login: [
    commonValidations.email(),
    body('password').notEmpty().withMessage('Password is required')
  ],

  createCourse: [
    commonValidations.title(),
    commonValidations.description(),
    commonValidations.code(),
    commonValidations.departmentId(),
    commonValidations.levelId(),
    body('instructorId')
      .isUUID()
      .withMessage('Valid instructor ID is required')
  ],

  createAssignment: [
    commonValidations.title(),
    commonValidations.description(),
    commonValidations.courseId(),
    body('dueDate')
      .isISO8601()
      .withMessage('Valid due date is required'),
    commonValidations.departmentId(),
    commonValidations.levelId()
  ],

  createAnnouncement: [
    commonValidations.title(),
    commonValidations.description(),
    commonValidations.courseId(),
    commonValidations.departmentId(),
    commonValidations.levelId()
  ],

  createChatMessage: [
    commonValidations.message(),
    body('chatId')
      .isUUID()
      .withMessage('Valid chat ID is required'),
    body('userId')
      .isUUID()
      .withMessage('Valid user ID is required')
  ],

  updateChatMessage: [
    commonValidations.message()
  ],

  createCourseMaterial: [
    commonValidations.title(),
    commonValidations.description(),
    commonValidations.materialType(),
    commonValidations.materialPath(),
    commonValidations.courseId()
  ],

  updateCourseMaterial: [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
    body('type').optional().custom(value => {
      if (value) {
        return commonValidations.materialType().run(value);
      }
      return true;
    }),
    body('path').optional().custom(value => {
      if (value) {
        return commonValidations.materialPath().run(value);
      }
      return true;
    }),
    body('courseId').optional().isUUID().withMessage('Invalid course ID format')
  ],

  updateUser: [
    body('username').optional().custom(value => {
      if (value) {
        return commonValidations.username().run(value);
      }
      return true;
    }),
    body('email').optional().custom(value => {
      if (value) {
        return commonValidations.email().run(value);
      }
      return true;
    })
  ]
};

// Middleware to validate request body
const validate = (schema) => {
  return async (req, res, next) => {
    // Check content length against limit (10MB)
    const contentLength = parseInt(req.headers['content-length'] || 0);
    if (contentLength > 10 * 1024 * 1024) {
      return next(new ValidationError([{
        field: 'body',
        message: 'Request body too large. Maximum size is 10MB'
      }]));
    }

    // Apply validation schema
    await Promise.all(schema.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationError(
        errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      ));
    }

    next();
  };
};

export { validate, validationSchemas };