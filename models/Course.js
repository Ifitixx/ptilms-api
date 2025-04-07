// ptilms-api/models/Course.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Course = sequelize.define(
    'Course',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      format: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      units: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      isDepartmental: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_departmental', // Ensure snake_case
      },
      departmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'department_id', // Ensure snake_case
      },
      levelId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'level_id', // Ensure snake_case
      },
      lecturerId: {
        type: DataTypes.UUID,
        allowNull: true, // Allow null initially, update after lecturer assignment
        field: 'lecturer_id', // Ensure snake_case
      },
    },
    {
      sequelize,
      modelName: 'Course',
      tableName: 'courses',
      paranoid: true,
      underscored: true, // Ensure snake_case for timestamps
    }
  );

  Course.associate = (models) => {
    Course.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department', // Added alias
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    Course.belongsTo(models.Level, {
      foreignKey: 'levelId',
      as: 'level', // Added alias
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    Course.belongsTo(models.User, {
      foreignKey: 'lecturerId',
      as: 'lecturer',
      onDelete: 'SET NULL', // Changed to SET NULL
      onUpdate: 'CASCADE',
    });
    Course.hasMany(models.Assignment, {
      foreignKey: 'courseId',
      as: 'assignments', // Added alias
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    Course.hasMany(models.CourseMaterial, {
      foreignKey: 'courseId',
      as: 'materials',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    Course.hasMany(models.Announcement, {
      foreignKey: 'courseId',
      as: 'announcements', // Added alias
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return Course;
};