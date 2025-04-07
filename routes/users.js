// ptilms-api/routes/users.js
import { Router } from 'express';
import { param, body, query } from 'express-validator';
import authMiddleware from '../middlewares/authMiddleware.js';
const { authenticateToken, authorizeRole } = authMiddleware;
import validationMiddleware from '../middlewares/validationMiddleware.js';
const { validate } = validationMiddleware;

const router = Router();

export default (userController) => {
  /**
   * @swagger
   * /users/modified:
   *   get:
   *     summary: Get modified users since a specific date
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: since
   *         schema:
   *           type: string
   *           format: date-time
   *         required: false  # Changed to false to make it optional
   *         description: Date and time to filter modified users
   *     responses:
   *       200:
   *         description: Modified users found
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/modified',
    authenticateToken,
    authorizeRole(['admin']),
    validate([
      query('since').optional().isISO8601().withMessage('Invalid date format for "since" parameter'), // Added optional()
    ]),
    (req, res, next) => userController.getModifiedUsers(req, res, next)
  );

  /**
   * @swagger
   * /users:
   *   get:
   *     summary: Get all users
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Users found
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/',
    authenticateToken,
    authorizeRole(['admin']),
    (req, res, next) => userController.getAllUsers(req, res, next)
  );

  /**
   * @swagger
   * /users/{userId}:
   *   get:
   *     summary: Get user by ID
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the user
   *     responses:
   *       200:
   *         description: User found
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  router.get(
    '/:userId',
    authenticateToken,
    authorizeRole(['admin', 'lecturer', 'student']),
    validate([
      param('userId').isUUID().withMessage('Invalid user ID format'),
    ]),
    (req, res, next) => userController.getUserById(req, res, next)
  );

  /**
   * @swagger
   * /users/{userId}:
   *   put:
   *     summary: Update user by ID
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the user
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
   *     responses:
   *       200:
   *         description: User updated successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/:userId',
    authenticateToken,
    authorizeRole(['admin']),
    validate([
      param('userId').isUUID().withMessage('Invalid user ID format'),
      body('username').optional().trim().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
      body('email').optional().trim().isEmail().withMessage('Invalid email format'),
    ]),
    (req, res, next) => userController.updateUser(req, res, next)
  );

  /**
   * @swagger
   * /users/{userId}/change-password:
   *   put:
   *     summary: Change user password
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the user
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               currentPassword:
   *                 type: string
   *               newPassword:
   *                 type: string
   *     responses:
   *       200:
   *         description: Password changed successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  router.put(
    '/:userId/change-password', // Changed route parameter to userId
    authenticateToken,
    authorizeRole(['admin', 'lecturer', 'student']),
    validate([
      param('userId').isUUID().withMessage('Invalid user ID format'), // Changed validation to isUUID
      body('currentPassword').trim().notEmpty().withMessage('Current password is required'),
      body('newPassword').trim().notEmpty().withMessage('New password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])[A-Za-z\d!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{8,}$/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    ]),
    (req, res, next) => userController.changePassword(req, res, next)
  );

  /**
   * @swagger
   * /users/{userId}:
   *   delete:
   *     summary: Delete user by ID
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         schema:
   *           type: string
   *         required: true
   *         description: ID of the user
   *     responses:
   *       204:  # Updated response code to 204
   *         description: User deleted successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: User not found
   *       500:
   *         description: Internal server error
   */
  router.delete(
    '/:userId',
    authenticateToken,
    authorizeRole(['admin']),
    validate([
      param('userId').isUUID().withMessage('Invalid user ID format'),
    ]),
    (req, res, next) => userController.deleteUser(req, res, next)
  );

  return router;
};