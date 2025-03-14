// tests/users.test.js
const request = require('supertest');
const app = require('../server');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { TEST_USERNAME, TEST_EMAIL, TEST_PASSWORD, ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

describe('User API', () => {
  let testUserId;
  let testUserToken;
  let adminUserId;
  let adminUserToken;

  beforeAll(async () => {
    try {
      // Create a test user
      const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);
      testUserId = uuidv4();
      const insertQuery = `
        INSERT INTO users
        (user_id, username, email, password, role)
        VALUES (?, ?, ?, ?, ?)
      `;
      await db.execute(insertQuery, [
        testUserId,
        TEST_USERNAME,
        TEST_EMAIL,
        hashedPassword,
        'user',
      ]);

      // Create an admin user
      const adminHashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      adminUserId = uuidv4();
      await db.execute(insertQuery, [
        adminUserId,
        ADMIN_USERNAME,
        ADMIN_EMAIL,
        adminHashedPassword,
        'admin',
      ]);

      // Login the test user to get a token
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ username: TEST_USERNAME, password: TEST_PASSWORD });
      testUserToken = loginRes.body.accessToken;

      // Login the admin user to get a token
      const adminLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD });
      adminUserToken = adminLoginRes.body.accessToken;
    } catch (error) {
      console.error('Error in beforeAll:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      // Clean up the test users
      await db.execute('DELETE FROM users WHERE user_id IN (?, ?)', [testUserId, adminUserId]);
      await db.end();
    } catch (error) {
      console.error('Error in afterAll:', error);
      throw error;
    }
  });

  it('should get user details by ID (user role)', async () => {
    const res = await request(app)
      .get(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${testUserToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user_id', testUserId);
  });

  it('should get user details by ID (admin role)', async () => {
    const res = await request(app)
      .get(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${adminUserToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user_id', testUserId);
  });

  it('should update user details', async () => {
    const res = await request(app)
      .put(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ username: 'updateduser', email: 'updated@example.com' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'User updated successfully');
  });

  it('should change user password', async () => {
    const res = await request(app)
      .put(`/api/users/${testUserId}/change-password`)
      .set('Authorization', `Bearer ${testUserToken}`)
      .send({ currentPassword: TEST_PASSWORD, newPassword: 'newpassword123' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Password changed successfully');
  });

  it('should delete a user (admin role)', async () => {
    const res = await request(app)
      .delete(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer ${adminUserToken}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'User deleted successfully');
  });

  it('should get modified users (admin role)', async () => {
    const res = await request(app)
      .get(`/api/users/modified?since=0`)
      .set('Authorization', `Bearer ${adminUserToken}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
