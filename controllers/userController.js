// ptilms-api/controllers/userController.js
import {
  UserNotFoundError,
  BadRequestError,
  ValidationError,
  InvalidCredentialsError,
  NotFoundError,
} from '../utils/errors.js';
import { error as _error } from '../utils/logger.js';
import validator from 'validator';
import CacheService from '../services/cacheService.js';

class UserController {
  constructor({ userService }) {
    this.userService = userService;
    this.cacheService = new CacheService();
  }

  async getAllUsers(req, res, next) {
    try {
      const includeDeleted = req.query.includeDeleted === 'true';
      const users = await this.userService.getAllUsers(includeDeleted);
      res.status(200).json({ success: true, data: { users } });
    } catch (error) {
      _error(`Error in getAllUsers: ${error.message}`);
      next(error);
    }
  }

  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;
      const includeDeleted = req.query.includeDeleted === 'true';
      if (!validator.isUUID(userId)) {
        throw new ValidationError([{ field: 'userId', message: 'Invalid userId format' }]);
      }
      const cacheKey = this.cacheService.generateKey(CacheService.CACHE_KEYS.USER, userId);

      const cachedData = await this.cacheService.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const user = await this.userService.getUserById(userId, includeDeleted);
      if (!user) {
        throw new UserNotFoundError();
      }

      await this.cacheService.set(cacheKey, user, 1800);

      res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      _error(`Error in getUserById: ${error.message}`);
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { userId } = req.params;
      if (!validator.isUUID(userId)) {
        throw new ValidationError([{ field: 'userId', message: 'Invalid userId format' }]);
      }
      const updatedUser = await this.userService.updateUser(userId, req.body);
      if (!updatedUser) {
        throw new UserNotFoundError();
      }

      await this.cacheService.del(this.cacheService.generateKey(CacheService.CACHE_KEYS.USER, userId));
      await this.cacheService.invalidatePattern(`${CacheService.CACHE_KEYS.USER}:all:*`);

      res.status(200).json({ success: true, data: { user: updatedUser } });
    } catch (error) {
      _error(`Error in updateUser: ${error.message}`);
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { userId } = req.params;
      const { currentPassword, newPassword } = req.body;
      if (!validator.isUUID(userId)) {
        throw new ValidationError([{ field: 'userId', message: 'Invalid userId format' }]);
      }
      if (!currentPassword || !newPassword) {
        throw new BadRequestError('Current password and new password are required');
      }
      if (!validator.isLength(newPassword, { min: 8 })) {
        throw new ValidationError([{ field: 'newPassword', message: 'Password must be at least 8 characters long' }]);
      }
      const success = await this.userService.changePassword(userId, currentPassword, newPassword);
      if (!success) {
        throw new InvalidCredentialsError();
      }

      await this.cacheService.del(this.cacheService.generateKey(CacheService.CACHE_KEYS.USER, userId));

      res.status(200).json({
        success: true,
        message: 'Password changed successfully.',
      });
    } catch (error) {
      _error(`Error in changePassword: ${error.message}`);
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;
      if (!validator.isUUID(userId)) {
        throw new ValidationError([{ field: 'userId', message: 'Invalid userId format' }]);
      }
      await this.userService.deleteUser(userId);

      await this.cacheService.del(this.cacheService.generateKey(CacheService.CACHE_KEYS.USER, userId));
      await this.cacheService.invalidatePattern(`${CacheService.CACHE_KEYS.USER}:all:*`);

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

  async getCurrentUser(req, res, next) {
    try {
      const userId = req.user.userId;
      const cacheKey = this.cacheService.generateKey(CacheService.CACHE_KEYS.USER, `current:${userId}`);

      const cachedData = await this.cacheService.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }

      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      await this.cacheService.set(cacheKey, user, 900);

      res.json(user);
    } catch (error) {
      next(error);
    }
  }
}

export default UserController;