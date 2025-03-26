// ptilms-api/seeders/012-seed-course-materials.js
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

      // Check if COURSES_MATERIALS exists in constants.mjs
      if (!constants.COURSES_MATERIALS || !Array.isArray(constants.COURSES_MATERIALS)) {
        throw new Error('COURSES_MATERIALS array not found or is not an array in constants.mjs');
      }

      const courseMaterialsToInsert = constants.COURSES_MATERIALS.map((material) => ({
        id: uuidv4(),
        title: material.title,
        description: material.description,
        type: material.type,
        path: material.path,
        courseId: findCourseId(material.courseCode),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await queryInterface.bulkInsert('CourseMaterials', courseMaterialsToInsert, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('CourseMaterials', null, {});
  },
};