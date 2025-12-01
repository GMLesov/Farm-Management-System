import express, { Response } from 'express';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';
import { predictiveSystem } from '../services/predictiveMaintenance';
import { Equipment } from '../models/Equipment';
import Animal from '../models/Animal';
import Crop from '../models/Crop';
import { Inventory } from '../models/Inventory';

const router = express.Router();

// @route   GET /api/alerts
// @desc    Get all predictive alerts
// @access  Private (Admin)
router.get('/', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    // Fetch all data
    const equipment = await Equipment.find().lean();
    const animals = await Animal.find().lean();
    const crops = await Crop.find().lean();
    const inventory = await Inventory.find().lean();

    // Get all alerts
    const alerts = await predictiveSystem.getAllAlerts({
      equipment,
      animals,
      crops,
      inventory
    });

    // Filter by severity if provided
    let filteredAlerts = alerts;
    if (req.query.severity) {
      filteredAlerts = alerts.filter(alert => alert.severity === req.query.severity);
    }

    // Filter by type if provided
    if (req.query.type) {
      filteredAlerts = filteredAlerts.filter(alert => alert.type === req.query.type);
    }

    res.json({
      success: true,
      count: filteredAlerts.length,
      alerts: filteredAlerts
    });
  } catch (error: any) {
    console.error('Get alerts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/alerts/equipment
// @desc    Get equipment maintenance alerts
// @access  Private (Admin)
router.get('/equipment', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const equipment = await Equipment.find().lean();
    const alerts = await predictiveSystem.analyzeEquipmentMaintenance(equipment);

    res.json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error: any) {
    console.error('Equipment alerts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/alerts/animals
// @desc    Get animal health alerts
// @access  Private (Admin)
router.get('/animals', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const animals = await Animal.find().lean();
    const alerts = await predictiveSystem.analyzeAnimalHealth(animals);

    res.json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error: any) {
    console.error('Animal alerts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/alerts/crops
// @desc    Get crop health alerts
// @access  Private (Admin)
router.get('/crops', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const crops = await Crop.find().lean();
    const alerts = await predictiveSystem.analyzeCropHealth(crops);

    res.json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error: any) {
    console.error('Crop alerts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/alerts/resources
// @desc    Get resource/inventory alerts
// @access  Private (Admin)
router.get('/resources', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const inventory = await Inventory.find().lean();
    const alerts = await predictiveSystem.analyzeResourceLevels(inventory);

    res.json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error: any) {
    console.error('Resource alerts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/alerts/critical
// @desc    Get only critical alerts
// @access  Private (Admin)
router.get('/critical', protect, adminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const equipment = await Equipment.find().lean();
    const animals = await Animal.find().lean();
    const crops = await Crop.find().lean();
    const inventory = await Inventory.find().lean();

    const allAlerts = await predictiveSystem.getAllAlerts({
      equipment,
      animals,
      crops,
      inventory
    });

    const criticalAlerts = allAlerts.filter(alert => 
      alert.severity === 'critical' || alert.severity === 'high'
    );

    res.json({
      success: true,
      count: criticalAlerts.length,
      alerts: criticalAlerts
    });
  } catch (error: any) {
    console.error('Critical alerts error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
