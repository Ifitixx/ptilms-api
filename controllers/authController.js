// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const sanitizeHtml = require('sanitize-html');
const tokenBlacklist = require('../utils/tokenBlacklist');
const { ConflictError, UnauthorizedError, NotFoundError, BadRequestError } = require('../utils/errors');
const User = require('../models/user'); // Import the User model
const config = require('../config/config');

// Helper function to generate tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.user_id, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } // Short-lived access token
  );

  const refreshToken = jwt.sign(
    { userId: user.user_id, role: user.role },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn } // Longer-lived refresh token
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
    const existingUser = await User.getUserByUsername(sanitizedUsername);
    const existingEmail = await User.getUserByEmail(sanitizedEmail);
    if (existingUser) {
      throw new ConflictError('Username already exists');
    }
    if (existingEmail) {
      throw new ConflictError('Email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user
    const newUser = await User.createUser({
      username: sanitizedUsername,
      email: sanitizedEmail,
      password: hashedPassword,
      role: sanitizedRole,
      phone_number: sanitizedPhoneNumber !== undefined ? sanitizedPhoneNumber : null, // Convert undefined to null
      date_of_birth: date_of_birth !== undefined ? date_of_birth : null, // Convert undefined to null
      sex: sanitizedSex !== undefined ? sanitizedSex : null, // Convert undefined to null
      profile_picture_url: sanitizedProfilePictureUrl !== undefined ? sanitizedProfilePictureUrl : null, // Convert undefined to null
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    logger.error(`Error registering user: ${error.message}`);
    next(error);
  }
};

// Login an existing user
exports.loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.getUserByUsername(username);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check the password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Set the refresh token as an HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure: config.env === 'production',
      sameSite: 'Strict',
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
    const user = await User.getUserByEmail(email);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Generate a reset token
    const resetToken = jwt.sign({ userId: user.user_id }, config.jwt.secret, { expiresIn: '1h' });

    // Update the user's reset token in the database
    await User.updateResetToken(user.user_id, resetToken);

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
    const decoded = jwt.verify(token, config.jwt.secret);

    // Find the user by user ID
    const user = await User.getUserByResetToken(decoded.userId, token);
    if (!user) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update the user's password and clear the reset token
    await User.updatePassword(user.user_id, hashedPassword);

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
      throw new UnauthorizedError('No refresh token provided');
    }

    // Check if the token is blacklisted
    const isBlacklisted = await tokenBlacklist.isBlacklisted(refreshToken);
    if (isBlacklisted) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);

    // Find the user by user ID
    const user = await User.getUserById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

    // Blacklist the old refresh token
    const decodedRefresh = jwt.decode(refreshToken);
    const expiresAt = decodedRefresh.exp;
    await tokenBlacklist.addToken(refreshToken, expiresAt);

    // Set the new refresh token as an HTTP-only cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: config.env === 'production', // Use secure in production
      sameSite: 'Strict',
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

    if (error instanceof UnauthorizedError) {
      return res.status(401).json({ message: error.message });
    }

    next(error);
  }
};
