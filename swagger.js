// swagger.js
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PTiLMS API',
      version: '1.0.0',
      description: 'API documentation for the PTiLMS application',
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
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
