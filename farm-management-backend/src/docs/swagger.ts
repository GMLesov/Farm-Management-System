import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Farm Management API',
      version: '1.0.0',
      description: 'Comprehensive farm management system API with livestock, crop, and resource management',
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
        url: 'http://localhost:3000/api',
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
        User: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            id: {
              type: 'string',
              description: 'Auto-generated unique identifier',
            },
            name: {
              type: 'string',
              description: 'Full name of the user',
              example: 'John Farmer',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address (must be unique)',
              example: 'john@farm.com',
            },
            role: {
              type: 'string',
              enum: ['admin', 'farmer', 'manager', 'worker'],
              description: 'User role determining access level',
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the user account is active',
              default: true,
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
          required: ['name', 'location', 'size', 'farmType', 'owner'],
          properties: {
            id: {
              type: 'string',
              description: 'Auto-generated unique identifier',
            },
            name: {
              type: 'string',
              description: 'Name of the farm',
              example: 'Green Valley Farm',
            },
            location: {
              type: 'object',
              properties: {
                address: {
                  type: 'string',
                  example: '123 Farm Road, Rural County, State 12345',
                },
                coordinates: {
                  type: 'object',
                  properties: {
                    latitude: { type: 'number', example: 40.7128 },
                    longitude: { type: 'number', example: -74.0060 },
                  },
                },
              },
            },
            size: {
              type: 'number',
              description: 'Farm size in acres',
              example: 150,
            },
            farmType: {
              type: 'string',
              enum: ['crop', 'livestock', 'dairy', 'poultry', 'mixed', 'organic'],
              description: 'Primary type of farming operation',
            },
            owner: {
              type: 'string',
              description: 'User ID of the farm owner',
            },
            managers: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of manager user IDs',
            },
          },
        },
        Animal: {
          type: 'object',
          required: ['farm', 'tagNumber', 'species', 'gender'],
          properties: {
            id: { type: 'string' },
            farm: { type: 'string', description: 'Farm ID' },
            tagNumber: {
              type: 'string',
              description: 'Unique identification tag within farm',
              example: 'COW001',
            },
            name: {
              type: 'string',
              description: 'Optional animal name',
              example: 'Bessie',
            },
            species: {
              type: 'string',
              enum: ['cattle', 'pig', 'sheep', 'goat', 'chicken', 'horse', 'other'],
              description: 'Animal species',
            },
            breed: {
              type: 'string',
              description: 'Animal breed',
              example: 'Holstein',
            },
            gender: {
              type: 'string',
              enum: ['male', 'female'],
              description: 'Animal gender',
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              description: 'Animal birth date',
            },
            weight: {
              type: 'number',
              description: 'Current weight in kg',
              example: 550,
            },
            healthStatus: {
              type: 'string',
              enum: ['healthy', 'sick', 'injured', 'quarantine', 'deceased'],
              default: 'healthy',
            },
            location: {
              type: 'object',
              properties: {
                building: { type: 'string', example: 'Barn A' },
                pen: { type: 'string', example: 'Pen 12' },
                pasture: { type: 'string', example: 'North Pasture' },
              },
            },
            acquisitionInfo: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['purchased', 'born_on_farm', 'inherited', 'gifted'],
                },
                date: { type: 'string', format: 'date' },
                cost: { type: 'number' },
                vendor: { type: 'string' },
              },
            },
          },
        },
        VeterinaryRecord: {
          type: 'object',
          required: ['farm', 'animal', 'veterinarian', 'appointment'],
          properties: {
            id: { type: 'string' },
            farm: { type: 'string' },
            animal: { type: 'string' },
            veterinarian: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Dr. Smith' },
                clinic: { type: 'string', example: 'Rural Veterinary Clinic' },
                phone: { type: 'string', example: '555-0123' },
                email: { type: 'string', format: 'email' },
              },
            },
            appointment: {
              type: 'object',
              properties: {
                scheduledDate: { type: 'string', format: 'date-time' },
                actualDate: { type: 'string', format: 'date-time' },
                type: {
                  type: 'string',
                  enum: ['routine_checkup', 'emergency', 'vaccination', 'surgery', 'dental', 'reproduction', 'other'],
                },
                status: {
                  type: 'string',
                  enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
                },
              },
            },
            examination: {
              type: 'object',
              properties: {
                weight: { type: 'number' },
                temperature: { type: 'number' },
                heartRate: { type: 'number' },
                generalCondition: { type: 'string' },
                findings: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
            treatment: {
              type: 'object',
              properties: {
                diagnosis: {
                  type: 'array',
                  items: { type: 'string' },
                },
                prescriptions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      medication: { type: 'string' },
                      dosage: { type: 'string' },
                      frequency: { type: 'string' },
                      duration: { type: 'string' },
                    },
                  },
                },
              },
            },
            costs: {
              type: 'object',
              properties: {
                consultationFee: { type: 'number' },
                medicationCost: { type: 'number' },
                totalCost: { type: 'number' },
                paymentStatus: {
                  type: 'string',
                  enum: ['pending', 'paid', 'partially_paid', 'overdue'],
                },
              },
            },
          },
        },
        Feed: {
          type: 'object',
          required: ['farm', 'name', 'type', 'suitableFor'],
          properties: {
            id: { type: 'string' },
            farm: { type: 'string' },
            name: {
              type: 'string',
              description: 'Feed name',
              example: 'Premium Cattle Feed',
            },
            type: {
              type: 'string',
              enum: ['concentrate', 'forage', 'supplement', 'complete', 'mineral'],
              description: 'Type of feed',
            },
            suitableFor: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['cattle', 'pig', 'sheep', 'goat', 'chicken', 'horse'],
              },
              description: 'Animal species this feed is suitable for',
            },
            nutritionFacts: {
              type: 'object',
              properties: {
                protein: { type: 'number', description: 'Protein percentage' },
                fat: { type: 'number', description: 'Fat percentage' },
                fiber: { type: 'number', description: 'Fiber percentage' },
                moisture: { type: 'number', description: 'Moisture percentage' },
              },
            },
            inventory: {
              type: 'object',
              properties: {
                currentStock: { type: 'number' },
                unit: { type: 'string', example: 'kg' },
                reorderPoint: { type: 'number' },
                costPerUnit: { type: 'number' },
              },
            },
          },
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            error: { type: 'string' },
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
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Farm Management API Documentation',
  }));
  
  // JSON endpoint for the swagger spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });
};

export default specs;