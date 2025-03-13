// userController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { parseISO, formatISO } = require('date-fns');

exports.getUserById = (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT user_id, username, email, role, phone_number, date_of_birth, sex, profile_picture_url, modified_at
    FROM users 
    WHERE user_id = ?
  `;
  db.query(query, [userId], (error, results) => {
    if (error) return res.status(500).json({ message: 'Database error', error });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    const user = results[0];
    if (user.date_of_birth) {
      user.date_of_birth = formatISO(user.date_of_birth, { representation: 'date' });
    }
    return res.json(user);
  });
};

exports.updateUser = (req, res) => {
  const { userId } = req.params;
  const { username, email, phone_number, date_of_birth, sex, profile_picture_url } = req.body;
  const parsedDateOfBirth = date_of_birth ? parseISO(date_of_birth) : null;
  const updateQuery = `
    UPDATE users 
    SET username = ?, email = ?, phone_number = ?, date_of_birth = ?, sex = ?, profile_picture_url = ? 
    WHERE user_id = ?
  `;
  const values = [username, email, phone_number, parsedDateOfBirth, sex, profile_picture_url, userId];
  
  db.query(updateQuery, values, (error, result) => {
    if (error) return res.status(500).json({ message: 'Database error', error });
    return res.json({ message: 'User updated successfully' });
  });
};

exports.changePassword = async (req, res) => {
  const { userId } = req.params;
  const { newPassword } = req.body;
  if (!newPassword) {
    return res.status(400).json({ message: 'New password is required' });
  }
  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const query = 'UPDATE users SET password = ? WHERE user_id = ?';
    db.query(query, [hashedPassword, userId], (error, result) => {
      if (error) return res.status(500).json({ message: 'Database error', error });
      return res.json({ message: 'Password updated successfully' });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error hashing password', error });
  }
};

exports.deleteUser = (req, res) => {
  const { userId } = req.params;
  const query = 'DELETE FROM users WHERE user_id = ?';
  db.query(query, [userId], (error, results) => {
    if (error) return res.status(500).json({ message: 'Database error', error });
    return res.json({ message: 'User deleted successfully' });
  });
};

exports.getModifiedUsers = (req, res) => {
  const { since } = req.query;
  if (!since) {
    return res.status(400).json({ message: 'Timestamp query parameter is required' });
  }
  const query = 'SELECT * FROM users WHERE modified_at >= ?';
  db.query(query, [since], (error, results) => {
    if (error) return res.status(500).json({ message: 'Database error', error });
    return res.json(results);
  });
};
