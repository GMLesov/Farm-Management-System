import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import { User } from '../src/models/User';
import IrrigationZone from '../src/models/IrrigationZone';
import irrigationRoutes from '../src/routes/irrigation';

// Create a minimal test app without starting the full server
const app = express();
app.use(express.json());
app.use('/api/irrigation', irrigationRoutes);

let mongoServer: MongoMemoryServer;
let authToken: string;
let testUserId: string;
let testFarmId: string;
let testZoneId: string;

beforeAll(async () => {
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
  await User.deleteMany({});
  await IrrigationZone.deleteMany({});
  
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({
      email: 'irrigation@example.com',
      password: 'Test123!',
      firstName: 'Irrigation',
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
    const user = await User.findOne({ email: 'irrigation@example.com' });
    if (user) {
      testUserId = (user._id as any).toString();
      testFarmId = user.currentFarm?.toString() || 'test-farm-id';
    }
  }
});

describe.skip('Irrigation Management API', () => {
  describe('POST /api/irrigation/zones', () => {
    it('should create a new irrigation zone', async () => {
      const zoneData = {
        farmId: testFarmId,
        name: 'North Field Zone',
        area: 5.0,
        cropType: 'corn',
        soilMoisture: 65,
        temperature: 25,
        humidity: 60,
        flowRate: 15.5,
        coordinates: { lat: 40.7128, lng: -74.0060 }
      };

      const response = await request(app)
        .post('/api/irrigation/zones')
        .set('Authorization', `Bearer ${authToken}`)
        .send(zoneData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('North Field Zone');
      expect(response.body.data.cropType).toBe('corn');
      expect(response.body.data.status).toBeDefined();
      
      testZoneId = response.body.data.id;
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/irrigation/zones')
        .send({
          farmId: testFarmId,
          name: 'Unauthorized Zone',
          area: 1.0
        })
        .expect(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/irrigation/zones')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId: testFarmId,
          name: 'Incomplete Zone'
          // Missing required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject negative area values', async () => {
      await request(app)
        .post('/api/irrigation/zones')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId: testFarmId,
          name: 'Invalid Area Zone',
          area: -2.0,
          cropType: 'wheat'
        })
        .expect(400);
    });

    it('should reject invalid flow rate', async () => {
      await request(app)
        .post('/api/irrigation/zones')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId: testFarmId,
          name: 'Invalid Flow Rate Zone',
          area: 2.0,
          cropType: 'wheat',
          flowRate: -10
        })
        .expect(400);
    });
  });

  describe('GET /api/irrigation/zones', () => {
    beforeEach(async () => {
      const zones = [
        {
          farmId: testFarmId,
          name: 'East Field',
          area: 3.0,
          cropType: 'tomatoes',
          soilMoisture: 70,
          flowRate: 12.0,
          status: 'active'
        },
        {
          farmId: testFarmId,
          name: 'West Greenhouse',
          area: 1.5,
          cropType: 'lettuce',
          soilMoisture: 55,
          flowRate: 8.0,
          status: 'inactive'
        },
        {
          farmId: testFarmId,
          name: 'South Orchard',
          area: 8.0,
          cropType: 'apples',
          soilMoisture: 50,
          flowRate: 20.0,
          status: 'scheduled'
        }
      ];

      for (const zone of zones) {
        await request(app)
          .post('/api/irrigation/zones')
          .set('Authorization', `Bearer ${authToken}`)
          .send(zone);
      }
    });

    it('should get all zones for authenticated user', async () => {
      const response = await request(app)
        .get('/api/irrigation/zones')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter zones by status', async () => {
      const response = await request(app)
        .get('/api/irrigation/zones?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every((zone: any) => zone.status === 'active')).toBe(true);
    });

    it('should filter zones by farmId', async () => {
      const response = await request(app)
        .get(`/api/irrigation/zones?farmId=${testFarmId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every((zone: any) => zone.farmId === testFarmId)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/irrigation/zones?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/irrigation/zones/:id', () => {
    beforeEach(async () => {
      const zoneResponse = await request(app)
        .post('/api/irrigation/zones')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId: testFarmId,
          name: 'Single Test Zone',
          area: 2.0,
          cropType: 'wheat',
          soilMoisture: 60,
          flowRate: 10.0
        });
      
      testZoneId = zoneResponse.body.data.id;
    });

    it('should get zone by ID', async () => {
      const response = await request(app)
        .get(`/api/irrigation/zones/${testZoneId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testZoneId);
      expect(response.body.data.name).toBe('Single Test Zone');
    });

    it('should return 404 for non-existent zone', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/irrigation/zones/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid ID format', async () => {
      await request(app)
        .get('/api/irrigation/zones/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('PUT /api/irrigation/zones/:id', () => {
    beforeEach(async () => {
      const zoneResponse = await request(app)
        .post('/api/irrigation/zones')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId: testFarmId,
          name: 'Update Test Zone',
          area: 3.0,
          cropType: 'corn',
          soilMoisture: 55,
          flowRate: 12.0
        });
      
      testZoneId = zoneResponse.body.data.id;
    });

    it('should update zone successfully', async () => {
      const updateData = {
        soilMoisture: 70,
        temperature: 28,
        flowRate: 15.0
      };

      const response = await request(app)
        .put(`/api/irrigation/zones/${testZoneId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.soilMoisture).toBe(70);
      expect(response.body.data.temperature).toBe(28);
      expect(response.body.data.flowRate).toBe(15.0);
    });

    it('should validate soil moisture range (0-100)', async () => {
      await request(app)
        .put(`/api/irrigation/zones/${testZoneId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ soilMoisture: 150 })
        .expect(400);
    });

    it('should return 404 for non-existent zone', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .put(`/api/irrigation/zones/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ flowRate: 10.0 })
        .expect(404);
    });
  });

  describe('DELETE /api/irrigation/zones/:id', () => {
    beforeEach(async () => {
      const zoneResponse = await request(app)
        .post('/api/irrigation/zones')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId: testFarmId,
          name: 'Delete Test Zone',
          area: 2.0,
          cropType: 'rice',
          soilMoisture: 65,
          flowRate: 14.0
        });
      
      testZoneId = zoneResponse.body.data.id;
    });

    it('should delete zone successfully', async () => {
      const response = await request(app)
        .delete(`/api/irrigation/zones/${testZoneId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify zone is deleted
      await request(app)
        .get(`/api/irrigation/zones/${testZoneId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent zone', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .delete(`/api/irrigation/zones/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should require authentication', async () => {
      await request(app)
        .delete(`/api/irrigation/zones/${testZoneId}`)
        .expect(401);
    });
  });

  describe('POST /api/irrigation/zones/:id/start', () => {
    beforeEach(async () => {
      const zoneResponse = await request(app)
        .post('/api/irrigation/zones')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId: testFarmId,
          name: 'Control Test Zone',
          area: 2.0,
          cropType: 'wheat',
          soilMoisture: 45,
          flowRate: 10.0
        });
      
      testZoneId = zoneResponse.body.data.id;
    });

    it('should start irrigation zone', async () => {
      const response = await request(app)
        .post(`/api/irrigation/zones/${testZoneId}/start`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ duration: 30 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('started');

      // Verify status changed
      const zoneResponse = await request(app)
        .get(`/api/irrigation/zones/${testZoneId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(zoneResponse.body.data.status).toBe('active');
    });

    it('should accept optional duration parameter', async () => {
      const response = await request(app)
        .post(`/api/irrigation/zones/${testZoneId}/start`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ duration: 60 })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should work without duration parameter', async () => {
      const response = await request(app)
        .post(`/api/irrigation/zones/${testZoneId}/start`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/irrigation/zones/:id/stop', () => {
    beforeEach(async () => {
      const zoneResponse = await request(app)
        .post('/api/irrigation/zones')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId: testFarmId,
          name: 'Stop Test Zone',
          area: 2.0,
          cropType: 'corn',
          soilMoisture: 55,
          flowRate: 10.0
        });
      
      testZoneId = zoneResponse.body.data.id;

      // Start the zone first
      await request(app)
        .post(`/api/irrigation/zones/${testZoneId}/start`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
    });

    it('should stop irrigation zone', async () => {
      const response = await request(app)
        .post(`/api/irrigation/zones/${testZoneId}/stop`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('stopped');

      // Verify status changed
      const zoneResponse = await request(app)
        .get(`/api/irrigation/zones/${testZoneId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(zoneResponse.body.data.status).toBe('inactive');
    });
  });

  describe('GET /api/irrigation/system/status', () => {
    beforeEach(async () => {
      // Create multiple zones with different statuses
      const zones = [
        { name: 'Active Zone 1', area: 2.0, cropType: 'corn', status: 'active' },
        { name: 'Active Zone 2', area: 3.0, cropType: 'wheat', status: 'active' },
        { name: 'Inactive Zone', area: 1.5, cropType: 'rice', status: 'inactive' }
      ];

      for (const zone of zones) {
        await request(app)
          .post('/api/irrigation/zones')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            farmId: testFarmId,
            ...zone,
            soilMoisture: 60,
            flowRate: 10.0
          });
      }
    });

    it('should get system status summary', async () => {
      const response = await request(app)
        .get('/api/irrigation/system/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalZones');
      expect(response.body.data).toHaveProperty('activeZones');
      expect(response.body.data).toHaveProperty('systemPressure');
      expect(response.body.data.totalZones).toBeGreaterThanOrEqual(3);
      expect(response.body.data.activeZones).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Irrigation Analytics', () => {
    beforeEach(async () => {
      const zones = [
        {
          farmId: testFarmId,
          name: 'Analytics Zone 1',
          area: 5.0,
          cropType: 'corn',
          soilMoisture: 65,
          flowRate: 15.0,
          waterUsage: 850
        },
        {
          farmId: testFarmId,
          name: 'Analytics Zone 2',
          area: 3.0,
          cropType: 'wheat',
          soilMoisture: 55,
          flowRate: 12.0,
          waterUsage: 620
        }
      ];

      for (const zone of zones) {
        await request(app)
          .post('/api/irrigation/zones')
          .set('Authorization', `Bearer ${authToken}`)
          .send(zone);
      }
    });

    it('should calculate total water usage', async () => {
      const response = await request(app)
        .get('/api/irrigation/analytics/water-usage')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalWaterUsage');
      expect(response.body.data.totalWaterUsage).toBeGreaterThanOrEqual(1470);
    });

    it('should provide efficiency metrics', async () => {
      const response = await request(app)
        .get('/api/irrigation/analytics/efficiency')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('averageSoilMoisture');
      expect(response.body.data).toHaveProperty('waterUsagePerHectare');
    });
  });

  describe('Low Moisture Alerts', () => {
    it('should identify zones with low moisture', async () => {
      await request(app)
        .post('/api/irrigation/zones')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          farmId: testFarmId,
          name: 'Low Moisture Zone',
          area: 2.0,
          cropType: 'tomatoes',
          soilMoisture: 25,
          flowRate: 10.0
        });

      const response = await request(app)
        .get('/api/irrigation/alerts')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.lowMoistureZones).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple zone starts concurrently', async () => {
      // Create multiple zones
      const zoneIds: string[] = [];
      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post('/api/irrigation/zones')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            farmId: testFarmId,
            name: `Concurrent Zone ${i}`,
            area: 2.0,
            cropType: 'wheat',
            soilMoisture: 60,
            flowRate: 10.0
          });
        zoneIds.push(response.body.data.id);
      }

      // Start all zones concurrently
      const startPromises = zoneIds.map(id =>
        request(app)
          .post(`/api/irrigation/zones/${id}/start`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({})
      );

      const results = await Promise.all(startPromises);
      
      results.forEach(result => {
        expect(result.status).toBe(200);
        expect(result.body.success).toBe(true);
      });
    });
  });
});
