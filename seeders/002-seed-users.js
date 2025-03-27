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

      // Find the role IDs for 'Admin' and 'Student'
      const adminRole = roles.find((role) => role.name === constants.ROLES.ADMIN);
      const studentRole = roles.find((role) => role.name === constants.ROLES.STUDENT);

      if (!adminRole || !studentRole) {
        throw new Error(
          'Admin or Student role not found in the database. Ensure roles are seeded and constants.mjs is correct.'
        );
      }

      // Use environment variables for sensitive data
      const adminPassword = process.env.ADMIN_PASSWORD || 'DefaultAdmin123!';
      const studentPassword = process.env.STUDENT_PASSWORD || 'DefaultStudent123!';

      // Hash passwords
      const hashedAdminPassword = await bcrypt.hash(adminPassword, saltRounds);
      const hashedStudentPassword = await bcrypt.hash(studentPassword, saltRounds);

      await queryInterface.bulkInsert(
        'Users',
        [
          {
            id: uuidv4(),
            username: 'admin',
            email: process.env.ADMIN_EMAIL || 'admin@example.com',
            password: hashedAdminPassword,
            role_id: adminRole.id,
            phone_number: '+15551234567',
            date_of_birth: new Date('1980-01-01'),
            sex: constants.USER_SEX_ENUM[0], // Assuming 'Male'
            profile_picture_url: 'https://example.com/profile/admin.jpg',
            reset_token: null,
            reset_token_expiry: null,
            is_verified: true,
            created_at: new Date(),
            updated_at: new Date(),
          },
          {
            id: uuidv4(),
            username: 'student',
            email: process.env.STUDENT_EMAIL || 'student@example.com',
            password: hashedStudentPassword,
            role_id: studentRole.id,
            phone_number: '+15559876543',
            date_of_birth: new Date('1995-05-20'),
            sex: constants.USER_SEX_ENUM[1], // Assuming 'Female'
            profile_picture_url: 'https://example.com/profile/student.jpg',
            reset_token: null,
            reset_token_expiry: null,
            is_verified: true,
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