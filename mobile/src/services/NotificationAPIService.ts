import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';
import NetInfo from '@react-native-community/netinfo';
import PushNotification from 'react-native-push-notification';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api';

export type NotificationType = 
  | 'alert'
  | 'reminder'
  | 'warning'
  | 'info'
  | 'success'
  | 'weather'
  | 'livestock'
  | 'crop'
  | 'equipment'
  | 'financial'
  | 'irrigation';

export type NotificationPriority = 'critical' | 'high' | 'medium' | 'low';

export type NotificationChannel = 'email' | 'push' | 'sms' | 'in-app';

export type NotificationStatus = 'pending' | 'sent' | 'read' | 'archived' | 'failed';

export interface NotificationAction {
  label: string;
  type: 'link' | 'action';
  url?: string;
  actionId?: string;
  params?: Record<string, any>;
}

export interface NotificationData {
  entityType?: string;
  entityId?: string;
  entityName?: string;
  value?: number;
  threshold?: number;
  location?: string;
  customData?: Record<string, any>;
}

export interface Notification {
  _id: string;
  userId: string;
  farmId?: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  status: NotificationStatus;
  readAt?: string;
  archivedAt?: string;
  channels: NotificationChannel[];
  deliveryStatus?: {
    email?: 'pending' | 'sent' | 'failed';
    push?: 'pending' | 'sent' | 'failed';
    sms?: 'pending' | 'sent' | 'failed';
    inApp?: 'pending' | 'sent' | 'failed';
  };
  scheduledFor?: string;
  expiresAt?: string;
  actions?: NotificationAction[];
  data?: NotificationData;
  metadata?: {
    triggeredBy?: string;
    triggerCondition?: string;
    relatedNotifications?: string[];
    tags?: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface NotificationFilter {
  farmId?: string;
  type?: NotificationType | NotificationType[];
  priority?: NotificationPriority | NotificationPriority[];
  status?: string | string[];
  unreadOnly?: boolean;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

class NotificationAPIService {
  private api: AxiosInstance;
  private offlineQueue: Array<{action: string; data: any}> = [];
  private isOnline: boolean = true;
  
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    });

    // Add auth token interceptor
    this.api.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Monitor network status
    NetInfo.addEventListener((state) => {
      this.isOnline = state.isConnected || false;
      if (this.isOnline && this.offlineQueue.length > 0) {
        this.processOfflineQueue();
      }
    });

    // Initialize push notifications
    this.initializePushNotifications();
  }

  private initializePushNotifications() {
    PushNotification.configure({
      onNotification: (notification: any) => {
        console.log('Notification received:', notification);
        
        // Handle notification tap
        if (notification.userInteraction) {
          this.handleNotificationTap(notification);
        }
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  }

  private handleNotificationTap(notification: any) {
    // Navigate to relevant screen based on notification data
    if (notification.data?.entityType && notification.data?.entityId) {
      // TODO: Implement navigation logic
      console.log('Navigate to:', notification.data);
    }
  }

  /**
   * Get notifications with filtering
   */
  async getNotifications(filter: NotificationFilter = {}): Promise<{
    success: boolean;
    data: Notification[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      hasMore: boolean;
    };
  }> {
    try {
      const params = new URLSearchParams();
      
      if (filter.farmId) params.append('farmId', filter.farmId);
      if (filter.type) {
        const types = Array.isArray(filter.type) ? filter.type.join(',') : filter.type;
        params.append('type', types);
      }
      if (filter.priority) {
        const priorities = Array.isArray(filter.priority) ? filter.priority.join(',') : filter.priority;
        params.append('priority', priorities);
      }
      if (filter.status) {
        const statuses = Array.isArray(filter.status) ? filter.status.join(',') : filter.status;
        params.append('status', statuses);
      }
      if (filter.unreadOnly) params.append('unreadOnly', 'true');
      if (filter.startDate) params.append('startDate', filter.startDate.toISOString());
      if (filter.endDate) params.append('endDate', filter.endDate.toISOString());
      if (filter.page) params.append('page', filter.page.toString());
      if (filter.limit) params.append('limit', filter.limit.toString());

      const response = await this.api.get(`/notifications?${params.toString()}`);
      
      // Cache notifications locally
      await this.cacheNotifications(response.data.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      
      // Return cached data if offline
      if (!this.isOnline) {
        const cached = await this.getCachedNotifications();
        return {
          success: true,
          data: cached,
          pagination: {
            total: cached.length,
            page: 1,
            limit: 50,
            hasMore: false,
          },
        };
      }
      
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(farmId?: string): Promise<number> {
    try {
      const params = farmId ? `?farmId=${farmId}` : '';
      const response = await this.api.get(`/notifications/unread-count${params}`);
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      
      // Return cached count if offline
      if (!this.isOnline) {
        const cached = await this.getCachedNotifications();
        return cached.filter(n => !n.readAt).length;
      }
      
      return 0;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification | null> {
    try {
      const response = await this.api.patch(`/notifications/${notificationId}/read`);
      
      // Update cache
      await this.updateCachedNotification(response.data.data);
      
      return response.data.data;
    } catch (error) {
      console.error('Error marking as read:', error);
      
      // Queue for offline sync
      if (!this.isOnline) {
        this.offlineQueue.push({
          action: 'markAsRead',
          data: { notificationId },
        });
        
        // Update cache optimistically
        await this.updateCachedNotificationLocally(notificationId, { readAt: new Date().toISOString() });
      }
      
      return null;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(farmId?: string): Promise<number> {
    try {
      const response = await this.api.patch('/notifications/read-all', { farmId });
      
      // Update cache
      await this.markAllCachedAsRead();
      
      return response.data.count;
    } catch (error) {
      console.error('Error marking all as read:', error);
      
      // Queue for offline sync
      if (!this.isOnline) {
        this.offlineQueue.push({
          action: 'markAllAsRead',
          data: { farmId },
        });
        
        // Update cache optimistically
        await this.markAllCachedAsRead();
      }
      
      return 0;
    }
  }

  /**
   * Archive notification
   */
  async archiveNotification(notificationId: string): Promise<Notification | null> {
    try {
      const response = await this.api.patch(`/notifications/${notificationId}/archive`);
      
      // Update cache
      await this.updateCachedNotification(response.data.data);
      
      return response.data.data;
    } catch (error) {
      console.error('Error archiving notification:', error);
      
      // Queue for offline sync
      if (!this.isOnline) {
        this.offlineQueue.push({
          action: 'archive',
          data: { notificationId },
        });
        
        // Update cache optimistically
        await this.updateCachedNotificationLocally(notificationId, { 
          status: 'archived',
          archivedAt: new Date().toISOString(),
        });
      }
      
      return null;
    }
  }

  /**
   * Show local push notification
   */
  showLocalNotification(notification: Notification) {
    PushNotification.localNotification({
      channelId: this.getChannelId(notification.priority),
      title: notification.title,
      message: notification.message,
      playSound: notification.priority === 'critical' || notification.priority === 'high',
      soundName: 'default',
      importance: this.getImportance(notification.priority),
      priority: this.getPriorityLevel(notification.priority),
      vibrate: true,
      vibration: notification.priority === 'critical' ? 1000 : 300,
      userInfo: {
        notificationId: notification._id,
        entityType: notification.data?.entityType,
        entityId: notification.data?.entityId,
      },
    });
  }

  private getChannelId(priority: NotificationPriority): string {
    switch (priority) {
      case 'critical': return 'critical-alerts';
      case 'high': return 'high-priority';
      case 'medium': return 'medium-priority';
      case 'low': return 'low-priority';
      default: return 'default';
    }
  }

  private getImportance(priority: NotificationPriority): 'high' | 'default' | 'low' | 'min' {
    switch (priority) {
      case 'critical': return 'high';
      case 'high': return 'high';
      case 'medium': return 'default';
      case 'low': return 'low';
      default: return 'default';
    }
  }

  private getPriorityLevel(priority: NotificationPriority): 'max' | 'high' | 'default' | 'low' | 'min' {
    switch (priority) {
      case 'critical': return 'max';
      case 'high': return 'high';
      case 'medium': return 'default';
      case 'low': return 'low';
      default: return 'default';
    }
  }

  // Cache management methods
  private async cacheNotifications(notifications: Notification[]) {
    try {
      await AsyncStorage.setItem(
        'cached_notifications',
        JSON.stringify(notifications)
      );
    } catch (error) {
      console.error('Error caching notifications:', error);
    }
  }

  private async getCachedNotifications(): Promise<Notification[]> {
    try {
      const cached = await AsyncStorage.getItem('cached_notifications');
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error getting cached notifications:', error);
      return [];
    }
  }

  private async updateCachedNotification(notification: Notification) {
    try {
      const cached = await this.getCachedNotifications();
      const index = cached.findIndex(n => n._id === notification._id);
      
      if (index >= 0) {
        cached[index] = notification;
      } else {
        cached.unshift(notification);
      }
      
      await this.cacheNotifications(cached);
    } catch (error) {
      console.error('Error updating cached notification:', error);
    }
  }

  private async updateCachedNotificationLocally(
    notificationId: string,
    updates: Partial<Notification>
  ) {
    try {
      const cached = await this.getCachedNotifications();
      const index = cached.findIndex(n => n._id === notificationId);
      
      if (index >= 0) {
        cached[index] = { ...cached[index], ...updates };
        await this.cacheNotifications(cached);
      }
    } catch (error) {
      console.error('Error updating cached notification locally:', error);
    }
  }

  private async markAllCachedAsRead() {
    try {
      const cached = await this.getCachedNotifications();
      const updated = cached.map(n => ({
        ...n,
        status: 'read' as NotificationStatus,
        readAt: new Date().toISOString(),
      }));
      await this.cacheNotifications(updated);
    } catch (error) {
      console.error('Error marking all cached as read:', error);
    }
  }

  // Offline queue processing
  private async processOfflineQueue() {
    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const item of queue) {
      try {
        switch (item.action) {
          case 'markAsRead':
            await this.markAsRead(item.data.notificationId);
            break;
          case 'markAllAsRead':
            await this.markAllAsRead(item.data.farmId);
            break;
          case 'archive':
            await this.archiveNotification(item.data.notificationId);
            break;
        }
      } catch (error) {
        console.error('Error processing offline queue item:', error);
        // Re-queue failed items
        this.offlineQueue.push(item);
      }
    }
  }
}

export default new NotificationAPIService();
