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
      allowNull: true,  // Set explicitly to match migration
    },
    type: {
      type: DataTypes.ENUM(...Object.values(COURSES_MATERIAL_TYPES)),
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    courseId: {  // Explicitly define the foreign key (maps to course_id)
      type: DataTypes.UUID,
      allowNull: false,
    },
    // Optional explicit timestamps (Sequelize adds these automatically if enabled)
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
    tableName: 'CourseMaterials',
    timestamps: true,
    paranoid: true,
  });

  CourseMaterial.associate = (models) => {
    CourseMaterial.belongsTo(models.Course, {
      foreignKey: 'courseId',
      onDelete: 'CASCADE',
      as: 'Course', 
    });
  };

  return CourseMaterial;
};
