// ptilms-api/services/AssignmentService.js
import { NotFoundError } from '../utils/errors.js';
import { error as _error } from '../utils/logger.js';

class AssignmentService {
  constructor({ assignmentRepository }) {
    this.assignmentRepository = assignmentRepository;
  }

  async getAllAssignments() {
    try {
      return await this.assignmentRepository.getAllAssignments();
    } catch (error) {
      _error(`Error in getAllAssignments: ${error.message}`);
      throw error;
    }
  }

  async getAssignmentById(id) {
    try {
      const assignment = await this.assignmentRepository.getAssignmentById(id);
      if (!assignment) {
        throw new NotFoundError('Assignment not found');
      }
      return assignment;
    } catch (error) {
      _error(`Error in getAssignmentById: ${error.message}`);
      throw error;
    }
  }

  async createAssignment(data) {
    try {
      return await this.assignmentRepository.createAssignment(data);
    } catch (error) {
      _error(`Error in createAssignment: ${error.message}`);
      throw error;
    }
  }

  async updateAssignment(id, data) {
    try {
      const assignment = await this.assignmentRepository.updateAssignment(id, data);
      if (!assignment) {
        throw new NotFoundError('Assignment not found');
      }
      return assignment;
    } catch (error) {
      _error(`Error in updateAssignment: ${error.message}`);
      throw error;
    }
  }

  async deleteAssignment(id) {
    try {
      const success = await this.assignmentRepository.deleteAssignment(id);
      if (!success) {
        throw new NotFoundError('Assignment not found');
      }
    } catch (error) {
      _error(`Error in deleteAssignment: ${error.message}`);
      throw error;
    }
  }
  async getAssignmentsByCourseId(courseId) {
    try {
      return await this.assignmentRepository.getAssignmentsByCourseId(courseId);
    } catch (error) {
      _error(`Error in getAssignmentsByCourseId: ${error.message}`);
      throw error;
    }
  }
}

export default AssignmentService;