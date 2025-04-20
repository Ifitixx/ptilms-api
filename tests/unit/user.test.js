import { sequelize, models } from '../../models/index.js';
import { clearDatabase, syncDatabase, closeDatabase } from '../helpers/testUtils.js';
import UserRepository from '../../repositories/UserRepository.js';

describe('User Tests', () => {
  let userRepository;

  beforeAll(async () => {
    await syncDatabase();
    userRepository = new UserRepository(models);
  });

  beforeEach(async () => {
    await clearDatabase();
    // Create a role for testing
    await models.Role.create({
      name: 'STUDENT',
      description: 'Student Role'
    });
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('User Model', () => {
    it('should hash password before saving', async () => {
      const user = await models.User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        roleId: 1
      });

      expect(user.password).not.toBe('password123');
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/);
    });

    it('should not save user without required fields', async () => {
      try {
        await models.User.create({
          username: 'testuser'
        });
        fail('Should not reach this point');
      } catch (error) {
        expect(error.name).toBe('SequelizeValidationError');
      }
    });
  });

  describe('UserRepository', () => {
    it('should create a user', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        roleId: 1
      };

      const user = await userRepository.create(userData);
      expect(user.email).toBe(userData.email);
      expect(user.username).toBe(userData.username);
    });

    it('should find user by email', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        roleId: 1
      };

      await userRepository.create(userData);
      const foundUser = await userRepository.findByEmail(userData.email);
      expect(foundUser.email).toBe(userData.email);
    });

    it('should update user details', async () => {
      const user = await userRepository.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        roleId: 1
      });

      const updatedUser = await userRepository.update(user.id, {
        username: 'updateduser'
      });

      expect(updatedUser.username).toBe('updateduser');
    });
  });
});