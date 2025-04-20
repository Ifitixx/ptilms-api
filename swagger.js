// swagger.js
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PTiLMS API Documentation',
      version: '1.0.0',
      description: 'API documentation for the PTiLMS (Programming Teaching and Learning Management System)',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: [
            'username',
            'email',
            'password',
            'role'
          ],
          properties: {
            user_id: {
              type: 'string',
              description: 'User\'s ID',
            },
            username: {
              type: 'string',
              description: 'User\'s username',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User\'s email address',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User\'s password',
            },
            role: {
              type: 'string',
              enum: ['admin', 'user'],
              description: 'User\'s role',
            },
            phone_number: {
              type: 'string',
              description: 'User\'s phone number',
            },
            date_of_birth: {
              type: 'string',
              format: 'date',
              description: 'User\'s date of birth (YYYY-MM-DD)',
            },
            sex: {
              type: 'string',
              enum: ['male', 'female', 'other'],
              description: 'User\'s sex',
            },
            profile_picture_url: {
              type: 'string',
              description: 'User\'s profile picture URL',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'User creation timestamp',
            },
            modified_at: {
              type: 'string',
              format: 'date-time',
              description: 'User last modification timestamp',
            },
          },
        },
        Login: {
          type: 'object',
          required: [
            'username',
            'password'
          ],
          properties: {
            username: {
              type: 'string',
              description: 'User\'s username',
            },
            password: {
              type: 'string',
              format: 'password',
              description: 'User\'s password',
            },
          },
        },
        ForgotPassword: {
          type: 'object',
          required: [
            'email'
          ],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User\'s email address',
            },
          },
        },
        ResetPassword: {
          type: 'object',
          required: [
            'token',
            'newPassword'
          ],
          properties: {
            token: {
              type: 'string',
              description: 'Reset token',
            },
            newPassword: {
              type: 'string',
              format: 'password',
              description: 'New password',
            },
          },
        },
        UpdateUser: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'User\'s username',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User\'s email address',
            },
            phone_number: {
              type: 'string',
              description: 'User\'s phone number',
            },
            date_of_birth: {
              type: 'string',
              format: 'date',
              description: 'User\'s date of birth (YYYY-MM-DD)',
            },
            sex: {
              type: 'string',
              enum: ['male', 'female', 'other'],
              description: 'User\'s sex',
            },
            profile_picture_url: {
              type: 'string',
              description: 'User\'s profile picture URL',
            },
          },
        },
        ChangePassword: {
          type: 'object',
          required: [
            'currentPassword',
            'newPassword'
          ],
          properties: {
            currentPassword: {
              type: 'string',
              format: 'password',
              description: 'User\'s current password',
            },
            newPassword: {
              type: 'string',
              format: 'password',
              description: 'User\'s new password',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            code: {
              type: 'string',
              description: 'Error code'
            }
          }
        },
        PerformanceMetrics: {
          type: 'object',
          properties: {
            requestsPerMinute: {
              type: 'number',
              description: 'Number of requests processed per minute'
            },
            averageResponseTime: {
              type: 'number',
              description: 'Average response time in milliseconds'
            },
            errorRate: {
              type: 'number',
              description: 'Error rate as a percentage'
            },
            activeUsers: {
              type: 'number',
              description: 'Number of currently active users'
            },
            cpuUsage: {
              type: 'number',
              description: 'CPU usage percentage'
            },
            memoryUsage: {
              type: 'number',
              description: 'Memory usage in MB'
            }
          }
        },
        EmailJob: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Unique identifier for the email job'
            },
            status: {
              type: 'string',
              enum: ['queued', 'processing', 'completed', 'failed'],
              description: 'Current status of the email job'
            },
            attempts: {
              type: 'number',
              description: 'Number of attempts made to send the email'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the email job was created'
            },
            processedAt: {
              type: 'string',
              format: 'date-time',
              description: 'When the email was processed'
            }
          }
        }
      },
    },
    security: [{ bearerAuth: [] }],
    servers: [{
      url: '/api/v1',
      description: 'API v1'
    }]
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
