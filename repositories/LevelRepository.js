// ptilms-api/repositories/LevelRepository.js
class LevelRepository {
  constructor(Level) { // Expect model directly
    this.levelModel = Level;
  }
    async getAllLevels() {
      return await this.levelModel.findAll();
    }
  
    async getLevelById(id) {
      return await this.levelModel.findByPk(id);
    }
  
    async createLevel(data) {
      return await this.levelModel.create(data);
    }
  
    async updateLevel(id, data) {
      const level = await this.levelModel.findByPk(id);
      if (!level) return null;
      return await level.update(data);
    }
  
    async deleteLevel(id) {
      const level = await this.levelModel.findByPk(id);
      if (!level) return false;
      await level.destroy();
      return true;
    }
  }
  
  export default LevelRepository;