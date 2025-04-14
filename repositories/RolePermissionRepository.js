// ptilms-api/repositories/RolePermissionRepository.js
class RolePermissionRepository {
  constructor({ RolePermission, Role, Permission, sequelize }) { // Add sequelize
    this.rolePermissionModel = RolePermission;
    this.roleModel = Role;
    this.permissionModel = Permission;
    this.sequelize = sequelize; // Store sequelize instance
  }

  async getAllRolePermissions() {
    return await this.rolePermissionModel.findAll();
  }

  async getRolePermissionById(id) {
    return await this.rolePermissionModel.findByPk(id);
  }

  async getRolePermissionsByRoleId(roleId) {
    return await this.rolePermissionModel.findAll({ where: { roleId } });
  }

  async getRolePermissionsByPermissionId(permissionId) {
    return await this.rolePermissionModel.findAll({ where: { permissionId } });
  }

  async createRolePermission(data, transaction) { // Add transaction parameter
    return await this.rolePermissionModel.create(data, { transaction }); // Pass transaction
  }

  async updateRolePermission(id, data, transaction) { // Add transaction parameter
    const rolePermission = await this.rolePermissionModel.findByPk(id, { transaction }); // Use transaction
    if (rolePermission) {
      return await rolePermission.update(data, { transaction }); // Pass transaction
    }
    return null;
  }

  async deleteRolePermission(id, transaction) { // Add transaction parameter
    const rolePermission = await this.rolePermissionModel.findByPk(id, { transaction }); // Use transaction
    if (rolePermission) {
      await rolePermission.destroy({ transaction }); // Pass transaction
      return true;
    }
    return false;
  }
}

export default RolePermissionRepository;