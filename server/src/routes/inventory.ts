import express, { Response } from 'express';
import InventoryItem from '../models/InventoryItem';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/inventory
// @desc    Get all inventory items
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};

    // Filter by category if provided
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by low stock if requested
    if (req.query.lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$minimumStock'] };
    }

    const items = await InventoryItem.find(query)
      .populate('transactions.performedBy', 'name username')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: items.length,
      items
    });
  } catch (error: any) {
    console.error('Get inventory error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/inventory/:id
// @desc    Get single inventory item
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const item = await InventoryItem.findById(req.params.id)
      .populate('transactions.performedBy', 'name username');

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({
      success: true,
      item
    });
  } catch (error: any) {
    console.error('Get inventory item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/inventory
// @desc    Create inventory item
// @access  Private (Admin)
router.post('/', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const item = await InventoryItem.create(req.body);

    res.status(201).json({
      success: true,
      item
    });
  } catch (error: any) {
    console.error('Create inventory item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private (Admin)
router.put('/:id', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Update all fields from request body
    Object.assign(item, req.body);

    await item.save();

    res.json({
      success: true,
      item
    });
  } catch (error: any) {
    console.error('Update inventory item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/inventory/:id/transaction
// @desc    Add inventory transaction (purchase, usage, adjustment, waste)
// @access  Private
router.post('/:id/transaction', protect, async (req: AuthRequest, res: Response) => {
  try {
    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const { type, quantity, reason, date } = req.body;

    if (!type || !quantity) {
      return res.status(400).json({ success: false, message: 'Please provide type and quantity' });
    }

    // Add transaction
    item.transactions.push({
      date: date ? new Date(date) : new Date(),
      type,
      quantity,
      reason,
      performedBy: req.user?._id as any
    });

    // Update item quantity based on transaction type
    if (type === 'purchase' || type === 'adjustment') {
      item.quantity += quantity;
    } else if (type === 'usage' || type === 'waste') {
      item.quantity -= quantity;
      if (item.quantity < 0) {
        return res.status(400).json({ success: false, message: 'Insufficient quantity' });
      }
    }

    await item.save();

    const updatedItem = await InventoryItem.findById(item._id)
      .populate('transactions.performedBy', 'name username');

    res.json({
      success: true,
      item: updatedItem
    });
  } catch (error: any) {
    console.error('Add transaction error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Private (Admin)
router.delete('/:id', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    await item.deleteOne();

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/inventory/alerts/low-stock
// @desc    Get low stock items
// @access  Private
router.get('/alerts/low-stock', protect, async (req: AuthRequest, res: Response) => {
  try {
    const lowStockItems = await InventoryItem.find({
      $expr: { $lte: ['$quantity', '$minimumStock'] }
    }).sort({ name: 1 });

    res.json({
      success: true,
      count: lowStockItems.length,
      items: lowStockItems
    });
  } catch (error: any) {
    console.error('Get low stock items error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/inventory/stats/summary
// @desc    Get inventory statistics summary
// @access  Private
router.get('/stats/summary', protect, async (req: AuthRequest, res: Response) => {
  try {
    const totalItems = await InventoryItem.countDocuments();
    const lowStockCount = await InventoryItem.countDocuments({
      $expr: { $lte: ['$quantity', '$minimumStock'] }
    });

    const itemsByCategory = await InventoryItem.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalValue' }
        }
      }
    ]);

    const totalValue = await InventoryItem.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$totalValue' }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalItems,
        lowStockCount,
        totalValue: totalValue[0]?.total || 0,
        byCategory: itemsByCategory
      }
    });
  } catch (error: any) {
    console.error('Get inventory stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
