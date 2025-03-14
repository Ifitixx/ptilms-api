// routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const apiLimiter = require('../middlewares/rateLimiter');

// POST /api/auth/register
router.post('/register', apiLimiter, [
  body('username').notEmpty().withMessage('Username is required').trim().escape(),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').notEmpty().withMessage('Role is required').trim().escape(),
  body('phone_number').optional().trim().escape(),
  body('date_of_birth').optional().isISO8601().withMessage('Invalid date format for date_of_birth'),
  body('sex').optional().trim().escape(),
  body('profile_picture_url').optional().isURL().withMessage('Invalid URL for profile picture').trim().escape(),
], authController.registerUser);

// POST /api/auth/login
router.post('/login', apiLimiter, [
  body('username').optional().trim().escape(),
  body('email').optional().isEmail().withMessage('Valid email is required if provided').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], authController.loginUser);

// POST /api/auth/forgot-password
router.post('/forgot-password', apiLimiter, [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
], authController.forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', apiLimiter, [
  body('token').notEmpty().withMessage('Token is required').trim().escape(),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
], authController.resetPassword);

// POST /api/auth/verify-reset-token
router.post('/verify-reset-token', apiLimiter, [
  body('token').notEmpty().withMessage('Token is required').trim().escape(),
], authController.verifyResetToken);

// POST /api/auth/refresh
router.post('/refresh', apiLimiter, authController.refreshToken);

module.exports = router;