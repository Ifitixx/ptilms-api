// ptilms-api/repositories/PermissionRepository.js
class PermissionRepository {
  constructor(Permission) { // Expect model directly
    this.permissionModel = Permission;
  }
  
    async getAllPermissions() {
      return await this.permissionModel.findAll();
    }
  
    async getPermissionById(id) {
      return await this.permissionModel.findByPk(id);
    }
  
    async createPermission(data) {
      return await this.permissionModel.create(data);
    }
  
    async updatePermission(id, data) {
      const permission = await this.permissionModel.findByPk(id);
      if (!permission) return null;
      return await permission.update(data);
    }
  
    async deletePermission(id) {
      const permission = await this.permissionModel.findByPk(id);
      if (!permission) return false;
      await permission.destroy();
      return true;
    }
  }
  
  export default PermissionRepository;