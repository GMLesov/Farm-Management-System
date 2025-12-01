import express, { Request, Response } from 'express';

const router = express.Router();

// Mock notification data
const mockNotifications = [
  {
    _id: '1',
    type: 'alert',
    title: 'Low Water Level',
    message: 'Water level in Zone A is below threshold',
    priority: 'high',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '2',
    type: 'task',
    title: 'Task Overdue',
    message: 'Fertilizer application task is overdue',
    priority: 'medium',
    read: false,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '3',
    type: 'system',
    title: 'System Update',
    message: 'Farm management system updated successfully',
    priority: 'low',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '4',
    type: 'alert',
    title: 'Temperature Alert',
    message: 'High temperature detected in greenhouse',
    priority: 'critical',
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    _id: '5',
    type: 'worker',
    title: 'Leave Request',
    message: 'John Smith requested leave for next week',
    priority: 'medium',
    read: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];

// GET /api/notifications - Get all notifications with filters
router.get('/', (req: Request, res: Response) => {
  try {
    const { unreadOnly, limit, type, priority } = req.query;

    let filtered = [...mockNotifications];

    // Filter by read status
    if (unreadOnly === 'true') {
      filtered = filtered.filter(n => !n.read);
    }

    // Filter by type
    if (type) {
      filtered = filtered.filter(n => n.type === type);
    }

    // Filter by priority
    if (priority) {
      filtered = filtered.filter(n => n.priority === priority);
    }

    // Apply limit
    if (limit) {
      filtered = filtered.slice(0, parseInt(limit as string));
    }

    res.json({
      success: true,
      data: filtered,
      total: filtered.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
    });
  }
});

// GET /api/notifications/unread-count - Get count of unread notifications
router.get('/unread-count', (_req: Request, res: Response) => {
  try {
    const unreadCount = mockNotifications.filter(n => !n.read).length;
    
    res.json({
      success: true,
      count: unreadCount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
    });
  }
});

// GET /api/notifications/preferences - Get notification preferences
router.get('/preferences', (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        alertThresholds: {
          temperature: { min: 15, max: 30 },
          humidity: { min: 40, max: 80 },
          soilMoisture: { min: 30, max: 70 },
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch preferences',
    });
  }
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const notification = mockNotifications.find(n => n._id === id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    notification.read = true;

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
    });
  }
});

// PATCH /api/notifications/read-all - Mark all notifications as read
router.patch('/read-all', (_req: Request, res: Response) => {
  try {
    mockNotifications.forEach(n => {
      n.read = true;
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
    });
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = mockNotifications.findIndex(n => n._id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    mockNotifications.splice(index, 1);

    res.json({
      success: true,
      message: 'Notification deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
    });
  }
});

export default router;
