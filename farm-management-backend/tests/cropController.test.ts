import request from 'supertest';
import express, { Application } from 'express';
import mongoose from 'mongoose';
import cropRoutes from '../src/routes/crops';
import { Crop, ICrop } from '../src/models/Crop';
import { Farm } from '../src/models/Farm';
import { User } from '../src/models/User';
import { errorHandler } from '../src/middleware/errorHandler';

const TEST_USER_ID = 'test-user-id-12345';

// Mock the auth middleware to bypass authentication
jest.mock('../src/middleware/auth', () => ({
  authMiddleware: jest.fn((req, res, next) => {
    req.user = {
      id: TEST_USER_ID,
      userId: TEST_USER_ID,
      email: 'croptest@example.com',
      farmId: ''
    };
    next();
  }),
}));

const app = express();
app.use(express.json());
app.use('/api/crops', cropRoutes);
app.use(errorHandler);

describe.skip('Crop Controller Integration Tests', () => {
  let testUser: any;
  let testFarm: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    testUser = await User.create({
      firstName: 'Crop',
      lastName: 'Tester',
      email: 'croptest@example.com',
      password: 'hashedPassword123',
      role: 'farmer',
    });

    testFarm = await Farm.create({
      name: 'Test Crop Farm',
      location: {
        address: '456 Crop Lane',
        city: 'Farm City',
        state: 'Test State',
        country: 'Test Country',
        zipCode: '12345',
        latitude: 40.7128,
        longitude: -74.0060
      },
      size: 100,
      soilType: 'loamy',
      climateZone: 'temperate',
      owner: testUser._id,
      managers: [testUser._id],
    });

    // Update auth mock to include farmId
    const { authMiddleware } = require('../src/middleware/auth');
    authMiddleware.mockImplementation((req: any, res: any, next: any) => {
      req.user = {
        id: testUser._id.toString(),
        userId: testUser._id.toString(),
        email: testUser.email,
        farmId: testFarm._id.toString()
      };
      next();
    });
  });

  describe('GET /api/crops', () => {
    it('should get all crops for the farm', async () => {
      await Crop.create({
        farmId: testFarm._id,
        name: 'Tomatoes',
        variety: 'Cherry',
        category: 'vegetables',
        fieldLocation: 'Field A',
        area: 2.5,
        plantingDate: new Date('2024-01-15'),
        expectedHarvestDate: new Date('2024-04-15'),
        stage: {
          current: 'vegetative',
          progress: 45,
          expectedDuration: 90
        },
        createdBy: testUser._id.toString(),
      });

      await Crop.create({
        farmId: testFarm._id,
        name: 'Corn',
        variety: 'Sweet Corn',
        category: 'grains',
        fieldLocation: 'Field B',
        area: 5.0,
        plantingDate: new Date('2024-02-01'),
        expectedHarvestDate: new Date('2024-05-01'),
        stage: {
          current: 'germination',
          progress: 20,
          expectedDuration: 90
        },
        createdBy: testUser._id.toString(),
      });

      const response = await request(app)
        .get('/api/crops')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('category');
    });

    it('should filter crops by category', async () => {
      await Crop.create({
        farmId: testFarm._id,
        name: 'Strawberries',
        variety: 'Albion',
        category: 'fruits',
        fieldLocation: 'Field C',
        area: 1.5,
        plantingDate: new Date('2024-01-10'),
        expectedHarvestDate: new Date('2024-06-10'),
        stage: { current: 'flowering', progress: 60, expectedDuration: 120 },
        createdBy: testUser._id.toString(),
      });

      await Crop.create({
        farmId: testFarm._id,
        name: 'Lettuce',
        variety: 'Romaine',
        category: 'vegetables',
        fieldLocation: 'Field D',
        area: 0.8,
        plantingDate: new Date('2024-02-05'),
        expectedHarvestDate: new Date('2024-03-25'),
        stage: { current: 'vegetative', progress: 40, expectedDuration: 50 },
        createdBy: testUser._id.toString(),
      });

      const response = await request(app)
        .get('/api/crops')
        .query({ category: 'fruits' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].category).toBe('fruits');
      expect(response.body.data[0].name).toBe('Strawberries');
    });

    it('should filter crops by stage', async () => {
      await Crop.create({
        farmId: testFarm._id,
        name: 'Wheat',
        variety: 'Spring Wheat',
        category: 'grains',
        fieldLocation: 'Field E',
        area: 10.0,
        plantingDate: new Date('2024-03-01'),
        expectedHarvestDate: new Date('2024-07-01'),
        stage: { current: 'harvest', progress: 95, expectedDuration: 120 },
        createdBy: testUser._id.toString(),
      });

      const response = await request(app)
        .get('/api/crops')
        .query({ stage: 'harvest' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].stage.current).toBe('harvest');
    });

    it('should support pagination', async () => {
      for (let i = 1; i <= 15; i++) {
        await Crop.create({
          farmId: testFarm._id,
          name: `Crop ${i}`,
          variety: `Variety ${i}`,
          category: 'vegetables',
          fieldLocation: `Field ${i}`,
          area: i * 0.5,
          plantingDate: new Date('2024-01-01'),
          expectedHarvestDate: new Date('2024-04-01'),
          stage: { current: 'planting', progress: 10, expectedDuration: 90 },
          createdBy: testUser._id.toString(),
        });
      }

      const response = await request(app)
        .get('/api/crops')
        .query({ page: 2, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
    });

    it('should return empty array when no crops exist', async () => {
      const response = await request(app)
        .get('/api/crops')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /api/crops/:cropId', () => {
    it('should get a crop by ID', async () => {
      const crop = await Crop.create({
        farmId: testFarm._id,
        name: 'Carrots',
        variety: 'Nantes',
        category: 'vegetables',
        fieldLocation: 'Field F',
        area: 1.2,
        plantingDate: new Date('2024-02-10'),
        expectedHarvestDate: new Date('2024-05-10'),
        stage: { current: 'vegetative', progress: 50, expectedDuration: 90 },
        createdBy: testUser._id.toString(),
      });

      const response = await request(app)
        .get(`/api/crops/${crop._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name', 'Carrots');
      expect(response.body.data).toHaveProperty('variety', 'Nantes');
      expect(response.body.data).toHaveProperty('category', 'vegetables');
    });

    it('should return 404 for non-existent crop', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/crops/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid crop ID format', async () => {
      const response = await request(app)
        .get('/api/crops/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/crops', () => {
    it('should create a new crop', async () => {
      const cropData = {
        farmId: testFarm._id,
        name: 'Basil',
        variety: 'Sweet Basil',
        category: 'herbs',
        fieldLocation: 'Greenhouse 1',
        area: 0.5,
        plantingDate: new Date('2024-03-01'),
        expectedHarvestDate: new Date('2024-05-01'),
        stage: {
          current: 'germination',
          progress: 15,
          expectedDuration: 60
        },
        createdBy: testUser._id.toString(),
      };

      const response = await request(app)
        .post('/api/crops')
        .send(cropData)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name', 'Basil');
      expect(response.body.data).toHaveProperty('category', 'herbs');
      expect(response.body.data).toHaveProperty('_id');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        name: 'Incomplete Crop',
        // Missing required fields: category, fieldLocation, area, etc.
      };

      const response = await request(app)
        .post('/api/crops')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate category enum', async () => {
      const invalidData = {
        farmId: testFarm._id,
        name: 'Invalid Crop',
        variety: 'Test',
        category: 'invalid_category',
        fieldLocation: 'Field X',
        area: 1.0,
        plantingDate: new Date('2024-01-01'),
        expectedHarvestDate: new Date('2024-04-01'),
        stage: { current: 'planting', progress: 10, expectedDuration: 90 },
        createdBy: testUser._id.toString(),
      };

      const response = await request(app)
        .post('/api/crops')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate area is positive', async () => {
      const invalidData = {
        farmId: testFarm._id,
        name: 'Negative Area Crop',
        variety: 'Test',
        category: 'vegetables',
        fieldLocation: 'Field X',
        area: -5.0,
        plantingDate: new Date('2024-01-01'),
        expectedHarvestDate: new Date('2024-04-01'),
        stage: { current: 'planting', progress: 10, expectedDuration: 90 },
        createdBy: testUser._id.toString(),
      };

      const response = await request(app)
        .post('/api/crops')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate expectedHarvestDate is after plantingDate', async () => {
      const invalidData = {
        farmId: testFarm._id,
        name: 'Invalid Dates Crop',
        variety: 'Test',
        category: 'vegetables',
        fieldLocation: 'Field X',
        area: 1.0,
        plantingDate: new Date('2024-04-01'),
        expectedHarvestDate: new Date('2024-01-01'), // Before planting date
        stage: { current: 'planting', progress: 10, expectedDuration: 90 },
        createdBy: testUser._id.toString(),
      };

      const response = await request(app)
        .post('/api/crops')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/crops/:cropId', () => {
    it('should update a crop', async () => {
      const crop = await Crop.create({
        farmId: testFarm._id,
        name: 'Peas',
        variety: 'Sugar Snap',
        category: 'legumes',
        fieldLocation: 'Field G',
        area: 1.5,
        plantingDate: new Date('2024-01-20'),
        expectedHarvestDate: new Date('2024-04-20'),
        stage: { current: 'vegetative', progress: 40, expectedDuration: 90 },
        createdBy: testUser._id.toString(),
      });

      const updateData = {
        stage: {
          current: 'flowering',
          progress: 65,
          expectedDuration: 90
        }
      };

      const response = await request(app)
        .put(`/api/crops/${crop._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stage.current).toBe('flowering');
      expect(response.body.data.stage.progress).toBe(65);
    });

    it('should return 404 for non-existent crop', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/crops/${fakeId}`)
        .send({ notes: 'Test update' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should allow partial updates', async () => {
      const crop = await Crop.create({
        farmId: testFarm._id,
        name: 'Beans',
        variety: 'Kidney',
        category: 'legumes',
        fieldLocation: 'Field H',
        area: 2.0,
        plantingDate: new Date('2024-02-15'),
        expectedHarvestDate: new Date('2024-05-15'),
        stage: { current: 'planting', progress: 10, expectedDuration: 90 },
        createdBy: testUser._id.toString(),
      });

      const response = await request(app)
        .put(`/api/crops/${crop._id}`)
        .send({ notes: 'Added irrigation system' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.notes).toBe('Added irrigation system');
      expect(response.body.data.name).toBe('Beans'); // Original name preserved
    });
  });

  describe('DELETE /api/crops/:cropId', () => {
    it('should delete a crop', async () => {
      const crop = await Crop.create({
        farmId: testFarm._id,
        name: 'Sunflowers',
        variety: 'Giant',
        category: 'flowers',
        fieldLocation: 'Field I',
        area: 1.0,
        plantingDate: new Date('2024-03-10'),
        expectedHarvestDate: new Date('2024-07-10'),
        stage: { current: 'germination', progress: 20, expectedDuration: 120 },
        createdBy: testUser._id.toString(),
      });

      const response = await request(app)
        .delete(`/api/crops/${crop._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      const deletedCrop = await Crop.findById(crop._id);
      expect(deletedCrop).toBeNull();
    });

    it('should return 404 when deleting non-existent crop', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/crops/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid crop ID', async () => {
      const response = await request(app)
        .delete('/api/crops/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/crops/analytics/overview', () => {
    it('should get crop analytics', async () => {
      await Crop.create({
        farmId: testFarm._id,
        name: 'Analytics Crop 1',
        variety: 'Test',
        category: 'vegetables',
        fieldLocation: 'Field J',
        area: 5.0,
        plantingDate: new Date('2024-01-01'),
        expectedHarvestDate: new Date('2024-04-01'),
        stage: { current: 'harvest', progress: 95, expectedDuration: 90 },
        createdBy: testUser._id.toString(),
      });

      const response = await request(app)
        .get('/api/crops/analytics/overview')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalCrops');
    });
  });

  describe('GET /api/crops/:cropId/predictions', () => {
    it('should get crop predictions', async () => {
      const crop = await Crop.create({
        farmId: testFarm._id,
        name: 'Prediction Crop',
        variety: 'Test',
        category: 'vegetables',
        fieldLocation: 'Field K',
        area: 3.0,
        plantingDate: new Date('2024-02-01'),
        expectedHarvestDate: new Date('2024-05-01'),
        stage: { current: 'vegetative', progress: 50, expectedDuration: 90 },
        createdBy: testUser._id.toString(),
      });

      const response = await request(app)
        .get(`/api/crops/${crop._id}/predictions`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent crop predictions', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/crops/${fakeId}/predictions`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/crops')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should handle concurrent requests', async () => {
      const cropData = {
        farmId: testFarm._id,
        name: 'Concurrent Crop',
        variety: 'Test',
        category: 'vegetables',
        fieldLocation: 'Field L',
        area: 2.0,
        plantingDate: new Date('2024-01-01'),
        expectedHarvestDate: new Date('2024-04-01'),
        stage: { current: 'planting', progress: 10, expectedDuration: 90 },
        createdBy: testUser._id.toString(),
      };

      const requests = Array(5).fill(null).map((_, i) =>
        request(app).post('/api/crops').send({ ...cropData, name: `Concurrent Crop ${i}` })
      );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });

    it('should validate pagination limits', async () => {
      const response = await request(app)
        .get('/api/crops')
        .query({ page: -1, limit: 1000 })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
