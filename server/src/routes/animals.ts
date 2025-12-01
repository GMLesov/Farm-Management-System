import express, { Response } from 'express';
import Animal from '../models/Animal';
import FeedingSchedule from '../models/FeedingSchedule';
import BreedingRecord from '../models/BreedingRecord';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// @route   GET /api/animals
// @desc    Get all animals
// @access  Private
router.get('/', protect, async (req: AuthRequest, res: Response) => {
  try {
    let query: any = {};

    // Filter by type if provided
    if (req.query.type) {
      query.type = req.query.type;
    }

    // Filter by health status if provided
    if (req.query.healthStatus) {
      query.healthStatus = req.query.healthStatus;
    }

    const animals = await Animal.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: animals.length,
      animals
    });
  } catch (error: any) {
    console.error('Get animals error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/animals/:id
// @desc    Get single animal
// @access  Private
router.get('/:id', protect, async (req: AuthRequest, res: Response) => {
  try {
    const animal = await Animal.findById(req.params.id);

    if (!animal) {
      return res.status(404).json({ success: false, message: 'Animal not found' });
    }

    res.json({
      success: true,
      animal
    });
  } catch (error: any) {
    console.error('Get animal error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/animals
// @desc    Create animal
// @access  Private (Admin)
router.post('/', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const animal = await Animal.create(req.body);

    res.status(201).json({
      success: true,
      animal
    });
  } catch (error: any) {
    console.error('Create animal error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Tag number already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/animals/:id
// @desc    Update animal
// @access  Private (Admin)
router.put('/:id', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const animal = await Animal.findById(req.params.id);

    if (!animal) {
      return res.status(404).json({ success: false, message: 'Animal not found' });
    }

    // Update all fields from request body
    Object.assign(animal, req.body);

    await animal.save();

    res.json({
      success: true,
      animal
    });
  } catch (error: any) {
    console.error('Update animal error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/animals/:id/vaccination
// @desc    Add vaccination record
// @access  Private (Admin)
router.post('/:id/vaccination', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const animal = await Animal.findById(req.params.id);

    if (!animal) {
      return res.status(404).json({ success: false, message: 'Animal not found' });
    }

    const { name, date, nextDue } = req.body;

    animal.vaccinations.push({
      name,
      date: new Date(date),
      nextDue: nextDue ? new Date(nextDue) : undefined
    });

    await animal.save();

    res.json({
      success: true,
      animal
    });
  } catch (error: any) {
    console.error('Add vaccination error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/animals/:id/health-record
// @desc    Add health record
// @access  Private (Admin)
router.post('/:id/health-record', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const animal = await Animal.findById(req.params.id);

    if (!animal) {
      return res.status(404).json({ success: false, message: 'Animal not found' });
    }

    const { date, type, description, treatment, veterinarian } = req.body;

    animal.healthRecords.push({
      date: new Date(date),
      type,
      description,
      treatment,
      veterinarian
    });

    await animal.save();

    res.json({
      success: true,
      animal
    });
  } catch (error: any) {
    console.error('Add health record error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/animals/:id
// @desc    Delete animal
// @access  Private (Admin)
router.delete('/:id', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const animal = await Animal.findById(req.params.id);

    if (!animal) {
      return res.status(404).json({ success: false, message: 'Animal not found' });
    }

    await animal.deleteOne();

    res.json({
      success: true,
      message: 'Animal deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete animal error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/animals/stats/summary
// @desc    Get animal statistics summary
// @access  Private
router.get('/stats/summary', protect, async (req: AuthRequest, res: Response) => {
  try {
    const totalAnimals = await Animal.countDocuments();
    const healthyAnimals = await Animal.countDocuments({ healthStatus: 'healthy' });
    const sickAnimals = await Animal.countDocuments({ healthStatus: 'sick' });
    const quarantineAnimals = await Animal.countDocuments({ healthStatus: 'quarantine' });

    const animalsByType = await Animal.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalAnimals,
        healthy: healthyAnimals,
        sick: sickAnimals,
        quarantine: quarantineAnimals,
        byType: animalsByType
      }
    });
  } catch (error: any) {
    console.error('Get animal stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/animals/:id/feeding-schedule
// @desc    Create feeding schedule for animal
// @access  Private
router.post('/:id/feeding-schedule', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const animal = await Animal.findById(req.params.id);

  if (!animal) {
    res.status(404).json({ success: false, message: 'Animal not found' });
    return;
  }

  const { feedType, amount, unit, frequency, times, instructions, startDate, endDate } = req.body;

  // Create feeding schedule in dedicated collection
  const schedule = await FeedingSchedule.create({
    animalId: req.params.id,
    feedType,
    amount,
    unit,
    frequency,
    times: times || [],
    instructions,
    active: true,
    startDate: startDate || new Date(),
    endDate,
    createdBy: req.user?._id
  });

  res.status(201).json({
    success: true,
    message: 'Feeding schedule created successfully',
    schedule
  });
}));

// @route   GET /api/animals/:id/feeding-schedule
// @desc    Get feeding schedules for animal
// @access  Private
router.get('/:id/feeding-schedule', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const animal = await Animal.findById(req.params.id);

  if (!animal) {
    res.status(404).json({ success: false, message: 'Animal not found' });
    return;
  }

  // Get schedules from dedicated collection
  const schedules = await FeedingSchedule.find({ animalId: req.params.id })
    .sort({ createdAt: -1 })
    .populate('createdBy', 'name email');

  res.json({
    success: true,
    count: schedules.length,
    schedules
  });
}));

// @route   POST /api/animals/breeding-records
// @desc    Create breeding record
// @access  Private (Admin)
router.post('/breeding-records', protect, adminOnly, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { motherId, fatherId, breedingDate, breedingMethod, expectedDueDate, veterinarianNotes } = req.body;

  const mother = await Animal.findById(motherId);
  const father = await Animal.findById(fatherId);

  if (!mother || !father) {
    res.status(404).json({ success: false, message: 'Parent animal(s) not found' });
    return;
  }

  if (mother.gender !== 'female') {
    res.status(400).json({ success: false, message: 'Mother must be female' });
    return;
  }

  if (father.gender !== 'male') {
    res.status(400).json({ success: false, message: 'Father must be male' });
    return;
  }

  // Create breeding record in dedicated collection
  const record = await BreedingRecord.create({
    motherId,
    fatherId,
    breedingDate: breedingDate || new Date(),
    breedingMethod: breedingMethod || 'natural',
    expectedDueDate,
    status: 'pregnant',
    veterinarianNotes,
    createdBy: req.user?._id
  });

  // Populate parent details
  await record.populate('motherId', 'name tagNumber breed');
  await record.populate('fatherId', 'name tagNumber breed');

  res.status(201).json({
    success: true,
    message: 'Breeding record created successfully',
    record
  });
}));

// @route   GET /api/animals/:id/breeding-records
// @desc    Get breeding records for animal (as mother or father)
// @access  Private
router.get('/:id/breeding-records', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const animal = await Animal.findById(req.params.id);

  if (!animal) {
    res.status(404).json({ success: false, message: 'Animal not found' });
    return;
  }

  // Get records where animal is either mother or father
  const records = await BreedingRecord.find({
    $or: [{ motherId: req.params.id }, { fatherId: req.params.id }]
  })
    .sort({ breedingDate: -1 })
    .populate('motherId', 'name tagNumber breed')
    .populate('fatherId', 'name tagNumber breed')
    .populate('createdBy', 'name email');

  res.json({
    success: true,
    count: records.length,
    records
  });
}));

// @route   PUT /api/animals/breeding-records/:recordId
// @desc    Update breeding record (e.g., record birth)
// @access  Private (Admin)
router.put('/breeding-records/:recordId', protect, adminOnly, asyncHandler(async (req: AuthRequest, res: Response) => {
  const record = await BreedingRecord.findById(req.params.recordId);

  if (!record) {
    res.status(404).json({ success: false, message: 'Breeding record not found' });
    return;
  }

  const { status, actualBirthDate, offspring, complications, veterinarianNotes } = req.body;

  // Update record fields
  if (status) record.status = status;
  if (actualBirthDate) record.actualBirthDate = new Date(actualBirthDate);
  if (offspring) record.offspring = offspring;
  if (complications) record.complications = complications;
  if (veterinarianNotes) record.veterinarianNotes = veterinarianNotes;

  await record.save();

  // Populate parent details
  await record.populate('motherId', 'name tagNumber breed');
  await record.populate('fatherId', 'name tagNumber breed');

  res.json({
    success: true,
    message: 'Breeding record updated successfully',
    record
  });
}));

// @route   DELETE /api/animals/breeding-records/:recordId
// @desc    Delete breeding record
// @access  Private (Admin)
router.delete('/breeding-records/:recordId', protect, adminOnly, asyncHandler(async (req: AuthRequest, res: Response) => {
  const record = await BreedingRecord.findById(req.params.recordId);

  if (!record) {
    res.status(404).json({ success: false, message: 'Breeding record not found' });
    return;
  }

  await record.deleteOne();

  res.json({
    success: true,
    message: 'Breeding record deleted successfully'
  });
}));

// @route   PUT /api/animals/:id/feeding-schedule/:scheduleId
// @desc    Update feeding schedule
// @access  Private
router.put('/:id/feeding-schedule/:scheduleId', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const schedule = await FeedingSchedule.findById(req.params.scheduleId);

  if (!schedule) {
    res.status(404).json({ success: false, message: 'Feeding schedule not found' });
    return;
  }

  if (schedule.animalId.toString() !== req.params.id) {
    res.status(400).json({ success: false, message: 'Schedule does not belong to this animal' });
    return;
  }

  const { feedType, amount, unit, frequency, times, instructions, active, endDate } = req.body;

  if (feedType) schedule.feedType = feedType;
  if (amount) schedule.amount = amount;
  if (unit) schedule.unit = unit;
  if (frequency) schedule.frequency = frequency;
  if (times) schedule.times = times;
  if (instructions !== undefined) schedule.instructions = instructions;
  if (active !== undefined) schedule.active = active;
  if (endDate) schedule.endDate = new Date(endDate);

  await schedule.save();

  res.json({
    success: true,
    message: 'Feeding schedule updated successfully',
    schedule
  });
}));

// @route   DELETE /api/animals/:id/feeding-schedule/:scheduleId
// @desc    Delete feeding schedule
// @access  Private
router.delete('/:id/feeding-schedule/:scheduleId', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const schedule = await FeedingSchedule.findById(req.params.scheduleId);

  if (!schedule) {
    res.status(404).json({ success: false, message: 'Feeding schedule not found' });
    return;
  }

  if (schedule.animalId.toString() !== req.params.id) {
    res.status(400).json({ success: false, message: 'Schedule does not belong to this animal' });
    return;
  }

  await schedule.deleteOne();

  res.json({
    success: true,
    message: 'Feeding schedule deleted successfully'
  });
}));

// @route   GET /api/animals/breeding-records/active
// @desc    Get all active breeding records (pregnant animals)
// @access  Private
router.get('/breeding-records/active', protect, asyncHandler(async (req: AuthRequest, res: Response) => {
  const records = await BreedingRecord.find({
    status: { $in: ['pregnant', 'pending'] }
  })
    .sort({ expectedDueDate: 1 })
    .populate('motherId', 'name tagNumber breed type')
    .populate('fatherId', 'name tagNumber breed type')
    .populate('createdBy', 'name email');

  res.json({
    success: true,
    count: records.length,
    records
  });
}));

export default router;
