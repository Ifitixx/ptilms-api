// controllers/userController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getUserById = (req, res) => {
  const { userId } = req.params;
  const query = `
    SELECT user_id, username, email, role, phone_number, date_of_birth, sex, profile_picture_url 
    FROM users 
    WHERE user_id = ?
  `;
  db.query(query, [userId], (error, results) => {
    if (error) return res.status(500).json({ message: 'Database error', error });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    return res.json(results[0]);
  });
};

exports.updateUser = (req, res) => {
  const { userId } = req.params;
  const { username, email, phone_number, date_of_birth, sex, profile_picture_url } = req.body;
  const updateQuery = `
    UPDATE users 
    SET username = ?, email = ?, phone_number = ?, date_of_birth = ?, sex = ?, profile_picture_url = ? 
    WHERE user_id = ?
  `;
  const values = [username, email, phone_number, date_of_birth, sex, profile_picture_url, userId];
  
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
    return res.status(500).json({ message: "Error processing request", error });
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
