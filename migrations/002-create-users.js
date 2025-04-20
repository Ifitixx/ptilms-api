// ptilms-api/migrations/002-create-users.js
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
        allowNull: true, // Keep allowNull: true if a user can exist without a role initially
        references: { // Added explicit foreign key reference
          model: 'roles', // Corrected to lowercase table name
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // Changed to SET NULL
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
        allowNull: false,
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
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
      deleted_at: { // Added for soft deletes
        type: DataTypes.DATE,
        allowNull: true,
      },
      department: { // Assuming this remains a string column for now
        type: DataTypes.STRING,
        allowNull: true,
      },
      // If department were a foreign key to departments table:
      // department_id: {
      //   type: DataTypes.UUID, // Or DataTypes.INTEGER
      //   allowNull: true,
      //   references: {
      //     model: 'departments',
      //     key: 'id',
      //   },
      //   onUpdate: 'CASCADE',
      //   onDelete: 'SET NULL',
      // }
    });
  },
  async down(queryInterface) {
    // Sequelize handles removing foreign keys defined in the table creation
    await queryInterface.dropTable('users');
  },
};