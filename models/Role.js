// ptilms-api/models/Role.js
import { Model, DataTypes } from 'sequelize';

export default (sequelize) => {
  class Role extends Model {
    static associate(models) {
      Role.hasMany(models.User, {
        foreignKey: 'roleId',
        as: 'users',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      });
      
      Role.belongsToMany(models.Permission, {
        through: 'role_permissions',
        foreignKey: 'roleId',
        otherKey: 'permissionId',
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
        validate: {
          notEmpty: true
        }
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      }
    },
    {
      sequelize,
      modelName: 'Role',
      tableName: 'roles',
      paranoid: true,
      underscored: true,
    }
  );

  return Role;
};