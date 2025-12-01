// IndexedDB Manager
// Advanced offline storage for tasks, cache, and sync queue

interface DBConfig {
  name: string;
  version: number;
  stores: {
    name: string;
    keyPath: string;
    indexes?: { name: string; keyPath: string; unique?: boolean }[];
  }[];
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private dbName: string = 'FarmManagementDB';
  private version: number = 1;

  async initialize(config?: Partial<DBConfig>): Promise<void> {
    if (config?.name) this.dbName = config.name;
    if (config?.version) this.version = config.version;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('[IndexedDB] Open failed:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('[IndexedDB] Opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        console.log('[IndexedDB] Upgrading database...');

        // Create object stores
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { keyPath: '_id' });
          taskStore.createIndex('status', 'status', { unique: false });
          taskStore.createIndex('priority', 'priority', { unique: false });
          taskStore.createIndex('assignedTo', 'assignedTo', { unique: false });
          taskStore.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains('leaves')) {
          const leaveStore = db.createObjectStore('leaves', { keyPath: '_id' });
          leaveStore.createIndex('status', 'status', { unique: false });
          leaveStore.createIndex('startDate', 'startDate', { unique: false });
        }

        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          syncStore.createIndex('type', 'type', { unique: false });
        }

        if (!db.objectStoreNames.contains('cache')) {
          const cacheStore = db.createObjectStore('cache', { keyPath: 'key' });
          cacheStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        if (!db.objectStoreNames.contains('photos')) {
          const photoStore = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
          photoStore.createIndex('taskId', 'taskId', { unique: false });
          photoStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // Generic CRUD operations
  async add(storeName: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async get(storeName: string, key: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll(storeName: string, indexName?: string, value?: any): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      
      let request: IDBRequest;
      if (indexName && value !== undefined) {
        const index = store.index(indexName);
        request = index.getAll(value);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update(storeName: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Task-specific methods
  async saveTasks(tasks: any[]): Promise<void> {
    for (const task of tasks) {
      await this.update('tasks', task);
    }
  }

  async getTasks(status?: string): Promise<any[]> {
    if (status) {
      return await this.getAll('tasks', 'status', status);
    }
    return await this.getAll('tasks');
  }

  async saveTask(task: any): Promise<void> {
    await this.update('tasks', task);
  }

  // Leave request methods
  async saveLeaveRequests(leaves: any[]): Promise<void> {
    for (const leave of leaves) {
      await this.update('leaves', leave);
    }
  }

  async getLeaveRequests(): Promise<any[]> {
    return await this.getAll('leaves');
  }

  // Sync queue methods
  async addToSyncQueue(action: any): Promise<void> {
    const queueItem = {
      ...action,
      timestamp: new Date().toISOString()
    };
    await this.add('syncQueue', queueItem);
  }

  async getSyncQueue(): Promise<any[]> {
    return await this.getAll('syncQueue');
  }

  async clearSyncQueue(): Promise<void> {
    await this.clear('syncQueue');
  }

  async removeFromSyncQueue(id: number): Promise<void> {
    await this.delete('syncQueue', id);
  }

  // Photo storage methods
  async savePhoto(photo: { taskId?: string; data: Blob; timestamp: string }): Promise<number> {
    return await this.add('photos', photo) as number;
  }

  async getPhotos(taskId?: string): Promise<any[]> {
    if (taskId) {
      return await this.getAll('photos', 'taskId', taskId);
    }
    return await this.getAll('photos');
  }

  async deletePhoto(id: number): Promise<void> {
    await this.delete('photos', id);
  }

  // Cache methods
  async setCache(key: string, data: any, ttl?: number): Promise<void> {
    const cacheItem = {
      key,
      data,
      timestamp: Date.now(),
      ttl: ttl || 3600000 // 1 hour default
    };
    await this.update('cache', cacheItem);
  }

  async getCache(key: string): Promise<any | null> {
    const item = await this.get('cache', key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      await this.delete('cache', key);
      return null;
    }

    return item.data;
  }

  async clearExpiredCache(): Promise<void> {
    const allCache = await this.getAll('cache');
    const now = Date.now();
    
    for (const item of allCache) {
      if (now - item.timestamp > item.ttl) {
        await this.delete('cache', item.key);
      }
    }
  }

  // Database management
  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      console.log('[IndexedDB] Closed');
    }
  }

  async deleteDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.close();
      const request = indexedDB.deleteDatabase(this.dbName);
      
      request.onsuccess = () => {
        console.log('[IndexedDB] Database deleted');
        resolve();
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  isInitialized(): boolean {
    return this.db !== null;
  }
}

export const dbManager = new IndexedDBManager();
export default dbManager;
