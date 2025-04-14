// ptilms-api/seeders/008-seed-assignments.js
import { v4 as uuidv4 } from 'uuid';
import { ASSIGNMENTS } from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('assignments', null, { transaction }); // Clear existing data

      // Fetch courses, including departmentId and levelId
      const courses = await queryInterface.sequelize.query(
        `SELECT id, code, department_id, level_id FROM Courses;`,
        {
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction,
        }
      );

      if (!courses || courses.length === 0) {
        throw new Error('No courses found. Ensure courses are seeded and the Courses table has department_id and level_id.');
      }

      const assignmentsToInsert = ASSIGNMENTS.map((assignment) => {
        const course = courses.find((c) => c.code === assignment.courseCode);
        if (!course) {
          throw new Error(`Course with code "${assignment.courseCode}" not found. Ensure courses are seeded first.`);
        }
        if (!course.department_id || !course.level_id) {
          throw new Error(`Course with code "${assignment.courseCode}" is missing department_id or level_id.`);
        }
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + assignment.dueInDays);

        return {
          id: uuidv4(),
          title: assignment.title,
          description: assignment.description,
          due_date: dueDate,
          course_id: course.id,
          department_id: course.department_id,
          level_id: course.level_id,
          created_at: new Date(),
          updated_at: new Date(),
        };
      });

      await queryInterface.bulkInsert('assignments', assignmentsToInsert, { transaction });
      await transaction.commit();
      console.log('Assignments seeded successfully.');
    } catch (error) {
      await transaction.rollback();
      console.error('Error seeding assignments:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('assignments', null, {});
      console.log('Assignments table cleared.');
    } catch (error) {
      console.error('Error clearing assignments table:', error);
    }
  },
};