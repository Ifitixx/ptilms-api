// ptilms-api/models/index.js
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { DataTypes } from 'sequelize';
import sequelize from '../config/sequelize.mjs';
import logger from '../utils/logger.js';

const { info, error } = logger;
const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);

const models = {};

// 1. Find all .js model files in this dir (except index.js)
const files = fs
  .readdirSync(__dirname)
  .filter(f => f !== 'index.js' && f.endsWith('.js'));

// 2. Dynamically import & initialize each model
for (const file of files) {
  try {
    const { default: define } = await import(pathToFileURL(join(__dirname, file)).href);
    if (typeof define === 'function') {
      const model = define(sequelize, DataTypes);
      models[model.name] = model;
    }
  } catch (err) {
    error(`Error loading model ${file}: ${err.message}`);
    process.exit(1);
  }
}

// 3. Run .associate() on each, if present
for (const name of Object.keys(models)) {
  if (typeof models[name].associate === 'function') {
    models[name].associate(models);
  }
}

export { sequelize, models };
