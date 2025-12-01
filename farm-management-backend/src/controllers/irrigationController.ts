// @ts-nocheck
import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';

// Mock database - in production, this would be replaced with actual database models
interface IrrigationZone {
  id: string;
  farmId: string;
  name: string;
  area: number;
  cropType: string;
  status: 'active' | 'inactive' | 'scheduled' | 'maintenance' | 'error';
  soilMoisture: number;
  temperature: number;
  humidity: number;
  lastWatered: string;
  nextScheduled: string;
  waterUsage: number;
  flowRate: number;
  pressure: number;
  valveStatus: 'open' | 'closed' | 'partial';
  sensorBattery: number;
  schedule: IrrigationSchedule[];
  recommendations: string[];
  efficiency: number;
  coordinates: { lat: number; lng: number };
  createdAt: string;
  updatedAt: string;
}

interface IrrigationSchedule {
  id: string;
  name: string;
  startTime: string;
  duration: number;
  frequency: 'daily' | 'weekly' | 'bi-weekly' | 'custom';
  daysOfWeek: number[];
  enabled: boolean;
  conditions: {
    minMoisture?: number;
    maxMoisture?: number;
    minTemperature?: number;
    maxTemperature?: number;
    weatherCondition?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SystemStatus {
  enabled: boolean;
  autoMode: boolean;
  emergencyMode: boolean;
  totalZones: number;
  activeZones: number;
  totalWaterUsage: number;
  systemPressure: number;
  lastUpdate: string;
}

// Mock data storage
let zones: IrrigationZone[] = [
  {
    id: '1',
    farmId: 'farm_1',
    name: 'North Field Alpha',
    area: 10.5,
    cropType: 'Corn',
    status: 'active',
    soilMoisture: 65,
    temperature: 22,
    humidity: 68,
    lastWatered: '2025-11-02T14:30:00Z',
    nextScheduled: '2025-11-03T06:00:00Z',
    waterUsage: 850,
    flowRate: 15.2,
    pressure: 45,
    valveStatus: 'open',
    sensorBattery: 85,
    schedule: [],
    recommendations: ['Optimal moisture level', 'Continue current schedule'],
    efficiency: 92,
    coordinates: { lat: 40.7128, lng: -74.0060 },
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-11-03T12:00:00Z',
  },
  {
    id: '2',
    farmId: 'farm_1',
    name: 'South Greenhouse Beta',
    area: 2.1,
    cropType: 'Tomatoes',
    status: 'scheduled',
    soilMoisture: 35,
    temperature: 25,
    humidity: 75,
    lastWatered: '2025-11-02T08:00:00Z',
    nextScheduled: '2025-11-03T18:00:00Z',
    waterUsage: 120,
    flowRate: 8.5,
    pressure: 38,
    valveStatus: 'closed',
    sensorBattery: 92,
    schedule: [],
    recommendations: ['Low moisture detected', 'Increase watering frequency', 'Check for leaks'],
    efficiency: 88,
    coordinates: { lat: 40.7130, lng: -74.0062 },
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-11-03T12:00:00Z',
  },
  {
    id: '3',
    farmId: 'farm_1',
    name: 'East Orchard Gamma',
    area: 15.8,
    cropType: 'Apple Trees',
    status: 'inactive',
    soilMoisture: 75,
    temperature: 18,
    humidity: 60,
    lastWatered: '2025-11-01T16:00:00Z',
    nextScheduled: '2025-11-04T12:00:00Z',
    waterUsage: 1250,
    flowRate: 12.8,
    pressure: 42,
    valveStatus: 'closed',
    sensorBattery: 78,
    schedule: [],
    recommendations: ['Optimal conditions', 'Reduce frequency in winter'],
    efficiency: 95,
    coordinates: { lat: 40.7135, lng: -74.0058 },
    createdAt: '2025-10-01T00:00:00Z',
    updatedAt: '2025-11-03T12:00:00Z',
  },
];

let systemStatus: SystemStatus = {
  enabled: true,
  autoMode: true,
  emergencyMode: false,
  totalZones: 3,
  activeZones: 1,
  totalWaterUsage: 2220,
  systemPressure: 42,
  lastUpdate: new Date().toISOString(),
};

// Utility functions
const updateZone = (zoneId: string, updates: Partial<IrrigationZone>): IrrigationZone | null => {
  const zoneIndex = zones.findIndex(z => z.id === zoneId);
  if (zoneIndex === -1) return null;
  
  zones[zoneIndex] = {
    ...zones[zoneIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  updateSystemStatus();
  return zones[zoneIndex];
};

const updateSystemStatus = () => {
  systemStatus = {
    ...systemStatus,
    totalZones: zones.length,
    activeZones: zones.filter(z => z.status === 'active').length,
    totalWaterUsage: zones.reduce((sum, z) => sum + z.waterUsage, 0),
    lastUpdate: new Date().toISOString(),
  };
};

const simulateHardwareResponse = async (delay: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Controllers

export class IrrigationController {
  // Zone Management
  static async getAllZones(req: Request, res: Response) {
    try {
      const farmId = req.user?.farmId || 'farm_1'; // Default farm ID for demo
      const farmZones = zones.filter(zone => zone.farmId === farmId);
      
      res.json({
        success: true,
        data: farmZones,
        total: farmZones.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve irrigation zones',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getZoneById(req: Request, res: Response) {
    try {
      const { zoneId } = req.params;
      const zone = zones.find(z => z.id === zoneId);
      
      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Irrigation zone not found',
        });
      }

      res.json({
        success: true,
        data: zone,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve irrigation zone',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async createZone(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
      }

      const farmId = req.user?.farmId || 'farm_1';
      const newZone: IrrigationZone = {
        id: Date.now().toString(),
        farmId,
        ...req.body,
        status: 'inactive',
        soilMoisture: 50,
        temperature: 20,
        humidity: 60,
        lastWatered: new Date().toISOString(),
        nextScheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        waterUsage: 0,
        pressure: 40,
        valveStatus: 'closed',
        sensorBattery: 100,
        schedule: [],
        recommendations: ['New zone created', 'Configure initial schedule'],
        efficiency: 85,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      zones.push(newZone);
      updateSystemStatus();

      res.status(201).json({
        success: true,
        message: 'Irrigation zone created successfully',
        data: newZone,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create irrigation zone',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async updateZone(req: Request, res: Response) {
    try {
      const { zoneId } = req.params;
      const updates = req.body;

      const updatedZone = updateZone(zoneId, updates);
      
      if (!updatedZone) {
        return res.status(404).json({
          success: false,
          message: 'Irrigation zone not found',
        });
      }

      res.json({
        success: true,
        message: 'Irrigation zone updated successfully',
        data: updatedZone,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update irrigation zone',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async deleteZone(req: Request, res: Response) {
    try {
      const { zoneId } = req.params;
      const zoneIndex = zones.findIndex(z => z.id === zoneId);
      
      if (zoneIndex === -1) {
        return res.status(404).json({
          success: false,
          message: 'Irrigation zone not found',
        });
      }

      zones.splice(zoneIndex, 1);
      updateSystemStatus();

      res.json({
        success: true,
        message: 'Irrigation zone deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete irrigation zone',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Zone Control Operations
  static async startZone(req: Request, res: Response) {
    try {
      const { zoneId } = req.params;
      const { duration } = req.body;

      // Simulate hardware communication delay
      await simulateHardwareResponse(1000);

      const zone = updateZone(zoneId, {
        status: 'active',
        valveStatus: 'open',
        lastWatered: new Date().toISOString(),
      });

      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Irrigation zone not found',
        });
      }

      res.json({
        success: true,
        message: `Zone ${zone.name} started successfully`,
        data: { zoneId, duration, startedAt: new Date().toISOString() },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to start irrigation zone',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async stopZone(req: Request, res: Response) {
    try {
      const { zoneId } = req.params;

      await simulateHardwareResponse(800);

      const zone = updateZone(zoneId, {
        status: 'inactive',
        valveStatus: 'closed',
      });

      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Irrigation zone not found',
        });
      }

      res.json({
        success: true,
        message: `Zone ${zone.name} stopped successfully`,
        data: { zoneId, stoppedAt: new Date().toISOString() },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to stop irrigation zone',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async pauseZone(req: Request, res: Response) {
    try {
      const { zoneId } = req.params;

      await simulateHardwareResponse(500);

      const zone = updateZone(zoneId, {
        status: 'scheduled',
        valveStatus: 'partial',
      });

      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Irrigation zone not found',
        });
      }

      res.json({
        success: true,
        message: `Zone ${zone.name} paused successfully`,
        data: { zoneId, pausedAt: new Date().toISOString() },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to pause irrigation zone',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // System Control
  static async getSystemStatus(req: Request, res: Response) {
    try {
      updateSystemStatus();
      res.json({
        success: true,
        data: systemStatus,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve system status',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async enableSystem(req: Request, res: Response) {
    try {
      await simulateHardwareResponse(1000);
      
      systemStatus.enabled = true;
      systemStatus.lastUpdate = new Date().toISOString();

      res.json({
        success: true,
        message: 'Irrigation system enabled successfully',
        data: systemStatus,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to enable irrigation system',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async disableSystem(req: Request, res: Response) {
    try {
      await simulateHardwareResponse(1000);
      
      // Stop all active zones when disabling system
      zones.forEach(zone => {
        if (zone.status === 'active') {
          zone.status = 'inactive';
          zone.valveStatus = 'closed';
          zone.updatedAt = new Date().toISOString();
        }
      });

      systemStatus.enabled = false;
      systemStatus.lastUpdate = new Date().toISOString();
      updateSystemStatus();

      res.json({
        success: true,
        message: 'Irrigation system disabled successfully',
        data: systemStatus,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to disable irrigation system',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async enableAutoMode(req: Request, res: Response) {
    try {
      systemStatus.autoMode = true;
      systemStatus.lastUpdate = new Date().toISOString();

      res.json({
        success: true,
        message: 'Auto mode enabled successfully',
        data: systemStatus,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to enable auto mode',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async disableAutoMode(req: Request, res: Response) {
    try {
      systemStatus.autoMode = false;
      systemStatus.lastUpdate = new Date().toISOString();

      res.json({
        success: true,
        message: 'Auto mode disabled successfully',
        data: systemStatus,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to disable auto mode',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async activateEmergencyMode(req: Request, res: Response) {
    try {
      await simulateHardwareResponse(2000);

      // Activate all zones in emergency mode
      zones.forEach(zone => {
        zone.status = 'active';
        zone.valveStatus = 'open';
        zone.updatedAt = new Date().toISOString();
      });

      systemStatus.emergencyMode = true;
      systemStatus.lastUpdate = new Date().toISOString();
      updateSystemStatus();

      res.json({
        success: true,
        message: 'Emergency irrigation mode activated',
        data: systemStatus,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to activate emergency mode',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async deactivateEmergencyMode(req: Request, res: Response) {
    try {
      await simulateHardwareResponse(1500);

      // Deactivate all zones
      zones.forEach(zone => {
        zone.status = 'inactive';
        zone.valveStatus = 'closed';
        zone.updatedAt = new Date().toISOString();
      });

      systemStatus.emergencyMode = false;
      systemStatus.lastUpdate = new Date().toISOString();
      updateSystemStatus();

      res.json({
        success: true,
        message: 'Emergency mode deactivated',
        data: systemStatus,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to deactivate emergency mode',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async stopAllZones(req: Request, res: Response) {
    try {
      await simulateHardwareResponse(1500);

      zones.forEach(zone => {
        zone.status = 'inactive';
        zone.valveStatus = 'closed';
        zone.updatedAt = new Date().toISOString();
      });

      updateSystemStatus();

      res.json({
        success: true,
        message: 'All irrigation zones stopped successfully',
        data: { stoppedAt: new Date().toISOString(), zonesAffected: zones.length },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to stop all zones',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Analytics and Weather
  static async getWaterUsageAnalytics(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      // Mock analytics data
      const analyticsData = [
        { date: '2025-11-01', zone: 'North Field Alpha', usage: 850, efficiency: 92, cost: 12.75 },
        { date: '2025-11-01', zone: 'South Greenhouse Beta', usage: 120, efficiency: 88, cost: 1.80 },
        { date: '2025-11-01', zone: 'East Orchard Gamma', usage: 1250, efficiency: 95, cost: 18.75 },
        { date: '2025-11-02', zone: 'North Field Alpha', usage: 820, efficiency: 94, cost: 12.30 },
        { date: '2025-11-02', zone: 'South Greenhouse Beta', usage: 115, efficiency: 90, cost: 1.73 },
        { date: '2025-11-02', zone: 'East Orchard Gamma', usage: 1180, efficiency: 96, cost: 17.70 },
      ];

      res.json({
        success: true,
        data: analyticsData,
        summary: {
          totalUsage: analyticsData.reduce((sum, item) => sum + item.usage, 0),
          avgEfficiency: analyticsData.reduce((sum, item) => sum + item.efficiency, 0) / analyticsData.length,
          totalCost: analyticsData.reduce((sum, item) => sum + item.cost, 0),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve water usage analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getCurrentWeather(req: Request, res: Response) {
    try {
      // Mock weather data
      const weatherData = {
        temperature: 22 + Math.random() * 10,
        humidity: 60 + Math.random() * 20,
        windSpeed: 5 + Math.random() * 10,
        precipitation: Math.random() * 5,
        forecast: 'Partly Cloudy',
        rainChance: Math.floor(Math.random() * 100),
        uvIndex: Math.floor(Math.random() * 10) + 1,
      };

      res.json({
        success: true,
        data: weatherData,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve weather data',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getRealTimeData(req: Request, res: Response) {
    try {
      updateSystemStatus();
      
      res.json({
        success: true,
        data: {
          zones: zones,
          system: systemStatus,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve real-time data',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

// Validation rules
export const irrigationValidation = {
  createZone: [
    body('name').notEmpty().withMessage('Zone name is required'),
    body('area').isNumeric().withMessage('Area must be a number'),
    body('cropType').notEmpty().withMessage('Crop type is required'),
    body('flowRate').isNumeric().withMessage('Flow rate must be a number'),
  ],
  
  updateZone: [
    param('zoneId').notEmpty().withMessage('Zone ID is required'),
  ],
  
  zoneControl: [
    param('zoneId').notEmpty().withMessage('Zone ID is required'),
  ],
};