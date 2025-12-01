import express, { Request, Response } from 'express';

const router = express.Router();

// Mock irrigation zones
const mockZones = [
  {
    _id: '1',
    name: 'Zone A - North Field',
    area: 5.2, // hectares
    cropType: 'Wheat',
    status: 'active',
    soilMoisture: 65,
    targetMoisture: 70,
    lastWatered: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    nextScheduled: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    waterUsage: 1250, // liters today
    valveStatus: 'closed',
  },
  {
    _id: '2',
    name: 'Zone B - East Field',
    area: 3.8,
    cropType: 'Corn',
    status: 'active',
    soilMoisture: 72,
    targetMoisture: 75,
    lastWatered: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    nextScheduled: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    waterUsage: 980,
    valveStatus: 'closed',
  },
  {
    _id: '3',
    name: 'Zone C - Greenhouse',
    area: 1.5,
    cropType: 'Tomatoes',
    status: 'watering',
    soilMoisture: 68,
    targetMoisture: 80,
    lastWatered: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    nextScheduled: new Date().toISOString(),
    waterUsage: 450,
    valveStatus: 'open',
  },
  {
    _id: '4',
    name: 'Zone D - South Field',
    area: 4.5,
    cropType: 'Lettuce',
    status: 'idle',
    soilMoisture: 45,
    targetMoisture: 65,
    lastWatered: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    nextScheduled: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    waterUsage: 0,
    valveStatus: 'closed',
  },
];

// GET /api/irrigation/zones - Get all irrigation zones
router.get('/zones', (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: mockZones,
      total: mockZones.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch irrigation zones',
    });
  }
});

// GET /api/irrigation/zones/:id - Get single zone
router.get('/zones/:id', (req: Request, res: Response) => {
  try {
    const zone = mockZones.find(z => z._id === req.params.id);
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found',
      });
    }

    res.json({
      success: true,
      data: zone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch zone',
    });
  }
});

// GET /api/irrigation/weather/current - Get current weather
router.get('/weather/current', (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        temperature: 24.5,
        humidity: 68,
        windSpeed: 12,
        windDirection: 'NE',
        rainfall: 0,
        pressure: 1013,
        conditions: 'Partly Cloudy',
        uvIndex: 6,
        visibility: 10,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather data',
    });
  }
});

// GET /api/irrigation/weather/forecast - Get weather forecast
router.get('/weather/forecast', (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: [
        { date: '2025-11-16', temp: 25, humidity: 65, rainfall: 0, conditions: 'Sunny' },
        { date: '2025-11-17', temp: 26, humidity: 70, rainfall: 2, conditions: 'Light Rain' },
        { date: '2025-11-18', temp: 23, humidity: 75, rainfall: 5, conditions: 'Rain' },
        { date: '2025-11-19', temp: 22, humidity: 72, rainfall: 1, conditions: 'Cloudy' },
        { date: '2025-11-20', temp: 24, humidity: 68, rainfall: 0, conditions: 'Partly Cloudy' },
      ],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather forecast',
    });
  }
});

// GET /api/irrigation/system/status - Get irrigation system status
router.get('/system/status', (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        status: 'operational',
        activeZones: 1,
        totalZones: 4,
        waterPressure: 45, // psi
        flowRate: 150, // liters per minute
        totalWaterUsage: 2680, // liters today
        powerStatus: 'on',
        mainValve: 'open',
        pumpStatus: 'running',
        lastMaintenance: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        nextMaintenance: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system status',
    });
  }
});

// POST /api/irrigation/zones/:id/start - Start watering a zone
router.post('/zones/:id/start', (req: Request, res: Response) => {
  try {
    const zone = mockZones.find(z => z._id === req.params.id);
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found',
      });
    }

    zone.status = 'watering';
    zone.valveStatus = 'open';

    res.json({
      success: true,
      message: `Started watering ${zone.name}`,
      data: zone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to start watering',
    });
  }
});

// POST /api/irrigation/zones/:id/stop - Stop watering a zone
router.post('/zones/:id/stop', (req: Request, res: Response) => {
  try {
    const zone = mockZones.find(z => z._id === req.params.id);
    
    if (!zone) {
      return res.status(404).json({
        success: false,
        message: 'Zone not found',
      });
    }

    zone.status = 'active';
    zone.valveStatus = 'closed';
    zone.lastWatered = new Date().toISOString();

    res.json({
      success: true,
      message: `Stopped watering ${zone.name}`,
      data: zone,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to stop watering',
    });
  }
});

// GET /api/irrigation/history - Get irrigation history
router.get('/history', (_req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: [
        {
          _id: '1',
          zoneId: '1',
          zoneName: 'Zone A - North Field',
          startTime: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 5.5 * 60 * 60 * 1000).toISOString(),
          duration: 30, // minutes
          waterUsed: 1250, // liters
        },
        {
          _id: '2',
          zoneId: '2',
          zoneName: 'Zone B - East Field',
          startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          endTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000).toISOString(),
          duration: 30,
          waterUsed: 980,
        },
        {
          _id: '3',
          zoneId: '3',
          zoneName: 'Zone C - Greenhouse',
          startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          endTime: null,
          duration: 30,
          waterUsed: 450,
        },
      ],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch irrigation history',
    });
  }
});

export default router;
