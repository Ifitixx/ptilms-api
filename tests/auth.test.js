// tests/auth.test.js
const request = require('supertest');
const app = require('../server');
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { TEST_USERNAME, TEST_EMAIL, TEST_PASSWORD } = process.env;

describe('Authentication API', () => {
  let testUserId;
  let testUserToken;
  let testRefreshToken;
  let newUser;

  beforeAll(async () => {
    try {
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
    } catch (error) {
      console.error('Error in beforeAll:', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await db.execute('DELETE FROM users WHERE user_id = ?', [testUserId]);
      await db.end();
    } catch (error) {
      console.error('Error in afterAll:', error);
      throw error;
    }
  });

  beforeEach(() => {
    newUser = {
      username: `newuser-${Date.now()}`,
      email: `new-${Date.now()}@example.com`,
      password: 'newpassword',
      role: 'user',
    };
  });

  afterEach(async () => {
    try {
      await db.execute('DELETE FROM users WHERE username = ?', [newUser.username]);
    } catch (error) {
      console.error('Error in afterEach:', error);
      throw error;
    }
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(newUser);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: TEST_USERNAME,
        password: TEST_PASSWORD,
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body).toHaveProperty('accessToken');
    testUserToken = res.body.accessToken;
    expect(res.headers['set-cookie']).toBeDefined();
    const refreshTokenCookie = res.headers['set-cookie'][0];
    testRefreshToken = refreshTokenCookie.split(';')[0].split('=')[1];
  });

  it('should fail login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: TEST_USERNAME,
        password: 'wrongpassword',
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should request a password reset', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({
        email: TEST_EMAIL,
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Password reset token generated');
  });

  it('should reset a password', async () => {
    // First, get a token by requesting a password reset
    const forgotPasswordRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({
        email: TEST_EMAIL,
      });
    expect(forgotPasswordRes.statusCode).toEqual(200);
    expect(forgotPasswordRes.body).toHaveProperty('token');
    const token = forgotPasswordRes.body.token;

    // Then, reset the password
    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, newPassword: 'newtestpassword' });
    expect(resetRes.statusCode).toEqual(200);
    expect(resetRes.body).toHaveProperty('message', 'Password reset successfully');
  });

  it('should refresh an access token', async () => {
    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`refreshToken=${testRefreshToken}`]);
    expect(refreshRes.statusCode).toEqual(200);
    expect(refreshRes.body).toHaveProperty('accessToken');
  });
});
