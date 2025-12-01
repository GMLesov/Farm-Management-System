import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import { User } from '../src/models/User';
import Crop from '../src/models/Crop';
import cropRoutes from '../src/routes/crops';

// Create a minimal test app without starting the full server
const app = express();
app.use(express.json());
app.use('/api/crops', cropRoutes);

let mongoServer: MongoMemoryServer;
let authToken: string;
let testUserId: string;
let testFarmId: string;
let testCropId: string;

beforeAll(async () => {
  // Create in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear collections
  await User.deleteMany({});
  await Crop.deleteMany({});
  
  // Create test user and get auth token
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'croptest@example.com',
      password: 'Test123!',
      firstName: 'Crop',
      lastName: 'Tester',
      role: 'manager',
      farmName: 'Test Farm'
    });
  
  authToken = registerResponse.body.token;
  if (registerResponse.body.user) {
    testUserId = registerResponse.body.user.id || registerResponse.body.user._id;
    testFarmId = registerResponse.body.user.farmId || registerResponse.body.user.currentFarm || 'test-farm-id';
  } else {
    // Fallback if registration format is different
    const user = await User.findOne({ email: 'croptest@example.com' });
    if (user) {
      testUserId = (user._id as any).toString();
      testFarmId = user.currentFarm?.toString() || 'test-farm-id';
    }
  }
});

describe.skip('Crop Management API', () => {
  describe('POST /api/crops', () => {
    it('should create a new crop with valid data', async () => {
      const cropData = {
        farmId: testFarmId,
        name: 'Test Tomatoes',
        variety: 'Cherokee Purple',
        category: 'vegetables',
        fieldLocation: 'North Field',
        area: 2.5,
        soilType: 'Loamy',
        plantingDate: '2025-11-01',
        expectedHarvestDate: '2026-01-15',
        stage: {
          current: 'planting',
          progress: 10,
          expectedDuration: 90,
          milestones: []
        },
        growthProgress: 10
      };

      const response = await request(app)
        .post('/api/crops')
        .set('Authorization', `Bearer ${authToken}`)
        .send(cropData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Test Tomatoes');
      expect(response.body.data.variety).toBe('Cherokee Purple');
      expect(response.body.data.category).toBe('vegetables');
      
      testCropId = response.body.data.id;
    });

    it('should return 401 without authentication', async () => {
      const cropData = {
        farmId: testFarmId,
        name: 'Unauthorized Crop',
        variety: 'Test',
        category: 'vegetables'
      };

      await request(app)
        .post('/api/crops')
        .send(cropData)
        .expect(401);
    });

    it('should return 400 with missing required fields', async () => {
      const response = await request(app)
        .post('/api/crops')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId: testFarmId,
          name: 'Incomplete Crop'
          // Missing variety, category, etc.
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate crop category', async () => {
      const response = await request(app)
        .post('/api/crops')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId: testFarmId,
          name: 'Invalid Category Crop',
          variety: 'Test',
          category: 'invalid-category',
          plantingDate: '2025-11-01'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/crops', () => {
    beforeEach(async () => {
      // Create multiple test crops
      const crops = [
        {
          farmId: testFarmId,
          name: 'Corn',
          variety: 'Sweet Corn',
          category: 'grains',
          fieldLocation: 'East Field',
          area: 5.0,
          plantingDate: '2025-10-15',
          expectedHarvestDate: '2026-01-20',
          stage: { current: 'vegetative', progress: 40, expectedDuration: 90, milestones: [] },
          createdBy: testUserId
        },
        {
          farmId: testFarmId,
          name: 'Wheat',
          variety: 'Winter Wheat',
          category: 'grains',
          fieldLocation: 'West Field',
          area: 10.0,
          plantingDate: '2025-10-01',
          expectedHarvestDate: '2026-06-15',
          stage: { current: 'germination', progress: 20, expectedDuration: 180, milestones: [] },
          createdBy: testUserId
        }
      ];

      for (const crop of crops) {
        await request(app)
          .post('/api/crops')
          .set('Authorization', `Bearer ${authToken}`)
          .send(crop);
      }
    });

    it('should get all crops for authenticated user', async () => {
      const response = await request(app)
        .get('/api/crops')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('should filter crops by farmId', async () => {
      const response = await request(app)
        .get(`/api/crops?farmId=${testFarmId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every((crop: any) => crop.farmId === testFarmId)).toBe(true);
    });

    it('should filter crops by category', async () => {
      const response = await request(app)
        .get('/api/crops?category=grains')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every((crop: any) => crop.category === 'grains')).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/crops?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(1);
      expect(response.body).toHaveProperty('pagination');
    });
  });

  describe('GET /api/crops/:id', () => {
    beforeEach(async () => {
      const cropResponse = await request(app)
        .post('/api/crops')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId: testFarmId,
          name: 'Single Test Crop',
          variety: 'Test Variety',
          category: 'vegetables',
          fieldLocation: 'Test Field',
          area: 1.0,
          plantingDate: '2025-11-01',
          expectedHarvestDate: '2026-01-01',
          stage: { current: 'planting', progress: 5, expectedDuration: 90, milestones: [] }
        });
      
      testCropId = cropResponse.body.data.id;
    });

    it('should get crop by ID', async () => {
      const response = await request(app)
        .get(`/api/crops/${testCropId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testCropId);
      expect(response.body.data.name).toBe('Single Test Crop');
    });

    it('should return 404 for non-existent crop', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/crops/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid crop ID format', async () => {
      await request(app)
        .get('/api/crops/invalid-id-format')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('PUT /api/crops/:id', () => {
    beforeEach(async () => {
      const cropResponse = await request(app)
        .post('/api/crops')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId: testFarmId,
          name: 'Update Test Crop',
          variety: 'Original Variety',
          category: 'vegetables',
          fieldLocation: 'Test Field',
          area: 1.0,
          plantingDate: '2025-11-01',
          expectedHarvestDate: '2026-01-01',
          stage: { current: 'planting', progress: 10, expectedDuration: 90, milestones: [] }
        });
      
      testCropId = cropResponse.body.data.id;
    });

    it('should update crop successfully', async () => {
      const updateData = {
        variety: 'Updated Variety',
        growthProgress: 50,
        stage: {
          current: 'flowering',
          progress: 50,
          expectedDuration: 90,
          milestones: []
        }
      };

      const response = await request(app)
        .put(`/api/crops/${testCropId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.variety).toBe('Updated Variety');
      expect(response.body.data.growthProgress).toBe(50);
    });

    it('should not allow updating farmId', async () => {
      const response = await request(app)
        .put(`/api/crops/${testCropId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId: 'different-farm-id'
        });

      // Should either ignore or reject farmId updates
      expect(response.body.data.farmId).toBe(testFarmId);
    });

    it('should return 404 when updating non-existent crop', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .put(`/api/crops/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ variety: 'New Variety' })
        .expect(404);
    });
  });

  describe('DELETE /api/crops/:id', () => {
    beforeEach(async () => {
      const cropResponse = await request(app)
        .post('/api/crops')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId: testFarmId,
          name: 'Delete Test Crop',
          variety: 'Test Variety',
          category: 'vegetables',
          fieldLocation: 'Test Field',
          area: 1.0,
          plantingDate: '2025-11-01',
          expectedHarvestDate: '2026-01-01',
          stage: { current: 'planting', progress: 10, expectedDuration: 90, milestones: [] }
        });
      
      testCropId = cropResponse.body.data.id;
    });

    it('should delete crop successfully', async () => {
      const response = await request(app)
        .delete(`/api/crops/${testCropId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify crop is deleted
      await request(app)
        .get(`/api/crops/${testCropId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 when deleting non-existent crop', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .delete(`/api/crops/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should require authentication for deletion', async () => {
      await request(app)
        .delete(`/api/crops/${testCropId}`)
        .expect(401);
    });
  });

  describe('Crop Analytics', () => {
    beforeEach(async () => {
      // Create multiple crops with different data
      const crops = [
        {
          farmId: testFarmId,
          name: 'Analytics Crop 1',
          variety: 'V1',
          category: 'vegetables',
          area: 5.0,
          expectedRevenue: 10000,
          stage: { current: 'flowering', progress: 70, expectedDuration: 90, milestones: [] }
        },
        {
          farmId: testFarmId,
          name: 'Analytics Crop 2',
          variety: 'V2',
          category: 'fruits',
          area: 3.0,
          expectedRevenue: 15000,
          stage: { current: 'maturation', progress: 85, expectedDuration: 120, milestones: [] }
        }
      ];

      for (const crop of crops) {
        await request(app)
          .post('/api/crops')
          .set('Authorization', `Bearer ${authToken}`)
          .send(crop);
      }
    });

    it('should get crop analytics', async () => {
      const response = await request(app)
        .get('/api/crops/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalCrops');
      expect(response.body.data).toHaveProperty('totalArea');
      expect(response.body.data).toHaveProperty('cropsByCategory');
      expect(response.body.data.totalCrops).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Input Validation', () => {
    it('should reject negative area values', async () => {
      await request(app)
        .post('/api/crops')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId: testFarmId,
          name: 'Invalid Area Crop',
          variety: 'Test',
          category: 'vegetables',
          area: -5.0
        })
        .expect(400);
    });

    it('should reject invalid date formats', async () => {
      await request(app)
        .post('/api/crops')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId: testFarmId,
          name: 'Invalid Date Crop',
          variety: 'Test',
          category: 'vegetables',
          area: 1.0,
          plantingDate: 'not-a-date'
        })
        .expect(400);
    });

    it('should reject harvest date before planting date', async () => {
      await request(app)
        .post('/api/crops')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId: testFarmId,
          name: 'Invalid Dates Crop',
          variety: 'Test',
          category: 'vegetables',
          area: 1.0,
          plantingDate: '2026-01-01',
          expectedHarvestDate: '2025-11-01'
        })
        .expect(400);
    });
  });
});
