import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { NotificationService } from '../services/NotificationService';
import { NotificationType, NotificationPriority } from '../models/Notification';

export class NotificationController {
  /**
   * GET /api/notifications
   * Get user notifications with filtering
   */
  static async getNotifications(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        farmId,
        type,
        priority,
        status,
        unreadOnly,
        startDate,
        endDate,
        page = '1',
        limit = '50',
      } = req.query;

      const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

      const filter: any = { userId };

      if (farmId) filter.farmId = farmId;
      if (type) filter.type = (type as string).split(',') as NotificationType[];
      if (priority) filter.priority = (priority as string).split(',') as NotificationPriority[];
      if (status) filter.status = (status as string).split(',');
      if (unreadOnly === 'true') filter.unreadOnly = true;
      if (startDate) filter.startDate = new Date(startDate as string);
      if (endDate) filter.endDate = new Date(endDate as string);

      const result = await NotificationService.getNotifications(filter, {
        skip,
        limit: parseInt(limit as string),
      });

      res.json({
        success: true,
        data: result.notifications,
        pagination: {
          total: result.total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          hasMore: result.hasMore,
        },
      });
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch notifications',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/notifications/unread-count
   * Get unread notification count
   */
  static async getUnreadCount(req: Request, res: Response): Promise<Response | void> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { farmId } = req.query;

      const count = await NotificationService.getUnreadCount(userId, farmId as string);

      res.json({
        success: true,
        count,
      });
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch unread count',
        details: error.message,
      });
    }
  }

  /**
   * POST /api/notifications
   * Create a new notification (admin/system only)
   */
  static async createNotification(req: Request, res: Response): Promise<any> {
    try {
      const {
        userId,
        farmId,
        type,
        priority,
        title,
        message,
        channels,
        scheduledFor,
        expiresAt,
        actions,
        data,
        metadata,
      } = req.body;

      // Validate required fields
      if (!userId || !type || !priority || !title || !message) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, type, priority, title, message',
        });
      }

      const notificationInput: any = {
        userId,
        farmId,
        type,
        priority,
        title,
        message,
        channels,
        actions,
        data,
        metadata,
      };

      if (scheduledFor) notificationInput.scheduledFor = new Date(scheduledFor);
      if (expiresAt) notificationInput.expiresAt = new Date(expiresAt);

      const notification = await NotificationService.createNotification(notificationInput);

      res.status(201).json({
        success: true,
        data: notification,
      });
    } catch (error: any) {
      console.error('Error creating notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create notification',
        details: error.message,
      });
    }
  }

  /**
   * POST /api/notifications/bulk
   * Create bulk notifications (admin/system only)
   */
  static async createBulkNotifications(req: Request, res: Response): Promise<any> {
    try {
      const { userIds, ...notificationData } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'userIds array is required',
        });
      }

      const notifications = await NotificationService.createBulkNotifications(
        userIds,
        notificationData
      );

      res.status(201).json({
        success: true,
        data: notifications,
        count: notifications.length,
      });
    } catch (error: any) {
      console.error('Error creating bulk notifications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create bulk notifications',
        details: error.message,
      });
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark notification as read
   */
  static async markAsRead(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Notification ID is required',
        });
      }

      const notification = await NotificationService.markAsRead(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found',
        });
      }

      // Verify ownership
      if (notification.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
        });
      }

      res.json({
        success: true,
        data: notification,
      });
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark notification as read',
        details: error.message,
      });
    }
  }

  /**
   * PATCH /api/notifications/read-multiple
   * Mark multiple notifications as read
   */
  static async markMultipleAsRead(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { notificationIds } = req.body;

      if (!notificationIds || !Array.isArray(notificationIds)) {
        return res.status(400).json({
          success: false,
          error: 'notificationIds array is required',
        });
      }

      const count = await NotificationService.markMultipleAsRead(notificationIds);

      res.json({
        success: true,
        count,
      });
    } catch (error: any) {
      console.error('Error marking multiple notifications as read:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark notifications as read',
        details: error.message,
      });
    }
  }

  /**
   * PATCH /api/notifications/read-all
   * Mark all notifications as read
   */
  static async markAllAsRead(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { farmId } = req.body;

      const count = await NotificationService.markAllAsRead(userId, farmId);

      res.json({
        success: true,
        count,
      });
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to mark all notifications as read',
        details: error.message,
      });
    }
  }

  /**
   * PATCH /api/notifications/:id/archive
   * Archive notification
   */
  static async archiveNotification(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'Notification ID is required',
        });
      }

      const notification = await NotificationService.archiveNotification(id);

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: 'Notification not found',
        });
      }

      // Verify ownership
      if (notification.userId.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Forbidden',
        });
      }

      res.json({
        success: true,
        data: notification,
      });
    } catch (error: any) {
      console.error('Error archiving notification:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to archive notification',
        details: error.message,
      });
    }
  }

  /**
   * GET /api/notifications/preferences
   * Get user notification preferences
   */
  static async getPreferences(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { farmId } = req.query;

      const preferences = await NotificationService.getUserPreferences(userId, farmId as string);

      res.json({
        success: true,
        data: preferences,
      });
    } catch (error: any) {
      console.error('Error fetching preferences:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch preferences',
        details: error.message,
      });
    }
  }

  /**
   * PUT /api/notifications/preferences
   * Update user notification preferences
   */
  static async updatePreferences(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { farmId, ...updates } = req.body;

      const preferences = await NotificationService.updatePreferences(
        userId,
        farmId,
        updates
      );

      res.json({
        success: true,
        data: preferences,
      });
    } catch (error: any) {
      console.error('Error updating preferences:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update preferences',
        details: error.message,
      });
    }
  }

  /**
   * DELETE /api/notifications/cleanup
   * Cleanup old archived notifications (admin only)
   */
  static async cleanupOldNotifications(req: Request, res: Response): Promise<any> {
    try {
      const { daysOld = 30 } = req.query;

      const count = await NotificationService.cleanupOldNotifications(
        parseInt(daysOld as string)
      );

      res.json({
        success: true,
        count,
        message: `Deleted ${count} old notifications`,
      });
    } catch (error: any) {
      console.error('Error cleaning up notifications:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cleanup notifications',
        details: error.message,
      });
    }
  }
}
