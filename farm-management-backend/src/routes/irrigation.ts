import express from 'express';
import { IrrigationController, irrigationValidation } from '../controllers/irrigationController';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Zone Management Routes
router.get('/zones', IrrigationController.getAllZones);
router.get('/zones/:zoneId', irrigationValidation.updateZone, IrrigationController.getZoneById);
router.post('/zones', irrigationValidation.createZone, IrrigationController.createZone);
router.put('/zones/:zoneId', irrigationValidation.updateZone, IrrigationController.updateZone);
router.delete('/zones/:zoneId', irrigationValidation.updateZone, IrrigationController.deleteZone);

// Zone Control Routes
router.post('/zones/:zoneId/start', irrigationValidation.zoneControl, IrrigationController.startZone);
router.post('/zones/:zoneId/stop', irrigationValidation.zoneControl, IrrigationController.stopZone);
router.post('/zones/:zoneId/pause', irrigationValidation.zoneControl, IrrigationController.pauseZone);

// System Control Routes
router.get('/system/status', IrrigationController.getSystemStatus);
router.post('/system/enable', IrrigationController.enableSystem);
router.post('/system/disable', IrrigationController.disableSystem);
router.post('/system/auto-mode/enable', IrrigationController.enableAutoMode);
router.post('/system/auto-mode/disable', IrrigationController.disableAutoMode);
router.post('/system/emergency/activate', IrrigationController.activateEmergencyMode);
router.post('/system/emergency/deactivate', IrrigationController.deactivateEmergencyMode);
router.post('/system/stop-all', IrrigationController.stopAllZones);

// Analytics and Data Routes
router.get('/analytics/water-usage', IrrigationController.getWaterUsageAnalytics);
router.get('/weather/current', IrrigationController.getCurrentWeather);
router.get('/data/real-time', IrrigationController.getRealTimeData);

export default router;