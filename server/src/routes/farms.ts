import { Router, Request, Response, NextFunction } from 'express';
import { protect } from '../middleware/auth';

const router = Router();

// In-memory farm storage (replace with MongoDB model later)
const farms: any[] = [];

// Get all farms for current user
router.get('/', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const userFarms = farms.filter(f => f.ownerId === userId || f.managers?.includes(userId));
    res.json({
      success: true,
      data: userFarms
    });
  } catch (error) {
    next(error);
  }
});

// Create new farm
router.post('/', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { name, description, location, size, soilType, climateZone } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Farm name is required'
      });
    }

    const newFarm = {
      id: `farm-${Date.now()}`,
      _id: `farm-${Date.now()}`,
      name,
      description: description || '',
      location: location || {},
      size: size || 0,
      soilType: soilType || 'unknown',
      climateZone: climateZone || 'unknown',
      ownerId: userId,
      managers: [userId],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    farms.push(newFarm);

    res.status(201).json({
      success: true,
      data: newFarm,
      message: 'Farm created successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Get farm by ID
router.get('/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const farm = farms.find(f => 
      (f.id === id || f._id === id) && 
      (f.ownerId === userId || f.managers?.includes(userId))
    );

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    res.json({
      success: true,
      data: farm
    });
  } catch (error) {
    next(error);
  }
});

// Update farm
router.put('/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const farmIndex = farms.findIndex(f => 
      (f.id === id || f._id === id) && 
      (f.ownerId === userId || f.managers?.includes(userId))
    );

    if (farmIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    farms[farmIndex] = {
      ...farms[farmIndex],
      ...req.body,
      updatedAt: new Date()
    };

    res.json({
      success: true,
      data: farms[farmIndex],
      message: 'Farm updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Delete farm
router.delete('/:id', protect, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const farmIndex = farms.findIndex(f => 
      (f.id === id || f._id === id) && f.ownerId === userId
    );

    if (farmIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found or unauthorized'
      });
    }

    farms.splice(farmIndex, 1);

    res.json({
      success: true,
      message: 'Farm deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
