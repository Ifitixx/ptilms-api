ptilms-api/
├── config/                  # Configuration files
│   └── db.js                # Database connection setup
├── controllers/             # Route handlers (business logic)
│   └── userController.js    # User-related operations
│   └── authController.js    # Authentication-related operations
├── middlewares/             # Middleware functions
│   ├── authMiddleware.js    # Authentication and authorization
│   ├── errorHandler.js      # Centralized error handling
│   ├── rateLimiter.js       # Rate limiting
│   └── validationMiddleware.js # Validation middleware
├── routes/                  # API route definitions
│   ├── auth.js              # Authentication routes
│   └── users.js             # User-related routes
├── utils/                   # Utility functions and classes
│   ├── errors.js            # Custom error classes
│   ├── logger.js            # Logging setup (Winston)
│   └── tokenBlacklist.js    # JWT token blacklist management
├── logs/                    # Log files (created at runtime)
├── tests/                   # Test files
│   └── auth.test.js         # Authentication tests
    └── users.test.js        # User tests
├── .env                     # Environment variables (not committed to Git)
├── .gitignore               # Files and directories to ignore by Git
├── package.json             # Project dependencies and scripts
├── server.js                # Main application entry point
├── swagger.js               # Swagger/OpenAPI documentation configuration
└── README.md                # Project documentation (this file)

# PTiLMS API

## Description

This is the REST API for the PTiLMS (Project Title Learning Management System) application. It provides endpoints for user authentication, user management, and other core functionalities.

## Features

-   User registration and login
-   Password reset functionality
-   User profile management (view, update)
-   Role-based access control (RBAC)
-   JWT authentication (access and refresh tokens)
-   Rate limiting
-   Centralized error handling
-   Logging (using Winston)
-   Swagger documentation (OpenAPI)
-   Testing with Jest and Supertest
-   Get modified users since a given timestamp
-   Token blacklist for invalidating tokens
-   CORS support with configurable allowed origins
-   Helmet for security headers
-   Scheduled token blacklist cleanup

## Project Structure
