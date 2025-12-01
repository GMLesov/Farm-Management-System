import express, { Response } from 'express';
import CalendarEvent from '../models/CalendarEvent';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/calendar
// @desc    Get all calendar events (or filter by date range)
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};

    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string)
      };
    }

    // Filter by type if provided
    if (req.query.type) {
      query.type = req.query.type;
    }

    const events = await CalendarEvent.find(query)
      .populate('workers', 'name username avatar')
      .populate('createdBy', 'name email')
      .sort({ date: 1 });

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error: any) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/calendar/:id
// @desc    Get single calendar event
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const event = await CalendarEvent.findById(req.params.id)
      .populate('workers', 'name username avatar')
      .populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    res.json({
      success: true,
      event
    });
  } catch (error: any) {
    console.error('Get calendar event error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/calendar
// @desc    Create calendar event
// @access  Private (Admin)
router.post('/', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      date,
      type,
      workers,
      description,
      color
    } = req.body;

    const event = await CalendarEvent.create({
      title,
      date,
      type,
      workers,
      description,
      color,
      createdBy: req.user?._id
    });

    const populatedEvent = await CalendarEvent.findById(event._id)
      .populate('workers', 'name username avatar')
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      event: populatedEvent
    });
  } catch (error: any) {
    console.error('Create calendar event error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/calendar/:id
// @desc    Update calendar event
// @access  Private (Admin)
router.put('/:id', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const {
      title,
      date,
      type,
      workers,
      description,
      color
    } = req.body;

    // Update fields
    if (title) event.title = title;
    if (date) event.date = date;
    if (type) event.type = type;
    if (workers) event.workers = workers;
    if (description) event.description = description;
    if (color) event.color = color;

    await event.save();

    const updatedEvent = await CalendarEvent.findById(event._id)
      .populate('workers', 'name username avatar')
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      event: updatedEvent
    });
  } catch (error: any) {
    console.error('Update calendar event error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/calendar/:id
// @desc    Delete calendar event
// @access  Private (Admin)
router.delete('/:id', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const event = await CalendarEvent.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await event.deleteOne();

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete calendar event error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/calendar/worker/:workerId
// @desc    Get calendar events for specific worker
// @access  Private
router.get('/worker/:workerId', protect, async (req: AuthRequest, res: Response) => {
  try {
    // Workers can only view their own events, admins can view any
    if (req.user?.role === 'worker' && req.user._id.toString() !== req.params.workerId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const events = await CalendarEvent.find({
      workers: req.params.workerId
    })
      .populate('workers', 'name username avatar')
      .populate('createdBy', 'name email')
      .sort({ date: 1 });

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (error: any) {
    console.error('Get worker events error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
