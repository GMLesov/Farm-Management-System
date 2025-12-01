import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import { Farm } from '@/models/Farm';
import { User } from '@/models/User';
import { AppError, asyncHandler } from '@/middleware/errorHandler';
import { authMiddleware } from '@/middleware/auth';
import { logger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/farms:
 *   get:
 *     summary: Get all farms for the authenticated user
 *     tags: [Farms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of farms
 */
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const farms = await Farm.find({
    $or: [
      { owner: userId },
      { managers: userId }
    ]
  }).populate('owner', 'firstName lastName email')
    .populate('managers', 'firstName lastName email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: farms.length,
    data: farms,
  });
}));

/**
 * @swagger
 * /api/farms/{id}:
 *   get:
 *     summary: Get a specific farm by ID
 *     tags: [Farms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Farm details
 *       404:
 *         description: Farm not found
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const farmId = req.params.id;

  const farm = await Farm.findOne({
    _id: farmId,
    $or: [
      { owner: userId },
      { managers: userId }
    ]
  }).populate('owner', 'firstName lastName email')
    .populate('managers', 'firstName lastName email')
    .populate('crops');

  if (!farm) {
    throw new AppError('Farm not found', 404);
  }

  res.json({
    success: true,
    data: farm,
  });
}));

/**
 * @swagger
 * /api/farms:
 *   post:
 *     summary: Create a new farm
 *     tags: [Farms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *               - size
 *               - soilType
 *               - climateZone
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               location:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   country:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   latitude:
 *                     type: number
 *                   longitude:
 *                     type: number
 *               size:
 *                 type: number
 *               soilType:
 *                 type: string
 *               climateZone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Farm created successfully
 */
router.post('/', [
  body('name').trim().isLength({ min: 1 }).withMessage('Farm name is required'),
  body('location.address').trim().isLength({ min: 1 }).withMessage('Address is required'),
  body('location.city').trim().isLength({ min: 1 }).withMessage('City is required'),
  body('location.state').trim().isLength({ min: 1 }).withMessage('State is required'),
  body('location.country').trim().isLength({ min: 1 }).withMessage('Country is required'),
  body('location.latitude').isNumeric().withMessage('Valid latitude is required'),
  body('location.longitude').isNumeric().withMessage('Valid longitude is required'),
  body('size').isNumeric().withMessage('Valid size is required'),
  body('soilType').trim().isLength({ min: 1 }).withMessage('Soil type is required'),
  body('climateZone').trim().isLength({ min: 1 }).withMessage('Climate zone is required'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const userId = (req as any).user.id;
  const farmData = { ...req.body, owner: userId };

  const farm = new Farm(farmData);
  await farm.save();

  // Add farm to user's farms list
  const user = await User.findById(userId);
  if (user) {
    await user.addFarm(farm._id as unknown as mongoose.Types.ObjectId);
  }

  logger.info(`New farm created: ${farm.name} by user ${userId}`);

  res.status(201).json({
    success: true,
    message: 'Farm created successfully',
    data: farm,
  });
}));

/**
 * @swagger
 * /api/farms/{id}:
 *   put:
 *     summary: Update a farm
 *     tags: [Farms]
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
 *             $ref: '#/components/schemas/Farm'
 *     responses:
 *       200:
 *         description: Farm updated successfully
 *       404:
 *         description: Farm not found
 */
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const farmId = req.params.id;

  const farm = await Farm.findOne({
    _id: farmId,
    owner: userId // Only owner can update farm details
  });

  if (!farm) {
    throw new AppError('Farm not found or you are not authorized to update it', 404);
  }

  // Update farm with new data
  Object.assign(farm, req.body);
  await farm.save();

  logger.info(`Farm updated: ${farm.name} by user ${userId}`);

  res.json({
    success: true,
    message: 'Farm updated successfully',
    data: farm,
  });
}));

/**
 * @swagger
 * /api/farms/{id}/managers:
 *   post:
 *     summary: Add an existing user as a manager to a farm (owner-only)
 *     tags: [Farms]
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
 *             required: [userId]
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Manager added successfully
 */
router.post('/:id/managers', [
  body('userId').isMongoId().withMessage('Valid userId is required'),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const userId = (req as any).user.id;
  const farmId = req.params.id;
  const { userId: managerId } = req.body as { userId: string };

  // Only owner can modify managers
  const farm = await Farm.findOne({ _id: farmId, owner: userId });
  if (!farm) {
    throw new AppError('Farm not found or you are not authorized to update managers', 404);
  }

  const manager = await User.findById(managerId);
  if (!manager) {
    throw new AppError('User to add as manager not found', 404);
  }

  if (!farm.managers.some((m: any) => (m as any).toString() === managerId)) {
    (farm.managers as any).push(new mongoose.Types.ObjectId(managerId));
    await farm.save();
  }
  await manager.addFarm(new mongoose.Types.ObjectId(farmId));

  res.json({ success: true, message: 'Manager added successfully', data: await farm.populate('managers', 'firstName lastName email') });
}));

/**
 * @swagger
 * /api/farms/{id}/managers/invite:
 *   post:
 *     summary: Invite a user by email to become a manager (creates account if needed)
 *     tags: [Farms]
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
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Manager invited/added successfully
 */
router.post('/:id/managers/invite', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('firstName').optional().isString(),
  body('lastName').optional().isString(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const ownerId = (req as any).user.id;
  const farmId = req.params.id;
  const { email, firstName = 'Invited', lastName = 'User' } = req.body as { email: string; firstName?: string; lastName?: string };

  // Only owner can invite managers
  const farm = await Farm.findOne({ _id: farmId, owner: ownerId });
  if (!farm) {
    throw new AppError('Farm not found or you are not authorized to invite managers', 404);
  }

  // Find or create the user
  let user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    user = new User({
      email: email.toLowerCase(),
      firstName,
      lastName,
      role: 'supervisor',
      isVerified: false,
      invitedAt: new Date(),
      invitedBy: new mongoose.Types.ObjectId(ownerId),
      inviteToken: uuidv4(),
      farms: [],
    } as any);
    await user.save();
  }

  // Add to farm managers and add farm to user's farms list
  if (!farm.managers.some((m: any) => (m as any).toString() === (user._id as any).toString())) {
    (farm.managers as any).push(user._id as any);
    await farm.save();
  }
  await user.addFarm(new mongoose.Types.ObjectId(farmId));

  logger.info(`User ${email} invited/added as manager to farm ${farmId} by owner ${ownerId}`);

  res.json({ success: true, message: 'Manager invited/added successfully', data: await farm.populate('managers', 'firstName lastName email') });
}));

/**
 * @swagger
 * /api/farms/{id}:
 *   delete:
 *     summary: Delete a farm
 *     tags: [Farms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Farm deleted successfully
 *       404:
 *         description: Farm not found
 */
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const farmId = req.params.id;

  const farm = await Farm.findOne({
    _id: farmId,
    owner: userId // Only owner can delete farm
  });

  if (!farm) {
    throw new AppError('Farm not found or you are not authorized to delete it', 404);
  }

  await farm.deleteOne();

  // Remove farm from all users' farms lists
  await User.updateMany(
    { farms: farmId },
    { $pull: { farms: farmId } }
  );

  logger.info(`Farm deleted: ${farm.name} by user ${userId}`);

  res.json({
    success: true,
    message: 'Farm deleted successfully',
  });
}));

export default router;