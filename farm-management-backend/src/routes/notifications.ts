import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Get user notifications with filtering
router.get('/', NotificationController.getNotifications);

// Get unread notification count
router.get('/unread-count', NotificationController.getUnreadCount);

// Get user notification preferences
router.get('/preferences', NotificationController.getPreferences);

// Update user notification preferences
router.put('/preferences', NotificationController.updatePreferences);

// Create notification (admin/system only - add admin middleware if needed)
router.post('/', NotificationController.createNotification);

// Create bulk notifications (admin/system only - add admin middleware if needed)
router.post('/bulk', NotificationController.createBulkNotifications);

// Mark notification as read
router.patch('/:id/read', NotificationController.markAsRead);

// Mark multiple notifications as read
router.patch('/read-multiple', NotificationController.markMultipleAsRead);

// Mark all notifications as read
router.patch('/read-all', NotificationController.markAllAsRead);

// Archive notification
router.patch('/:id/archive', NotificationController.archiveNotification);

// Cleanup old archived notifications (admin only - add admin middleware if needed)
router.delete('/cleanup', NotificationController.cleanupOldNotifications);

export default router;
