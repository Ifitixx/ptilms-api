// config/db.js
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    logger.info('Successfully connected to the database');
    connection.release();
  } catch (err) {
    logger.error(`Error connecting to the database: ${err.message}`);
    process.exit(1); // Exit if the connection fails
  }
};

// Async table creation
const createUsersTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        reset_token VARCHAR(255),
        phone_number VARCHAR(20),
        date_of_birth DATE,
        sex ENUM('male', 'female', 'other'),
        profile_picture_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    logger.info('Users table created or already exists');
  } catch (err) {
    logger.error(`Error creating users table: ${err.message}`);
    throw err; // Re-throw the error to be handled by initializeDatabase
  }
};

// Async trigger creation
const createModifiedAtTrigger = async () => {
  try {
    await pool.query(`
      CREATE TRIGGER IF NOT EXISTS update_modified_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      SET NEW.modified_at = CURRENT_TIMESTAMP
    `);
    logger.info('Modified_at trigger created or already exists');
  } catch (err) {
    logger.error(`Error creating modified_at trigger: ${err.message}`);
    throw err; // Re-throw the error to be handled by initializeDatabase
  }
};

// Async blacklisted_tokens table creation
const createBlacklistedTokensTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blacklisted_tokens (
        token VARCHAR(512) PRIMARY KEY,
        expires_at DATETIME NOT NULL
      )
    `);
    logger.info('Blacklisted_tokens table created or already exists');
  } catch (err) {
    logger.error(`Error creating blacklisted_tokens table: ${err.message}`);
    throw err; // Re-throw the error to be handled by initializeDatabase
  }
};

// Async function to initialize the database
const initializeDatabase = async () => {
  try {
    await testConnection();
    await createUsersTable();
    await createModifiedAtTrigger();
    await createBlacklistedTokensTable(); // Add this line
    logger.info('Database initialized successfully'); // Add this line
  } catch (err) {
    logger.error(`Database initialization failed: ${err.message}`);
    process.exit(1); // Exit if initialization fails
  }
};

// Handle server shutdown
const closePool = async () => {
  try {
    await pool.end();
    logger.info('Database pool closed');
  } catch (err) {
    logger.error(`Error closing database pool: ${err.message}`);
  }
};

process.on('SIGINT', closePool);
process.on('SIGTERM', closePool);

// Initialize the database
initializeDatabase();

module.exports = pool;
