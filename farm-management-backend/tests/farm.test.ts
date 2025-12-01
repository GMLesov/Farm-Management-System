import mongoose from 'mongoose';
import { Farm, IFarm } from '../src/models/Farm';
import { User } from '../src/models/User';
import { Crop } from '../src/models/Crop';

describe('Farm Model', () => {
  let ownerUser: any;
  let managerUser: any;

  beforeEach(async () => {
    ownerUser = await User.create({
      email: 'owner@example.com',
      firstName: 'Farm',
      lastName: 'Owner',
      role: 'admin',
    });

    managerUser = await User.create({
      email: 'manager@example.com',
      firstName: 'Farm',
      lastName: 'Manager',
      role: 'farmer',
    });
  });

  describe('Schema Validation', () => {
    it('should create a farm with required fields', async () => {
      const farmData = {
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
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
        owner: ownerUser._id,
        managers: [ownerUser._id],
      };

      const farm = await Farm.create(farmData);

      expect(farm).toBeDefined();
      expect(farm.name).toBe('Test Farm');
      expect(farm.location.city).toBe('Farm City');
      expect(farm.size).toBe(100);
      expect(farm.soilType).toBe('loamy');
      expect(farm.climateZone).toBe('temperate');
      expect(farm.owner.toString()).toBe(ownerUser._id.toString());
    });

    it('should validate required name field', async () => {
      const farmData = {
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
      };

      await expect(Farm.create(farmData)).rejects.toThrow();
    });

    it('should validate required location fields', async () => {
      const farmData = {
        name: 'Test Farm',
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
      };

      await expect(Farm.create(farmData)).rejects.toThrow();
    });

    it('should validate required owner field', async () => {
      const farmData = {
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
      };

      await expect(Farm.create(farmData)).rejects.toThrow();
    });

    it('should validate size is non-negative', async () => {
      const farmData = {
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: -10,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
      };

      await expect(Farm.create(farmData)).rejects.toThrow();
    });

    it('should validate subscription plan enum', async () => {
      const farmData = {
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
        subscription: {
          plan: 'invalid_plan',
        },
      };

      await expect(Farm.create(farmData as any)).rejects.toThrow();
    });

    it('should validate equipment status enum', async () => {
      const farmData = {
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
        equipment: [{
          name: 'Tractor',
          type: 'Vehicle',
          status: 'invalid_status',
        }],
      };

      await expect(Farm.create(farmData as any)).rejects.toThrow();
    });

    it('should trim farm name', async () => {
      const farmData = {
        name: '  Test Farm  ',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
      };

      const farm = await Farm.create(farmData);

      expect(farm.name).toBe('Test Farm');
    });
  });

  describe('Default Values', () => {
    it('should set default subscription plan to free', async () => {
      const farmData = {
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
      };

      const farm = await Farm.create(farmData);

      expect(farm.subscription.plan).toBe('free');
    });

    it('should set default subscription maxCrops to 5', async () => {
      const farmData = {
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
      };

      const farm = await Farm.create(farmData);

      expect(farm.subscription.maxCrops).toBe(5);
    });

    it('should set default subscription maxUsers to 1', async () => {
      const farmData = {
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
      };

      const farm = await Farm.create(farmData);

      expect(farm.subscription.maxUsers).toBe(1);
    });

    it('should set default weatherAlerts to true', async () => {
      const farmData = {
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
      };

      const farm = await Farm.create(farmData);

      expect(farm.settings.weatherAlerts).toBe(true);
    });

    it('should set default autoIrrigation to false', async () => {
      const farmData = {
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
      };

      const farm = await Farm.create(farmData);

      expect(farm.settings.autoIrrigation).toBe(false);
    });

    it('should set default pestMonitoring to true', async () => {
      const farmData = {
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
      };

      const farm = await Farm.create(farmData);

      expect(farm.settings.pestMonitoring).toBe(true);
    });

    it('should set default financialTracking to true', async () => {
      const farmData = {
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
      };

      const farm = await Farm.create(farmData);

      expect(farm.settings.financialTracking).toBe(true);
    });

    it('should set default isActive to true', async () => {
      const farmData = {
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
      };

      const farm = await Farm.create(farmData);

      expect(farm.isActive).toBe(true);
    });

    it('should set default equipment status to active', async () => {
      const farmData = {
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
        equipment: [{
          name: 'Tractor',
          type: 'Vehicle',
        }],
      };

      const farm = await Farm.create(farmData);

      expect(farm.equipment[0]?.status).toBe('active');
    });

    it('should initialize empty arrays for crops, irrigationSystems, equipment, managers', async () => {
      const farmData = {
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
      };

      const farm = await Farm.create(farmData);

      expect(farm.crops).toEqual([]);
      expect(farm.irrigationSystems).toEqual([]);
      expect(farm.equipment).toEqual([]);
      expect(farm.managers).toEqual([]);
    });

    it('should set timestamps automatically', async () => {
      const farmData = {
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
      };

      const farm = await Farm.create(farmData);

      expect(farm.createdAt).toBeDefined();
      expect(farm.updatedAt).toBeDefined();
      expect(farm.createdAt).toBeInstanceOf(Date);
      expect(farm.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Instance Methods', () => {
    let testFarm: any;
    let testCrop: any;

    beforeEach(async () => {
      testFarm = await Farm.create({
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
        managers: [ownerUser._id],
      });

      testCrop = await Crop.create({
        name: 'Test Crop',
        variety: 'Test Variety',
        plantingDate: new Date(),
        expectedHarvestDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        area: 10,
        farm: testFarm._id,
        createdBy: ownerUser._id,
        farmId: testFarm._id,
        category: 'vegetables',
        fieldLocation: 'Field A',
      });
    });

    describe('addManager', () => {
      it('should add a manager to the managers array', async () => {
        await (testFarm as any).addManager(managerUser._id);

        const updatedFarm = await Farm.findById(testFarm._id);
        expect(updatedFarm?.managers).toHaveLength(2);
        expect(updatedFarm?.managers.map((m: any) => m.toString())).toContain(managerUser._id.toString());
      });

      it('should not add duplicate managers', async () => {
        await (testFarm as any).addManager(managerUser._id);
        await (testFarm as any).addManager(managerUser._id);

        const updatedFarm = await Farm.findById(testFarm._id);
        expect(updatedFarm?.managers).toHaveLength(2);
      });
    });

    describe('removeManager', () => {
      it('should remove a manager from the managers array', async () => {
        await (testFarm as any).addManager(managerUser._id);
        
        const farmWithManager = await Farm.findById(testFarm._id);
        expect(farmWithManager?.managers).toHaveLength(2);

        await (farmWithManager as any).removeManager(managerUser._id);

        const updatedFarm = await Farm.findById(testFarm._id);
        expect(updatedFarm?.managers).toHaveLength(1);
        expect(updatedFarm?.managers.map((m: any) => m.toString())).not.toContain(managerUser._id.toString());
      });
    });

    describe('addCrop', () => {
      it('should add a crop to the crops array', async () => {
        await (testFarm as any).addCrop(testCrop._id);

        const updatedFarm = await Farm.findById(testFarm._id);
        expect(updatedFarm?.crops).toHaveLength(1);
        expect(updatedFarm?.crops[0]?.toString()).toBe(testCrop._id.toString());
      });

      it('should not add duplicate crops', async () => {
        await (testFarm as any).addCrop(testCrop._id);
        await (testFarm as any).addCrop(testCrop._id);

        const updatedFarm = await Farm.findById(testFarm._id);
        expect(updatedFarm?.crops).toHaveLength(1);
      });
    });

    describe('removeCrop', () => {
      it('should remove a crop from the crops array', async () => {
        await (testFarm as any).addCrop(testCrop._id);
        
        const farmWithCrop = await Farm.findById(testFarm._id);
        expect(farmWithCrop?.crops).toHaveLength(1);

        await (farmWithCrop as any).removeCrop(testCrop._id);

        const updatedFarm = await Farm.findById(testFarm._id);
        expect(updatedFarm?.crops).toHaveLength(0);
      });
    });
  });

  describe('JSON Transformation', () => {
    it('should transform _id to id in JSON', async () => {
      const farm = await Farm.create({
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
      });

      const json = farm.toJSON();

      expect(json.id).toBeDefined();
      expect((json as any)._id).toBeUndefined();
      expect((json as any).__v).toBeUndefined();
    });
  });

  describe('Equipment Management', () => {
    it('should store equipment with all details', async () => {
      const purchaseDate = new Date('2020-01-01');
      const lastMaintenance = new Date('2024-01-01');
      const nextMaintenance = new Date('2024-06-01');

      const farm = await Farm.create({
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
        equipment: [{
          name: 'John Deere Tractor',
          type: 'Vehicle',
          model: 'JD 5075E',
          purchaseDate,
          status: 'active',
          lastMaintenance,
          nextMaintenance,
        }],
      });

      expect(farm.equipment).toHaveLength(1);
      expect(farm.equipment[0]?.name).toBe('John Deere Tractor');
      expect(farm.equipment[0]?.type).toBe('Vehicle');
      expect(farm.equipment[0]?.model).toBe('JD 5075E');
      expect(farm.equipment[0]?.status).toBe('active');
      expect(farm.equipment[0]?.purchaseDate).toEqual(purchaseDate);
      expect(farm.equipment[0]?.lastMaintenance).toEqual(lastMaintenance);
      expect(farm.equipment[0]?.nextMaintenance).toEqual(nextMaintenance);
    });

    it('should allow multiple equipment items', async () => {
      const farm = await Farm.create({
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
        equipment: [
          {
            name: 'Tractor',
            type: 'Vehicle',
            status: 'active',
          },
          {
            name: 'Plow',
            type: 'Implement',
            status: 'maintenance',
          },
        ],
      });

      expect(farm.equipment).toHaveLength(2);
      expect(farm.equipment[0]?.name).toBe('Tractor');
      expect(farm.equipment[1]?.name).toBe('Plow');
    });
  });

  describe('Subscription Management', () => {
    it('should allow custom subscription features', async () => {
      const farm = await Farm.create({
        name: 'Test Farm',
        location: {
          address: '123 Farm Road',
          city: 'Farm City',
          state: 'Test State',
          country: 'Test Country',
          latitude: 40.7128,
          longitude: -74.0060
        },
        size: 100,
        soilType: 'loamy',
        climateZone: 'temperate',
        owner: ownerUser._id,
        subscription: {
          plan: 'premium',
          features: ['weather-alerts', 'auto-irrigation', 'advanced-analytics'],
          maxCrops: 50,
          maxUsers: 10,
        },
      });

      expect(farm.subscription.plan).toBe('premium');
      expect(farm.subscription.features).toHaveLength(3);
      expect(farm.subscription.features).toContain('weather-alerts');
      expect(farm.subscription.maxCrops).toBe(50);
      expect(farm.subscription.maxUsers).toBe(10);
    });
  });
});
