import mongoose from 'mongoose';
import { BreedingRecord, IBreedingRecord } from '../src/models/BreedingRecord';
import { Animal } from '../src/models/Animal';
import { Farm } from '../src/models/Farm';
import { User } from '../src/models/User';

describe('BreedingRecord Model', () => {
  let testFarm: any;
  let testUser: any;
  let femaleAnimal: any;
  let maleAnimal: any;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      firstName: 'Breeding',
      lastName: 'Tester',
      email: 'breeding@test.com',
      password: 'hashedpassword123',
      role: 'farmer',
    });

    // Create test farm
    testFarm = await Farm.create({
      name: 'Breeding Test Farm',
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
      soilType: 'loamy',
      climateZone: 'temperate',
      owner: testUser._id,
      managers: [testUser._id],
    });

    // Create female animal
    femaleAnimal = await Animal.create({
      farm: testFarm._id,
      owner: testUser._id,
      identificationNumber: 'F001',
      tagId: 'F001',
      name: 'Bessie',
      species: 'cattle',
      breed: 'Holstein',
      gender: 'female',
      dateOfBirth: new Date('2020-01-15'),
      status: 'active',
      feedingSchedule: {
        feedType: 'hay',
        quantity: 8,
        frequency: 2,
      },
      healthStatus: {
        current: 'healthy',
        lastCheckup: new Date(),
        vaccinations: [],
        medicalHistory: [],
      },
      location: {
        type: 'barn',
        barn: 'Barn A',
        section: 'Section 1',
      },
      healthRecords: [],
      breedingRecords: [],
      productionRecords: [],
    });

    // Create male animal
    maleAnimal = await Animal.create({
      farm: testFarm._id,
      owner: testUser._id,
      identificationNumber: 'M001',
      tagId: 'M001',
      name: 'Duke',
      species: 'cattle',
      breed: 'Holstein',
      gender: 'male',
      dateOfBirth: new Date('2019-06-10'),
      status: 'active',
      feedingSchedule: {
        feedType: 'hay',
        quantity: 10,
        frequency: 2,
      },
      healthStatus: {
        current: 'healthy',
        lastCheckup: new Date(),
        vaccinations: [],
        medicalHistory: [],
      },
      location: {
        type: 'barn',
        barn: 'Barn B',
        section: 'Section 1',
      },
      healthRecords: [],
      breedingRecords: [],
      productionRecords: [],
    });
  });

  describe('Schema Validation', () => {
    it('should create a breeding record with required fields', async () => {
      const breedingData = {
        farm: testFarm._id,
        femaleAnimal: femaleAnimal._id,
        maleAnimal: maleAnimal._id,
        breedingType: 'natural',
        breedingDate: new Date('2024-03-01'),
        expectedBirthDate: new Date('2024-12-01'),
        createdBy: testUser._id,
      };

      const record = await BreedingRecord.create(breedingData);

      expect(record).toBeDefined();
      expect(record.farm.toString()).toBe(testFarm._id.toString());
      expect(record.femaleAnimal.toString()).toBe(femaleAnimal._id.toString());
      expect(record.maleAnimal?.toString()).toBe(maleAnimal._id.toString());
      expect(record.breedingType).toBe('natural');
      expect(record.outcome.status).toBe('pending');
    });

    it('should validate required farm field', async () => {
      const breedingData = {
        femaleAnimal: femaleAnimal._id,
        breedingType: 'natural',
        breedingDate: new Date(),
        expectedBirthDate: new Date(),
        createdBy: testUser._id,
      };

      await expect(BreedingRecord.create(breedingData)).rejects.toThrow();
    });

    it('should validate required femaleAnimal field', async () => {
      const breedingData = {
        farm: testFarm._id,
        breedingType: 'natural',
        breedingDate: new Date(),
        expectedBirthDate: new Date(),
        createdBy: testUser._id,
      };

      await expect(BreedingRecord.create(breedingData)).rejects.toThrow();
    });

    it('should validate required breedingType field', async () => {
      const breedingData = {
        farm: testFarm._id,
        femaleAnimal: femaleAnimal._id,
        breedingDate: new Date(),
        expectedBirthDate: new Date(),
        createdBy: testUser._id,
      };

      await expect(BreedingRecord.create(breedingData)).rejects.toThrow();
    });

    it('should validate breedingType enum values', async () => {
      const breedingData = {
        farm: testFarm._id,
        femaleAnimal: femaleAnimal._id,
        breedingType: 'invalid_type',
        breedingDate: new Date(),
        expectedBirthDate: new Date(),
        createdBy: testUser._id,
      };

      await expect(BreedingRecord.create(breedingData as any)).rejects.toThrow();
    });

    it('should allow artificial_insemination without maleAnimal', async () => {
      const breedingData = {
        farm: testFarm._id,
        femaleAnimal: femaleAnimal._id,
        breedingType: 'artificial_insemination',
        breedingDate: new Date('2024-03-01'),
        expectedBirthDate: new Date('2024-12-01'),
        createdBy: testUser._id,
      };

      const record = await BreedingRecord.create(breedingData);

      expect(record).toBeDefined();
      expect(record.maleAnimal).toBeUndefined();
      expect(record.breedingType).toBe('artificial_insemination');
    });

    it('should validate outcome status enum values', async () => {
      const breedingData = {
        farm: testFarm._id,
        femaleAnimal: femaleAnimal._id,
        breedingType: 'natural',
        breedingDate: new Date(),
        expectedBirthDate: new Date(),
        outcome: {
          status: 'invalid_status',
        },
        createdBy: testUser._id,
      };

      await expect(BreedingRecord.create(breedingData as any)).rejects.toThrow();
    });
  });

  describe('Default Values', () => {
    it('should set default outcome status to pending', async () => {
      const breedingData = {
        farm: testFarm._id,
        femaleAnimal: femaleAnimal._id,
        breedingType: 'natural',
        breedingDate: new Date(),
        expectedBirthDate: new Date(),
        createdBy: testUser._id,
      };

      const record = await BreedingRecord.create(breedingData);

      expect(record.outcome.status).toBe('pending');
    });

    it('should set default cost values to 0', async () => {
      const breedingData = {
        farm: testFarm._id,
        femaleAnimal: femaleAnimal._id,
        breedingType: 'natural',
        breedingDate: new Date(),
        expectedBirthDate: new Date(),
        createdBy: testUser._id,
      };

      const record = await BreedingRecord.create(breedingData);

      expect(record.cost.serviceFee).toBe(0);
      expect(record.cost.medicationCost).toBe(0);
      expect(record.cost.additionalCharges).toBe(0);
      expect(record.cost.totalCost).toBe(0);
    });

    it('should set timestamps automatically', async () => {
      const breedingData = {
        farm: testFarm._id,
        femaleAnimal: femaleAnimal._id,
        breedingType: 'natural',
        breedingDate: new Date(),
        expectedBirthDate: new Date(),
        createdBy: testUser._id,
      };

      const record = await BreedingRecord.create(breedingData);

      expect(record.createdAt).toBeDefined();
      expect(record.updatedAt).toBeDefined();
      expect(record.createdAt).toBeInstanceOf(Date);
      expect(record.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Pre-save Hook - Total Cost Calculation', () => {
    it('should calculate totalCost from individual costs', async () => {
      const breedingData = {
        farm: testFarm._id,
        femaleAnimal: femaleAnimal._id,
        breedingType: 'artificial_insemination',
        breedingDate: new Date(),
        expectedBirthDate: new Date(),
        cost: {
          serviceFee: 150.00,
          medicationCost: 50.00,
          additionalCharges: 25.00,
          totalCost: 0, // Should be calculated
        },
        createdBy: testUser._id,
      };

      const record = await BreedingRecord.create(breedingData);

      expect(record.cost.totalCost).toBe(225.00);
    });

    it('should recalculate totalCost on update', async () => {
      const record = await BreedingRecord.create({
        farm: testFarm._id,
        femaleAnimal: femaleAnimal._id,
        breedingType: 'natural',
        breedingDate: new Date(),
        expectedBirthDate: new Date(),
        cost: {
          serviceFee: 100.00,
          medicationCost: 30.00,
          additionalCharges: 20.00,
          totalCost: 0,
        },
        createdBy: testUser._id,
      });

      expect(record.cost.totalCost).toBe(150.00);

      record.cost.medicationCost = 50.00;
      await record.save();

      expect(record.cost.totalCost).toBe(170.00);
    });

    it('should handle zero costs correctly', async () => {
      const record = await BreedingRecord.create({
        farm: testFarm._id,
        femaleAnimal: femaleAnimal._id,
        breedingType: 'natural',
        breedingDate: new Date(),
        expectedBirthDate: new Date(),
        createdBy: testUser._id,
      });

      expect(record.cost.totalCost).toBe(0);
    });
  });

  describe('Instance Methods', () => {
    describe('addOffspring', () => {
      it('should add offspring to the breeding record', async () => {
        const record = await BreedingRecord.create({
          farm: testFarm._id,
          femaleAnimal: femaleAnimal._id,
          maleAnimal: maleAnimal._id,
          breedingType: 'natural',
          breedingDate: new Date(),
          expectedBirthDate: new Date(),
          createdBy: testUser._id,
        });

        const offspring = {
          gender: 'female',
          weight: 35,
          healthStatus: 'healthy',
          notes: 'Born healthy',
        };

        await (record as any).addOffspring(offspring);

        const updatedRecord = await BreedingRecord.findById(record._id);
        expect(updatedRecord?.outcome.offspring).toHaveLength(1);
        expect(updatedRecord?.outcome.offspring?.[0]?.gender).toBe('female');
        expect(updatedRecord?.outcome.offspring?.[0]?.weight).toBe(35);
      });

      it('should add multiple offspring', async () => {
        const record = await BreedingRecord.create({
          farm: testFarm._id,
          femaleAnimal: femaleAnimal._id,
          maleAnimal: maleAnimal._id,
          breedingType: 'natural',
          breedingDate: new Date(),
          expectedBirthDate: new Date(),
          createdBy: testUser._id,
        });

        await (record as any).addOffspring({ gender: 'female', healthStatus: 'healthy' });
        await (record as any).addOffspring({ gender: 'male', healthStatus: 'healthy' });

        const updatedRecord = await BreedingRecord.findById(record._id);
        expect(updatedRecord?.outcome.offspring).toHaveLength(2);
      });

      it('should initialize offspring array if undefined', async () => {
        const record = await BreedingRecord.create({
          farm: testFarm._id,
          femaleAnimal: femaleAnimal._id,
          breedingType: 'artificial_insemination',
          breedingDate: new Date(),
          expectedBirthDate: new Date(),
          createdBy: testUser._id,
        });

        expect(record.outcome.offspring).toEqual([]);

        await (record as any).addOffspring({ gender: 'male', healthStatus: 'healthy' });

        const updatedRecord = await BreedingRecord.findById(record._id);
        expect(updatedRecord?.outcome.offspring).toBeDefined();
        expect(updatedRecord?.outcome.offspring).toHaveLength(1);
      });
    });

    describe('completeBreeding', () => {
      it('should update outcome and set actualBirthDate', async () => {
        const record = await BreedingRecord.create({
          farm: testFarm._id,
          femaleAnimal: femaleAnimal._id,
          maleAnimal: maleAnimal._id,
          breedingType: 'natural',
          breedingDate: new Date('2024-03-01'),
          expectedBirthDate: new Date('2024-12-01'),
          createdBy: testUser._id,
        });

        const actualBirthDate = new Date('2024-12-05');
        await (record as any).completeBreeding({
          status: 'successful',
          actualBirthDate,
        });

        const updatedRecord = await BreedingRecord.findById(record._id);
        expect(updatedRecord?.outcome.status).toBe('successful');
        expect(updatedRecord?.actualBirthDate).toEqual(actualBirthDate);
      });

      it('should use current date if actualBirthDate not provided', async () => {
        const record = await BreedingRecord.create({
          farm: testFarm._id,
          femaleAnimal: femaleAnimal._id,
          breedingType: 'artificial_insemination',
          breedingDate: new Date(),
          expectedBirthDate: new Date(),
          createdBy: testUser._id,
        });

        const beforeComplete = new Date();
        await (record as any).completeBreeding({ status: 'successful' });
        const afterComplete = new Date();

        const updatedRecord = await BreedingRecord.findById(record._id);
        expect(updatedRecord?.actualBirthDate).toBeDefined();
        expect(updatedRecord?.actualBirthDate!.getTime()).toBeGreaterThanOrEqual(beforeComplete.getTime());
        expect(updatedRecord?.actualBirthDate!.getTime()).toBeLessThanOrEqual(afterComplete.getTime());
      });

      it('should merge outcome data without losing existing fields', async () => {
        const record = await BreedingRecord.create({
          farm: testFarm._id,
          femaleAnimal: femaleAnimal._id,
          breedingType: 'natural',
          breedingDate: new Date(),
          expectedBirthDate: new Date(),
          outcome: {
            status: 'pending',
            complications: ['Difficulty in labor'],
          },
          createdBy: testUser._id,
        });

        await (record as any).completeBreeding({
          status: 'successful',
          actualBirthDate: new Date(),
        });

        const updatedRecord = await BreedingRecord.findById(record._id);
        expect(updatedRecord?.outcome.status).toBe('successful');
        expect(updatedRecord?.outcome.complications).toEqual(['Difficulty in labor']);
      });
    });
  });

  describe('Offspring Validation', () => {
    it('should validate offspring gender enum', async () => {
      const breedingData = {
        farm: testFarm._id,
        femaleAnimal: femaleAnimal._id,
        breedingType: 'natural',
        breedingDate: new Date(),
        expectedBirthDate: new Date(),
        outcome: {
          offspring: [{
            gender: 'invalid_gender',
            healthStatus: 'healthy',
          }],
        },
        createdBy: testUser._id,
      };

      await expect(BreedingRecord.create(breedingData as any)).rejects.toThrow();
    });

    it('should validate offspring healthStatus enum', async () => {
      const breedingData = {
        farm: testFarm._id,
        femaleAnimal: femaleAnimal._id,
        breedingType: 'natural',
        breedingDate: new Date(),
        expectedBirthDate: new Date(),
        outcome: {
          offspring: [{
            gender: 'female',
            healthStatus: 'invalid_status',
          }],
        },
        createdBy: testUser._id,
      };

      await expect(BreedingRecord.create(breedingData as any)).rejects.toThrow();
    });

    it('should validate offspring weight is non-negative', async () => {
      const breedingData = {
        farm: testFarm._id,
        femaleAnimal: femaleAnimal._id,
        breedingType: 'natural',
        breedingDate: new Date(),
        expectedBirthDate: new Date(),
        outcome: {
          offspring: [{
            gender: 'male',
            weight: -5,
            healthStatus: 'healthy',
          }],
        },
        createdBy: testUser._id,
      };

      await expect(BreedingRecord.create(breedingData as any)).rejects.toThrow();
    });
  });

  describe('Document Handling', () => {
    it('should store breeding documents', async () => {
      const breedingData = {
        farm: testFarm._id,
        femaleAnimal: femaleAnimal._id,
        breedingType: 'artificial_insemination',
        breedingDate: new Date(),
        expectedBirthDate: new Date(),
        documents: [{
          type: 'ai_record',
          name: 'AI Certificate',
          url: 'https://example.com/docs/ai-cert.pdf',
        }],
        createdBy: testUser._id,
      };

      const record = await BreedingRecord.create(breedingData);

      expect(record.documents).toHaveLength(1);
      expect(record.documents[0].type).toBe('ai_record');
      expect(record.documents[0].name).toBe('AI Certificate');
      expect(record.documents[0].uploadDate).toBeDefined();
    });

    it('should validate document type enum', async () => {
      const breedingData = {
        farm: testFarm._id,
        femaleAnimal: femaleAnimal._id,
        breedingType: 'natural',
        breedingDate: new Date(),
        expectedBirthDate: new Date(),
        documents: [{
          type: 'invalid_type',
          name: 'Document',
          url: 'https://example.com/doc.pdf',
        }],
        createdBy: testUser._id,
      };

      await expect(BreedingRecord.create(breedingData as any)).rejects.toThrow();
    });
  });

  describe('Veterinarian Information', () => {
    it('should store veterinarian details', async () => {
      const breedingData = {
        farm: testFarm._id,
        femaleAnimal: femaleAnimal._id,
        breedingType: 'artificial_insemination',
        breedingDate: new Date(),
        expectedBirthDate: new Date(),
        veterinarian: {
          name: 'Dr. Smith',
          clinic: 'Farm Vet Clinic',
          phone: '555-1234',
        },
        createdBy: testUser._id,
      };

      const record = await BreedingRecord.create(breedingData);

      expect(record.veterinarian).toBeDefined();
      expect(record.veterinarian!.name).toBe('Dr. Smith');
      expect(record.veterinarian!.clinic).toBe('Farm Vet Clinic');
      expect(record.veterinarian!.phone).toBe('555-1234');
    });

    it('should trim veterinarian fields', async () => {
      const breedingData = {
        farm: testFarm._id,
        femaleAnimal: femaleAnimal._id,
        breedingType: 'natural',
        breedingDate: new Date(),
        expectedBirthDate: new Date(),
        veterinarian: {
          name: '  Dr. Jones  ',
          clinic: '  Animal Clinic  ',
          phone: '  555-5678  ',
        },
        createdBy: testUser._id,
      };

      const record = await BreedingRecord.create(breedingData);

      expect(record.veterinarian!.name).toBe('Dr. Jones');
      expect(record.veterinarian!.clinic).toBe('Animal Clinic');
      expect(record.veterinarian!.phone).toBe('555-5678');
    });
  });

  describe('JSON Transformation', () => {
    it('should transform _id to id in JSON', () => {
      const record = new BreedingRecord({
        farm: testFarm._id,
        femaleAnimal: femaleAnimal._id,
        breedingType: 'natural',
        breedingDate: new Date(),
        expectedBirthDate: new Date(),
        createdBy: testUser._id,
      });

      const json = record.toJSON();

      expect(json.id).toBeDefined();
      expect(json._id).toBeUndefined();
      expect(json.__v).toBeUndefined();
    });
  });
});
