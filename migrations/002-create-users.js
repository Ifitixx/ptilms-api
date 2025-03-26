// ptilms-api/migrations/002-create-users.js
import { DataTypes } from 'sequelize';
import * as constants from '../config/constants.mjs';

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      'Users',
      {
        id: {
          allowNull: false,
          primaryKey: true,
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
        },
        username: {
          type: DataTypes.STRING(constants.USER_USERNAME_MAX_LENGTH),
          allowNull: false,
          unique: true,
        },
        email: {
          type: DataTypes.STRING(constants.USER_EMAIL_MAX_LENGTH),
          allowNull: false,
          unique: true,
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        roleId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: 'Roles',
            key: 'id',
          },
        },
        phone_number: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        date_of_birth: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        sex: {
          type: DataTypes.ENUM(...constants.USER_SEX_ENUM),
          allowNull: true,
        },
        profile_picture_url: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        resetToken: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        resetTokenExpiry: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        lastLogin: {
          type: DataTypes.DATE,
          allowNull: true,
        },
        isVerified: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        createdAt: {
          allowNull: false,
          type: DataTypes.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: DataTypes.DATE,
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        },
      },
      {
        underscored: true,
      }
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  },
};