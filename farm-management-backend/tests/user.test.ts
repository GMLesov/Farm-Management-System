import mongoose from 'mongoose';
import { User, IUser } from '../src/models/User';
import { Farm } from '../src/models/Farm';

describe('User Model', () => {
  describe('Virtual Properties', () => {
    describe('fullName', () => {
      it('should combine firstName and lastName', async () => {
        const user = await User.create({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'hashedPassword123',
          role: 'farmer',
        });

        const userObj = user.toObject({ virtuals: true }) as any;
        expect(userObj.fullName).toBe('John Doe');
      });
    });
  });

  describe('Instance Methods', () => {
    describe('addFarm', () => {
      it('should add a farm to the user farms array', async () => {
        const user = await User.create({
          firstName: 'Farm',
          lastName: 'Manager',
          email: 'farm.manager@example.com',
          password: 'hashedPassword123',
          role: 'farmer',
        });

        const farm = await Farm.create({
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
          owner: user._id,
          managers: [user._id],
        });

        await (user as any).addFarm(farm._id);

        const updated = await User.findById(user._id);
        expect(updated?.farms).toHaveLength(1);
        const farmId = updated!.farms[0]!;
        expect(farmId.toString()).toBe((farm._id as mongoose.Types.ObjectId).toString());
      });

      it('should set currentFarm if not already set', async () => {
        const user = await User.create({
          firstName: 'Farm',
          lastName: 'Owner',
          email: 'farm.owner@example.com',
          password: 'hashedPassword123',
          role: 'farmer',
        });

        const farm = await Farm.create({
          name: 'First Farm',
          location: {
            address: '123 First Road',
            city: 'First City',
            state: 'Test State',
            country: 'Test Country',
            zipCode: '12345',
            latitude: 40.7128,
            longitude: -74.0060
          },
          size: 150,
          soilType: 'sandy',
          climateZone: 'tropical',
          owner: user._id,
          managers: [user._id],
        });

        await (user as any).addFarm(farm._id);

        const updated = await User.findById(user._id);
        expect(updated?.currentFarm?.toString()).toBe((farm._id as mongoose.Types.ObjectId).toString());
      });

      it('should not add duplicate farms', async () => {
        const user = await User.create({
          firstName: 'Duplicate',
          lastName: 'Tester',
          email: 'duplicate.tester@example.com',
          password: 'hashedPassword123',
          role: 'farmer',
        });

        const farm = await Farm.create({
          name: 'Duplicate Test Farm',
          location: {
            address: '456 Duplicate Road',
            city: 'Duplicate City',
            state: 'Test State',
            country: 'Test Country',
            zipCode: '12345',
            latitude: 40.7128,
            longitude: -74.0060
          },
          size: 200,
          soilType: 'clay',
          climateZone: 'arid',
          owner: user._id,
          managers: [user._id],
        });

        await (user as any).addFarm(farm._id);
        await (user as any).addFarm(farm._id);

        const updated = await User.findById(user._id);
        expect(updated?.farms).toHaveLength(1);
      });
    });

    describe('removeFarm', () => {
      it('should remove a farm from the user farms array', async () => {
        const user = await User.create({
          firstName: 'Remove',
          lastName: 'Tester',
          email: 'remove.tester@example.com',
          password: 'hashedPassword123',
          role: 'farmer',
        });

        const farm1 = await Farm.create({
          name: 'Farm 1',
          location: {
            address: '111 First Road',
            city: 'First City',
            state: 'Test State',
            country: 'Test Country',
            zipCode: '12345',
            latitude: 40.7128,
            longitude: -74.0060
          },
          size: 100,
          soilType: 'loamy',
          climateZone: 'temperate',
          owner: user._id,
          managers: [user._id],
        });

        const farm2 = await Farm.create({
          name: 'Farm 2',
          location: {
            address: '222 Second Road',
            city: 'Second City',
            state: 'Test State',
            country: 'Test Country',
            zipCode: '54321',
            latitude: 41.8781,
            longitude: -87.6298
          },
          size: 150,
          soilType: 'sandy',
          climateZone: 'tropical',
          owner: user._id,
          managers: [user._id],
        });

        await (user as any).addFarm(farm1._id);
        await (user as any).addFarm(farm2._id);

        await (user as any).removeFarm(farm1._id);

        const updated = await User.findById(user._id);
        expect(updated?.farms).toHaveLength(1);
        const farmId = updated!.farms[0]!;
        expect(farmId.toString()).toBe((farm2._id as mongoose.Types.ObjectId).toString());
      });

      it('should update currentFarm if removed farm was current', async () => {
        const user = await User.create({
          firstName: 'Current',
          lastName: 'Switcher',
          email: 'current.switcher@example.com',
          password: 'hashedPassword123',
          role: 'farmer',
        });

        const farm1 = await Farm.create({
          name: 'Current Farm',
          location: {
            address: '333 Current Road',
            city: 'Current City',
            state: 'Test State',
            country: 'Test Country',
            zipCode: '12345',
            latitude: 40.7128,
            longitude: -74.0060
          },
          size: 120,
          soilType: 'loamy',
          climateZone: 'temperate',
          owner: user._id,
          managers: [user._id],
        });

        const farm2 = await Farm.create({
          name: 'Next Farm',
          location: {
            address: '444 Next Road',
            city: 'Next City',
            state: 'Test State',
            country: 'Test Country',
            zipCode: '54321',
            latitude: 41.8781,
            longitude: -87.6298
          },
          size: 180,
          soilType: 'clay',
          climateZone: 'arid',
          owner: user._id,
          managers: [user._id],
        });

        await (user as any).addFarm(farm1._id);
        await (user as any).addFarm(farm2._id);

        await (user as any).removeFarm(farm1._id);

        const updated = await User.findById(user._id);
        expect(updated?.currentFarm?.toString()).toBe((farm2._id as mongoose.Types.ObjectId).toString());
      });
    });

    describe('switchCurrentFarm', () => {
      it('should switch the current farm', async () => {
        const user = await User.create({
          firstName: 'Switch',
          lastName: 'User',
          email: 'switch.user@example.com',
          password: 'hashedPassword123',
          role: 'farmer',
        });

        const farm1 = await Farm.create({
          name: 'Farm A',
          location: {
            address: '555 A Road',
            city: 'A City',
            state: 'Test State',
            country: 'Test Country',
            zipCode: '12345',
            latitude: 40.7128,
            longitude: -74.0060
          },
          size: 100,
          soilType: 'loamy',
          climateZone: 'temperate',
          owner: user._id,
          managers: [user._id],
        });

        const farm2 = await Farm.create({
          name: 'Farm B',
          location: {
            address: '666 B Road',
            city: 'B City',
            state: 'Test State',
            country: 'Test Country',
            zipCode: '54321',
            latitude: 41.8781,
            longitude: -87.6298
          },
          size: 150,
          soilType: 'sandy',
          climateZone: 'tropical',
          owner: user._id,
          managers: [user._id],
        });

        await (user as any).addFarm(farm1._id);
        await (user as any).addFarm(farm2._id);

        await (user as any).switchCurrentFarm(farm2._id);

        const updated = await User.findById(user._id);
        expect(updated?.currentFarm?.toString()).toBe((farm2._id as mongoose.Types.ObjectId).toString());
      });

      it('should throw error if farm not in user farms', async () => {
        const user = await User.create({
          firstName: 'Error',
          lastName: 'User',
          email: 'error.user@example.com',
          password: 'hashedPassword123',
          role: 'farmer',
        });

        const farm = await Farm.create({
          name: 'Unassociated Farm',
          location: {
            address: '777 Unknown Road',
            city: 'Unknown City',
            state: 'Test State',
            country: 'Test Country',
            zipCode: '99999',
            latitude: 40.7128,
            longitude: -74.0060
          },
          size: 100,
          soilType: 'loamy',
          climateZone: 'temperate',
          owner: user._id,
          managers: [user._id],
        });

        expect(() => (user as any).switchCurrentFarm(farm._id)).toThrow('User is not associated with this farm');
      });
    });
  });

  describe('Default Values', () => {
    it('should set default role to farmer', async () => {
      const user = await User.create({
        firstName: 'Default',
        lastName: 'Role',
        email: 'default.role@example.com',
        password: 'hashedPassword123',
      });

      expect(user.role).toBe('farmer');
    });

    it('should set default isVerified to false', async () => {
      const user = await User.create({
        firstName: 'Not',
        lastName: 'Verified',
        email: 'not.verified@example.com',
        password: 'hashedPassword123',
        role: 'farmer',
      });

      expect(user.isVerified).toBe(false);
    });

    it('should set default preference language to en', async () => {
      const user = await User.create({
        firstName: 'Default',
        lastName: 'Pref',
        email: 'default.pref@example.com',
        password: 'hashedPassword123',
        role: 'farmer',
      });

      expect(user.preferences.language).toBe('en');
    });

    it('should set default preference timezone to UTC', async () => {
      const user = await User.create({
        firstName: 'Default',
        lastName: 'Timezone',
        email: 'default.timezone@example.com',
        password: 'hashedPassword123',
        role: 'farmer',
      });

      expect(user.preferences.timezone).toBe('UTC');
    });

    it('should set default notification preferences', async () => {
      const user = await User.create({
        firstName: 'Default',
        lastName: 'Notifications',
        email: 'default.notifications@example.com',
        password: 'hashedPassword123',
        role: 'farmer',
      });

      expect(user.preferences.notifications.email).toBe(true);
      expect(user.preferences.notifications.push).toBe(true);
      expect(user.preferences.notifications.sms).toBe(false);
    });

    it('should set default units preferences', async () => {
      const user = await User.create({
        firstName: 'Default',
        lastName: 'Units',
        email: 'default.units@example.com',
        password: 'hashedPassword123',
        role: 'farmer',
      });

      expect(user.preferences.units.temperature).toBe('celsius');
      expect(user.preferences.units.measurement).toBe('metric');
    });

    it('should set default subscription plan to free', async () => {
      const user = await User.create({
        firstName: 'Default',
        lastName: 'Subscription',
        email: 'default.subscription@example.com',
        password: 'hashedPassword123',
        role: 'farmer',
      });

      expect(user.subscription.plan).toBe('free');
      expect(user.subscription.status).toBe('active');
    });

    it('should initialize farms as empty array', async () => {
      const user = await User.create({
        firstName: 'Empty',
        lastName: 'Farms',
        email: 'empty.farms@example.com',
        password: 'hashedPassword123',
        role: 'farmer',
      });

      expect(user.farms).toEqual([]);
    });
  });

  describe('Validation', () => {
    it('should require email', async () => {
      const user = new User({
        firstName: 'No',
        lastName: 'Email',
        password: 'hashedPassword123',
        role: 'farmer',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require firstName', async () => {
      const user = new User({
        email: 'no.firstname@example.com',
        lastName: 'Name',
        password: 'hashedPassword123',
        role: 'farmer',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should require lastName', async () => {
      const user = new User({
        email: 'no.lastname@example.com',
        firstName: 'Name',
        password: 'hashedPassword123',
        role: 'farmer',
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should validate role enum', async () => {
      const user = new User({
        email: 'invalid.role@example.com',
        firstName: 'Invalid',
        lastName: 'Role',
        password: 'hashedPassword123',
        role: 'invalid_role' as any,
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should validate subscription plan enum', async () => {
      const user = new User({
        email: 'invalid.plan@example.com',
        firstName: 'Invalid',
        lastName: 'Plan',
        password: 'hashedPassword123',
        role: 'farmer',
        subscription: {
          plan: 'invalid_plan' as any,
          status: 'active',
        },
      });

      await expect(user.save()).rejects.toThrow();
    });

    it('should validate temperature units enum', async () => {
      const user = new User({
        email: 'invalid.temp@example.com',
        firstName: 'Invalid',
        lastName: 'Temp',
        password: 'hashedPassword123',
        role: 'farmer',
        preferences: {
          language: 'en',
          timezone: 'UTC',
          notifications: { email: true, push: true, sms: false },
          units: {
            temperature: 'kelvin' as any,
            measurement: 'metric',
          },
        },
      });

      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('JSON Transformation', () => {
    it('should transform _id to id in JSON output', () => {
      const user = new User({
        email: 'json.test@example.com',
        firstName: 'JSON',
        lastName: 'Test',
        password: 'hashedPassword123',
        role: 'farmer',
      });

      const json = user.toJSON();

      expect(json.id).toBeDefined();
      expect((json as any)._id).toBeUndefined();
      expect((json as any).__v).toBeUndefined();
    });

    it('should exclude password from JSON output', () => {
      const user = new User({
        email: 'password.test@example.com',
        firstName: 'Password',
        lastName: 'Test',
        password: 'hashedPassword123',
        role: 'farmer',
      });

      const json = user.toJSON();

      expect((json as any).password).toBeUndefined();
    });
  });
});
