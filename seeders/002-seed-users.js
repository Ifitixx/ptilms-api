// ptilms-api/seeders/002-seed-users.js
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { ROLES, USER_SEX_ENUM } from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('users', null, { transaction });

      const saltRounds = 12; // Consider moving this to config if not already there

      // Fetch roles
      const [adminRole, studentRole, lecturerRole] = await Promise.all([
        queryInterface.sequelize.query(`SELECT id FROM Roles WHERE name = '${ROLES.ADMIN}';`, {
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction,
        }),
        queryInterface.sequelize.query(`SELECT id FROM Roles WHERE name = '${ROLES.STUDENT}';`, {
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction,
        }),
        queryInterface.sequelize.query(`SELECT id FROM Roles WHERE name = '${ROLES.LECTURER}';`, {
          type: queryInterface.sequelize.QueryTypes.SELECT,transaction,
        }),
      ]);

      if (!adminRole.length || !studentRole.length || !lecturerRole.length) {
        throw new Error('Required roles not found. Ensure roles are seeded before users.');
      }

      const adminRefreshTokenHash = await bcrypt.hash(uuidv4(), saltRounds);
      const studentRefreshTokenHash = await bcrypt.hash(uuidv4(), saltRounds);
      const lecturerRefreshTokenHash = await bcrypt.hash(uuidv4(), saltRounds);

      const usersToInsert = [
        {
          id: uuidv4(),
          username: process.env.ADMIN_USERNAME || 'admin',
          email: process.env.ADMIN_EMAIL || 'admin@example.com',
          password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', saltRounds),
          role_id: adminRole[0].id,
          phone_number: '09037249306',
          date_of_birth: new Date('1980-01-01'),
          sex: USER_SEX_ENUM[0],
          profile_picture_url: '/uploads/admin.jpg',
          last_login: new Date(),
          is_verified: true,
          verification_token: uuidv4(),
          verification_token_expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
          refresh_token_hash: adminRefreshTokenHash,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          username: process.env.STUDENT_USERNAME || 'student1',
          email: process.env.STUDENT_EMAIL || 'student1@example.com',
          password: await bcrypt.hash(process.env.STUDENT_PASSWORD || 'Student123!', saltRounds),
          role_id: studentRole[0].id,
          phone_number: '09014224975',
          date_of_birth: new Date('2002-05-15'),
          sex: USER_SEX_ENUM[1],
          profile_picture_url: '/uploads/student1.jpg',
          last_login: new Date(),
          is_verified: true,
          verification_token: uuidv4(),
          verification_token_expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
          refresh_token_hash: studentRefreshTokenHash,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          username: process.env.LECTURER_USERNAME || 'lecturer1',
          email: process.env.LECTURER_EMAIL || 'lecturer1@example.com',
          password: await bcrypt.hash(process.env.LECTURER_PASSWORD || 'Lecturer123!', saltRounds),
          role_id: lecturerRole[0].id,
          phone_number: '555-123-4567',
          date_of_birth: new Date('1985-08-20'),
          sex: USER_SEX_ENUM[0],
          profile_picture_url: '/uploads/lecturer1.jpg',
          last_login: new Date(),
          is_verified: true,
          verification_token: uuidv4(),
          verification_token_expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
          refresh_token_hash: lecturerRefreshTokenHash,
          created_at: new Date(),
          updated_at: new Date(),
          department: "Computer Engineering Technology",
        },
        {
          id: uuidv4(),
          username: "lecturer2",
          email: "lecturer2@example.com",
          password: await bcrypt.hash("Lecturer2Pass!", saltRounds), // Replace with a secure password
          role_id: lecturerRole[0].id,
          department: "Computer Science & Information Technology",
          phone_number: '555-987-6543',
          date_of_birth: new Date('1978-03-10'),
          sex: USER_SEX_ENUM[1],
          profile_picture_url: '/uploads/lecturer2.jpg',
          last_login: new Date(),
          is_verified: true,
          verification_token: uuidv4(),
          verification_token_expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
          created_at: new Date(),
          updated_at: new Date(),
          refresh_token_hash: await bcrypt.hash(uuidv4(), saltRounds),
        },
        {
          id: uuidv4(),
          username: "lecturer3",
          email: "lecturer3@example.com",
          password: await bcrypt.hash("Lecturer3Pass!", saltRounds), // Replace with a secure password
          role_id: lecturerRole[0].id,
          department: "Computer Science & Information Technology",
          phone_number: '555-555-1212',
          date_of_birth: new Date('1990-11-22'),
          sex: USER_SEX_ENUM[0],
          profile_picture_url: '/uploads/lecturer3.jpg',
          last_login: new Date(),
          is_verified: true,
          verification_token: uuidv4(),
          verification_token_expiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
          created_at: new Date(),
          updated_at: new Date(),
          refresh_token_hash: await bcrypt.hash(uuidv4(), saltRounds),
        },
        // ... add more lecturers as needed, ensuring emails match those in COURSES
      ];

      await queryInterface.bulkInsert('users', usersToInsert, { transaction });
      await transaction.commit();
      console.log('Users seeded successfully.');
    } catch (error) {
      await transaction.rollback();
      console.error('Error seeding users:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('users', null, {});
      console.log('Users table cleared.');
    } catch (error) {
      console.error('Error clearing users table:', error);
    }
  },
};