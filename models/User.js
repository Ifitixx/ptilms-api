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
        onDelete: 'SET NULL', // Changed to SET NULL for consistency with migration
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
      User.hasMany(models.Course, {
        foreignKey: 'lecturerId',
        as: 'courses',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }

    async verifyPassword(password) {
      const userWithPassword = await this.constructor.scope('withSensitive').findOne({ where: { email: this.email } });

      if (!userWithPassword) {
        throw new Error("User not found with sensitive data");
      }
      return compare(password, userWithPassword.password);
    }

    toJSON() {
      const values = super.toJSON();
      delete values.password;
      delete values.resetToken;
      delete values.resetTokenExpiry;
      delete values.refreshTokenHash; // Also exclude refreshTokenHash from default JSON output
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
          model: 'roles',
          key: 'id',
        },
        field: 'role_id',
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'phone_number',
      },
      dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'date_of_birth',
      },
      sex: {
        type: DataTypes.ENUM(...USER_SEX_ENUM),
        allowNull: true,
      },
      profilePictureUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'profile_picture_url',
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login',
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'is_verified',
      },
      verificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        field: 'verification_token',
      },
      resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'reset_token',
      },
      resetTokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reset_token_expiry',
      },
      refreshTokenHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'refresh_token_hash',
      },
      department: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      paranoid: true,
      underscored: true,
      defaultScope: {
        attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry', 'refreshTokenHash'] },
      },
      scopes: {
        withSensitive: {
          attributes: { include: ['password', 'resetToken', 'resetTokenExpiry', 'refreshTokenHash'] },
        },
        withDeleted: {
          paranoid: false,
        },
      },
      hooks: {
        beforeSave: async (user) => {
          if (user.changed('password')) {
            console.log("Hashing password in beforeSave hook...");
            const salt = await genSalt(saltRounds);
            user.password = await hash(user.password, salt);
            console.log("Password hashed successfully.");
          }
        },
      },
    }
  );

  return User;
};