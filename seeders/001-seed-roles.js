// ptilms-api/seeders/001-seed-roles.js
import { v4 as uuidv4 } from 'uuid';
import { ROLE_NAMES } from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    const rolesToInsert = ROLE_NAMES.map(roleName => ({
      id: uuidv4(),
      name: roleName,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    try {
      await queryInterface.bulkDelete('roles', null, {}); // Clear existing data
      await queryInterface.bulkInsert('roles', rolesToInsert, {});
      console.log('Roles seeded successfully.');
    } catch (error) {
      console.error('Error seeding roles:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('roles', null, {});
      console.log('Roles table cleared.');
    } catch (error) {
      console.error('Error clearing roles table:', error);
    }
  },
};