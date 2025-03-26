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
        const { rolePermissionId } = req.params;
        // Validate rolePermissionId format
        if (!validator.isUUID(rolePermissionId)) {
          throw new ValidationError([{ field: 'rolePermissionId', message: 'Invalid rolePermissionId format' }]);
        }
        const rolePermission = await this.rolePermissionService.getRolePermissionById(rolePermissionId);
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
        const { rolePermissionId } = req.params;
        // Validate rolePermissionId format
      if (!validator.isUUID(rolePermissionId)) {
        throw new ValidationError([{ field: 'rolePermissionId', message: 'Invalid rolePermissionId format' }]);
      }
      const rolePermission = await this.rolePermissionService.updateRolePermission(rolePermissionId, req.body);
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
      const { rolePermissionId } = req.params;
      // Validate rolePermissionId format
      if (!validator.isUUID(rolePermissionId)) {
        throw new ValidationError([{ field: 'rolePermissionId', message: 'Invalid rolePermissionId format' }]);
      }
      const rolePermission = await this.rolePermissionService.getRolePermissionById(rolePermissionId);
      if (!rolePermission) {
        throw new RolePermissionNotFoundError();
      }
      await this.rolePermissionService.deleteRolePermission(rolePermissionId);
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