// ptilms-api/migrations/20250416110949-add-department-level-to-announcements.js
import { DataTypes } from 'sequelize';

export default {
  async up(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      // Step 1: Add columns as nullable first
      await queryInterface.addColumn('announcements', 'department_id', {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'departments',
          key: 'id'
        }
      }, { transaction });

      await queryInterface.addColumn('announcements', 'level_id', {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'levels',
          key: 'id'
        }
      }, { transaction });

      // Step 2: Update existing records with department_id and level_id from their courses
      await queryInterface.sequelize.query(`
        UPDATE announcements a
        INNER JOIN courses c ON a.course_id = c.id
        SET a.department_id = c.department_id,
            a.level_id = c.level_id
        WHERE a.course_id IS NOT NULL;
      `, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.removeColumn('announcements', 'department_id', { transaction });
      await queryInterface.removeColumn('announcements', 'level_id', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};