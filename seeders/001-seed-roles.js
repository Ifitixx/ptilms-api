// ptilms-api/seeders/001-seed-roles.js
import { v4 as uuidv4 } from 'uuid';
import { ROLES } from '../config/constants.mjs';

export default {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Check if roles already exist
      const existingRoles = await queryInterface.sequelize.query(
        'SELECT name FROM roles WHERE deleted_at IS NULL;',
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      if (existingRoles.length > 0) {
        console.log('Roles already exist, skipping seeding.');
        await transaction.commit();
        return;
      }

      const rolesToInsert = [
        {
          id: uuidv4(),
          name: ROLES.ADMIN,
          description: 'System administrator with full access to all features',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          name: ROLES.LECTURER,
          description: 'Lecturer with access to course management and teaching features',
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          name: ROLES.STUDENT,
          description: 'Student with access to learning and course participation features',
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      await queryInterface.bulkInsert('roles', rolesToInsert, { transaction });
      await transaction.commit();
      console.log('Roles seeded successfully.');
    } catch (error) {
      console.error('Error seeding roles:', error);
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('roles', null, { transaction });
      await transaction.commit();
      console.log('Roles table cleared.');
    } catch (error) {
      console.error('Error clearing roles table:', error);
      await transaction.rollback();
      throw error;
    }
  }
};