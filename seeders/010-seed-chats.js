// ptilms-api/seeders/010-seed-chats.js
import { v4 as uuidv4 } from 'uuid';
import * as constants from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'Chats',
      constants.CHATS.map((chat) => ({
        id: uuidv4(),
        name: chat.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Chats', null, {});
  },
};