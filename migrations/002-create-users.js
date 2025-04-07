// ptilms-api/migrations/002-create-users.js
import { DataTypes } from 'sequelize';
import { USER_USERNAME_MAX_LENGTH, USER_EMAIL_MAX_LENGTH, USER_SEX_ENUM } from '../config/constants.mjs';

export default {
  async up(queryInterface) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      username: {
        type: DataTypes.STRING(USER_USERNAME_MAX_LENGTH),
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING(USER_EMAIL_MAX_LENGTH),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Roles',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
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
        type: DataTypes.ENUM(...USER_SEX_ENUM),
        allowNull: true,
      },
      profile_picture_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reset_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reset_token_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      refresh_token_hash: {
        type: DataTypes.STRING,
        allowNull: false, // Corrected to allowNull: false
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      verification_token: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      verification_token_expiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      // Add department column
      department: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('users');
  },
};