// ptilms-api/db/seeders/003-seed-role-permissions.js
'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminRoleId = await queryInterface.sequelize.query(
      `SELECT id FROM Roles WHERE name = 'admin';`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    ).then(res => res[0].id);

    const studentRoleId = await queryInterface.sequelize.query(
      `SELECT id FROM Roles WHERE name = 'student';`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    ).then(res => res[0].id);

    const teacherRoleId = await queryInterface.sequelize.query(
      `SELECT id FROM Roles WHERE name = 'teacher';`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    ).then(res => res[0].id);

    const allPermissions = await queryInterface.sequelize.query(
      `SELECT id FROM Permissions;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const adminPermissions = allPermissions.map(permission => ({
      id: uuidv4(),
      roleId: adminRoleId,
      permissionId: permission.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const studentPermissions = allPermissions.filter(permission => permission.name === 'read_user').map(permission => ({
      id: uuidv4(),
      roleId: studentRoleId,
      permissionId: permission.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const teacherPermissions = allPermissions.filter(permission => permission.name === 'read_user' || permission.name === 'update_user').map(permission => ({
      id: uuidv4(),
      roleId: teacherRoleId,
      permissionId: permission.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('RolePermissions', [
      ...adminPermissions,
      ...studentPermissions,
      ...teacherPermissions
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('RolePermissions', null, {});
  },
};