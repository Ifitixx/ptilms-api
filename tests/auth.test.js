// tests/auth.test.js
const request = require('supertest');
const app = require('../server'); // Assuming you export your app from server.js
const db = require('../config/db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

describe('Authentication API', () => {
  let testUserId;
  let testUserToken;

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
  });

  afterAll(async () => {
    // Clean up the test user
    await db.execute('DELETE FROM users WHERE user_id = ?', [testUserId]);
    await db.end();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'newuser',
        email: 'new@example.com',
        password: 'newpassword',
        role: 'user',
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message', 'User registered successfully');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'testpassword',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Login successful');
    expect(res.body).toHaveProperty('accessToken');
    testUserToken = res.body.accessToken;
  });

  it('should fail login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'wrongpassword',
      });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should request a password reset', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({
        email: 'test@example.com',
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Password reset token generated');
  });

  it('should verify a reset token', async () => {
    // First, get a token by requesting a password reset
    const forgotPasswordRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({
        email: 'test@example.com',
      });
    const token = forgotPasswordRes.body.token;

    // Then, verify the token
    const verifyRes = await request(app)
      .post('/api/auth/verify-reset-token')
      .send({ token });
    expect(verifyRes.statusCode).toEqual(200);
    expect(verifyRes.body).toHaveProperty('valid', true);
  });

  it('should reset a password', async () => {
    // First, get a token by requesting a password reset
    const forgotPasswordRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({
        email: 'test@example.com',
      });
    const token = forgotPasswordRes.body.token;

    // Then, reset the password
    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, newPassword: 'newtestpassword' });
    expect(resetRes.statusCode).toEqual(200);
    expect(resetRes.body).toHaveProperty('message', 'Password reset successfully');
  });

  it('should refresh an access token', async () => {
    // First, log in to get a refresh token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'newtestpassword',
      });

    // Extract the refresh token from the cookie
    const refreshTokenCookie = loginRes.headers['set-cookie'][0];
    const refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];

    // Then, refresh the access token
    const refreshRes = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', [`refreshToken=${refreshToken}`]);
    expect(refreshRes.statusCode).toEqual(200);
    expect(refreshRes.body).toHaveProperty('accessToken');
  });
});
