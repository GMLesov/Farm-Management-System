import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { STORAGE_KEYS } from '../config/constants';

export interface OfflineAction {
  id: string;
  type: 'task_update' | 'check_in' | 'check_out' | 'leave_request';
  data: any;
  timestamp: number;
}

class OfflineService {
  private isOnline: boolean = true;
  private listeners: Array<(isOnline: boolean) => void> = [];

  constructor() {
    this.init();
  }

  private async init() {
    // Listen to network state changes
    NetInfo.addEventListener((state: any) => {
      const wasOnline = this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      // Notify listeners
      this.listeners.forEach(listener => listener(this.isOnline));
      
      // Auto-sync when coming back online
      if (!wasOnline && this.isOnline) {
        this.syncOfflineActions();
      }
    });
  }

  public onNetworkChange(callback: (isOnline: boolean) => void) {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  public getNetworkStatus(): boolean {
    return this.isOnline;
  }

  public async queueAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): Promise<void> {
    const offlineAction: OfflineAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: Date.now()
    };

    try {
      const existingActions = await this.getOfflineActions();
      existingActions.push(offlineAction);
      await AsyncStorage.setItem(
        STORAGE_KEYS.OFFLINE_TASKS,
        JSON.stringify(existingActions)
      );
    } catch (error) {
      console.error('Failed to queue offline action:', error);
    }
  }

  public async getOfflineActions(): Promise<OfflineAction[]> {
    try {
      const actionsStr = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_TASKS);
      return actionsStr ? JSON.parse(actionsStr) : [];
    } catch (error) {
      console.error('Failed to get offline actions:', error);
      return [];
    }
  }

  public async syncOfflineActions(): Promise<{ success: number; failed: number }> {
    if (!this.isOnline) {
      return { success: 0, failed: 0 };
    }

    const actions = await this.getOfflineActions();
    if (actions.length === 0) {
      return { success: 0, failed: 0 };
    }

    let success = 0;
    let failed = 0;
    const failedActions: OfflineAction[] = [];

    for (const action of actions) {
      try {
        // Sync action with backend
        // await apiService.syncOfflineData([action]);
        success++;
      } catch (error) {
        console.error('Failed to sync action:', error);
        failed++;
        failedActions.push(action);
      }
    }

    // Save only failed actions back to storage
    await AsyncStorage.setItem(
      STORAGE_KEYS.OFFLINE_TASKS,
      JSON.stringify(failedActions)
    );

    return { success, failed };
  }

  public async clearOfflineActions(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_TASKS);
  }

  public async getPendingActionsCount(): Promise<number> {
    const actions = await this.getOfflineActions();
    return actions.length;
  }
}

export default new OfflineService();
