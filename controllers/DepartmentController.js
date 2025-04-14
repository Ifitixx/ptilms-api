// ptilms-api/controllers/DepartmentController.js
import {
    DepartmentNotFoundError,
    BadRequestError,
    ValidationError,
  } from '../utils/errors.js';
  import validator from 'validator';
  
  class DepartmentController {
    constructor({ departmentService }) {
      this.departmentService = departmentService;
    }
  
    async getAllDepartments(req, res, next) {
      try {
        const departments = await this.departmentService.getAllDepartments();
        res.json(departments);
      } catch (error) {
        next(error);
      }
    }
  
    async getDepartmentById(req, res, next) {
      try {
        const { id } = req.params;
        // Validate departmentId format
        if (!validator.isUUID(id)) {
          throw new ValidationError([{ field: 'departmentId', message: 'Invalid departmentId format' }]);
        }
        const department = await this.departmentService.getDepartmentById(id);
        if (!department) {
          throw new DepartmentNotFoundError();
        }
        res.json(department);
      } catch (error) {
        next(error);
      }
    }
  
    async createDepartment(req, res, next) {
      try {
        const { name } = req.body;
        if (!name) {
          throw new BadRequestError('Name is required');
        }
        const department = await this.departmentService.createDepartment(req.body);
        res.status(201).json(department);
      } catch (error) {
        next(error);
      }
    }
  
    async updateDepartment(req, res, next) {
      try {
        const { id } = req.params;
        // Validate departmentId format
        if (!validator.isUUID(id)) {
          throw new ValidationError([{ field: 'departmentId', message: 'Invalid departmentId format' }]);
        }
        const department = await this.departmentService.updateDepartment(id, req.body);
        if (!department) {
          throw new DepartmentNotFoundError();
        }
        res.json(department);
      } catch (error) {
        next(error);
      }
    }
  
    async deleteDepartment(req, res, next) {
      try {
        const { id } = req.params;
        // Validate departmentId format
        if (!validator.isUUID(id)) {
          throw new ValidationError([{ field: 'departmentId', message: 'Invalid departmentId format' }]);
        }
        const department = await this.departmentService.getDepartmentById(id);
        if (!department) {
          throw new DepartmentNotFoundError();
        }
        await this.departmentService.deleteDepartment(id);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    }
  }
  
  export default DepartmentController;