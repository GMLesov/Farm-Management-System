import mongoose from 'mongoose';
import { Notification, INotification, NotificationType, NotificationPriority, NotificationChannel } from '../models/Notification';
import { NotificationPreference, INotificationPreference } from '../models/NotificationPreference';
import { User } from '../models/User';

interface CreateNotificationInput {
  userId: mongoose.Types.ObjectId | string;
  farmId?: mongoose.Types.ObjectId | string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  channels?: NotificationChannel[];
  scheduledFor?: Date;
  expiresAt?: Date;
  actions?: Array<{
    label: string;
    type: 'link' | 'action';
    url?: string;
    actionId?: string;
    params?: Record<string, any>;
  }>;
  data?: {
    entityType?: string;
    entityId?: mongoose.Types.ObjectId | string;
    entityName?: string;
    value?: number;
    threshold?: number;
    location?: string;
    customData?: Record<string, any>;
  };
  metadata?: {
    triggeredBy?: string;
    triggerCondition?: string;
    tags?: string[];
  };
}

interface NotificationFilter {
  userId?: mongoose.Types.ObjectId | string;
  farmId?: mongoose.Types.ObjectId | string;
  type?: NotificationType | NotificationType[];
  priority?: NotificationPriority | NotificationPriority[];
  status?: string | string[];
  unreadOnly?: boolean;
  startDate?: Date;
  endDate?: Date;
}

export class NotificationService {
  /**
   * Create a new notification with intelligent channel selection
   */
  static async createNotification(input: CreateNotificationInput): Promise<INotification> {
    const userId = typeof input.userId === 'string' ? new mongoose.Types.ObjectId(input.userId) : input.userId;
    const farmId = input.farmId
      ? typeof input.farmId === 'string'
        ? new mongoose.Types.ObjectId(input.farmId)
        : input.farmId
      : undefined;

    // Get user preferences
    const preferences = await this.getUserPreferences(userId, farmId);
    
    // Determine channels based on preferences
    const channels = input.channels || this.determineChannels(input.type, input.priority, preferences);

    // Create notification
    const notification = new Notification({
      userId,
      farmId,
      type: input.type,
      priority: input.priority,
      title: input.title,
      message: input.message,
      channels,
      scheduledFor: input.scheduledFor,
      expiresAt: input.expiresAt,
      actions: input.actions,
      data: input.data,
      metadata: input.metadata,
      status: input.scheduledFor && input.scheduledFor > new Date() ? 'pending' : 'sent',
      deliveryStatus: this.initializeDeliveryStatus(channels),
    });

    await notification.save();

    // Schedule delivery if not scheduled for future
    if (!input.scheduledFor || input.scheduledFor <= new Date()) {
      await this.deliverNotification(notification, preferences);
    }

    return notification;
  }

  /**
   * Create bulk notifications for multiple users
   */
  static async createBulkNotifications(
    userIds: Array<mongoose.Types.ObjectId | string>,
    notificationData: Omit<CreateNotificationInput, 'userId'>
  ): Promise<INotification[]> {
    const notifications = await Promise.all(
      userIds.map((userId) =>
        this.createNotification({
          ...notificationData,
          userId,
        })
      )
    );

    return notifications;
  }

  /**
   * Get notifications with filtering and pagination
   */
  static async getNotifications(
    filter: NotificationFilter,
    options: {
      skip?: number;
      limit?: number;
      sort?: Record<string, 1 | -1>;
    } = {}
  ) {
    const query: any = {};

    if (filter.userId) {
      query.userId = typeof filter.userId === 'string' ? new mongoose.Types.ObjectId(filter.userId) : filter.userId;
    }

    if (filter.farmId) {
      query.farmId = typeof filter.farmId === 'string' ? new mongoose.Types.ObjectId(filter.farmId) : filter.farmId;
    }

    if (filter.type) {
      query.type = Array.isArray(filter.type) ? { $in: filter.type } : filter.type;
    }

    if (filter.priority) {
      query.priority = Array.isArray(filter.priority) ? { $in: filter.priority } : filter.priority;
    }

    if (filter.status) {
      query.status = Array.isArray(filter.status) ? { $in: filter.status } : filter.status;
    }

    if (filter.unreadOnly) {
      query.readAt = { $exists: false };
      query.status = { $ne: 'archived' };
    }

    if (filter.startDate || filter.endDate) {
      query.createdAt = {};
      if (filter.startDate) query.createdAt.$gte = filter.startDate;
      if (filter.endDate) query.createdAt.$lte = filter.endDate;
    }

    const { skip = 0, limit = 50, sort = { createdAt: -1 } } = options;

    const [notifications, total] = await Promise.all([
      Notification.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Notification.countDocuments(query),
    ]);

    return {
      notifications,
      total,
      hasMore: total > skip + notifications.length,
    };
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: mongoose.Types.ObjectId | string): Promise<INotification | null> {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        status: 'read',
        readAt: new Date(),
      },
      { new: true }
    );

    return notification;
  }

  /**
   * Mark multiple notifications as read
   */
  static async markMultipleAsRead(notificationIds: Array<mongoose.Types.ObjectId | string>): Promise<number> {
    const result = await Notification.updateMany(
      { _id: { $in: notificationIds } },
      {
        status: 'read',
        readAt: new Date(),
      }
    );

    return result.modifiedCount || 0;
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: mongoose.Types.ObjectId | string, farmId?: mongoose.Types.ObjectId | string): Promise<number> {
    const query: any = {
      userId: typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId,
      status: { $in: ['pending', 'sent'] },
    };

    if (farmId) {
      query.farmId = typeof farmId === 'string' ? new mongoose.Types.ObjectId(farmId) : farmId;
    }

    const result = await Notification.updateMany(query, {
      status: 'read',
      readAt: new Date(),
    });

    return result.modifiedCount || 0;
  }

  /**
   * Archive notification
   */
  static async archiveNotification(notificationId: mongoose.Types.ObjectId | string): Promise<INotification | null> {
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        status: 'archived',
        archivedAt: new Date(),
      },
      { new: true }
    );

    return notification;
  }

  /**
   * Delete old archived notifications
   */
  static async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      status: 'archived',
      archivedAt: { $lt: cutoffDate },
    });

    return result.deletedCount || 0;
  }

  /**
   * Get unread count
   */
  static async getUnreadCount(userId: mongoose.Types.ObjectId | string, farmId?: mongoose.Types.ObjectId | string): Promise<number> {
    const query: any = {
      userId: typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId,
      status: { $in: ['pending', 'sent'] },
      readAt: { $exists: false },
    };

    if (farmId) {
      query.farmId = typeof farmId === 'string' ? new mongoose.Types.ObjectId(farmId) : farmId;
    }

    return Notification.countDocuments(query);
  }

  /**
   * Get or create user notification preferences
   */
  static async getUserPreferences(
    userId: mongoose.Types.ObjectId | string,
    farmId?: mongoose.Types.ObjectId | string
  ): Promise<INotificationPreference> {
    const userIdObj = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    const farmIdObj = farmId ? (typeof farmId === 'string' ? new mongoose.Types.ObjectId(farmId) : farmId) : undefined;

    let preferences = await NotificationPreference.findOne({
      userId: userIdObj,
      farmId: farmIdObj || { $exists: false },
    });

    if (!preferences) {
      preferences = new NotificationPreference({
        userId: userIdObj,
        farmId: farmIdObj,
      });
      await preferences.save();
    }

    return preferences;
  }

  /**
   * Update user notification preferences
   */
  static async updatePreferences(
    userId: mongoose.Types.ObjectId | string,
    farmId: mongoose.Types.ObjectId | string | undefined,
    updates: Partial<INotificationPreference>
  ): Promise<INotificationPreference | null> {
    const userIdObj = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    const farmIdObj = farmId ? (typeof farmId === 'string' ? new mongoose.Types.ObjectId(farmId) : farmId) : undefined;

    const preferences = await NotificationPreference.findOneAndUpdate(
      {
        userId: userIdObj,
        farmId: farmIdObj || { $exists: false },
      },
      updates,
      { new: true, upsert: true }
    );

    return preferences;
  }

  /**
   * Determine which channels to use based on type, priority, and preferences
   */
  private static determineChannels(
    type: NotificationType,
    priority: NotificationPriority,
    preferences: INotificationPreference
  ): NotificationChannel[] {
    if (!preferences.globalEnabled) {
      return ['in-app']; // Always show in-app even if notifications are disabled
    }

    const typePrefs = preferences.types[type];
    if (!typePrefs || !typePrefs.enabled) {
      return ['in-app'];
    }

    // Check if priority meets minimum threshold
    if (typePrefs.minPriority) {
      const priorityLevels = { low: 0, medium: 1, high: 2, critical: 3 };
      if (priorityLevels[priority] < priorityLevels[typePrefs.minPriority]) {
        return ['in-app'];
      }
    }

    // Filter channels based on preferences
    const channels: NotificationChannel[] = [];
    
    for (const channel of typePrefs.channels) {
      const channelPrefs = preferences.channels[channel === 'in-app' ? 'inApp' : channel];
      if (channelPrefs && channelPrefs.enabled) {
        channels.push(channel);
      }
    }

    // Always include in-app
    if (!channels.includes('in-app')) {
      channels.push('in-app');
    }

    return channels;
  }

  /**
   * Initialize delivery status for channels
   */
  private static initializeDeliveryStatus(channels: NotificationChannel[]) {
    const status: any = {};
    
    for (const channel of channels) {
      const key = channel === 'in-app' ? 'inApp' : channel;
      status[key] = 'pending';
    }

    return status;
  }

  /**
   * Deliver notification through configured channels
   */
  private static async deliverNotification(
    notification: INotification,
    preferences: INotificationPreference
  ): Promise<void> {
    // In a real implementation, you would integrate with:
    // - Email service (SendGrid, AWS SES, etc.)
    // - Push notification service (Firebase Cloud Messaging, OneSignal, etc.)
    // - SMS service (Twilio, AWS SNS, etc.)
    
    // For now, we'll just mark in-app as sent
    if (notification.channels.includes('in-app')) {
      notification.deliveryStatus.inApp = 'sent';
      await notification.save();
    }

    // Placeholder for other channel implementations
    // TODO: Implement actual delivery services
  }
}
