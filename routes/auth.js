// ptilms-api/routes/auth.js
import { Router } from 'express';
import { body } from 'express-validator';
import validationMiddleware from '../middlewares/validationMiddleware.js';
const { validate } = validationMiddleware;
import _default from '../middlewares/rateLimiter.js';
const { loginLimiter } = _default;
import { USER_SELECTABLE_ROLES } from '../config/constants.mjs';
import { info } from '../utils/logger.js';

export default (authController) => {
  const router = Router();

  /**
   * @swagger
   * /api/v1/auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               role:
   *                 type: string
   *     responses:
   *       201:
   *         description: User registered successfully
   *       400:
   *         description: Bad request
   */
  router.post(
    '/register',
    validate([
      body('username')
        .trim()
        .notEmpty().withMessage('Username cannot be empty')
        .isLength({ min: 3, max: 255 }).withMessage('Username must be between 3 and 255 characters'),
      body('email')
        .trim()
        .notEmpty().withMessage('Email cannot be empty')
        .isEmail().withMessage('Invalid email format'),
      body('password')
        .trim()
        .notEmpty().withMessage('Password cannot be empty')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
      body('role')
        .trim()
        .notEmpty().withMessage('Role cannot be empty')
        .isIn(USER_SELECTABLE_ROLES).withMessage(`Role must be one of: ${USER_SELECTABLE_ROLES.join(', ')}`),
    ]),
    (req, res, next) => authController.registerUser(req, res, next)
  );

  // ... other routes ...
  /**
   * @swagger
   * /api/v1/auth/verify/{token}:
   *   get:  # Or it could be a POST, depending on how your frontend handles it.  GET is more typical for email links.
   *     summary: Verify a user's email address
   *     tags: [Auth]
   *     parameters:
   *       - in: path
   *         name: token
   *         required: true
   *         schema:
   *           type: string
   *         description: The verification token
   *     responses:
   *       200:
   *         description: User verified successfully
   *       400:
   *         description: Bad request (e.g., missing token)
   *       401:
   *         description: Unauthorized (e.g., invalid or expired token)
   */
  router.get('/verify/:token', (req, res, next) => authController.verifyUser(req, res, next));

  /**
   * @swagger
   * /api/v1/auth/login:
   *   post:
   *     summary: Login a user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: User logged in successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   */
  router.post(
    '/login',
    loginLimiter,
    validate([
      body('email')
        .trim()
        .notEmpty().withMessage('Email cannot be empty')
        .isEmail().withMessage('Invalid email format'),
      body('password')
        .trim()
        .notEmpty().withMessage('Password cannot be empty'),
    ]),
    (req, res, next) => authController.loginUser(req, res, next)
  );

  /**
   * @swagger
   * /api/v1/auth/refresh-token:
   *   post:
   *     summary: Refresh a user's access token
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               refreshToken:
   *                 type: string
   *     responses:
   *       200:
   *         description: Access token refreshed successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   */
  router.post(
    '/refresh-token',
    validate([
      body('refreshToken')
        .trim()
        .notEmpty().withMessage('Refresh token cannot be empty')
    ]),
    (req, res, next) => {
      info('Refresh token endpoint hit');
      authController.refreshToken(req, res, next);
    }
  );

  /**
   * @swagger
   * /api/v1/auth/forgot-password:
   *   post:
   *     summary: Initiate password reset
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *     responses:
   *       200:
   *         description: Password reset email sent
   *       400:
   *         description: Bad request
   *       404:
   *         description: User not found
   */
  router.post(
    '/forgot-password',
    validate([
      body('email')
        .trim()
        .notEmpty().withMessage('Email cannot be empty')
        .isEmail().withMessage('Invalid email format'),
    ]),
    (req, res, next) => authController.forgotPassword(req, res, next)
  );

  /**
   * @swagger
   * /api/v1/auth/reset-password:
   *   post:
   *     summary: Reset password
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               token:
   *                 type: string
   *               newPassword:
   *                 type: string
   *     responses:
   *       200:
   *         description: Password reset successfully
   *       400:
   *         description: Bad request
   *       404:
   *         description: User not found
   */
  router.post(
    '/reset-password',
    validate([
      body('token')
        .trim()
        .notEmpty().withMessage('Token cannot be empty'),
      body('newPassword')
        .trim()
        .notEmpty().withMessage('New password cannot be empty')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    ]),
    (req, res, next) => authController.resetPassword(req, res, next)
  );

  return router;
};