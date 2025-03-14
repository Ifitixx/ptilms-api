// routes/users.js
const express = require('express');
const { body, query } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, authorizeRole } = require('../middlewares/authMiddleware');

// GET /api/users/:userId
router.get('/:userId', authenticateToken, authorizeRole(['admin', 'user']), userController.getUserById);

// PUT /api/users/:userId
router.put('/:userId', authenticateToken, authorizeRole(['admin', 'user']), [
  body('username').optional().trim().escape(),
  body('email').optional().isEmail().withMessage('Invalid email').normalizeEmail(),
  body('phone_number').optional().trim().escape(),
  body('date_of_birth').optional().isISO8601().withMessage('Invalid date format'),
  body('sex').optional().trim().escape(),
  body('profile_picture_url').optional().isURL().withMessage('Invalid URL').trim().escape(),
], userController.updateUser);

// PUT /api/users/:userId/change-password
router.put('/:userId/change-password', authenticateToken, authorizeRole(['admin', 'user']), [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
], userController.changePassword);

// DELETE /api/users/:userId
router.delete('/:userId', authenticateToken, authorizeRole(['admin']), userController.deleteUser);

// GET /api/users/modified?since=timestamp
router.get('/modified', authenticateToken, authorizeRole(['admin']), [
  query('since').notEmpty().withMessage('Since timestamp is required').isInt(),
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
], userController.getModifiedUsers);

module.exports = router;
