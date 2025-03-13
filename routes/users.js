// routes/users.js
const express = require('express');
const { query, body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users/:userId - Get user details for sync
router.get('/:userId', userController.getUserById);

// PUT /api/users/:userId - Update user profile
router.put('/:userId', [
  body('date_of_birth').optional().isISO8601().withMessage('Invalid date format for date_of_birth'),
], userController.updateUser);

// PUT /api/users/:userId/password - Change password
router.put('/:userId/password', userController.changePassword);

// DELETE /api/users/:userId - Delete user
router.delete('/:userId', userController.deleteUser);

// GET /api/users/modified - Get modified users since timestamp
router.get('/modified', [
  query('since').notEmpty().withMessage('Timestamp query parameter is required'),
], userController.getModifiedUsers);

module.exports = router;
