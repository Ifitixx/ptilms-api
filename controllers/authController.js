// ptilms-api/controllers/authController.js
import {
  BadRequestError,
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  ValidationError,
  UserNotFoundError,
  UnauthorizedError
} from '../utils/errors.js';
import logger from '../utils/logger.js';
import validator from 'validator';

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
      // Validate email format
      if (!validator.isEmail(email)) {
        throw new ValidationError([{ field: 'email', message: 'Invalid email format' }]);
      }
      // Validate password length
      if (!validator.isLength(password, { min: 8 })) {
        throw new ValidationError([{ field: 'password', message: 'Password must be at least 8 characters long' }]);
      }
      // Check if email already exists
      const userExists = await this.authService.checkEmailExists(email);
      if (userExists) {
        throw new EmailAlreadyExistsError();
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
      // Validate email format
      if (!validator.isEmail(email)) {
        throw new ValidationError([{ field: 'email', message: 'Invalid email format' }]);
      }
      const tokens = await this.authService.login(email, password);
      res.status(200).json({ success: true, data: tokens });
    } catch (error) {
      if (error.message === 'Invalid credentials') {
        next(new InvalidCredentialsError());
      } else if (error.message === 'User not found') {
        next(new UserNotFoundError());
      } else if (error.message === 'User is not verified') {
        next(new UnauthorizedError('Please verify your email before logging in.')); // Specific error for unverified users
      } else {
        logger.error(`Error in loginUser: ${error.message}`);
        next(error);
      }
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new ValidationError([{ field: 'refreshToken', message: 'Refresh token is required' }]);
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
      // Validate email format
      if (!validator.isEmail(email)) {
        throw new ValidationError([{ field: 'email', message: 'Invalid email format' }]);
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
      // Validate password length
      if (!validator.isLength(newPassword, { min: 8 })) {
        throw new ValidationError([{ field: 'newPassword', message: 'Password must be at least 8 characters long' }]);
      }
      await this.authService.resetPassword(token, newPassword);
      res.status(200).json({ success: true, message: 'Password has been reset.' });
    } catch (error) {
      logger.error(`Error in resetPassword: ${error.message}`);
      next(error);
    }
  }

  async verifyUser(req, res, next) {
    try {
      const { token } = req.params;
      if (!token) {
        throw new BadRequestError('Verification token is required');
      }
      await this.authService.verifyUser(token);
      // Always return a JSON response
      return res.status(200).json({ success: true, message: 'User has been verified.' });
    } catch (error) {
      logger.error(`Error in verifyUser: ${error.message}`);
      // Always return a JSON error response
      let errorMessage = 'Verification failed. Please try again or contact support.'; // Default message
      if (error instanceof UnauthorizedError) {
        errorMessage = error.message; // Use specific error message if available
      }
      return res.status(400).json({ success: false, error: { message: errorMessage } }); // Changed to 400 for bad request
    }
  }
}

export default AuthController;