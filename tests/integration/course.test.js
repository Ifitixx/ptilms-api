import request from 'supertest';
import express from 'express';
import { sequelize, models } from '../../models/index.js';
import { clearDatabase, syncDatabase, closeDatabase, createTestUser } from '../helpers/testUtils.js';
import courseRoutes from '../../routes/courses.js';
import initializeContainer from '../../container.js';
import jwt from 'jsonwebtoken';
import config from '../../config/config.cjs';

describe('Course Endpoints', () => {
  let app;
  let container;
  let authToken;
  let testUser;

  beforeAll(async () => {
    await syncDatabase();
    container = initializeContainer({ sequelize, models });
    app = express();
    app.use(express.json());
    app.use('/api/v1/courses', courseRoutes(container.courseController));
  });

  beforeEach(async () => {
    await clearDatabase();
    await container.roleService.createDefaultRoles();
    
    // Create a test instructor
    testUser = await createTestUser('INSTRUCTOR');
    
    // Generate auth token for the test user
    authToken = jwt.sign(
      { userId: testUser.id, role: 'INSTRUCTOR' },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('POST /api/v1/courses', () => {
    it('should create a new course successfully', async () => {
      const newCourse = {
        title: 'Test Course',
        code: 'TEST101',
        description: 'Test course description',
        departmentId: 1,
        levelId: 1,
        instructorId: testUser.id
      };

      const response = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCourse);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.course.title).toBe(newCourse.title);
    });

    it('should return 400 for invalid course data', async () => {
      const invalidCourse = {
        title: '', // Empty title
        code: 'TEST101'
      };

      const response = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCourse);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/v1/courses', () => {
    beforeEach(async () => {
      // Create some test courses
      await models.Course.bulkCreate([
        {
          title: 'Course 1',
          code: 'TEST101',
          description: 'Test course 1',
          departmentId: 1,
          levelId: 1,
          instructorId: testUser.id
        },
        {
          title: 'Course 2',
          code: 'TEST102',
          description: 'Test course 2',
          departmentId: 1,
          levelId: 1,
          instructorId: testUser.id
        }
      ]);
    });

    it('should return all courses', async () => {
      const response = await request(app)
        .get('/api/v1/courses')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data.courses).toHaveLength(2);
    });

    it('should filter courses by department', async () => {
      const response = await request(app)
        .get('/api/v1/courses?departmentId=1')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.courses).toHaveLength(2);
    });
  });

  describe('GET /api/v1/courses/:id', () => {
    let testCourse;

    beforeEach(async () => {
      testCourse = await models.Course.create({
        title: 'Test Course',
        code: 'TEST101',
        description: 'Test course description',
        departmentId: 1,
        levelId: 1,
        instructorId: testUser.id
      });
    });

    it('should return a specific course', async () => {
      const response = await request(app)
        .get(`/api/v1/courses/${testCourse.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.course.id).toBe(testCourse.id);
    });

    it('should return 404 for non-existent course', async () => {
      const response = await request(app)
        .get('/api/v1/courses/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});