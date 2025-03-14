// db.js
const mysql = require('mysql2'); // Remove /promise
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
pool.getConnection((err, connection) => {
  if (err) {
    logger.error(`Error connecting to the database: ${err.message}`);
  } else {
    logger.info('Connected to the database');
    connection.release();
  }
});

// Create the users table if it doesn't exist
const createUsersTable = () => {
  pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id VARCHAR(36) PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      reset_token VARCHAR(255),
      phone_number VARCHAR(20),
      date_of_birth DATE,
      sex VARCHAR(10),
      profile_picture_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      logger.error(`Error creating users table: ${err.message}`);
    } else {
      logger.info('Users table created or already exists');
    }
  });
};

// Create the modified_at trigger if it doesn't exist
const createModifiedAtTrigger = () => {
  pool.query(`
    CREATE TRIGGER IF NOT EXISTS update_modified_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    SET NEW.modified_at = CURRENT_TIMESTAMP
  `, (err) => {
    if (err) {
      logger.error(`Error creating modified_at trigger: ${err.message}`);
    } else {
      logger.info('Modified_at trigger created or already exists');
    }
  });
};

// Create the table and trigger
createUsersTable();
createModifiedAtTrigger();

module.exports = pool;
