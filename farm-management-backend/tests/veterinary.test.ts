import request from 'supertest';
import express from 'express';
import { Types } from 'mongoose';
import { VeterinaryRecord } from '../src/models/VeterinaryRecord';
import { Animal } from '../src/models/Animal';
import { Farm } from '../src/models/Farm';
import { User } from '../src/models/User';
import veterinaryRoutes from '../src/routes/veterinary';

const TEST_USER_ID = '507f1f77bcf86cd799439011';

// Mock auth middleware for testing
jest.mock('../src/middleware/auth', () => ({
  authMiddleware: jest.fn((req: any, res: any, next: any) => {
    req.user = { id: TEST_USER_ID, email: 'test@example.com' };
    next();
  })
}));

const app = express();
app.use(express.json());
app.use('/api/veterinary', veterinaryRoutes);

describe('Veterinary API Tests', () => {
  let testUser: any;
  let testFarm: any;
  let testAnimal: any;
  let testVetRecord: any;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      _id: new Types.ObjectId(TEST_USER_ID),
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: 'farmer',
    });

    // Create test farm
    testFarm = await Farm.create({
      name: 'Test Farm',
      location: {
        address: '123 Farm Road',
        city: 'Test City',
        state: 'Test State',
        country: 'Test Country',
        zipCode: '12345',
        latitude: 40.7128,
        longitude: -74.0060
      },
      size: 100,
      soilType: 'loam',
      climateZone: 'temperate',
      owner: testUser._id,
      managers: [testUser._id],
    });

    // Create test animal
    testAnimal = await Animal.create({
      farm: testFarm._id,
      owner: testUser._id,
      identificationNumber: 'TEST001',
      name: 'Test Cow',
      species: 'cattle',
      breed: 'Holstein',
      gender: 'female',
      dateOfBirth: new Date('2020-01-01'),
      feedingSchedule: { feedType: 'hay', quantity: 5, frequency: 2 },
    });

    // Create test veterinary record
    testVetRecord = await VeterinaryRecord.create({
      farm: testFarm._id,
      animal: testAnimal._id,
      veterinarian: {
        name: 'Dr. Smith',
        clinic: 'Test Veterinary Clinic',
        phone: '555-0123',
        email: 'dr.smith@testclinic.com'
      },
      appointment: {
        scheduledDate: new Date('2023-12-01'),
        type: 'routine_checkup',
        status: 'scheduled'
      },
      costs: {
        consultationFee: 100,
        medicationCost: 50,
        procedureCost: 0,
        additionalCharges: 0
      },
      createdBy: testUser._id,
    });
  });

  describe('GET /api/veterinary', () => {
    it('should fetch veterinary records for a farm', async () => {
      const response = await request(app)
        .get('/api/veterinary')
        .query({ farmId: testFarm._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.records).toHaveLength(1);
      expect(response.body.data.records[0].veterinarian.name).toBe('Dr. Smith');
    });

    it('should return 400 if farmId is missing', async () => {
      const response = await request(app)
        .get('/api/veterinary');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Farm ID is required');
    });

    it('should filter records by appointment status', async () => {
      const response = await request(app)
        .get('/api/veterinary')
        .query({ 
          farmId: testFarm._id.toString(),
          status: 'scheduled'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.records).toHaveLength(1);
      expect(response.body.data.records[0].appointment.status).toBe('scheduled');
    });
  });

  describe('GET /api/veterinary/upcoming', () => {
    it('should fetch upcoming appointments', async () => {
      // Create an appointment in the future
      await VeterinaryRecord.create({
        farm: testFarm._id,
        animal: testAnimal._id,
        veterinarian: {
          name: 'Dr. Johnson',
          clinic: 'Future Vet Clinic',
          phone: '555-0456'
        },
        appointment: {
          scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
          type: 'vaccination',
          status: 'scheduled'
        },
        costs: {
          consultationFee: 75
        },
        createdBy: testUser._id,
      });

      const response = await request(app)
        .get('/api/veterinary/upcoming')
        .query({ farmId: testFarm._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/veterinary/:id', () => {
    it('should fetch a specific veterinary record', async () => {
      const response = await request(app)
        .get(`/api/veterinary/${testVetRecord._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.veterinarian.name).toBe('Dr. Smith');
      expect(response.body.data.appointment.type).toBe('routine_checkup');
    });

    it('should return 404 for non-existent record', async () => {
      const fakeId = new Types.ObjectId();
      const response = await request(app)
        .get(`/api/veterinary/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Veterinary record not found');
    });
  });

  describe('POST /api/veterinary', () => {
    it('should create a new veterinary record', async () => {
      const newRecordData = {
        farm: testFarm._id,
        animal: testAnimal._id,
        veterinarian: {
          name: 'Dr. Brown',
          clinic: 'New Vet Clinic',
          phone: '555-0789'
        },
        appointment: {
          scheduledDate: '2023-12-15',
          type: 'surgery',
          status: 'scheduled'
        },
        costs: {
          consultationFee: 150,
          procedureCost: 500
        }
      };

      const response = await request(app)
        .post('/api/veterinary')
        .send(newRecordData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.veterinarian.name).toBe('Dr. Brown');
      expect(response.body.data.appointment.type).toBe('surgery');
    });

    it('should return 404 for non-existent animal', async () => {
      const fakeAnimalId = new Types.ObjectId();
      const newRecordData = {
        farm: testFarm._id,
        animal: fakeAnimalId,
        veterinarian: {
          name: 'Dr. Brown',
          clinic: 'New Vet Clinic',
          phone: '555-0789'
        },
        appointment: {
          scheduledDate: '2023-12-15',
          type: 'surgery'
        }
      };

      const response = await request(app)
        .post('/api/veterinary')
        .send(newRecordData);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Animal not found');
    });
  });

  describe('PATCH /api/veterinary/:id/complete', () => {
    it('should mark appointment as completed', async () => {
      const completionData = {
        actualDate: '2023-12-01',
        examination: {
          weight: 550,
          temperature: 38.5,
          generalCondition: 'Good health',
          findings: ['Normal vital signs', 'No abnormalities detected']
        },
        treatment: {
          diagnosis: ['Healthy animal'],
          prescriptions: [{
            medication: 'Vitamin supplement',
            dosage: '10ml',
            frequency: 'Daily',
            duration: '7 days',
            instructions: 'Mix with feed'
          }]
        },
        costs: {
          medicationCost: 25
        }
      };

      const response = await request(app)
        .patch(`/api/veterinary/${testVetRecord._id}/complete`)
        .send(completionData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.appointment.status).toBe('completed');
      expect(response.body.data.examination.weight).toBe(550);
    });
  });

  describe('POST /api/veterinary/:id/documents', () => {
    it('should add a document to veterinary record', async () => {
      const documentData = {
        type: 'prescription',
        name: 'Vaccination Certificate',
        url: 'https://example.com/docs/vaccination-cert.pdf'
      };

      const response = await request(app)
        .post(`/api/veterinary/${testVetRecord._id}/documents`)
        .send(documentData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.documents).toHaveLength(1);
      expect(response.body.data.documents[0].name).toBe('Vaccination Certificate');
    });
  });

  describe('GET /api/veterinary/analytics/summary', () => {
    it('should return veterinary analytics summary', async () => {
      const response = await request(app)
        .get('/api/veterinary/analytics/summary')
        .query({ farmId: testFarm._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.summary).toBeDefined();
      expect(response.body.data.summary.totalRecords).toBe(1);
      expect(response.body.data.appointmentsByType).toBeDefined();
    });
  });

  describe('DELETE /api/veterinary/:id', () => {
    it('should delete a veterinary record', async () => {
      const response = await request(app)
        .delete(`/api/veterinary/${testVetRecord._id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Veterinary record deleted successfully');

      // Verify record is deleted
      const deletedRecord = await VeterinaryRecord.findById(testVetRecord._id);
      expect(deletedRecord).toBeNull();
    });
  });
});