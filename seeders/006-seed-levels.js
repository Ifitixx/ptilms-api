// ptilms-api/seeders/006-seed-levels.js
import { v4 as uuidv4 } from 'uuid';
import * as constants from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'Levels',
      constants.LEVEL_NAMES.map((levelName) => ({
        id: uuidv4(),
        name: levelName,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Levels', null, {});
  },
};