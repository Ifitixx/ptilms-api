// ptilms-api/seeders/006-seed-levels.js
import { v4 as uuidv4 } from 'uuid';
import { LEVEL_NAMES } from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    const levelsToInsert = LEVEL_NAMES.map(levelName => ({
      id: uuidv4(),
      name: levelName,
      created_at: new Date(),
      updated_at: new Date(),
    }));

    try {
      await queryInterface.bulkDelete('levels', null, {}); // Clear existing data
      await queryInterface.bulkInsert('levels', levelsToInsert, {});
      console.log('Levels seeded successfully.');
    } catch (error) {
      console.error('Error seeding levels:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('levels', null, {});
      console.log('Levels table cleared.');
    } catch (error) {
      console.error('Error clearing levels table:', error);
    }
  },
};