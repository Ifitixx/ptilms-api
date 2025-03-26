// ptilms-api/seeders/007-seed-courses.js
import { v4 as uuidv4 } from 'uuid';
import * as constants from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Get all departments
      const departments = await queryInterface.sequelize.query(
        `SELECT id, name FROM Departments;`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      // Get all levels
      const levels = await queryInterface.sequelize.query(
        `SELECT id, name FROM Levels;`,
        { type: queryInterface.sequelize.QueryTypes.SELECT, transaction }
      );

      // Helper function to find department and level IDs
      const findDepartmentId = (departmentName) => {
        const department = departments.find((department) => department.name === departmentName);
        if (!department) {
          throw new Error(`Department not found: ${departmentName}`);
        }
        return department.id;
      };
      const findLevelId = (levelName) => {
        const level = levels.find((level) => level.name === levelName);
        if (!level) {
          throw new Error(`Level not found: ${levelName}`);
        }
        return level.id;
      };

      const coursesToInsert = constants.COURSES.map((course) => ({
        id: uuidv4(),
        title: course.title,
        code: course.code,
        format: course.format,
        description: course.description,
        departmentId: findDepartmentId(course.department),
        levelId: findLevelId(course.level),
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await queryInterface.bulkInsert('Courses', coursesToInsert, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Courses', null, {});
  },
};