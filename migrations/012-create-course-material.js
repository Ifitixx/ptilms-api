// ptilms-api/migrations/012-create-course-material.js
import { DataTypes } from 'sequelize';
import * as constants from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CourseMaterials', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      type: {
        type: DataTypes.ENUM(...Object.values(constants.COURSES_MATERIAL_TYPES)),
        allowNull: false,
      },
      path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Courses',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CourseMaterials');
  },
};