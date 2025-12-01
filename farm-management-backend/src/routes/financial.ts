import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth';

const router = Router();
router.use(authMiddleware);

router.get('/', (req, res) => {
  res.json({ success: true, data: [], message: 'Financial endpoint - Coming soon' });
});

export default router;