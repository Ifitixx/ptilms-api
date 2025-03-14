// authController 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const logger = require('../utils/logger');
const sanitizeHtml = require('sanitize-html');

// In-memory token blacklist (for simplicity)
const tokenBlacklist = new Set();

// Helper function to add token to blacklist
const blacklistToken = (token) => {
  tokenBlacklist.add(token);
};

// Helper function to check if token is blacklisted
const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

// Helper function to generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' } // Short-lived access token
  );

  const refreshToken = jwt.sign(
    { userId: user.user_id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // Longer-lived refresh token
  );

  return { accessToken, refreshToken };
};

// Helper function to sanitize user input
const sanitizeInput = (input) => {
  return sanitizeHtml(input, {
    allowedTags: [], // No tags allowed
    allowedAttributes: {}, // No attributes allowed
  });
};

// Register a new user
exports.registerUser = async (req, res, next) => {
  try {
    const { username, email, password, role, phone_number, date_of_birth, sex, profile_picture_url } = req.body;

    // Sanitize user input
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedRole = sanitizeInput(role);
    const sanitizedPhoneNumber = sanitizeInput(phone_number);
    const sanitizedSex = sanitizeInput(sex);
    const sanitizedProfilePictureUrl = sanitizeInput(profile_picture_url);

    // Check if the username or email already exists
    const [existingUsers] = await db.execute('SELECT * FROM users WHERE username = ? OR email = ?', [sanitizedUsername, sanitizedEmail]);
    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user
    const userId = uuidv4();
    const insertQuery = `
      INSERT INTO users 
      (user_id, username, email, password, role, phone_number, date_of_birth, sex, profile_picture_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.execute(insertQuery, [userId, sanitizedUsername, sanitizedEmail, hashedPassword, sanitizedRole, sanitizedPhoneNumber, date_of_birth, sanitizedSex, sanitizedProfilePictureUrl]);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    logger.error(`Error registering user: ${error.message}`);
    next(error);
  }
};

// Login an existing user
exports.loginUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Find the user by username or email
    const [users] = await db.execute('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check the password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Set the refresh token as an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production', // Use secure in production
    });

    res.status(200).json({ message: 'Login successful', accessToken });
  } catch (error) {
    logger.error(`Error logging in user: ${error.message}`);
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];

    // Generate a reset token
    const resetToken = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Update the user's reset token in the database
    await db.execute('UPDATE users SET reset_token = ? WHERE user_id = ?', [resetToken, user.user_id]);

    // Send the reset token to the user's email (implementation not included)
    logger.info(`Password reset token generated for user ${user.user_id}: ${resetToken}`);

    res.status(200).json({ message: 'Password reset token generated', token: resetToken });
  } catch (error) {
    logger.error(`Error generating password reset token: ${error.message}`);
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    // Verify the reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by user ID
    const [users] = await db.execute('SELECT * FROM users WHERE user_id = ? AND reset_token = ?', [decoded.userId, token]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = users[0];

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password and clear the reset token
    await db.execute('UPDATE users SET password = ?, reset_token = NULL WHERE user_id = ?', [hashedPassword, user.user_id]);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    logger.error(`Error resetting password: ${error.message}`);
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'No refresh token provided' });
    }

    // Check if the token is blacklisted
    if (isTokenBlacklisted(refreshToken)) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find the user by user ID
    const [users] = await db.execute('SELECT * FROM users WHERE user_id = ?', [decoded.userId]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

  
    const user = users[0];

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Blacklist the old refresh token
    blacklistToken(refreshToken);

    // Set the new refresh token as an HTTP-only cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production', // Use secure in production
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    logger.error(`Error refreshing token: ${error.message}`);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired' });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    next(error);
  }
};
