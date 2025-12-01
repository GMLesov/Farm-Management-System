import { Router, Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

// POST /api/upload/photo - Upload photo
router.post('/photo', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Photo uploaded successfully',
    data: {
      url: `https://example.com/photos/${Date.now()}.jpg`,
      filename: `photo-${Date.now()}.jpg`
    }
  });
}));

// POST /api/upload/voice - Upload voice note
router.post('/voice', asyncHandler(async (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Voice note uploaded successfully',
    data: {
      url: `https://example.com/voice/${Date.now()}.m4a`,
      filename: `voice-${Date.now()}.m4a`
    }
  });
}));

export default router;
