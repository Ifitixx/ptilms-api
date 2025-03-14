// routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { validate } = require('../middlewares/validationMiddleware');
const { loginLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API endpoints for user authentication
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad Request - Invalid input data
 *       409:
 *         description: Conflict - Username or email already exists
 *       500:
 *         description: Internal Server Error
 */
// Register a new user
router.post(
  '/register',
  validate, 
  authController.registerUser
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login an existing user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *       401:
 *         description: Unauthorized - Invalid credentials
 *       429:
 *         description: Too Many Requests - Too many login attempts
 *       500:
 *         description: Internal Server Error
 */
// Login an existing user
router.post(
  '/login',
  loginLimiter,
  [
    body('username')
      .notEmpty()
      .withMessage('Username is required')
      .trim(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  validate,
  authController.loginUser
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Request a password reset token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPassword'
 *     responses:
 *       200:
 *         description: Password reset token generated
 *       400:
 *         description: Bad Request - Invalid input data
 *       404:
 *         description: Not Found - User not found
 *       500:
 *         description: Internal Server Error
 */
// Forgot password
router.post(
  '/forgot-password',
  [
    body('email')
      .isEmail()
      .withMessage('Invalid email address')
      .normalizeEmail(),
  ],
  validate,
  authController.forgotPassword
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Reset user password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPassword'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Bad Request - Invalid or expired reset token
 *       500:
 *         description: Internal Server Error
 */
// Reset password
router.post(
  '/reset-password',
  [
    body('token')
      .notEmpty()
      .withMessage('Token is required')
      .trim(),
    body('newPassword')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  ],
  validate,
  authController.resetPassword
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Access token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token
 *       401:
 *         description: Unauthorized - Invalid refresh token
 *       500:
 *         description: Internal Server Error
 */
// Refresh token
router.post('/refresh', authController.refreshToken);

module.exports = router;
