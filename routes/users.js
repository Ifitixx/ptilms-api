// routes/users.js
const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');
const { validate } = require('../middlewares/validationMiddleware');
const { apiLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Get user by ID
router.get('/:userId', apiLimiter, authenticateToken, userController.getUserById);

// Update user
router.put(
  '/:userId',
  apiLimiter,
  authenticateToken,
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').isEmail().withMessage('Invalid email address'),
  ],
  validate,
  userController.updateUser
);

// Change password
router.put(
  '/:userId/change-password',
  apiLimiter,
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  ],
  validate,
  userController.changePassword
);

// Delete user
router.delete('/:userId', apiLimiter, authenticateToken, authorizeRole(['admin']), userController.deleteUser);

// Get modified users
router.get('/modified', apiLimiter, authenticateToken, authorizeRole(['admin']), userController.getModifiedUsers);

module.exports = router;
