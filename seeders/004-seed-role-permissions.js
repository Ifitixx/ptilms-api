// ptilms-api/seeders/004-seed-role-permissions.js
import { v4 as uuidv4 } from 'uuid';
import { ROLES, PERMISSIONS } from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('role_permissions', null, { transaction }); // Clear existing data

      // Fetch roles and permissions
      const [roles, permissions] = await Promise.all([
        queryInterface.sequelize.query(`SELECT id, name FROM Roles;`, {
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction,
        }),
        queryInterface.sequelize.query(`SELECT id, name FROM Permissions;`, {
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction,
        }),
      ]);

      const adminRole = roles.find((role) => role.name === ROLES.ADMIN);
      if (!adminRole) {
        throw new Error(`Role "${ROLES.ADMIN}" not found. Ensure roles are seeded first.`);
      }

      // Assign all permissions to admin role
      const rolePermissionsToInsert = Object.values(PERMISSIONS).map((permissionName) => {
        const permission = permissions.find((p) => p.name === permissionName);
        if (!permission) {
          throw new Error(`Permission "${permissionName}" not found. Ensure permissions are seeded first.`);
        }
        return {
          id: uuidv4(),
          role_id: adminRole.id,
          permission_id: permission.id,
          created_at: new Date(),
          updated_at: new Date(),
        };
      });

      await queryInterface.bulkInsert('role_permissions', rolePermissionsToInsert, { transaction });
      await transaction.commit();
      console.log('Role permissions seeded successfully.');
    } catch (error) {
      await transaction.rollback();
      console.error('Error seeding role permissions:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('role_permissions', null, {});
      console.log('Role permissions table cleared.');
    } catch (error) {
      console.error('Error clearing role permissions table:', error);
    }
  },
};