// ptilms-api/services/PermissionService.js
import { NotFoundError } from '../utils/errors.js';
import { error as _error } from '../utils/logger.js';

class PermissionService {
  constructor({ permissionRepository }) {
    this.permissionRepository = permissionRepository;
  }

  async getAllPermissions() {
    try {
      return await this.permissionRepository.getAllPermissions();
    } catch (error) {
      _error(`Error in getAllPermissions: ${error.message}`);
      throw error;
    }
  }

  async getPermissionById(id) {
    try {
      const permission = await this.permissionRepository.getPermissionById(id);
      if (!permission) {
        throw new NotFoundError('Permission not found');
      }
      return permission;
    } catch (error) {
      _error(`Error in getPermissionById: ${error.message}`);
      throw error;
    }
  }

  async createPermission(data) {
    try {
      return await this.permissionRepository.createPermission(data);
    } catch (error) {
      _error(`Error in createPermission: ${error.message}`);
      throw error;
    }
  }

  async updatePermission(id, data) {
    try {
      const permission = await this.permissionRepository.updatePermission(id, data);
      if (!permission) {
        throw new NotFoundError('Permission not found');
      }
      return permission;
    } catch (error) {
      _error(`Error in updatePermission: ${error.message}`);
      throw error;
    }
  }

  async deletePermission(id) {
    try {
      const success = await this.permissionRepository.deletePermission(id);
      if (!success) {
        throw new NotFoundError('Permission not found');
      }
    } catch (error) {
      _error(`Error in deletePermission: ${error.message}`);
      throw error;
    }
  }
}

export default PermissionService;