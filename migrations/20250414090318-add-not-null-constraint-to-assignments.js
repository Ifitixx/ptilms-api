// ptilms-api/migrations/20250414090318-add-not-null-constraint-to-assignments.js
'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('assignments', 'department_id', {
      type: Sequelize.UUID,
      allowNull: false, // Add NOT NULL constraint
      field: 'department_id',
    });
    await queryInterface.addConstraint('assignments', {
      fields: ['department_id'],
      type: 'foreign key',
      name: 'assignments_department_id_foreign_idx', // Constraint name
      references: {
        table: 'departments',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
    await queryInterface.changeColumn('assignments', 'level_id', {
      type: Sequelize.UUID,
      allowNull: false, // Add NOT NULL constraint
      field: 'level_id',
    });
    await queryInterface.addConstraint('assignments', {
      fields: ['level_id'],
      type: 'foreign key',
      name: 'assignments_level_id_foreign_idx', // Constraint name
      references: {
        table: 'levels',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('assignments', 'assignments_department_id_foreign_idx');
    await queryInterface.changeColumn('assignments', 'department_id', {
      type: Sequelize.UUID,
      allowNull: true, // Revert to allowing NULL
      field: 'department_id',
    });
    await queryInterface.removeConstraint('assignments', 'assignments_level_id_foreign_idx');
    await queryInterface.changeColumn('assignments', 'level_id', {
      type: Sequelize.UUID,
      allowNull: true, // Revert to allowing NULL
      field: 'level_id',
    });
  },
};