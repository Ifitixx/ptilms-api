// ptilms-api/services/CourseMaterialService.js
import { NotFoundError } from '../utils/errors.js';
import { error as _error } from '../utils/logger.js';

class CourseMaterialService {
  constructor({ courseMaterialRepository }) {
    this.courseMaterialRepository = courseMaterialRepository;
  }

  async getAllCourseMaterials() {
    try {
      return await this.courseMaterialRepository.getAllCourseMaterials();
    } catch (error) {
      _error(`Error in getAllCourseMaterials: ${error.message}`);
      throw error;
    }
  }

  async getCourseMaterialById(courseMaterialId) {
    try {
      const courseMaterial = await this.courseMaterialRepository.getCourseMaterialById(courseMaterialId);
      if (!courseMaterial) {
        throw new NotFoundError('Course material not found');
      }
      return courseMaterial;
    } catch (error) {
      _error(`Error in getCourseMaterialById: ${error.message}`);
      throw error;
    }
  }

  async createCourseMaterial(data) {
    try {
      return await this.courseMaterialRepository.createCourseMaterial(data);
    } catch (error) {
      _error(`Error in createCourseMaterial: ${error.message}`);
      throw error;
    }
  }

  async updateCourseMaterial(courseMaterialId, data) {
    try {
      const courseMaterial = await this.courseMaterialRepository.updateCourseMaterial(courseMaterialId, data);
      if (!courseMaterial) {
        throw new NotFoundError('Course material not found');
      }
      return courseMaterial;
    } catch (error) {
      _error(`Error in updateCourseMaterial: ${error.message}`);
      throw error;
    }
  }

  async deleteCourseMaterial(courseMaterialId) {
    try {
      const success = await this.courseMaterialRepository.deleteCourseMaterial(courseMaterialId);
      if (!success) {
        throw new NotFoundError('Course material not found');
      }
    } catch (error) {
      _error(`Error in deleteCourseMaterial: ${error.message}`);
      throw error;
    }
  }

  async getCourseMaterialsByCourseId(courseId) {
    try {
      return await this.courseMaterialRepository.getCourseMaterialsByCourseId(courseId);
    } catch (error) {
      _error(`Error in getCourseMaterialsByCourseId: ${error.message}`);
      throw error;
    }
  }
  async getCourseMaterialsByMaterialId(materialId) {
    try {
      return await this.courseMaterialRepository.getCourseMaterialsByMaterialId(materialId);
    } catch (error) {
      _error(`Error in getCourseMaterialsByMaterialId: ${error.message}`);
      throw error;
    }
  }
}

export default CourseMaterialService;