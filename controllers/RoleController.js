// ptilms-api/controllers/RoleController.js
import {
    RoleNotFoundError,
    BadRequestError,
    ValidationError,
  } from '../utils/errors.js';
  import validator from 'validator';
  
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
        // Validate roleId format
        if (!validator.isUUID(id)) {
          throw new ValidationError([{ field: 'roleId', message: 'Invalid roleId format' }]);
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
        const role = await this.roleService.createRole(req.body);
        res.status(201).json(role);
      } catch (error) {
        next(error);
      }
    }
  
    async updateRole(req, res, next) {
      try {
        const { id } = req.params;
        // Validate roleId format
        if (!validator.isUUID(id)) {
          throw new ValidationError([{ field: 'roleId', message: 'Invalid roleId format' }]);
        }
        const role = await this.roleService.updateRole(id, req.body);
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
        // Validate roleId format
        if (!validator.isUUID(id)) {
          throw new ValidationError([{ field: 'roleId', message: 'Invalid roleId format' }]);
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
  }
  
  export default RoleController;