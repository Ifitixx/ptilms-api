// ptilms-api/services/RoleService.js
import { info, error as _error } from '../utils/logger.js';
import { NotFoundError } from '../utils/errors.js';
import { ROLES } from '../config/constants.mjs';

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

  async getRoleByName(name) {
    try {
      return await this.roleRepository.getRoleByName(name);
    } catch (error) {
      _error(`Error in getRoleByName: ${error.message}`);
      throw error;
    }
  }

  async createRole(data) {
    const transaction = await this.roleRepository.sequelize.transaction();
    try {
      info('Starting transaction for createRole');
      const role = await this.roleRepository.createRole(data, transaction);
      info('Committing transaction');
      await transaction.commit();
      return role;
    } catch (error) {
      _error(`Error in createRole: ${error.message}`);
      info('Rolling back transaction');
      await transaction.rollback();
      throw error;
    }
  }

  async createDefaultRoles() {
    try {
      info('Starting default roles check/creation');
      
      const defaultRoles = [
        {
          name: ROLES.ADMIN,
          description: 'System administrator with full access to all features'
        },
        {
          name: ROLES.LECTURER,
          description: 'Lecturer with access to course management and teaching features'
        },
        {
          name: ROLES.STUDENT,
          description: 'Student with access to learning and course participation features'
        }
      ];

      // Check if roles already exist
      const existingRoles = await this.roleRepository.getAllRoles();
      if (existingRoles.length === 0) {
        // Create each role individually in a transaction
        const createdRoles = [];
        for (const roleData of defaultRoles) {
          const role = await this.createRole(roleData);
          createdRoles.push(role);
        }
        info('Default roles created successfully');
        return createdRoles;
      }

      info('Default roles already exist, skipping creation');
      return existingRoles;
    } catch (error) {
      _error(`Error in createDefaultRoles: ${error.message}`);
      throw error;
    }
  }

  async updateRole(id, data) {
    const transaction = await this.roleRepository.sequelize.transaction();
    try {
      info('Starting transaction for updateRole');
      const role = await this.roleRepository.updateRole(id, data, transaction);
      if (!role) {
        throw new NotFoundError('Role not found');
      }
      info('Committing transaction');
      await transaction.commit();
      return role;
    } catch (error) {
      _error(`Error in updateRole: ${error.message}`);
      info('Rolling back transaction');
      await transaction.rollback();
      throw error;
    }
  }

  async deleteRole(id) {
    const transaction = await this.roleRepository.sequelize.transaction();
    try {
      info('Starting transaction for deleteRole');
      const success = await this.roleRepository.deleteRole(id, transaction);
      if (!success) {
        throw new NotFoundError('Role not found');
      }
      info('Committing transaction');
      await transaction.commit();
    } catch (error) {
      _error(`Error in deleteRole: ${error.message}`);
      info('Rolling back transaction');
      await transaction.rollback();
      throw error;
    }
  }

  async getRolesByPermissionId(permissionId) {
    try {
      const roles = await this.roleRepository.getRolesByPermissionId(permissionId);
      info(`Retrieved roles for permission ID: ${permissionId}`);
      return roles;
    } catch (error) {
      _error(`Error in getRolesByPermissionId: ${error.message}`);
      throw error;
    }
  }
}

export default RoleService;