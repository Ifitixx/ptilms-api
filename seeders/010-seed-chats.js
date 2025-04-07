// ptilms-api/seeders/010-seed-chats.js
import { v4 as uuidv4 } from 'uuid';
import { CHATS } from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('chats', null, { transaction }); // Clear existing data

      const chatsToInsert = CHATS.map((chat) => ({
        id: uuidv4(),
        communication_type: chat.communicationType,
        name: chat.name,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      await queryInterface.bulkInsert('chats', chatsToInsert, { transaction });
      await transaction.commit();
      console.log('Chats seeded successfully.');
    } catch (error) {
      await transaction.rollback();
      console.error('Error seeding chats:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('chats', null, {});
      console.log('Chats table cleared.');
    } catch (error) {
      console.error('Error clearing chats table:', error);
    }
  },
};