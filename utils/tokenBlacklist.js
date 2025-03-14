// utils/tokenBlacklist.js
const db = require('../config/db');
const logger = require('./logger');

const addToken = async (token, expiration) => {
  try {
    const query = 'INSERT INTO token_blacklist (token, expires_at) VALUES (?, FROM_UNIXTIME(?))';
    await db.execute(query, [token, expiration]);
  } catch (err) {
    logger.error(`Error adding token to blacklist: ${err}`);
    throw err;
  }
};

const isBlacklisted = async (token) => {
  try {
    const query = 'SELECT * FROM token_blacklist WHERE token = ?';
    const [rows] = await db.execute(query, [token]);
    return rows.length > 0;
  } catch (err) {
    logger.error(`Error checking token blacklist: ${err}`);
    throw err;
  }
};

const cleanupExpired = async () => {
  try {
    const query = 'DELETE FROM token_blacklist WHERE expires_at <= NOW()';
    await db.execute(query);
  } catch (err) {
    logger.error(`Error cleaning up expired tokens: ${err}`);
    throw err;
  }
};

module.exports = { addToken, isBlacklisted, cleanupExpired };
