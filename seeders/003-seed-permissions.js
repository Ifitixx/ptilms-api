// ptilms-api/seeders/003-seed-permissions.js
import { v4 as uuidv4 } from 'uuid';
import * as constants from '../config/constants.mjs';

const { PERMISSIONS } = constants;

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'Permissions',
      Object.values(PERMISSIONS).map((permissionName) => ({
        id: uuidv4(),
        name: permissionName,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Permissions', null, {});
  },
};