// ptilms-api/config/sequelize.mjs
import config from './config.cjs';

const env = process.env.NODE_ENV || 'development';

const dbConfig = {
  development: {
    username: config.database.username,
    password: config.database.password,
    database: config.database.name, // <-- Use the correct property
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
    migrationStorage: 'sequelize',
    seederStorage: 'sequelize',
    logging: console.log,
  },
  test: {
    username: config.database.username,
    password: config.database.password,
    database: config.database.name,
    host: config.database.host,
    port: config.database.port,
    dialect: config.database.dialect,
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
    migrationStorage: 'sequelize',
    seederStorage: 'sequelize',
    logging: console.log,
  },
};

export default dbConfig[env];