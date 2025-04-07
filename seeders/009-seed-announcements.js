// ptilms-api/seeders/009-seed-announcements.js
import { v4 as uuidv4 } from 'uuid';
import { ANNOUNCEMENTS } from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('announcements', null, { transaction }); // Clear existing data

      // Fetch courses and a user (e.g., admin) to associate with announcements
      const [courses, users] = await Promise.all([
        queryInterface.sequelize.query(`SELECT id, code FROM Courses;`, {
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction,
        }),
        queryInterface.sequelize.query(`SELECT id FROM Users LIMIT 1;`, { // Fetch a single user (e.g., admin)
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction,
        }),
      ]);

      if (users.length === 0) {
        throw new Error('No users found. Ensure users are seeded before announcements.');
      }
      const userId = users[0].id; // Use the ID of the fetched user

      const announcementsToInsert = ANNOUNCEMENTS.map((announcement) => {
        const course = courses.find((c) => c.code === announcement.courseCode);
        if (!course) {
          throw new Error(`Course with code "${announcement.courseCode}" not found. Ensure courses are seeded first.`);
        }

        return {
          id: uuidv4(),
          title: announcement.title,
          content: announcement.content,
          user_id: userId, // Use the fetched user ID
          course_id: course.id,
          created_at: new Date(),
          updated_at: new Date(),
        };
      });

      await queryInterface.bulkInsert('announcements', announcementsToInsert, { transaction });
      await transaction.commit();
      console.log('Announcements seeded successfully.');
    } catch (error) {
      await transaction.rollback();
      console.error('Error seeding announcements:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('announcements', null, {});
      console.log('Announcements table cleared.');
    } catch (error) {
      console.error('Error clearing announcements table:', error);
    }
  },
};