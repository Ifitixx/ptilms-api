// ptilms-api/models/index.js
import { Sequelize, DataTypes } from 'sequelize';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import config from '../config/config.cjs';
import logger from '../utils/logger.js';

const { database } = config;
const { info, error } = logger;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sequelize = new Sequelize(database.url, {
  ...database, // Use all database configurations from config
  logging: (msg) => info(msg),
});

const models = {}; // Initialize an empty object to store models

const modelFiles = readdirSync(__dirname)
  .filter(file => file !== 'index.js' && file.slice(-3) === '.js');

// Load all models concurrently
try {
  await Promise.all(modelFiles.map(async (file) => {
    const modelPath = join(__dirname, file);
    const modelUrl = pathToFileURL(modelPath).href;
    try {
      const module = await import(modelUrl);
      const model = module.default(sequelize, DataTypes);
      models[model.name] = model; // Store the model in the models object
    } catch (err) {
      error(`Error loading model ${file}: ${err.message}`);
      process.exit(1);
    }
  }));
} catch (err) {
  error(`Error loading models: ${err.message}`);
  process.exit(1);
}

// Set up associations
Object.keys(models).forEach(modelName => {
  if (typeof models[modelName].associate === 'function') {
    models[modelName].associate(models); // Pass the models object to associate
  }
});

// Export sequelize and the models object
export { sequelize, models };