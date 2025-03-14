// routes/users.js
const express = require('express');
const { body, query } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { apiLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

/**
 * @swagger
 * /api/users/{userId}:
 *   get:
 *     tags: [Users]
 *     summary: Get user details by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       401:
 *         description: Unauthorized - Invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Not Found - User not found
 *       500:
 *         description: Internal Server Error
 */
// Get user by ID
router.get('/:userId', apiLimiter, authenticateToken, userController.getUserById);

/**
 * @swagger
 * /api/users/{userId}:
 *   put:
 *     tags: [Users]
 *     summary: Update user details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Bad Request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Not Found - User not found
 *       500:
 *         description: Internal Server Error
 */
// Update user
router.put(
  '/:userId',
  apiLimiter,
  authenticateToken,
  [
    body('username').optional().trim(),
    body('email').optional().isEmail().withMessage('Invalid email address').normalizeEmail(),
    body('phone_number').optional().isMobilePhone().withMessage('Invalid phone number').trim(),
    body('date_of_birth').optional().isDate().withMessage('Invalid date format (YYYY-MM-DD)').toDate(),
    body('sex').optional().isIn(['male', 'female', 'other']).withMessage('Sex must be one of: male, female, other').trim(),
    body('profile_picture_url').optional().isURL().withMessage('Invalid profile picture URL').trim(),
  ],
  validate,
  userController.updateUser
);

/**
 * @swagger
 * /api/users/{userId}/change-password:
 *   put:
 *     tags: [Users]
 *     summary: Change user password
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user whose password to change
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePassword'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Bad Request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Not Found - User not found
 *       500:
 *         description: Internal Server Error
 */
// Change password
router.put(
  '/:userId/change-password',
  apiLimiter,
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  ],
  validate,
  userController.changePassword
);

/**
 * @swagger
 * /api/users/{userId}:
 *   delete:
 *     tags: [Users]
 *     summary: Delete a user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized - Invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Not Found - User not found
 *       500:
 *         description: Internal Server Error
 */
// Delete user
router.delete('/:userId', apiLimiter, authenticateToken, authorizeRole(['admin']), userController.deleteUser);

/**
 * @swagger
 * /api/users/modified:
 *   get:
 *     tags: [Users]
 *     summary: Get modified users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: since
 *         required: true
 *         schema:
 *           type: string
 *         description: Date to get users modified since
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         description: Limit the number of users returned
 *     responses:
 *       200:
 *         description: Modified users retrieved successfully
 *       400:
 *         description: Bad Request - Invalid input data
 *       401:
 *         description: Unauthorized - Invalid token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal Server Error
 */
// Get modified users
router.get('/modified', apiLimiter, authenticateToken, authorizeRole(['admin']),
[
  query('since').notEmpty().withMessage('Since is required').isISO8601().withMessage('Invalid date format for since query parameter'),
],
validate,
userController.getModifiedUsers);

module.exports = router;
