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
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      userId: { 
        type: DataTypes.UUID,
        allowNull: false,
      },
      // Optional explicit timestamps (auto-added by Sequelize if configured)
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'ChatMessage',
      tableName: 'ChatMessages',
      paranoid: true,
      timestamps: true,
    }
  );

  return ChatMessage;
};
