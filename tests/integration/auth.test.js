import request from 'supertest';
import express from 'express';
import { sequelize, models } from '../../models/index.js';
import { clearDatabase, syncDatabase, closeDatabase } from '../helpers/testUtils.js';
import authRoutes from '../../routes/auth.js';
import initializeContainer from '../../container.js';

describe('Auth Endpoints', () => {
  let app;
  let container;

  beforeAll(async () => {
    await syncDatabase();
    container = initializeContainer({ sequelize, models });
    app = express();
    app.use(express.json());
    app.use('/api/v1/auth', authRoutes(container.authController));
  });

  beforeEach(async () => {
    await clearDatabase();
    // Create default roles
    await container.roleService.createDefaultRoles();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully', async () => {
      const newUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test@123456',
        roleId: 1 // Assuming STUDENT role has ID 1
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user.email).toBe(newUser.email);
    });

    it('should return 400 for invalid input', async () => {
      const invalidUser = {
        username: 'test',
        email: 'invalid-email',
        password: '123' // Too short
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      // First register a user
      const user = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Test@123456',
        roleId: 1
      };

      await request(app)
        .post('/api/v1/auth/register')
        .send(user);

      // Then try to login
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: user.email,
          password: user.password
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body).toHaveProperty('success', true);
      expect(loginResponse.body.data).toHaveProperty('token');
      expect(loginResponse.body.data).toHaveProperty('refreshToken');
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('success', false);
    });
  });
});