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
        foreignKey: 'userId',
        as: 'sender',
        onDelete: 'CASCADE',
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
        field: 'chat_id', // Ensure snake_case
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id', // Ensure snake_case
      },
    },
    {
      sequelize,
      modelName: 'ChatMessage',
      tableName: 'chat_messages', // Corrected table name to snake_case
      paranoid: true,
      underscored: true, // Ensure snake_case for timestamps
    }
  );

  return ChatMessage;
};