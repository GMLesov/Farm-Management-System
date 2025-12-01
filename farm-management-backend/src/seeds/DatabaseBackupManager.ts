import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';

// Models
import { User } from '../models/User';
import { Farm } from '../models/Farm';
import { Animal } from '../models/Animal';
import { Feed } from '../models/Feed';
import { VeterinaryRecord } from '../models/VeterinaryRecord';
import { BreedingRecord } from '../models/BreedingRecord';

interface BackupData {
  users: any[];
  farms: any[];
  animals: any[];
  feed: any[];
  veterinaryRecords: any[];
  breedingRecords: any[];
  metadata: {
    timestamp: string;
    version: string;
    recordCounts: Record<string, number>;
  };
}

export class DatabaseBackupManager {
  private connection: mongoose.Connection | null = null;

  async connect(): Promise<void> {
    try {
      const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farm-management-dev';
      await mongoose.connect(mongoURI);
      this.connection = mongoose.connection;
      console.log('✅ Connected to MongoDB for backup operations');
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

  async createBackup(outputPath?: string): Promise<string> {
    console.log('📦 Creating database backup...');

    try {
      // Fetch all data
      const [users, farms, animals, feed, veterinaryRecords, breedingRecords] = await Promise.all([
        User.find({}).lean(),
        Farm.find({}).lean(),
        Animal.find({}).lean(),
        Feed.find({}).lean(),
        VeterinaryRecord.find({}).lean(),
        BreedingRecord.find({}).lean(),
      ]);

      const backupData: BackupData = {
        users,
        farms,
        animals,
        feed,
        veterinaryRecords,
        breedingRecords,
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          recordCounts: {
            users: users.length,
            farms: farms.length,
            animals: animals.length,
            feed: feed.length,
            veterinaryRecords: veterinaryRecords.length,
            breedingRecords: breedingRecords.length,
          },
        },
      };

      // Generate filename if not provided
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = outputPath || `farm-backup-${timestamp}.json`;
      const backupPath = path.resolve(filename);

      // Write backup file
      await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));

      console.log('✅ Backup created successfully:');
      console.log(`   📄 File: ${backupPath}`);
      console.log(`   📊 Records: ${Object.entries(backupData.metadata.recordCounts)
        .map(([key, count]) => `${key}: ${count}`)
        .join(', ')}`);

      return backupPath;

    } catch (error) {
      console.error('❌ Error creating backup:', error);
      throw error;
    }
  }

  async restoreBackup(backupPath: string, options: {
    dropDatabase?: boolean;
    skipUsers?: boolean;
    skipFarms?: boolean;
    skipAnimals?: boolean;
    skipFeed?: boolean;
    skipVeterinary?: boolean;
    skipBreeding?: boolean;
  } = {}): Promise<void> {
    console.log(`📦 Restoring database from backup: ${backupPath}`);

    try {
      // Read backup file
      const backupContent = await fs.readFile(backupPath, 'utf-8');
      const backupData: BackupData = JSON.parse(backupContent);

      console.log('📊 Backup metadata:');
      console.log(`   📅 Created: ${backupData.metadata.timestamp}`);
      console.log(`   📋 Version: ${backupData.metadata.version}`);
      console.log(`   📊 Records: ${Object.entries(backupData.metadata.recordCounts)
        .map(([key, count]) => `${key}: ${count}`)
        .join(', ')}`);

      // Drop database if requested
      if (options.dropDatabase) {
        console.log('🗑️ Dropping database...');
        if (this.connection?.db) {
          await this.connection.db.dropDatabase();
          console.log('✅ Database dropped');
        }
      }

      // Restore data in order due to dependencies
      if (!options.skipUsers && backupData.users.length > 0) {
        console.log(`👥 Restoring ${backupData.users.length} users...`);
        await User.insertMany(backupData.users);
        console.log('✅ Users restored');
      }

      if (!options.skipFarms && backupData.farms.length > 0) {
        console.log(`🏞️ Restoring ${backupData.farms.length} farms...`);
        await Farm.insertMany(backupData.farms);
        console.log('✅ Farms restored');
      }

      if (!options.skipAnimals && backupData.animals.length > 0) {
        console.log(`🐄 Restoring ${backupData.animals.length} animals...`);
        await Animal.insertMany(backupData.animals);
        console.log('✅ Animals restored');
      }

      if (!options.skipFeed && backupData.feed.length > 0) {
        console.log(`🌾 Restoring ${backupData.feed.length} feed items...`);
        await Feed.insertMany(backupData.feed);
        console.log('✅ Feed inventory restored');
      }

      if (!options.skipVeterinary && backupData.veterinaryRecords.length > 0) {
        console.log(`🏥 Restoring ${backupData.veterinaryRecords.length} veterinary records...`);
        await VeterinaryRecord.insertMany(backupData.veterinaryRecords);
        console.log('✅ Veterinary records restored');
      }

      if (!options.skipBreeding && backupData.breedingRecords.length > 0) {
        console.log(`🐣 Restoring ${backupData.breedingRecords.length} breeding records...`);
        await BreedingRecord.insertMany(backupData.breedingRecords);
        console.log('✅ Breeding records restored');
      }

      console.log('🎉 Database restore completed successfully!');

    } catch (error) {
      console.error('❌ Error restoring backup:', error);
      throw error;
    }
  }

  async listBackups(backupDir: string = './'): Promise<string[]> {
    try {
      const files = await fs.readdir(backupDir);
      const backupFiles = files.filter(file => 
        file.startsWith('farm-backup-') && file.endsWith('.json')
      );

      console.log(`📁 Found ${backupFiles.length} backup files in ${backupDir}:`);
      backupFiles.forEach(file => {
        console.log(`   📄 ${file}`);
      });

      return backupFiles.map(file => path.join(backupDir, file));
    } catch (error) {
      console.error('❌ Error listing backups:', error);
      throw error;
    }
  }

  async validateBackup(backupPath: string): Promise<boolean> {
    try {
      console.log(`🔍 Validating backup: ${backupPath}`);

      const backupContent = await fs.readFile(backupPath, 'utf-8');
      const backupData = JSON.parse(backupContent);

      // Check required fields
      const requiredFields = ['users', 'farms', 'animals', 'feed', 'veterinaryRecords', 'breedingRecords', 'metadata'];
      const missingFields = requiredFields.filter(field => !backupData.hasOwnProperty(field));

      if (missingFields.length > 0) {
        console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
        return false;
      }

      // Check metadata
      if (!backupData.metadata.timestamp || !backupData.metadata.recordCounts) {
        console.error('❌ Invalid metadata structure');
        return false;
      }

      // Validate record counts
      const actualCounts = {
        users: backupData.users.length,
        farms: backupData.farms.length,
        animals: backupData.animals.length,
        feed: backupData.feed.length,
        veterinaryRecords: backupData.veterinaryRecords.length,
        breedingRecords: backupData.breedingRecords.length,
      };

      const countMismatches = Object.entries(actualCounts).filter(
        ([key, count]) => backupData.metadata.recordCounts[key] !== count
      );

      if (countMismatches.length > 0) {
        console.warn('⚠️ Record count mismatches found:');
        countMismatches.forEach(([key, actualCount]) => {
          console.warn(`   ${key}: expected ${backupData.metadata.recordCounts[key]}, found ${actualCount}`);
        });
      }

      console.log('✅ Backup validation passed');
      return true;

    } catch (error) {
      console.error('❌ Error validating backup:', error);
      return false;
    }
  }

  async getDatabaseStats(): Promise<Record<string, number>> {
    try {
      const [userCount, farmCount, animalCount, feedCount, vetCount, breedingCount] = await Promise.all([
        User.countDocuments(),
        Farm.countDocuments(),
        Animal.countDocuments(),
        Feed.countDocuments(),
        VeterinaryRecord.countDocuments(),
        BreedingRecord.countDocuments(),
      ]);

      const stats = {
        users: userCount,
        farms: farmCount,
        animals: animalCount,
        feed: feedCount,
        veterinaryRecords: vetCount,
        breedingRecords: breedingCount,
      };

      console.log('📊 Current database statistics:');
      Object.entries(stats).forEach(([collection, count]) => {
        console.log(`   ${collection}: ${count} records`);
      });

      return stats;
    } catch (error) {
      console.error('❌ Error getting database stats:', error);
      throw error;
    }
  }
}

export default DatabaseBackupManager;