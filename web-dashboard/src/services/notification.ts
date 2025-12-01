import { apiService } from './api';

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

export interface ChannelPreference {
  enabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  maxPerDay?: number;
}

export interface TypePreference {
  enabled: boolean;
  channels: NotificationChannel[];
  minPriority?: NotificationPriority;
}

export interface NotificationPreference {
  _id: string;
  userId: string;
  farmId?: string;
  globalEnabled: boolean;
  channels: {
    email: ChannelPreference;
    push: ChannelPreference;
    sms: ChannelPreference;
    inApp: ChannelPreference;
  };
  types: {
    [K in NotificationType]: TypePreference;
  };
  digestSettings: {
    enabled: boolean;
    frequency: 'daily' | 'weekly';
    preferredTime?: string;
    includeTypes: NotificationType[];
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

export interface NotificationListResponse {
  success: boolean;
  data: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

export interface PreferenceResponse {
  success: boolean;
  data: NotificationPreference;
}

class NotificationService {
  /**
   * Get notifications with filtering
   */
  async getNotifications(filter: NotificationFilter = {}): Promise<NotificationListResponse> {
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

      const response = await apiService.get<NotificationListResponse>(
        `/notifications?${params.toString()}`
      );
      return response.data || { success: false, data: [], pagination: { total: 0, page: 1, limit: 50, hasMore: false } };
    } catch (error) {
      // Return mock data if backend is not available
      return this.getMockNotifications(filter);
    }
  }

  /**
   * Get mock notifications for development
   */
  private getMockNotifications(filter: NotificationFilter = {}): NotificationListResponse {
    const mockNotifications: Notification[] = [
      {
        _id: '1',
        userId: 'user123',
        farmId: 'farm123',
        type: 'alert',
        priority: 'critical',
        status: 'sent',
        title: 'Equipment Maintenance Overdue',
        message: 'Tractor maintenance is 2 weeks overdue. Immediate attention required.',
        channels: ['in-app', 'email'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: '2',
        userId: 'user123',
        farmId: 'farm123',
        type: 'alert',
        priority: 'critical',
        status: 'sent',
        title: 'Irrigation System Failure',
        message: 'North field irrigation system has stopped working. Crops at risk.',
        channels: ['in-app', 'email', 'sms'],
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: '3',
        userId: 'user123',
        farmId: 'farm123',
        type: 'warning',
        priority: 'high',
        status: 'sent',
        title: 'Low Feed Stock Alert',
        message: 'Livestock feed stock is running low. Reorder recommended within 3 days.',
        channels: ['in-app', 'email'],
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: '4',
        userId: 'user123',
        farmId: 'farm123',
        type: 'weather',
        priority: 'high',
        status: 'sent',
        title: 'Severe Weather Warning',
        message: 'Heavy rain expected in the next 48 hours. Secure equipment and check drainage.',
        channels: ['in-app', 'email', 'push'],
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: '5',
        userId: 'user123',
        farmId: 'farm123',
        type: 'livestock',
        priority: 'medium',
        status: 'read',
        title: 'Vaccination Due',
        message: '15 cattle are due for vaccination next week.',
        channels: ['in-app'],
        readAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: '6',
        userId: 'user123',
        farmId: 'farm123',
        type: 'crop',
        priority: 'medium',
        status: 'sent',
        title: 'Harvest Window Opening',
        message: 'Corn crop in South field will be ready for harvest in 5-7 days.',
        channels: ['in-app', 'email'],
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: '7',
        userId: 'user123',
        farmId: 'farm123',
        type: 'equipment',
        priority: 'low',
        status: 'read',
        title: 'Equipment Inspection Scheduled',
        message: 'Annual equipment inspection scheduled for next Monday.',
        channels: ['in-app'],
        readAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: '8',
        userId: 'user123',
        farmId: 'farm123',
        type: 'financial',
        priority: 'high',
        status: 'sent',
        title: 'Invoice Payment Due',
        message: 'Feed supplier invoice of $2,500 due in 3 days.',
        channels: ['in-app', 'email'],
        createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: '9',
        userId: 'user123',
        farmId: 'farm123',
        type: 'info',
        priority: 'low',
        status: 'read',
        title: 'Weather Forecast Update',
        message: 'Sunny weather expected for the next 5 days. Good conditions for fieldwork.',
        channels: ['in-app'],
        readAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        _id: '10',
        userId: 'user123',
        farmId: 'farm123',
        type: 'reminder',
        priority: 'medium',
        status: 'sent',
        title: 'Task Reminder',
        message: 'Remember to check soil moisture levels in East field.',
        channels: ['in-app'],
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Apply filters
    let filtered = mockNotifications;

    if (filter.type) {
      const types = Array.isArray(filter.type) ? filter.type : [filter.type];
      filtered = filtered.filter(n => types.includes(n.type));
    }

    if (filter.priority) {
      const priorities = Array.isArray(filter.priority) ? filter.priority : [filter.priority];
      filtered = filtered.filter(n => priorities.includes(n.priority));
    }

    if (filter.unreadOnly) {
      filtered = filtered.filter(n => !n.readAt);
    }

    return {
      success: true,
      data: filtered,
      pagination: {
        total: filtered.length,
        page: 1,
        limit: 50,
        hasMore: false,
      },
    };
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(farmId?: string): Promise<number> {
    try {
      const params = farmId ? `?farmId=${farmId}` : '';
      const response = await apiService.get<UnreadCountResponse>(
        `/notifications/unread-count${params}`
      );
      return response.data?.count || 0;
    } catch (error) {
      // Return mock count if backend is not available
      const mockNotifications = this.getMockNotifications({ unreadOnly: true });
      return mockNotifications.data.length;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await apiService.patch<{ success: boolean; data: Notification }>(
      `/notifications/${notificationId}/read`
    );
    return response.data?.data || {} as Notification;
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<number> {
    const response = await apiService.patch<{ success: boolean; count: number }>(
      `/notifications/read-multiple`,
      { notificationIds }
    );
    return response.data?.count || 0;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(farmId?: string): Promise<number> {
    const response = await apiService.patch<{ success: boolean; count: number }>(
      `/notifications/read-all`,
      { farmId }
    );
    return response.data?.count || 0;
  }

  /**
   * Archive notification
   */
  async archiveNotification(notificationId: string): Promise<Notification> {
    const response = await apiService.patch<{ success: boolean; data: Notification }>(
      `/notifications/${notificationId}/archive`
    );
    return response.data?.data || {} as Notification;
  }

  /**
   * Get user notification preferences
   */
  async getPreferences(farmId?: string): Promise<NotificationPreference> {
    const params = farmId ? `?farmId=${farmId}` : '';
    const response = await apiService.get<PreferenceResponse>(
      `/notifications/preferences${params}`
    );
    return response.data?.data || {} as NotificationPreference;
  }

  /**
   * Update user notification preferences
   */
  async updatePreferences(
    updates: Partial<NotificationPreference>,
    farmId?: string
  ): Promise<NotificationPreference> {
    const response = await apiService.put<PreferenceResponse>(
      `/notifications/preferences`,
      { ...updates, farmId }
    );
    return response.data?.data || {} as NotificationPreference;
  }

  /**
   * Create notification (admin/system use)
   */
  async createNotification(notification: Partial<Notification>): Promise<Notification> {
    const response = await apiService.post<{ success: boolean; data: Notification }>(
      `/notifications`,
      notification
    );
    return response.data?.data || {} as Notification;
  }
}

export default new NotificationService();
