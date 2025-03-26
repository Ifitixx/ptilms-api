// ptilms-api/seeders/004-seed-role-permissions.js
import { v4 as uuidv4 } from 'uuid';
import * as constants from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Get all roles
      const roles = await queryInterface.sequelize.query(
        `SELECT id, name FROM Roles;`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      // Get all permissions
      const permissions = await queryInterface.sequelize.query(
        `SELECT id, name FROM Permissions;`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      // Helper function to find role and permission IDs
      const findRoleId = (roleName) => {
        const role = roles.find((r) => r.name === roleName);
        if (!role) {
          throw new Error(`Role not found: ${roleName}`);
        }
        return role.id;
      };

      const findPermissionId = (permissionName) => {
        const permission = permissions.find((p) => p.name === permissionName);
        if (!permission) {
          throw new Error(`Permission not found: ${permissionName}`);
        }
        return permission.id;
      };

      const rolePermissionsToInsert = [];

      // Admin Permissions (all permissions)
      const adminRoleId = findRoleId(constants.ROLES.ADMIN);
      Object.values(constants.PERMISSIONS).forEach((permission) => {
        rolePermissionsToInsert.push({
          id: uuidv4(),
          roleId: adminRoleId,
          permissionId: findPermissionId(permission),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      // Lecturer Permissions
      const lecturerRoleId = findRoleId(constants.ROLES.LECTURER);
      const lecturerPermissions = [
        constants.PERMISSIONS.COURSE_CREATE,
        constants.PERMISSIONS.COURSE_EDIT,
        constants.PERMISSIONS.COURSE_READ,
        constants.PERMISSIONS.ASSIGNMENT_CREATE,
        constants.PERMISSIONS.ASSIGNMENT_READ,
        constants.PERMISSIONS.ASSIGNMENT_UPDATE,
        constants.PERMISSIONS.ASSIGNMENT_DELETE,
        constants.PERMISSIONS.ANNOUNCEMENT_CREATE,
        constants.PERMISSIONS.ANNOUNCEMENT_READ,
        constants.PERMISSIONS.ANNOUNCEMENT_UPDATE,
        constants.PERMISSIONS.ANNOUNCEMENT_DELETE,
        constants.PERMISSIONS.CHAT_CREATE,
        constants.PERMISSIONS.CHAT_READ,
        constants.PERMISSIONS.CHAT_UPDATE,
        constants.PERMISSIONS.CHAT_DELETE,
        constants.PERMISSIONS.CHAT_MESSAGE_CREATE,
        constants.PERMISSIONS.CHAT_MESSAGE_READ,
        constants.PERMISSIONS.CHAT_MESSAGE_UPDATE,
        constants.PERMISSIONS.CHAT_MESSAGE_DELETE,
        constants.PERMISSIONS.DEPARTMENT_CREATE,
        constants.PERMISSIONS.DEPARTMENT_READ,
        constants.PERMISSIONS.DEPARTMENT_UPDATE,
        constants.PERMISSIONS.DEPARTMENT_DELETE,
        constants.PERMISSIONS.LEVEL_CREATE,
        constants.PERMISSIONS.LEVEL_READ,
        constants.PERMISSIONS.LEVEL_UPDATE,
        constants.PERMISSIONS.LEVEL_DELETE,
      ];
      lecturerPermissions.forEach((permission) => {
        rolePermissionsToInsert.push({
          id: uuidv4(),
          roleId: lecturerRoleId,
          permissionId: findPermissionId(permission),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      // Student Permissions
      const studentRoleId = findRoleId(constants.ROLES.STUDENT);
      const studentPermissions = [
        constants.PERMISSIONS.COURSE_READ,
        constants.PERMISSIONS.ASSIGNMENT_READ,
        constants.PERMISSIONS.ANNOUNCEMENT_READ,
        constants.PERMISSIONS.CHAT_READ,
        constants.PERMISSIONS.CHAT_MESSAGE_CREATE,
        constants.PERMISSIONS.CHAT_MESSAGE_READ,
      ];
      studentPermissions.forEach((permission) => {
        rolePermissionsToInsert.push({
          id: uuidv4(),
          roleId: studentRoleId,
          permissionId: findPermissionId(permission),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      await queryInterface.bulkInsert(
        'RolePermissions',
        rolePermissionsToInsert,
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('RolePermissions', null, {});
  },
};