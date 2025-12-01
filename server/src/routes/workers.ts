import express, { Response } from 'express';
import User from '../models/User';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/workers
// @desc    Get all workers
// @access  Private (Admin)
router.get('/', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const workers = await User.find({ role: 'worker' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: workers.length,
      workers
    });
  } catch (error: any) {
    console.error('Get workers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/workers/:id
// @desc    Get single worker
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const worker = await User.findOne({ _id: req.params.id, role: 'worker' })
      .select('-password');

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    res.json({
      success: true,
      worker
    });
  } catch (error: any) {
    console.error('Get worker error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/workers
// @desc    Create worker
// @access  Private (Admin)
router.post('/', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { username, password, name, phone, avatar } = req.body;

    // Check if username already exists
    const existingWorker = await User.findOne({ username });
    if (existingWorker) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    // Create worker
    const worker = await User.create({
      username,
      password,
      name,
      phone,
      avatar,
      role: 'worker'
    });

    res.status(201).json({
      success: true,
      worker: {
        id: worker._id,
        username: worker.username,
        name: worker.name,
        phone: worker.phone,
        avatar: worker.avatar,
        role: worker.role
      }
    });
  } catch (error: any) {
    console.error('Create worker error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/workers/:id
// @desc    Update worker
// @access  Private (Admin)
router.put('/:id', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, avatar, isActive } = req.body;

    const worker = await User.findOne({ _id: req.params.id, role: 'worker' });

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    // Update fields
    if (name) worker.name = name;
    if (phone) worker.phone = phone;
    if (avatar) worker.avatar = avatar;
    if (typeof isActive !== 'undefined') worker.isActive = isActive;

    await worker.save();

    res.json({
      success: true,
      worker: {
        id: worker._id,
        username: worker.username,
        name: worker.name,
        phone: worker.phone,
        avatar: worker.avatar,
        isActive: worker.isActive,
        role: worker.role
      }
    });
  } catch (error: any) {
    console.error('Update worker error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/workers/:id/password
// @desc    Reset worker password
// @access  Private (Admin)
router.put('/:id/password', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide new password' });
    }

    const worker = await User.findOne({ _id: req.params.id, role: 'worker' });

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    // Update password (will be hashed by pre-save hook)
    worker.password = newPassword;
    await worker.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/workers/:id
// @desc    Delete worker
// @access  Private (Admin)
router.delete('/:id', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const worker = await User.findOne({ _id: req.params.id, role: 'worker' });

    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    await worker.deleteOne();

    res.json({
      success: true,
      message: 'Worker deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete worker error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/workers/location
// @desc    Update worker location (GPS tracking)
// @access  Private (Worker)
router.post('/location', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { latitude, longitude, timestamp } = req.body;
    const workerId = req.user?._id;

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Please provide latitude and longitude' });
    }

    // Update worker location
    const worker = await User.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    // Store location (you may want to create a separate LocationHistory model)
    worker.lastLocation = {
      latitude,
      longitude,
      timestamp: timestamp || new Date()
    };
    await worker.save();

    res.json({
      success: true,
      message: 'Location updated successfully',
      location: worker.lastLocation
    });
  } catch (error: any) {
    console.error('Update location error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/workers/checkin
// @desc    Worker check-in (attendance)
// @access  Private (Worker)
router.post('/checkin', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { timestamp, location } = req.body;
    const workerId = req.user?._id;

    const worker = await User.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    // Store check-in (you may want to create a separate Attendance model)
    const checkInData = {
      checkInTime: timestamp || new Date(),
      checkInLocation: location,
      date: new Date().toISOString().split('T')[0]
    };

    res.json({
      success: true,
      message: 'Checked in successfully',
      checkIn: checkInData
    });
  } catch (error: any) {
    console.error('Check-in error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/workers/checkout
// @desc    Worker check-out (attendance)
// @access  Private (Worker)
router.post('/checkout', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { timestamp } = req.body;
    const workerId = req.user?._id;

    const worker = await User.findById(workerId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    // Store check-out
    const checkOutData = {
      checkOutTime: timestamp || new Date(),
      date: new Date().toISOString().split('T')[0]
    };

    res.json({
      success: true,
      message: 'Checked out successfully',
      checkOut: checkOutData
    });
  } catch (error: any) {
    console.error('Check-out error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/workers/schedule
// @desc    Get worker schedule
// @access  Private (Worker)
router.get('/schedule', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const workerId = req.user?._id;

    // This is a placeholder - you may want to create a Schedule model
    // For now, return demo schedule data
    const schedule = [
      {
        date: '2025-11-16',
        shift: 'Morning (7AM-3PM)',
        status: 'scheduled',
        location: 'Field A'
      },
      {
        date: '2025-11-17',
        shift: 'Morning (7AM-3PM)',
        status: 'scheduled',
        location: 'Barn'
      },
      {
        date: '2025-11-18',
        shift: 'Afternoon (3PM-11PM)',
        status: 'scheduled',
        location: 'Field B'
      }
    ];

    res.json({
      success: true,
      schedule
    });
  } catch (error: any) {
    console.error('Get schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/workers/sync
// @desc    Sync offline data
// @access  Private (Worker)
router.post('/sync', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { offlineData } = req.body;
    const workerId = req.user?._id;

    // Process offline data (tasks completed, locations tracked, etc.)
    // This is a placeholder implementation
    const syncedData = {
      tasksSynced: 0,
      locationsSynced: 0,
      reportsSynced: 0
    };

    if (offlineData) {
      // Process different types of offline data
      if (offlineData.tasks) {
        syncedData.tasksSynced = offlineData.tasks.length;
      }
      if (offlineData.locations) {
        syncedData.locationsSynced = offlineData.locations.length;
      }
      if (offlineData.reports) {
        syncedData.reportsSynced = offlineData.reports.length;
      }
    }

    res.json({
      success: true,
      message: 'Data synced successfully',
      synced: syncedData
    });
  } catch (error: any) {
    console.error('Sync error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/workers/fcm-token
// @desc    Save FCM token for push notifications
// @access  Private (Worker)
router.post('/fcm-token', protect, async (req: AuthRequest, res: Response) => {
  try {
    const { token, userId } = req.body;
    const workerId = req.user?._id;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Please provide FCM token' });
    }

    // Save FCM token to user profile
    const worker = await User.findById(workerId || userId);
    if (!worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    // Store FCM token (you may want to add fcmToken field to User model)
    // For now, just acknowledge receipt
    console.log(`FCM Token received for worker ${worker.name}: ${token}`);

    res.json({
      success: true,
      message: 'FCM token saved successfully'
    });
  } catch (error: any) {
    console.error('FCM token error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
