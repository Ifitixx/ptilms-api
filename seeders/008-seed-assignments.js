// ptilms-api/seeders/008-seed-assignments.js
import { v4 as uuidv4 } from 'uuid';
import * as constants from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Get all courses
      const courses = await queryInterface.sequelize.query(
        `SELECT id, code FROM Courses;`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      // Helper function to find course IDs
      const findCourseId = (courseCode) => {
        const course = courses.find((course) => course.code === courseCode);
        if (!course) {
          throw new Error(`Course not found: ${courseCode}`);
        }
        return course.id;
      };

      const assignmentsToInsert = constants.ASSIGNMENTS.map((assignment) => ({
        id: uuidv4(),
        title: assignment.title,
        description: assignment.description,
        dueDate: new Date(Date.now() + assignment.dueInDays * 24 * 60 * 60 * 1000),
        courseId: findCourseId(assignment.courseCode),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await queryInterface.bulkInsert('Assignments', assignmentsToInsert, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Assignments', null, {});
  },
};