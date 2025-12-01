import express, { Request, Response } from 'express';
import { Farm } from '../models/Farm';
import { Organization } from '../models/Organization';
import { User } from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/farms-multi
// @desc    Get all farms accessible to the current user
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get all organizations the user belongs to
    const organizations = await Organization.find({
      $or: [
        { owner: userId },
        { members: userId }
      ]
    });

    const orgIds = organizations.map(org => org._id);

    // Get all farms in these organizations
    const farms = await Farm.find({
      $or: [
        { organization: { $in: orgIds } },
        { manager: userId },
        { workers: userId }
      ],
      isActive: true
    })
    .populate('organization', 'name contactEmail')
    .populate('manager', 'name email')
    .populate('workers', 'name email role')
    .sort({ createdAt: -1 });

    res.json(farms);
  } catch (error: any) {
    console.error('Error fetching farms:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/farms-multi/:id
// @desc    Get farm by ID
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const farm = await Farm.findById(req.params.id)
      .populate('organization', 'name contactEmail')
      .populate('manager', 'name email')
      .populate('workers', 'name email role');

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Check if user has access to this farm
    const organization = await Organization.findById(farm.organization);
    
    const hasAccess = organization && (
      organization.owner.toString() === userId ||
      organization.members.some((member: any) => member.toString() === userId) ||
      farm.manager.toString() === userId ||
      farm.workers.some((worker: any) => worker._id.toString() === userId)
    );

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(farm);
  } catch (error: any) {
    console.error('Error fetching farm:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/farms-multi/organization/:orgId
// @desc    Get all farms in an organization
// @access  Private
router.get('/organization/:orgId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { orgId } = req.params;

    // Check if user has access to this organization
    const organization = await Organization.findById(orgId);
    
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const hasAccess = organization.owner.toString() === userId ||
                      organization.members.some((member: any) => member.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const farms = await Farm.find({ organization: orgId, isActive: true })
      .populate('manager', 'name email')
      .populate('workers', 'name email role')
      .sort({ createdAt: -1 });

    res.json(farms);
  } catch (error: any) {
    console.error('Error fetching organization farms:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/farms-multi
// @desc    Create a new farm
// @access  Private (organization members only)
router.post('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { 
      name, 
      description, 
      organization, 
      location, 
      size, 
      farmType, 
      manager, 
      workers 
    } = req.body;

    // Check if user has access to the organization
    const org = await Organization.findById(organization);
    
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const hasAccess = org.owner.toString() === userId ||
                      org.members.some((member: any) => member.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have permission to create farms in this organization' });
    }

    const farm = new Farm({
      name,
      description,
      organization,
      location,
      size,
      farmType,
      manager: manager || userId,
      workers: workers || [userId]
    });

    await farm.save();

    // Update users' farms array
    const usersToUpdate = [manager || userId, ...(workers || [])];
    await User.updateMany(
      { _id: { $in: usersToUpdate } },
      { $addToSet: { farms: farm._id } }
    );

    const populatedFarm = await Farm.findById(farm._id)
      .populate('organization', 'name contactEmail')
      .populate('manager', 'name email')
      .populate('workers', 'name email role');

    res.status(201).json(populatedFarm);
  } catch (error: any) {
    console.error('Error creating farm:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/farms-multi/:id
// @desc    Update farm
// @access  Private (organization owner or farm manager)
router.put('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { 
      name, 
      description, 
      location, 
      size, 
      farmType, 
      manager, 
      workers,
      isActive 
    } = req.body;

    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Check permissions
    const organization = await Organization.findById(farm.organization);
    const isOrgOwner = organization && organization.owner.toString() === userId;
    const isFarmManager = farm.manager.toString() === userId;

    if (!isOrgOwner && !isFarmManager) {
      return res.status(403).json({ message: 'Only organization owner or farm manager can update the farm' });
    }

    // Update fields
    if (name) farm.name = name;
    if (description !== undefined) farm.description = description;
    if (location) farm.location = location;
    if (size) farm.size = size;
    if (farmType) farm.farmType = farmType;
    if (manager) farm.manager = manager;
    if (workers) farm.workers = workers;
    if (isActive !== undefined) farm.isActive = isActive;

    await farm.save();

    // Update users' farms array if workers changed
    if (workers) {
      await User.updateMany(
        { _id: { $in: workers } },
        { $addToSet: { farms: farm._id } }
      );
    }

    const updatedFarm = await Farm.findById(farm._id)
      .populate('organization', 'name contactEmail')
      .populate('manager', 'name email')
      .populate('workers', 'name email role');

    res.json(updatedFarm);
  } catch (error: any) {
    console.error('Error updating farm:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/farms-multi/:id
// @desc    Delete farm (soft delete by setting isActive to false)
// @access  Private (organization owner only)
router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Check if user is organization owner
    const organization = await Organization.findById(farm.organization);
    const isOrgOwner = organization && organization.owner.toString() === userId;

    if (!isOrgOwner) {
      return res.status(403).json({ message: 'Only organization owner can delete farms' });
    }

    // Soft delete
    farm.isActive = false;
    await farm.save();

    res.json({ message: 'Farm deactivated successfully' });
  } catch (error: any) {
    console.error('Error deleting farm:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/farms-multi/:id/workers
// @desc    Add worker to farm
// @access  Private (organization owner or farm manager)
router.post('/:id/workers', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { workerId } = req.body;

    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Check permissions
    const organization = await Organization.findById(farm.organization);
    const isOrgOwner = organization && organization.owner.toString() === userId;
    const isFarmManager = farm.manager.toString() === userId;

    if (!isOrgOwner && !isFarmManager) {
      return res.status(403).json({ message: 'Only organization owner or farm manager can add workers' });
    }

    // Check if already a worker
    if (farm.workers.includes(workerId)) {
      return res.status(400).json({ message: 'User is already a worker on this farm' });
    }

    farm.workers.push(workerId);
    await farm.save();

    // Update user's farms array
    await User.findByIdAndUpdate(workerId, {
      $addToSet: { farms: farm._id }
    });

    const updatedFarm = await Farm.findById(farm._id)
      .populate('organization', 'name contactEmail')
      .populate('manager', 'name email')
      .populate('workers', 'name email role');

    res.json(updatedFarm);
  } catch (error: any) {
    console.error('Error adding worker:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/farms-multi/:id/workers/:workerId
// @desc    Remove worker from farm
// @access  Private (organization owner or farm manager)
router.delete('/:id/workers/:workerId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { workerId } = req.params;

    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({ message: 'Farm not found' });
    }

    // Check permissions
    const organization = await Organization.findById(farm.organization);
    const isOrgOwner = organization && organization.owner.toString() === userId;
    const isFarmManager = farm.manager.toString() === userId;

    if (!isOrgOwner && !isFarmManager) {
      return res.status(403).json({ message: 'Only organization owner or farm manager can remove workers' });
    }

    // Cannot remove manager
    if (workerId === farm.manager.toString()) {
      return res.status(400).json({ message: 'Cannot remove the farm manager. Change manager first.' });
    }

    farm.workers = farm.workers.filter(
      worker => worker.toString() !== workerId
    );

    await farm.save();

    // Update user's farms array
    await User.findByIdAndUpdate(workerId, {
      $pull: { farms: farm._id }
    });

    const updatedFarm = await Farm.findById(farm._id)
      .populate('organization', 'name contactEmail')
      .populate('manager', 'name email')
      .populate('workers', 'name email role');

    res.json(updatedFarm);
  } catch (error: any) {
    console.error('Error removing worker:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
