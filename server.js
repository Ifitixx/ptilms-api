// server.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.js');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');
const { cleanupExpired } = require('./utils/tokenBlacklist');
const cron = require('node-cron');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
// Configure CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? (origin, callback) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
      if (allowedOrigins.includes(origin) || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
    : true, // Allow all origins in development (be careful with this in production)
  credentials: true,
};

app.use(cors(corsOptions));

// Configure Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // Try to avoid 'unsafe-inline' if possible
      styleSrc: ["'self'"], // Try to avoid 'unsafe-inline' if possible
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
    },
  },
  referrerPolicy: { policy: 'same-origin' },
}));

// Configure Morgan
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Parse JSON request bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling middleware
app.use(errorHandler);

// Schedule token blacklist cleanup
cron.schedule('0 * * * *', async () => {
  logger.info('Running token blacklist cleanup...');
  try {
    await cleanupExpired();
    logger.info('Token blacklist cleanup completed.');
  } catch (error) {
    logger.error(`Error during token blacklist cleanup: ${error}`);
  }
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
