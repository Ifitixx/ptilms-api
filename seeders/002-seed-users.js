// ptilms-api/seeders/002-seed-users.js
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import * as constants from '../config/constants.mjs';
import config from '../config/config.cjs';

const { saltRounds } = config;

export default {
  async up(queryInterface, Sequelize) {
    // Fetch the roles from the database
    const roles = await queryInterface.sequelize.query(
      'SELECT id, name FROM Roles',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Check if the roles were found
    if (roles.length === 0) {
      console.error('No roles found in the database. Please seed roles first.');
      return;
    }

    // Find the role IDs for 'Admin' and 'Student'
    const adminRole = roles.find(role => role.name === constants.ROLES.ADMIN);
    const studentRole = roles.find(role => role.name === constants.ROLES.STUDENT);

    // Check if the roles were found
    if (!adminRole || !studentRole) {
      console.error('Admin or Student role not found in the database. Please check your role seed.');
      return;
    }

    const hashedPassword = await bcrypt.hash('Password123!', saltRounds); // Hash the password

    await queryInterface.bulkInsert('Users', [
      {
        id: uuidv4(), // Generate a UUID for the user
        username: 'johndoe',
        email: 'john.doe@example.com',
        password: hashedPassword, // Store the hashed password
        roleId: adminRole.id, // Use the actual admin role ID
        phone_number: '+15551234567',
        date_of_birth: new Date('1990-01-15'),
        sex: constants.USER_SEX_ENUM[0], // Assuming the first value in the enum is 'Male'
        profile_picture_url: 'https://example.com/profile/johndoe.jpg',
        resetToken: null,
        resetTokenExpiry: null,
        lastLogin: null,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      {
        id: uuidv4(), // Generate a UUID for the user
        username: 'janesmith',
        email: 'jane.smith@example.com',
        password: hashedPassword, // Store the hashed password
        roleId: studentRole.id, // Use the actual student role ID
        phone_number: '+15559876543',
        date_of_birth: new Date('1995-05-20'),
        sex: constants.USER_SEX_ENUM[1], // Assuming the second value in the enum is 'Female'
        profile_picture_url: 'https://example.com/profile/janesmith.jpg',
        resetToken: null,
        resetTokenExpiry: null,
        lastLogin: null,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
      // Add more user objects as needed
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};