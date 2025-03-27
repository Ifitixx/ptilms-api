// ptilms-api/repositories/RoleRepository.js
import { error as _error } from '../utils/logger.js';

class RoleRepository {
  constructor(roleModel) {
    this.roleModel = roleModel;
  }

  async getAllRoles() {
    try {
      return await this.roleModel.findAll();
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
      return await this.roleModel.findOne({ where: { name } });
    } catch (error) {
      _error(`Error in getRoleByName: ${error.message}`);
      throw error;
    }
  }

  async createRole(data) {
    try {
      return await this.roleModel.create(data);
    } catch (error) {
      _error(`Error in createRole: ${error.message}`);
      throw error;
    }
  }

  async updateRole(id, data) {
    try {
      const role = await this.roleModel.findByPk(id);
      if (!role) return null;
      return await role.update(data);
    } catch (error) {
      _error(`Error in updateRole: ${error.message}`);
      throw error;
    }
  }

  async deleteRole(id) {
    try {
      const role = await this.roleModel.findByPk(id);
      if (!role) return false;
      await role.destroy();
      return true;
    } catch (error) {
      _error(`Error in deleteRole: ${error.message}`);
      throw error;
    }
  }
}

export default RoleRepository;