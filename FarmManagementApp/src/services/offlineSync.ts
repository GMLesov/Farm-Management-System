import NetInfo from '@react-native-community/netinfo';
import { offlineDatabase, PendingSync } from './offlineDatabase';
import { firebaseService } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animal, Crop, Task } from '../types';

export interface ConnectivityState {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string | null;
  isExpensive: boolean;
}

class ConnectivityService {
  private listeners: ((state: ConnectivityState) => void)[] = [];
  private currentState: ConnectivityState = {
    isConnected: false,
    isInternetReachable: false,
    type: null,
    isExpensive: false,
  };

  async initialize(): Promise<void> {
    // Get initial connectivity state
    const state = await NetInfo.fetch();
    this.updateState(state);

    // Listen for connectivity changes
    NetInfo.addEventListener(this.handleConnectivityChange.bind(this));

    console.log('🌐 Connectivity service initialized');
  }

  private handleConnectivityChange(state: any): void {
    this.updateState(state);
  }

  private updateState(netInfoState: any): void {
    const newState: ConnectivityState = {
      isConnected: netInfoState.isConnected || false,
      isInternetReachable: netInfoState.isInternetReachable || false,
      type: netInfoState.type,
      isExpensive: netInfoState.details?.isConnectionExpensive || false,
    };

    const stateChanged = JSON.stringify(this.currentState) !== JSON.stringify(newState);
    this.currentState = newState;

    if (stateChanged) {
      console.log('🌐 Connectivity changed:', newState);
      this.notifyListeners(newState);
      
      // Trigger sync if connection is restored
      if (newState.isConnected && newState.isInternetReachable) {
        offlineSyncManager.triggerSync();
      }
    }
  }

  getState(): ConnectivityState {
    return this.currentState;
  }

  isOnline(): boolean {
    return this.currentState.isConnected && this.currentState.isInternetReachable;
  }

  addListener(callback: (state: ConnectivityState) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(state: ConnectivityState): void {
    this.listeners.forEach(listener => {
      try {
        listener(state);
      } catch (error) {
        console.error('Error in connectivity listener:', error);
      }
    });
  }
}

class OfflineSyncManager {
  private syncInProgress = false;
  private lastSyncTime = 0;
  private syncInterval = 30000; // 30 seconds between sync attempts

  async initialize(): Promise<void> {
    await offlineDatabase.initialize();
    
    // Load last sync time
    const lastSync = await AsyncStorage.getItem('lastSyncTime');
    if (lastSync) {
      this.lastSyncTime = parseInt(lastSync, 10);
    }

    console.log('📦 Offline sync manager initialized');
  }

  async triggerSync(): Promise<void> {
    if (this.syncInProgress) {
      console.log('📦 Sync already in progress, skipping...');
      return;
    }

    if (!connectivityService.isOnline()) {
      console.log('📦 No internet connection, sync skipped');
      return;
    }

    // Rate limiting
    const now = Date.now();
    if (now - this.lastSyncTime < this.syncInterval) {
      console.log('📦 Sync rate limited, waiting...');
      return;
    }

    try {
      this.syncInProgress = true;
      await this.performSync();
      this.lastSyncTime = now;
      await AsyncStorage.setItem('lastSyncTime', now.toString());
      console.log('✅ Sync completed successfully');
    } catch (error) {
      console.error('❌ Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async performSync(): Promise<void> {
    try {
      // Download data from Firebase first
      await this.downloadFromFirebase();
      
      // Upload pending changes to Firebase
      await this.uploadPendingChanges();
      
      console.log('📦 Bidirectional sync completed');
    } catch (error) {
      console.error('📦 Sync error:', error);
      throw error;
    }
  }

  private async downloadFromFirebase(): Promise<void> {
    try {
      console.log('⬇️ Downloading data from Firebase...');
      
      // Download animals
      const animals = await firebaseService.getAnimals();
      for (const animal of animals) {
        await offlineDatabase.saveAnimal(animal);
      }
      
      // Download crops
      const crops = await firebaseService.getCrops();
      for (const crop of crops) {
        await offlineDatabase.saveCrop(crop);
      }
      
      // Download tasks
      const tasks = await firebaseService.getTasks();
      for (const task of tasks) {
        await offlineDatabase.saveTask(task);
      }
      
      console.log('⬇️ Download completed');
    } catch (error) {
      console.error('❌ Download failed:', error);
      throw error;
    }
  }

  private async uploadPendingChanges(): Promise<void> {
    try {
      console.log('⬆️ Uploading pending changes...');
      
      const pendingChanges = await offlineDatabase.getPendingSync();
      
      for (const change of pendingChanges) {
        try {
          await this.processPendingChange(change);
          await offlineDatabase.removePendingSync(change.id);
          console.log(`✅ Uploaded ${change.type} for ${change.collection}`);
        } catch (error) {
          console.error(`❌ Failed to upload ${change.type} for ${change.collection}:`, error);
          // Continue with other changes even if one fails
        }
      }
      
      console.log('⬆️ Upload completed');
    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw error;
    }
  }

  private async processPendingChange(change: PendingSync): Promise<void> {
    switch (change.collection) {
      case 'animals':
        await this.processPendingAnimalChange(change);
        break;
      case 'crops':
        await this.processPendingCropChange(change);
        break;
      case 'tasks':
        await this.processPendingTaskChange(change);
        break;
      default:
        console.warn('Unknown collection:', change.collection);
    }
  }

  private async processPendingAnimalChange(change: PendingSync): Promise<void> {
    switch (change.type) {
      case 'CREATE':
        await firebaseService.createAnimal(change.data);
        break;
      case 'UPDATE':
        await firebaseService.updateAnimal(change.data.id, change.data);
        break;
      case 'DELETE':
        await firebaseService.deleteAnimal(change.data.id);
        break;
    }
  }

  private async processPendingCropChange(change: PendingSync): Promise<void> {
    switch (change.type) {
      case 'CREATE':
        await firebaseService.createCrop(change.data);
        break;
      case 'UPDATE':
        await firebaseService.updateCrop(change.data.id, change.data);
        break;
      case 'DELETE':
        await firebaseService.deleteCrop(change.data.id);
        break;
    }
  }

  private async processPendingTaskChange(change: PendingSync): Promise<void> {
    switch (change.type) {
      case 'CREATE':
        await firebaseService.createTask(change.data);
        break;
      case 'UPDATE':
        await firebaseService.updateTask(change.data.id, change.data);
        break;
      case 'DELETE':
        await firebaseService.deleteTask(change.data.id);
        break;
    }
  }

  // CRUD operations that work offline-first
  async createAnimal(animal: Animal): Promise<void> {
    // Save to local database immediately
    await offlineDatabase.saveAnimal(animal);
    
    // Queue for sync when online
    await offlineDatabase.addPendingSync({
      id: `animal_create_${animal.id}_${Date.now()}`,
      type: 'CREATE',
      collection: 'animals',
      data: animal,
      timestamp: Date.now(),
    });

    // Try immediate sync if online
    if (connectivityService.isOnline()) {
      this.triggerSync();
    }
  }

  async updateAnimal(animalId: string, updates: Partial<Animal>): Promise<void> {
    // Get current animal from local database
    const animals = await offlineDatabase.getAnimals();
    const animal = animals.find(a => a.id === animalId);
    
    if (animal) {
      const updatedAnimal = { ...animal, ...updates, updatedAt: new Date().toISOString() };
      await offlineDatabase.saveAnimal(updatedAnimal);
      
      // Queue for sync
      await offlineDatabase.addPendingSync({
        id: `animal_update_${animalId}_${Date.now()}`,
        type: 'UPDATE',
        collection: 'animals',
        data: updatedAnimal,
        timestamp: Date.now(),
      });

      if (connectivityService.isOnline()) {
        this.triggerSync();
      }
    }
  }

  async deleteAnimal(animalId: string): Promise<void> {
    await offlineDatabase.deleteAnimal(animalId);
    
    await offlineDatabase.addPendingSync({
      id: `animal_delete_${animalId}_${Date.now()}`,
      type: 'DELETE',
      collection: 'animals',
      data: { id: animalId },
      timestamp: Date.now(),
    });

    if (connectivityService.isOnline()) {
      this.triggerSync();
    }
  }

  // Similar methods for crops and tasks
  async createCrop(crop: Crop): Promise<void> {
    await offlineDatabase.saveCrop(crop);
    
    await offlineDatabase.addPendingSync({
      id: `crop_create_${crop.id}_${Date.now()}`,
      type: 'CREATE',
      collection: 'crops',
      data: crop,
      timestamp: Date.now(),
    });

    if (connectivityService.isOnline()) {
      this.triggerSync();
    }
  }

  async createTask(task: Task): Promise<void> {
    await offlineDatabase.saveTask(task);
    
    await offlineDatabase.addPendingSync({
      id: `task_create_${task.id}_${Date.now()}`,
      type: 'CREATE',
      collection: 'tasks',
      data: task,
      timestamp: Date.now(),
    });

    if (connectivityService.isOnline()) {
      this.triggerSync();
    }
  }

  // Get data (always from local database for speed)
  async getAnimals(): Promise<Animal[]> {
    return await offlineDatabase.getAnimals();
  }

  async getCrops(): Promise<Crop[]> {
    return await offlineDatabase.getCrops();
  }

  async getTasks(): Promise<Task[]> {
    return await offlineDatabase.getTasks();
  }

  // Utility methods
  async getPendingSyncCount(): Promise<number> {
    const pending = await offlineDatabase.getPendingSync();
    return pending.length;
  }

  async clearOfflineData(): Promise<void> {
    await offlineDatabase.clearAllData();
    console.log('🧹 Offline data cleared');
  }

  isSyncInProgress(): boolean {
    return this.syncInProgress;
  }
}

// Export singleton instances
export const connectivityService = new ConnectivityService();
export const offlineSyncManager = new OfflineSyncManager();