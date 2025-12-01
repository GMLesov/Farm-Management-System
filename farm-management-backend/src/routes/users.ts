import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '@/models/User';
import { Farm } from '@/models/Farm';
import { AppError, asyncHandler } from '@/middleware/errorHandler';
import { authMiddleware } from '@/middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 */
router.get('/profile', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  const user = await User.findById(userId).populate('currentFarm', 'name');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: user,
  });
}));

/**
 * @swagger
 * /api/users/search:
 *   get:
 *     summary: Search users by email
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *         description: Email to search for (exact or partial, case-insensitive)
 *     responses:
 *       200:
 *         description: Matching users
 */
router.get('/search', asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.query as { email?: string };
  if (!email || !email.trim()) {
    throw new AppError('Email query is required', 400);
  }

  // Case-insensitive partial match
  const regex = new RegExp(email.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const users = await User.find({ email: { $regex: regex } })
    .select('firstName lastName email role createdAt')
    .limit(10)
    .sort({ createdAt: -1 });

  res.json({ success: true, count: users.length, data: users });
}));

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               preferences:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const updates = req.body;

  // Remove sensitive fields that shouldn't be updated via this endpoint
  delete updates.email;
  delete updates.password;
  delete updates.role;
  delete updates.isVerified;

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  });
}));

/**
 * @swagger
 * /api/users/switch-farm/{farmId}:
 *   post:
 *     summary: Switch current active farm
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: farmId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Farm switched successfully
 */
router.post('/switch-farm/:farmId', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const farmId = req.params.farmId;

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if user has access to this farm
  const farm = await Farm.findOne({
    _id: farmId,
    $or: [
      { owner: userId },
      { managers: userId }
    ]
  });

  if (!farm) {
    throw new AppError('Farm not found or access denied', 404);
  }

  await user.switchCurrentFarm(new mongoose.Types.ObjectId(farmId));

  res.json({
    success: true,
    message: 'Current farm switched successfully',
    data: {
      currentFarm: farmId,
      farmName: farm.name,
    },
  });
}));

export default router;