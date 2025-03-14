// userController.js
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const logger = require('../utils/logger');
const sanitizeHtml = require('sanitize-html');

// Helper function to sanitize user input
const sanitizeInput = (input) => {
  return sanitizeHtml(input, {
    allowedTags: [], // No tags allowed
    allowedAttributes: {}, // No attributes allowed
  });
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Find the user by user ID
    const [users] = await db.execute('SELECT user_id, username, email, role, phone_number, date_of_birth, sex, profile_picture_url FROM users WHERE user_id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    res.status(200).json(user);
  } catch (error) {
    logger.error(`Error getting user by ID: ${error.message}`);
    next(error);
  }
};

// Update user
exports.updateUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { username, email, phone_number, date_of_birth, sex, profile_picture_url } = req.body;

    // Sanitize user input
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPhoneNumber = sanitizeInput(phone_number);
    const sanitizedSex = sanitizeInput(sex);
    const sanitizedProfilePictureUrl = sanitizeInput(profile_picture_url);

    // Check if the user exists
    const [existingUsers] = await db.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user
    const updateQuery = `
      UPDATE users 
      SET username = ?, email = ?, phone_number = ?, date_of_birth = ?, sex = ?, profile_picture_url = ?
      WHERE user_id = ?
    `;
    await db.execute(updateQuery, [sanitizedUsername, sanitizedEmail, sanitizedPhoneNumber, date_of_birth, sanitizedSex, sanitizedProfilePictureUrl, userId]);

    res.status(200).json({ message: 'User updated successfully' });
  } catch (error) {
    logger.error(`Error updating user: ${error.message}`);
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Find the user by user ID
    const [users] = await db.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Check the current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password
    await db.execute('UPDATE users SET password = ? WHERE user_id = ?', [hashedPassword, userId]);

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error(`Error changing password: ${error.message}`);
    next(error);
  }
};

// Delete user
exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check if the user exists
    const [existingUsers] = await db.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
    if (existingUsers.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the user
    await db.execute('DELETE FROM users WHERE user_id = ?', [userId]);

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting user: ${error.message}`);
    next(error);
  }
};

// Get modified users
exports.getModifiedUsers = async (req, res, next) => {
  try {
    const since = parseInt(req.query.since);
    const limit = parseInt(req.query.limit) || 10;

    // Get modified users since the given timestamp
    const [modifiedUsers] = await db.execute('SELECT * FROM users WHERE modified_at > FROM_UNIXTIME(?) LIMIT ?', [since, limit]);

    res.status(200).json(modifiedUsers);
  } catch (error) {
    logger.error(`Error getting modified users: ${error.message}`);
    next(error);
  }
};
