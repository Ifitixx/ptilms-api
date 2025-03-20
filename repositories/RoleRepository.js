// ptilms-api/repositories/RoleRepository.js
class RoleRepository {
    constructor(roleModel) {
      this.roleModel = roleModel;
    }
  
    async getAllRoles() {
      return await this.roleModel.findAll();
    }
  
    async getRoleById(id) {
      return await this.roleModel.findByPk(id);
    }
  
    async getRoleByName(name) {
      return await this.roleModel.findOne({ where: { name } });
    }
  
    async createRole(data) {
      return await this.roleModel.create(data);
    }
  
    async updateRole(id, data) {
      const role = await this.roleModel.findByPk(id);
      if (!role) return null;
      return await role.update(data);
    }
  
    async deleteRole(id) {
      const role = await this.roleModel.findByPk(id);
      if (!role) return false;
      await role.destroy();
      return true;
    }
  }
  
  module.exports = RoleRepository;