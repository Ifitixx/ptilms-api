// ptilms-api/repositories/RolePermissionRepository.js
class RolePermissionRepository {
    constructor(rolePermissionModel) {
      this.rolePermissionModel = rolePermissionModel;
    }
  
    async getRolePermissionsByRoleId(roleId) {
      return await this.rolePermissionModel.findAll({ where: { roleId } });
    }
  
    async getRolePermissionsByPermissionId(permissionId) {
      return await this.rolePermissionModel.findAll({ where: { permissionId } });
    }
  
    async createRolePermission(data) {
      return await this.rolePermissionModel.create(data);
    }
  
    async deleteRolePermission(roleId, permissionId) {
      return await this.rolePermissionModel.destroy({ where: { roleId, permissionId } });
    }
  }
  
  export default RolePermissionRepository;