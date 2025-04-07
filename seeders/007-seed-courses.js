// ptilms-api/seeders/007-seed-courses.js
import { v4 as uuidv4 } from 'uuid';
import { COURSES, ROLES } from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('courses', null, { transaction }); // Clear existing data

      // Fetch departments, levels, and lecturers with their departments and emails
      const [departments, levels, lecturers] = await Promise.all([
        queryInterface.sequelize.query(`SELECT id, name FROM Departments;`, {
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction,
        }),
        queryInterface.sequelize.query(`SELECT id, name FROM Levels;`, {
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction,
        }),
        queryInterface.sequelize.query(
          `SELECT id, department, email FROM Users WHERE role_id IN (SELECT id FROM Roles WHERE name = '${ROLES.LECTURER}');`,
          { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
        ),
      ]);

      if (lecturers.length === 0) {
        throw new Error('No lecturers found. Ensure lecturers are seeded before courses.');
      }

      const coursesToInsert = COURSES.map((course) => {
        const department = departments.find((dept) => dept.name === course.department);
        if (!department) {
          throw new Error(`Department "${course.department}" not found. Ensure departments are seeded first.`);
        }
        const level = levels.find((lvl) => lvl.name === course.level);
        if (!level) {
          throw new Error(`Level "${course.level}" not found. Ensure levels are seeded first.`); }

        // Assign lecturer based on email
        const lecturer = lecturers.find(l => l.email === course.lecturerEmail);
        if (!lecturer) {
          throw new Error(`No lecturer found with email "${course.lecturerEmail}". Ensure the lecturer exists and has the correct email.`);
        }
        const lecturerId = lecturer.id;

        return {
          id: uuidv4(),
          title: course.title,
          code: course.code,
          format: course.format,
          description: course.description,
          units: course.units,
          is_departmental: course.isDepartmental,
          department_id: department.id,
          level_id: level.id,
          lecturer_id: lecturerId, // Assign lecturer here
          created_at: new Date(),
          updated_at: new Date(),
        };
      });

      await queryInterface.bulkInsert('courses', coursesToInsert, { transaction });
      await transaction.commit();
      console.log('Courses seeded successfully.');
    } catch (error) {
      await transaction.rollback();
      console.error('Error seeding courses:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.bulkDelete('courses', null, {});
      console.log('Courses table cleared.');
    } catch (error) {
      console.error('Error clearing courses table:', error);
    }
  },
};