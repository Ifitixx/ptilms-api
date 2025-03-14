// routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { validate } = require('../middlewares/validationMiddleware');
const { loginLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Register a new user
router.post(
  '/register',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').notEmpty().withMessage('Role is required'),
  ],
  validate,
  authController.registerUser
);

// Login an existing user
router.post(
  '/login',
  loginLimiter,
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  authController.loginUser
);

// Forgot password
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Invalid email address'),
  ],
  validate,
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  ],
  validate,
  authController.resetPassword
);

// Refresh token
router.post('/refresh', authController.refreshToken);

module.exports = router;
