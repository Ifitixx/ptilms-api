// ptilms-api/seeders/005-seed-departments.js
import { v4 as uuidv4 } from 'uuid';
import { DEPARTMENT_NAMES } from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    const departmentsToInsert = DEPARTMENT_NAMES.map(departmentName => ({
      id: uuidv4(),
      name: departmentName,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    try {
      await queryInterface.bulkDelete('departments', null, {}); // Clear existing data
      await queryInterface.bulkInsert('departments', departmentsToInsert, {});
      console.log('Departments seeded successfully.');
    } catch (error) {
      console.error('Error seeding departments:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('departments', null, {});
      console.log('Departments table cleared.');
    } catch (error) {
      console.error('Error clearing departments table:', error);
    }
  },
};