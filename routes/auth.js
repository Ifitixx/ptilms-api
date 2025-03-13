// routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], authController.registerUser);

// POST /api/auth/login
router.post('/login', [
  body('username').optional().notEmpty().withMessage('Username is required if provided'),
  body('email').optional().isEmail().withMessage('Valid email is required if provided'),
  body('password').notEmpty().withMessage('Password is required'),
], authController.loginUser);

// POST /api/auth/forgot-password
router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required'),
], authController.forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', [
  body('token').notEmpty().withMessage('Token is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
], authController.resetPassword);

// POST /api/auth/verify-reset-token
router.post('/verify-reset-token', [
  body('token').notEmpty().withMessage('Token is required'),
], authController.verifyResetToken);

module.exports = router;
