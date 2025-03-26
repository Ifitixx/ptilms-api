// ptilms-api/config/database.cjs
const { Sequelize } = require('sequelize');
const config = require('./config.cjs');

const sequelize = new Sequelize(config.database.url, {
  logging: console.log,
  define: {
    paranoid: true,
    underscored: true,
    timestamps: true,
  },
});

module.exports = sequelize;