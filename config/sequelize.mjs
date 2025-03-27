// ptilms-api/config/sequelize.mjs
import config from './config.cjs';

const env = process.env.NODE_ENV || 'development';

const dbConfig = {
  development: {
    username: config.database.username,
    password: config.database.password,
    database: config.database.name,
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    define: config.database.define, // Pass the global `define` settings
    migrationStorage: 'sequelize',
    seederStorage: 'sequelize',
    logging: console.log,
  },
  // Ensure `define` is included for `test` and `production` too
  test: {
    username: config.database.username,
    password: config.database.password,
    database: config.database.name,
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    define: config.database.define,
    migrationStorage: 'sequelize',
    seederStorage: 'sequelize',
    logging: console.log,
  },
  production: {
    username: config.database.username,
    password: config.database.password,
    database: config.database.name,
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    define: config.database.define,
    migrationStorage: 'sequelize',
    seederStorage: 'sequelize',
    logging: false, // Typically disable logging in production
  },
};

export default dbConfig[env];