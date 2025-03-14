const db = require('../config/db');
const { validationResult } = require('express-validator');
const { parseISO } = require('date-fns');
const logger = require('../utils/logger');

exports.getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const query = 'SELECT user_id, username, email, role, phone_number, date_of_birth, sex, profile_picture_url FROM users WHERE user_id = ?';
    const [results] = await db.execute(query, [userId]);
    if (results.length === 0) {
      logger.warn(`User not found: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    const user = results[0];
    user.date_of_birth = user.date_of_birth ? user.date_of_birth.toISOString().split('T')[0] : null;
    logger.info(`User details retrieved: ${userId}`);
    return res.json(user);
  } catch (error) {
    logger.error(`Error getting user details: ${userId}`, error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn(`Validation error during user update: ${req.params.userId}`, errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId } = req.params;
  const { username, email, phone_number, date_of_birth, sex, profile_picture_url } = req.body;
  const parsedDateOfBirth = date_of_birth ? parseISO(date_of_birth) : null;

  try {
    const checkQuery = 'SELECT * FROM users WHERE user_id = ?';
    const [existingUsers] = await db.execute(checkQuery, [userId]);
    if (existingUsers.length === 0) {
      logger.warn(`User not found for update: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    const updateQuery = `
      UPDATE users SET 
      username = ?, 
      email = ?, 
      phone_number = ?, 
      date_of_birth = ?, 
      sex = ?, 
      profile_picture_url = ?
      WHERE user_id = ?
    `;
    await db.execute(updateQuery, [username, email, phone_number, parsedDateOfBirth, sex, profile_picture_url, userId]);
    logger.info(`User updated successfully: ${userId}`);
    return res.json({ message: 'User updated successfully' });
  } catch (error) {
    logger.error(`Error updating user: ${userId}`, error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.changePassword = async (req, res) => {
  const { userId } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    const checkQuery = 'SELECT * FROM users WHERE user_id = ?';
    const [existingUsers] = await db.execute(checkQuery, [userId]);
    if (existingUsers.length === 0) {
      logger.warn(`User not found for password change: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    const user = existingUsers[0];
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      logger.warn(`Incorrect current password for user: ${userId}`);
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const updateQuery = 'UPDATE users SET password = ? WHERE user_id = ?';
    await db.execute(updateQuery, [hashedPassword, userId]);
    logger.info(`Password changed successfully for user: ${userId}`);
    return res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error(`Error changing password for user: ${userId}`, error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const checkQuery = 'SELECT * FROM users WHERE user_id = ?';
    const [existingUsers] = await db.execute(checkQuery, [userId]);
    if (existingUsers.length === 0) {
      logger.warn(`User not found for deletion: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    const deleteQuery = 'DELETE FROM users WHERE user_id = ?';
    await db.execute(deleteQuery, [userId]);
    logger.info(`User deleted successfully: ${userId}`);
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting user: ${userId}`, error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getModifiedUsers = async (req, res) => {
  const { since } = req.query;
  const limit = parseInt(req.query.limit) || 10; // Default limit to 10
  const offset = parseInt(req.query.offset) || 0; // Default offset to 0

  if (!since) {
    logger.warn('Timestamp query parameter is required for getModifiedUsers');
    return res.status(400).json({ message: 'Timestamp query parameter is required' });
  }

  try {
    const query = `
      SELECT user_id, username, email, role, phone_number, date_of_birth, sex, profile_picture_url, modified_at
      FROM users
      WHERE modified_at > ?
      LIMIT ? OFFSET ?
    `;
    const [results] = await db.execute(query, [since, limit, offset]);
    logger.info(`Retrieved modified users since: ${since}`);
    return res.json(results);
  } catch (error) {
    logger.error(`Error getting modified users since: ${since}`, error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};