// ptilms-api/models/CourseMaterial.js
import { COURSES_MATERIAL_TYPES } from '../config/constants.mjs';
import { DataTypes } from 'sequelize';


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
    },
    type: {
      type: DataTypes.ENUM(...Object.values(COURSES_MATERIAL_TYPES)),
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
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