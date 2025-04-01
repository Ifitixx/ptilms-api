// ptilms-api/server.js
import 'dotenv/config';
import express, { json } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import config from './config/config.cjs';
const { env, jwt, database, redis, cors: _cors, port } = config;
import logger from './utils/logger.js';
import errorHandler from './middlewares/errorMiddleware.js';
import { ROLE_NAMES } from './config/constants.mjs';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import initializeContainer from './container.js';
import configRoutes from './routes/config.js';
import { sequelize, models } from './models/index.js'; // Import sequelize and models
import path from 'path';
import { fileURLToPath } from 'url'; // Import fileURLToPath

const __filename = fileURLToPath(import.meta.url); // Get the filename
const __dirname = path.dirname(__filename); // Get the directory name

const { info, error: _error } = logger;

// Log environment and configuration details
info(`Environment: ${env}`);
info(`JWT Secrets: Access[${jwt.secret?.substring(0, 5)}...], Refresh[${jwt.refreshSecret?.substring(0, 5)}...]`);
info(`Database: ${database.url}`);
info(`Redis: ${redis.host}:${redis.port}`);

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import courseRoutes from './routes/courses.js';
import assignmentRoutes from './routes/assignments.js';
import announcementRoutes from './routes/announcements.js';
import chatRoutes from './routes/chats.js';
import chatMessageRoutes from './routes/chatMessages.js';
import departmentRoutes from './routes/departments.js';
import levelRoutes from './routes/levels.js';
import permissionsRoutes from './routes/permissions.js';
import rolesRoutes from './routes/roles.js';
import rolePermissionsRoutes from './routes/rolePermissions.js';
import courseMaterialRoutes from './routes/courseMaterials.js';

const app = express();

app.use(cors({
  origin: _cors.origins,
  methods: _cors.methods,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization', 'X-Refresh-Token'],
  credentials: true
}));

app.use(json());

// Database Synchronization
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    info('Database synchronized successfully.');

    // Create default roles only if needed
    await createDefaultRoles(models.Role); // Use models.Role
    // Initialize the container
    const container = initializeContainer({ sequelize, models }); // Pass sequelize and models

    app.set('trust proxy', true);

    // Security Middleware
    app.use(helmet());

    // Rate limiting for API endpoints
    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again after 15 minutes',
    });
    app.use('/api/', apiLimiter);

    // Serve static files from the 'public' directory
    app.use(express.static(path.join(__dirname, 'public')));

    // Routes - Corrected to pass individual controllers
    app.use('/api/v1/auth', authRoutes(container.authController));
    app.use('/api/v1/users', userRoutes(container.userController));
    app.use('/api/v1/courses', courseRoutes(container.courseController));
    app.use('/api/v1/assignments', assignmentRoutes(container.assignmentController));
    app.use('/api/v1/announcements', announcementRoutes(container.announcementController));
    app.use('/api/v1/chats', chatRoutes(container.chatController));
    app.use('/api/v1/chat-messages', chatMessageRoutes(container.chatMessageController));
    app.use('/api/v1/departments', departmentRoutes(container.departmentController));
    app.use('/api/v1/levels', levelRoutes(container.levelController));
    app.use('/api/v1/permissions', permissionsRoutes(container.permissionController));
    app.use('/api/v1/roles', rolesRoutes(container.roleController));
    app.use('/api/v1/role-permissions', rolePermissionsRoutes(container.rolePermissionController));
    app.use('/api/v1/course-materials', courseMaterialRoutes(container.courseMaterialController));
    app.use('/api/v1', configRoutes);

    // Swagger Documentation
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Error Handling Middleware
    app.use(errorHandler);

    // Start Server
    const PORT = port || 3000;
    app.listen(PORT, () => {
      info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    _error('Error synchronizing database:', error);
    process.exit(1);
  }
})();

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      dbStatus: 'Connected'
    });
  } catch (err) {
    res.json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      dbStatus: 'Disconnected'
    });
  }
});

// Function to create default roles
async function createDefaultRoles(Role) {
  const existingRoles = await Role.findAll();
  if (existingRoles.length === 0) {
    try {
      await Role.bulkCreate(ROLE_NAMES.map(role => ({ name: role })));
      info('Default roles created.');
    } catch (error) {
      _error('Error creating default roles:', JSON.stringify(error));
    }
  }
}