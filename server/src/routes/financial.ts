import express, { Response } from 'express';
import FinancialRecord from '../models/FinancialRecord';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/financial
// @desc    Get all financial records
// @access  Private (Admin)
router.get('/', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};

    // Filter by type if provided
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by date range if provided
    if (req.query.startDate && req.query.endDate) {
      query.date = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string)
      };
    }

    const records = await FinancialRecord.find(query)
      .populate('recordedBy', 'name email')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: records.length,
      records
    });
  } catch (error: any) {
    console.error('Get financial records error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/financial/:id
// @desc    Get single financial record
// @access  Private (Admin)
router.get('/:id', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const record = await FinancialRecord.findById(req.params.id)
      .populate('recordedBy', 'name email');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    res.json({
      success: true,
      record
    });
  } catch (error: any) {
    console.error('Get financial record error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/financial
// @desc    Create financial record
// @access  Private (Admin)
router.post('/', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const recordData = {
      ...req.body,
      recordedBy: req.user?._id
    };

    const record = await FinancialRecord.create(recordData);

    const populatedRecord = await FinancialRecord.findById(record._id)
      .populate('recordedBy', 'name email');

    res.status(201).json({
      success: true,
      record: populatedRecord
    });
  } catch (error: any) {
    console.error('Create financial record error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/financial/:id
// @desc    Update financial record
// @access  Private (Admin)
router.put('/:id', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const record = await FinancialRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // Update all fields from request body except recordedBy
    const { recordedBy, ...updateData } = req.body;
    Object.assign(record, updateData);

    await record.save();

    const updatedRecord = await FinancialRecord.findById(record._id)
      .populate('recordedBy', 'name email');

    res.json({
      success: true,
      record: updatedRecord
    });
  } catch (error: any) {
    console.error('Update financial record error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/financial/:id
// @desc    Delete financial record
// @access  Private (Admin)
router.delete('/:id', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const record = await FinancialRecord.findById(req.params.id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    await record.deleteOne();

    res.json({
      success: true,
      message: 'Record deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete financial record error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/financial/stats/summary
// @desc    Get financial statistics summary
// @access  Private (Admin)
router.get('/stats/summary', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    // Get date range from query or default to current month
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : new Date();

    // Calculate total income
    const incomeResult = await FinancialRecord.aggregate([
      {
        $match: {
          type: 'income',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Calculate total expenses
    const expenseResult = await FinancialRecord.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Income by category
    const incomeByCategory = await FinancialRecord.aggregate([
      {
        $match: {
          type: 'income',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Expenses by category
    const expensesByCategory = await FinancialRecord.aggregate([
      {
        $match: {
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    const totalIncome = incomeResult[0]?.total || 0;
    const totalExpenses = expenseResult[0]?.total || 0;
    const netProfit = totalIncome - totalExpenses;

    res.json({
      success: true,
      stats: {
        totalIncome,
        totalExpenses,
        netProfit,
        profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0,
        incomeByCategory,
        expensesByCategory,
        dateRange: {
          start: startDate,
          end: endDate
        }
      }
    });
  } catch (error: any) {
    console.error('Get financial stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/financial/stats/monthly
// @desc    Get monthly financial trends (last 12 months)
// @access  Private (Admin)
router.get('/stats/monthly', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyData = await FinancialRecord.aggregate([
      {
        $match: {
          date: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      success: true,
      monthlyData
    });
  } catch (error: any) {
    console.error('Get monthly stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
