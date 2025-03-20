// ptilms-api/controllers/userController.js
const logger = require('../utils/logger');

class UserController {
  constructor({ userService }) {
    this.userService = userService;
  }

  async getUserById(req, res, next) {
    try {
      const { userId } = req.params;
      const user = await this.userService.getUserById(userId);
      res.status(200).json({ success: true, data: { user } });
    } catch (error) {
      logger.error(`Error in getUserById: ${error.message}`);
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const { userId } = req.params;
      const updatedUser = await this.userService.updateUser(userId, req.body);
      res.status(200).json({ success: true, data: { user: updatedUser } });
    } catch (error) {
      logger.error(`Error in updateUser: ${error.message}`);
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { userId } = req.params;
      const { currentPassword, newPassword } = req.body;
      await this.userService.changePassword(userId, currentPassword, newPassword);
      res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      logger.error(`Error in changePassword: ${error.message}`);
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { userId } = req.params;
      await this.userService.deleteUser(userId);
      res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      logger.error(`Error in deleteUser: ${error.message}`);
      next(error);
    }
  }

  async getModifiedUsers(req, res, next) {
    try {
      const { since } = req.query;
      const users = await this.userService.getModifiedUsers(since);
      res.status(200).json({ success: true, data: { users } });
    } catch (error) {
      logger.error(`Error in getModifiedUsers: ${error.message}`);
      next(error);
    }
  }
}

module.exports = UserController;