// ptilms-api/models/RolePermission.js
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class RolePermission extends Model {
    static associate(models) {
      RolePermission.belongsTo(models.Role, {
        foreignKey: 'roleId',
        as: 'role',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      RolePermission.belongsTo(models.Permission, {
        foreignKey: 'permissionId',
        as: 'permission',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }
  }

  RolePermission.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      roleId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'role_id', // Ensure snake_case
      },
      permissionId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'permission_id', // Ensure snake_case
      },
    },
    {
      sequelize,
      modelName: 'RolePermission',
      tableName: 'role_permissions', // Corrected table name to snake_case
      paranoid: true,
      underscored: true, // Ensure snake_case for timestamps
    }
  );

  return RolePermission;
};