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

describe('Animal API', () => {
  let authToken: string;
  let animalId: string;

  beforeEach(async () => {
    // Register and login as admin with unique email
    const uniqueId = Date.now() + Math.random();
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: `admin${uniqueId}@example.com`,
        password: 'password123',
        username: `adminuser${uniqueId}`,
        role: 'admin'
      });
    
    authToken = response.body.token;
  });

  describe('POST /api/animals', () => {
    it('should create a new animal successfully', async () => {
      const animalData = {
        type: 'cattle',
        name: 'Bessie',
        tagNumber: 'COW001',
        breed: 'Holstein',
        gender: 'female',
        healthStatus: 'healthy',
        weight: 450,
        location: 'Barn A'
      };

      const response = await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(animalData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.animal.name).toBe('Bessie');
      expect(response.body.animal.tagNumber).toBe('COW001');
      animalId = response.body.animal._id;
    });

    it('should fail to create animal with duplicate tag number', async () => {
      const animalData = {
        type: 'cattle',
        tagNumber: 'DUP001',
        gender: 'male',
        healthStatus: 'healthy'
      };

      // Create first animal
      await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(animalData)
        .expect(201);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${authToken}`)
        .send(animalData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should fail without authentication', async () => {
      const response = await request(app)
        .post('/api/animals')
        .send({ type: 'cattle', tagNumber: 'TEST001', gender: 'male' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/animals', () => {
    beforeEach(async () => {
      // Create test animals
      await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'cattle',
          tagNumber: 'GET001',
          gender: 'female',
          healthStatus: 'healthy'
        });

      await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'sheep',
          tagNumber: 'GET002',
          gender: 'male',
          healthStatus: 'sick'
        });
    });

    it('should get all animals', async () => {
      const response = await request(app)
        .get('/api/animals')
        .set('Authorization', `Bearer ${authToken}`);

      // Debug: log response
      if (response.status !== 200) {
        console.log('Failed with:', response.status, response.body);
      }

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.animals.length).toBeGreaterThanOrEqual(2);
      expect(response.body.count).toBeGreaterThanOrEqual(2);
    });

    it('should filter animals by type', async () => {
      const response = await request(app)
        .get('/api/animals?type=cattle')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.animals.every((a: any) => a.type === 'cattle')).toBe(true);
    });

    it('should filter animals by health status', async () => {
      const response = await request(app)
        .get('/api/animals?healthStatus=sick')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.animals.every((a: any) => a.healthStatus === 'sick')).toBe(true);
    });
  });

  describe('GET /api/animals/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'pigs',
          name: 'Porky',
          tagNumber: 'PIG001',
          gender: 'male',
          healthStatus: 'healthy'
        });
      
      animalId = response.body.animal._id;
    });

    it('should get single animal by ID', async () => {
      const response = await request(app)
        .get(`/api/animals/${animalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.animal._id).toBe(animalId);
      expect(response.body.animal.name).toBe('Porky');
    });

    it('should return 404 for non-existent animal', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/animals/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/animals/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'chickens',
          tagNumber: 'CHK001',
          gender: 'female',
          healthStatus: 'healthy',
          weight: 2
        });
      
      animalId = response.body.animal._id;
    });

    it('should update animal successfully', async () => {
      const updateData = {
        weight: 2.5,
        healthStatus: 'sick',
        notes: 'Showing signs of illness'
      };

      const response = await request(app)
        .put(`/api/animals/${animalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.animal.weight).toBe(2.5);
      expect(response.body.animal.healthStatus).toBe('sick');
      expect(response.body.animal.notes).toBe('Showing signs of illness');
    });

    it('should fail to update non-existent animal', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .put(`/api/animals/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ weight: 100 })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/animals/:id', () => {
    beforeEach(async () => {
      const response = await request(app)
        .post('/api/animals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'goats',
          tagNumber: 'GOT001',
          gender: 'male',
          healthStatus: 'healthy'
        });
      
      animalId = response.body.animal._id;
    });

    it('should delete animal successfully', async () => {
      const response = await request(app)
        .delete(`/api/animals/${animalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted');

      // Verify animal is deleted
      await request(app)
        .get(`/api/animals/${animalId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
