// ptilms-api/services/RoleService.js
// ptilms-api/services/RoleService.js
import { NotFoundError } from '../utils/errors.js';
import { error as _error } from '../utils/logger.js';
import logger from '../utils/logger.js';

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

  async createDefaultRoles() {
    try {
      const existingRoles = await this.roleRepository.getAllRoles(); // Use the repository
      if (existingRoles.length === 0) {
        const roleNames = ['admin', 'instructor', 'student']; // Or however you get ROLE_NAMES
        await this.roleRepository.bulkCreate(roleNames.map(name => ({ name }))); // Use the repository
        logger.info('Default roles created.'); // Use the imported logger
      } else {
        logger.info('Default roles already exist.'); // Use the imported logger
      }
    } catch (error) {
      logger.error(`Error creating default roles: ${error.message}`); // Use the imported logger
      throw error; // Re-throw the error to propagate it
    }
  }
}

export default RoleService;