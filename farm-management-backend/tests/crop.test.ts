import mongoose from 'mongoose';
import { Crop, ICrop } from '../src/models/Crop';
import { Farm } from '../src/models/Farm';
import { User } from '../src/models/User';

describe('Crop Model', () => {
  let testFarm: any;
  let testUser: any;

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      firstName: 'Crop',
      lastName: 'Tester',
      email: 'crop@test.com',
      password: 'hashedpassword123',
      role: 'farmer',
    });

    // Create test farm
    testFarm = await Farm.create({
      name: 'Crop Test Farm',
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
  });

  describe('Virtual Properties', () => {
    describe('daysUntilHarvest', () => {
      it('should calculate days until harvest for future date', async () => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 30);

        const crop = await Crop.create({
          farmId: testFarm._id,
          name: 'Tomatoes',
          variety: 'Cherry',
          category: 'vegetables',
          fieldLocation: 'Field A',
          area: 2.5,
          plantingDate: new Date(),
          expectedHarvestDate: futureDate,
          stage: {
            current: 'germination',
            progress: 10,
            expectedDuration: 90
          },
          createdBy: testUser._id.toString(),
        });

        const cropWithVirtuals = crop.toJSON() as any;
        expect(cropWithVirtuals.daysUntilHarvest).toBeGreaterThan(29);
        expect(cropWithVirtuals.daysUntilHarvest).toBeLessThanOrEqual(31);
      });

      it('should return 0 when crop has been harvested', async () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 30);
        
        const actualHarvestDate = new Date();
        actualHarvestDate.setDate(actualHarvestDate.getDate() - 5);

        const crop = await Crop.create({
          farmId: testFarm._id,
          name: 'Wheat',
          variety: 'Spring Wheat',
          category: 'grains',
          fieldLocation: 'Field B',
          area: 10.0,
          plantingDate: pastDate,
          expectedHarvestDate: new Date(),
          actualHarvestDate: actualHarvestDate,
          stage: {
            current: 'harvest',
            progress: 100,
            expectedDuration: 120
          },
          createdBy: testUser._id.toString(),
        });

        const cropWithVirtuals = crop.toJSON() as any;
        expect(cropWithVirtuals.daysUntilHarvest).toBe(0);
      });

      it('should return negative value for overdue harvest', async () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 90);
        
        const expectedHarvest = new Date();
        expectedHarvest.setDate(expectedHarvest.getDate() - 10);

        const crop = await Crop.create({
          farmId: testFarm._id,
          name: 'Corn',
          variety: 'Sweet Corn',
          category: 'grains',
          fieldLocation: 'Field C',
          area: 5.0,
          plantingDate: pastDate,
          expectedHarvestDate: expectedHarvest,
          stage: {
            current: 'maturation',
            progress: 95,
            expectedDuration: 90
          },
          createdBy: testUser._id.toString(),
        });

        const cropWithVirtuals = crop.toJSON() as any;
        expect(cropWithVirtuals.daysUntilHarvest).toBeLessThan(0);
      });
    });

    describe('ageInDays', () => {
      it('should calculate age in days from planting date', async () => {
        const plantingDate = new Date();
        plantingDate.setDate(plantingDate.getDate() - 45);

        const crop = await Crop.create({
          farmId: testFarm._id,
          name: 'Lettuce',
          variety: 'Romaine',
          category: 'vegetables',
          fieldLocation: 'Greenhouse 1',
          area: 0.5,
          plantingDate: plantingDate,
          expectedHarvestDate: new Date(),
          stage: {
            current: 'vegetative',
            progress: 60,
            expectedDuration: 60
          },
          createdBy: testUser._id.toString(),
        });

        const cropWithVirtuals = crop.toJSON() as any;
        expect(cropWithVirtuals.ageInDays).toBeGreaterThanOrEqual(44);
        expect(cropWithVirtuals.ageInDays).toBeLessThanOrEqual(46);
      });

      it('should return 0 for crop planted today', async () => {
        const crop = await Crop.create({
          farmId: testFarm._id,
          name: 'Basil',
          variety: 'Sweet Basil',
          category: 'herbs',
          fieldLocation: 'Greenhouse 2',
          area: 0.3,
          plantingDate: new Date(),
          expectedHarvestDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          stage: {
            current: 'planting',
            progress: 5,
            expectedDuration: 60
          },
          createdBy: testUser._id.toString(),
        });

        const cropWithVirtuals = crop.toJSON() as any;
        expect(cropWithVirtuals.ageInDays).toBe(0);
      });

      it('should handle crops planted years ago', async () => {
        const plantingDate = new Date();
        plantingDate.setFullYear(plantingDate.getFullYear() - 1);

        const crop = await Crop.create({
          farmId: testFarm._id,
          name: 'Apple Tree',
          variety: 'Gala',
          category: 'fruits',
          fieldLocation: 'Orchard 1',
          area: 15.0,
          plantingDate: plantingDate,
          expectedHarvestDate: new Date(),
          stage: {
            current: 'maturation',
            progress: 80,
            expectedDuration: 365
          },
          createdBy: testUser._id.toString(),
        });

        const cropWithVirtuals = crop.toJSON() as any;
        expect(cropWithVirtuals.ageInDays).toBeGreaterThan(360);
      });
    });
  });

  describe('Validation', () => {
    it('should validate expectedHarvestDate is after plantingDate', async () => {
      const plantingDate = new Date('2024-06-01');
      const invalidHarvestDate = new Date('2024-05-01'); // Before planting

      const invalidCrop = {
        farmId: testFarm._id,
        name: 'Invalid Crop',
        variety: 'Test',
        category: 'vegetables',
        fieldLocation: 'Field X',
        area: 1.0,
        plantingDate: plantingDate,
        expectedHarvestDate: invalidHarvestDate,
        stage: {
          current: 'planting',
          progress: 0,
          expectedDuration: 90
        },
        createdBy: testUser._id.toString(),
      };

      await expect(Crop.create(invalidCrop)).rejects.toThrow();
    });

    it('should validate area is positive', async () => {
      const invalidCrop = {
        farmId: testFarm._id,
        name: 'Invalid Area Crop',
        variety: 'Test',
        category: 'vegetables',
        fieldLocation: 'Field Y',
        area: 0, // Invalid: must be > 0
        plantingDate: new Date('2024-01-01'),
        expectedHarvestDate: new Date('2024-04-01'),
        stage: {
          current: 'planting',
          progress: 0,
          expectedDuration: 90
        },
        createdBy: testUser._id.toString(),
      };

      await expect(Crop.create(invalidCrop)).rejects.toThrow();
    });

    it('should validate category enum values', async () => {
      const invalidCrop = {
        farmId: testFarm._id,
        name: 'Invalid Category Crop',
        variety: 'Test',
        category: 'invalid_category',
        fieldLocation: 'Field Z',
        area: 1.0,
        plantingDate: new Date('2024-01-01'),
        expectedHarvestDate: new Date('2024-04-01'),
        stage: {
          current: 'planting',
          progress: 0,
          expectedDuration: 90
        },
        createdBy: testUser._id.toString(),
      };

      await expect(Crop.create(invalidCrop as any)).rejects.toThrow();
    });

    it('should validate stage.current enum values', async () => {
      const invalidCrop = {
        farmId: testFarm._id,
        name: 'Invalid Stage Crop',
        variety: 'Test',
        category: 'vegetables',
        fieldLocation: 'Field A',
        area: 1.0,
        plantingDate: new Date('2024-01-01'),
        expectedHarvestDate: new Date('2024-04-01'),
        stage: {
          current: 'invalid_stage',
          progress: 0,
          expectedDuration: 90
        },
        createdBy: testUser._id.toString(),
      };

      await expect(Crop.create(invalidCrop as any)).rejects.toThrow();
    });

    it('should validate stage.progress is between 0 and 100', async () => {
      const invalidCrop = {
        farmId: testFarm._id,
        name: 'Invalid Progress Crop',
        variety: 'Test',
        category: 'vegetables',
        fieldLocation: 'Field A',
        area: 1.0,
        plantingDate: new Date('2024-01-01'),
        expectedHarvestDate: new Date('2024-04-01'),
        stage: {
          current: 'planting',
          progress: 150, // Invalid: max is 100
          expectedDuration: 90
        },
        createdBy: testUser._id.toString(),
      };

      await expect(Crop.create(invalidCrop)).rejects.toThrow();
    });
  });

  describe('Default Values', () => {
    it('should set default stage.current to planning', async () => {
      const crop = await Crop.create({
        farmId: testFarm._id,
        name: 'Default Stage Crop',
        variety: 'Test',
        category: 'vegetables',
        fieldLocation: 'Field A',
        area: 1.0,
        plantingDate: new Date('2024-01-01'),
        expectedHarvestDate: new Date('2024-04-01'),
        createdBy: testUser._id.toString(),
      });

      expect(crop.stage.current).toBe('planning');
    });

    it('should set default stage.progress to 0', async () => {
      const crop = await Crop.create({
        farmId: testFarm._id,
        name: 'Default Progress Crop',
        variety: 'Test',
        category: 'vegetables',
        fieldLocation: 'Field A',
        area: 1.0,
        plantingDate: new Date('2024-01-01'),
        expectedHarvestDate: new Date('2024-04-01'),
        createdBy: testUser._id.toString(),
      });

      expect(crop.stage.progress).toBe(0);
    });

    it('should set default stage.expectedDuration to 90', async () => {
      const crop = await Crop.create({
        farmId: testFarm._id,
        name: 'Default Duration Crop',
        variety: 'Test',
        category: 'vegetables',
        fieldLocation: 'Field A',
        area: 1.0,
        plantingDate: new Date('2024-01-01'),
        expectedHarvestDate: new Date('2024-04-01'),
        createdBy: testUser._id.toString(),
      });

      expect(crop.stage.expectedDuration).toBe(90);
    });

    it('should set default healthStatus.overall to good', async () => {
      const crop = await Crop.create({
        farmId: testFarm._id,
        name: 'Default Health Crop',
        variety: 'Test',
        category: 'vegetables',
        fieldLocation: 'Field A',
        area: 1.0,
        plantingDate: new Date('2024-01-01'),
        expectedHarvestDate: new Date('2024-04-01'),
        stage: {
          current: 'planting',
          progress: 0,
          expectedDuration: 90
        },
        createdBy: testUser._id.toString(),
      });

      expect(crop.healthStatus.overall).toBe('good');
    });

    it('should set default healthStatus.plantVigor to 100', async () => {
      const crop = await Crop.create({
        farmId: testFarm._id,
        name: 'Default Vigor Crop',
        variety: 'Test',
        category: 'vegetables',
        fieldLocation: 'Field A',
        area: 1.0,
        plantingDate: new Date('2024-01-01'),
        expectedHarvestDate: new Date('2024-04-01'),
        stage: {
          current: 'planting',
          progress: 0,
          expectedDuration: 90
        },
        createdBy: testUser._id.toString(),
      });

      expect(crop.healthStatus.plantVigor).toBe(100);
    });

    it('should set default empty arrays for health tracking', async () => {
      const crop = await Crop.create({
        farmId: testFarm._id,
        name: 'Default Arrays Crop',
        variety: 'Test',
        category: 'vegetables',
        fieldLocation: 'Field A',
        area: 1.0,
        plantingDate: new Date('2024-01-01'),
        expectedHarvestDate: new Date('2024-04-01'),
        stage: {
          current: 'planting',
          progress: 0,
          expectedDuration: 90
        },
        createdBy: testUser._id.toString(),
      });

      expect(crop.healthStatus.diseasePresence).toEqual([]);
      expect(crop.healthStatus.pestPresence).toEqual([]);
      expect(crop.healthStatus.nutritionalDeficiency).toEqual([]);
      expect(crop.healthStatus.stressFactors).toEqual([]);
      expect(crop.healthStatus.treatmentHistory).toEqual([]);
    });

    it('should set timestamps automatically', async () => {
      const crop = await Crop.create({
        farmId: testFarm._id,
        name: 'Timestamp Crop',
        variety: 'Test',
        category: 'vegetables',
        fieldLocation: 'Field A',
        area: 1.0,
        plantingDate: new Date('2024-01-01'),
        expectedHarvestDate: new Date('2024-04-01'),
        stage: {
          current: 'planting',
          progress: 0,
          expectedDuration: 90
        },
        createdBy: testUser._id.toString(),
      });

      expect(crop.createdAt).toBeDefined();
      expect(crop.updatedAt).toBeDefined();
      expect(crop.createdAt).toBeInstanceOf(Date);
      expect(crop.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('toJSON and toObject virtuals', () => {
    it('should include virtual properties in JSON output', async () => {
      const crop = await Crop.create({
        farmId: testFarm._id,
        name: 'JSON Test Crop',
        variety: 'Test',
        category: 'vegetables',
        fieldLocation: 'Field A',
        area: 1.0,
        plantingDate: new Date(),
        expectedHarvestDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stage: {
          current: 'germination',
          progress: 15,
          expectedDuration: 90
        },
        createdBy: testUser._id.toString(),
      });

      const json = crop.toJSON() as any;
      
      expect(json).toHaveProperty('daysUntilHarvest');
      expect(json).toHaveProperty('ageInDays');
      expect(typeof json.daysUntilHarvest).toBe('number');
      expect(typeof json.ageInDays).toBe('number');
    });

    it('should include virtual properties in object output', async () => {
      const crop = await Crop.create({
        farmId: testFarm._id,
        name: 'Object Test Crop',
        variety: 'Test',
        category: 'fruits',
        fieldLocation: 'Orchard',
        area: 5.0,
        plantingDate: new Date(),
        expectedHarvestDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        stage: {
          current: 'planting',
          progress: 5,
          expectedDuration: 120
        },
        createdBy: testUser._id.toString(),
      });

      const obj = crop.toObject() as any;
      
      expect(obj).toHaveProperty('daysUntilHarvest');
      expect(obj).toHaveProperty('ageInDays');
    });
  });
});
