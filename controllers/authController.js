// ptilms-api/controllers/authController.js
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import config from '../config/config.cjs';
import { AuthenticationError, ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

class AuthController {
  constructor({ userRepository, emailQueueService, cacheService }) {
    this.userRepository = userRepository;
    this.emailQueueService = emailQueueService;
    this.cacheService = cacheService;
  }

  async login(req, res) {
    const { email, password } = req.body;
    const user = await this.userRepository.findByEmail(email);

    if (!user || !(await user.verifyPassword(password))) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!user.isVerified) {
      throw new AuthenticationError('Please verify your email before logging in');
    }

    const tokens = await this._generateTokens(user);
    await this._updateRefreshToken(user.id, tokens.refreshToken);

    return res.json({
      message: 'Login successful',
      user: user.toJSON(),
      ...tokens
    });
  }

  async register(req, res) {
    const userData = req.body;
    const verificationToken = uuidv4();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await this.userRepository.create({
      ...userData,
      verificationToken,
      verificationTokenExpiry: verificationExpiry
    });

    // Queue verification email
    await this._queueVerificationEmail(user, verificationToken);

    return res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: user.toJSON()
    });
  }

  async verifyEmail(req, res) {
    const { token } = req.params;
    const user = await this.userRepository.findByVerificationToken(token);

    if (!user || user.isVerified || !this._isTokenValid(user.verificationTokenExpiry)) {
      throw new ValidationError('Invalid or expired verification token');
    }

    await this.userRepository.update(user.id, {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpiry: null
    });

    return res.json({ message: 'Email verified successfully' });
  }

  async requestPasswordReset(req, res) {
    const { email } = req.body;
    const user = await this.userRepository.findByEmail(email);

    if (user) {
      const resetToken = uuidv4();
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await this.userRepository.update(user.id, {
        resetToken,
        resetTokenExpiry
      });

      // Queue password reset email
      await this._queuePasswordResetEmail(user, resetToken);
    }

    // Always return success to prevent email enumeration
    return res.json({
      message: 'If your email is registered, you will receive password reset instructions.'
    });
  }

  async resetPassword(req, res) {
    const { token } = req.params;
    const { password } = req.body;
    const user = await this.userRepository.findByResetToken(token);

    if (!user || !this._isTokenValid(user.resetTokenExpiry)) {
      throw new ValidationError('Invalid or expired reset token');
    }

    await this.userRepository.update(user.id, {
      password,
      resetToken: null,
      resetTokenExpiry: null
    });

    return res.json({ message: 'Password reset successful' });
  }

  async refreshToken(req, res) {
    const { refreshToken } = req.body;
    const payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
    const user = await this.userRepository.findById(payload.userId);

    if (!user || !(await this._verifyRefreshToken(user.id, refreshToken))) {
      throw new AuthenticationError('Invalid refresh token');
    }

    const tokens = await this._generateTokens(user);
    await this._updateRefreshToken(user.id, tokens.refreshToken);

    return res.json(tokens);
  }

  async logout(req, res) {
    const userId = req.user.id;
    await this.cacheService.del(`refreshToken:${userId}`);
    return res.json({ message: 'Logged out successfully' });
  }

  // Private helper methods
  async _queueVerificationEmail(user, token) {
    const verificationUrl = `${config.appBaseUrl}/auth/verify/${token}`;
    
    await this.emailQueueService.queueEmail({
      to: user.email,
      subject: 'Verify your email address',
      html: `
        <h1>Welcome to PTiLMS!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>This link will expire in 24 hours.</p>
      `
    });
  }

  async _queuePasswordResetEmail(user, token) {
    const resetUrl = `${config.appBaseUrl}/auth/reset-password/${token}`;
    
    await this.emailQueueService.queueEmail({
      to: user.email,
      subject: 'Reset your password',
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    });
  }

  async _generateTokens(user) {
    const accessToken = jwt.sign(
      { userId: user.id, role: user.role?.name },
      config.jwt.secret,
      { expiresIn: config.jwt.accessExpiry }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry }
    );

    return { accessToken, refreshToken };
  }

  async _updateRefreshToken(userId, token) {
    const hashedToken = await this.userRepository.hashToken(token);
    await this.cacheService.set(
      `refreshToken:${userId}`,
      hashedToken,
      parseInt(config.jwt.refreshExpiry) * 1000
    );
  }

  async _verifyRefreshToken(userId, token) {
    const hashedToken = await this.cacheService.get(`refreshToken:${userId}`);
    return hashedToken && await this.userRepository.verifyToken(token, hashedToken);
  }

  _isTokenValid(expiryDate) {
    return expiryDate && new Date() < new Date(expiryDate);
  }
}

export default AuthController;