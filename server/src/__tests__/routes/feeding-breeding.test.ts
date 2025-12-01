import request from 'supertest';
import express from 'express';
import animalRoutes from '../../routes/animals';
import authRoutes from '../../routes/auth';
import { errorHandler } from '../../middleware/errorHandler';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/animals', animalRoutes);
app.use(errorHandler);

describe('Feeding Schedule API', () => {
  let authToken: string;
  let animalId: string;
  let scheduleId: string;

  beforeEach(async () => {
    // Register admin with unique email
    const uniqueId = Date.now() + Math.random();
    const authResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin',
        email: `admin${uniqueId}@test.com`,
        password: 'password123',
        username: `admintest${uniqueId}`,
        role: 'admin'
      });
    
    authToken = authResponse.body.token;

    // Create test animal
    const animalResponse = await request(app)
      .post('/api/animals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'cattle',
        tagNumber: 'FEED001',
        gender: 'female',
        healthStatus: 'healthy'
      });

    animalId = animalResponse.body.animal._id;
  });

  describe('POST /api/animals/:id/feeding-schedule', () => {
    it('should create feeding schedule successfully', async () => {
      const scheduleData = {
        feedType: 'Hay',
        amount: 10,
        unit: 'kg',
        frequency: 'twice-daily',
        times: ['08:00', '18:00'],
        instructions: 'Feed in main barn'
      };

      const response = await request(app)
        .post(`/api/animals/${animalId}/feeding-schedule`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(scheduleData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.schedule.feedType).toBe('Hay');
      expect(response.body.schedule.amount).toBe(10);
      expect(response.body.schedule.times).toEqual(['08:00', '18:00']);
    });

    it('should fail to create schedule for non-existent animal', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .post(`/api/animals/${fakeId}/feeding-schedule`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          feedType: 'Hay',
          amount: 10,
          unit: 'kg',
          frequency: 'daily',
          times: ['08:00']
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/animals/:id/feeding-schedule', () => {
    beforeEach(async () => {
      // Create test schedule
      await request(app)
        .post(`/api/animals/${animalId}/feeding-schedule`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          feedType: 'Grain',
          amount: 5,
          unit: 'kg',
          frequency: 'daily',
          times: ['09:00']
        });
    });

    it('should get all feeding schedules for animal', async () => {
      const response = await request(app)
        .get(`/api/animals/${animalId}/feeding-schedule`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.schedules.length).toBeGreaterThan(0);
      expect(response.body.count).toBeGreaterThan(0);
    });
  });
});

describe('Breeding Records API', () => {
  let authToken: string;
  let motherId: string;
  let fatherId: string;
  let recordId: string;

  beforeEach(async () => {
    // Register admin with unique email
    const uniqueId = Date.now() + Math.random();
    const authResponse = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin',
        email: `breeding${uniqueId}@test.com`,
        password: 'password123',
        username: `breedingadmin${uniqueId}`,
        role: 'admin'
      });
    
    authToken = authResponse.body.token;

    // Create mother animal
    const motherResponse = await request(app)
      .post('/api/animals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'cattle',
        name: 'Mother Cow',
        tagNumber: 'MOM001',
        gender: 'female',
        healthStatus: 'healthy'
      });
    motherId = motherResponse.body.animal._id;

    // Create father animal
    const fatherResponse = await request(app)
      .post('/api/animals')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'cattle',
        name: 'Father Bull',
        tagNumber: 'DAD001',
        gender: 'male',
        healthStatus: 'healthy'
      });
    fatherId = fatherResponse.body.animal._id;
  });

  describe('POST /api/animals/breeding-records', () => {
    it('should create breeding record successfully', async () => {
      const breedingData = {
        motherId,
        fatherId,
        breedingDate: new Date().toISOString(),
        breedingMethod: 'natural',
        expectedDueDate: new Date(Date.now() + 280 * 24 * 60 * 60 * 1000).toISOString(),
        veterinarianNotes: 'Healthy parents'
      };

      const response = await request(app)
        .post('/api/animals/breeding-records')
        .set('Authorization', `Bearer ${authToken}`)
        .send(breedingData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.record.status).toBe('pregnant');
      recordId = response.body.record._id;
    });

    it('should fail with same animal as mother and father', async () => {
      const response = await request(app)
        .post('/api/animals/breeding-records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          motherId,
          fatherId: motherId,
          breedingDate: new Date().toISOString(),
          breedingMethod: 'natural'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/animals/:id/breeding-records', () => {
    beforeEach(async () => {
      // Create test breeding record
      await request(app)
        .post('/api/animals/breeding-records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          motherId,
          fatherId,
          breedingDate: new Date().toISOString(),
          breedingMethod: 'natural'
        });
    });

    it('should get breeding records for mother', async () => {
      const response = await request(app)
        .get(`/api/animals/${motherId}/breeding-records`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.records.length).toBeGreaterThan(0);
    });

    it('should get breeding records for father', async () => {
      const response = await request(app)
        .get(`/api/animals/${fatherId}/breeding-records`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.records.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/animals/breeding-records/active', () => {
    beforeEach(async () => {
      // Create active breeding record
      await request(app)
        .post('/api/animals/breeding-records')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          motherId,
          fatherId,
          breedingDate: new Date().toISOString(),
          breedingMethod: 'natural',
          expectedDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
    });

    it('should get all active pregnancies', async () => {
      const response = await request(app)
        .get('/api/animals/breeding-records/active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.records.length).toBeGreaterThan(0);
      expect(response.body.records.every((r: any) => 
        r.status === 'pregnant' || r.status === 'pending'
      )).toBe(true);
    });
  });
});
