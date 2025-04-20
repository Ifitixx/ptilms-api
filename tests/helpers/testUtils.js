import { sequelize, models } from '../../models/index.js';
import { ROLES } from '../../config/constants.mjs';

export const syncDatabase = async () => {
  await sequelize.sync({ force: true });
};

export const clearDatabase = async () => {
  await Promise.all(
    Object.values(models).map(model => {
      if (model.destroy) {
        return model.destroy({ where: {}, force: true });
      }
    })
  );
};

export const closeDatabase = async () => {
  await sequelize.close();
};

export const createTestUser = async (roleName = ROLES.STUDENT) => {
  // Create role first
  const role = await models.Role.create({
    name: roleName,
    description: `Test ${roleName} Role`
  });

  // Create and return user
  return await models.User.create({
    username: `test_${roleName.toLowerCase()}`,
    email: `test_${roleName.toLowerCase()}@example.com`,
    password: 'Test@123456',
    roleId: role.id
  });
};

export const createTestDepartment = async () => {
  return await models.Department.create({
    name: 'Test Department',
    code: 'TEST',
    description: 'Test Department Description'
  });
};

export const createTestLevel = async () => {
  return await models.Level.create({
    name: 'Test Level',
    description: 'Test Level Description'
  });
};

export const createTestCourse = async (instructorId, departmentId, levelId) => {
  return await models.Course.create({
    title: 'Test Course',
    code: 'TEST101',
    description: 'Test Course Description',
    instructorId,
    departmentId,
    levelId
  });
};

export const createTestAssignment = async (courseId, departmentId, levelId) => {
  return await models.Assignment.create({
    title: 'Test Assignment',
    description: 'Test Assignment Description',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    courseId,
    departmentId,
    levelId
  });
};