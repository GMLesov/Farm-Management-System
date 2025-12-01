import { Router, Request, Response } from 'express';
import { body, validationResult, query } from 'express-validator';
import { Animal } from '@/models/Animal';
import { Farm } from '@/models/Farm';
import { AppError, asyncHandler } from '@/middleware/errorHandler';
import { authMiddleware, farmOwnership } from '@/middleware/auth';
import { logger } from '@/utils/logger';
import { AnimalController, animalValidation } from '../controllers/animalController';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /api/animals:
 *   get:
 *     summary: Get all animals for the current farm
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: farmId
 *         schema:
 *           type: string
 *         description: Farm ID to filter animals
 *       - in: query
 *         name: species
 *         schema:
 *           type: string
 *           enum: [cattle, sheep, goat, pig, horse, chicken, duck, turkey, other]
 *         description: Filter by animal species
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, sold, deceased, transferred]
 *         description: Filter by animal status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of animals
 */
router.get('/', [
  query('species').optional().isIn(['cattle', 'sheep', 'goat', 'pig', 'horse', 'chicken', 'duck', 'turkey', 'other']),
  query('status').optional().isIn(['active', 'sold', 'deceased', 'transferred']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const userId = (req as any).user.id;
  const { farmId, species, status, page = 1, limit = 20, search, gender, breed } = req.query;

  // Build query
  const query: any = {};
  
  if (farmId) {
    // Verify user has access to this farm
    const farm = await Farm.findOne({
      _id: farmId,
      $or: [{ owner: userId }, { managers: userId }]
    });
    if (!farm) {
      throw new AppError('Farm not found or access denied', 404);
    }
    query.farm = farmId;
  } else {
    // Get all farms user has access to
    const farms = await Farm.find({
      $or: [{ owner: userId }, { managers: userId }]
    }).select('_id');
    query.farm = { $in: farms.map(f => f._id) };
  }

  if (species) query.species = species;
  if (status) query.status = status;
  if (gender) query.gender = gender;
  if (breed) query.breed = breed;

  // Add search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { identificationNumber: { $regex: search, $options: 'i' } },
      { breed: { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const [animals, total] = await Promise.all([
    Animal.find(query)
      .populate('farm', 'name')
      .populate('parentage.mother', 'name identificationNumber')
      .populate('parentage.father', 'name identificationNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Animal.countDocuments(query)
  ]);

  res.json({
    success: true,
    count: animals.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: animals,
  });
}));

/**
 * @swagger
 * /api/animals/{id}:
 *   get:
 *     summary: Get a specific animal by ID
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Animal details
 *       404:
 *         description: Animal not found
 */
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const animalId = req.params.id;

  const animal = await Animal.findOne({ _id: animalId })
    .populate('farm', 'name')
    .populate('owner', 'firstName lastName email')
    .populate('parentage.mother', 'name identificationNumber species breed')
    .populate('parentage.father', 'name identificationNumber species breed')
    .populate('breedingRecords.partner', 'name identificationNumber species breed')
    .populate('breedingRecords.offspring', 'name identificationNumber species breed');

  if (!animal) {
    throw new AppError('Animal not found', 404);
  }

  // Verify user has access to this animal's farm
  const farm = await Farm.findOne({
    _id: animal.farm,
    $or: [{ owner: userId }, { managers: userId }]
  });

  if (!farm) {
    throw new AppError('Access denied', 403);
  }

  res.json({
    success: true,
    data: animal,
  });
}));

/**
 * @swagger
 * /api/animals:
 *   post:
 *     summary: Add a new animal
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - farmId
 *               - identificationNumber
 *               - species
 *               - breed
 *               - gender
 *             properties:
 *               farmId:
 *                 type: string
 *               identificationNumber:
 *                 type: string
 *               name:
 *                 type: string
 *               species:
 *                 type: string
 *                 enum: [cattle, sheep, goat, pig, horse, chicken, duck, turkey, other]
 *               breed:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, castrated]
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               weight:
 *                 type: number
 *               color:
 *                 type: string
 *               markings:
 *                 type: string
 *     responses:
 *       201:
 *         description: Animal added successfully
 */
router.post('/', [
  body('farmId').isMongoId().withMessage('Valid farm ID is required'),
  body('identificationNumber').trim().isLength({ min: 1 }).withMessage('Identification number is required'),
  body('species').isIn(['cattle', 'sheep', 'goat', 'pig', 'horse', 'chicken', 'duck', 'turkey', 'other']),
  body('breed').trim().isLength({ min: 1 }).withMessage('Breed is required'),
  body('gender').isIn(['male', 'female', 'castrated']),
  body('dateOfBirth').optional().isISO8601().toDate(),
  body('weight').optional().isNumeric(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const userId = (req as any).user.id;
  const { farmId, ...animalData } = req.body;

  // Verify user has access to this farm
  const farm = await Farm.findOne({
    _id: farmId,
    $or: [{ owner: userId }, { managers: userId }]
  });

  if (!farm) {
    throw new AppError('Farm not found or access denied', 404);
  }

  // Check if identification number is unique
  const existingAnimal = await Animal.findOne({ identificationNumber: animalData.identificationNumber });
  if (existingAnimal) {
    throw new AppError('Animal with this identification number already exists', 400);
  }

  const animal = new Animal({
    ...animalData,
    farm: farmId,
    owner: userId,
  });

  await animal.save();

  logger.info(`New animal added: ${animal.identificationNumber} by user ${userId}`);

  res.status(201).json({
    success: true,
    message: 'Animal added successfully',
    data: animal,
  });
}));

/**
 * @swagger
 * /api/animals/{id}/health:
 *   post:
 *     summary: Add health record for an animal
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - type
 *               - description
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               type:
 *                 type: string
 *                 enum: [vaccination, treatment, checkup, injury, illness, surgery]
 *               description:
 *                 type: string
 *               veterinarian:
 *                 type: string
 *               medications:
 *                 type: array
 *                 items:
 *                   type: string
 *               cost:
 *                 type: number
 *     responses:
 *       200:
 *         description: Health record added successfully
 */
router.post('/:id/health', [
  body('date').isISO8601().toDate(),
  body('type').isIn(['vaccination', 'treatment', 'checkup', 'injury', 'illness', 'surgery']),
  body('description').trim().isLength({ min: 1 }).withMessage('Description is required'),
  body('cost').optional().isNumeric(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const userId = (req as any).user.id;
  const animalId = req.params.id;

  const animal = await Animal.findById(animalId);
  if (!animal) {
    throw new AppError('Animal not found', 404);
  }

  // Verify user has access to this animal's farm
  const farm = await Farm.findOne({
    _id: animal.farm,
    $or: [{ owner: userId }, { managers: userId }]
  });

  if (!farm) {
    throw new AppError('Access denied', 403);
  }

  await animal.addHealthRecord(req.body);

  res.json({
    success: true,
    message: 'Health record added successfully',
    data: animal,
  });
}));

/**
 * @swagger
 * /api/animals/{id}/breeding:
 *   post:
 *     summary: Add breeding record for an animal
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - type
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               type:
 *                 type: string
 *                 enum: [mating, pregnancy_check, birth, weaning]
 *               partner:
 *                 type: string
 *               expectedDueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Breeding record added successfully
 */
router.post('/:id/breeding', [
  body('date').isISO8601().toDate(),
  body('type').isIn(['mating', 'pregnancy_check', 'birth', 'weaning']),
  body('partner').optional().isMongoId(),
  body('expectedDueDate').optional().isISO8601().toDate(),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const userId = (req as any).user.id;
  const animalId = req.params.id;

  const animal = await Animal.findById(animalId);
  if (!animal) {
    throw new AppError('Animal not found', 404);
  }

  // Verify user has access to this animal's farm
  const farm = await Farm.findOne({
    _id: animal.farm,
    $or: [{ owner: userId }, { managers: userId }]
  });

  if (!farm) {
    throw new AppError('Access denied', 403);
  }

  await animal.addBreedingRecord(req.body);

  res.json({
    success: true,
    message: 'Breeding record added successfully',
    data: animal,
  });
}));

/**
 * @swagger
 * /api/animals/{id}/production:
 *   post:
 *     summary: Add production record for an animal
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - type
 *               - quantity
 *               - unit
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               type:
 *                 type: string
 *                 enum: [milk, eggs, wool, honey]
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *               quality:
 *                 type: string
 *     responses:
 *       200:
 *         description: Production record added successfully
 */
router.post('/:id/production', [
  body('date').isISO8601().toDate(),
  body('type').isIn(['milk', 'eggs', 'wool', 'honey']),
  body('quantity').isNumeric(),
  body('unit').trim().isLength({ min: 1 }),
], asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError('Validation failed', 400);
  }

  const userId = (req as any).user.id;
  const animalId = req.params.id;

  const animal = await Animal.findById(animalId);
  if (!animal) {
    throw new AppError('Animal not found', 404);
  }

  // Verify user has access to this animal's farm
  const farm = await Farm.findOne({
    _id: animal.farm,
    $or: [{ owner: userId }, { managers: userId }]
  });

  if (!farm) {
    throw new AppError('Access denied', 403);
  }

  await animal.addProductionRecord(req.body);

  res.json({
    success: true,
    message: 'Production record added successfully',
    data: animal,
  });
}));

// Enhanced Animal Management Routes
router.get('/enhanced', AnimalController.getAllAnimals);
router.get('/enhanced/:animalId', AnimalController.getAnimalById);
router.post('/enhanced', animalValidation.createAnimal, AnimalController.createAnimal);
router.put('/enhanced/:animalId', animalValidation.updateAnimal, AnimalController.updateAnimal);
router.delete('/enhanced/:animalId', AnimalController.deleteAnimal);

// Enhanced Photo Management Routes
router.post('/enhanced/:animalId/photos', animalValidation.uploadPhoto, AnimalController.uploadAnimalPhoto);

// Enhanced Analytics & Insights Routes
router.get('/enhanced/analytics/overview', AnimalController.getAnimalAnalytics);
router.get('/enhanced/:animalId/insights', AnimalController.getAnimalInsights);
router.get('/enhanced/:animalId/predictions', AnimalController.getPredictiveAnalytics);

/**
 * @swagger
 * /api/animals/analytics/summary:
 *   get:
 *     summary: Get livestock analytics summary
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: farmId
 *         schema:
 *           type: string
 *         description: Farm ID to filter analytics
 *     responses:
 *       200:
 *         description: Livestock analytics summary
 */
router.get('/analytics/summary', asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { farmId } = req.query;

  // Build query for farms user has access to
  const farmQuery: any = {
    $or: [{ owner: userId }, { managers: userId }]
  };

  if (farmId) {
    farmQuery._id = farmId;
  }

  const farms = await Farm.find(farmQuery).select('_id');
  const farmIds = farms.map(f => f._id);

  // Aggregate livestock data
  const [
    totalAnimals,
    speciesBreakdown,
    statusBreakdown,
    healthAlerts,
    breedingSchedule,
    productionSummary
  ] = await Promise.all([
    Animal.countDocuments({ farm: { $in: farmIds } }),
    Animal.aggregate([
      { $match: { farm: { $in: farmIds } } },
      { $group: { _id: '$species', count: { $sum: 1 } } }
    ]),
    Animal.aggregate([
      { $match: { farm: { $in: farmIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Animal.find({
      farm: { $in: farmIds },
      'healthRecords.nextDue': { $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } // Next 30 days
    }).countDocuments(),
    Animal.find({
      farm: { $in: farmIds },
      'breedingRecords.expectedDueDate': { $gte: new Date(), $lte: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) } // Next 60 days
    }).countDocuments(),
    Animal.aggregate([
      { $match: { farm: { $in: farmIds } } },
      { $unwind: '$productionRecords' },
      {
        $group: {
          _id: '$productionRecords.type',
          totalQuantity: { $sum: '$productionRecords.quantity' },
          averageQuantity: { $avg: '$productionRecords.quantity' }
        }
      }
    ])
  ]);

  res.json({
    success: true,
    data: {
      totalAnimals,
      speciesBreakdown,
      statusBreakdown,
      healthAlerts,
      upcomingBirths: breedingSchedule,
      productionSummary,
    },
  });
}));

export default router;