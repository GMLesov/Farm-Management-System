import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth';
import { AnalyticsController } from '@/controllers/analyticsController';

const router = Router();
router.use(authMiddleware);

// Overview analytics for the entire farm
router.get('/overview', AnalyticsController.getOverview);

export default router;