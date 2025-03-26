// ptilms-api/services/LevelService.js
import { NotFoundError } from '../utils/errors.js';
import { error as _error } from '../utils/logger.js';

class LevelService {
  constructor({ levelRepository }) {
    this.levelRepository = levelRepository;
  }

  async getAllLevels() {
    try {
      return await this.levelRepository.getAllLevels();
    } catch (error) {
      _error(`Error in getAllLevels: ${error.message}`);
      throw error;
    }
  }

  async getLevelById(id) {
    try {
      const level = await this.levelRepository.getLevelById(id);
      if (!level) {
        throw new NotFoundError('Level not found');
      }
      return level;
    } catch (error) {
      _error(`Error in getLevelById: ${error.message}`);
      throw error;
    }
  }

  async createLevel(data) {
    try {
      return await this.levelRepository.createLevel(data);
    } catch (error) {
      _error(`Error in createLevel: ${error.message}`);
      throw error;
    }
  }

  async updateLevel(id, data) {
    try {
      const level = await this.levelRepository.updateLevel(id, data);
      if (!level) {
        throw new NotFoundError('Level not found');
      }
      return level;
    } catch (error) {
      _error(`Error in updateLevel: ${error.message}`);
      throw error;
    }
  }

  async deleteLevel(id) {
    try {
      const success = await this.levelRepository.deleteLevel(id);
      if (!success) {
        throw new NotFoundError('Level not found');
      }
    } catch (error) {
      _error(`Error in deleteLevel: ${error.message}`);
      throw error;
    }
  }
}

export default LevelService;