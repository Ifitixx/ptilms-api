// ptilms-api/server.js
import 'dotenv/config';
import express, { json, urlencoded } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import config from './config/config.cjs';
import logger from './utils/logger.js';
import errorHandler from './middlewares/errorMiddleware.js';
import helmet from 'helmet';
import initializeContainer from './container.js';
import { sequelize, models } from './models/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimiter from './middlewares/rateLimiter.js';
import monitoringMiddleware from './middlewares/monitoringMiddleware.js';
import tracingMiddleware from './middlewares/tracingMiddleware.js';
import compressionMiddleware from './middlewares/compressionMiddleware.js';
import { cacheHeaders } from './middlewares/cacheHeadersMiddleware.js';
import createMonitoringRoutes from './routes/monitoring.js';

// Import routes
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
import uploadRoutes from './routes/uploads.js';
import configRoutes from './routes/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { info, error: _error } = logger;
const { env, port } = config;

const app = express();

let server;
let container;

// Middleware setup
const setupMiddleware = (app) => {
  // Enable compression early in the middleware chain
  app.use(compressionMiddleware);

  // Basic middleware
  app.use(cors(config.cors));
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.set('trust proxy', 1);

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "same-site" },
    dnsPrefetchControl: true,
    frameguard: { action: "deny" },
    hidePoweredBy: true,
    hsts: true,
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true
  }));

  // Add tracing middleware
  app.use(tracingMiddleware());

  // Add request ID and monitoring
  app.use(monitoringMiddleware(container?.monitoringService));

  // Rate limiting
  const { apiLimiter } = rateLimiter;
  app.use('/api/', apiLimiter);

  // Static files with caching and security headers
  app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1d',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }));

  app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    setHeaders: (res) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }));

  // Error handling - must be last
  app.use(errorHandler);
};

const setupRoutes = (app, container) => {
  if (!container) {
    throw new Error('Container is not initialized');
  }

  try {
    // Validate required controllers exist
    const requiredControllers = [
      'authController',
      'userController',
      'courseController',
      'assignmentController',
      'announcementController',
      'chatController',
      'chatMessageController',
      'departmentController',
      'levelController',
      'permissionController',
      'roleController',
      'rolePermissionController',
      'courseMaterialController'
    ];

    const missingControllers = requiredControllers.filter(ctrl => {
      const hasController = !!container[ctrl];
      if (!hasController) {
        _error(`Missing controller: ${ctrl}`);
      }
      return !hasController;
    });

    if (missingControllers.length > 0) {
      throw new Error(`Missing required controllers: ${missingControllers.join(', ')}`);
    }

    info('All required controllers found, setting up routes...');

    // Apply appropriate cache headers for different routes
    app.use('/api/v1/departments', cacheHeaders.medium);
    app.use('/api/v1/levels', cacheHeaders.medium);
    app.use('/api/v1/courses', cacheHeaders.short);
    app.use('/uploads', cacheHeaders.static);

    // API Routes
    app.use('/api/v1/auth', authRoutes(container.authController));
    info('Auth routes setup complete');
    
    app.use('/api/v1/users', userRoutes(container.userController));
    info('User routes setup complete');
    
    app.use('/api/v1/courses', courseRoutes(container.courseController));
    info('Course routes setup complete');
    
    app.use('/api/v1/assignments', assignmentRoutes(container.assignmentController));
    info('Assignment routes setup complete');
    
    app.use('/api/v1/announcements', announcementRoutes(container.announcementController));
    info('Announcement routes setup complete');
    
    app.use('/api/v1/chats', chatRoutes(container.chatController));
    info('Chat routes setup complete');
    
    app.use('/api/v1/chatMessages', chatMessageRoutes(container.chatMessageController));
    info('Chat message routes setup complete');
    
    app.use('/api/v1/departments', departmentRoutes(container.departmentController));
    info('Department routes setup complete');
    
    app.use('/api/v1/levels', levelRoutes(container.levelController));
    info('Level routes setup complete');
    
    app.use('/api/v1/permissions', permissionsRoutes(container.permissionController));
    info('Permission routes setup complete');
    
    app.use('/api/v1/roles', rolesRoutes(container.roleController));
    info('Role routes setup complete');
    
    app.use('/api/v1/rolePermissions', rolePermissionsRoutes(container.rolePermissionController));
    info('Role permission routes setup complete');
    
    app.use('/api/v1/courseMaterials', courseMaterialRoutes(container.courseMaterialController));
    info('Course material routes setup complete');
    
    app.use('/api/v1', uploadRoutes);
    info('Upload routes setup complete');
    
    app.use('/api/v1/config', configRoutes);
    info('Config routes setup complete');

    // Monitoring routes
    app.use('/api/v1/monitoring', cacheHeaders.short, createMonitoringRoutes(
      container.monitoringService,
      container.emailQueueCleanupService
    ));
    info('Monitoring routes setup complete');

    // API documentation
    app.use('/api-docs', cacheHeaders.medium, swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'PTiLMS API Documentation',
      swaggerOptions: {
        persistAuthorization: true
      }
    }));
    info('API documentation setup complete');
  } catch (err) {
    _error('Error setting up routes:', err);
    throw err;
  }
};

const initializeServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    info('Database connection established successfully.');

    // Sync database schema
    await sequelize.sync();
    info('Database synchronized successfully.');

    // Initialize container and services
    container = await initializeContainer({ sequelize, models });
    info('Container and services initialized successfully.');

    // Create default roles if needed
    await container.roleService.createDefaultRoles();
    info('Default roles checked/created successfully');

    // Setup middleware
    setupMiddleware(app);
    info('Middleware setup completed');

    // Setup routes
    setupRoutes(app, container);
    info('Routes setup completed');

    // Start server
    const PORT = port || 3000;
    server = app.listen(PORT, () => {
      info(`Server is running in ${env} mode on port ${PORT}`);
    });

    return server;
  } catch (err) {
    _error('Error during server initialization:', err);
    throw err;
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  info(`${signal} received. Starting graceful shutdown...`);
  
  if (server) {
    server.close(async () => {
      info('HTTP server closed');
      
      try {
        // Close database connection
        await sequelize.close();
        info('Database connection closed');

        // Close Redis connection if exists
        if (container?.cacheService?.redis) {
          await container.cacheService.redis.quit();
          info('Redis connection closed');
        }

        // Close monitoring service if exists
        if (container?.monitoringService?.close) {
          await container.monitoringService.close();
          info('Monitoring service closed');
        }

        process.exit(0);
      } catch (err) {
        _error('Error during shutdown:', err);
        process.exit(1);
      }
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      _error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  }
};

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
  _error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (err) => {
  _error('Unhandled Rejection:', err);
  gracefulShutdown('unhandledRejection');
});

// Start the server
initializeServer().catch((err) => {
  _error('Failed to start server:', err);
  process.exit(1);
});