// ptilms-api/controllers/userController.js
import {
  UserNotFoundError,
  BadRequestError,
  ValidationError,
  InvalidCredentialsError,
} from '../utils/errors.js';
import { error as _error } from '../utils/logger.js';
import validator from 'validator';

class UserController {
  constructor({ userService }) {
    this.userService = userService;
  }

  async getAllUsers(req, res, next) {
    try {
      const users = await this.userService.getAllUsers(); 
      res.status(200).json({ success: true, data: { users } });
    } catch (error) {
      _error(`Error in getAllUsers: ${error.message}`);
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;
      // Validate userId format
      if (!validator.isUUID(userId)) {
        throw new ValidationError([{ field: 'userId', message: 'Invalid userId format' }]);
      }
      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new UserNotFoundError();
      }
      res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      _error(`Error in getUserById: ${error.message}`);
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { userId } = req.params;
      // Validate userId format
      if (!validator.isUUID(userId)) {
        throw new ValidationError([{ field: 'userId', message: 'Invalid userId format' }]);
      }
      const updatedUser = await this.userService.updateUser(userId, req.body);
      if (!updatedUser) {
        throw new UserNotFoundError();
      }
      res.status(200).json({ success: true, data: { user: updatedUser } });
    } catch (error) {
      _error(`Error in updateUser: ${error.message}`);
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { userEmail } = req.params; // Changed from userId to userEmail
      const { currentPassword, newPassword } = req.body;
      // No need to validate as email is validated in routes
      if (!currentPassword || !newPassword) {
        throw new BadRequestError('Current password and new password are required');
      }
      // Validate password length (you can keep this here or move to routes)
      if (!validator.isLength(newPassword, { min: 8 })) {
        throw new ValidationError([{ field: 'newPassword', message: 'Password must be at least 8 characters long' }]);
      }
      const user = await this.userService.changePassword(userEmail, currentPassword, newPassword); // Pass userEmail
      if (!user) {
        throw new InvalidCredentialsError();
      }
      res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      _error(`Error in changePassword: ${error.message}`);
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;
      // Validate userId format
      if (!validator.isUUID(userId)) {
        throw new ValidationError([{ field: 'userId', message: 'Invalid userId format' }]);
      }
      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new UserNotFoundError();
      }
      await this.userService.deleteUser(userId);
      res.status(204).send();
    } catch (error) {
      _error(`Error in deleteUser: ${error.message}`);
      next(error);
    }
  }
  async getModifiedUsers(req, res, next) {
    try {
      const { since } = req.query;
      const modifiedUsers = await this.userService.getModifiedUsers(since);
      res.status(200).json({ success: true, data: { users: modifiedUsers } });
    } catch (error) {
      _error(`Error in getModifiedUsers: ${error.message}`);
      next(error);
    }
  }
}

export default UserController;