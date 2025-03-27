// ptilms-api/seeders/011-seed-chat-messages.js
import { v4 as uuidv4 } from 'uuid';
import * as constants from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Get all users
      const users = await queryInterface.sequelize.query(
        `SELECT id FROM Users;`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );
      if (users.length === 0) {
        throw new Error('No users found to associate with chat messages.');
      }

      // Get all chats
      const chats = await queryInterface.sequelize.query(
        `SELECT id, name FROM Chats;`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      // Helper function to find user and chat IDs
      const findUserId = () => {
        // Select a random user
        const randomIndex = Math.floor(Math.random() * users.length);
        return users[randomIndex].id;
      };
      const findChatId = (chatName) => {
        const chat = chats.find((chat) => chat.name === chatName);
        if (!chat) {
          throw new Error(`Chat not found: ${chatName}`);
        }
        return chat.id;
      };

      const chatMessagesToInsert = constants.CHAT_MESSAGES.map((message) => ({
        id: uuidv4(),
        content: message.content,
        user_id: findUserId(),
        chat_id: findChatId(message.chatName),
        created_at: new Date(),
        updated_at: new Date(),
      }));

      await queryInterface.bulkInsert('ChatMessages', chatMessagesToInsert, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('ChatMessages', null, {});
  },
};