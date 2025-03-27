// ptilms-api/seeders/005-seed-departments.js
import { v4 as uuidv4 } from 'uuid';
import * as constants from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'Departments',
      constants.DEPARTMENT_NAMES.map((departmentName) => ({
        id: uuidv4(),
        name: departmentName,
        created_at: new Date(),
        updated_at: new Date(),
      }))
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Departments', null, {});
  },
};