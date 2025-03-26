// ptilms-api/models/Assignment.js
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Assignment extends Model {
    static associate(models) {
      Assignment.belongsTo(models.Course, {
        foreignKey: 'courseId',
        as: 'course',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Assignment.init(
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      dueDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      courseId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Assignment',
      tableName: 'assignments',
      paranoid: true,
    }
  );

  return Assignment;
};