import mongoose from 'mongoose';

interface Migration {
  version: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

interface MigrationRecord {
  version: string;
  appliedAt: Date;
  description: string;
}

class MigrationManager {
  private connection: mongoose.Connection | null = null;
  private migrations: Migration[] = [];

  async connect(): Promise<void> {
    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farm-management-dev';
      await mongoose.connect(mongoURI);
      this.connection = mongoose.connection;
      console.log('✅ Connected to MongoDB for migrations');
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await mongoose.disconnect();
      console.log('✅ Disconnected from MongoDB');
    }
  }

  // Add migration to the list
  addMigration(migration: Migration): void {
    this.migrations.push(migration);
  }

  // Get migration collection
  private getMigrationCollection() {
    if (!this.connection) {
      throw new Error('Database connection not established');
    }
    return this.connection.collection<MigrationRecord>('migrations');
  }

  // Get applied migrations
  async getAppliedMigrations(): Promise<string[]> {
    const collection = this.getMigrationCollection();
    const records = await collection.find({}).sort({ appliedAt: 1 }).toArray();
    return records.map(record => record.version);
  }

  // Mark migration as applied
  async markMigrationApplied(version: string, description: string): Promise<void> {
    const collection = this.getMigrationCollection();
    await collection.insertOne({
      version,
      description,
      appliedAt: new Date(),
    });
  }

  // Remove migration record
  async removeMigrationRecord(version: string): Promise<void> {
    const collection = this.getMigrationCollection();
    await collection.deleteOne({ version });
  }

  // Run pending migrations
  async migrate(): Promise<void> {
    console.log('🚀 Starting database migrations...');

    const appliedMigrations = await this.getAppliedMigrations();
    const pendingMigrations = this.migrations.filter(
      migration => !appliedMigrations.includes(migration.version)
    );

    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations');
      return;
    }

    console.log(`📋 Found ${pendingMigrations.length} pending migrations:`);
    pendingMigrations.forEach(migration => {
      console.log(`   📄 ${migration.version}: ${migration.description}`);
    });

    for (const migration of pendingMigrations) {
      console.log(`\n⏳ Applying migration ${migration.version}...`);
      try {
        await migration.up();
        await this.markMigrationApplied(migration.version, migration.description);
        console.log(`✅ Migration ${migration.version} applied successfully`);
      } catch (error) {
        console.error(`❌ Error applying migration ${migration.version}:`, error);
        throw error;
      }
    }

    console.log('\n🎉 All migrations applied successfully!');
  }

  // Rollback last migration
  async rollback(): Promise<void> {
    console.log('🔄 Rolling back last migration...');

    const appliedMigrations = await this.getAppliedMigrations();
    if (appliedMigrations.length === 0) {
      console.log('⚠️ No migrations to rollback');
      return;
    }

    const lastMigrationVersion = appliedMigrations[appliedMigrations.length - 1];
    const migration = this.migrations.find(m => m.version === lastMigrationVersion);

    if (!migration) {
      console.error(`❌ Migration ${lastMigrationVersion} not found in migration files`);
      return;
    }

    console.log(`⏳ Rolling back migration ${migration.version}: ${migration.description}`);
    try {
      await migration.down();
      await this.removeMigrationRecord(migration.version);
      console.log(`✅ Migration ${migration.version} rolled back successfully`);
    } catch (error) {
      console.error(`❌ Error rolling back migration ${migration.version}:`, error);
      throw error;
    }
  }

  // Get migration status
  async getStatus(): Promise<void> {
    console.log('📊 Migration Status:');

    const appliedMigrations = await this.getAppliedMigrations();
    const allMigrations = this.migrations.map(m => m.version);

    console.log(`\n✅ Applied migrations (${appliedMigrations.length}):`);
    if (appliedMigrations.length === 0) {
      console.log('   (none)');
    } else {
      appliedMigrations.forEach(version => {
        const migration = this.migrations.find(m => m.version === version);
        console.log(`   📄 ${version}: ${migration?.description || 'Unknown'}`);
      });
    }

    const pendingMigrations = this.migrations.filter(
      migration => !appliedMigrations.includes(migration.version)
    );

    console.log(`\n⏳ Pending migrations (${pendingMigrations.length}):`);
    if (pendingMigrations.length === 0) {
      console.log('   (none)');
    } else {
      pendingMigrations.forEach(migration => {
        console.log(`   📄 ${migration.version}: ${migration.description}`);
      });
    }
  }
}

// Example migrations
export const migrations: Migration[] = [
  {
    version: '001_add_farm_coordinates_index',
    description: 'Add geospatial index for farm coordinates',
    async up() {
      const db = mongoose.connection.db;
      if (db) {
        await db.collection('farms').createIndex(
          { 'location.coordinates': '2dsphere' },
          { name: 'location_coordinates_2dsphere' }
        );
        console.log('   📍 Created geospatial index for farm coordinates');
      }
    },
    async down() {
      const db = mongoose.connection.db;
      if (db) {
        await db.collection('farms').dropIndex('location_coordinates_2dsphere');
        console.log('   📍 Dropped geospatial index for farm coordinates');
      }
    },
  },
  {
    version: '002_add_animal_tag_index',
    description: 'Add unique compound index for animal tags within farms',
    async up() {
      const db = mongoose.connection.db;
      if (db) {
        await db.collection('animals').createIndex(
          { farmId: 1, tag: 1 },
          { unique: true, name: 'farm_animal_tag_unique' }
        );
        console.log('   🏷️ Created unique compound index for animal tags');
      }
    },
    async down() {
      const db = mongoose.connection.db;
      if (db) {
        await db.collection('animals').dropIndex('farm_animal_tag_unique');
        console.log('   🏷️ Dropped unique compound index for animal tags');
      }
    },
  },
  {
    version: '003_add_feed_expiry_index',
    description: 'Add index for feed expiry dates to optimize low stock queries',
    async up() {
      const db = mongoose.connection.db;
      if (db) {
        await db.collection('feeds').createIndex(
          { expiryDate: 1 },
          { name: 'feed_expiry_date' }
        );
        await db.collection('feeds').createIndex(
          { currentStock: 1, reorderPoint: 1 },
          { name: 'feed_stock_levels' }
        );
        console.log('   📦 Created indexes for feed expiry and stock levels');
      }
    },
    async down() {
      const db = mongoose.connection.db;
      if (db) {
        await db.collection('feeds').dropIndex('feed_expiry_date');
        await db.collection('feeds').dropIndex('feed_stock_levels');
        console.log('   📦 Dropped indexes for feed expiry and stock levels');
      }
    },
  },
  {
    version: '004_add_veterinary_date_indexes',
    description: 'Add indexes for veterinary record dates',
    async up() {
      const db = mongoose.connection.db;
      if (db) {
        await db.collection('veterinaryrecords').createIndex(
          { scheduledDate: 1 },
          { name: 'vet_scheduled_date' }
        );
        await db.collection('veterinaryrecords').createIndex(
          { followUpDate: 1 },
          { name: 'vet_followup_date' }
        );
        await db.collection('veterinaryrecords').createIndex(
          { farmId: 1, status: 1 },
          { name: 'vet_farm_status' }
        );
        console.log('   🏥 Created indexes for veterinary record dates and status');
      }
    },
    async down() {
      const db = mongoose.connection.db;
      if (db) {
        await db.collection('veterinaryrecords').dropIndex('vet_scheduled_date');
        await db.collection('veterinaryrecords').dropIndex('vet_followup_date');
        await db.collection('veterinaryrecords').dropIndex('vet_farm_status');
        console.log('   🏥 Dropped indexes for veterinary record dates and status');
      }
    },
  },
  {
    version: '005_add_breeding_date_indexes',
    description: 'Add indexes for breeding record dates',
    async up() {
      const db = mongoose.connection.db;
      if (db) {
        await db.collection('breedingrecords').createIndex(
          { breedingDate: 1 },
          { name: 'breeding_date' }
        );
        await db.collection('breedingrecords').createIndex(
          { expectedBirthDate: 1 },
          { name: 'breeding_expected_birth' }
        );
        await db.collection('breedingrecords').createIndex(
          { farmId: 1, status: 1 },
          { name: 'breeding_farm_status' }
        );
        console.log('   🐣 Created indexes for breeding record dates and status');
      }
    },
    async down() {
      const db = mongoose.connection.db;
      if (db) {
        await db.collection('breedingrecords').dropIndex('breeding_date');
        await db.collection('breedingrecords').dropIndex('breeding_expected_birth');
        await db.collection('breedingrecords').dropIndex('breeding_farm_status');
        console.log('   🐣 Dropped indexes for breeding record dates and status');
      }
    },
  },
];

export default MigrationManager;