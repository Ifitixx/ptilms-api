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
      Assignment.belongsTo(models.Department, {  // New association
        foreignKey: 'departmentId',
        as: 'department',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      Assignment.belongsTo(models.Level, {  // New association
        foreignKey: 'levelId',
        as: 'level',
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
        field: 'due_date', // Ensure snake_case
      },
      courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'course_id', // Ensure snake_case
      },
      departmentId: {  // New field
        type: DataTypes.UUID,
        allowNull: false,
        field: 'department_id',
      },
      levelId: {  // New field
        type: DataTypes.UUID,
        allowNull: false,
        field: 'level_id',
      },
    },
    {
      sequelize,
      modelName: 'Assignment',
      tableName: 'assignments',
      paranoid: true,
      underscored: true, // Ensure snake_case for timestamps
    }
  );

  return Assignment;
};