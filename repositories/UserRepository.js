// ptilms-api/repositories/UserRepository.js
import { Op } from 'sequelize';
import { error as _error } from '../utils/logger.js';

class UserRepository {
  constructor(models) { // Changed to receive models
    this.userModel = models.User;
    this.roleModel = models.Role;
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

  async getUserById(id) {
    try {
      return await this.userModel.findByPk(id, {
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
      return await this.userModel.findOne({ where: { verificationToken } });
    } catch (error) {
      _error(`Error in getUserByVerificationToken: ${error.message}`);
      throw error;
    }
  }

  async createUser(data) {
    try {
      return await this.userModel.create(data);
    } catch (error) {
      _error(`Error in createUser: ${error.message}`);
      throw error;
    }
  }

  async updateUser(id, data) {
    try {
      const [updatedRows] = await this.userModel.update(data, {
        where: { id },
      });
      if (updatedRows === 0) {
        return null; // No user found with the given ID
      }
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
      await user.destroy();
      return true;
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
          updatedAt: {
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