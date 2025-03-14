// middlewares/validationMiddleware.js
const sanitizeHtml = require('sanitize-html');
const { body, validationResult, query } = require('express-validator');
const { ValidationError } = require('../utils/errors');

const sanitizeInput = (value) => {
  return sanitizeHtml(value, {
    allowedTags: [], // No tags allowed
    allowedAttributes: {}, // No attributes allowed
  });
};

const validate = [
  body('username')
    .optional()
    .trim()
    .notEmpty().withMessage('Username cannot be empty')
    .isLength({ min: 3, max: 255 }).withMessage('Username must be between 3 and 255 characters')
    .customSanitizer(sanitizeInput),
  body('email')
    .optional()
    .trim()
    .notEmpty().withMessage('Email cannot be empty')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
    .customSanitizer(sanitizeInput),
  body('password')
    .optional()
    .trim()
    .notEmpty().withMessage('Password cannot be empty')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .customSanitizer(sanitizeInput),
  body('role')
    .optional()
    .trim()
    .notEmpty().withMessage('Role cannot be empty')
    .isIn(['admin', 'user']).withMessage('Role must be either admin or user')
    .customSanitizer(sanitizeInput),
  body('phone_number')
    .optional()
    .trim()
    .notEmpty().withMessage('Phone number cannot be empty')
    .isMobilePhone().withMessage('Invalid phone number format')
    .customSanitizer(sanitizeInput),
  body('sex')
    .optional()
    .trim()
    .notEmpty().withMessage('Sex cannot be empty')
    .isIn(['male', 'female', 'other']).withMessage('Sex must be either male, female, or other')
    .customSanitizer(sanitizeInput),
  body('profile_picture_url')
    .optional()
    .trim()
    .isURL().withMessage('Invalid URL format')
    .customSanitizer(sanitizeInput),
  body('token')
    .optional()
    .trim()
    .notEmpty().withMessage('Token cannot be empty')
    .customSanitizer(sanitizeInput),
  body('newPassword')
    .optional()
    .trim()
    .notEmpty().withMessage('New password cannot be empty')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .customSanitizer(sanitizeInput),
  body('currentPassword')
    .optional()
    .trim()
    .notEmpty().withMessage('Current password cannot be empty')
    .customSanitizer(sanitizeInput),
    body('date_of_birth')
    .optional()
    .trim()
    .isDate().withMessage('Invalid date format')
    .customSanitizer(sanitizeInput),
    query('since')
    .optional()
    .trim()
    .isISO8601().withMessage('Invalid date format for since query parameter')
    .customSanitizer(sanitizeInput),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg).join(', ');
      return next(new ValidationError(errorMessages));
    }
    next();
  },
];

module.exports = { validate };
