// config/db.js
const mysql = require('mysql2');
require('dotenv').config();

// Create connection with settings from .env
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ptilms',
  port: process.env.DB_PORT || 3306
});

connection.connect((err) => {
  if (err) {
    console.error('MySQL connection error:', err);
    return;
  }
  console.log('Connected to MySQL database.');
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
    modified_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000),
    sync_attempts INT DEFAULT 0
);
`;

connection.query(createUsersTableQuery, (err) => {
  if (err) console.error("Error creating users table:", err);
  else console.log("Users table is ready.");
});

// Add the "modified_at" column if it doesn't exist
const addModifiedAtColumnQuery = `
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS modified_at BIGINT DEFAULT (UNIX_TIMESTAMP() * 1000);
`;

connection.query(addModifiedAtColumnQuery, (err) => {
  if (err) console.error("Error adding modified_at column:", err);
  else console.log("modified_at column added or already exists.");
});

// Create trigger to update modified_at column on update
const createTriggerQuery = `
DELIMITER //

CREATE TRIGGER before_users_update
BEFORE UPDATE ON users
FOR EACH ROW
BEGIN
  SET NEW.modified_at = UNIX_TIMESTAMP() * 1000;
END;

//

DELIMITER ;
`;

connection.query(createTriggerQuery, (err) => {
  if (err) console.error("Error creating trigger:", err);
  else console.log("Trigger created successfully.");
});

module.exports = connection;
