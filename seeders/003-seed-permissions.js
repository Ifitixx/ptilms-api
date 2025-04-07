// ptilms-api/seeders/003-seed-permissions.js
import { v4 as uuidv4 } from 'uuid';
import { PERMISSIONS } from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    const permissionsToInsert = Object.values(PERMISSIONS).map(permissionName => ({
      id: uuidv4(),
      name: permissionName,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    try {
      await queryInterface.bulkDelete('permissions', null, {}); // Clear existing data
      await queryInterface.bulkInsert('permissions', permissionsToInsert, {});
      console.log('Permissions seeded successfully.');
    } catch (error) {
      console.error('Error seeding permissions:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('permissions', null, {});
      console.log('Permissions table cleared.');
    } catch (error) {
      console.error('Error clearing permissions table:', error);
    }
  },
};