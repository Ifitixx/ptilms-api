// ptilms-api/services/RolePermissionService.js
import { NotFoundError } from '../utils/errors.js';
import { error as _error } from '../utils/logger.js';

class RolePermissionService {
  constructor({ rolePermissionRepository }) {
    this.rolePermissionRepository = rolePermissionRepository;
  }

  async getAllRolePermissions() {
    try {
      return await this.rolePermissionRepository.getAllRolePermissions();
    } catch (error) {
      _error(`Error in getAllRolePermissions: ${error.message}`);
      throw error;
    }
  }

  async getRolePermissionById(id) {
    try {
      const rolePermission = await this.rolePermissionRepository.getRolePermissionById(id);
      if (!rolePermission) {
        throw new NotFoundError('RolePermission not found');
      }
      return rolePermission;
    } catch (error) {
      _error(`Error in getRolePermissionById: ${error.message}`);
      throw error;
    }
  }

  async createRolePermission(data) {
    try {
      return await this.rolePermissionRepository.createRolePermission(data);
    } catch (error) {
      _error(`Error in createRolePermission: ${error.message}`);
      throw error;
    }
  }

  async updateRolePermission(id, data) {
    try {
      const rolePermission = await this.rolePermissionRepository.updateRolePermission(id, data);
      if (!rolePermission) {
        throw new NotFoundError('RolePermission not found');
      }
      return rolePermission;
    } catch (error) {
      _error(`Error in updateRolePermission: ${error.message}`);
      throw error;
    }
  }

  async deleteRolePermission(id) {
    try {
      const success = await this.rolePermissionRepository.deleteRolePermission(id);
      if (!success) {
        throw new NotFoundError('RolePermission not found');
      }
    } catch (error) {
      _error(`Error in deleteRolePermission: ${error.message}`);
      throw error;
    }
  }
}

export default RolePermissionService;