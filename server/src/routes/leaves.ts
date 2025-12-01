import express, { Response } from 'express';
import LeaveRequest from '../models/LeaveRequest';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/leaves
// @desc    Get all leave requests (admin) or own leave requests (worker)
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};

    // Workers only see their own leave requests
    if (req.user?.role === 'worker') {
      query.worker = req.user._id;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    const leaves = await LeaveRequest.find(query)
      .populate('worker', 'name username avatar')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: leaves.length,
      leaves
    });
  } catch (error: any) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/leaves/:id
// @desc    Get single leave request
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id)
      .populate('worker', 'name username avatar')
      .populate('reviewedBy', 'name email');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Workers can only view their own leave requests
    if (req.user?.role === 'worker' && leave.worker.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this leave request' });
    }

    res.json({
      success: true,
      leave
    });
  } catch (error: any) {
    console.error('Get leave request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/leaves
// @desc    Create leave request (worker submits)
// @access  Private (Worker)
router.post('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const {
      type,
      startDate,
      endDate,
      reason
    } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    const leave = await LeaveRequest.create({
      worker: req.user?._id,
      type,
      startDate: start,
      endDate: end,
      reason,
      status: 'pending'
    });

    const populatedLeave = await LeaveRequest.findById(leave._id)
      .populate('worker', 'name username avatar');

    res.status(201).json({
      success: true,
      leave: populatedLeave
    });
  } catch (error: any) {
    console.error('Create leave request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/leaves/:id
// @desc    Update leave request (worker can edit pending requests)
// @access  Private (Worker)
router.put('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Workers can only edit their own pending leave requests
    if (leave.worker.toString() !== req.user?._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this leave request' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Cannot edit leave request that has been reviewed' });
    }

    const {
      type,
      startDate,
      endDate,
      reason
    } = req.body;

    // Update fields
    if (type) leave.type = type;
    if (startDate) leave.startDate = new Date(startDate);
    if (endDate) leave.endDate = new Date(endDate);
    if (reason) leave.reason = reason;

    // Validate dates
    if (leave.endDate < leave.startDate) {
      return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    await leave.save();

    const updatedLeave = await LeaveRequest.findById(leave._id)
      .populate('worker', 'name username avatar');

    res.json({
      success: true,
      leave: updatedLeave
    });
  } catch (error: any) {
    console.error('Update leave request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/leaves/:id/review
// @desc    Approve or deny leave request
// @access  Private (Admin)
router.put('/:id/review', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    const { status, reviewNotes } = req.body;

    if (!['approved', 'denied'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be approved or denied' });
    }

    leave.status = status;
    leave.reviewedBy = req.user?._id as any;
    leave.reviewedAt = new Date();
    if (reviewNotes) leave.reviewNotes = reviewNotes;

    await leave.save();

    const updatedLeave = await LeaveRequest.findById(leave._id)
      .populate('worker', 'name username avatar')
      .populate('reviewedBy', 'name email');

    res.json({
      success: true,
      leave: updatedLeave
    });
  } catch (error: any) {
    console.error('Review leave request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/leaves/:id
// @desc    Delete leave request (worker can delete pending requests, admin can delete any)
// @access  Private
router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    // Workers can only delete their own pending requests
    if (req.user?.role === 'worker') {
      if (leave.worker.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to delete this leave request' });
      }
      if (leave.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Cannot delete leave request that has been reviewed' });
      }
    }

    await leave.deleteOne();

    res.json({
      success: true,
      message: 'Leave request deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete leave request error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
