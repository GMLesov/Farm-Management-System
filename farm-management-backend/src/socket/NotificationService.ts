import { socketServer } from './SocketServer';

export interface NotificationData {
  id: string;
  type: 'animal_health' | 'feed_alert' | 'veterinary_reminder' | 'breeding_update' | 'system_alert';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  farmId: string;
  entityId?: string; // animalId, feedId, etc.
  entityType?: 'animal' | 'feed' | 'veterinary' | 'breeding';
  actionRequired?: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  expiresAt?: Date;
}

export interface RealTimeUpdate {
  type: 'create' | 'update' | 'delete';
  entity: 'animal' | 'feed' | 'veterinary' | 'breeding' | 'farm' | 'user';
  entityId: string;
  farmId: string;
  data: any;
  userId?: string;
  timestamp: Date;
}

class NotificationService {
  private notifications: Map<string, NotificationData> = new Map();
  private notificationCounter: number = 0;

  // Animal Health Notifications
  async notifyAnimalHealthChange(
    farmId: string,
    animalId: string,
    animalTag: string,
    oldStatus: string,
    newStatus: string,
    details?: string
  ): Promise<void> {
    const severity = this.getHealthStatusSeverity(newStatus);
    
    const notification: NotificationData = {
      id: `health_${animalId}_${Date.now()}_${++this.notificationCounter}`,
      type: 'animal_health',
      title: 'Animal Health Status Changed',
      message: `${animalTag} status changed from ${oldStatus} to ${newStatus}${details ? ': ' + details : ''}`,
      severity,
      farmId,
      entityId: animalId,
      entityType: 'animal',
      actionRequired: severity === 'high' || severity === 'critical',
      actionUrl: `/animals/${animalId}`,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    this.storeAndEmitNotification(notification);
    
    // Also emit to animal-specific subscribers
    socketServer.emitToAnimal(animalId, 'animal:health-changed', {
      animalId,
      animalTag,
      oldStatus,
      newStatus,
      details,
      timestamp: new Date(),
    });
  }

  // Feed Stock Alerts
  async notifyLowFeedStock(
    farmId: string,
    feedId: string,
    feedName: string,
    currentStock: number,
    reorderPoint: number,
    unit: string
  ): Promise<void> {
    const notification: NotificationData = {
      id: `feed_low_${feedId}_${Date.now()}_${++this.notificationCounter}`,
      type: 'feed_alert',
      title: 'Low Feed Stock Alert',
      message: `${feedName} is running low: ${currentStock} ${unit} remaining (reorder at ${reorderPoint} ${unit})`,
      severity: currentStock <= reorderPoint * 0.5 ? 'high' : 'medium',
      farmId,
      entityId: feedId,
      entityType: 'feed',
      actionRequired: true,
      actionUrl: `/feed/${feedId}`,
      metadata: { currentStock, reorderPoint, unit },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    };

    this.storeAndEmitNotification(notification);
  }

  // Feed Expiry Alerts
  async notifyFeedExpiry(
    farmId: string,
    feedId: string,
    feedName: string,
    expiryDate: Date,
    daysUntilExpiry: number
  ): Promise<void> {
    const severity = daysUntilExpiry <= 3 ? 'high' : daysUntilExpiry <= 7 ? 'medium' : 'low';
    
    const notification: NotificationData = {
      id: `feed_expiry_${feedId}_${Date.now()}_${++this.notificationCounter}`,
      type: 'feed_alert',
      title: 'Feed Expiry Warning',
      message: `${feedName} expires in ${daysUntilExpiry} days (${expiryDate.toLocaleDateString()})`,
      severity,
      farmId,
      entityId: feedId,
      entityType: 'feed',
      actionRequired: daysUntilExpiry <= 7,
      actionUrl: `/feed/${feedId}`,
      metadata: { expiryDate, daysUntilExpiry },
      timestamp: new Date(),
      expiresAt: expiryDate,
    };

    this.storeAndEmitNotification(notification);
  }

  // Veterinary Reminders
  async notifyVeterinaryAppointment(
    farmId: string,
    recordId: string,
    animalTag: string,
    appointmentType: string,
    scheduledDate: Date,
    hoursUntil: number
  ): Promise<void> {
    const severity = hoursUntil <= 2 ? 'high' : hoursUntil <= 24 ? 'medium' : 'low';
    
    const notification: NotificationData = {
      id: `vet_reminder_${recordId}_${Date.now()}_${++this.notificationCounter}`,
      type: 'veterinary_reminder',
      title: 'Veterinary Appointment Reminder',
      message: `${appointmentType} for ${animalTag} scheduled in ${Math.round(hoursUntil)} hours (${scheduledDate.toLocaleString()})`,
      severity,
      farmId,
      entityId: recordId,
      entityType: 'veterinary',
      actionRequired: hoursUntil <= 24,
      actionUrl: `/veterinary/${recordId}`,
      metadata: { appointmentType, scheduledDate, hoursUntil },
      timestamp: new Date(),
      expiresAt: scheduledDate,
    };

    this.storeAndEmitNotification(notification);
  }

  // Breeding Updates
  async notifyBreedingEvent(
    farmId: string,
    recordId: string,
    motherTag: string,
    eventType: 'pregnancy_confirmed' | 'birth_expected' | 'birth_occurred' | 'weaning_due',
    eventDate: Date,
    details?: string
  ): Promise<void> {
    const eventMessages = {
      pregnancy_confirmed: `Pregnancy confirmed for ${motherTag}`,
      birth_expected: `Birth expected for ${motherTag} on ${eventDate.toLocaleDateString()}`,
      birth_occurred: `Birth occurred for ${motherTag}`,
      weaning_due: `Weaning due for ${motherTag}'s offspring`,
    };

    const notification: NotificationData = {
      id: `breeding_${eventType}_${recordId}_${Date.now()}_${++this.notificationCounter}`,
      type: 'breeding_update',
      title: 'Breeding Update',
      message: eventMessages[eventType] + (details ? ': ' + details : ''),
      severity: eventType === 'birth_expected' || eventType === 'birth_occurred' ? 'high' : 'medium',
      farmId,
      entityId: recordId,
      entityType: 'breeding',
      actionRequired: eventType === 'birth_expected' || eventType === 'weaning_due',
      actionUrl: `/breeding/${recordId}`,
      metadata: { eventType, eventDate, motherTag },
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    };

    this.storeAndEmitNotification(notification);
  }

  // Real-time Data Updates
  async broadcastDataUpdate(update: RealTimeUpdate): Promise<void> {
    // Emit to farm
    socketServer.emitToFarm(update.farmId, 'data:update', update);

    // Emit to specific entity subscribers if applicable
    if (update.entity === 'animal' && update.entityId) {
      socketServer.emitToAnimal(update.entityId, `animal:${update.type}`, update);
    }

    console.log(`📡 Broadcasted data update: ${update.entity} ${update.type} for farm ${update.farmId}`);
  }

  // System Alerts
  async notifySystemAlert(
    farmId: string,
    title: string,
    message: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    const notification: NotificationData = {
      id: `system_${Date.now()}_${++this.notificationCounter}`,
      type: 'system_alert',
      title,
      message,
      severity,
      farmId,
      actionRequired: severity === 'high' || severity === 'critical',
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    this.storeAndEmitNotification(notification);
  }

  // Helper Methods
  private getHealthStatusSeverity(status: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (status.toLowerCase()) {
      case 'critical':
      case 'emergency':
        return 'critical';
      case 'sick':
      case 'injured':
        return 'high';
      case 'monitoring':
      case 'treatment':
        return 'medium';
      default:
        return 'low';
    }
  }

  private storeAndEmitNotification(notification: NotificationData): void {
    // Store notification
    this.notifications.set(notification.id, notification);

    // Emit to farm
    socketServer.emitToFarm(notification.farmId, 'notification:new', notification);

    // Clean up expired notifications
    this.cleanupExpiredNotifications();
  }

  private cleanupExpiredNotifications(): void {
    const now = new Date();
    for (const [id, notification] of this.notifications.entries()) {
      if (notification.expiresAt && notification.expiresAt < now) {
        this.notifications.delete(id);
      }
    }
  }

  // Get notifications for a farm
  getFarmNotifications(farmId: string, limit?: number): NotificationData[] {
    const farmNotifications = Array.from(this.notifications.values())
      .filter(notification => notification.farmId === farmId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return limit ? farmNotifications.slice(0, limit) : farmNotifications;
  }

  // Mark notification as read
  markNotificationRead(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.metadata = { ...notification.metadata, read: true };
      return true;
    }
    return false;
  }

  // Clear notification
  clearNotification(notificationId: string): boolean {
    return this.notifications.delete(notificationId);
  }

  // Get unread notification count
  getUnreadCount(farmId: string): number {
    return Array.from(this.notifications.values())
      .filter(notification => 
        notification.farmId === farmId && 
        !notification.metadata?.read
      ).length;
  }
}

export const notificationService = new NotificationService();
export default notificationService;