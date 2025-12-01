import express from 'express';
import mongoose from 'mongoose';
import { VeterinaryRecord, IVeterinaryRecord } from '../models/VeterinaryRecord';
import { Animal } from '../models/Animal';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Get all veterinary records for a farm
router.get('/', authMiddleware, async (req, res): Promise<any> => {
  try {
    const { farmId } = req.query;
    const { page = 1, limit = 10, status, type, animalId, upcoming } = req.query;

    if (!farmId) {
      return res.status(400).json({
        success: false,
        message: 'Farm ID is required',
      });
    }

    // Build filter
    const filter: any = { farm: farmId };
    
    if (status) {
      filter['appointment.status'] = status;
    }
    
    if (type) {
      filter['appointment.type'] = type;
    }
    
    if (animalId) {
      filter.animal = animalId;
    }

    if (upcoming === 'true') {
      filter['appointment.scheduledDate'] = { $gte: new Date() };
      filter['appointment.status'] = { $in: ['scheduled'] };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [records, total] = await Promise.all([
      VeterinaryRecord.find(filter)
        .populate('animal', 'tagNumber name species breed')
        .populate('createdBy', 'name email')
        .sort({ 'appointment.scheduledDate': -1 })
        .skip(skip)
        .limit(limitNum),
      VeterinaryRecord.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      data: {
        records,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching veterinary records:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch veterinary records',
    });
  }
});

// Get upcoming appointments
router.get('/upcoming', authMiddleware, async (req, res): Promise<any> => {
  try {
    const { farmId, days = 7 } = req.query;

    if (!farmId) {
      return res.status(400).json({
        success: false,
        message: 'Farm ID is required',
      });
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days as string, 10));

    const appointments = await VeterinaryRecord.find({
      farm: farmId,
      'appointment.scheduledDate': {
        $gte: new Date(),
        $lte: endDate,
      },
      'appointment.status': 'scheduled',
    })
      .populate('animal', 'tagNumber name species breed')
      .sort({ 'appointment.scheduledDate': 1 });

    return res.json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming appointments',
    });
  }
});

// Get overdue follow-ups
router.get('/overdue-followups', authMiddleware, async (req, res): Promise<any> => {
  try {
    const { farmId } = req.query;

    if (!farmId) {
      return res.status(400).json({
        success: false,
        message: 'Farm ID is required',
      });
    }

    const overdueFollowUps = await VeterinaryRecord.find({
      farm: farmId,
      'treatment.followUpRequired': true,
      'treatment.followUpDate': { $lt: new Date() },
      'appointment.status': 'completed',
    })
      .populate('animal', 'tagNumber name species breed')
      .sort({ 'treatment.followUpDate': 1 });

    return res.json({
      success: true,
      data: overdueFollowUps,
    });
  } catch (error) {
    console.error('Error fetching overdue follow-ups:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch overdue follow-ups',
    });
  }
});

// Get veterinary record by ID
router.get('/:id', authMiddleware, async (req, res): Promise<any> => {
  try {
    const record = await VeterinaryRecord.findById(req.params.id)
      .populate('animal', 'tagNumber name species breed dateOfBirth')
      .populate('createdBy', 'name email');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Veterinary record not found',
      });
    }

    return res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Error fetching veterinary record:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch veterinary record',
    });
  }
});

// Create new veterinary record
router.post('/', authMiddleware, async (req, res): Promise<any> => {
  try {
    const userId = (req as any).user.id;
    
    // Verify animal exists and belongs to the farm
    const animal = await Animal.findById(req.body.animal);
    if (!animal) {
      return res.status(404).json({
        success: false,
        message: 'Animal not found',
      });
    }

    if (animal.farm.toString() !== req.body.farm) {
      return res.status(400).json({
        success: false,
        message: 'Animal does not belong to the specified farm',
      });
    }

    const recordData = {
      ...req.body,
      createdBy: userId,
    };

    const record = new VeterinaryRecord(recordData);
    await record.save();

    const populatedRecord = await VeterinaryRecord.findById(record._id)
      .populate('animal', 'tagNumber name species breed')
      .populate('createdBy', 'name email');

    return res.status(201).json({
      success: true,
      data: populatedRecord,
    });
  } catch (error) {
    console.error('Error creating veterinary record:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create veterinary record',
    });
  }
});

// Update veterinary record
router.put('/:id', authMiddleware, async (req, res): Promise<any> => {
  try {
    const record = await VeterinaryRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
      .populate('animal', 'tagNumber name species breed')
      .populate('createdBy', 'name email');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Veterinary record not found',
      });
    }

    return res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Error updating veterinary record:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update veterinary record',
    });
  }
});

// Mark appointment as completed
router.patch('/:id/complete', authMiddleware, async (req, res): Promise<any> => {
  try {
    const { actualDate, examination, treatment, costs, notes } = req.body;

    const record = await VeterinaryRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Veterinary record not found',
      });
    }

    // Update record with completion data
    record.appointment.status = 'completed';
    record.appointment.actualDate = actualDate || new Date();
    
    if (examination) {
      record.examination = { ...record.examination, ...examination };
    }
    
    if (treatment) {
      record.treatment = { ...record.treatment, ...treatment };
    }
    
    if (costs) {
      record.costs = { ...record.costs, ...costs };
    }
    
    if (notes) {
      record.notes = notes;
    }

    await record.save();

    const populatedRecord = await VeterinaryRecord.findById(record._id)
      .populate('animal', 'tagNumber name species breed')
      .populate('createdBy', 'name email');

    return res.json({
      success: true,
      data: populatedRecord,
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to complete appointment',
    });
  }
});

// Add document to veterinary record
router.post('/:id/documents', authMiddleware, async (req, res): Promise<any> => {
  try {
    const record = await VeterinaryRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Veterinary record not found',
      });
    }

    const document = {
      ...req.body,
      uploadDate: new Date(),
    };

    record.documents.push(document);
    await record.save();

    return res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Error adding document:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add document',
    });
  }
});

// Mark payment as paid
router.patch('/:id/payment', authMiddleware, async (req, res): Promise<any> => {
  try {
    const { paymentStatus, paymentDate } = req.body;

    const record = await VeterinaryRecord.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Veterinary record not found',
      });
    }

    record.costs.paymentStatus = paymentStatus;
    if (paymentDate) {
      record.costs.paymentDate = paymentDate;
    }

    await record.save();

    return res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
    });
  }
});

// Get veterinary analytics
router.get('/analytics/summary', authMiddleware, async (req, res): Promise<any> => {
  try {
    const { farmId, year } = req.query;

    if (!farmId) {
      return res.status(400).json({
        success: false,
        message: 'Farm ID is required',
      });
    }

    const currentYear = year ? parseInt(year as string, 10) : new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear + 1, 0, 1);

    const [
      totalRecords,
      upcomingAppointments,
      overdueFollowUps,
      costSummary,
      appointmentsByType,
      monthlyTrends,
    ] = await Promise.all([
      // Total records this year
      VeterinaryRecord.countDocuments({
        farm: farmId,
        createdAt: { $gte: startDate, $lt: endDate },
      }),

      // Upcoming appointments (next 30 days)
      VeterinaryRecord.countDocuments({
        farm: farmId,
        'appointment.scheduledDate': {
          $gte: new Date(),
          $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        'appointment.status': 'scheduled',
      }),

      // Overdue follow-ups
      VeterinaryRecord.countDocuments({
        farm: farmId,
        'treatment.followUpRequired': true,
        'treatment.followUpDate': { $lt: new Date() },
        'appointment.status': 'completed',
      }),

      // Cost summary
      VeterinaryRecord.aggregate([
        {
          $match: {
            farm: new mongoose.Types.ObjectId(farmId as string),
            createdAt: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalCosts: { $sum: '$costs.totalCost' },
            totalPaid: {
              $sum: {
                $cond: [
                  { $eq: ['$costs.paymentStatus', 'paid'] },
                  '$costs.totalCost',
                  0,
                ],
              },
            },
            totalPending: {
              $sum: {
                $cond: [
                  { $eq: ['$costs.paymentStatus', 'pending'] },
                  '$costs.totalCost',
                  0,
                ],
              },
            },
          },
        },
      ]),

      // Appointments by type
      VeterinaryRecord.aggregate([
        {
          $match: {
            farm: new mongoose.Types.ObjectId(farmId as string),
            createdAt: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $group: {
            _id: '$appointment.type',
            count: { $sum: 1 },
          },
        },
      ]),

      // Monthly trends
      VeterinaryRecord.aggregate([
        {
          $match: {
            farm: new mongoose.Types.ObjectId(farmId as string),
            createdAt: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: '$createdAt' },
              year: { $year: '$createdAt' },
            },
            count: { $sum: 1 },
            totalCost: { $sum: '$costs.totalCost' },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 },
        },
      ]),
    ]);

    return res.json({
      success: true,
      data: {
        summary: {
          totalRecords,
          upcomingAppointments,
          overdueFollowUps,
          costs: costSummary[0] || {
            totalCosts: 0,
            totalPaid: 0,
            totalPending: 0,
          },
        },
        appointmentsByType,
        monthlyTrends,
      },
    });
  } catch (error) {
    console.error('Error fetching veterinary analytics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch veterinary analytics',
    });
  }
});

// Delete veterinary record
router.delete('/:id', authMiddleware, async (req, res): Promise<any> => {
  try {
    const record = await VeterinaryRecord.findByIdAndDelete(req.params.id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Veterinary record not found',
      });
    }

    return res.json({
      success: true,
      message: 'Veterinary record deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting veterinary record:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete veterinary record',
    });
  }
});

export default router;