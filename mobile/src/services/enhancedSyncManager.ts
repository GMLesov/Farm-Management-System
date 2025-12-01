import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';

export interface SyncJob {
  id: string;
  type: 'upload' | 'download' | 'sync';
  priority: 'low' | 'normal' | 'high';
  data: any;
  retries: number;
  maxRetries: number;
  createdAt: Date;
  lastAttempt?: Date;
  error?: string;
}

export interface SyncStats {
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
  pendingJobs: number;
  lastSyncTime: Date | null;
  syncInProgress: boolean;
}

class EnhancedSyncManager {
  private syncQueue: SyncJob[] = [];
  private isOnline = false;
  private isSyncing = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private syncCallbacks: Map<string, (job: SyncJob) => Promise<void>> = new Map();
  private stats: SyncStats = {
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    pendingJobs: 0,
    lastSyncTime: null,
    syncInProgress: false,
  };

  async initialize(): Promise<void> {
    // Load pending sync jobs from storage
    await this.loadSyncQueue();

    // Monitor network connectivity
    this.setupNetworkMonitoring();

    // Monitor app state changes
    this.setupAppStateMonitoring();

    // Start periodic sync
    this.startPeriodicSync();

    console.log('Enhanced Sync Manager initialized');
  }

  private async loadSyncQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('sync_queue');
      if (stored) {
        const jobs = JSON.parse(stored);
        this.syncQueue = jobs.map((job: any) => ({
          ...job,
          createdAt: new Date(job.createdAt),
          lastAttempt: job.lastAttempt ? new Date(job.lastAttempt) : undefined,
        }));
        this.updateStats();
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  private async saveSyncQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  private setupNetworkMonitoring(): void {
    NetInfo.addEventListener(state => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (!wasOnline && this.isOnline) {
        console.log('Network connection restored, starting sync...');
        this.processSyncQueue();
      }
    });

    // Get initial network state
    NetInfo.fetch().then(state => {
      this.isOnline = state.isConnected ?? false;
      if (this.isOnline) {
        this.processSyncQueue();
      }
    });
  }

  private setupAppStateMonitoring(): void {
    AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && this.isOnline) {
        // App became active and we're online, trigger sync
        this.processSyncQueue();
      }
    });
  }

  private startPeriodicSync(): void {
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.processSyncQueue();
      }
    }, 5 * 60 * 1000);
  }

  private stopPeriodicSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  registerSyncCallback(jobType: string, callback: (job: SyncJob) => Promise<void>): void {
    this.syncCallbacks.set(jobType, callback);
  }

  async addSyncJob(
    id: string,
    type: 'upload' | 'download' | 'sync',
    data: any,
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<void> {
    // Check if job already exists
    const existingJobIndex = this.syncQueue.findIndex(job => job.id === id);
    
    const newJob: SyncJob = {
      id,
      type,
      priority,
      data,
      retries: 0,
      maxRetries: 3,
      createdAt: new Date(),
    };

    if (existingJobIndex >= 0) {
      // Update existing job
      this.syncQueue[existingJobIndex] = newJob;
    } else {
      // Add new job
      this.syncQueue.push(newJob);
    }

    // Sort by priority (high first)
    this.syncQueue.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    this.updateStats();
    await this.saveSyncQueue();

    // Try to process immediately if online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  async removeSyncJob(jobId: string): Promise<void> {
    this.syncQueue = this.syncQueue.filter(job => job.id !== jobId);
    this.updateStats();
    await this.saveSyncQueue();
  }

  private async processSyncQueue(): Promise<void> {
    if (this.isSyncing || !this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    this.stats.syncInProgress = true;

    console.log(`Processing ${this.syncQueue.length} sync jobs...`);

    const jobsToProcess = [...this.syncQueue];

    for (const job of jobsToProcess) {
      try {
        await this.processJob(job);
        
        // Remove successful job from queue
        this.syncQueue = this.syncQueue.filter(j => j.id !== job.id);
        this.stats.completedJobs++;
        
      } catch (error) {
        console.error(`Sync job ${job.id} failed:`, error);
        
        // Update job with error and retry count
        const jobIndex = this.syncQueue.findIndex(j => j.id === job.id);
        if (jobIndex >= 0) {
          this.syncQueue[jobIndex].retries++;
          this.syncQueue[jobIndex].lastAttempt = new Date();
          this.syncQueue[jobIndex].error = error instanceof Error ? error.message : 'Unknown error';

          // Remove job if max retries exceeded
          if (this.syncQueue[jobIndex].retries >= this.syncQueue[jobIndex].maxRetries) {
            this.syncQueue.splice(jobIndex, 1);
            this.stats.failedJobs++;
          }
        }
      }

      // Check if we're still online
      const netState = await NetInfo.fetch();
      if (!netState.isConnected) {
        console.log('Network disconnected during sync');
        break;
      }
    }

    this.stats.lastSyncTime = new Date();
    this.stats.syncInProgress = false;
    this.updateStats();
    await this.saveSyncQueue();

    this.isSyncing = false;

    console.log(`Sync completed. ${this.stats.completedJobs} successful, ${this.stats.failedJobs} failed`);
  }

  private async processJob(job: SyncJob): Promise<void> {
    const callback = this.syncCallbacks.get(job.type);
    
    if (!callback) {
      throw new Error(`No callback registered for job type: ${job.type}`);
    }

    await callback(job);
  }

  private updateStats(): void {
    this.stats.totalJobs = this.syncQueue.length + this.stats.completedJobs + this.stats.failedJobs;
    this.stats.pendingJobs = this.syncQueue.length;
  }

  // Public methods for manual sync control
  async forceSyncNow(): Promise<void> {
    if (this.isOnline) {
      await this.processSyncQueue();
    } else {
      throw new Error('Cannot sync: No network connection');
    }
  }

  getSyncStats(): SyncStats {
    return { ...this.stats };
  }

  getPendingJobs(): SyncJob[] {
    return [...this.syncQueue];
  }

  isNetworkAvailable(): boolean {
    return this.isOnline;
  }

  async clearSyncQueue(): Promise<void> {
    this.syncQueue = [];
    this.stats.failedJobs = 0;
    this.stats.completedJobs = 0;
    this.stats.pendingJobs = 0;
    await this.saveSyncQueue();
  }

  // Cleanup method
  destroy(): void {
    this.stopPeriodicSync();
    this.syncCallbacks.clear();
  }
}

export const enhancedSyncManager = new EnhancedSyncManager();