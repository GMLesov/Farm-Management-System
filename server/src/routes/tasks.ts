import express, { Response } from 'express';
import Task from '../models/Task';
import User from '../models/User';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';
import { aiEngine } from '../services/aiTaskRecommendation';
import { weatherScheduler } from '../services/weatherScheduler';

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks (admin) or assigned tasks (worker)
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};

    // Workers only see their assigned tasks
    if (req.user?.role === 'worker') {
      query.assignedTo = req.user._id;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by priority if provided
    if (req.query.priority) {
      query.priority = req.query.priority;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name username avatar')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error: any) {
    console.error('Get tasks error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name username avatar')
      .populate('assignedBy', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Workers can only view their own tasks
    if (req.user?.role === 'worker' && task.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this task' });
    }

    res.json({
      success: true,
      task
    });
  } catch (error: any) {
    console.error('Get task error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Create task
// @access  Private (Admin)
router.post('/', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      assignedTo,
      priority,
      type,
      location,
      deadline,
      notes
    } = req.body;

    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.user?._id,
      priority,
      type,
      location,
      deadline,
      notes
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name username avatar')
      .populate('assignedBy', 'name email');

    res.status(201).json({
      success: true,
      task: populatedTask
    });
  } catch (error: any) {
    console.error('Create task error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private (Admin or assigned worker)
router.put('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Check permissions: admin can update anything, workers only their assigned tasks
    if (req.user?.role === 'worker' && task.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this task' });
    }

    const {
      title,
      description,
      priority,
      status,
      location,
      deadline,
      notes,
      photos,
      gpsLocation
    } = req.body;

    // Update fields
    if (title) task.title = title;
    if (description) task.description = description;
    if (priority) task.priority = priority;
    if (status) {
      task.status = status;
      // If marking as completed, set completedAt
      if (status === 'completed' && !task.completedAt) {
        task.completedAt = new Date();
      }
    }
    if (location) task.location = location;
    if (deadline) task.deadline = deadline;
    if (notes) task.notes = notes;
    if (photos) task.photos = photos;
    if (gpsLocation) task.gpsLocation = gpsLocation;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name username avatar')
      .populate('assignedBy', 'name email');

    res.json({
      success: true,
      task: updatedTask
    });
  } catch (error: any) {
    console.error('Update task error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/tasks/:id/complete
// @desc    Mark task as completed
// @access  Private (Worker can complete their own tasks)
router.put('/:id/complete', protect, async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Workers can only complete their assigned tasks
    if (req.user?.role === 'worker' && task.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to complete this task' });
    }

    task.status = 'completed';
    task.completedAt = new Date();

    if (req.body.notes) {
      task.notes = req.body.notes;
    }
    if (req.body.photos) {
      task.photos = req.body.photos;
    }
    if (req.body.gpsLocation) {
      task.gpsLocation = req.body.gpsLocation;
    }

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name username avatar')
      .populate('assignedBy', 'name email');

    res.json({
      success: true,
      task: updatedTask
    });
  } catch (error: any) {
    console.error('Complete task error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private (Admin)
router.delete('/:id', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await task.deleteOne();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete task error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tasks/ai-recommend
// @desc    Get AI-powered worker recommendations for a task
// @access  Private (Admin)
router.post('/ai-recommend', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { taskType, location, dueDate, priority } = req.body;

    // Get active workers
    const workers = await User.find({ role: 'worker', isActive: true });

    if (workers.length === 0) {
      return res.status(404).json({ success: false, message: 'No active workers found' });
    }

    // Get historical tasks for analysis
    const historicalTasks = await Task.find({ status: 'completed' })
      .populate('assignedTo')
      .limit(1000)
      .lean();

    // Analyze task history
    await aiEngine.analyzeTaskHistory(historicalTasks);

    // Build worker profiles
    await aiEngine.buildWorkerProfiles(workers, historicalTasks);

    // Create a temporary task object for recommendation
    const tempTask = {
      type: taskType,
      location,
      dueDate: new Date(dueDate),
      priority
    };

    // Get recommendations
    const recommendations = await aiEngine.recommendWorkerForTask(tempTask, workers);

    res.json({
      success: true,
      recommendations: recommendations.slice(0, 5) // Top 5 recommendations
    });
  } catch (error: any) {
    console.error('AI recommendation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/tasks/:id/recommendations
// @desc    Get AI recommendations for existing task reassignment
// @access  Private (Admin)
router.get('/:id/recommendations', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const workers = await User.find({ role: 'worker', isActive: true });
    const historicalTasks = await Task.find({ status: 'completed' })
      .populate('assignedTo')
      .limit(1000)
      .lean();

    await aiEngine.analyzeTaskHistory(historicalTasks);
    await aiEngine.buildWorkerProfiles(workers, historicalTasks);

    const recommendations = await aiEngine.recommendWorkerForTask(task, workers);

    res.json({
      success: true,
      currentAssignment: task.assignedTo,
      recommendations: recommendations.slice(0, 5)
    });
  } catch (error: any) {
    console.error('Task recommendation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tasks/weather-schedule
// @desc    Get weather-based task scheduling recommendations
// @access  Private (Admin)
router.post('/weather-schedule', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { taskIds } = req.body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Task IDs are required' });
    }

    const tasks = await Task.find({ _id: { $in: taskIds }, status: { $ne: 'completed' } });

    if (tasks.length === 0) {
      return res.status(404).json({ success: false, message: 'No tasks found' });
    }

    const recommendations = await weatherScheduler.recommendTaskSchedule(tasks);

    res.json({
      success: true,
      recommendations
    });
  } catch (error: any) {
    console.error('Weather schedule error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/tasks/weather-alerts
// @desc    Get weather alerts for upcoming tasks
// @access  Private (Admin)
router.get('/weather/alerts', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const upcomingTasks = await Task.find({
      status: { $in: ['pending', 'in-progress'] },
      dueDate: { $gte: new Date(), $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) }
    });

    const alerts = await weatherScheduler.getWeatherAlerts(upcomingTasks);

    res.json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error: any) {
    console.error('Weather alerts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
