// config/config.js
require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'ptilms',
    port: process.env.DB_PORT || 3306,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  rateLimit: {
    apiWindowMs: process.env.RATE_LIMIT_API_WINDOW_MS || 15000,
    apiMax: process.env.RATE_LIMIT_API_MAX || 100,
    loginWindowMs: process.env.RATE_LIMIT_LOGIN_WINDOW_MS || 60000,
    loginMax: process.env.RATE_LIMIT_LOGIN_MAX || 5,
  },
  test: {
    testUsername: process.env.TEST_USERNAME,
    testEmail: process.env.TEST_EMAIL,
    testPassword: process.env.TEST_PASSWORD,
    adminUsername: process.env.ADMIN_USERNAME,
    adminEmail: process.env.ADMIN_EMAIL,
    adminPassword: process.env.ADMIN_PASSWORD,
  },
};
