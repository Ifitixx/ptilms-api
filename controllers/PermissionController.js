// ptilms-api/controllers/PermissionController.js
// ptilms-api/controllers/PermissionController.js (ensure 'id' fix is applied)
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
      const { id } = req.params; // Changed from permissionId to id
      // Validate permissionId format
      if (!validator.isUUID(id)) { // Changed from permissionId to id
        throw new ValidationError([{ field: 'permissionId', message: 'Invalid permissionId format' }]); // Message remains the same for clarity
      }
      const permission = await this.permissionService.getPermissionById(id); // Changed from permissionId to id
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
      const { name } = req.body; // Removed description
      if (!name) { // Removed description check
        throw new BadRequestError('Name is required'); // Updated message
      }
      const permission = await this.permissionService.createPermission({ name }); // Updated to pass only name
      res.status(201).json(permission);
    } catch (error) {
      next(error);
    }
  }

  async updatePermission(req, res, next) {
    try {
      const { id } = req.params; // Changed from permissionId to id
      // Validate permissionId format
      if (!validator.isUUID(id)) { // Changed from permissionId to id
        throw new ValidationError([{ field: 'permissionId', message: 'Invalid permissionId format' }]); // Message remains the same for clarity
      }
      const { name } = req.body; // Allow only name to be updated
      if (!name) {
        throw new BadRequestError('Name is required for update');
      }
      const permission = await this.permissionService.updatePermission(id, { name }); // Updated to pass only name
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
      const { id } = req.params; // Changed from permissionId to id
      // Validate permissionId format
      if (!validator.isUUID(id)) { // Changed from permissionId to id
        throw new ValidationError([{ field: 'permissionId', message: 'Invalid permissionId format' }]); // Message remains the same for clarity
      }
      const permission = await this.permissionService.getPermissionById(id); // Changed from permissionId to id
      if (!permission) {
        throw new PermissionNotFoundError();
      }
      await this.permissionService.deletePermission(id); // Changed from permissionId to id
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default PermissionController;