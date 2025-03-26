// ptilms-api/services/RoleService.js
import { NotFoundError } from '../utils/errors.js';
import { error as _error } from '../utils/logger.js';

class RoleService {
  constructor({ roleRepository }) {
    this.roleRepository = roleRepository;
  }

  async getAllRoles() {
    try {
      return await this.roleRepository.getAllRoles();
    } catch (error) {
      _error(`Error in getAllRoles: ${error.message}`);
      throw error;
    }
  }

  async getRoleById(id) {
    try {
      const role = await this.roleRepository.getRoleById(id);
      if (!role) {
        throw new NotFoundError('Role not found');
      }
      return role;
    } catch (error) {
      _error(`Error in getRoleById: ${error.message}`);
      throw error;
    }
  }

  async createRole(data) {
    try {
      return await this.roleRepository.createRole(data);
    } catch (error) {
      _error(`Error in createRole: ${error.message}`);
      throw error;
    }
  }

  async updateRole(id, data) {
    try {
      const role = await this.roleRepository.updateRole(id, data);
      if (!role) {
        throw new NotFoundError('Role not found');
      }
      return role;
    } catch (error) {
      _error(`Error in updateRole: ${error.message}`);
      throw error;
    }
  }

  async deleteRole(id) {
    try {
      const success = await this.roleRepository.deleteRole(id);
      if (!success) {
        throw new NotFoundError('Role not found');
      }
    } catch (error) {
      _error(`Error in deleteRole: ${error.message}`);
      throw error;
    }
  }
}

export default RoleService;