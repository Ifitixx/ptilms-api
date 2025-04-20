//ptilms-api/config/config.cjs
const { config } = require('dotenv');
config();

// Validate environment variables (you can add more as needed)
if (!process.env.JWT_SECRET) {
  throw new Error('Error: JWT_SECRET environment variable is not set.');
}
if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error('Error: JWT_REFRESH_SECRET environment variable is not set.');
}
if (!process.env.DATABASE_URL) {
  throw new Error('Error: DATABASE_URL environment variable is not set.');
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },
  cors: {
    origins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:8080'],
    methods: process.env.CORS_METHODS ? process.env.CORS_METHODS.split(',') : ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  },
  database: {
    url: process.env.DATABASE_URL,
    // Database name extracted from DATABASE_URL OR use the explicit variable DB_NAME
    name: process.env.DB_NAME || process.env.DATABASE_URL.split('/').pop().split('?')[0],
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306, // Added parseInt and default port
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 20, // Maximum number of connection in pool
      min: parseInt(process.env.DB_POOL_MIN, 10) || 5,  // Minimum number of connection in pool
      acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000, // Maximum time, in milliseconds, that pool will try to get connection before throwing error
      idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000,     // Maximum time, in milliseconds, that a connection can be idle before being released
    },
    retry: {
      max: 3 // Maximum amount of connection retries
    },
    define: {
      underscored: true,      // Converts camelCase to snake_case
      timestamps: true,       // Enables `created_at` and `updated_at` by default
      createdAt: 'created_at', // Custom name for the "created at" column
      updatedAt: 'updated_at', // Custom name for the "updated at" column
      deletedAt: 'deleted_at', // Custom name for the "deleted at" column
      paranoid: true,          // Enables soft deletes
    }
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || '',
  },
  app: {
    baseUrl: process.env.APP_BASE_URL || 'http://localhost:3000',
  },
  rateLimiter: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
  saltRounds: parseInt(process.env.SALT_ROUNDS, 10) || 12,
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM,
  },
};