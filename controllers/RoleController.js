// ptilms-api/controllers/RoleController.js
import {
  RoleNotFoundError,
  BadRequestError,
  ValidationError,
} from '../utils/errors.js';
import validator from 'validator';
import { ROLES } from '../config/constants.mjs';

class RoleController {
  constructor({ roleService }) {
    this.roleService = roleService;
  }

  async getAllRoles(req, res, next) {
    try {
      const roles = await this.roleService.getAllRoles();
      res.json(roles);
    } catch (error) {
      next(error);
    }
  }

  async getRoleById(req, res, next) {
    try {
      const { id } = req.params;
      if (!validator.isUUID(id)) {
        throw new ValidationError([{ field: 'id', message: 'Invalid role ID format' }]);
      }
      const role = await this.roleService.getRoleById(id);
      if (!role) {
        throw new RoleNotFoundError();
      }
      res.json(role);
    } catch (error) {
      next(error);
    }
  }

  async createRole(req, res, next) {
    try {
      const { name, description } = req.body;
      if (!name || !description) {
        throw new BadRequestError('Name and description are required');
      }

      // Validate role name
      if (!Object.values(ROLES).includes(name)) {
        throw new ValidationError([{ field: 'name', message: 'Invalid role name' }]);
      }

      const role = await this.roleService.createRole({
        name,
        description
      });

      res.status(201).json(role);
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      if (!validator.isUUID(id)) {
        throw new ValidationError([{ field: 'id', message: 'Invalid role ID format' }]);
      }

      // If name is provided, validate it
      if (name && !Object.values(ROLES).includes(name)) {
        throw new ValidationError([{ field: 'name', message: 'Invalid role name' }]);
      }

      const role = await this.roleService.updateRole(id, {
        ...(name && { name }),
        ...(description && { description })
      });

      if (!role) {
        throw new RoleNotFoundError();
      }

      res.json(role);
    } catch (error) {
      next(error);
    }
  }

  async deleteRole(req, res, next) {
    try {
      const { id } = req.params;
      if (!validator.isUUID(id)) {
        throw new ValidationError([{ field: 'id', message: 'Invalid role ID format' }]);
      }
      const role = await this.roleService.getRoleById(id);
      if (!role) {
        throw new RoleNotFoundError();
      }
      await this.roleService.deleteRole(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getRolesByPermissionId(req, res, next) {
    try {
      const { permissionId } = req.params;
      if (!validator.isUUID(permissionId)) {
        throw new ValidationError([{ field: 'permissionId', message: 'Invalid permission ID format' }]);
      }
      const roles = await this.roleService.getRolesByPermissionId(permissionId);
      res.json(roles);
    } catch (error) {
      next(error);
    }
  }
}

export default RoleController;