// ptilms-api/models/User.js
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const config = require('../config/config');

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Role, {
        foreignKey: 'roleId',
        as: 'role',
      });
    }

    async verifyPassword(password) {
      return bcrypt.compare(password, this.password);
    }

    toJSON() {
      const values = super.toJSON();
      delete values.password;
      delete values.resetToken;
      delete values.resetTokenExpiry;
      return values;
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
        validate: {
          len: [3, 50],
        },
      },
      email: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isStrongPassword(value) {
            if (
              !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
                value
              )
            ) {
              throw new Error(
                'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character'
              );
            }
          },
        },
      },
      roleId: {
        type: DataTypes.UUID, // Change to UUID
        allowNull: false,
      },
      // Optional fields for profile management
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true, // Make it optional
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false, // Make it not nullable
      },
      resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetTokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      paranoid: true,
      defaultScope: {
        attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry'] },
      },
      scopes: {
        withSensitive: {
          attributes: { include: ['password', 'resetToken', 'resetTokenExpiry'] },
        },
      },
      hooks: {
        beforeSave: async (user) => {
          if (user.changed('password')) {
            const saltRounds = parseInt(config.saltRounds, 10) || 12; // Convert to number
            const salt = await bcrypt.genSalt(saltRounds);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );

  return User;
};