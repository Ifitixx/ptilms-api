'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('assignments', 'department_id', {
      type: Sequelize.UUID,
      allowNull: true,  // Change allowNull to true initially
      field: 'department_id',
      // Remove the references and constraint for now
    });
    await queryInterface.addColumn('assignments', 'level_id', {
      type: Sequelize.UUID,
      allowNull: true, // Change allowNull to true initially
      field: 'level_id',
      // Remove the references and constraint for now
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('assignments', 'department_id');
    await queryInterface.removeColumn('assignments', 'level_id');
  }
};