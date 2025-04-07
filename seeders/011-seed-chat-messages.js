// ptilms-api/seeders/011-seed-chat-messages.js
import { v4 as uuidv4 } from 'uuid';
import { CHAT_MESSAGES } from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('chat_messages', null, { transaction }); // Clear existing data

      // Fetch chats and a user (e.g., admin) to associate with messages
      const [chats, users] = await Promise.all([
        queryInterface.sequelize.query(`SELECT id, name FROM Chats;`, {
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction,
        }),
        queryInterface.sequelize.query(`SELECT id FROM Users LIMIT 1;`, { // Fetch a single user (e.g., admin)
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction,
        }),
      ]);

      if (users.length === 0) {
        throw new Error('No users found. Ensure users are seeded before chat messages.');
      }
      const userId = users[0].id; // Use the ID of the fetched user

      const chatMessagesToInsert = CHAT_MESSAGES.map((chatMessage) => {
        const chat = chats.find((c) => c.name === chatMessage.chatName);
        if (!chat) {
          throw new Error(`Chat with name "${chatMessage.chatName}" not found. Ensure chats are seeded first.`);
        }

        return {
          id: uuidv4(),
          content: chatMessage.content,
          user_id: userId, // Use the fetched user ID
          chat_id: chat.id,
          created_at: new Date(),
          updated_at: new Date(),
        };
      });

      await queryInterface.bulkInsert('chat_messages', chatMessagesToInsert, { transaction });
      await transaction.commit();
      console.log('Chat messages seeded successfully.');
    } catch (error) {
      await transaction.rollback();
      console.error('Error seeding chat messages:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('chat_messages', null, {});
      console.log('Chat messages table cleared.');
    } catch (error) {
      console.error('Error clearing chat messages table:', error);
    }
  },
};