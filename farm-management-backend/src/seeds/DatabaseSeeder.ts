import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Models
import { User } from '../models/User';
import { Farm } from '../models/Farm';
import { Animal } from '../models/Animal';
import { Feed } from '../models/Feed';
import { VeterinaryRecord } from '../models/VeterinaryRecord';
import { BreedingRecord } from '../models/BreedingRecord';

interface SeederOptions {
  dropDatabase?: boolean;
  seedUsers?: boolean;
  seedFarms?: boolean;
  seedAnimals?: boolean;
  seedFeed?: boolean;
  seedVeterinary?: boolean;
  seedBreeding?: boolean;
}

class DatabaseSeeder {
  private connection: mongoose.Connection | null = null;

  async connect(): Promise<void> {
    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farm-management-dev';
      await mongoose.connect(mongoURI);
      this.connection = mongoose.connection;
      console.log('✅ Connected to MongoDB for seeding');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      process.exit(1);
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
    }
  }

  async dropDatabase(): Promise<void> {
    if (this.connection?.db) {
      await this.connection.db.dropDatabase();
      console.log('🗑️  Database dropped');
    }
  }

  async seedAll(options: SeederOptions = {}): Promise<void> {
    const {
      dropDatabase = false,
      seedUsers = true,
      seedFarms = true,
      seedAnimals = true,
      seedFeed = true,
      seedVeterinary = true,
      seedBreeding = true,
    } = options;

    console.log('🌱 Starting database seeding...');

    if (dropDatabase) {
      await this.dropDatabase();
    }

    // Seed in order due to dependencies
    const userData = seedUsers ? await this.seedUsers() : { users: [], farms: [] };
    const farmData = seedFarms ? await this.seedFarms(userData.users) : { farms: [] };
    const animalData = seedAnimals ? await this.seedAnimals([...userData.farms, ...farmData.farms]) : { animals: [] };
    const feedData = seedFeed ? await this.seedFeed([...userData.farms, ...farmData.farms]) : { feed: [] };
    
    if (seedVeterinary) {
      await this.seedVeterinaryRecords(animalData.animals, [...userData.farms, ...farmData.farms]);
    }
    
    if (seedBreeding) {
      await this.seedBreedingRecords(animalData.animals, [...userData.farms, ...farmData.farms]);
    }

    console.log('🎉 Database seeding completed successfully!');
  }

  async seedUsers(): Promise<{ users: any[], farms: any[] }> {
    console.log('👥 Seeding users...');

    const hashedPassword = await bcrypt.hash('password123', 12);

    const users = [
      {
        firstName: 'John',
        lastName: 'Farmer',
        email: 'john@example.com',
        password: hashedPassword,
        phone: '+1234567890',
        role: 'owner',
        isActive: true,
        emailVerified: true,
      },
      {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah@example.com',
        password: hashedPassword,
        phone: '+1234567891',
        role: 'manager',
        isActive: true,
        emailVerified: true,
      },
      {
        firstName: 'Mike',
        lastName: 'Worker',
        email: 'mike@example.com',
        password: hashedPassword,
        phone: '+1234567892',
        role: 'worker',
        isActive: true,
        emailVerified: true,
      },
      {
        firstName: 'Emma',
        lastName: 'Davis',
        email: 'emma@example.com',
        password: hashedPassword,
        phone: '+1234567893',
        role: 'owner',
        isActive: true,
        emailVerified: true,
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create farms for owners
    const farms = [
      {
        name: 'Green Valley Farm',
        location: {
          address: '123 Farm Road, Rural County, State 12345',
          coordinates: {
            type: 'Point' as const,
            coordinates: [-74.006, 40.7128], // NYC coordinates as example
          },
        },
        size: 500, // acres
        establishedYear: 2010,
        farmType: 'mixed' as const,
        owner: createdUsers[0]?._id, // John Farmer
        managers: createdUsers[1] ? [createdUsers[1]._id] : [], // Sarah Johnson
        workers: createdUsers[2] ? [createdUsers[2]._id] : [], // Mike Worker
        contactInfo: {
          phone: '+1234567890',
          email: 'info@greenvalleyfarm.com',
          website: 'https://greenvalleyfarm.com',
        },
        isActive: true,
      },
      {
        name: 'Sunrise Ranch',
        location: {
          address: '456 Ranch Drive, Valley County, State 54321',
          coordinates: {
            type: 'Point' as const,
            coordinates: [-118.2437, 34.0522], // LA coordinates as example
          },
        },
        size: 1200, // acres
        establishedYear: 2005,
        farmType: 'livestock' as const,
        owner: createdUsers[3]?._id, // Emma Davis
        managers: [],
        workers: [],
        contactInfo: {
          phone: '+1234567893',
          email: 'contact@sunriseranch.com',
          website: 'https://sunriseranch.com',
        },
        isActive: true,
      },
    ];

    const createdFarms = await Farm.insertMany(farms);
    console.log(`✅ Created ${createdFarms.length} farms`);

    return { users: createdUsers, farms: createdFarms };
  }

  async seedFarms(existingUsers: any[] = []): Promise<{ farms: any[] }> {
    if (existingUsers.length === 0) {
      console.log('⚠️  No users found, skipping additional farm seeding');
      return { farms: [] };
    }

    console.log('🏞️  Seeding additional farms...');

    const additionalFarms = [
      {
        name: 'Mountain View Dairy',
        location: {
          address: '789 Mountain Road, Highland County, State 67890',
          coordinates: {
            type: 'Point',
            coordinates: [-105.2551, 40.0150], // Denver coordinates
          },
        },
        size: 800,
        establishedYear: 2015,
        farmType: 'dairy',
        owner: existingUsers[0]._id,
        managers: existingUsers.length > 1 ? [existingUsers[1]._id] : [],
        workers: existingUsers.length > 2 ? [existingUsers[2]._id] : [],
        contactInfo: {
          phone: '+1234567894',
          email: 'info@mountainviewdairy.com',
        },
        isActive: true,
      },
    ];

    const createdFarms = await Farm.insertMany(additionalFarms);
    console.log(`✅ Created ${createdFarms.length} additional farms`);

    return { farms: createdFarms };
  }

  async seedAnimals(farms: any[]): Promise<{ animals: any[] }> {
    if (farms.length === 0) {
      console.log('⚠️  No farms found, skipping animal seeding');
      return { animals: [] };
    }

    console.log('🐄 Seeding animals...');

    const animals = [];
    const species = ['cattle', 'pig', 'sheep', 'goat', 'chicken'] as const;
    const breeds: Record<typeof species[number], string[]> = {
      cattle: ['Holstein', 'Angus', 'Hereford', 'Jersey'],
      pig: ['Yorkshire', 'Duroc', 'Hampshire', 'Landrace'],
      sheep: ['Merino', 'Suffolk', 'Dorset', 'Romney'],
      goat: ['Boer', 'Nubian', 'Alpine', 'Saanen'],
      chicken: ['Rhode Island Red', 'Leghorn', 'Plymouth Rock', 'Orpington'],
    };

    const genders = ['male', 'female'] as const;
    const statuses = ['healthy', 'sick', 'pregnant', 'quarantine'] as const;

    // Generate animals for each farm
    for (const farm of farms) {
      const animalCount = Math.floor(Math.random() * 50) + 20; // 20-70 animals per farm

      for (let i = 0; i < animalCount; i++) {
        const selectedSpecies = species[Math.floor(Math.random() * species.length)];
  const speciesKey = selectedSpecies as keyof typeof breeds;
  const selectedBreed = breeds[speciesKey][Math.floor(Math.random() * breeds[speciesKey].length)];
        const selectedGender = genders[Math.floor(Math.random() * genders.length)];
        const selectedStatus = statuses[Math.floor(Math.random() * statuses.length)];

        const birthDate = new Date();
        birthDate.setFullYear(birthDate.getFullYear() - Math.floor(Math.random() * 5) - 1); // 1-6 years old

        const animal = {
          farmId: farm._id,
          tag: `${farm.name.substring(0, 2).toUpperCase()}${String(i + 1).padStart(4, '0')}`,
          name: `${selectedBreed} ${i + 1}`,
          species: selectedSpecies,
          breed: selectedBreed,
          gender: selectedGender,
          birthDate,
          weight: {
            current: Math.floor(Math.random() * 500) + 100, // 100-600 kg
            birth: Math.floor(Math.random() * 50) + 20, // 20-70 kg
          },
          healthStatus: selectedStatus,
          location: `Section ${Math.floor(Math.random() * 10) + 1}`,
          parentage: {
            mother: Math.random() > 0.7 ? `${farm.name.substring(0, 2).toUpperCase()}${String(Math.floor(Math.random() * 100) + 1).padStart(4, '0')}` : undefined,
            father: Math.random() > 0.7 ? `${farm.name.substring(0, 2).toUpperCase()}${String(Math.floor(Math.random() * 100) + 1).padStart(4, '0')}` : undefined,
          },
          identificationMethods: [
            {
              type: 'ear_tag',
              value: `${farm.name.substring(0, 2).toUpperCase()}${String(i + 1).padStart(4, '0')}`,
            },
            ...(Math.random() > 0.5 ? [{
              type: 'microchip',
              value: `982${String(Math.floor(Math.random() * 1000000000000)).padStart(12, '0')}`,
            }] : []),
          ],
          notes: Math.random() > 0.7 ? 'Good temperament, easy to handle' : undefined,
          isActive: true,
        };

        animals.push(animal);
      }
    }

    const createdAnimals = await Animal.insertMany(animals);
    console.log(`✅ Created ${createdAnimals.length} animals`);

    return { animals: createdAnimals };
  }

  async seedFeed(farms: any[]): Promise<{ feed: any[] }> {
    if (farms.length === 0) {
      console.log('⚠️  No farms found, skipping feed seeding');
      return { feed: [] };
    }

    console.log('🌾 Seeding feed inventory...');

    const feedTypes = [
      {
        name: 'Hay - Timothy',
        type: 'forage',
        category: 'roughage',
        nutritionFacts: {
          protein: 8.5,
          fat: 2.1,
          fiber: 32.0,
          moisture: 12.0,
          ash: 6.2,
        },
        costPerUnit: 15.50,
      },
      {
        name: 'Corn Silage',
        type: 'forage',
        category: 'roughage',
        nutritionFacts: {
          protein: 8.0,
          fat: 3.2,
          fiber: 25.0,
          moisture: 65.0,
          ash: 4.0,
        },
        costPerUnit: 45.00,
      },
      {
        name: 'Dairy Concentrate',
        type: 'concentrate',
        category: 'grain',
        nutritionFacts: {
          protein: 18.0,
          fat: 4.5,
          fiber: 8.0,
          moisture: 12.0,
          ash: 7.5,
        },
        costPerUnit: 320.00,
      },
      {
        name: 'Soybean Meal',
        type: 'protein',
        category: 'supplement',
        nutritionFacts: {
          protein: 48.0,
          fat: 1.5,
          fiber: 6.0,
          moisture: 12.0,
          ash: 6.5,
        },
        costPerUnit: 450.00,
      },
      {
        name: 'Mineral Mix',
        type: 'mineral',
        category: 'supplement',
        nutritionFacts: {
          protein: 0,
          fat: 0,
          fiber: 0,
          moisture: 8.0,
          ash: 95.0,
        },
        costPerUnit: 1200.00,
      },
    ];

    const feed = [];
    const suppliers = ['FarmCorp Supply', 'AgriNutrition Ltd', 'Valley Feed Co', 'Premium Feeds Inc'];

    for (const farm of farms) {
      for (const feedType of feedTypes) {
        const currentStock = Math.floor(Math.random() * 1000) + 100; // 100-1100 units
        const reorderPoint = Math.floor(currentStock * 0.2); // 20% of current stock

        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + Math.floor(Math.random() * 12) + 6); // 6-18 months from now

        const feedItem = {
          farmId: farm._id,
          name: feedType.name,
          type: feedType.type,
          category: feedType.category,
          currentStock,
          unit: 'kg',
          reorderPoint,
          maxStock: currentStock * 2,
          costPerUnit: feedType.costPerUnit,
          supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
          expiryDate,
          nutritionFacts: feedType.nutritionFacts,
          storageLocation: `Barn ${Math.floor(Math.random() * 5) + 1}`,
          notes: Math.random() > 0.7 ? 'Store in dry, cool place' : undefined,
          isActive: true,
          usageHistory: [],
        };

        feed.push(feedItem);
      }
    }

    const createdFeed = await Feed.insertMany(feed);
    console.log(`✅ Created ${createdFeed.length} feed inventory items`);

    return { feed: createdFeed };
  }

  async seedVeterinaryRecords(animals: any[], farms: any[]): Promise<void> {
    if (animals.length === 0 || farms.length === 0) {
      console.log('⚠️  No animals or farms found, skipping veterinary record seeding');
      return;
    }

    console.log('🏥 Seeding veterinary records...');

    const appointmentTypes = ['vaccination', 'health_check', 'treatment', 'surgery', 'emergency'] as const;
    const veterinarians = ['Dr. Smith', 'Dr. Johnson', 'Dr. Williams', 'Dr. Brown'];
    const statuses = ['scheduled', 'completed', 'cancelled'] as const;

    const records = [];

    // Create some records for each animal (not all animals need records)
    const selectedAnimals = animals.slice(0, Math.floor(animals.length * 0.6)); // 60% of animals

    for (const animal of selectedAnimals) {
      const recordCount = Math.floor(Math.random() * 3) + 1; // 1-3 records per animal

      for (let i = 0; i < recordCount; i++) {
  const type = appointmentTypes[Math.floor(Math.random() * appointmentTypes.length)] as typeof appointmentTypes[number];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const vet = veterinarians[Math.floor(Math.random() * veterinarians.length)];

        const scheduledDate = new Date();
        scheduledDate.setDate(scheduledDate.getDate() + Math.floor(Math.random() * 60) - 30); // ±30 days

        const record = {
          farmId: animal.farmId,
          animalId: animal._id,
          type,
          title: `${type.charAt(0).toUpperCase() + type.slice(1)} - ${animal.tag}`,
          description: `Regular ${type} for ${animal.name}`,
          scheduledDate,
          actualDate: status === 'completed' ? scheduledDate : undefined,
          veterinarian: vet,
          status,
          costs: {
            consultation: Math.floor(Math.random() * 100) + 50,
            treatment: type === 'treatment' || type === 'surgery' ? Math.floor(Math.random() * 500) + 100 : 0,
            medication: Math.floor(Math.random() * 200) + 20,
            total: 0,
          },
          paymentStatus: status === 'completed' ? (Math.random() > 0.3 ? 'paid' : 'pending') : 'pending',
          notes: `${type} performed successfully. Animal responded well.`,
          followUpRequired: Math.random() > 0.7,
          followUpDate: Math.random() > 0.7 ? new Date(scheduledDate.getTime() + 14 * 24 * 60 * 60 * 1000) : undefined,
        };

        // Calculate total cost
        record.costs.total = record.costs.consultation + record.costs.treatment + record.costs.medication;

        records.push(record);
      }
    }

    const createdRecords = await VeterinaryRecord.insertMany(records);
    console.log(`✅ Created ${createdRecords.length} veterinary records`);
  }

  async seedBreedingRecords(animals: any[], farms: any[]): Promise<void> {
    if (animals.length === 0 || farms.length === 0) {
      console.log('⚠️  No animals or farms found, skipping breeding record seeding');
      return;
    }

    console.log('🐣 Seeding breeding records...');

    // Filter for female animals that could be breeding
    const femaleAnimals = animals.filter(animal => 
      animal.gender === 'female' && 
      ['cattle', 'pig', 'sheep', 'goat'].includes(animal.species)
    );

    const maleAnimals = animals.filter(animal => 
      animal.gender === 'male' && 
      ['cattle', 'pig', 'sheep', 'goat'].includes(animal.species)
    );

    if (femaleAnimals.length === 0 || maleAnimals.length === 0) {
      console.log('⚠️  Insufficient breeding animals found');
      return;
    }

    const breedingMethods = ['natural', 'artificial_insemination'];
    const statuses = ['active', 'completed', 'failed'];

    const records = [];

    // Create breeding records for some female animals
    const selectedFemales = femaleAnimals.slice(0, Math.floor(femaleAnimals.length * 0.4)); // 40% of females

    for (const female of selectedFemales) {
      const recordCount = Math.floor(Math.random() * 2) + 1; // 1-2 breeding cycles

      for (let i = 0; i < recordCount; i++) {
        const method = breedingMethods[Math.floor(Math.random() * breedingMethods.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Select a male from the same farm if possible
        const farmMales = maleAnimals.filter(male => 
          male.farmId.toString() === female.farmId.toString() && 
          male.species === female.species
        );
        const selectedMale = farmMales.length > 0 
          ? farmMales[Math.floor(Math.random() * farmMales.length)]
          : maleAnimals[Math.floor(Math.random() * maleAnimals.length)];

        const breedingDate = new Date();
        breedingDate.setDate(breedingDate.getDate() - Math.floor(Math.random() * 200)); // Up to 200 days ago

        // Calculate gestation period based on species
        const gestationPeriods: Record<string, number> = {
          cattle: 283,
          pig: 114,
          sheep: 147,
          goat: 150,
        };

        const gestationPeriod = gestationPeriods[female.species] || 150;
        const expectedBirthDate = new Date(breedingDate);
        expectedBirthDate.setDate(expectedBirthDate.getDate() + gestationPeriod);

        const record = {
          farmId: female.farmId,
          motherId: female._id,
          fatherId: selectedMale._id,
          breedingDate,
          method,
          expectedBirthDate,
          gestationPeriod,
          status,
          pregnancyStatus: status === 'active' ? (Math.random() > 0.3 ? 'confirmed' : 'not_confirmed') : 'confirmed',
          pregnancyCheckDate: status !== 'failed' ? new Date(breedingDate.getTime() + 30 * 24 * 60 * 60 * 1000) : undefined,
          checkMethod: 'ultrasound',
          actualBirthDate: status === 'completed' ? expectedBirthDate : undefined,
          outcome: status === 'completed' ? 'successful' : undefined,
          offspring: status === 'completed' ? [{
            tag: `${female.tag}-O1`,
            gender: Math.random() > 0.5 ? 'male' : 'female',
            birthWeight: Math.floor(Math.random() * 20) + 30,
            status: 'alive',
          }] : [],
          weaningDate: status === 'completed' ? new Date(expectedBirthDate.getTime() + 60 * 24 * 60 * 60 * 1000) : undefined,
          costs: {
            breeding: method === 'artificial_insemination' ? 150 : 50,
            veterinary: Math.floor(Math.random() * 200) + 100,
            feed: Math.floor(Math.random() * 300) + 200,
            total: 0,
          },
          notes: `${method} breeding between ${female.tag} and ${selectedMale.tag}`,
        };

        // Calculate total cost
        record.costs.total = record.costs.breeding + record.costs.veterinary + record.costs.feed;

        records.push(record);
      }
    }

    const createdRecords = await BreedingRecord.insertMany(records);
    console.log(`✅ Created ${createdRecords.length} breeding records`);
  }
}

export default DatabaseSeeder;