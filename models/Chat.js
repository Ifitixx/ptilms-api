// ptilms-api/models/Chat.js
import { Model, DataTypes } from 'sequelize';
import { CHAT_TYPES } from '../config/constants.mjs';

export default (sequelize) => {
  class Chat extends Model {
    static associate(models) {
      Chat.hasMany(models.ChatMessage, {
        foreignKey: 'chatId',
        as: 'messages',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Chat.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      communicationType: {
        type: DataTypes.ENUM(...Object.values(CHAT_TYPES)),
        allowNull: false,
        field: 'communication_type', // Ensure snake_case
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Chat',
      tableName: 'chats',
      paranoid: true,
      underscored: true, // Ensure snake_case for timestamps
    }
  );

  return Chat;
};