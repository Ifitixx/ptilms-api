// ptilms-api/models/CourseMaterial.js
import { DataTypes } from 'sequelize';
import { COURSES_MATERIAL_TYPES } from '../config/constants.mjs';

export default (sequelize) => {
  const CourseMaterial = sequelize.define('CourseMaterial', {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(COURSES_MATERIAL_TYPES)),
      allowNull: false,
    },
    fileKey: { // Changed from path to fileKey
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Stores MinIO file key',
    },
    originalName: { // Added originalName
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Stores the original name of the uploaded file',
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'course_id', // Ensure snake_case
    },
  },
  {
    tableName: 'course_materials', // Corrected table name to snake_case
    paranoid: true,
    underscored: true, // Ensure snake_case for timestamps
  });

  CourseMaterial.associate = (models) => {
    CourseMaterial.belongsTo(models.Course, {
      foreignKey: 'courseId',
      as: 'course', // Added alias
      onDelete: 'CASCADE',
    });
  };

  return CourseMaterial;
};