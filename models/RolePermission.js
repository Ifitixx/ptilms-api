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
      },
      permissionId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'RolePermission',
      tableName: 'RolePermissions',
      paranoid: true,
    }
  );

  return RolePermission;
};