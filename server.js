// ptilms-api/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const config = require('./config/config');
const logger = require('./utils/logger');
const { errorHandler } = require('./middlewares/errorMiddleware');
const dbConfig = require('./config/database');
const { Sequelize } = require('sequelize');
const { UnauthorizedError } = require('./utils/errors');

// Log environment and configuration details
logger.info(`Environment: ${config.env}`);
logger.info(`JWT Secrets: Access[${config.jwt.secret?.substring(0, 5)}...], Refresh[${config.jwt.refreshSecret?.substring(0, 5)}...]`);
logger.info(`Database: ${config.database.url}`);
logger.info(`Redis: ${config.redis.host}:${config.redis.port}`);

// Check if JWT_SECRET and JWT_REFRESH_SECRET are set
try {
  if (!config.jwt.secret) {
    logger.error('Error: JWT_SECRET environment variable is not set.');
    throw new UnauthorizedError('JWT_SECRET environment variable is not set.');
  } else {
    logger.info('JWT_SECRET environment variable is set.');
  }

  if (!config.jwt.refreshSecret) {
    logger.error('Error: JWT_REFRESH_SECRET environment variable is not set.');
    throw new UnauthorizedError('JWT_REFRESH_SECRET environment variable is not set.');
  } else {
    logger.info('JWT_REFRESH_SECRET environment variable is set.');
  }
} catch (error) {
  logger.error(`Application failed to start: ${error.message}`);
  process.exit(1); // Exit with an error code
}

// Models
const RoleModel = require('./models/Role');
const UserModel = require('./models/User');
const RolePermissionModel = require('./models/RolePermission');
const PermissionModel = require('./models/Permission');
const { ROLES } = require('./config/constants');

// Repositories
const UserRepository = require('./repositories/UserRepository');
const RoleRepository = require('./repositories/RoleRepository');

// Services
const AuthService = require('./services/AuthService');
const UserService = require('./services/UserService');

// Controllers
const AuthController = require('./controllers/authController');
const UserController = require('./controllers/userController');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(cors({
  origin: config.cors.origins,
  methods: config.cors.methods,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization', 'X-Refresh-Token'],
  credentials: true
}));

// Body parser middleware MUST be before routes
app.use(express.json());

// Database Setup
const env = process.env.NODE_ENV || 'development';
const db = new Sequelize(dbConfig[env]);

// Initialize Models
const Role = RoleModel(db);
const User = UserModel(db);
const RolePermission = RolePermissionModel(db);
const Permission = PermissionModel(db);

// Define Associations
const models = { Role, User, RolePermission, Permission };
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Database Synchronization
(async () => {
  try {
    await db.authenticate(); // Test the connection
    await db.sync({ force: false }); // Set force to true to drop and recreate tables
    logger.info('Database synchronized successfully.');

    // Check if roles exist, if not, create them
    const existingRoles = await Role.findAll();
    if (existingRoles.length === 0) {
      await Role.bulkCreate(ROLES.map(role => ({ name: role })));
      logger.info('Default roles created.');
    }
  } catch (error) {
    logger.error('Error synchronizing database:', error);
  }
})();

// Repositories
const userRepository = new UserRepository(User, Role);
const roleRepository = new RoleRepository(Role);

// Services
const authService = new AuthService({ userRepository, roleRepository });
const userService = new UserService({ userRepository });

// Controllers
const authController = new AuthController({ authService });
const userController = new UserController({ userService });

// Routes
app.use('/api/v1/auth', authRoutes(authController));
app.use('/api/v1/users', userRoutes(userController));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error Handling Middleware
app.use(errorHandler);

// Start Server
const PORT = config.port || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});