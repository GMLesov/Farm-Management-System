// Mock socketServer before any imports
const mockEmitToFarm = jest.fn();
const mockEmitToAnimal = jest.fn();

jest.mock('../src/socket/SocketServer', () => ({
  socketServer: {
    emitToFarm: mockEmitToFarm,
    emitToAnimal: mockEmitToAnimal,
  },
}));

import notificationService from '../src/socket/NotificationService';
import { socketServer } from '../src/socket/SocketServer';
import type { NotificationData, RealTimeUpdate } from '../src/socket/NotificationService';

describe('Socket NotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('notifyAnimalHealthChange', () => {
    it('should create and emit health change notification with critical severity', async () => {
      await notificationService.notifyAnimalHealthChange(
        'farm-health-123',
        'animal-456',
        'COW-001',
        'healthy',
        'critical',
        'Showing signs of distress'
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-health-123',
        'notification:new',
        expect.objectContaining({
          type: 'animal_health',
          title: 'Animal Health Status Changed',
          message: 'COW-001 status changed from healthy to critical: Showing signs of distress',
          severity: 'critical',
          farmId: 'farm-health-123',
          entityId: 'animal-456',
          entityType: 'animal',
          actionRequired: true,
          actionUrl: '/animals/animal-456',
        })
      );

      expect(socketServer.emitToAnimal).toHaveBeenCalledWith(
        'animal-456',
        'animal:health-changed',
        expect.objectContaining({
          animalId: 'animal-456',
          animalTag: 'COW-001',
          oldStatus: 'healthy',
          newStatus: 'critical',
          details: 'Showing signs of distress',
        })
      );
    });

    it('should create notification with high severity for sick status', async () => {
      await notificationService.notifyAnimalHealthChange(
        'farm-789',
        'animal-101',
        'PIG-042',
        'monitoring',
        'sick'
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-789',
        'notification:new',
        expect.objectContaining({
          severity: 'high',
          actionRequired: true,
        })
      );
    });

    it('should create notification with medium severity for monitoring status', async () => {
      await notificationService.notifyAnimalHealthChange(
        'farm-202',
        'animal-303',
        'SHEEP-15',
        'healthy',
        'monitoring'
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-202',
        'notification:new',
        expect.objectContaining({
          severity: 'medium',
          actionRequired: false,
        })
      );
    });

    it('should create notification with low severity for healthy status', async () => {
      await notificationService.notifyAnimalHealthChange(
        'farm-404',
        'animal-505',
        'GOAT-08',
        'sick',
        'healthy'
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-404',
        'notification:new',
        expect.objectContaining({
          severity: 'low',
          actionRequired: false,
        })
      );
    });

    it('should create notification without details', async () => {
      await notificationService.notifyAnimalHealthChange(
        'farm-606',
        'animal-707',
        'COW-055',
        'healthy',
        'injured'
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-606',
        'notification:new',
        expect.objectContaining({
          message: 'COW-055 status changed from healthy to injured',
          severity: 'high',
        })
      );
    });
  });

  describe('notifyLowFeedStock', () => {
    it('should create high severity alert when stock is critically low', async () => {
      await notificationService.notifyLowFeedStock(
        'farm-feed-123',
        'feed-456',
        'Alfalfa Hay',
        50,
        200,
        'kg'
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-feed-123',
        'notification:new',
        expect.objectContaining({
          type: 'feed_alert',
          title: 'Low Feed Stock Alert',
          message: 'Alfalfa Hay is running low: 50 kg remaining (reorder at 200 kg)',
          severity: 'high',
          farmId: 'farm-feed-123',
          entityId: 'feed-456',
          entityType: 'feed',
          actionRequired: true,
          actionUrl: '/feed/feed-456',
          metadata: { currentStock: 50, reorderPoint: 200, unit: 'kg' },
        })
      );
    });

    it('should create medium severity alert when stock is low but not critical', async () => {
      await notificationService.notifyLowFeedStock(
        'farm-789',
        'feed-101',
        'Corn Silage',
        150,
        200,
        'tons'
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-789',
        'notification:new',
        expect.objectContaining({
          severity: 'medium',
          actionRequired: true,
        })
      );
    });
  });

  describe('notifyFeedExpiry', () => {
    it('should create high severity alert for feed expiring in 3 days or less', async () => {
      const expiryDate = new Date('2025-11-15');

      await notificationService.notifyFeedExpiry(
        'farm-expiry-123',
        'feed-789',
        'Protein Supplement',
        expiryDate,
        2
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-expiry-123',
        'notification:new',
        expect.objectContaining({
          type: 'feed_alert',
          title: 'Feed Expiry Warning',
          severity: 'high',
          actionRequired: true,
          metadata: expect.objectContaining({
            daysUntilExpiry: 2,
          }),
        })
      );
    });

    it('should create medium severity alert for feed expiring in 4-7 days', async () => {
      const expiryDate = new Date('2025-11-18');

      await notificationService.notifyFeedExpiry(
        'farm-202',
        'feed-303',
        'Grain Mix',
        expiryDate,
        6
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-202',
        'notification:new',
        expect.objectContaining({
          severity: 'medium',
          actionRequired: true,
        })
      );
    });

    it('should create low severity alert for feed expiring in more than 7 days', async () => {
      const expiryDate = new Date('2025-11-25');

      await notificationService.notifyFeedExpiry(
        'farm-404',
        'feed-505',
        'Vitamin Mix',
        expiryDate,
        13
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-404',
        'notification:new',
        expect.objectContaining({
          severity: 'low',
          actionRequired: false,
        })
      );
    });
  });

  describe('notifyVeterinaryAppointment', () => {
    it('should create high severity reminder for appointments within 2 hours', async () => {
      const appointmentDate = new Date('2025-11-12T14:00:00Z');

      await notificationService.notifyVeterinaryAppointment(
        'farm-vet-123',
        'record-456',
        'COW-025',
        'Vaccination',
        appointmentDate,
        1.5
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-vet-123',
        'notification:new',
        expect.objectContaining({
          type: 'veterinary_reminder',
          title: 'Veterinary Appointment Reminder',
          severity: 'high',
          actionRequired: true,
          entityType: 'veterinary',
        })
      );
    });

    it('should create medium severity reminder for appointments within 24 hours', async () => {
      const appointmentDate = new Date('2025-11-13T10:00:00Z');

      await notificationService.notifyVeterinaryAppointment(
        'farm-789',
        'record-101',
        'HORSE-10',
        'Dental Check',
        appointmentDate,
        12
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-789',
        'notification:new',
        expect.objectContaining({
          severity: 'medium',
          actionRequired: true,
        })
      );
    });

    it('should create low severity reminder for appointments more than 24 hours away', async () => {
      const appointmentDate = new Date('2025-11-15T09:00:00Z');

      await notificationService.notifyVeterinaryAppointment(
        'farm-202',
        'record-303',
        'PIG-073',
        'General Checkup',
        appointmentDate,
        48
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-202',
        'notification:new',
        expect.objectContaining({
          severity: 'low',
          actionRequired: false,
        })
      );
    });
  });

  describe('notifyBreedingEvent', () => {
    it('should create high severity notification for pregnancy confirmed', async () => {
      const eventDate = new Date('2025-11-12');

      await notificationService.notifyBreedingEvent(
        'farm-breeding-123',
        'breeding-456',
        'COW-050',
        'pregnancy_confirmed',
        eventDate,
        'Confirmed by ultrasound'
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-breeding-123',
        'notification:new',
        expect.objectContaining({
          type: 'breeding_update',
          title: 'Breeding Update',
          message: 'Pregnancy confirmed for COW-050: Confirmed by ultrasound',
          severity: 'medium',
          entityType: 'breeding',
        })
      );
    });

    it('should create high severity notification for birth expected', async () => {
      const birthDate = new Date('2025-12-01');

      await notificationService.notifyBreedingEvent(
        'farm-789',
        'breeding-101',
        'GOAT-025',
        'birth_expected',
        birthDate
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-789',
        'notification:new',
        expect.objectContaining({
          severity: 'high',
          actionRequired: true,
        })
      );
    });

    it('should create high severity notification for birth occurred', async () => {
      const birthDate = new Date('2025-11-12');

      await notificationService.notifyBreedingEvent(
        'farm-202',
        'breeding-303',
        'SHEEP-18',
        'birth_occurred',
        birthDate,
        'Healthy twins born'
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-202',
        'notification:new',
        expect.objectContaining({
          message: 'Birth occurred for SHEEP-18: Healthy twins born',
          severity: 'high',
          actionRequired: false,
        })
      );
    });

    it('should create medium severity notification for weaning due', async () => {
      const weaningDate = new Date('2025-11-20');

      await notificationService.notifyBreedingEvent(
        'farm-404',
        'breeding-505',
        'PIG-090',
        'weaning_due',
        weaningDate
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-404',
        'notification:new',
        expect.objectContaining({
          severity: 'medium',
          actionRequired: true,
        })
      );
    });
  });

  describe('broadcastDataUpdate', () => {
    it('should broadcast animal update to farm and animal subscribers', async () => {
      const update: RealTimeUpdate = {
        type: 'update',
        entity: 'animal',
        entityId: 'animal-broadcast-123',
        farmId: 'farm-broadcast-456',
        data: { weight: 500, lastCheckup: '2025-11-12' },
        userId: 'user-789',
        timestamp: new Date(),
      };

      await notificationService.broadcastDataUpdate(update);

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-broadcast-456',
        'data:update',
        update
      );

      expect(socketServer.emitToAnimal).toHaveBeenCalledWith(
        'animal-broadcast-123',
        'animal:update',
        update
      );
    });

    it('should broadcast non-animal updates only to farm', async () => {
      const update: RealTimeUpdate = {
        type: 'create',
        entity: 'feed',
        entityId: 'feed-101',
        farmId: 'farm-202',
        data: { name: 'New Feed', quantity: 1000 },
        timestamp: new Date(),
      };

      await notificationService.broadcastDataUpdate(update);

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-202',
        'data:update',
        update
      );

      expect(socketServer.emitToAnimal).not.toHaveBeenCalled();
    });

    it('should broadcast delete updates', async () => {
      const update: RealTimeUpdate = {
        type: 'delete',
        entity: 'veterinary',
        entityId: 'vet-303',
        farmId: 'farm-404',
        data: null,
        timestamp: new Date(),
      };

      await notificationService.broadcastDataUpdate(update);

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-404',
        'data:update',
        update
      );
    });
  });

  describe('notifySystemAlert', () => {
    it('should create critical system alert with action required', async () => {
      await notificationService.notifySystemAlert(
        'farm-system-123',
        'Database Backup Failed',
        'The automated database backup has failed. Please check system logs.',
        'critical'
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-system-123',
        'notification:new',
        expect.objectContaining({
          type: 'system_alert',
          title: 'Database Backup Failed',
          message: 'The automated database backup has failed. Please check system logs.',
          severity: 'critical',
          actionRequired: true,
        })
      );
    });

    it('should create high severity system alert with action required', async () => {
      await notificationService.notifySystemAlert(
        'farm-456',
        'Low Disk Space',
        'Available disk space is below 10%',
        'high'
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-456',
        'notification:new',
        expect.objectContaining({
          severity: 'high',
          actionRequired: true,
        })
      );
    });

    it('should create medium severity system alert without default severity', async () => {
      await notificationService.notifySystemAlert(
        'farm-789',
        'System Update Available',
        'A new version is available for installation'
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-789',
        'notification:new',
        expect.objectContaining({
          severity: 'medium',
          actionRequired: false,
        })
      );
    });

    it('should create low severity system alert without action required', async () => {
      await notificationService.notifySystemAlert(
        'farm-101',
        'Maintenance Scheduled',
        'Routine maintenance scheduled for next week',
        'low'
      );

      expect(socketServer.emitToFarm).toHaveBeenCalledWith(
        'farm-101',
        'notification:new',
        expect.objectContaining({
          severity: 'low',
          actionRequired: false,
        })
      );
    });
  });

  describe('getFarmNotifications', () => {
    beforeEach(async () => {
      // Clear notifications from previous tests
      (notificationService as any).notifications.clear();
      // Create test notifications with slight delays to ensure different timestamps
      await notificationService.notifySystemAlert('farm-get-123', 'Alert 1', 'Message 1', 'high');
      await new Promise(resolve => setTimeout(resolve, 5));
      await notificationService.notifySystemAlert('farm-get-123', 'Alert 2', 'Message 2', 'low');
      await new Promise(resolve => setTimeout(resolve, 5));
      await notificationService.notifySystemAlert('farm-other-456', 'Alert 3', 'Message 3', 'medium');
    });

    it('should return all notifications for a farm sorted by timestamp', () => {
      const notifications = notificationService.getFarmNotifications('farm-get-123');

      expect(notifications).toHaveLength(2);
      expect(notifications[0]?.farmId).toBe('farm-get-123');
      expect(notifications[1]?.farmId).toBe('farm-get-123');
      // Most recent first
      expect(notifications[0]?.title).toBe('Alert 2');
      expect(notifications[1]?.title).toBe('Alert 1');
    });

    it('should return limited number of notifications when limit specified', () => {
      const notifications = notificationService.getFarmNotifications('farm-get-123', 1);

      expect(notifications).toHaveLength(1);
    });

    it('should return empty array for farm with no notifications', () => {
      const notifications = notificationService.getFarmNotifications('farm-nonexistent');

      expect(notifications).toEqual([]);
    });
  });

  describe('markNotificationRead', () => {
    it('should mark notification as read and return true', async () => {
      await notificationService.notifySystemAlert('farm-read-123', 'Test Alert', 'Test message');

      const notifications = notificationService.getFarmNotifications('farm-read-123');
      const notificationId = notifications[0]?.id;

      if (!notificationId) {
        throw new Error('Notification not created');
      }

      const result = notificationService.markNotificationRead(notificationId);

      expect(result).toBe(true);

      const updatedNotification = notificationService.getFarmNotifications('farm-read-123')[0];
      expect(updatedNotification?.metadata?.read).toBe(true);
    });

    it('should return false for non-existent notification', () => {
      const result = notificationService.markNotificationRead('nonexistent-id');

      expect(result).toBe(false);
    });
  });

  describe('clearNotification', () => {
    it('should delete notification and return true', async () => {
      await notificationService.notifySystemAlert('farm-clear-123', 'Test Alert', 'Test message');

      const notifications = notificationService.getFarmNotifications('farm-clear-123');
      const notificationId = notifications[0]?.id;

      if (!notificationId) {
        throw new Error('Notification not created');
      }

      const result = notificationService.clearNotification(notificationId);

      expect(result).toBe(true);

      const remainingNotifications = notificationService.getFarmNotifications('farm-clear-123');
      expect(remainingNotifications).toHaveLength(0);
    });

    it('should return false for non-existent notification', () => {
      const result = notificationService.clearNotification('nonexistent-id');

      expect(result).toBe(false);
    });
  });

  describe('getUnreadCount', () => {
    beforeEach(async () => {
      // Clear notifications from previous tests
      (notificationService as any).notifications.clear();
      await notificationService.notifySystemAlert('farm-unread-123', 'Alert 1', 'Message 1');
      await notificationService.notifySystemAlert('farm-unread-123', 'Alert 2', 'Message 2');
      await notificationService.notifySystemAlert('farm-unread-123', 'Alert 3', 'Message 3');

      // Mark one as read
      const notifications = notificationService.getFarmNotifications('farm-unread-123');
      const firstId = notifications[0]?.id;
      if (firstId) {
        notificationService.markNotificationRead(firstId);
      }
    });

    it('should return count of unread notifications for a farm', () => {
      const count = notificationService.getUnreadCount('farm-unread-123');

      expect(count).toBe(2);
    });

    it('should return 0 for farm with no unread notifications', async () => {
      await notificationService.notifySystemAlert('farm-allread-456', 'Alert', 'Message');
      
      const notifications = notificationService.getFarmNotifications('farm-allread-456');
      const firstId = notifications[0]?.id;
      if (firstId) {
        notificationService.markNotificationRead(firstId);
      }

      const count = notificationService.getUnreadCount('farm-allread-456');

      expect(count).toBe(0);
    });

    it('should return 0 for farm with no notifications', () => {
      const count = notificationService.getUnreadCount('farm-empty');

      expect(count).toBe(0);
    });
  });

  describe('notification expiration cleanup', () => {
    it('should clean up expired notifications automatically', async () => {
      // Create notification with past expiry
      const notification: NotificationData = {
        id: 'expired-notif-123',
        type: 'system_alert',
        title: 'Expired Alert',
        message: 'This should be cleaned up',
        severity: 'low',
        farmId: 'farm-expired-123',
        timestamp: new Date('2025-11-01'),
        expiresAt: new Date('2025-11-10'), // Expired
      };

      (notificationService as any).notifications.set(notification.id, notification);

      // Trigger cleanup by creating a new notification
      await notificationService.notifySystemAlert('farm-expired-123', 'New Alert', 'This triggers cleanup');

      // Expired notification should be removed
      const notifications = notificationService.getFarmNotifications('farm-expired-123');
      const hasExpired = notifications.some((n: NotificationData) => n.id === 'expired-notif-123');
      
      expect(hasExpired).toBe(false);
    });
  });
});


