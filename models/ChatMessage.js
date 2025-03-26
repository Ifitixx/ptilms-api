// ptilms-api/models/ChatMessage.js
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class ChatMessage extends Model {
    static associate(models) {
      ChatMessage.belongsTo(models.Chat, {
        foreignKey: 'chatId',
        as: 'chat',
        onDelete: 'CASCADE', 
        onUpdate: 'CASCADE',
      });
      ChatMessage.belongsTo(models.User, {
        foreignKey: 'senderId',
        as: 'sender',
        onDelete: 'SET NULL', 
        onUpdate: 'CASCADE',
      });
    }
  }

  ChatMessage.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      chatId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      senderId: {
        type: DataTypes.UUID,
        allowNull: true, // Changed to true
      },
    },
    {
      sequelize,
      modelName: 'ChatMessage',
      tableName: 'chat_messages',
      paranoid: true,
    }
  );

  return ChatMessage;
};