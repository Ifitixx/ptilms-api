// models/User.js
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger'); // Import the logger

const User = {
  createUser: async (userData) => {
    try {
      const userId = uuidv4();
      const { username, email, password, role, phone_number, date_of_birth, sex, profile_picture_url } = userData;
      const insertQuery = `
        INSERT INTO users 
        (user_id, username, email, password, role, phone_number, date_of_birth, sex, profile_picture_url, created_at, modified_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      await db.execute(insertQuery, [userId, username, email, password, role, phone_number, date_of_birth, sex, profile_picture_url]);
      return { user_id: userId, ...userData };
    } catch (error) {
      logger.error(`Error creating user: ${error.message}`);
      throw error; // Re-throw the error to be handled by the controller
    }
  },

  getUserByUsername: async (username) => {
    try {
      const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
      return rows[0];
    } catch (error) {
      logger.error(`Error getting user by username: ${error.message}`);
      throw error;
    }
  },
  getUserByEmail: async (email) => {
    try {
      const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
      return rows[0];
    } catch (error) {
      logger.error(`Error getting user by email: ${error.message}`);
      throw error;
    }
  },
  getUserById: async (userId) => {
    try {
      const [rows] = await db.execute('SELECT * FROM users WHERE user_id = ?', [userId]);
      return rows[0];
    } catch (error) {
      logger.error(`Error getting user by ID: ${error.message}`);
      throw error;
    }
  },
  updateUser: async (userId, userData) => {
    try {
      const { username, email, phone_number, date_of_birth, sex, profile_picture_url } = userData;
      const updateQuery = `
        UPDATE users 
        SET username = ?, email = ?, phone_number = ?, date_of_birth = ?, sex = ?, profile_picture_url = ?, modified_at = NOW()
        WHERE user_id = ?
      `;
      await db.execute(updateQuery, [username, email, phone_number, date_of_birth, sex, profile_picture_url, userId]);
      return { user_id: userId, ...userData };
    } catch (error) {
      logger.error(`Error updating user: ${error.message}`);
      throw error;
    }
  },
  deleteUser: async (userId) => {
    try {
      await db.execute('DELETE FROM users WHERE user_id = ?', [userId]);
    } catch (error) {
      logger.error(`Error deleting user: ${error.message}`);
      throw error;
    }
  },
  updateResetToken: async (userId, resetToken) => {
    try {
      await db.execute('UPDATE users SET reset_token = ?, modified_at = NOW() WHERE user_id = ?', [resetToken, userId]);
    } catch (error) {
      logger.error(`Error updating reset token: ${error.message}`);
      throw error;
    }
  },
  getUserByResetToken: async (userId, token) => {
    try {
      const [rows] = await db.execute('SELECT * FROM users WHERE user_id = ? AND reset_token = ?', [userId, token]);
      return rows[0];
    } catch (error) {
      logger.error(`Error getting user by reset token: ${error.message}`);
      throw error;
    }
  },
  updatePassword: async (userId, hashedPassword) => {
    try {
      await db.execute('UPDATE users SET password = ?, reset_token = NULL, modified_at = NOW() WHERE user_id = ?', [hashedPassword, userId]);
    } catch (error) {
      logger.error(`Error updating password: ${error.message}`);
      throw error;
    }
  }
};

module.exports = User;
