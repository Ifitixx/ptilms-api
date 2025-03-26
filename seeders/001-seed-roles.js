// ptilms-api/seeders/001-seed-roles.js
import { v4 as uuidv4 } from 'uuid';
import { ROLE_NAMES } from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'Roles',
      ROLE_NAMES.map((roleName) => ({
        id: uuidv4(),
        name: roleName,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {});
  },
};