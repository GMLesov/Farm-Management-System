import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Farm Management API',
      version: '1.0.0',
      description: 'Comprehensive Farm Management System API Documentation',
      contact: {
        name: 'Farm Management Team',
        email: 'support@farmmanagement.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.farmmanagement.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
            },
            message: {
              type: 'string',
              description: 'Detailed error message',
            },
            statusCode: {
              type: 'integer',
              description: 'HTTP status code',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Operation success status',
            },
            message: {
              type: 'string',
              description: 'Success message',
            },
            data: {
              type: 'object',
              description: 'Response data',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            firstName: {
              type: 'string',
              description: 'User first name',
            },
            lastName: {
              type: 'string',
              description: 'User last name',
            },
            role: {
              type: 'string',
              enum: ['farmer', 'admin', 'supervisor'],
              description: 'User role',
            },
            isVerified: {
              type: 'boolean',
              description: 'Email verification status',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
          },
        },
        Farm: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Farm ID',
            },
            name: {
              type: 'string',
              description: 'Farm name',
            },
            location: {
              type: 'object',
              properties: {
                address: { type: 'string' },
                latitude: { type: 'number' },
                longitude: { type: 'number' },
              },
            },
            size: {
              type: 'number',
              description: 'Farm size in hectares',
            },
            soilType: {
              type: 'string',
              description: 'Primary soil type',
            },
            owner: {
              type: 'string',
              description: 'Owner user ID',
            },
          },
        },
        Crop: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Crop ID',
            },
            name: {
              type: 'string',
              description: 'Crop name',
            },
            variety: {
              type: 'string',
              description: 'Crop variety',
            },
            plantingDate: {
              type: 'string',
              format: 'date',
              description: 'Planting date',
            },
            harvestDate: {
              type: 'string',
              format: 'date',
              description: 'Expected harvest date',
            },
            area: {
              type: 'number',
              description: 'Cultivation area in hectares',
            },
            status: {
              type: 'string',
              enum: ['planted', 'growing', 'harvested', 'failed'],
              description: 'Crop status',
            },
            farm: {
              type: 'string',
              description: 'Farm ID',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts',
  ],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  // Swagger page
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Farm Management API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
    },
  }));

  // Docs in JSON format
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};