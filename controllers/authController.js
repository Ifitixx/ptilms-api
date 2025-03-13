// controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
require('dotenv').config();

exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password, role, phone_number, date_of_birth, sex, profile_picture_url } = req.body;
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const checkQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
    db.query(checkQuery, [username, email], async (error, results) => {
      if (error) return res.status(500).json({ message: 'Database error', error });
      if (results.length > 0) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }
      
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const userId = uuidv4();
      const insertQuery = `
        INSERT INTO users 
        (user_id, username, email, password, role, phone_number, date_of_birth, sex, profile_picture_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(insertQuery, [userId, username, email, hashedPassword, role, phone_number, date_of_birth, sex, profile_picture_url],
        (err, result) => {
          if (err) return res.status(500).json({ message: 'Error inserting user', err });
          return res.status(201).json({ message: 'User registered successfully', userId });
      });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error });
  }
};

exports.loginUser = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;
  if (!password || (!username && !email)) {
    return res.status(400).json({ message: "Please provide username (or email) and password" });
  }
  
  let query = "";
  let param = "";

  if (username) {
    query = "SELECT * FROM users WHERE username = ?";
    param = username;
  } else {
    query = "SELECT * FROM users WHERE email = ?";
    param = email;
  }

  db.query(query, [param], async (error, results) => {
    if (error) return res.status(500).json({ message: 'Database error', error });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });
    
    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );
    
    return res.json({ message: 'Login successful', token, userId: user.user_id });
  });
};

exports.forgotPassword = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });
  
  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (error, results) => {
    if (error) return res.status(500).json({ message: 'Database error', error });
    if (results.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const token = uuidv4();
    const expiry = Date.now() + 3600000; // Valid for 1 hour
    const updateQuery = 'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?';
    db.query(updateQuery, [token, expiry, email], (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error', err });
      // In production, you would send this token by email.
      return res.json({ message: 'Password reset token generated', token });
    });
  });
};

exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, newPassword } = req.body;
  if (!token || !newPassword) return res.status(400).json({ message: "Token and newPassword are required" });
  
  const query = 'SELECT * FROM users WHERE reset_token = ?';
  db.query(query, [token], async (error, results) => {
    if (error) return res.status(500).json({ message: 'Database error', error });
    if (results.length === 0) return res.status(404).json({ message: 'Invalid token' });
    
    const user = results[0];
    if (Date.now() > user.reset_token_expiry) {
      return res.status(400).json({ message: 'Token expired' });
    }
    
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      const updateQuery = 'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = ?';
      db.query(updateQuery, [hashedPassword, user.user_id], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error', err });
        return res.json({ message: 'Password reset successfully' });
      });
    } catch (error) {
      return res.status(500).json({ message: 'Error hashing password', error });
    }
  });
};

exports.verifyResetToken = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  const query = 'SELECT * FROM users WHERE reset_token = ?';
  db.query(query, [token], (error, results) => {
    if (error) return res.status(500).json({ message: 'Database error', error });
    if (results.length === 0) return res.status(404).json({ message: 'Invalid token' });

    const user = results[0];
    if (Date.now() > user.reset_token_expiry) {
      return res.status(400).json({ message: 'Token expired' });
    }

    return res.json({ valid: true });
  });
};
