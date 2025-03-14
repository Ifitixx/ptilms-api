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
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
// Configure CORS
const corsOptions = {
  origin: 'http://localhost:8080', // Replace with your frontend URL in production
  credentials: true,
};

// In production, you might want to dynamically set the origin based on the request
if (process.env.NODE_ENV === 'production') {
  corsOptions.origin = (origin, callback) => {
    const allowedOrigins = ['https://your-frontend-domain.com', 'https://another-allowed-domain.com']; // Add your allowed domains here
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  };
}

app.use(cors(corsOptions));

// Configure Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Add any external script sources here if needed
      styleSrc: ["'self'", "'unsafe-inline'"], // Add any external style sources here if needed
      imgSrc: ["'self'", "data:"], // Add any external image sources here if needed
      connectSrc: ["'self'"], // Add any external API endpoints here if needed
    },
  },
  referrerPolicy: { policy: 'same-origin' },
}));

// Configure Morgan
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Error handling middleware
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
