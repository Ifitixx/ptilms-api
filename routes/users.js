// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// GET /api/users/:userId - Get user details for sync
router.get('/:userId', userController.getUserById);

// PUT /api/users/:userId - Update user profile
router.put('/:userId', userController.updateUser);

// PUT /api/users/:userId/password - Change password
router.put('/:userId/password', userController.changePassword);

// DELETE /api/users/:userId - Delete user
router.delete('/:userId', userController.deleteUser);

module.exports = router;
