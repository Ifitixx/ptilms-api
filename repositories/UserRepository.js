// ptilms-api/repositories/UserRepository.js
import { Op } from 'sequelize';
import { error as _error } from '../utils/logger.js';
import bcrypt from 'bcrypt';

class UserRepository {
  constructor({User, Role}) { 
    this.userModel = User;
    this.roleModel = Role;
  }

  async getAllUsers(includeDeleted = false) {  // Added includeDeleted parameter
    try {
      const options = {
        include: {
          model: this.roleModel,
          as: 'role',
        },
      };
      if (includeDeleted) {  // Only apply scope if including deleted records
        options.scope = 'withDeleted';  // Use scope to include soft-deleted records
      }
      return await this.userModel.findAll(options);
    } catch (error) {
      _error(`Error in getAllUsers: ${error.message}`);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      return await this.userModel.scope('withSensitive').findOne({
        where: { email },
        include: {
          model: this.roleModel,
          as: 'role',
        },
      });
    } catch (error) {
      _error(`Error in getUserByEmail: ${error.message}`);
      throw error;
    }
  }

  async getUserByUsername(username) {
    try {
      return await this.userModel.findOne({ where: { username } });
    } catch (error) {
      _error(`Error in getUserByUsername: ${error.message}`);
      throw error;
    }
  }

  async getUserById(id, includeDeleted = false) {
    try {
      let query = this.userModel.scope('withSensitive'); // Apply 'withSensitive' scope initially
      if (includeDeleted) {
        query = query.scope('withDeleted'); // Apply 'withDeleted' scope if includeDeleted is true
      }
      return await query.findByPk(id, {
        include: {
          model: this.roleModel,
          as: 'role',
        },
      });
    } catch (error) {
      _error(`Error in getUserById: ${error.message}`);
      throw error;
    }
  }

  async getUserByVerificationToken(verificationToken) {
    try {
      return await this.userModel.findOne({ where: { verification_token: verificationToken } });
    } catch (error) {
      _error(`Error in getUserByVerificationToken: ${error.message}`);
      throw error;
    }
  }

  async createUser(data) {
    try {
      // Generate a random refresh token
      const refreshToken = Math.random().toString(36).slice(2);
      // Hash the refresh token
      const saltRounds = 10; // You can adjust the salt rounds
      const refreshTokenHash = await bcrypt.hash(refreshToken, saltRounds);

      // Add the refreshTokenHash to the user data
      const userData = {
        ...data,
        refreshTokenHash,
      }; return await this.userModel.create(userData);
    } catch (error) {
      _error(`Error in createUser: ${error.message}`);
      throw error;
    }
  }

  async updateUser(id, data) {
    try {
      const user = await this.userModel.findByPk(id);
      if (!user) {
        return null; // No user found with the given ID
      }
      // Update the user's data
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
          user[key] = data[key];
        }
      }
      // Save the updated user - this will trigger the beforeSave hook
      await user.save();
      return await this.getUserById(id); // Return the updated user
    } catch (error) {
      _error(`Error in updateUser: ${error.message}`);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const user = await this.userModel.findByPk(id);
      if (!user) return false;
      await user.destroy(); // Correct: Await the destroy operation
      return true; // Correct: Return true for successful deletion
    } catch (error) {
      _error(`Error in deleteUser: ${error.message}`);
      throw error;
    }
  }

  async findByEmailOrUsername(email, username) {
    try {
      return await this.userModel.findOne({
        where: {
          [Op.or]: [{ email }, { username }],
        },
      });
    } catch (error) {
      _error(`Error in findByEmailOrUsername: ${error.message}`);
      throw error;
    }
  }

  async getModifiedUsers(since) {
    try {
      return await this.userModel.findAll({
        where: {
          updated_at: {
            [Op.gt]: since,
          },
        },
      });
    } catch (error) {
      _error(`Error in getModifiedUsers: ${error.message}`);
      throw error;
    }
  }
}

export default UserRepository;