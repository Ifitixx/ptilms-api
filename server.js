// ptilms-api/server.js
import 'dotenv/config';
import express, { json } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import config from './config/config.cjs';
const { env, jwt, database, redis, port } = config; // Simplified destructuring
import logger from './utils/logger.js';
import errorHandler from './middlewares/errorMiddleware.js';
import helmet from 'helmet';
import initializeContainer from './container.js';
import configRoutes from './routes/config.js';
import { sequelize, models } from './models/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimiter from './middlewares/rateLimiter.js';
const { apiLimiter, loginLimiter } = rateLimiter; // Single-line destructuring

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { info, error: _error } = logger;

info(`Environment: ${env}`);
info(`JWT Secrets: Access[${jwt.secret?.substring(0, 5)}...], Refresh[${jwt.refreshSecret?.substring(0, 5)}...]`);
info(`Database: ${database.url}`);
info(`Redis: ${redis.host}:${redis.port}`);

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
import uploadRoutes from './routes/uploads.js'; // Import the upload routes

const app = express();

app.use(cors({
  origin: config.cors.origins, // Use config.cors directly
  methods: config.cors.methods, // Use config.cors directly
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization', 'X-Refresh-Token'],
  credentials: true
}));

app.use(json());

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    info('Database synchronized successfully.');

    const container = initializeContainer({ sequelize, models });

    // Call createDefaultRoles on the roleService
    try {
      await container.roleService.createDefaultRoles(); // This will now work
    } catch (err) {
      _error('Error creating default roles:', err);
      // Decide how to handle this: maybe exit, or log and continue
      // For now, we'll log and continue, as the app might still function
    }

    // Security Middleware
    app.use(helmet());
    app.set('trust proxy', 1);

    app.use('/api/', apiLimiter);

    // Serve static files from the 'public' directory (if you have one)
    app.use(express.static(path.join(__dirname, 'public')));

    // Serve static files from the 'uploads' directory
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // Corrected route setup: passing controllers directly
    app.use('/api/v1/auth', authRoutes(container.authController));
    app.use('/api/v1/users', userRoutes(container.userController));
    app.use('/api/v1/courses', courseRoutes(container.courseController));
    app.use('/api/v1/assignments', assignmentRoutes(container.assignmentController));
    app.use('/api/v1/announcements', announcementRoutes(container.announcementController));
    app.use('/api/v1/chats', chatRoutes(container.chatController));
    app.use('/api/v1/chatMessages', chatMessageRoutes(container.chatMessageController));
    app.use('/api/v1/departments', departmentRoutes(container.departmentController));
    app.use('/api/v1/levels', levelRoutes(container.levelController));
    app.use('/api/v1/permissions', permissionsRoutes(container.permissionController));
    app.use('/api/v1/roles', rolesRoutes(container.roleController));
    app.use('/api/v1/rolePermissions', rolePermissionsRoutes(container.rolePermissionController));
    app.use('/api/v1/courseMaterials', courseMaterialRoutes(container.courseMaterialController));
    app.use('/api/v1', uploadRoutes); 
    app.use('/api/v1/config', configRoutes);

    // Swagger setup
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // Error handling
    app.use(errorHandler);

    const PORT = port || 3000;
    app.listen(PORT, () => {
      info(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    _error('Unable to connect to the database:', err);
  }
})();

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