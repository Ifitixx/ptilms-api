// ptilms-api/models/Role.js
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Role extends Model {
    static associate(models) {
      Role.hasMany(models.User, {
        foreignKey: 'roleId',
        as: 'users',
      });
      Role.belongsToMany(models.Permission, {
        through: models.RolePermission,
        foreignKey: 'roleId',
        as: 'permissions',
      });
    }
  }

  Role.init(
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
      modelName: 'Role',
      tableName: 'roles',
      timestamps: true,
      underscored: true,
      paranoid: true,
    }
  );

  return Role;
};