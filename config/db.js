const mysql = require('mysql2/promise'); // Use promise-based API
require('dotenv').config();
const logger = require('../utils/logger');

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ptilms',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10, // Adjust as needed
  queueLimit: 0,
});

// Test the connection
pool.getConnection()
  .then(connection => {
    logger.info('Connected to MySQL database.');
    connection.release();
  })
  .catch(err => {
    logger.error('MySQL connection error:', err);
  });

// Create the "users" table if it doesn’t exist
const createUsersTableQuery = `
CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    reset_token VARCHAR(255),
    reset_token_expiry BIGINT,
    phone_number VARCHAR(50),
    date_of_birth DATE,
    sex VARCHAR(50),
    profile_picture_url VARCHAR(255),
    modified_at BIGINT,
    sync_attempts INT DEFAULT 0
);
`;

pool.query(createUsersTableQuery)
  .then(() => logger.info("Users table is ready."))
  .catch(err => logger.error("Error creating users table:", err));

// Add the "modified_at" column if it doesn't exist
const addModifiedAtColumnQuery = `
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS modified_at BIGINT;
`;

pool.query(addModifiedAtColumnQuery)
  .then(() => logger.info("modified_at column added or already exists."))
  .catch(err => logger.error("Error adding modified_at column:", err));

// Create trigger to update modified_at column on update
const createTriggerQuery = `
DELIMITER $$

CREATE TRIGGER before_users_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
  SET NEW.modified_at = UNIX_TIMESTAMP(NOW(3)) * 1000;
END$$

DELIMITER ;
`;

pool.query(createTriggerQuery)
  .then(() => logger.info("Trigger created successfully."))
  .catch(err => logger.error("Error creating trigger:", err));

module.exports = pool;
