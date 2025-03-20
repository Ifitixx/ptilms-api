// ptilms-api/routes/users.js
const express = require('express');
const { param, body, query } = require('express-validator');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');

const router = express.Router();

module.exports = (controller) => {
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
    authorizeRole(['admin', 'lecturer', 'student']), // Corrected role name
    validate([
      param('userId').isUUID().withMessage('Invalid user ID format'),
    ]),
    controller.getUserById.bind(controller)
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
    controller.updateUser.bind(controller)
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
    '/:userId/change-password',
    authenticateToken,
    authorizeRole(['admin', 'lecturer', 'student']), // Corrected role name
    validate([
      param('userId').isUUID().withMessage('Invalid user ID format'),
      body('currentPassword').trim().notEmpty().withMessage('Current password is required'),
      body('newPassword').trim().notEmpty().withMessage('New password is required').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).withMessage('Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'),
    ]),
    controller.changePassword.bind(controller)
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
   *       200:
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
    controller.deleteUser.bind(controller)
  );

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
   *         required: true
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
      query('since').isISO8601().withMessage('Invalid date format for "since" parameter'),
    ]),
    controller.getModifiedUsers.bind(controller)
  );

  return router;
};