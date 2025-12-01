import express, { Request, Response } from 'express';
import { Organization } from '../models/Organization';
import { Farm } from '../models/Farm';
import { protect, AuthRequest } from '../middleware/auth';

const router = express.Router();

// @route   GET /api/organizations
// @desc    Get all organizations for the current user
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const organizations = await Organization.find({
      $or: [
        { owner: userId },
        { members: userId }
      ]
    })
    .populate('owner', 'name email')
    .populate('members', 'name email role')
    .sort({ createdAt: -1 });

    res.json(organizations);
  } catch (error: any) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/organizations/:id
// @desc    Get organization by ID
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const organization = await Organization.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email role');

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Check if user has access to this organization
    const hasAccess = organization.owner.toString() === userId ||
                      organization.members.some((member: any) => member._id.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(organization);
  } catch (error: any) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/organizations
// @desc    Create a new organization
// @access  Private
router.post('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, description, contactEmail, contactPhone, address } = req.body;

    // Check if organization name already exists
    const existingOrg = await Organization.findOne({ name });
    if (existingOrg) {
      return res.status(400).json({ message: 'Organization name already exists' });
    }

    const organization = new Organization({
      name,
      description,
      contactEmail,
      contactPhone,
      address,
      owner: userId,
      members: [userId]
    });

    await organization.save();

    const populatedOrg = await Organization.findById(organization._id)
      .populate('owner', 'name email')
      .populate('members', 'name email role');

    res.status(201).json(populatedOrg);
  } catch (error: any) {
    console.error('Error creating organization:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/organizations/:id
// @desc    Update organization
// @access  Private (owner only)
router.put('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, description, contactEmail, contactPhone, address, isActive } = req.body;

    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Only owner can update organization
    if (organization.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only the owner can update the organization' });
    }

    // Update fields
    if (name) organization.name = name;
    if (description !== undefined) organization.description = description;
    if (contactEmail) organization.contactEmail = contactEmail;
    if (contactPhone !== undefined) organization.contactPhone = contactPhone;
    if (address) organization.address = address;
    if (isActive !== undefined) organization.isActive = isActive;

    await organization.save();

    const updatedOrg = await Organization.findById(organization._id)
      .populate('owner', 'name email')
      .populate('members', 'name email role');

    res.json(updatedOrg);
  } catch (error: any) {
    console.error('Error updating organization:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/organizations/:id
// @desc    Delete organization
// @access  Private (owner only)
router.delete('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Only owner can delete organization
    if (organization.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only the owner can delete the organization' });
    }

    // Check if there are farms associated with this organization
    const farms = await Farm.find({ organization: organization._id });
    if (farms.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete organization with active farms. Please delete all farms first.',
        farmCount: farms.length
      });
    }

    await organization.deleteOne();
    res.json({ message: 'Organization deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/organizations/:id/members
// @desc    Add member to organization
// @access  Private (owner only)
router.post('/:id/members', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { memberId } = req.body;

    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Only owner can add members
    if (organization.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only the owner can add members' });
    }

    // Check if already a member
    if (organization.members.includes(memberId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    organization.members.push(memberId);
    await organization.save();

    const updatedOrg = await Organization.findById(organization._id)
      .populate('owner', 'name email')
      .populate('members', 'name email role');

    res.json(updatedOrg);
  } catch (error: any) {
    console.error('Error adding member:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/organizations/:id/members/:memberId
// @desc    Remove member from organization
// @access  Private (owner only)
router.delete('/:id/members/:memberId', protect, async (req: AuthRequest, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { memberId } = req.params;

    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    // Only owner can remove members
    if (organization.owner.toString() !== userId) {
      return res.status(403).json({ message: 'Only the owner can remove members' });
    }

    // Cannot remove owner
    if (memberId === userId) {
      return res.status(400).json({ message: 'Owner cannot be removed from the organization' });
    }

    organization.members = organization.members.filter(
      member => member.toString() !== memberId
    );

    await organization.save();

    const updatedOrg = await Organization.findById(organization._id)
      .populate('owner', 'name email')
      .populate('members', 'name email role');

    res.json(updatedOrg);
  } catch (error: any) {
    console.error('Error removing member:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
