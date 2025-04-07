// ptilms-api/seeders/012-seed-course-materials.js
import { v4 as uuidv4 } from 'uuid';
import { COURSES_MATERIALS } from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('course_materials', null, { transaction }); // Clear existing data

      // Fetch courses
      const courses = await queryInterface.sequelize.query(`SELECT id, code FROM Courses;`, {
        type: queryInterface.sequelize.QueryTypes.SELECT,
        transaction,
      });

      const courseMaterialsToInsert = COURSES_MATERIALS.map((material) => {
        const course = courses.find((c) => c.code === material.courseCode);
        if (!course) {
          throw new Error(`Course with code "${material.courseCode}" not found. Ensure courses are seeded first.`);
        }

        return {
          id: uuidv4(),
          title: material.title,
          description: material.description,
          type: material.type,
          path: material.path,
          course_id: course.id,
          created_at: new Date(),
          updated_at: new Date(),
        };
      });

      await queryInterface.bulkInsert('course_materials', courseMaterialsToInsert, { transaction });
      await transaction.commit();
      console.log('Course materials seeded successfully.');
    } catch (error) {
      await transaction.rollback();
      console.error('Error seeding course materials:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('course_materials', null, {});
      console.log('Course materials table cleared.');
    } catch (error) {
      console.error('Error clearing course materials table:', error);
    }
  },
};