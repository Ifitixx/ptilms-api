// ptilms-api/seeders/009-seed-announcements.js
import { v4 as uuidv4 } from 'uuid';
import * as constants from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Get all users
      const users = await queryInterface.sequelize.query(
        `SELECT id FROM Users;`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );
      if (users.length === 0) {
        throw new Error('No users found to associate with announcements.');
      }
      // Get all courses
      const courses = await queryInterface.sequelize.query(
        `SELECT id FROM Courses;`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );
      if (courses.length === 0) {
        throw new Error('No courses found to associate with announcements.');
      }
      // Helper function to find user IDs
      const findUserId = () => {
        // Select a random user
        const randomIndex = Math.floor(Math.random() * users.length);
        return users[randomIndex].id;
      };
      // Helper function to find course IDs
      const findCourseId = () => {
        // Select a random course
        const randomIndex = Math.floor(Math.random() * courses.length);
        return courses[randomIndex].id;
      };

      const announcementsToInsert = constants.ANNOUNCEMENTS.map((announcement) => ({
        id: uuidv4(),
        title: announcement.title,
        content: announcement.content,
        userId: findUserId(),
        courseId: findCourseId(), // Add courseId
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await queryInterface.bulkInsert('Announcements', announcementsToInsert, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Announcements', null, {});
  },
};