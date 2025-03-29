import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import * as constants from '../config/constants.mjs';
import config from '../config/config.cjs';

const { saltRounds } = config;

export default {
  async up(queryInterface, Sequelize) {
    try {
      // Fetch the roles from the database
      const roles = await queryInterface.sequelize.query(
        'SELECT id, name FROM Roles',
        { type: queryInterface.sequelize.QueryTypes.SELECT }
      );

      if (roles.length === 0) {
        throw new Error('No roles found in the database. Please seed roles before running this seeder.');
      }

      // Find the role IDs
      const adminRole = roles.find((role) => role.name === constants.ROLES.ADMIN);
      const studentRole = roles.find((role) => role.name === constants.ROLES.STUDENT);
      const lecturerRole = roles.find((role) => role.name === constants.ROLES.LECTURER); // Find lecturer role

      if (!adminRole || !studentRole || !lecturerRole) {
        throw new Error(
          'Admin, Student, or Lecturer role not found in the database. Ensure roles are seeded and constants.mjs is correct.'
        );
      }

      // Use environment variables for sensitive data and defaults for testing
      const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass123!';
      const studentPassword = process.env.STUDENT_PASSWORD || 'StudentPass123!';
      const lecturerPassword = process.env.LECTURER_PASSWORD || 'LecturerPass123!'; // Lecturer password

      // Hash passwords
      const hashedAdminPassword = await bcrypt.hash(adminPassword, saltRounds);
      const hashedStudentPassword = await bcrypt.hash(studentPassword, saltRounds);
      const hashedLecturerPassword = await bcrypt.hash(lecturerPassword, saltRounds); // Hash lecturer password

      await queryInterface.bulkInsert(
        'Users',
        [
          {
            id: process.env.ADMIN_USER_ID || uuidv4(), // Use env var or generate
            username: 'admin',
            email: process.env.ADMIN_EMAIL || 'admin@example.com',
            password: hashedAdminPassword,
            role_id: adminRole.id,
            phone_number: process.env.ADMIN_PHONE || '+15551234567',
            date_of_birth: process.env.ADMIN_DOB ? new Date(process.env.ADMIN_DOB) : new Date('1980-01-01'),
            sex: process.env.ADMIN_SEX || constants.USER_SEX_ENUM[0], // Default to 'Male'
            profile_picture_url: process.env.ADMIN_PIC || 'https://example.com/profile/admin.jpg',
            reset_token: null,
            reset_token_expiry: null,
            is_verified: true,
            verification_token: null,
            verification_token_expiry: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: uuidv4(),
            username: 'student',
            email: process.env.STUDENT_EMAIL || 'student@example.com',
            password: hashedStudentPassword,
            role_id: studentRole.id,
            phone_number: process.env.STUDENT_PHONE || '+15559876543',
            date_of_birth: process.env.STUDENT_DOB ? new Date(process.env.STUDENT_DOB) : new Date('1995-05-20'),
            sex: process.env.STUDENT_SEX || constants.USER_SEX_ENUM[1], // Default to 'Female'
            profile_picture_url: process.env.STUDENT_PIC || 'https://example.com/profile/student.jpg',
            reset_token: null,
            reset_token_expiry: null,
            refresh_token_hash: null,
            is_verified: true,
            verification_token: null,
            verification_token_expiry: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
          { // Add lecturer user
            id: uuidv4(),
            username: 'lecturer',
            email: process.env.LECTURER_EMAIL || 'lecturer@example.com',
            password: hashedLecturerPassword,
            role_id: lecturerRole.id,
            phone_number: process.env.LECTURER_PHONE || '+15554567890',
            date_of_birth: process.env.LECTURER_DOB ? new Date(process.env.LECTURER_DOB) : new Date('1975-03-15'),
            sex: process.env.LECTURER_SEX || constants.USER_SEX_ENUM[0], // Default to 'Male'
            profile_picture_url: process.env.LECTURER_PIC || 'https://example.com/profile/lecturer.jpg',
            reset_token: null,
            reset_token_expiry: null,
            refresh_token_hash: null,
            is_verified: true,
            verification_token: null,
            verification_token_expiry: null,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ],
        {}
      );
    } catch (error) {
      console.error('Error seeding users:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  },
};