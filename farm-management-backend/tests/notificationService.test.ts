import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { NotificationService } from '../src/services/NotificationService';
import { Notification } from '../src/models/Notification';
import { NotificationPreference } from '../src/models/NotificationPreference';
import { User } from '../src/models/User';

describe('NotificationService Tests', () => {
  let mongoServer: MongoMemoryServer;
  let testUserId: mongoose.Types.ObjectId;
  let testFarmId: mongoose.Types.ObjectId;

  beforeAll(async () => {
    // Mongoose is already connected from setup.ts
    // Just ensure we're connected
    if (mongoose.connection.readyState !== 1) {
      mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri());
    }
  });

  afterAll(async () => {
    // Don't disconnect here as it's managed by setup.ts
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(async () => {
    // Clear collections
    await Notification.deleteMany({});
    await NotificationPreference.deleteMany({});
    
    // Create test IDs
    testUserId = new mongoose.Types.ObjectId();
    testFarmId = new mongoose.Types.ObjectId();
  });

  describe('createNotification', () => {
    it('should create a notification with default settings', async () => {
      const notification = await NotificationService.createNotification({
        userId: testUserId,
        farmId: testFarmId,
        type: 'livestock',
        priority: 'high',
        title: 'Health Alert',
        message: 'Animal needs attention',
      });

      expect(notification).toBeDefined();
      expect(notification.userId.toString()).toBe(testUserId.toString());
      expect(notification.farmId?.toString()).toBe(testFarmId.toString());
      expect(notification.type).toBe('livestock');
      expect(notification.priority).toBe('high');
      expect(notification.title).toBe('Health Alert');
      expect(notification.message).toBe('Animal needs attention');
      expect(notification.status).toBe('sent');
      expect(notification.channels).toContain('in-app');
    });

    it('should create notification with string userId and farmId', async () => {
      const notification = await NotificationService.createNotification({
        userId: testUserId.toString(),
        farmId: testFarmId.toString(),
        type: 'crop',
        priority: 'medium',
        title: 'Crop Update',
        message: 'Time to harvest',
      });

      expect(notification.userId.toString()).toBe(testUserId.toString());
      expect(notification.farmId?.toString()).toBe(testFarmId.toString());
    });

    it('should create notification without farmId', async () => {
      const notification = await NotificationService.createNotification({
        userId: testUserId,
        type: 'info',
        priority: 'low',
        title: 'System Update',
        message: 'New features available',
      });

      expect(notification.farmId).toBeUndefined();
    });

    it('should create notification with scheduled delivery', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 2);

      const notification = await NotificationService.createNotification({
        userId: testUserId,
        type: 'irrigation',
        priority: 'medium',
        title: 'Irrigation Reminder',
        message: 'Scheduled irrigation in 2 hours',
        scheduledFor: futureDate,
      });

      expect(notification.status).toBe('pending');
      expect(notification.scheduledFor).toEqual(futureDate);
    });

    it('should create notification with expiration', async () => {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 7);

      const notification = await NotificationService.createNotification({
        userId: testUserId,
        type: 'weather',
        priority: 'low',
        title: 'Weather Forecast',
        message: 'Rain expected next week',
        expiresAt: expiryDate,
      });

      expect(notification.expiresAt).toEqual(expiryDate);
    });

    it('should create notification with actions', async () => {
      const notification = await NotificationService.createNotification({
        userId: testUserId,
        type: 'reminder',
        priority: 'high',
        title: 'Task Assigned',
        message: 'New task requires your attention',
        actions: [
          {
            label: 'View Task',
            type: 'link',
            url: '/tasks/123',
          },
          {
            label: 'Mark Complete',
            type: 'action',
            actionId: 'complete_task',
            params: { taskId: '123' },
          },
        ],
      });

      expect(notification.actions).toHaveLength(2);
      expect(notification.actions?.[0]?.label).toBe('View Task');
      expect(notification.actions?.[1]?.actionId).toBe('complete_task');
    });

    it('should create notification with data payload', async () => {
      const notification = await NotificationService.createNotification({
        userId: testUserId,
        type: 'alert',
        priority: 'medium',
        title: 'Low Stock Alert',
        message: 'Feed inventory is low',
        data: {
          entityType: 'feed',
          entityId: new mongoose.Types.ObjectId(),
          entityName: 'Cattle Feed',
          value: 50,
          threshold: 100,
        },
      });

      expect(notification.data?.entityType).toBe('feed');
      expect(notification.data?.value).toBe(50);
      expect(notification.data?.threshold).toBe(100);
    });

    it('should create notification with metadata', async () => {
      const notification = await NotificationService.createNotification({
        userId: testUserId,
        type: 'financial',
        priority: 'critical',
        title: 'Payment Due',
        message: 'Invoice payment overdue',
        metadata: {
          triggeredBy: 'automated_system',
          triggerCondition: 'payment_overdue',
          tags: ['finance', 'urgent'],
        },
      });

      expect(notification.metadata?.triggeredBy).toBe('automated_system');
      expect(notification.metadata?.tags).toContain('finance');
    });

    it('should create notification with custom channels', async () => {
      const notification = await NotificationService.createNotification({
        userId: testUserId,
        type: 'equipment',
        priority: 'high',
        title: 'Equipment Maintenance',
        message: 'Tractor requires service',
        channels: ['in-app', 'email', 'push'],
      });

      expect(notification.channels).toContain('in-app');
      expect(notification.channels).toContain('email');
      expect(notification.channels).toContain('push');
    });
  });

  describe('createBulkNotifications', () => {
    it('should create notifications for multiple users', async () => {
      const userIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
      ];

      const notifications = await NotificationService.createBulkNotifications(userIds, {
        farmId: testFarmId,
        type: 'weather',
        priority: 'medium',
        title: 'Weather Alert',
        message: 'Storm approaching',
      });

      expect(notifications).toHaveLength(3);
      expect(notifications[0]?.userId.toString()).toBe(userIds[0]?.toString());
      expect(notifications[1]?.userId.toString()).toBe(userIds[1]?.toString());
      expect(notifications[2]?.userId.toString()).toBe(userIds[2]?.toString());
      
      // All should have same content
      notifications.forEach((notif) => {
        expect(notif.title).toBe('Weather Alert');
        expect(notif.message).toBe('Storm approaching');
      });
    });

    it('should handle empty user list', async () => {
      const notifications = await NotificationService.createBulkNotifications([], {
        type: 'info',
        priority: 'low',
        title: 'Test',
        message: 'Test message',
      });

      expect(notifications).toHaveLength(0);
    });
  });

  describe('getNotifications', () => {
    beforeEach(async () => {
      // Create test notifications
      await NotificationService.createNotification({
        userId: testUserId,
        farmId: testFarmId,
        type: 'livestock',
        priority: 'high',
        title: 'Alert 1',
        message: 'Message 1',
      });

      await NotificationService.createNotification({
        userId: testUserId,
        farmId: testFarmId,
        type: 'crop',
        priority: 'medium',
        title: 'Alert 2',
        message: 'Message 2',
      });

      await NotificationService.createNotification({
        userId: testUserId,
        type: 'info',
        priority: 'low',
        title: 'Alert 3',
        message: 'Message 3',
      });
    });

    it('should get all notifications for a user', async () => {
      const result = await NotificationService.getNotifications({
        userId: testUserId,
      });

      expect(result.notifications).toHaveLength(3);
      expect(result.total).toBe(3);
      expect(result.hasMore).toBe(false);
    });

    it('should filter notifications by farmId', async () => {
      const result = await NotificationService.getNotifications({
        userId: testUserId,
        farmId: testFarmId,
      });

      expect(result.notifications).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter notifications by type', async () => {
      const result = await NotificationService.getNotifications({
        userId: testUserId,
        type: 'livestock',
      });

      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0]?.type).toBe('livestock');
    });

    it('should filter notifications by multiple types', async () => {
      const result = await NotificationService.getNotifications({
        userId: testUserId,
        type: ['livestock', 'crop'],
      });

      expect(result.notifications).toHaveLength(2);
    });

    it('should filter notifications by priority', async () => {
      const result = await NotificationService.getNotifications({
        userId: testUserId,
        priority: 'high',
      });

      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0]?.priority).toBe('high');
    });

    it('should filter notifications by multiple priorities', async () => {
      const result = await NotificationService.getNotifications({
        userId: testUserId,
        priority: ['high', 'medium'],
      });

      expect(result.notifications).toHaveLength(2);
    });

    it('should filter notifications by status', async () => {
      const result = await NotificationService.getNotifications({
        userId: testUserId,
        status: 'sent',
      });

      expect(result.total).toBeGreaterThan(0);
    });

    it('should get only unread notifications', async () => {
      const result = await NotificationService.getNotifications({
        userId: testUserId,
        unreadOnly: true,
      });

      expect(result.notifications.every((n: any) => !n.readAt)).toBe(true);
    });

    it('should filter notifications by date range', async () => {
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - 1);
      const endDate = new Date();
      endDate.setHours(endDate.getHours() + 1);

      const result = await NotificationService.getNotifications({
        userId: testUserId,
        startDate,
        endDate,
      });

      expect(result.total).toBe(3);
    });

    it('should paginate results', async () => {
      const result = await NotificationService.getNotifications(
        { userId: testUserId },
        { skip: 0, limit: 2 }
      );

      expect(result.notifications).toHaveLength(2);
      expect(result.total).toBe(3);
      expect(result.hasMore).toBe(true);
    });

    it('should sort results', async () => {
      const result = await NotificationService.getNotifications(
        { userId: testUserId },
        { sort: { createdAt: 1 } } // Ascending order
      );

      expect(result.notifications).toHaveLength(3);
      expect(result.notifications[0]?.title).toBe('Alert 1');
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const notification = await NotificationService.createNotification({
        userId: testUserId,
        type: 'info',
        priority: 'low',
        title: 'Test',
        message: 'Test message',
      });

      const updated = await NotificationService.markAsRead(notification._id as mongoose.Types.ObjectId);

      expect(updated).toBeDefined();
      expect(updated?.status).toBe('read');
      expect(updated?.readAt).toBeDefined();
    });

    it('should handle non-existent notification', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const result = await NotificationService.markAsRead(fakeId);

      expect(result).toBeNull();
    });

    it('should accept string ID', async () => {
      const notification = await NotificationService.createNotification({
        userId: testUserId,
        type: 'info',
        priority: 'low',
        title: 'Test',
        message: 'Test message',
      });

      const updated = await NotificationService.markAsRead((notification._id as mongoose.Types.ObjectId).toString());

      expect(updated?.status).toBe('read');
    });
  });

  describe('markMultipleAsRead', () => {
    it('should mark multiple notifications as read', async () => {
      const n1 = await NotificationService.createNotification({
        userId: testUserId,
        type: 'info',
        priority: 'low',
        title: 'Test 1',
        message: 'Message 1',
      });

      const n2 = await NotificationService.createNotification({
        userId: testUserId,
        type: 'info',
        priority: 'low',
        title: 'Test 2',
        message: 'Message 2',
      });

      const count = await NotificationService.markMultipleAsRead([
        n1._id as mongoose.Types.ObjectId,
        n2._id as mongoose.Types.ObjectId
      ]);

      expect(count).toBe(2);

      const updated1 = await Notification.findById(n1._id);
      const updated2 = await Notification.findById(n2._id);

      expect(updated1?.status).toBe('read');
      expect(updated2?.status).toBe('read');
    });

    it('should handle empty array', async () => {
      const count = await NotificationService.markMultipleAsRead([]);
      expect(count).toBe(0);
    });

    it('should handle non-existent IDs', async () => {
      const fakeIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];
      const count = await NotificationService.markMultipleAsRead(fakeIds);

      expect(count).toBe(0);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all user notifications as read', async () => {
      await NotificationService.createNotification({
        userId: testUserId,
        type: 'info',
        priority: 'low',
        title: 'Test 1',
        message: 'Message 1',
      });

      await NotificationService.createNotification({
        userId: testUserId,
        type: 'info',
        priority: 'low',
        title: 'Test 2',
        message: 'Message 2',
      });

      const count = await NotificationService.markAllAsRead(testUserId);

      expect(count).toBe(2);
    });

    it('should mark all farm notifications as read', async () => {
      await NotificationService.createNotification({
        userId: testUserId,
        farmId: testFarmId,
        type: 'info',
        priority: 'low',
        title: 'Test 1',
        message: 'Message 1',
      });

      await NotificationService.createNotification({
        userId: testUserId,
        type: 'info',
        priority: 'low',
        title: 'Test 2',
        message: 'Message 2',
      });

      const count = await NotificationService.markAllAsRead(testUserId, testFarmId);

      expect(count).toBe(1); // Only the one with farmId
    });

    it('should handle no unread notifications', async () => {
      const count = await NotificationService.markAllAsRead(testUserId);
      expect(count).toBe(0);
    });
  });

  describe('archiveNotification', () => {
    it('should archive notification', async () => {
      const notification = await NotificationService.createNotification({
        userId: testUserId,
        type: 'info',
        priority: 'low',
        title: 'Test',
        message: 'Test message',
      });

      const archived = await NotificationService.archiveNotification(notification._id as mongoose.Types.ObjectId);

      expect(archived).toBeDefined();
      expect(archived?.status).toBe('archived');
      expect(archived?.archivedAt).toBeDefined();
    });

    it('should handle non-existent notification', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const result = await NotificationService.archiveNotification(fakeId);

      expect(result).toBeNull();
    });
  });

  describe('cleanupOldNotifications', () => {
    it('should delete old archived notifications', async () => {
      const notification = await NotificationService.createNotification({
        userId: testUserId,
        type: 'info',
        priority: 'low',
        title: 'Old Notification',
        message: 'Should be deleted',
      });

      // Archive it
      await NotificationService.archiveNotification(notification._id as mongoose.Types.ObjectId);

      // Manually set archivedAt to 31 days ago
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 31);
      await Notification.findByIdAndUpdate(notification._id, { archivedAt: oldDate });

      const deletedCount = await NotificationService.cleanupOldNotifications(30);

      expect(deletedCount).toBe(1);

      const found = await Notification.findById(notification._id);
      expect(found).toBeNull();
    });

    it('should not delete recent archived notifications', async () => {
      const notification = await NotificationService.createNotification({
        userId: testUserId,
        type: 'info',
        priority: 'low',
        title: 'Recent Notification',
        message: 'Should not be deleted',
      });

      await NotificationService.archiveNotification(notification._id as mongoose.Types.ObjectId);

      const deletedCount = await NotificationService.cleanupOldNotifications(30);

      expect(deletedCount).toBe(0);

      const found = await Notification.findById(notification._id);
      expect(found).toBeDefined();
    });

    it('should not delete non-archived notifications', async () => {
      await NotificationService.createNotification({
        userId: testUserId,
        type: 'info',
        priority: 'low',
        title: 'Active Notification',
        message: 'Should not be deleted',
      });

      const deletedCount = await NotificationService.cleanupOldNotifications(0);

      expect(deletedCount).toBe(0);
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count for user', async () => {
      await NotificationService.createNotification({
        userId: testUserId,
        type: 'info',
        priority: 'low',
        title: 'Unread 1',
        message: 'Message 1',
      });

      const notification2 = await NotificationService.createNotification({
        userId: testUserId,
        type: 'info',
        priority: 'low',
        title: 'Unread 2',
        message: 'Message 2',
      });

      // Mark one as read
      await NotificationService.markAsRead(notification2._id as mongoose.Types.ObjectId);

      const count = await NotificationService.getUnreadCount(testUserId);

      expect(count).toBe(1);
    });

    it('should filter unread count by farm', async () => {
      await NotificationService.createNotification({
        userId: testUserId,
        farmId: testFarmId,
        type: 'info',
        priority: 'low',
        title: 'Farm Notification',
        message: 'Message 1',
      });

      await NotificationService.createNotification({
        userId: testUserId,
        type: 'info',
        priority: 'low',
        title: 'Global Notification',
        message: 'Message 2',
      });

      const count = await NotificationService.getUnreadCount(testUserId, testFarmId);

      expect(count).toBe(1);
    });

    it('should return 0 for user with no notifications', async () => {
      const count = await NotificationService.getUnreadCount(new mongoose.Types.ObjectId());
      expect(count).toBe(0);
    });
  });

  describe('getUserPreferences', () => {
    it('should create default preferences if none exist', async () => {
      const preferences = await NotificationService.getUserPreferences(testUserId);

      expect(preferences).toBeDefined();
      expect(preferences.userId.toString()).toBe(testUserId.toString());
      expect(preferences.globalEnabled).toBe(true); // Default value
    });

    it('should return existing preferences', async () => {
      // Create preferences
      const created = await NotificationService.getUserPreferences(testUserId);
      
      // Get them again
      const retrieved = await NotificationService.getUserPreferences(testUserId);

      expect((retrieved._id as mongoose.Types.ObjectId).toString()).toBe((created._id as mongoose.Types.ObjectId).toString());
    });

    it('should handle farm-specific preferences', async () => {
      const preferences = await NotificationService.getUserPreferences(testUserId, testFarmId);

      expect(preferences.farmId?.toString()).toBe(testFarmId.toString());
    });

    it('should accept string IDs', async () => {
      const preferences = await NotificationService.getUserPreferences(
        testUserId.toString(),
        testFarmId.toString()
      );

      expect(preferences.userId.toString()).toBe(testUserId.toString());
      expect(preferences.farmId?.toString()).toBe(testFarmId.toString());
    });
  });

  describe('updatePreferences', () => {
    it('should update existing preferences', async () => {
      await NotificationService.getUserPreferences(testUserId);

      const updated = await NotificationService.updatePreferences(testUserId, undefined, {
        globalEnabled: false,
      });

      expect(updated).toBeDefined();
      expect(updated?.globalEnabled).toBe(false);
    });

    it('should create preferences if none exist (upsert)', async () => {
      const updated = await NotificationService.updatePreferences(testUserId, testFarmId, {
        globalEnabled: false,
      });

      expect(updated).toBeDefined();
      expect(updated?.userId.toString()).toBe(testUserId.toString());
      expect(updated?.globalEnabled).toBe(false);
    });

    it('should handle partial updates', async () => {
      await NotificationService.getUserPreferences(testUserId);

      const updated = await NotificationService.updatePreferences(testUserId, undefined, {
        globalEnabled: false,
      });

      expect(updated?.globalEnabled).toBe(false);
    });
  });
});
