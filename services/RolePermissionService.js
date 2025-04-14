// ptilms-api/services/RolePermissionService.js
import { NotFoundError } from '../utils/errors.js';
import { error as _error, info } from '../utils/logger.js'; // Import info

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
    const transaction = await this.rolePermissionRepository.sequelize.transaction(); // Start transaction
    try {
      info('Starting transaction for createRolePermission');
      const rolePermission = await this.rolePermissionRepository.createRolePermission(data, transaction); // Pass transaction
      info('Committing transaction');
      await transaction.commit(); // Commit transaction
      return rolePermission;
    } catch (error) {
      _error(`Error in createRolePermission: ${error.message}`);
      info('Rolling back transaction');
      await transaction.rollback(); // Rollback on error
      throw error;
    }
  }

  async updateRolePermission(id, data) {
    const transaction = await this.rolePermissionRepository.sequelize.transaction(); // Start transaction
    try {
      info(`Starting transaction for updateRolePermission with id: ${id}`);
      const rolePermission = await this.rolePermissionRepository.updateRolePermission(id, data, transaction); // Pass transaction
      if (!rolePermission) {
        throw new NotFoundError('RolePermission not found');
      }
      info('Committing transaction');
      await transaction.commit(); // Commit transaction
      return rolePermission;
    } catch (error) {
      _error(`Error in updateRolePermission: ${error.message}`);
      info('Rolling back transaction');
      await transaction.rollback(); // Rollback on error
      throw error;
    }
  }

  async deleteRolePermission(id) {
    const transaction = await this.rolePermissionRepository.sequelize.transaction(); // Start transaction
    try {
      info(`Starting transaction for deleteRolePermission with id: ${id}`);
      const success = await this.rolePermissionRepository.deleteRolePermission(id, transaction); // Pass transaction
      if (!success) {
        throw new NotFoundError('RolePermission not found');
      }
      info('Committing transaction');
      await transaction.commit(); // Commit transaction
    } catch (error) {
      _error(`Error in deleteRolePermission: ${error.message}`);
      info('Rolling back transaction');
      await transaction.rollback(); // Rollback on error
      throw error;
    }
  }

  async getRolePermissionsByRoleId(roleId) {
    try {
      return await this.rolePermissionRepository.getRolePermissionsByRoleId(roleId);
    } catch (error) {
      _error(`Error in getRolePermissionsByRoleId: ${error.message}`);
      throw error;
    }
  }

  async getRolePermissionsByPermissionId(permissionId) {
    try {
      return await this.rolePermissionRepository.getRolePermissionsByPermissionId(permissionId);
    } catch (error) {
      _error(`Error in getRolePermissionsByPermissionId: ${error.message}`);
      throw error;
    }
  }
}

export default RolePermissionService;