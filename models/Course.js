// ptilms-api/models/Course.js
import { DataTypes } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export default (sequelize) => {
  const Course = sequelize.define(
    'Course',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: () => uuidv4(),
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
      },
    },
    {
      sequelize,
      modelName: 'Course',
      tableName: 'courses',
      paranoid: true,
    }
  );

  Course.associate = (models) => {
    Course.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      onDelete: 'NO ACTION',
      onUpdate: 'CASCADE',
    });
    Course.belongsTo(models.Level, {
      foreignKey: 'levelId',
      onDelete: 'NO ACTION',
      onUpdate: 'CASCADE',
    });
    Course.belongsTo(models.User, {
      foreignKey: 'lecturerId',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
      as: 'lecturer'
    });
    Course.hasMany(models.Assignment, {
      foreignKey: 'courseId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    Course.hasMany(models.CourseMaterial, {
      foreignKey: 'courseId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      as: 'materials',
    });
    Course.hasMany(models.Announcement, {
      foreignKey: 'courseId',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  };

  return Course;
};