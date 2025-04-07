// ptilms-api/models/Announcement.js
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Announcement extends Model {
    static associate(models) {
      Announcement.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      Announcement.belongsTo(models.Course, {
        foreignKey: 'courseId',
        as: 'course',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Announcement.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
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
      courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'course_id', // Ensure snake_case
      },
    },
    {
      sequelize,
      modelName: 'Announcement',
      tableName: 'announcements',
      paranoid: true,
      underscored: true, // Ensure snake_case for timestamps
    }
  );

  return Announcement;
};