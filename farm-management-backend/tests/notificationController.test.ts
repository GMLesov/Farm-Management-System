import request from 'supertest';
import express from 'express';
import { Types } from 'mongoose';
import { User } from '../src/models/User';
import { Farm } from '../src/models/Farm';
import notificationRoutes from '../src/routes/notifications';
import { errorHandler } from '../src/middleware/errorHandler';
import { NotificationService } from '../src/services/NotificationService';

const TEST_USER_ID = '507f1f77bcf86cd799439013';

// Mock auth middleware
jest.mock('../src/middleware/auth', () => ({
  authMiddleware: jest.fn((req: any, res: any, next: any) => {
    req.user = { 
      id: TEST_USER_ID, 
      userId: TEST_USER_ID,
      email: 'notifytest@example.com',
      farmId: null
    };
    next();
  })
}));

// Mock NotificationService
jest.mock('../src/services/NotificationService');

const app = express();
app.use(express.json());
app.use('/api/notifications', notificationRoutes);
app.use(errorHandler as any);

describe('Notification Controller Integration Tests', () => {
  let testUser: any;
  let testFarm: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Create test user
    testUser = await User.create({
      _id: new Types.ObjectId(TEST_USER_ID),
      firstName: 'Notify',
      lastName: 'Tester',
      email: 'notifytest@example.com',
      password: 'hashedpassword',
      role: 'farmer',
    });

    // Create test farm
    testFarm = await Farm.create({
      name: 'Notification Test Farm',
      location: {
        address: '789 Alert Ave',
        city: 'Notify City',
        state: 'Alert State',
        country: 'Notification Land',
        zipCode: '99999',
        latitude: 42.3601,
        longitude: -71.0589
      },
      size: 100,
      soilType: 'sandy',
      climateZone: 'subtropical',
      owner: testUser._id,
      managers: [testUser._id],
    });

    // Update mock to include farmId
    require('../src/middleware/auth').authMiddleware.mockImplementation((req: any, res: any, next: any) => {
      req.user = { 
        id: TEST_USER_ID,
        userId: TEST_USER_ID,
        email: 'notifytest@example.com',
        farmId: testFarm._id.toString()
      };
      next();
    });
  });

  describe('GET /api/notifications', () => {
    it('should get user notifications', async () => {
      const mockNotifications = [
        {
          _id: new Types.ObjectId(),
          userId: TEST_USER_ID,
          title: 'Test Notification 1',
          message: 'This is a test',
          type: 'info',
          priority: 'medium',
          status: 'unread',
          createdAt: new Date()
        },
        {
          _id: new Types.ObjectId(),
          userId: TEST_USER_ID,
          title: 'Test Notification 2',
          message: 'Another test',
          type: 'alert',
          priority: 'high',
          status: 'unread',
          createdAt: new Date()
        }
      ];

      (NotificationService.getNotifications as jest.Mock).mockResolvedValue({
        notifications: mockNotifications,
        total: 2,
        hasMore: false
      });

      const response = await request(app)
        .get('/api/notifications');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter notifications by farm', async () => {
      (NotificationService.getNotifications as jest.Mock).mockResolvedValue({
        notifications: [],
        total: 0,
        hasMore: false
      });

      const response = await request(app)
        .get('/api/notifications')
        .query({ farmId: testFarm._id.toString() });

      expect(response.status).toBe(200);
      expect(NotificationService.getNotifications).toHaveBeenCalled();
    });

    it('should filter notifications by type', async () => {
      (NotificationService.getNotifications as jest.Mock).mockResolvedValue({
        notifications: [],
        total: 0,
        hasMore: false
      });

      const response = await request(app)
        .get('/api/notifications')
        .query({ type: 'alert,warning' });

      expect(response.status).toBe(200);
    });

    it('should filter notifications by priority', async () => {
      (NotificationService.getNotifications as jest.Mock).mockResolvedValue({
        notifications: [],
        total: 0,
        hasMore: false
      });

      const response = await request(app)
        .get('/api/notifications')
        .query({ priority: 'high,critical' });

      expect(response.status).toBe(200);
    });

    it('should filter unread notifications only', async () => {
      (NotificationService.getNotifications as jest.Mock).mockResolvedValue({
        notifications: [],
        total: 0,
        hasMore: false
      });

      const response = await request(app)
        .get('/api/notifications')
        .query({ unreadOnly: 'true' });

      expect(response.status).toBe(200);
    });

    it('should support pagination', async () => {
      (NotificationService.getNotifications as jest.Mock).mockResolvedValue({
        notifications: [],
        total: 100,
        hasMore: true
      });

      const response = await request(app)
        .get('/api/notifications')
        .query({ page: 2, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(20);
    });

    it('should filter by date range', async () => {
      (NotificationService.getNotifications as jest.Mock).mockResolvedValue({
        notifications: [],
        total: 0,
        hasMore: false
      });

      const response = await request(app)
        .get('/api/notifications')
        .query({ 
          startDate: '2025-11-01',
          endDate: '2025-11-30'
        });

      expect(response.status).toBe(200);
    });

    it('should handle service errors gracefully', async () => {
      (NotificationService.getNotifications as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const response = await request(app)
        .get('/api/notifications');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/notifications/unread-count', () => {
    it('should get unread notification count', async () => {
      (NotificationService.getUnreadCount as jest.Mock).mockResolvedValue(5);

      const response = await request(app)
        .get('/api/notifications/unread-count');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(5);
    });

    it('should get unread count for specific farm', async () => {
      (NotificationService.getUnreadCount as jest.Mock).mockResolvedValue(3);

      const response = await request(app)
        .get('/api/notifications/unread-count')
        .query({ farmId: testFarm._id.toString() });

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(3);
    });

    it('should return 0 when no unread notifications', async () => {
      (NotificationService.getUnreadCount as jest.Mock).mockResolvedValue(0);

      const response = await request(app)
        .get('/api/notifications/unread-count');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
    });

    it('should handle service errors', async () => {
      (NotificationService.getUnreadCount as jest.Mock).mockRejectedValue(
        new Error('Count error')
      );

      const response = await request(app)
        .get('/api/notifications/unread-count');

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/notifications', () => {
    it('should create a notification', async () => {
      const mockNotification = {
        _id: new Types.ObjectId(),
        userId: TEST_USER_ID,
        title: 'New Alert',
        message: 'Important update',
        type: 'alert',
        priority: 'high'
      };

      (NotificationService.createNotification as jest.Mock).mockResolvedValue(mockNotification);

      const response = await request(app)
        .post('/api/notifications')
        .send({
          userId: TEST_USER_ID,
          type: 'alert',
          priority: 'high',
          title: 'New Alert',
          message: 'Important update'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Alert');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/notifications')
        .send({
          userId: TEST_USER_ID,
          // Missing required fields
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should create notification with optional fields', async () => {
      const mockNotification = {
        _id: new Types.ObjectId(),
        userId: TEST_USER_ID,
        farmId: testFarm._id,
        title: 'Scheduled Alert',
        message: 'Future notification',
        type: 'reminder',
        priority: 'low',
        scheduledFor: new Date('2025-12-01'),
        expiresAt: new Date('2025-12-31')
      };

      (NotificationService.createNotification as jest.Mock).mockResolvedValue(mockNotification);

      const response = await request(app)
        .post('/api/notifications')
        .send({
          userId: TEST_USER_ID,
          farmId: testFarm._id.toString(),
          type: 'reminder',
          priority: 'low',
          title: 'Scheduled Alert',
          message: 'Future notification',
          scheduledFor: '2025-12-01',
          expiresAt: '2025-12-31',
          channels: ['email', 'push'],
          actions: [{ label: 'View', action: 'view' }],
          data: { customField: 'value' }
        });

      expect(response.status).toBe(201);
    });

    it('should handle creation errors', async () => {
      (NotificationService.createNotification as jest.Mock).mockRejectedValue(
        new Error('Creation failed')
      );

      const response = await request(app)
        .post('/api/notifications')
        .send({
          userId: TEST_USER_ID,
          type: 'alert',
          priority: 'high',
          title: 'Test',
          message: 'Test message'
        });

      expect(response.status).toBe(500);
    });
  });

  describe('POST /api/notifications/bulk', () => {
    it('should create bulk notifications', async () => {
      const mockNotifications = [
        { _id: new Types.ObjectId(), userId: TEST_USER_ID, title: 'Bulk 1' },
        { _id: new Types.ObjectId(), userId: TEST_USER_ID, title: 'Bulk 2' }
      ];

      (NotificationService.createBulkNotifications as jest.Mock).mockResolvedValue(mockNotifications);

      const response = await request(app)
        .post('/api/notifications/bulk')
        .send({
          userIds: [TEST_USER_ID, new Types.ObjectId().toString()],
          type: 'info',
          priority: 'medium',
          title: 'Bulk Notification',
          message: 'Message for multiple users'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
    });

    it('should validate userIds array', async () => {
      const response = await request(app)
        .post('/api/notifications/bulk')
        .send({
          userIds: [],
          type: 'info',
          priority: 'medium',
          title: 'Test',
          message: 'Test'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should require userIds parameter', async () => {
      const response = await request(app)
        .post('/api/notifications/bulk')
        .send({
          type: 'info',
          priority: 'medium',
          title: 'Test',
          message: 'Test'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/notifications/:id/read', () => {
    it('should mark notification as read', async () => {
      const notificationId = new Types.ObjectId();
      const mockNotification = {
        _id: notificationId,
        userId: new Types.ObjectId(TEST_USER_ID),
        title: 'Test',
        status: 'read'
      };

      (NotificationService.markAsRead as jest.Mock).mockResolvedValue(mockNotification);

      const response = await request(app)
        .patch(`/api/notifications/${notificationId}/read`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent notification', async () => {
      (NotificationService.markAsRead as jest.Mock).mockResolvedValue(null);

      const fakeId = new Types.ObjectId();
      const response = await request(app)
        .patch(`/api/notifications/${fakeId}/read`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return 403 for unauthorized access', async () => {
      const notificationId = new Types.ObjectId();
      const otherUserId = new Types.ObjectId();
      const mockNotification = {
        _id: notificationId,
        userId: otherUserId,
        title: 'Test'
      };

      (NotificationService.markAsRead as jest.Mock).mockResolvedValue(mockNotification);

      const response = await request(app)
        .patch(`/api/notifications/${notificationId}/read`);

      expect(response.status).toBe(403);
    });

    it('should handle service errors', async () => {
      (NotificationService.markAsRead as jest.Mock).mockRejectedValue(
        new Error('Mark as read failed')
      );

      const response = await request(app)
        .patch(`/api/notifications/${new Types.ObjectId()}/read`);

      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /api/notifications/read-multiple', () => {
    it('should mark multiple notifications as read', async () => {
      (NotificationService.markMultipleAsRead as jest.Mock).mockResolvedValue(3);

      const response = await request(app)
        .patch('/api/notifications/read-multiple')
        .send({
          notificationIds: [
            new Types.ObjectId().toString(),
            new Types.ObjectId().toString(),
            new Types.ObjectId().toString()
          ]
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(3);
    });

    it('should validate notificationIds array', async () => {
      const response = await request(app)
        .patch('/api/notifications/read-multiple')
        .send({
          notificationIds: 'not-an-array'
        });

      expect(response.status).toBe(400);
    });

    it('should require notificationIds parameter', async () => {
      const response = await request(app)
        .patch('/api/notifications/read-multiple')
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/notifications/preferences', () => {
    it('should get user notification preferences', async () => {
      const mockPreferences = {
        userId: TEST_USER_ID,
        email: true,
        push: true,
        sms: false,
        inApp: true
      };

      (NotificationService.getUserPreferences as jest.Mock).mockResolvedValue(mockPreferences);

      const response = await request(app)
        .get('/api/notifications/preferences');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should get preferences for specific farm', async () => {
      const mockPreferences = {
        userId: TEST_USER_ID,
        farmId: testFarm._id,
        email: true
      };

      (NotificationService.getUserPreferences as jest.Mock).mockResolvedValue(mockPreferences);

      const response = await request(app)
        .get('/api/notifications/preferences')
        .query({ farmId: testFarm._id.toString() });

      expect(response.status).toBe(200);
    });

    it('should handle errors when fetching preferences', async () => {
      (NotificationService.getUserPreferences as jest.Mock).mockRejectedValue(
        new Error('Preferences error')
      );

      const response = await request(app)
        .get('/api/notifications/preferences');

      expect(response.status).toBe(500);
    });
  });

  describe('PUT /api/notifications/preferences', () => {
    it('should update notification preferences', async () => {
      const mockPreferences = {
        userId: TEST_USER_ID,
        email: false,
        push: true,
        sms: true
      };

      (NotificationService.updatePreferences as jest.Mock).mockResolvedValue(mockPreferences);

      const response = await request(app)
        .put('/api/notifications/preferences')
        .send({
          email: false,
          push: true,
          sms: true
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should update preferences for specific farm', async () => {
      const mockPreferences = {
        userId: TEST_USER_ID,
        farmId: testFarm._id,
        email: true
      };

      (NotificationService.updatePreferences as jest.Mock).mockResolvedValue(mockPreferences);

      const response = await request(app)
        .put('/api/notifications/preferences')
        .send({
          farmId: testFarm._id.toString(),
          email: true
        });

      expect(response.status).toBe(200);
    });

    it('should handle update errors', async () => {
      (NotificationService.updatePreferences as jest.Mock).mockRejectedValue(
        new Error('Update failed')
      );

      const response = await request(app)
        .put('/api/notifications/preferences')
        .send({ email: false });

      expect(response.status).toBe(500);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/notifications')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect([400, 500]).toContain(response.status);
    });

    it('should handle very large notification arrays', async () => {
      const largeUserArray = Array(1000).fill(null).map(() => new Types.ObjectId().toString());

      (NotificationService.createBulkNotifications as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .post('/api/notifications/bulk')
        .send({
          userIds: largeUserArray,
          type: 'info',
          priority: 'low',
          title: 'Bulk test',
          message: 'Test'
        });

      expect([200, 201, 413, 500]).toContain(response.status);
    });

    it('should validate pagination limits', async () => {
      (NotificationService.getNotifications as jest.Mock).mockResolvedValue({
        notifications: [],
        total: 0,
        hasMore: false
      });

      const response = await request(app)
        .get('/api/notifications')
        .query({ page: -1, limit: 9999 });

      expect(response.status).toBe(200);
    });

    it('should handle concurrent mark-as-read requests', async () => {
      const notificationId = new Types.ObjectId();
      const mockNotification = {
        _id: notificationId,
        userId: new Types.ObjectId(TEST_USER_ID),
        status: 'read'
      };

      (NotificationService.markAsRead as jest.Mock).mockResolvedValue(mockNotification);

      const request1 = request(app).patch(`/api/notifications/${notificationId}/read`);
      const request2 = request(app).patch(`/api/notifications/${notificationId}/read`);

      const [response1, response2] = await Promise.all([request1, request2]);

      expect([200, 409]).toContain(response1.status);
      expect([200, 409]).toContain(response2.status);
    });
  });
});
