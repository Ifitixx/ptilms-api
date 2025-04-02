// ptilms-api/services/UserService.js
import { NotFoundError, UnauthorizedError } from '../utils/errors.js';
import { error as _error } from '../utils/logger.js';

class UserService {
  constructor({ userRepository }) {
    this.userRepository = userRepository;
  }

  async getAllUsers() {
    try {
      return await this.userRepository.getAllUsers();
    } catch (error) {
      _error(`Error in getAllUsers: ${error.message}`);
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      const user = await this.userRepository.getUserById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }
      return user;
    } catch (error) {
      _error(`Error in getUserById: ${error.message}`);
      throw error;
    }
  }

  async updateUser(userId, userData) {
    try {
      const user = await this.userRepository.updateUser(userId, userData);
      if (!user) {
        throw new NotFoundError('User not found');
      }
      return user;
    } catch (error) {
      _error(`Error in updateUser: ${error.message}`);
      throw error;
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    console.log(`changePassword called with: userId=${userId}, currentPassword=${currentPassword}, newPassword=${newPassword}`);
    try {
      // Changed this line to getUserByEmail
      const user = await this.userRepository.getUserByEmail(userId); 
      if (!user) {
        throw new NotFoundError('User not found');
      }
      const isPasswordValid = await user.verifyPassword(currentPassword);
      if (!isPasswordValid) {
        throw new UnauthorizedError('Invalid current password');
      }
      // Changed this line to use the user's ID
      await this.userRepository.updateUser(user.id, { password: newPassword }); 
    } catch (error) {
      _error(`Error in changePassword: ${error.message}`);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      const success = await this.userRepository.deleteUser(userId);
      if (!success) {
        throw new NotFoundError('User not found');
      }
    } catch (error) {
      _error(`Error in deleteUser: ${error.message}`);
      throw error;
    }
  }

  async getModifiedUsers(since) {
    try {
      return await this.userRepository.getModifiedUsers(since);
    } catch (error) {
      _error(`Error in getModifiedUsers: ${error.message}`);
      throw error;
    }
  }
}

export default UserService;