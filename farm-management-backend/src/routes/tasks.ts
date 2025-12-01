import { Router, Request, Response } from 'express';
import { asyncHandler } from '@/middleware/errorHandler';

const router = Router();

// GET /api/tasks - Get all tasks
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { status, priority } = req.query;
  
  // Return empty task list for now - matches mobile app TasksResponse interface
  res.json({
    success: true,
    count: 0,
    tasks: []
  });
}));

// GET /api/tasks/:id - Get single task
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    data: {
      task: {
        id,
        title: 'Sample Task',
        description: 'Task description',
        status: 'pending',
        priority: 'medium'
      }
    }
  });
}));

// PUT /api/tasks/:id - Update task
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  res.json({
    success: true,
    message: 'Task updated',
    data: {
      task: { id, status, notes }
    }
  });
}));

// PUT /api/tasks/:id/complete - Complete task
router.put('/:id/complete', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { rating, feedback } = req.body;
  
  res.json({
    success: true,
    message: 'Task completed',
    data: {
      task: { id, status: 'completed', rating, feedback }
    }
  });
}));

export default router;
