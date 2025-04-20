// ptilms-api/repositories/RoleRepository.js
import { error as _error } from '../utils/logger.js';

class RoleRepository {
  constructor({ Role, sequelize }) {
    this.roleModel = Role;
    this.sequelize = sequelize;
  }

  async getAllRoles() {
    try {
      return await this.roleModel.findAll({
        order: [['name', 'ASC']]
      });
    } catch (error) {
      _error(`Error in getAllRoles: ${error.message}`);
      throw error;
    }
  }

  async getRoleById(id) {
    try {
      return await this.roleModel.findByPk(id);
    } catch (error) {
      _error(`Error in getRoleById: ${error.message}`);
      throw error;
    }
  }

  async getRoleByName(name) {
    try {
      return await this.roleModel.findOne({
        where: { name }
      });
    } catch (error) {
      _error(`Error in getRoleByName: ${error.message}`);
      throw error;
    }
  }

  async createRole(data, transaction) {
    try {
      return await this.roleModel.create(data, { transaction });
    } catch (error) {
      _error(`Error in createRole: ${error.message}`);
      throw error;
    }
  }

  async updateRole(id, data, transaction) {
    try {
      const role = await this.roleModel.findByPk(id);
      if (!role) return null;
      return await role.update(data, { transaction });
    } catch (error) {
      _error(`Error in updateRole: ${error.message}`);
      throw error;
    }
  }

  async deleteRole(id, transaction) {
    try {
      const role = await this.roleModel.findByPk(id);
      if (!role) return false;
      await role.destroy({ transaction });
      return true;
    } catch (error) {
      _error(`Error in deleteRole: ${error.message}`);
      throw error;
    }
  }

  async getRolesByPermissionId(permissionId) {
    try {
      return await this.roleModel.findAll({
        include: [{
          model: this.sequelize.models.Permission,
          as: 'permissions',
          where: { id: permissionId },
          through: { attributes: [] } // Exclude junction table attributes
        }],
        order: [['name', 'ASC']]
      });
    } catch (error) {
      _error(`Error in getRolesByPermissionId: ${error.message}`);
      throw error;
    }
  }
}

export default RoleRepository;