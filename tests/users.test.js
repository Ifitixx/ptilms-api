// tests/users.test.js
const request = require('supertest');
const app = require('../server');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

describe('User API', () => {
  let testUserId;
  let testUserToken;
  let adminUserId;
  let adminUserToken;

  beforeAll(async () => {
    // Create a test user
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    testUserId = uuidv4();
    const insertQuery = `
      INSERT INTO users 
      (user_id, username, email, password, role)
      VALUES (?, ?, ?, ?, ?)
    `;
    await db.execute(insertQuery, [testUserId, 'testuser', 'test@example.com', hashedPassword, 'user']);

    // Create an admin user
    const adminHashedPassword = await bcrypt.hash('adminpassword', 10);
    adminUserId = uuidv4();
    await db.execute(insertQuery, [adminUserId, 'adminuser', 'admin@example.com', adminHashedPassword, 'admin']);

    // Login the test user to get a token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'testpassword' });
    testUserToken = loginRes.body.accessToken;

    // Login the admin user to get a token
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ username: 'adminuser', password: 'adminpassword' });
    adminUserToken = adminLoginRes.body.accessToken;
  });

  afterAll(async () => {
    // Clean up the test users
    await db.execute('DELETE FROM users WHERE user_id IN (?, ?)', [testUserId, adminUserId]);
    await db.end();
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
      .send({ currentPassword: 'testpassword', newPassword: 'newpassword123' });
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
      .get('/api/users/modified?since=0')
      .set('Authorization', `Bearer ${adminUserToken}`);
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should fail to get user details with invalid token', async () => {
    const res = await request(app)
      .get(`/api/users/${testUserId}`)
      .set('Authorization', `Bearer invalidtoken`);
    expect(res.statusCode).toEqual(403);
    expect(res.body).toHaveProperty('message', 'Invalid token');
  });

  it('should fail to get user details with no token', async () => {
    const res = await request(app)
      .get(`/api/users/${testUserId}`);
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'No token provided');
  });
});