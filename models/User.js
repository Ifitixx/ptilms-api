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
      // Add association to Course
      User.hasMany(models.Course, {
        foreignKey: 'lecturerId',
        as: 'courses',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }

    async verifyPassword(password) {
      // Use email to find the user with sensitive data
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
        field: 'role_id', // Ensure snake_case
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'phone_number', // Ensure snake_case
      },
      dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'date_of_birth', // Ensure snake_case
      },
      sex: {
        type: DataTypes.ENUM(...USER_SEX_ENUM),
        allowNull: true,
      },
      profilePictureUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'profile_picture_url', // Ensure snake_case
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login', // Ensure snake_case
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'is_verified', // Ensure snake_case
      },
      verificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
        field: 'verification_token', // Ensure snake_case
      },
      resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'reset_token', // Ensure snake_case
      },
      resetTokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reset_token_expiry', // Ensure snake_case
      },
      refreshTokenHash: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'refresh_token_hash', // Ensure snake_case
      },
      // Add department column
      department: {
        type: DataTypes.STRING,
        allowNull: true, // Assuming department is optional for non-lecturers
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      paranoid: true,
      underscored: true, // Ensure snake_case for timestamps and field names
      defaultScope: {
        attributes: { exclude: ['password', 'resetToken', 'resetTokenExpiry', 'refreshTokenHash'] }, // Exclude refreshTokenHash
      },
      scopes: {
        withSensitive: {
          attributes: { include: ['password', 'resetToken', 'resetTokenExpiry', 'refreshTokenHash'] }, // Include refreshTokenHash
        },
        withDeleted: {  // Added scope to include soft-deleted records
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