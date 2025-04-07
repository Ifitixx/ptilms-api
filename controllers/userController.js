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
      const includeDeleted = req.query.includeDeleted === 'true';  // Check for query parameter
      const users = await this.userService.getAllUsers(includeDeleted);  // Pass parameter to service
      res.status(200).json({ success: true, data: { users } });
    } catch (error) {
      _error(`Error in getAllUsers: ${error.message}`);
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;
      const includeDeleted = req.query.includeDeleted === 'true'; // Check for query parameter
      // Validate userId format
      if (!validator.isUUID(userId)) {
        throw new ValidationError([{ field: 'userId', message: 'Invalid userId format' }]);
      }
      const user = await this.userService.getUserById(userId, includeDeleted); // Pass parameter to service
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
      const { userId } = req.params; // Changed to userId
      const { currentPassword, newPassword } = req.body;
      // Validate userId format
      if (!validator.isUUID(userId)) {
        throw new ValidationError([{ field: 'userId', message: 'Invalid userId format' }]);
      }
      if (!currentPassword || !newPassword) {
        throw new BadRequestError('Current password and new password are required');
      }
      if (!validator.isLength(newPassword, { min: 8 })) {
        throw new ValidationError([{ field: 'newPassword', message: 'Password must be at least 8 characters long' }]);
      }
      const success = await this.userService.changePassword(userId, currentPassword, newPassword); // Pass userId
      if (!success) {
        throw new InvalidCredentialsError();
      }
      res.status(200).json({
        success: true,
        message: 'Password changed successfully.', // Updated message
      });
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
      await this.userService.deleteUser(userId);
      res.status(204).send();
    } catch (error) {
      _error(`Error in deleteUser: ${error.message}`);
      next(error);
    }
  }

  async getModifiedUsers(req, res, next) {
    console.log('UserController.getModifiedUsers - Request:', {
      method: req.method,
      url: req.url,
      path: req.path,
      params: req.params,
      query: req.query,
    });
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