// ptilms-api/controllers/PermissionController.js
import {
    PermissionNotFoundError,
    BadRequestError,
    ValidationError,
  } from '../utils/errors.js';
  import validator from 'validator';
  
  class PermissionController {
    constructor({ permissionService }) {
      this.permissionService = permissionService;
    }
  
    async getAllPermissions(req, res, next) {
      try {
        const permissions = await this.permissionService.getAllPermissions();
        res.json(permissions);
      } catch (error) {
        next(error);
      }
    }
  
    async getPermissionById(req, res, next) {
      try {
        const { permissionId } = req.params;
        // Validate permissionId format
        if (!validator.isUUID(permissionId)) {
          throw new ValidationError([{ field: 'permissionId', message: 'Invalid permissionId format' }]);
        }
        const permission = await this.permissionService.getPermissionById(permissionId);
        if (!permission) {
          throw new PermissionNotFoundError();
        }
        res.json(permission);
      } catch (error) {
        next(error);
      }
    }
  
    async createPermission(req, res, next) {
      try {
        const { name, description } = req.body;
        if (!name || !description) {
          throw new BadRequestError('Name and description are required');
        }
        const permission = await this.permissionService.createPermission(req.body);
        res.status(201).json(permission);
      } catch (error) {
        next(error);
      }
    }
  
    async updatePermission(req, res, next) {
      try {
        const { permissionId } = req.params;
        // Validate permissionId format
        if (!validator.isUUID(permissionId)) {
          throw new ValidationError([{ field: 'permissionId', message: 'Invalid permissionId format' }]);
        }
        const permission = await this.permissionService.updatePermission(permissionId, req.body);
        if (!permission) {
          throw new PermissionNotFoundError();
        }
        res.json(permission);
      } catch (error) {
        next(error);
      }
    }
  
    async deletePermission(req, res, next) {
      try {
        const { permissionId } = req.params;
        // Validate permissionId format
        if (!validator.isUUID(permissionId)) {
          throw new ValidationError([{ field: 'permissionId', message: 'Invalid permissionId format' }]);
        }
        const permission = await this.permissionService.getPermissionById(permissionId);
        if (!permission) {
          throw new PermissionNotFoundError();
        }
        await this.permissionService.deletePermission(permissionId);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    }
  }
  
  export default PermissionController;