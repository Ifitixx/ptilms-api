// ptilms-api/services/DepartmentService.js
import { NotFoundError } from '../utils/errors.js';
import { error as _error } from '../utils/logger.js';

class DepartmentService {
  constructor({ departmentRepository }) {
    this.departmentRepository = departmentRepository;
  }

  async getAllDepartments() {
    try {
      return await this.departmentRepository.getAllDepartments();
    } catch (error) {
      _error(`Error in getAllDepartments: ${error.message}`);
      throw error;
    }
  }

  async getDepartmentById(id) {
    try {
      const department = await this.departmentRepository.getDepartmentById(id);
      if (!department) {
        throw new NotFoundError('Department not found');
      }
      return department;
    } catch (error) {
      _error(`Error in getDepartmentById: ${error.message}`);
      throw error;
    }
  }

  async createDepartment(data) {
    try {
      return await this.departmentRepository.createDepartment(data);
    } catch (error) {
      _error(`Error in createDepartment: ${error.message}`);
      throw error;
    }
  }

  async updateDepartment(id, data) {
    try {
      const department = await this.departmentRepository.updateDepartment(id, data);
      if (!department) {
        throw new NotFoundError('Department not found');
      }
      return department;
    } catch (error) {
      _error(`Error in updateDepartment: ${error.message}`);
      throw error;
    }
  }

  async deleteDepartment(id) {
    try {
      const success = await this.departmentRepository.deleteDepartment(id);
      if (!success) {
        throw new NotFoundError('Department not found');
      }
    } catch (error) {
      _error(`Error in deleteDepartment: ${error.message}`);
      throw error;
    }
  }
}

export default DepartmentService;