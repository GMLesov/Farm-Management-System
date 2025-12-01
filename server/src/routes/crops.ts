import express, { Response } from 'express';
import Crop from '../models/Crop';
import CropTask from '../models/CropTask';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// @route   GET /api/crops
// @desc    Get all crops
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};

    // Filter by type if provided
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    const crops = await Crop.find(query)
      .populate('activities.performedBy', 'name username')
      .sort({ plantingDate: -1 });

    res.json({
      success: true,
      count: crops.length,
      crops
    });
  } catch (error: any) {
    console.error('Get crops error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/crops/:id
// @desc    Get single crop
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const crop = await Crop.findById(req.params.id)
      .populate('activities.performedBy', 'name username');

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    res.json({
      success: true,
      crop
    });
  } catch (error: any) {
    console.error('Get crop error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/crops
// @desc    Create crop
// @access  Private (Admin)
router.post('/', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const crop = await Crop.create(req.body);

    res.status(201).json({
      success: true,
      crop
    });
  } catch (error: any) {
    console.error('Create crop error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/crops/:id
// @desc    Update crop
// @access  Private (Admin)
router.put('/:id', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    // Update all fields from request body
    Object.assign(crop, req.body);

    await crop.save();

    const updatedCrop = await Crop.findById(crop._id)
      .populate('activities.performedBy', 'name username');

    res.json({
      success: true,
      crop: updatedCrop
    });
  } catch (error: any) {
    console.error('Update crop error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/crops/:id/activity
// @desc    Add crop activity
// @access  Private
router.post('/:id/activity', protect, async (req: AuthRequest, res: Response) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    const { date, type, description, cost } = req.body;

    crop.activities.push({
      date: new Date(date),
      type,
      description,
      cost,
      performedBy: req.user?._id as any
    });

    await crop.save();

    const updatedCrop = await Crop.findById(crop._id)
      .populate('activities.performedBy', 'name username');

    res.json({
      success: true,
      crop: updatedCrop
    });
  } catch (error: any) {
    console.error('Add crop activity error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/crops/:id/expense
// @desc    Add crop expense
// @access  Private (Admin)
router.post('/:id/expense', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    const { date, category, amount, description } = req.body;

    crop.expenses.push({
      date: new Date(date),
      category,
      amount,
      description
    });

    await crop.save();

    res.json({
      success: true,
      crop
    });
  } catch (error: any) {
    console.error('Add crop expense error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/crops/:id/harvest
// @desc    Mark crop as harvested and record yield
// @access  Private (Admin)
router.put('/:id/harvest', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    const { actualHarvestDate, yieldAmount, yieldUnit, qualityGrade } = req.body;

    crop.status = 'harvested';
    crop.actualHarvestDate = actualHarvestDate ? new Date(actualHarvestDate) : new Date();
    if (yieldAmount) crop.yieldAmount = yieldAmount;
    if (yieldUnit) crop.yieldUnit = yieldUnit;
    if (qualityGrade) crop.qualityGrade = qualityGrade;

    // Add harvest activity
    crop.activities.push({
      date: crop.actualHarvestDate,
      type: 'harvest',
      description: `Harvested ${yieldAmount || ''} ${yieldUnit || ''}`,
      performedBy: req.user?._id as any
    });

    await crop.save();

    const updatedCrop = await Crop.findById(crop._id)
      .populate('activities.performedBy', 'name username');

    res.json({
      success: true,
      crop: updatedCrop
    });
  } catch (error: any) {
    console.error('Harvest crop error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/crops/:id
// @desc    Delete crop
// @access  Private (Admin)
router.delete('/:id', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    await crop.deleteOne();

    res.json({
      success: true,
      message: 'Crop deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete crop error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/crops/stats/summary
// @desc    Get crop statistics summary
// @access  Private
router.get('/stats/summary', protect, async (req: AuthRequest, res: Response) => {
  try {
    const totalCrops = await Crop.countDocuments();
    const activeCrops = await Crop.countDocuments({ status: { $in: ['planted', 'growing'] } });
    const harvestedCrops = await Crop.countDocuments({ status: 'harvested' });

    const cropsByType = await Crop.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const cropsByStatus = await Crop.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalCrops,
        active: activeCrops,
        harvested: harvestedCrops,
        byType: cropsByType,
        byStatus: cropsByStatus
      }
    });
  } catch (error: any) {
    console.error('Get crop stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/crops/:id/tasks
// @desc    Schedule task for crop
// @access  Private
router.post('/:id/tasks', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const crop = await Crop.findById(req.params.id);

  if (!crop) {
    res.status(404).json({ success: false, message: 'Crop not found' });
    return;
  }

  const { title, description, taskType, priority, scheduledDate, assignedTo, estimatedDuration, cost, notes } = req.body;

  // Create task in dedicated collection
  const task = await CropTask.create({
    cropId: req.params.id,
    title: title || `${taskType} task`,
    description,
    taskType,
    priority: priority || 'medium',
    status: 'pending',
    scheduledDate: scheduledDate || new Date(),
    assignedTo,
    estimatedDuration,
    cost,
    notes,
    createdBy: req.user?._id
  });

  // Populate related fields
  await task.populate('cropId', 'name type fieldLocation');
  await task.populate('assignedTo', 'name email');

  res.status(201).json({
    success: true,
    message: 'Task scheduled successfully',
    task
  });
}));

// @route   GET /api/crops/:id/tasks
// @desc    Get all tasks for a crop
// @access  Private
router.get('/:id/tasks', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const crop = await Crop.findById(req.params.id);

  if (!crop) {
    res.status(404).json({ success: false, message: 'Crop not found' });
    return;
  }

  // Get tasks from dedicated collection
  const tasks = await CropTask.find({ cropId: req.params.id })
    .sort({ scheduledDate: 1 })
    .populate('cropId', 'name type fieldLocation')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  res.json({
    success: true,
    count: tasks.length,
    tasks
  });
}));

// @route   GET /api/crops/tasks/upcoming
// @desc    Get all upcoming tasks across all crops
// @access  Private
router.get('/tasks/upcoming', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const days = parseInt(req.query.days as string) || 7;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);
  futureDate.setHours(23, 59, 59, 999);

  // Get upcoming tasks from dedicated collection
  const tasks = await CropTask.find({
    scheduledDate: { $gte: today, $lte: futureDate },
    status: { $in: ['pending', 'in-progress'] }
  })
    .sort({ scheduledDate: 1, priority: -1 })
    .populate('cropId', 'name type fieldLocation status')
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  res.json({
    success: true,
    count: tasks.length,
    tasks
  });
}));

// @route   PUT /api/crops/tasks/:taskId
// @desc    Update task (status, completion, etc.)
// @access  Private
router.put('/tasks/:taskId', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await CropTask.findById(req.params.taskId);

  if (!task) {
    res.status(404).json({ success: false, message: 'Task not found' });
    return;
  }

  const { status, actualDuration, notes, completedDate } = req.body;

  if (status) task.status = status;
  if (actualDuration) task.actualDuration = actualDuration;
  if (notes) task.notes = notes;
  if (completedDate) task.completedDate = new Date(completedDate);

  await task.save();
  await task.populate('cropId', 'name type fieldLocation');
  await task.populate('assignedTo', 'name email');

  res.json({
    success: true,
    message: 'Task updated successfully',
    task
  });
}));

// @route   DELETE /api/crops/tasks/:taskId
// @desc    Delete task
// @access  Private (Admin)
router.delete('/tasks/:taskId', protect, adminOnly, asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await CropTask.findById(req.params.taskId);

  if (!task) {
    res.status(404).json({ success: false, message: 'Task not found' });
    return;
  }

  await task.deleteOne();

  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
}));

// @route   PUT /api/crops/tasks/:taskId/complete
// @desc    Mark task as completed
// @access  Private
router.put('/tasks/:taskId/complete', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const task = await CropTask.findById(req.params.taskId);

  if (!task) {
    res.status(404).json({ success: false, message: 'Task not found' });
    return;
  }

  task.status = 'completed';
  task.completedDate = new Date();
  if (req.body.actualDuration) {
    task.actualDuration = req.body.actualDuration;
  }

  await task.save();
  await task.populate('cropId', 'name type fieldLocation');

  res.json({
    success: true,
    message: 'Task marked as completed',
    task
  });
}));

export default router;
