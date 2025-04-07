// ptilms-api/migrations/010-create-chats.js
import { DataTypes } from 'sequelize';
import { CHAT_TYPES } from '../config/constants.mjs';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('chats', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      communication_type: {
        type: DataTypes.ENUM(...Object.values(CHAT_TYPES)),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('chats');
  },
};