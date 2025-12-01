import { Router } from 'express';
import { CropController, cropValidation } from '../controllers/cropController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
router.use(authMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     EnhancedCrop:
 *       type: object
 *       required:
 *         - name
 *         - variety
 *         - category
 *         - fieldLocation
 *         - area
 *         - plantingDate
 *         - expectedHarvestDate
 *       properties:
 *         id:
 *           type: string
 *           description: Unique crop identifier
 *         name:
 *           type: string
 *           description: Crop name
 *         variety:
 *           type: string
 *           description: Crop variety
 *         category:
 *           type: string
 *           enum: [vegetables, fruits, grains, herbs, legumes, flowers]
 *         fieldLocation:
 *           type: string
 *           description: Field location
 *         area:
 *           type: number
 *           description: Area in hectares
 *         plantingDate:
 *           type: string
 *           format: date-time
 *         expectedHarvestDate:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/crops:
 *   get:
 *     summary: Get all crops for current farm
 *     tags: [Crops]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of crops
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/EnhancedCrop'
 *                 total:
 *                   type: number
 */
router.get('/', CropController.getAllCrops);

/**
 * @swagger
 * /api/crops/{cropId}:
 *   get:
 *     summary: Get crop by ID
 *     tags: [Crops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cropId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Crop details
 *       404:
 *         description: Crop not found
 */
router.get('/:cropId', CropController.getCropById);

/**
 * @swagger
 * /api/crops:
 *   post:
 *     summary: Create a new crop
 *     tags: [Crops]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnhancedCrop'
 *     responses:
 *       201:
 *         description: Crop created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', cropValidation.createCrop, CropController.createCrop);

/**
 * @swagger
 * /api/crops/{cropId}:
 *   put:
 *     summary: Update crop
 *     tags: [Crops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cropId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EnhancedCrop'
 *     responses:
 *       200:
 *         description: Crop updated successfully
 *       404:
 *         description: Crop not found
 */
router.put('/:cropId', cropValidation.updateCrop, CropController.updateCrop);

/**
 * @swagger
 * /api/crops/{cropId}:
 *   delete:
 *     summary: Delete crop
 *     tags: [Crops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cropId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Crop deleted successfully
 *       404:
 *         description: Crop not found
 */
router.delete('/:cropId', CropController.deleteCrop);

/**
 * @swagger
 * /api/crops/{cropId}/tasks:
 *   get:
 *     summary: Get crop tasks
 *     tags: [Crops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cropId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of crop tasks
 */
router.get('/:cropId/tasks', CropController.getCropTasks);

/**
 * @swagger
 * /api/crops/{cropId}/tasks:
 *   post:
 *     summary: Create crop task
 *     tags: [Crops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cropId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.post('/:cropId/tasks', cropValidation.createTask, CropController.createCropTask);

/**
 * @swagger
 * /api/crops/{cropId}/workers:
 *   post:
 *     summary: Assign worker to crop
 *     tags: [Crops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cropId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Worker assigned successfully
 */
router.post('/:cropId/workers', CropController.assignWorkerToCrop);

/**
 * @swagger
 * /api/crops/analytics/overview:
 *   get:
 *     summary: Get crop analytics
 *     tags: [Crops]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Crop analytics data
 */
router.get('/analytics/overview', CropController.getCropAnalytics);

/**
 * @swagger
 * /api/crops/{cropId}/predictions:
 *   get:
 *     summary: Get crop predictions
 *     tags: [Crops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cropId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Crop predictions
 */
router.get('/:cropId/predictions', CropController.getCropPredictions);

/**
 * @swagger
 * /api/crops/{cropId}/photos:
 *   post:
 *     summary: Upload crop photo
 *     tags: [Crops]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cropId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 */
router.post('/:cropId/photos', CropController.uploadCropPhoto);

export default router;