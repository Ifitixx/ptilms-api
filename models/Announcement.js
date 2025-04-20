// ptilms-api/models/Announcement.js
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Announcement extends Model {
    static associate(models) {
      Announcement.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'creator',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      Announcement.belongsTo(models.Course, {
        foreignKey: 'courseId',
        as: 'course',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      Announcement.belongsTo(models.Department, {
        foreignKey: 'departmentId',
        as: 'department',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      Announcement.belongsTo(models.Level, {
        foreignKey: 'levelId',
        as: 'level',
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
        field: 'user_id',
      },
      courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'course_id',
      },
      departmentId: {
        type: DataTypes.UUID,
        allowNull: false, // Changed to false since it should be required
        field: 'department_id',
      },
      levelId: {
        type: DataTypes.UUID,
        allowNull: false, // Changed to false since it should be required
        field: 'level_id',
      }
    },
    {
      sequelize,
      modelName: 'Announcement',
      tableName: 'announcements',
      paranoid: true,
      underscored: true,
    }
  );

  return Announcement;
};