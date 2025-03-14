const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');
const { parseISO } = require('date-fns');
const logger = require('../utils/logger');

require('dotenv').config();

const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user.user_id, tokenId: uuidv4() },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation error during registration:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password, role, phone_number, date_of_birth, sex, profile_picture_url } = req.body;
    if (!username || !email || !password || !role) {
      logger.warn('Missing required fields during registration');
      return res.status(400).json({ message: "Missing required fields" });
    }
    const parsedDateOfBirth = date_of_birth ? parseISO(date_of_birth) : null;

    const checkQuery = 'SELECT * FROM users WHERE username = ? OR email = ?';
    const [existingUsers] = await db.execute(checkQuery, [username, email]);

    if (existingUsers.length > 0) {
      logger.warn(`Username or email already exists: ${username}, ${email}`);
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
    await db.execute(insertQuery, [userId, username, email, hashedPassword, role, phone_number, parsedDateOfBirth, sex, profile_picture_url]);
    logger.info(`User registered successfully: ${userId}`);
    return res.status(201).json({ message: 'User registered successfully', userId });
  } catch (error) {
    logger.error('Error during user registration:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation error during login:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password } = req.body;
  if (!password || (!username && !email)) {
    logger.warn('Missing username/email or password during login');
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

  try {
    const [results] = await db.execute(query, [param]);
    if (results.length === 0) {
      logger.warn(`Invalid credentials for username/email: ${param}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Invalid password for username/email: ${param}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Set to true in production (HTTPS)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    logger.info(`User logged in successfully: ${user.user_id}`);
    return res.json({ message: 'Login successful', accessToken, userId: user.user_id });
  } catch (error) {
    logger.error('Error during user login:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation error during forgot password:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;
  if (!email) {
    logger.warn('Email is required for forgot password');
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [results] = await db.execute(query, [email]);
    if (results.length === 0) {
      logger.warn(`User not found for email: ${email}`);
      return res.status(404).json({ message: 'User not found' });
    }

    const token = uuidv4();
    const expiry = Date.now() + 3600000; // Valid for 1 hour
    const updateQuery = 'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?';
    await db.execute(updateQuery, [token, expiry, email]);
    logger.info(`Password reset token generated for email: ${email}`);
    // In production, you would send this token by email.
    return res.json({ message: 'Password reset token generated', token });
  } catch (error) {
    logger.error('Error during forgot password:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation error during reset password:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    logger.warn('Token and newPassword are required for reset password');
    return res.status(400).json({ message: "Token and newPassword are required" });
  }

  try {
    const query = 'SELECT * FROM users WHERE reset_token = ?';
    const [results] = await db.execute(query, [token]);
    if (results.length === 0) {
      logger.warn(`Invalid token: ${token}`);
      return res.status(404).json({ message: 'Invalid token' });
    }

    const user = results[0];
    if (Date.now() > user.reset_token_expiry) {
      logger.warn(`Token expired: ${token}`);
      return res.status(400).json({ message: 'Token expired' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const updateQuery = 'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = ?';
    await db.execute(updateQuery, [hashedPassword, user.user_id]);
    logger.info(`Password reset successfully for user: ${user.user_id}`);
    return res.json({ message: 'Password reset successfully' });
  } catch (error) {
    logger.error('Error during reset password:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.verifyResetToken = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('Validation error during verify reset token:', errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  const { token } = req.body;
  if (!token) {
    logger.warn('Token is required for verify reset token');
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    const query = 'SELECT * FROM users WHERE reset_token = ?';
    const [results] = await db.execute(query, [token]);
    if (results.length === 0) {
      logger.warn(`Invalid token: ${token}`);
      return res.status(404).json({ message: 'Invalid token' });
    }

    const user = results[0];
    if (Date.now() > user.reset_token_expiry) {
      logger.warn(`Token expired: ${token}`);
      return res.status(400).json({ message: 'Token expired' });
    }

    logger.info(`Token verified successfully: ${token}`);
    return res.json({ valid: true });
  } catch (error) {
    logger.error('Error during verify reset token:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    logger.warn('No refresh token provided');
    return res.status(401).json({ message: 'Refresh token is required' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    // In a real application, you would check if the refresh token is blacklisted here.

    const query = 'SELECT * FROM users WHERE user_id = ?';
    const [results] = await db.execute(query, [decoded.userId]);

    if (results.length === 0) {
      logger.warn(`User not found for refresh token: ${decoded.userId}`);
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const user = results[0];
    const accessToken = generateAccessToken(user);
    logger.info(`Access token refreshed for user: ${user.user_id}`);
    return res.json({ accessToken });
  } catch (error) {
    logger.error('Invalid refresh token:', error);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};
