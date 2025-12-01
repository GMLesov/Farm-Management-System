import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import firestore from '@react-native-firebase/firestore';

export interface OfflineAction {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  collection: string;
  documentId?: string;
  data: any;
  timestamp: number;
  userId: string;
  synced: boolean;
  retryCount: number;
}

export interface OfflineData {
  [key: string]: any;
}

export class OfflineStorageService {
  private static readonly OFFLINE_ACTIONS_KEY = '@farm_app_offline_actions';
  private static readonly OFFLINE_DATA_KEY = '@farm_app_offline_data';
  private static readonly MAX_RETRY_COUNT = 3;
  
  // Store an action for later sync
  static async queueAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'synced' | 'retryCount'>): Promise<void> {
    try {
      const offlineAction: OfflineAction = {
        ...action,
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        synced: false,
        retryCount: 0,
      };

      const existingActions = await this.getQueuedActions();
      existingActions.push(offlineAction);
      
      await AsyncStorage.setItem(
        this.OFFLINE_ACTIONS_KEY,
        JSON.stringify(existingActions)
      );

      console.log('Action queued for offline sync:', offlineAction);
    } catch (error) {
      console.error('Error queueing offline action:', error);
    }
  }

  // Get all queued actions
  static async getQueuedActions(): Promise<OfflineAction[]> {
    try {
      const actionsJson = await AsyncStorage.getItem(this.OFFLINE_ACTIONS_KEY);
      return actionsJson ? JSON.parse(actionsJson) : [];
    } catch (error) {
      console.error('Error getting queued actions:', error);
      return [];
    }
  }

  // Store data locally for offline access
  static async storeOfflineData(collection: string, data: OfflineData[]): Promise<void> {
    try {
      const existingData = await this.getOfflineData();
      existingData[collection] = data;
      
      await AsyncStorage.setItem(
        this.OFFLINE_DATA_KEY,
        JSON.stringify(existingData)
      );
    } catch (error) {
      console.error('Error storing offline data:', error);
    }
  }

  // Get offline data for a collection
  static async getOfflineData(collection?: string): Promise<any> {
    try {
      const dataJson = await AsyncStorage.getItem(this.OFFLINE_DATA_KEY);
      const allData = dataJson ? JSON.parse(dataJson) : {};
      
      return collection ? (allData[collection] || []) : allData;
    } catch (error) {
      console.error('Error getting offline data:', error);
      return collection ? [] : {};
    }
  }

  // Sync queued actions when online
  static async syncQueuedActions(): Promise<{ success: number; failed: number }> {
    const results = { success: 0, failed: 0 };
    
    try {
      const queuedActions = await this.getQueuedActions();
      const unsynced = queuedActions.filter(action => !action.synced);
      
      console.log(`Syncing ${unsynced.length} queued actions...`);

      for (const action of unsynced) {
        try {
          await this.executeAction(action);
          action.synced = true;
          results.success++;
          console.log('Action synced successfully:', action.id);
        } catch (error) {
          action.retryCount++;
          results.failed++;
          console.error('Failed to sync action:', action.id, error);
          
          // Remove actions that have exceeded retry limit
          if (action.retryCount >= this.MAX_RETRY_COUNT) {
            console.log('Action exceeded retry limit, removing:', action.id);
          }
        }
      }

      // Update stored actions (remove successfully synced and failed beyond retry limit)
      const updatedActions = queuedActions.filter(
        action => !action.synced && action.retryCount < this.MAX_RETRY_COUNT
      );
      
      await AsyncStorage.setItem(
        this.OFFLINE_ACTIONS_KEY,
        JSON.stringify(updatedActions)
      );

    } catch (error) {
      console.error('Error during sync:', error);
    }

    return results;
  }

  // Execute a queued action
  private static async executeAction(action: OfflineAction): Promise<void> {
    const { type, collection, documentId, data } = action;

    switch (type) {
      case 'CREATE':
        if (documentId) {
          await firestore().collection(collection).doc(documentId).set(data);
        } else {
          await firestore().collection(collection).add(data);
        }
        break;

      case 'UPDATE':
        if (!documentId) throw new Error('Document ID required for UPDATE action');
        await firestore().collection(collection).doc(documentId).update(data);
        break;

      case 'DELETE':
        if (!documentId) throw new Error('Document ID required for DELETE action');
        await firestore().collection(collection).doc(documentId).delete();
        break;

      default:
        throw new Error(`Unknown action type: ${type}`);
    }
  }

  // Check if device is online
  static async isOnline(): Promise<boolean> {
    const netInfo = await NetInfo.fetch();
    return Boolean(netInfo.isConnected && netInfo.isInternetReachable);
  }

  // Clear all offline data
  static async clearOfflineData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.OFFLINE_ACTIONS_KEY,
        this.OFFLINE_DATA_KEY,
      ]);
      console.log('Offline data cleared');
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }

  // Get sync status
  static async getSyncStatus(): Promise<{
    queuedActions: number;
    lastSyncTime: number | null;
    isOnline: boolean;
  }> {
    const queuedActions = await this.getQueuedActions();
    const unsynced = queuedActions.filter(action => !action.synced);
    const isOnline = await this.isOnline();
    
    // Get last sync time from stored data
    const lastSyncTime = await AsyncStorage.getItem('@farm_app_last_sync');
    
    return {
      queuedActions: unsynced.length,
      lastSyncTime: lastSyncTime ? parseInt(lastSyncTime, 10) : null,
      isOnline,
    };
  }

  // Update last sync time
  static async updateLastSyncTime(): Promise<void> {
    try {
      await AsyncStorage.setItem('@farm_app_last_sync', Date.now().toString());
    } catch (error) {
      console.error('Error updating last sync time:', error);
    }
  }

  // Merge offline and online data (conflict resolution)
  static mergeData(offlineData: any, onlineData: any): any {
    // Simple last-write-wins strategy
    // In production, you might want more sophisticated conflict resolution
    if (!offlineData) return onlineData;
    if (!onlineData) return offlineData;
    
    // Compare timestamps if available
    const offlineTimestamp = offlineData.updatedAt || offlineData.timestamp || 0;
    const onlineTimestamp = onlineData.updatedAt || onlineData.timestamp || 0;
    
    return offlineTimestamp > onlineTimestamp ? offlineData : onlineData;
  }
}

export default OfflineStorageService;