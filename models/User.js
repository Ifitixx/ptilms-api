// ptilms-api/models/User.js
import { Model, DataTypes } from 'sequelize';
import { compare, genSalt, hash } from 'bcrypt';
import config from '../config/config.cjs';
const { saltRounds } = config;
import {
  USER_USERNAME_MAX_LENGTH,
  USER_USERNAME_MIN_LENGTH,
  USER_EMAIL_MAX_LENGTH,
  USER_PASSWORD_REGEX,
  USER_PASSWORD_MIN_LENGTH,
  USER_SEX_ENUM,
} from '../config/constants.mjs';

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Role, {
        foreignKey: 'roleId',
        as: 'role',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      User.hasMany(models.Announcement, {
        foreignKey: 'userId',
        as: 'announcements',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
      User.hasMany(models.ChatMessage, {
        foreignKey: 'userId',
        as: 'messages',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      });
    }

    async verifyPassword(password) {
      return compare(password, this.password);
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
        type: DataTypes.STRING(USER_USERNAME_MAX_LENGTH),
        unique: true,
        allowNull: false,
        validate: {
          len: [USER_USERNAME_MIN_LENGTH, USER_USERNAME_MAX_LENGTH],
        },
      },
      email: {
        type: DataTypes.STRING(USER_EMAIL_MAX_LENGTH),
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
            if (!USER_PASSWORD_REGEX.test(value)) {
              throw new Error(
                `Password must contain at least ${USER_PASSWORD_MIN_LENGTH} characters, one uppercase, one lowercase, one number, and one special character`
              );
            }
          },
        },
      },
      roleId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Roles',
          key: 'id',
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      sex: {
        type: DataTypes.ENUM(...USER_SEX_ENUM),
        allowNull: true,
      },
      profilePictureUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      verificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetTokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      refreshTokenHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      paranoid: true,
      underscored: true,
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
            const salt = await genSalt(saltRounds);
            user.password = await hash(user.password, salt);
          }
        },
      },
    }
  );

  return User;
};