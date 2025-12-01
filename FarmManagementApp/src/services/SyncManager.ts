import { AppState, AppStateStatus } from 'react-native';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';
import OfflineStorageService from './OfflineStorageService';
import MediaCaptureService from './MediaCaptureService';

export interface SyncManagerConfig {
  autoSyncInterval: number; // in milliseconds
  enableBackgroundSync: boolean;
  enableAppStateSync: boolean;
  maxRetries: number;
}

export class SyncManager {
  private static instance: SyncManager;
  private config: SyncManagerConfig;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private netInfoUnsubscribe: NetInfoSubscription | null = null;
  private isSyncing = false;
  private listeners: Array<(status: SyncStatus) => void> = [];

  constructor(config: Partial<SyncManagerConfig> = {}) {
    this.config = {
      autoSyncInterval: 30000, // 30 seconds
      enableBackgroundSync: true,
      enableAppStateSync: true,
      maxRetries: 3,
      ...config,
    };
  }

  static getInstance(config?: Partial<SyncManagerConfig>): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager(config);
    }
    return SyncManager.instance;
  }

  // Initialize sync manager
  async initialize(): Promise<void> {
    console.log('Initializing SyncManager...');

    // Listen for network state changes
    this.netInfoUnsubscribe = NetInfo.addEventListener(this.handleNetworkStateChange.bind(this));

    // Listen for app state changes
    if (this.config.enableAppStateSync) {
      AppState.addEventListener('change', this.handleAppStateChange.bind(this));
    }

    // Start auto-sync if enabled
    if (this.config.enableBackgroundSync) {
      this.startAutoSync();
    }

    // Initial sync if online
    const isOnline = await OfflineStorageService.isOnline();
    if (isOnline) {
      this.triggerSync();
    }
  }

  // Start automatic sync interval
  private startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      const isOnline = await OfflineStorageService.isOnline();
      if (isOnline && !this.isSyncing) {
        this.triggerSync();
      }
    }, this.config.autoSyncInterval);
  }

  // Stop automatic sync
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Handle network state changes
  private async handleNetworkStateChange(state: NetInfoState): Promise<void> {
    console.log('Network state changed:', state);
    
    if (state.isConnected && state.isInternetReachable && !this.isSyncing) {
      // Device came online, trigger sync
      console.log('Device came online, triggering sync...');
      this.triggerSync();
    }

    this.notifyListeners({
      isSyncing: this.isSyncing,
      isOnline: Boolean(state.isConnected && state.isInternetReachable),
      lastSyncTime: null,
      queuedActions: 0,
    });
  }

  // Handle app state changes
  private handleAppStateChange(nextAppState: AppStateStatus): void {
    console.log('App state changed to:', nextAppState);
    
    if (nextAppState === 'active') {
      // App became active, check if sync is needed
      this.checkAndSync();
    }
  }

  // Check if sync is needed and trigger if necessary
  private async checkAndSync(): Promise<void> {
    const isOnline = await OfflineStorageService.isOnline();
    const status = await OfflineStorageService.getSyncStatus();
    
    if (isOnline && status.queuedActions > 0 && !this.isSyncing) {
      this.triggerSync();
    }
  }

  // Trigger synchronization
  async triggerSync(): Promise<SyncResult> {
    if (this.isSyncing) {
      console.log('Sync already in progress, skipping...');
      return { success: 0, failed: 0, skipped: true };
    }

    this.isSyncing = true;
    console.log('Starting sync...');

    const startTime = Date.now();
    let result: SyncResult = { success: 0, failed: 0, skipped: false };

    try {
      // Notify listeners that sync started
      await this.notifyListeners({
        isSyncing: true,
        isOnline: await OfflineStorageService.isOnline(),
        lastSyncTime: null,
        queuedActions: 0,
      });

      // Perform the actual sync
      const syncResult = await OfflineStorageService.syncQueuedActions();
      result = { ...syncResult, skipped: false };

      // Sync pending media uploads
      try {
        const userId = 'current_user'; // Replace with actual user ID from auth context
        await MediaCaptureService.syncPendingUploads(userId);
        console.log('Media sync completed');
      } catch (error) {
        console.error('Media sync failed:', error);
      }

      // Update last sync time
      await OfflineStorageService.updateLastSyncTime();

      console.log('Sync completed:', result);
    } catch (error) {
      console.error('Sync failed:', error);
      result = { success: 0, failed: 1, skipped: false };
    } finally {
      this.isSyncing = false;
      
      // Notify listeners that sync completed
      const status = await OfflineStorageService.getSyncStatus();
      await this.notifyListeners({
        isSyncing: false,
        isOnline: status.isOnline,
        lastSyncTime: Date.now(),
        queuedActions: status.queuedActions,
      });
    }

    const duration = Date.now() - startTime;
    console.log(`Sync took ${duration}ms`);

    return result;
  }

  // Force sync regardless of current state
  async forceSync(): Promise<SyncResult> {
    this.isSyncing = false; // Reset sync state
    return this.triggerSync();
  }

  // Add sync status listener
  addSyncListener(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners
  private async notifyListeners(status: SyncStatus): Promise<void> {
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  // Get current sync status
  async getSyncStatus(): Promise<SyncStatus> {
    const offlineStatus = await OfflineStorageService.getSyncStatus();
    
    return {
      isSyncing: this.isSyncing,
      isOnline: offlineStatus.isOnline,
      lastSyncTime: offlineStatus.lastSyncTime,
      queuedActions: offlineStatus.queuedActions,
    };
  }

  // Clean up resources
  destroy(): void {
    this.stopAutoSync();
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
    }
    this.listeners = [];
  }
}

export interface SyncResult {
  success: number;
  failed: number;
  skipped: boolean;
}

export interface SyncStatus {
  isSyncing: boolean;
  isOnline: boolean;
  lastSyncTime: number | null;
  queuedActions: number;
}

export default SyncManager;