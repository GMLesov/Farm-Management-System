import mongoose from 'mongoose';
import { Animal, IAnimal } from '../src/models/Animal';
import { Farm } from '../src/models/Farm';
import { User } from '../src/models/User';

describe('Animal Model', () => {
  let testFarm: any;
  let testUser: any;

  beforeEach(async () => {
    testUser = await User.create({
      firstName: 'Animal',
      lastName: 'Tester',
      email: 'animal@test.com',
      password: 'hashedpassword123',
      role: 'farmer',
    });

    testFarm = await Farm.create({
      name: 'Animal Test Farm',
      location: {
        address: '789 Ranch Road',
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
    describe('age calculation', () => {
      it('should calculate age in days for young animals', async () => {
        const birthDate = new Date();
        birthDate.setDate(birthDate.getDate() - 15);

        const animal = await Animal.create({
          farm: testFarm._id,
          owner: testUser._id,
          identificationNumber: 'AGE001',
          species: 'cattle',
          breed: 'Holstein',
          gender: 'female',
          dateOfBirth: birthDate,
          feedingSchedule: { feedType: 'milk', quantity: 5, frequency: 3 },
        });

        const animalObj = animal.toObject({ virtuals: true }) as any;
        expect(animalObj.age).toContain('days');
      });

      it('should calculate age in months for animals under a year', async () => {
        const birthDate = new Date();
        birthDate.setDate(birthDate.getDate() - 120);

        const animal = await Animal.create({
          farm: testFarm._id,
          owner: testUser._id,
          identificationNumber: 'AGE002',
          species: 'sheep',
          breed: 'Merino',
          gender: 'male',
          dateOfBirth: birthDate,
          feedingSchedule: { feedType: 'grass', quantity: 3, frequency: 2 },
        });

        const animalObj = animal.toObject({ virtuals: true }) as any;
        expect(animalObj.age).toContain('month');
      });

      it('should calculate age in years and months for older animals', async () => {
        const birthDate = new Date();
        birthDate.setFullYear(birthDate.getFullYear() - 2);
        birthDate.setMonth(birthDate.getMonth() - 3);

        const animal = await Animal.create({
          farm: testFarm._id,
          owner: testUser._id,
          identificationNumber: 'AGE003',
          species: 'horse',
          breed: 'Arabian',
          gender: 'male',
          dateOfBirth: birthDate,
          feedingSchedule: { feedType: 'hay', quantity: 10, frequency: 2 },
        });

        const animalObj = animal.toObject({ virtuals: true }) as any;
        expect(animalObj.age).toContain('year');
      });

      it('should return null for animals without dateOfBirth', async () => {
        const animal = await Animal.create({
          farm: testFarm._id,
          owner: testUser._id,
          identificationNumber: 'AGE004',
          species: 'pig',
          breed: 'Yorkshire',
          gender: 'female',
          feedingSchedule: { feedType: 'grain', quantity: 4, frequency: 2 },
        });

        const animalObj = animal.toObject({ virtuals: true }) as any;
        expect(animalObj.age).toBeNull();
      });
    });
  });

  describe('Instance Methods', () => {
    describe('addHealthRecord', () => {
      it('should add a health record to the animal', async () => {
        const animal = await Animal.create({
          farm: testFarm._id,
          owner: testUser._id,
          identificationNumber: 'HEALTH001',
          species: 'cattle',
          breed: 'Angus',
          gender: 'female',
          feedingSchedule: { feedType: 'hay', quantity: 8, frequency: 2 },
        });

        await (animal as any).addHealthRecord({
          date: new Date(),
          type: 'vaccination',
          description: 'Annual vaccination',
        });

        const updated = await Animal.findById(animal._id);
        expect(updated?.healthRecords).toHaveLength(1);
        expect(updated?.healthRecords[0].type).toBe('vaccination');
      });
    });

    describe('addBreedingRecord', () => {
      it('should add a breeding record to the animal', async () => {
        const animal = await Animal.create({
          farm: testFarm._id,
          owner: testUser._id,
          identificationNumber: 'BREED001',
          species: 'sheep',
          breed: 'Suffolk',
          gender: 'female',
          feedingSchedule: { feedType: 'grass', quantity: 3, frequency: 2 },
        });

        await (animal as any).addBreedingRecord({
          date: new Date(),
          type: 'mating',
          expectedDueDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000),
        });

        const updated = await Animal.findById(animal._id);
        expect(updated?.breedingRecords).toHaveLength(1);
        expect(updated?.breedingRecords[0].type).toBe('mating');
      });
    });

    describe('addProductionRecord', () => {
      it('should add a production record to the animal', async () => {
        const animal = await Animal.create({
          farm: testFarm._id,
          owner: testUser._id,
          identificationNumber: 'PROD001',
          species: 'chicken',
          breed: 'Leghorn',
          gender: 'female',
          feedingSchedule: { feedType: 'grain', quantity: 0.5, frequency: 2 },
        });

        await (animal as any).addProductionRecord({
          date: new Date(),
          type: 'eggs',
          quantity: 12,
          unit: 'pieces',
        });

        const updated = await Animal.findById(animal._id);
        expect(updated?.productionRecords).toHaveLength(1);
        expect(updated?.productionRecords[0].type).toBe('eggs');
        expect(updated?.productionRecords[0].quantity).toBe(12);
      });
    });

    describe('updateLocation', () => {
      it('should update animal location', async () => {
        const animal = await Animal.create({
          farm: testFarm._id,
          owner: testUser._id,
          identificationNumber: 'LOC001',
          species: 'cattle',
          breed: 'Holstein',
          gender: 'female',
          location: { 
            pasture: 'North Pasture', 
            barn: 'Barn A',
            coordinates: { latitude: 40.7128, longitude: -74.0060 }
          },
          feedingSchedule: { feedType: 'hay', quantity: 8, frequency: 2 },
        });

        await (animal as any).updateLocation({ 
          pasture: 'South Pasture', 
          pen: 'Pen 5',
          coordinates: { latitude: 40.7128, longitude: -74.0060 }
        });

        const updated = await Animal.findById(animal._id);
        expect(updated?.location.pasture).toBe('South Pasture');
        expect(updated?.location.pen).toBe('Pen 5');
        expect(updated?.location.barn).toBe('Barn A');
      });
    });

    describe('markAsSold', () => {
      it('should mark animal as sold and set sale info', async () => {
        const animal = await Animal.create({
          farm: testFarm._id,
          owner: testUser._id,
          identificationNumber: 'SALE001',
          species: 'pig',
          breed: 'Berkshire',
          gender: 'male',
          feedingSchedule: { feedType: 'grain', quantity: 5, frequency: 2 },
        });

        await (animal as any).markAsSold({
          saleDate: new Date(),
          salePrice: 500,
          buyer: 'Local Buyer',
        });

        const updated = await Animal.findById(animal._id);
        expect(updated?.status).toBe('sold');
        expect(updated?.isActive).toBe(false);
        expect(updated?.saleInfo?.salePrice).toBe(500);
      });
    });

    describe('markAsDeceased', () => {
      it('should mark animal as deceased with reason', async () => {
        const animal = await Animal.create({
          farm: testFarm._id,
          owner: testUser._id,
          identificationNumber: 'DEC001',
          species: 'sheep',
          breed: 'Merino',
          gender: 'female',
          feedingSchedule: { feedType: 'grass', quantity: 3, frequency: 2 },
        });

        const deceasedDate = new Date();
        await (animal as any).markAsDeceased(deceasedDate, 'Natural causes');

        const updated = await Animal.findById(animal._id);
        expect(updated?.status).toBe('deceased');
        expect(updated?.isActive).toBe(false);
        expect(updated?.notes).toContain('Natural causes');
      });

      it('should mark animal as deceased without reason', async () => {
        const animal = await Animal.create({
          farm: testFarm._id,
          owner: testUser._id,
          identificationNumber: 'DEC002',
          species: 'goat',
          breed: 'Boer',
          gender: 'male',
          feedingSchedule: { feedType: 'hay', quantity: 4, frequency: 2 },
        });

        await (animal as any).markAsDeceased(new Date());

        const updated = await Animal.findById(animal._id);
        expect(updated?.status).toBe('deceased');
        expect(updated?.isActive).toBe(false);
      });
    });
  });

  describe('Default Values', () => {
    it('should set default status to active', async () => {
      const animal = await Animal.create({
        farm: testFarm._id,
        owner: testUser._id,
        identificationNumber: 'DEF001',
        species: 'cattle',
        breed: 'Angus',
        gender: 'male',
        feedingSchedule: { feedType: 'hay', quantity: 8, frequency: 2 },
      });

      expect(animal.status).toBe('active');
    });

    it('should set default isActive to true', async () => {
      const animal = await Animal.create({
        farm: testFarm._id,
        owner: testUser._id,
        identificationNumber: 'DEF002',
        species: 'sheep',
        breed: 'Suffolk',
        gender: 'female',
        feedingSchedule: { feedType: 'grass', quantity: 3, frequency: 2 },
      });

      expect(animal.isActive).toBe(true);
    });
  });

  describe('JSON Transformation', () => {
    it('should transform _id to id in JSON output', () => {
      const animal = new Animal({
        farm: testFarm._id,
        owner: testUser._id,
        identificationNumber: 'JSON001',
        species: 'cattle',
        breed: 'Holstein',
        gender: 'female',
        feedingSchedule: { feedType: 'hay', quantity: 8, frequency: 2 },
      });

      const json = animal.toJSON();

      expect(json.id).toBeDefined();
      expect((json as any)._id).toBeUndefined();
      expect((json as any).__v).toBeUndefined();
    });
  });
});
