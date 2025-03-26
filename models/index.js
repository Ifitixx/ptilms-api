// ptilms-api/models/index.js
'use strict';

import { readdirSync } from 'fs';
import { basename as _basename, join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import Sequelize, { DataTypes } from 'sequelize';
import config from '../config/config.cjs';

// ES module equivalent of __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const basename = _basename(__filename);
const { database } = config;
const db = {};

const sequelize = new Sequelize(database.url, {
  dialect: database.dialect,
  logging: (msg) => console.info(msg),
});

// Dynamically import and define models
const modelPromises = [];
readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach((file) => {
    const filePath = join(__dirname, file);
    const fileUrl = pathToFileURL(filePath).toString(); // Convert to file URL
    const modelPromise = import(fileUrl)
      .then((module) => {
        const model = module.default(sequelize, DataTypes);
        db[model.name] = model;
      })
      .catch((err) => {
        console.error(`Error importing model from ${file}:`, err);
      });
    modelPromises.push(modelPromise);
  });

// Define associations after all models are loaded
Promise.all(modelPromises).then(() => {
  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.sync = async () => {
  await Promise.all(modelPromises);
  await sequelize.sync({ alter: false });
};

export default db;