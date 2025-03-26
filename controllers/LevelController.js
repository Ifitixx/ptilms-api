// ptilms-api/controllers/LevelController.js
import {
    LevelNotFoundError,
    BadRequestError,
    ValidationError,
  } from '../utils/errors.js';
  import validator from 'validator';
  
  class LevelController {
    constructor({ levelService }) {
      this.levelService = levelService;
    }
  
    async getAllLevels(req, res, next) {
      try {
        const levels = await this.levelService.getAllLevels();
        res.json(levels);
      } catch (error) {
        next(error);
      }
    }
  
    async getLevelById(req, res, next) {
      try {
        const { levelId } = req.params;
        // Validate levelId format
        if (!validator.isUUID(levelId)) {
          throw new ValidationError([{ field: 'levelId', message: 'Invalid levelId format' }]);
        }
        const level = await this.levelService.getLevelById(levelId);
        if (!level) {
          throw new LevelNotFoundError();
        }
        res.json(level);
      } catch (error) {
        next(error);
      }
    }
  
    async createLevel(req, res, next) {
      try {
        const { name } = req.body;
        if (!name) {
          throw new BadRequestError('Name is required');
        }
        const level = await this.levelService.createLevel(req.body);
        res.status(201).json(level);
      } catch (error) {
        next(error);
      }
    }
  
    async updateLevel(req, res, next) {
      try {
        const { levelId } = req.params;
        // Validate levelId format
        if (!validator.isUUID(levelId)) {
          throw new ValidationError([{ field: 'levelId', message: 'Invalid levelId format' }]);
        }
        const level = await this.levelService.updateLevel(levelId, req.body);
        if (!level) {
          throw new LevelNotFoundError();
        }
        res.json(level);
      } catch (error) {
        next(error);
      }
    }
  
    async deleteLevel(req, res, next) {
      try {
        const { levelId } = req.params;
        // Validate levelId format
        if (!validator.isUUID(levelId)) {
          throw new ValidationError([{ field: 'levelId', message: 'Invalid levelId format' }]);
        }
        const level = await this.levelService.getLevelById(levelId);
        if (!level) {
          throw new LevelNotFoundError();
        }
        await this.levelService.deleteLevel(levelId);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    }
  }
  
  export default LevelController;