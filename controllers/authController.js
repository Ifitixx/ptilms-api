// ptilms-api/controllers/authController.js
const { BadRequestError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

class AuthController {
  constructor({ authService }) {
    this.authService = authService;
  }

  async registerUser(req, res, next) {
    try {
      const { email, username, password, role } = req.body;
      if (!email || !username || !password || !role) {
        throw new BadRequestError('Email, username, password, and role are required');
      }
      const user = await this.authService.register({ email, username, password, role });
      res.status(201).json({ success: true, data: { user } });
    } catch (error) {
      logger.error(`Error in registerUser: ${error.message}`);
      next(error);
    }
  }

  async loginUser(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new BadRequestError('Email and password are required');
      }
      const tokens = await this.authService.login(email, password);
      res.status(200).json({ success: true, data: tokens });
    } catch (error) {
      logger.error(`Error in loginUser: ${error.message}`);
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new ValidationError('Refresh token is required');
      }
      const tokens = await this.authService.refreshToken(refreshToken);
      res.status(200).json({ success: true, data: tokens });
    } catch (error) {
      logger.error(`Error in refreshToken: ${error.message}`);
      next(error);
    }
  }
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        throw new BadRequestError('Email is required');
      }
      await this.authService.forgotPassword(email);
      res.status(200).json({ success: true, message: 'Password reset email sent.' });
    } catch (error) {
      logger.error(`Error in forgotPassword: ${error.message}`);
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        throw new BadRequestError('Token and new password are required');
      }
      await this.authService.resetPassword(token, newPassword);
      res.status(200).json({ success: true, message: 'Password has been reset.' });
    } catch (error) {
      logger.error(`Error in resetPassword: ${error.message}`);
      next(error);
    }
  }
}

module.exports = AuthController;