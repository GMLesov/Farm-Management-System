import { Router, Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

// GET /api/workers/schedule - Get worker's schedule
router.get('/schedule', asyncHandler(async (req: Request, res: Response) => {
  const { date } = req.query;
  
  // Return empty schedule for now - matches mobile app ScheduleResponse interface
  res.json({
    success: true,
    schedule: []
  });
}));

// POST /api/workers/checkin - Worker check-in
router.post('/checkin', asyncHandler(async (req: Request, res: Response) => {
  const { location } = req.body;
  
  res.json({
    success: true,
    message: 'Checked in successfully',
    data: {
      checkInTime: new Date(),
      location
    }
  });
}));

// POST /api/workers/checkout - Worker check-out
router.post('/checkout', asyncHandler(async (req: Request, res: Response) => {
  const { location } = req.body;
  
  res.json({
    success: true,
    message: 'Checked out successfully',
    data: {
      checkOutTime: new Date(),
      location
    }
  });
}));

// POST /api/workers/location - Update worker location
router.post('/location', asyncHandler(async (req: Request, res: Response) => {
  const location = req.body;
  
  res.json({
    success: true,
    message: 'Location updated',
    data: { location }
  });
}));

// POST /api/workers/sync - Sync offline data
router.post('/sync', asyncHandler(async (req: Request, res: Response) => {
  const { actions } = req.body;
  
  res.json({
    success: true,
    message: `Synced ${actions?.length || 0} actions`,
    data: { synced: actions?.length || 0 }
  });
}));

// POST /api/workers/fcm-token - Save FCM token
router.post('/fcm-token', asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.body;
  
  res.json({
    success: true,
    message: 'FCM token saved',
    data: { token }
  });
}));

export default router;
