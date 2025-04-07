// ptilms-api/models/Department.js
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Department extends Model {
    static associate(models) {
      Department.hasMany(models.Course, {
        foreignKey: 'departmentId',
        as: 'courses',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  Department.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'Department',
      tableName: 'departments',
      paranoid: true,
      underscored: true, // Ensure snake_case for timestamps
    }
  );

  return Department;
};