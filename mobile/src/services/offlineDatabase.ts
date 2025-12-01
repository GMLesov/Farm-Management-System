import SQLite from 'react-native-sqlite-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animal, Crop, Task, FeedingLog, CropActivity } from '../types';

// Enable promise support for SQLite
SQLite.enablePromise(true);

export interface OfflineData {
  animals: Animal[];
  crops: Crop[];
  tasks: Task[];
  feedingLogs: FeedingLog[];
  cropActivities: CropActivity[];
}

export interface PendingSync {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  collection: 'animals' | 'crops' | 'tasks' | 'feedingLogs' | 'cropActivities';
  data: any;
  timestamp: number;
}

class OfflineDatabase {
  private db: SQLite.SQLiteDatabase | null = null;
  private dbName = 'FarmManagement.db';

  async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabase({
        name: this.dbName,
        location: 'default',
      });

      await this.createTables();
      console.log('✅ Offline database initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize offline database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const createTableQueries = [
      // Animals table
      `CREATE TABLE IF NOT EXISTS animals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        species TEXT NOT NULL,
        breed TEXT,
        dateOfBirth TEXT,
        gender TEXT,
        currentWeight REAL,
        healthStatus TEXT,
        currentLocation TEXT,
        notes TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        lastSync INTEGER DEFAULT 0
      )`,
      
      // Crops table
      `CREATE TABLE IF NOT EXISTS crops (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        variety TEXT,
        plantingDate TEXT,
        expectedHarvestDate TEXT,
        actualHarvestDate TEXT,
        fieldLocation TEXT,
        status TEXT,
        soilType TEXT,
        totalYield REAL,
        notes TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        lastSync INTEGER DEFAULT 0
      )`,
      
      // Tasks table
      `CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT,
        status TEXT,
        dueDate TEXT,
        assignedTo TEXT,
        assignedBy TEXT,
        relatedEntity TEXT,
        relatedEntityId TEXT,
        estimatedDuration INTEGER,
        actualDuration INTEGER,
        completedAt TEXT,
        createdAt TEXT,
        updatedAt TEXT,
        lastSync INTEGER DEFAULT 0
      )`,
      
      // Feeding logs table
      `CREATE TABLE IF NOT EXISTS feeding_logs (
        id TEXT PRIMARY KEY,
        animalId TEXT NOT NULL,
        feedType TEXT NOT NULL,
        quantity REAL NOT NULL,
        unit TEXT NOT NULL,
        feedingTime TEXT NOT NULL,
        notes TEXT,
        createdAt TEXT,
        lastSync INTEGER DEFAULT 0
      )`,
      
      // Crop activities table
      `CREATE TABLE IF NOT EXISTS crop_activities (
        id TEXT PRIMARY KEY,
        cropId TEXT NOT NULL,
        activityType TEXT NOT NULL,
        description TEXT,
        date TEXT NOT NULL,
        quantity REAL,
        unit TEXT,
        notes TEXT,
        createdAt TEXT,
        lastSync INTEGER DEFAULT 0
      )`,
      
      // Pending sync table
      `CREATE TABLE IF NOT EXISTS pending_sync (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        collection TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        retries INTEGER DEFAULT 0
      )`
    ];

    for (const query of createTableQueries) {
      await this.db.executeSql(query);
    }
  }

  // CRUD Operations for Animals
  async saveAnimal(animal: Animal): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT OR REPLACE INTO animals 
      (id, name, species, breed, dateOfBirth, gender, currentWeight, healthStatus, 
       currentLocation, notes, createdAt, updatedAt, lastSync)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.executeSql(query, [
      animal.id,
      animal.name,
      animal.species,
      animal.breed || '',
      animal.dateOfBirth,
      animal.gender,
      animal.currentWeight || 0,
      animal.healthStatus,
      animal.currentLocation || '',
      animal.notes || '',
      animal.createdAt,
      animal.updatedAt,
      Date.now()
    ]);
  }

  async getAnimals(): Promise<Animal[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql('SELECT * FROM animals ORDER BY name');
    const animals: Animal[] = [];

    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      animals.push({
        id: row.id,
        name: row.name,
        species: row.species,
        breed: row.breed,
        dateOfBirth: row.dateOfBirth,
        gender: row.gender,
        weight: row.currentWeight || 0,
        currentWeight: row.currentWeight,
        healthStatus: row.healthStatus,
        location: row.currentLocation || '',
        currentLocation: row.currentLocation,
        notes: row.notes,
        feedLog: [], // Empty array for offline mode
        vaccinations: [], // Empty array for offline mode
        medicalHistory: [], // Empty array for offline mode
        photos: [], // Empty array for offline mode
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        farmId: '', // Will be populated from auth context
        createdBy: '', // Will be populated from auth context
      });
    }

    return animals;
  }

  async deleteAnimal(animalId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.executeSql('DELETE FROM animals WHERE id = ?', [animalId]);
  }

  // CRUD Operations for Crops
  async saveCrop(crop: Crop): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT OR REPLACE INTO crops 
      (id, name, variety, plantingDate, expectedHarvestDate, actualHarvestDate,
       fieldLocation, status, soilType, totalYield, notes, createdAt, updatedAt, lastSync)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.executeSql(query, [
      crop.id,
      crop.name,
      crop.variety || '',
      crop.plantingDate,
      crop.expectedHarvestDate,
      crop.actualHarvestDate || '',
      crop.fieldLocation || '',
      crop.status,
      crop.soilType || '',
      crop.totalYield || 0,
      crop.notes || '',
      crop.createdAt,
      crop.updatedAt,
      Date.now()
    ]);
  }

  async getCrops(): Promise<Crop[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql('SELECT * FROM crops ORDER BY name');
    const crops: Crop[] = [];

    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      crops.push({
        id: row.id,
        name: row.name,
        variety: row.variety,
        fieldLocation: row.fieldLocation,
        plantingDate: row.plantingDate,
        expectedHarvestDate: row.expectedHarvestDate,
        actualHarvestDate: row.actualHarvestDate,
        stage: row.status || 'planted',
        status: row.status,
        area: 0, // Default area for offline mode
        soilType: row.soilType,
        totalYield: row.totalYield,
        notes: row.notes,
        fertilizerPlan: [], // Empty array for offline mode
        irrigationSchedule: [], // Empty array for offline mode
        pestControlLog: [], // Empty array for offline mode
        harvestYield: row.totalYield,
        photos: [], // Empty array for offline mode
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        farmId: '', // Will be populated from auth context
        managedBy: '', // Will be populated from auth context
      });
    }

    return crops;
  }

  async deleteCrop(cropId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.executeSql('DELETE FROM crops WHERE id = ?', [cropId]);
  }

  // CRUD Operations for Tasks
  async saveTask(task: Task): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT OR REPLACE INTO tasks 
      (id, title, description, priority, status, dueDate, assignedTo, assignedBy,
       relatedEntity, relatedEntityId, estimatedDuration, actualDuration, 
       completedAt, createdAt, updatedAt, lastSync)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.executeSql(query, [
      task.id,
      task.title,
      task.description || '',
      task.priority,
      task.status,
      task.dueDate,
      task.assignedTo,
      task.assignedBy,
      task.relatedEntity || '',
      task.relatedEntityId || '',
      task.estimatedDuration || 0,
      task.actualDuration || 0,
      task.completedAt || '',
      task.createdAt,
      task.updatedAt,
      Date.now()
    ]);
  }

  async getTasks(): Promise<Task[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql('SELECT * FROM tasks ORDER BY dueDate');
    const tasks: Task[] = [];

    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      tasks.push({
        id: row.id,
        title: row.title,
        description: row.description,
        type: 'other', // Default type for offline mode
        priority: row.priority,
        status: row.status,
        assignedTo: row.assignedTo,
        assignedBy: row.assignedBy,
        relatedEntityId: row.relatedEntityId,
        relatedEntityType: row.relatedEntity === 'animal' ? 'animal' : 'crop',
        relatedEntity: row.relatedEntity,
        dueDate: row.dueDate,
        estimatedDuration: row.estimatedDuration,
        actualDuration: row.actualDuration,
        completedAt: row.completedAt,
        proofPhotos: [], // Empty array for offline mode
        notes: row.description, // Use description as notes
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        farmId: '', // Will be populated from auth context
      });
    }

    return tasks;
  }

  async deleteTask(taskId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.executeSql('DELETE FROM tasks WHERE id = ?', [taskId]);
  }

  // Pending sync operations
  async addPendingSync(pendingSync: PendingSync): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const query = `
      INSERT INTO pending_sync (id, type, collection, data, timestamp, retries)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await this.db.executeSql(query, [
      pendingSync.id,
      pendingSync.type,
      pendingSync.collection,
      JSON.stringify(pendingSync.data),
      pendingSync.timestamp,
      0
    ]);
  }

  async getPendingSync(): Promise<PendingSync[]> {
    if (!this.db) throw new Error('Database not initialized');

    const [results] = await this.db.executeSql('SELECT * FROM pending_sync ORDER BY timestamp');
    const pendingSync: PendingSync[] = [];

    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      pendingSync.push({
        id: row.id,
        type: row.type,
        collection: row.collection,
        data: JSON.parse(row.data),
        timestamp: row.timestamp,
      });
    }

    return pendingSync;
  }

  async removePendingSync(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.executeSql('DELETE FROM pending_sync WHERE id = ?', [id]);
  }

  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = ['animals', 'crops', 'tasks', 'feeding_logs', 'crop_activities', 'pending_sync'];
    
    for (const table of tables) {
      await this.db.executeSql(`DELETE FROM ${table}`);
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

export const offlineDatabase = new OfflineDatabase();