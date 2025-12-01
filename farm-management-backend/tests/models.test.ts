import { Animal } from '../src/models/Animal';
import { Farm } from '../src/models/Farm';
import { User } from '../src/models/User';
import { VeterinaryRecord } from '../src/models/VeterinaryRecord';
import { Feed } from '../src/models/Feed';
import mongoose, { Types } from 'mongoose';

const TEST_USER_ID = '507f1f77bcf86cd799439011';

describe('Model Validation Tests', () => {
  let testUser: any;
  let testFarm: any;

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
  });

  describe('Animal Model', () => {
    it('should create a valid animal', async () => {
      const animalData = {
        farm: testFarm._id,
        owner: testUser._id,
        identificationNumber: 'TEST001',
        name: 'Test Cow',
        species: 'cattle',
        breed: 'Holstein',
        gender: 'female',
        dateOfBirth: new Date('2020-01-01'),
        feedingSchedule: {
          feedType: 'hay',
          quantity: 5,
          frequency: 2,
        },
      };

      const animal = await Animal.create(animalData);
      expect(animal.identificationNumber).toBe('TEST001');
      expect(animal.name).toBe('Test Cow');
      expect(animal.species).toBe('cattle');
      expect(animal.gender).toBe('female');
    });

    it('should require farm field', async () => {
      const animalData = {
        identificationNumber: 'TEST002',
        species: 'cattle',
        breed: 'Angus',
        gender: 'male',
        owner: testUser._id,
        feedingSchedule: { feedType: 'hay', quantity: 4, frequency: 2 },
      };

      await expect(Animal.create(animalData)).rejects.toThrow();
    });

    it('should require unique tag number within farm', async () => {
      const animalData1 = {
        farm: testFarm._id,
        owner: testUser._id,
        identificationNumber: 'DUPLICATE',
        species: 'cattle',
        breed: 'Holstein',
        gender: 'female',
        feedingSchedule: { feedType: 'hay', quantity: 4, frequency: 2 },
      };

      const animalData2 = {
        farm: testFarm._id,
        owner: testUser._id,
        identificationNumber: 'DUPLICATE',
        species: 'pig',
        breed: 'Yorkshire',
        gender: 'male',
        feedingSchedule: { feedType: 'grain', quantity: 3, frequency: 2 },
      };

      await Animal.create(animalData1);
      await expect(Animal.create(animalData2)).rejects.toThrow();
    });
  });

  describe('VeterinaryRecord Model', () => {
    let testAnimal: any;

    beforeEach(async () => {
      testAnimal = await Animal.create({
        farm: testFarm._id,
        owner: testUser._id,
        identificationNumber: 'VET001',
        species: 'cattle',
        breed: 'Holstein',
        gender: 'female',
        feedingSchedule: { feedType: 'hay', quantity: 5, frequency: 2 },
      });
    });

    it('should create a valid veterinary record', async () => {
      const vetRecordData = {
        farm: testFarm._id,
        animal: testAnimal._id,
        veterinarian: {
          name: 'Dr. Smith',
          clinic: 'Test Clinic',
          phone: '555-0123'
        },
        appointment: {
          scheduledDate: new Date('2023-12-01'),
          type: 'routine_checkup',
          status: 'scheduled'
        },
        costs: {
          consultationFee: 100,
          medicationCost: 50
        },
        createdBy: testUser._id,
      };

      const vetRecord = await VeterinaryRecord.create(vetRecordData);
      expect(vetRecord.veterinarian.name).toBe('Dr. Smith');
      expect(vetRecord.appointment.type).toBe('routine_checkup');
      expect(vetRecord.costs.totalCost).toBe(150); // Calculated automatically
    });

    it('should calculate total cost automatically', async () => {
      const vetRecordData = {
        farm: testFarm._id,
        animal: testAnimal._id,
        veterinarian: {
          name: 'Dr. Johnson',
          clinic: 'Another Clinic',
          phone: '555-0456'
        },
        appointment: {
          scheduledDate: new Date('2023-12-15'),
          type: 'vaccination'
        },
        costs: {
          consultationFee: 75,
          medicationCost: 25,
          procedureCost: 50,
          additionalCharges: 10
        },
        createdBy: testUser._id,
      };

      const vetRecord = await VeterinaryRecord.create(vetRecordData);
      expect(vetRecord.costs.totalCost).toBe(160); // 75 + 25 + 50 + 10
    });
  });

  describe('Feed Model', () => {
    it('should create a valid feed', async () => {
      const feedData = {
        farm: testFarm._id,
        name: 'Premium Cattle Feed',
        type: 'grain',
        suitableFor: ['cattle'],
        nutritionFacts: {
          protein: 18,
          fat: 4,
          fiber: 12,
          moisture: 10,
          energy: 2800,
        },
        inventory: {
          currentStock: 1000,
          unit: 'kg',
          reorderLevel: 200,
          lastRestocked: new Date(),
          costPerUnit: 1.5,
        },
        supplier: 'Quality Feed Co.',
      };

      const feed = await Feed.create(feedData);
      expect(feed.name).toBe('Premium Cattle Feed');
      expect(feed.type).toBe('grain');
      expect(feed.suitableFor).toContain('cattle');
      expect(feed.inventory.currentStock).toBe(1000);
    });

    it('should require name field', async () => {
      const feedData = {
        farm: testFarm._id,
        type: 'hay',
        suitableFor: ['sheep'],
        supplier: 'Valley Feed',
        nutritionFacts: { protein: 10, fat: 2, fiber: 25, moisture: 12, energy: 2000 },
        inventory: { currentStock: 10, unit: 'kg', reorderLevel: 2, lastRestocked: new Date(), costPerUnit: 1 },
      };

      await expect(Feed.create(feedData)).rejects.toThrow();
    });

    it('should validate feed type enum', async () => {
      const feedData = {
        farm: testFarm._id,
        name: 'Invalid Feed',
        type: 'invalid_type',
        suitableFor: ['cattle'],
        createdBy: testUser._id,
      };

      await expect(Feed.create(feedData)).rejects.toThrow();
    });
  });

  describe('Model Relationships', () => {
    it('should populate animal in veterinary record', async () => {
      const animal = await Animal.create({
        farm: testFarm._id,
        owner: testUser._id,
        identificationNumber: 'REL001',
        name: 'Relationship Test Cow',
        species: 'cattle',
        breed: 'Holstein',
        gender: 'female',
        feedingSchedule: { feedType: 'hay', quantity: 5, frequency: 2 },
      });

      const vetRecord = await VeterinaryRecord.create({
        farm: testFarm._id,
        animal: animal._id,
        veterinarian: {
          name: 'Dr. Relationship',
          clinic: 'Test Clinic',
          phone: '555-0789'
        },
        appointment: {
          scheduledDate: new Date('2023-12-20'),
          type: 'routine_checkup'
        },
        createdBy: testUser._id,
      });

      const populatedRecord = await VeterinaryRecord.findById(vetRecord._id)
        .populate('animal', 'identificationNumber name species');

      expect(populatedRecord?.animal).toBeDefined();
  expect((populatedRecord?.animal as any).identificationNumber).toBe('REL001');
      expect((populatedRecord?.animal as any).name).toBe('Relationship Test Cow');
    });
  });
});