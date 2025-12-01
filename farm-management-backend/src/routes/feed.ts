import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Feed } from '@/models/Feed';
import { Farm } from '@/models/Farm';
import { AppError, asyncHandler } from '@/middleware/errorHandler';
import { authMiddleware } from '@/middleware/auth';
import { logger } from '@/utils/logger';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/feed:
 *   get:
 *     summary: Get all feed types for the current farm
 *     tags: [Feed]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: farmId
 *         schema:
 *           type: string
 *         description: Farm ID to filter feed
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by feed type
 *       - in: query
 *         name: lowStock
 *         schema:
 *           type: boolean
 *         description: Show only low stock items
 *     responses:
 *       200:
 *         description: List of feed types
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { farmId, type, lowStock } = req.query;

  // Build query
  const query: any = {};
  
  if (farmId) {
    // Verify user has access to this farm
    const farm = await Farm.findOne({
      _id: farmId,
      $or: [{ owner: userId }, { managers: userId }]
    });
    if (!farm) {
      throw new AppError('Farm not found or access denied', 404);
    }
    query.farm = farmId;
  } else {
    // Get all farms user has access to
    const farms = await Farm.find({
      $or: [{ owner: userId }, { managers: userId }]
    }).select('_id');
    query.farm = { $in: farms.map(f => f._id) };
  }

  if (type) query.type = type;
  if (lowStock === 'true') {
    query.$expr = { $lte: ['$inventory.currentStock', '$inventory.reorderLevel'] };
  }

  const feeds = await Feed.find(query)
    .populate('farm', 'name')
    .sort({ name: 1 });

  res.json({
    success: true,
    count: feeds.length,
    data: feeds,
  });
}));

/**
 * @swagger
 * /api/feed:
 *   post:
 *     summary: Add new feed type
 *     tags: [Feed]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - farmId
 *               - name
 *               - type
 *               - supplier
 *               - nutritionFacts
 *               - inventory
 *             properties:
 *               farmId:
 *                 type: string
 *               name:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [hay, grain, pellets, silage, pasture, supplement, mineral, other]
 *               supplier:
 *                 type: string
 *               nutritionFacts:
 *                 type: object
 *               inventory:
 *                 type: object
 *     responses:
 *       201:
 *         description: Feed type added successfully
 */
router.post('/', [
  body('farmId').isMongoId().withMessage('Valid farm ID is required'),
  body('name').trim().isLength({ min: 1 }).withMessage('Feed name is required'),
  body('type').isIn(['hay', 'grain', 'pellets', 'silage', 'pasture', 'supplement', 'mineral', 'other']),
  body('supplier').trim().isLength({ min: 1 }).withMessage('Supplier is required'),
  body('nutritionFacts.protein').isNumeric(),
  body('nutritionFacts.fat').isNumeric(),
  body('nutritionFacts.fiber').isNumeric(),
  body('nutritionFacts.moisture').isNumeric(),
  body('nutritionFacts.energy').isNumeric(),
  body('inventory.currentStock').isNumeric(),
  body('inventory.reorderLevel').isNumeric(),
  body('inventory.costPerUnit').isNumeric(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const userId = (req as any).user.id;
  const { farmId, ...feedData } = req.body;

  // Verify user has access to this farm
  const farm = await Farm.findOne({
    _id: farmId,
    $or: [{ owner: userId }, { managers: userId }]
  });

  if (!farm) {
    throw new AppError('Farm not found or access denied', 404);
  }

  // Set last restocked date if not provided
  if (!feedData.inventory.lastRestocked) {
    feedData.inventory.lastRestocked = new Date();
  }

  const feed = new Feed({
    ...feedData,
    farm: farmId,
  });

  await feed.save();

  logger.info(`New feed type added: ${feed.name} by user ${userId}`);

  res.status(201).json({
    success: true,
    message: 'Feed type added successfully',
    data: feed,
  });
}));

/**
 * @swagger
 * /api/feed/{id}/usage:
 *   post:
 *     summary: Record feed usage
 *     tags: [Feed]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - quantity
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               animals:
 *                 type: array
 *                 items:
 *                   type: string
 *               quantity:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feed usage recorded successfully
 */
router.post('/:id/usage', [
  body('date').isISO8601().toDate(),
  body('quantity').isNumeric(),
  body('animals').optional().isArray(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const userId = (req as any).user.id;
  const feedId = req.params.id;

  const feed = await Feed.findById(feedId);
  if (!feed) {
    throw new AppError('Feed not found', 404);
  }

  // Verify user has access to this feed's farm
  const farm = await Farm.findOne({
    _id: feed.farm,
    $or: [{ owner: userId }, { managers: userId }]
  });

  if (!farm) {
    throw new AppError('Access denied', 403);
  }

  // Check if enough stock available
  if (feed.inventory.currentStock < req.body.quantity) {
    throw new AppError('Insufficient stock available', 400);
  }

  await feed.addUsage(req.body);

  res.json({
    success: true,
    message: 'Feed usage recorded successfully',
    data: feed,
  });
}));

/**
 * @swagger
 * /api/feed/{id}/restock:
 *   post:
 *     summary: Restock feed inventory
 *     tags: [Feed]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: number
 *               costPerUnit:
 *                 type: number
 *     responses:
 *       200:
 *         description: Feed restocked successfully
 */
router.post('/:id/restock', [
  body('quantity').isNumeric(),
  body('costPerUnit').optional().isNumeric(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const userId = (req as any).user.id;
  const feedId = req.params.id;

  const feed = await Feed.findById(feedId);
  if (!feed) {
    throw new AppError('Feed not found', 404);
  }

  // Verify user has access to this feed's farm
  const farm = await Farm.findOne({
    _id: feed.farm,
    $or: [{ owner: userId }, { managers: userId }]
  });

  if (!farm) {
    throw new AppError('Access denied', 403);
  }

  await feed.restock(req.body.quantity, req.body.costPerUnit);

  res.json({
    success: true,
    message: 'Feed restocked successfully',
    data: feed,
  });
}));

/**
 * @swagger
 * /api/feed/alerts:
 *   get:
 *     summary: Get feed alerts (low stock, expiring)
 *     tags: [Feed]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: farmId
 *         schema:
 *           type: string
 *         description: Farm ID to filter alerts
 *     responses:
 *       200:
 *         description: Feed alerts
 */
router.get('/alerts', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { farmId } = req.query;

  // Build query for farms user has access to
  const farmQuery: any = {
    $or: [{ owner: userId }, { managers: userId }]
  };

  if (farmId) {
    farmQuery._id = farmId;
  }

  const farms = await Farm.find(farmQuery).select('_id');
  const farmIds = farms.map(f => f._id);

  // Get low stock feeds
  const lowStockFeeds = await Feed.find({
    farm: { $in: farmIds },
    $expr: { $lte: ['$inventory.currentStock', '$inventory.reorderLevel'] }
  });

  // Get expiring feeds (within 30 days)
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const expiringFeeds = await Feed.find({
    farm: { $in: farmIds },
    'inventory.expiryDate': { $lte: thirtyDaysFromNow, $gte: new Date() }
  });

  res.json({
    success: true,
    data: {
      lowStock: lowStockFeeds,
      expiring: expiringFeeds,
    },
  });
}));

export default router;