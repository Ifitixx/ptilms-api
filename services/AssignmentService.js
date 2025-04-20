// ptilms-api/services/AssignmentService.js
import { NotFoundError } from '../utils/errors.js';
import { error as _error } from '../utils/logger.js';

class AssignmentService {
  constructor({ assignmentRepository, cacheService }) {
    this.assignmentRepository = assignmentRepository;
    this.cacheService = cacheService;
  }

  async getAllAssignments() {
    try {
      const cacheKey = this.cacheService.generateKey(CacheService.CACHE_KEYS.ASSIGNMENT, 'all');
      const cachedAssignments = await this.cacheService.get(cacheKey);
      
      if (cachedAssignments) {
        return cachedAssignments;
      }

      const assignments = await this.assignmentRepository.getAllAssignments();
      await this.cacheService.set(cacheKey, assignments, 1800); // Cache for 30 minutes
      return assignments;
    } catch (error) {
      _error(`Error in getAllAssignments: ${error.message}`);
      throw error;
    }
  }

  async getAssignmentById(id) {
    try {
      const cacheKey = this.cacheService.generateKey(CacheService.CACHE_KEYS.ASSIGNMENT, id);
      const cachedAssignment = await this.cacheService.get(cacheKey);
      
      if (cachedAssignment) {
        return cachedAssignment;
      }

      const assignment = await this.assignmentRepository.getAssignmentById(id);
      if (!assignment) {
        throw new NotFoundError('Assignment not found');
      }
      
      await this.cacheService.set(cacheKey, assignment, 1800); // Cache for 30 minutes
      return assignment;
    } catch (error) {
      _error(`Error in getAssignmentById: ${error.message}`);
      throw error;
    }
  }

  async createAssignment(data) {
    try {
      const assignment = await this.assignmentRepository.createAssignment(data);
      await this.invalidateAssignmentCache();
      return assignment;
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
      await this.invalidateAssignmentCache(id);
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
      await this.invalidateAssignmentCache(id);
    } catch (error) {
      _error(`Error in deleteAssignment: ${error.message}`);
      throw error;
    }
  }

  async getAssignmentsByCourseId(courseId) {
    try {
      const cacheKey = this.cacheService.generateKey(CacheService.CACHE_KEYS.ASSIGNMENT, `course:${courseId}`);
      const cachedAssignments = await this.cacheService.get(cacheKey);
      
      if (cachedAssignments) {
        return cachedAssignments;
      }

      const assignments = await this.assignmentRepository.getAssignmentsByCourseId(courseId);
      await this.cacheService.set(cacheKey, assignments, 1800); // Cache for 30 minutes
      return assignments;
    } catch (error) {
      _error(`Error in getAssignmentsByCourseId: ${error.message}`);
      throw error;
    }
  }

  async invalidateAssignmentCache(id = null) {
    try {
      if (id) {
        const cacheKey = this.cacheService.generateKey(CacheService.CACHE_KEYS.ASSIGNMENT, id);
        await this.cacheService.del(cacheKey);
      }
      // Invalidate all assignments cache
      await this.cacheService.invalidatePattern(`${CacheService.CACHE_KEYS.ASSIGNMENT}:*`);
    } catch (error) {
      _error(`Error invalidating assignment cache: ${error.message}`);
    }
  }
}

export default AssignmentService;