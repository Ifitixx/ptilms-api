// ptilms-api/controllers/RolePermissionController.js
import {
  RolePermissionNotFoundError,
  BadRequestError,
  ValidationError,
} from '../utils/errors.js';
import validator from 'validator';

class RolePermissionController {
  constructor({ rolePermissionService }) {
    this.rolePermissionService = rolePermissionService;
  }

  async getAllRolePermissions(req, res, next) {
    try {
      const rolePermissions = await this.rolePermissionService.getAllRolePermissions();
      res.json(rolePermissions);
    } catch (error) {
      next(error);
    }
  }

  async getRolePermissionById(req, res, next) {
    try {
      const { id } = req.params; // Changed from rolePermissionId to id
      // Validate id format
      if (!validator.isUUID(id)) {
        throw new ValidationError([{ field: 'id', message: 'Invalid id format' }]); // Changed field name
      }
      const rolePermission = await this.rolePermissionService.getRolePermissionById(id); // Changed parameter name
      if (!rolePermission) {
        throw new RolePermissionNotFoundError();
      }
      res.json(rolePermission);
    } catch (error) {
      next(error);
    }
  }

  async createRolePermission(req, res, next) {
    try {
      const { roleId, permissionId } = req.body;
      if (!roleId || !permissionId) {
        throw new BadRequestError('RoleId and permissionId are required');
      }
      // Validate roleId format
      if (!validator.isUUID(roleId)) {
        throw new ValidationError([{ field: 'roleId', message: 'Invalid roleId format' }]);
      }
      // Validate permissionId format
      if (!validator.isUUID(permissionId)) {
        throw new ValidationError([{ field: 'permissionId', message: 'Invalid permissionId format' }]);
      }
      const rolePermission = await this.rolePermissionService.createRolePermission(req.body);
      res.status(201).json(rolePermission);
    } catch (error) {
      next(error);
    }
  }

  async updateRolePermission(req, res, next) {
    try {
      const { id } = req.params; // Changed from rolePermissionId to id
      // Validate id format
      if (!validator.isUUID(id)) {
        throw new ValidationError([{ field: 'id', message: 'Invalid id format' }]); // Changed field name
      }
      const { roleId, permissionId } = req.body; // Extract roleId and permissionId from body
      if (!roleId || !permissionId) {
        throw new BadRequestError('RoleId and permissionId are required for update');
      }
      // Validate roleId format
      if (!validator.isUUID(roleId)) {
        throw new ValidationError([{ field: 'roleId', message: 'Invalid roleId format' }]);
      }
      // Validate permissionId format
      if (!validator.isUUID(permissionId)) {
        throw new ValidationError([{ field: 'permissionId', message: 'Invalid permissionId format' }]);
      }
      const rolePermission = await this.rolePermissionService.updateRolePermission(id, { roleId, permissionId }); // Pass as object, changed parameter name
      if (!rolePermission) {
        throw new RolePermissionNotFoundError();
      }
      res.json(rolePermission);
    } catch (error) {
      next(error);
    }
  }

  async deleteRolePermission(req, res, next) {
    try {
      const { id } = req.params; // Changed from rolePermissionId to id
      // Validate id format
      if (!validator.isUUID(id)) {
        throw new ValidationError([{ field: 'id', message: 'Invalid id format' }]); // Changed field name
      }
      const rolePermission = await this.rolePermissionService.getRolePermissionById(id); // Changed parameter name
      if (!rolePermission) {
        throw new RolePermissionNotFoundError();
      }
      await this.rolePermissionService.deleteRolePermission(id); // Changed parameter name
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getRolePermissionsByRoleId(req, res, next) {
    try {
      const { roleId } = req.params;
      // Validate roleId format
      if (!validator.isUUID(roleId)) {
        throw new ValidationError([{ field: 'roleId', message: 'Invalid roleId format' }]);
      }
      const rolePermissions = await this.rolePermissionService.getRolePermissionsByRoleId(roleId);
      res.json(rolePermissions);
    } catch (error) {
      next(error);
    }
  }

  async getRolePermissionsByPermissionId(req, res, next) {
    try {
      const { permissionId } = req.params;
      // Validate permissionId format
      if (!validator.isUUID(permissionId)) {
        throw new ValidationError([{ field: 'permissionId', message: 'Invalid permissionId format' }]);
      }
      const rolePermissions = await this.rolePermissionService.getRolePermissionsByPermissionId(permissionId);
      res.json(rolePermissions);
    } catch (error) {
      next(error);
    }
  }
}

export default RolePermissionController;