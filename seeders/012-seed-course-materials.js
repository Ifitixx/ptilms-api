// ptilms-api/seeders/012-seed-course-materials.js
import { v4 as uuidv4 } from 'uuid';
import * as constants from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Validate COURSES_MATERIALS in constants.mjs
      if (!constants.COURSES_MATERIALS || !Array.isArray(constants.COURSES_MATERIALS)) {
        throw new Error(
          'COURSES_MATERIALS is missing or not an array in constants.mjs. Please ensure it is defined and properly formatted.'
        );
      }

      // Get all courses
      const courses = await queryInterface.sequelize.query(
        `SELECT id, code FROM Courses;`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      if (courses.length === 0) {
        throw new Error('No courses found in the database. Please seed courses before running this seeder.');
      }

      // Helper function to find course IDs
      const findCourseId = (courseCode) => {
        const course = courses.find((course) => course.code === courseCode);
        if (!course) {
          throw new Error(
            `Course not found: ${courseCode}. Ensure the course is seeded and the courseCode in constants.mjs is correct.`
          );
        }
        return course.id;
      };

      const courseMaterialsToInsert = constants.COURSES_MATERIALS.map((material) => ({
        id: uuidv4(),
        title: material.title,
        description: material.description,
        type: material.type,
        path: material.path,
        course_id: findCourseId(material.courseCode),
        created_at: new Date(),
        updated_at: new Date(),
      }));

      await queryInterface.bulkInsert('CourseMaterials', courseMaterialsToInsert, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      console.error('Error seeding course materials:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CourseMaterials', null, {});
  },
};