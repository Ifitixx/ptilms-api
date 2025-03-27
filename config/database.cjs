// ptilms-api/config/database.cjs
const { Sequelize } = require('sequelize');
const config = require('./config.cjs');

const sequelize = new Sequelize(config.database.url, {
  logging: console.log, // Enables query logging in development
  ...config.database,  // Pass other database options, including `define`
});

module.exports = sequelize;