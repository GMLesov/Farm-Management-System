/**
 * Smart Irrigation Management Service
 * IoT-integrated irrigation system with automated scheduling, 
 * soil sensor monitoring, weather-based adjustments, and water optimization
 */

// Core Irrigation Data Models
export interface IrrigationZone {
  id: string;
  name: string;
  description: string;
  fieldId: string;
  cropId?: string;
  area: number; // in acres
  location: {
    latitude: number;
    longitude: number;
    elevation: number;
  };
  soilType: 'clay' | 'loam' | 'sand' | 'silt' | 'rocky' | 'mixed';
  soilCharacteristics: {
    drainageRate: 'poor' | 'moderate' | 'good' | 'excellent';
    waterHoldingCapacity: number; // inches of water per foot of soil
    infiltrationRate: number; // inches per hour
    organicMatter: number; // percentage
    compaction: 'none' | 'light' | 'moderate' | 'severe';
  };
  irrigationSystem: IrrigationSystem;
  sensors: IoTSensor[];
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  settings: IrrigationSettings;
  schedule: IrrigationSchedule[];
  history: IrrigationEvent[];
  waterBudget: WaterBudget;
  alerts: IrrigationAlert[];
}

export interface IrrigationSystem {
  id: string;
  type: 'sprinkler' | 'drip' | 'pivot' | 'flood' | 'micro_spray' | 'subsurface';
  subType?: string; // e.g., 'center_pivot', 'linear_move', 'solid_set'
  manufacturer: string;
  model: string;
  installDate: Date;
  capacity: {
    flowRate: number; // gallons per minute
    pressure: number; // PSI
    coverage: number; // acres
  };
  efficiency: {
    applicationEfficiency: number; // percentage
    distributionUniformity: number; // percentage
    waterUseEfficiency: number; // percentage
  };
  components: SystemComponent[];
  maintenanceHistory: MaintenanceRecord[];
  operatingHours: number;
  energyConsumption: number; // kWh
  status: 'operational' | 'maintenance' | 'fault' | 'offline';
}

export interface SystemComponent {
  id: string;
  type: 'pump' | 'valve' | 'controller' | 'sensor' | 'nozzle' | 'filter' | 'pipe';
  name: string;
  specifications: { [key: string]: any };
  installDate: Date;
  lastMaintenance?: Date;
  nextMaintenance: Date;
  status: 'good' | 'warning' | 'fault' | 'offline';
  alerts: string[];
}

export interface IoTSensor {
  id: string;
  type: 'soil_moisture' | 'soil_temperature' | 'ambient_temperature' | 'humidity' | 'pressure' | 'flow_rate' | 'water_level';
  name: string;
  location: {
    x: number; // relative position in zone
    y: number;
    depth?: number; // for soil sensors
  };
  manufacturer: string;
  model: string;
  installDate: Date;
  batteryLevel?: number;
  signalStrength: number;
  calibrationDate: Date;
  status: 'online' | 'offline' | 'low_battery' | 'error';
  readings: SensorReading[];
  thresholds: SensorThresholds;
  alerts: SensorAlert[];
}

export interface SensorAlert {
  id: string;
  type: 'threshold_breach' | 'low_battery' | 'signal_loss' | 'device_error';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: Date;
  resolved?: boolean;
}

export interface SensorReading {
  timestamp: Date;
  value: number;
  unit: string;
  quality: 'good' | 'fair' | 'poor' | 'invalid';
  batteryLevel?: number;
  signalStrength?: number;
}

export interface SensorThresholds {
  minimum: number;
  maximum: number;
  optimal: {
    min: number;
    max: number;
  };
  critical: {
    min: number;
    max: number;
  };
  alertEnabled: boolean;
}

export interface IrrigationSettings {
  mode: 'manual' | 'scheduled' | 'automatic' | 'sensor_based' | 'smart';
  autoStart: boolean;
  weatherIntegration: boolean;
  soilMoistureTarget: {
    minimum: number; // percentage
    maximum: number; // percentage
    optimal: number; // percentage
  };
  constraints: {
    maxDailyWater: number; // inches
    maxSessionDuration: number; // minutes
    minTimeBetweenSessions: number; // hours
    allowedTimeWindows: Array<{
      startTime: string; // HH:MM format
      endTime: string;
      daysOfWeek: number[]; // 0=Sunday, 1=Monday, etc.
    }>;
  };
  cropFactors: {
    cropCoefficient: number; // Kc value
    rootDepth: number; // inches
    criticalPeriods: string[]; // growth stages requiring more water
  };
  efficiency: {
    applicationRate: number; // inches per hour
    runoffFactor: number; // percentage
    evaporationLoss: number; // percentage
  };
  alerts: {
    lowSoilMoisture: boolean;
    highSoilMoisture: boolean;
    systemFaults: boolean;
    maintenanceReminders: boolean;
    waterBudgetExceeded: boolean;
  };
}

export interface IrrigationSchedule {
  id: string;
  name: string;
  zoneId?: string;
  type: 'fixed' | 'flexible' | 'deficit' | 'precision';
  status: 'active' | 'inactive' | 'paused' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: Date;
  endDate?: Date;
  frequency: {
    type: 'daily' | 'weekly' | 'interval' | 'conditional';
    interval?: number; // days between irrigation
    daysOfWeek?: number[];
    conditions?: ScheduleCondition[];
  };
  timing: {
    startTime: string; // HH:MM
    duration: number; // minutes
    maxDuration?: number; // minutes
  };
  waterAmount: {
    target: number; // inches
    minimum: number; // inches
    maximum: number; // inches
  };
  conditions: {
    minSoilMoisture?: number; // percentage
    maxSoilMoisture?: number; // percentage
    minTemperature?: number; // Fahrenheit
    maxTemperature?: number; // Fahrenheit
    maxWindSpeed?: number; // mph
    noRainHours?: number; // hours since last rain
    weatherForecast?: boolean; // check forecast before irrigation
    precipitationProbability?: number; // percent chance of rain
  };
  adjustments: {
    weatherBased: boolean;
    sensorBased: boolean;
    cropStageMultiplier: number;
    seasonalMultiplier: number;
  };
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
}

export interface ScheduleCondition {
  type: 'sensor_reading' | 'weather_condition' | 'time_constraint' | 'crop_stage';
  parameter: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'between' | 'not_equals';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface IrrigationEvent {
  id: string;
  scheduleId?: string;
  zoneId: string;
  type: 'scheduled' | 'manual' | 'automatic' | 'emergency';
  status: 'planned' | 'running' | 'completed' | 'cancelled' | 'failed';
  startTime: Date;
  endTime?: Date;
  plannedDuration: number; // minutes
  actualDuration?: number; // minutes
  waterApplied: {
    planned: number; // inches
    actual?: number; // inches
    efficiency?: number; // percentage
  };
  trigger: {
    type: 'schedule' | 'sensor' | 'manual' | 'weather' | 'emergency';
    description: string;
    data?: any;
  };
  conditions: {
    soilMoistureBefore?: number; // percentage
    soilMoistureAfter?: number; // percentage
    temperature: number; // Fahrenheit
    humidity: number; // percentage
    windSpeed: number; // mph
    rainfall: number; // inches in last 24h
  };
  systemPerformance: {
    flowRate?: number; // GPM
    pressure?: number; // PSI
    energyUsed?: number; // kWh
    faults?: string[];
  };
  results: {
    success: boolean;
    soilMoistureIncrease?: number; // percentage
    uniformity?: number; // percentage
    runoff?: number; // percentage
    deepPercolation?: number; // percentage
  };
  cost: {
    water: number; // dollars
    energy: number; // dollars
    total: number; // dollars
  };
  notes?: string;
  photos?: string[];
  createdBy: string;
}

export interface WaterBudget {
  period: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  allocation: number; // inches or gallons
  used: number; // inches or gallons
  remaining: number; // inches or gallons
  efficiency: number; // percentage
  cost: {
    budgeted: number; // dollars
    actual: number; // dollars
    projected: number; // dollars
  };
  restrictions: {
    active: boolean;
    type: 'voluntary' | 'mandatory';
    description: string;
    startDate?: Date;
    endDate?: Date;
  };
  goals: {
    reductionTarget?: number; // percentage
    efficiencyTarget?: number; // percentage
    costTarget?: number; // dollars
  };
}

export interface IrrigationAlert {
  id: string;
  zoneId: string;
  type: 'low_moisture' | 'high_moisture' | 'system_fault' | 'maintenance' | 'budget_exceeded' | 'efficiency_low' | 'sensor_offline';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  data?: any;
  actions: AlertAction[];
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface AlertAction {
  type: 'start_irrigation' | 'stop_irrigation' | 'adjust_schedule' | 'maintenance_request' | 'sensor_check';
  label: string;
  description: string;
  automated: boolean;
}

export interface MaintenanceRecord {
  id: string;
  componentId?: string;
  type: 'routine' | 'preventive' | 'corrective' | 'emergency';
  description: string;
  scheduledDate: Date;
  completedDate?: Date;
  technician: string;
  cost: number;
  parts: Array<{
    name: string;
    quantity: number;
    cost: number;
  }>;
  notes: string;
  photos?: string[];
  nextMaintenance?: Date;
}

// Weather Integration Interface
export interface WeatherData {
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    pressure: number;
    rainfall: number;
    evapotranspiration: number;
  };
  forecast: Array<{
    date: Date;
    temperature: { min: number; max: number };
    humidity: number;
    windSpeed: number;
    precipitationProbability: number;
    precipitationAmount: number;
    evapotranspiration: number;
  }>;
}

// Crop Water Requirement Interface
export interface CropWaterRequirement {
  cropId: string;
  stage: string;
  coefficient: number; // Kc value
  rootDepth: number; // inches
  allowableDepletion: number; // percentage
  criticalPeriod: boolean;
  stressMultiplier: number;
}

/**
 * Smart Irrigation Management Service
 * Comprehensive irrigation system with IoT integration and automated optimization
 */
class SmartIrrigationService {
  private zones: Map<string, IrrigationZone> = new Map();
  private activeEvents: Map<string, IrrigationEvent> = new Map();
  private systemStatus: 'online' | 'offline' | 'maintenance' = 'online';
  private alerts: IrrigationAlert[] = [];

  constructor() {
    this.initializeService();
  }

  private initializeService(): void {
    this.loadZonesFromStorage();
    this.setupAutomaticMonitoring();
    this.startRealTimeProcessing();
  }

  // Zone Management
  public createZone(zoneData: Omit<IrrigationZone, 'id' | 'history' | 'alerts'>): string {
    const zoneId = `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newZone: IrrigationZone = {
      id: zoneId,
      ...zoneData,
      history: [],
      alerts: []
    };

    this.zones.set(zoneId, newZone);
    this.createAlert(zoneId, 'system_fault', 'low', 
      'Irrigation Zone Created', 
      `New irrigation zone "${newZone.name}" has been created and is ready for configuration`
    );

    this.saveZonesToStorage();
    return zoneId;
  }

  public getZone(zoneId: string): IrrigationZone | null {
    return this.zones.get(zoneId) || null;
  }

  public getAllZones(): IrrigationZone[] {
    return Array.from(this.zones.values());
  }

  public getActiveZones(): IrrigationZone[] {
    return this.getAllZones().filter(zone => zone.status === 'active');
  }

  public updateZone(zoneId: string, updates: Partial<IrrigationZone>): boolean {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;

    const updatedZone = { ...zone, ...updates };
    this.zones.set(zoneId, updatedZone);
    this.saveZonesToStorage();
    return true;
  }

  public deleteZone(zoneId: string): boolean {
    const success = this.zones.delete(zoneId);
    if (success) {
      // Stop any active irrigation in this zone
      this.stopIrrigation(zoneId);
      this.saveZonesToStorage();
    }
    return success;
  }

  // Sensor Management
  public addSensor(zoneId: string, sensor: Omit<IoTSensor, 'id'>): string {
    const zone = this.zones.get(zoneId);
    if (!zone) throw new Error('Zone not found');

    const sensorId = `sensor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSensor: IoTSensor = {
      id: sensorId,
      ...sensor,
      readings: [],
      alerts: []
    };

    zone.sensors.push(newSensor);
    this.zones.set(zoneId, zone);
    this.saveZonesToStorage();
    return sensorId;
  }

  public updateSensorReading(zoneId: string, sensorId: string, reading: Omit<SensorReading, 'timestamp'>): boolean {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;

    const sensor = zone.sensors.find(s => s.id === sensorId);
    if (!sensor) return false;

    const newReading: SensorReading = {
      timestamp: new Date(),
      ...reading
    };

    sensor.readings.push(newReading);
    
    // Keep only last 1000 readings
    if (sensor.readings.length > 1000) {
      sensor.readings = sensor.readings.slice(-1000);
    }

    // Check thresholds and create alerts if needed
    this.checkSensorThresholds(zoneId, sensor, newReading);

    this.zones.set(zoneId, zone);
    return true;
  }

  public getSensorReadings(zoneId: string, sensorId: string, hours: number = 24): SensorReading[] {
    const zone = this.zones.get(zoneId);
    if (!zone) return [];

    const sensor = zone.sensors.find(s => s.id === sensorId);
    if (!sensor) return [];

    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    return sensor.readings.filter(reading => reading.timestamp >= since);
  }

  public getLatestSensorReading(zoneId: string, sensorType: IoTSensor['type']): SensorReading | null {
    const zone = this.zones.get(zoneId);
    if (!zone) return null;

    const sensor = zone.sensors.find(s => s.type === sensorType && s.status === 'online');
    if (!sensor || sensor.readings.length === 0) return null;

    return sensor.readings[sensor.readings.length - 1];
  }

  // Schedule Management
  public createSchedule(zoneId: string, schedule: Omit<IrrigationSchedule, 'id' | 'createdAt' | 'lastModified'>): string {
    const zone = this.zones.get(zoneId);
    if (!zone) throw new Error('Zone not found');

    const scheduleId = `schedule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSchedule: IrrigationSchedule = {
      id: scheduleId,
      ...schedule,
      createdAt: new Date(),
      lastModified: new Date()
    };

    zone.schedule.push(newSchedule);
    this.zones.set(zoneId, zone);
    this.saveZonesToStorage();
    return scheduleId;
  }

  public updateSchedule(zoneId: string, scheduleId: string, updates: Partial<IrrigationSchedule>): boolean {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;

    const scheduleIndex = zone.schedule.findIndex(s => s.id === scheduleId);
    if (scheduleIndex === -1) return false;

    zone.schedule[scheduleIndex] = {
      ...zone.schedule[scheduleIndex],
      ...updates,
      lastModified: new Date()
    };

    this.zones.set(zoneId, zone);
    this.saveZonesToStorage();
    return true;
  }

  public deleteSchedule(zoneId: string, scheduleId: string): boolean {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;

    const scheduleIndex = zone.schedule.findIndex(s => s.id === scheduleId);
    if (scheduleIndex === -1) return false;

    zone.schedule.splice(scheduleIndex, 1);
    this.zones.set(zoneId, zone);
    this.saveZonesToStorage();
    return true;
  }

  public getActiveSchedules(zoneId?: string): IrrigationSchedule[] {
    let zones = zoneId ? [this.zones.get(zoneId)].filter(Boolean) : Array.from(this.zones.values());
    
    const activeSchedules: IrrigationSchedule[] = [];
    zones.forEach(zone => {
      if (zone) {
        const zoneActiveSchedules = zone.schedule.filter(s => s.status === 'active');
        activeSchedules.push(...zoneActiveSchedules);
      }
    });

    return activeSchedules;
  }

  // Irrigation Control
  public async startIrrigation(zoneId: string, options: {
    duration?: number;
    waterAmount?: number;
    scheduleId?: string;
    trigger: IrrigationEvent['trigger'];
  }): Promise<string> {
    const zone = this.zones.get(zoneId);
    if (!zone) throw new Error('Zone not found');

    if (zone.status !== 'active') {
      throw new Error(`Zone is not active (status: ${zone.status})`);
    }

    // Check if zone is already irrigating
    const activeEvent = Array.from(this.activeEvents.values()).find(
      event => event.zoneId === zoneId && event.status === 'running'
    );
    if (activeEvent) {
      throw new Error('Zone is already being irrigated');
    }

    // Get current conditions
    const currentConditions = await this.getCurrentConditions(zoneId);
    
    // Calculate irrigation parameters
    const duration = options.duration || this.calculateOptimalDuration(zone, options.waterAmount);
    const waterAmount = options.waterAmount || this.calculateWaterRequirement(zone, duration);

    // Create irrigation event
    const eventId = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const irrigationEvent: IrrigationEvent = {
      id: eventId,
      scheduleId: options.scheduleId,
      zoneId,
      type: options.scheduleId ? 'scheduled' : 'manual',
      status: 'running',
      startTime: new Date(),
      plannedDuration: duration,
      waterApplied: {
        planned: waterAmount
      },
      trigger: options.trigger,
      conditions: currentConditions,
      systemPerformance: {},
      results: {
        success: false
      },
      cost: {
        water: 0,
        energy: 0,
        total: 0
      },
      createdBy: 'system'
    };

    this.activeEvents.set(eventId, irrigationEvent);

    // Add to zone history
    zone.history.push(irrigationEvent);
    this.zones.set(zoneId, zone);

    // Start physical irrigation (would interface with actual hardware)
    await this.startPhysicalIrrigation(zone, irrigationEvent);

    // Schedule automatic stop
    setTimeout(() => {
      this.stopIrrigation(zoneId, eventId);
    }, duration * 60 * 1000);

    this.createAlert(zoneId, 'system_fault', 'low',
      'Irrigation Started',
      `Irrigation started in zone "${zone.name}" for ${duration} minutes`
    );

    return eventId;
  }

  public async stopIrrigation(zoneId: string, eventId?: string): Promise<boolean> {
    const zone = this.zones.get(zoneId);
    if (!zone) return false;

    let activeEvent: IrrigationEvent | undefined;
    
    if (eventId) {
      activeEvent = this.activeEvents.get(eventId);
    } else {
      // Find any active irrigation in this zone
      activeEvent = Array.from(this.activeEvents.values()).find(
        event => event.zoneId === zoneId && event.status === 'running'
      );
    }

    if (!activeEvent) return false;

    // Stop physical irrigation
    await this.stopPhysicalIrrigation(zone, activeEvent);

    // Update event
    activeEvent.status = 'completed';
    activeEvent.endTime = new Date();
    activeEvent.actualDuration = Math.ceil(
      (activeEvent.endTime.getTime() - activeEvent.startTime.getTime()) / (1000 * 60)
    );

    // Calculate results
    const results = await this.calculateIrrigationResults(zone, activeEvent);
    activeEvent.results = results;
    activeEvent.cost = this.calculateIrrigationCost(zone, activeEvent);

    // Update zone history
    const historyIndex = zone.history.findIndex(h => h.id === activeEvent!.id);
    if (historyIndex !== -1) {
      zone.history[historyIndex] = activeEvent;
    }

    // Update water budget
    this.updateWaterBudget(zone, activeEvent);

    this.activeEvents.delete(activeEvent.id);
    this.zones.set(zoneId, zone);
    this.saveZonesToStorage();

    this.createAlert(zoneId, 'system_fault', 'low',
      'Irrigation Completed',
      `Irrigation completed in zone "${zone.name}" after ${activeEvent.actualDuration} minutes`
    );

    return true;
  }

  public getActiveIrrigationEvents(): IrrigationEvent[] {
    return Array.from(this.activeEvents.values()).filter(event => event.status === 'running');
  }

  public getIrrigationHistory(zoneId: string, days: number = 30): IrrigationEvent[] {
    const zone = this.zones.get(zoneId);
    if (!zone) return [];

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return zone.history.filter(event => event.startTime >= since);
  }

  // Smart Scheduling
  public async calculateOptimalSchedule(zoneId: string, weatherData: WeatherData, cropRequirements?: CropWaterRequirement): Promise<IrrigationSchedule[]> {
    const zone = this.zones.get(zoneId);
    if (!zone) return [];

    const recommendations: IrrigationSchedule[] = [];
    
    // Get current soil moisture
    const soilMoisture = this.getLatestSensorReading(zoneId, 'soil_moisture');
    const currentMoisture = soilMoisture ? soilMoisture.value : 50; // default to 50% if no sensor

    // Calculate daily water requirement
    const dailyWaterRequirement = this.calculateDailyWaterRequirement(zone, weatherData, cropRequirements);
    
    // Check if irrigation is needed
    if (currentMoisture < zone.settings.soilMoistureTarget.minimum) {
      // Immediate irrigation needed
      const immediateSchedule: IrrigationSchedule = {
        id: `auto_${Date.now()}`,
        name: 'Immediate Irrigation Required',
        type: 'precision',
        status: 'active',
        priority: 'high',
        startDate: new Date(),
        frequency: {
          type: 'conditional',
          conditions: [{
            type: 'sensor_reading',
            parameter: 'soil_moisture',
            operator: 'less_than',
            value: zone.settings.soilMoistureTarget.minimum
          }]
        },
        timing: {
          startTime: this.getOptimalIrrigationTime(weatherData),
          duration: this.calculateOptimalDuration(zone, dailyWaterRequirement)
        },
        waterAmount: {
          target: dailyWaterRequirement,
          minimum: dailyWaterRequirement * 0.8,
          maximum: dailyWaterRequirement * 1.2
        },
        conditions: {
          minSoilMoisture: zone.settings.soilMoistureTarget.minimum,
          maxWindSpeed: 15,
          weatherForecast: true
        },
        adjustments: {
          weatherBased: true,
          sensorBased: true,
          cropStageMultiplier: cropRequirements?.coefficient || 1.0,
          seasonalMultiplier: this.getSeasonalMultiplier()
        },
        createdBy: 'smart_system',
        createdAt: new Date(),
        lastModified: new Date()
      };
      
      recommendations.push(immediateSchedule);
    }

    // Generate forecast-based schedule for next 7 days
    for (let day = 1; day <= 7; day++) {
      const forecastDay = weatherData.forecast[day - 1];
      if (!forecastDay) continue;

      const irrigation = this.shouldIrrigateBasedOnForecast(zone, forecastDay, cropRequirements);
      if (irrigation.needed) {
        const scheduleDate = new Date();
        scheduleDate.setDate(scheduleDate.getDate() + day);

        const forecastSchedule: IrrigationSchedule = {
          id: `forecast_${day}_${Date.now()}`,
          name: `Smart Schedule - Day ${day}`,
          type: 'flexible',
          status: 'active',
          priority: irrigation.priority,
          startDate: scheduleDate,
          frequency: {
            type: 'daily'
          },
          timing: {
            startTime: this.getOptimalIrrigationTime(weatherData, forecastDay),
            duration: irrigation.duration
          },
          waterAmount: {
            target: irrigation.waterAmount,
            minimum: irrigation.waterAmount * 0.8,
            maximum: irrigation.waterAmount * 1.2
          },
          conditions: {
            maxWindSpeed: 15,
            weatherForecast: true,
            precipitationProbability: 30 // Don't irrigate if >30% chance of rain
          },
          adjustments: {
            weatherBased: true,
            sensorBased: true,
            cropStageMultiplier: cropRequirements?.coefficient || 1.0,
            seasonalMultiplier: this.getSeasonalMultiplier()
          },
          createdBy: 'smart_system',
          createdAt: new Date(),
          lastModified: new Date()
        };

        recommendations.push(forecastSchedule);
      }
    }

    return recommendations;
  }

  // Water Management
  public calculateWaterEfficiency(zoneId: string, days: number = 30): {
    applicationEfficiency: number;
    distributionUniformity: number;
    waterUseEfficiency: number;
    totalWaterUsed: number;
    averageCostPerInch: number;
  } {
    const zone = this.zones.get(zoneId);
    if (!zone) {
      return {
        applicationEfficiency: 0,
        distributionUniformity: 0,
        waterUseEfficiency: 0,
        totalWaterUsed: 0,
        averageCostPerInch: 0
      };
    }

    const history = this.getIrrigationHistory(zoneId, days);
    if (history.length === 0) {
      return {
        applicationEfficiency: zone.irrigationSystem.efficiency.applicationEfficiency,
        distributionUniformity: zone.irrigationSystem.efficiency.distributionUniformity,
        waterUseEfficiency: zone.irrigationSystem.efficiency.waterUseEfficiency,
        totalWaterUsed: 0,
        averageCostPerInch: 0
      };
    }

    const completedEvents = history.filter(event => event.status === 'completed');
    
    let totalWaterPlanned = 0;
    let totalWaterActual = 0;
    let totalCost = 0;
    let efficiencySum = 0;
    let uniformitySum = 0;

    completedEvents.forEach(event => {
      totalWaterPlanned += event.waterApplied.planned;
      totalWaterActual += event.waterApplied.actual || event.waterApplied.planned;
      totalCost += event.cost.total;
      
      if (event.waterApplied.efficiency) {
        efficiencySum += event.waterApplied.efficiency;
      }
      
      if (event.results.uniformity) {
        uniformitySum += event.results.uniformity;
      }
    });

    const applicationEfficiency = completedEvents.length > 0 ? 
      (totalWaterActual / totalWaterPlanned) * 100 : 
      zone.irrigationSystem.efficiency.applicationEfficiency;

    const distributionUniformity = completedEvents.length > 0 ? 
      uniformitySum / completedEvents.length : 
      zone.irrigationSystem.efficiency.distributionUniformity;

    const waterUseEfficiency = this.calculateWaterUseEfficiency(zone, completedEvents);

    return {
      applicationEfficiency: Math.round(applicationEfficiency * 100) / 100,
      distributionUniformity: Math.round(distributionUniformity * 100) / 100,
      waterUseEfficiency: Math.round(waterUseEfficiency * 100) / 100,
      totalWaterUsed: Math.round(totalWaterActual * 100) / 100,
      averageCostPerInch: totalWaterActual > 0 ? Math.round((totalCost / totalWaterActual) * 100) / 100 : 0
    };
  }

  // Alert Management
  public createAlert(
    zoneId: string, 
    type: IrrigationAlert['type'], 
    priority: IrrigationAlert['priority'],
    title: string, 
    message: string,
    data?: any
  ): string {
    const alertId = `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const alert: IrrigationAlert = {
      id: alertId,
      zoneId,
      type,
      priority,
      title,
      message,
      timestamp: new Date(),
      status: 'active',
      data,
      actions: this.generateAlertActions(type)
    };

    this.alerts.push(alert);
    
    // Add to zone alerts
    const zone = this.zones.get(zoneId);
    if (zone) {
      zone.alerts.push(alert);
      this.zones.set(zoneId, zone);
    }

    return alertId;
  }

  public getAlerts(zoneId?: string, activeOnly: boolean = false): IrrigationAlert[] {
    let filteredAlerts = this.alerts;

    if (zoneId) {
      filteredAlerts = filteredAlerts.filter(alert => alert.zoneId === zoneId);
    }

    if (activeOnly) {
      filteredAlerts = filteredAlerts.filter(alert => alert.status === 'active');
    }

    return filteredAlerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  public acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.status = 'acknowledged';
    return true;
  }

  public resolveAlert(alertId: string, resolvedBy: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) return false;

    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    alert.resolvedBy = resolvedBy;
    return true;
  }

  // Analytics and Reporting
  public getZoneAnalytics(zoneId: string): any {
    const zone = this.zones.get(zoneId);
    if (!zone) return null;

    const efficiency = this.calculateWaterEfficiency(zoneId);
    const recentHistory = this.getIrrigationHistory(zoneId, 30);
    const activeAlerts = this.getAlerts(zoneId, true);
    const sensorStatus = this.getSensorStatus(zoneId);

    return {
      zone: {
        id: zone.id,
        name: zone.name,
        status: zone.status,
        area: zone.area,
        soilType: zone.soilType
      },
      efficiency,
      irrigation: {
        eventsLast30Days: recentHistory.length,
        totalWaterUsed: efficiency.totalWaterUsed,
        averageSessionDuration: recentHistory.length > 0 ? 
          recentHistory.reduce((sum, event) => sum + (event.actualDuration || event.plannedDuration), 0) / recentHistory.length : 0,
        successRate: recentHistory.length > 0 ? 
          (recentHistory.filter(event => event.results.success).length / recentHistory.length) * 100 : 100
      },
      sensors: sensorStatus,
      alerts: {
        active: activeAlerts.length,
        critical: activeAlerts.filter(a => a.priority === 'critical').length,
        byType: this.groupAlertsByType(activeAlerts)
      },
      waterBudget: zone.waterBudget,
      recommendations: this.generateZoneRecommendations(zone)
    };
  }

  public getSystemAnalytics(): any {
    const allZones = this.getAllZones();
    const activeZones = this.getActiveZones();
    const totalActiveEvents = this.getActiveIrrigationEvents();
    const totalAlerts = this.getAlerts(undefined, true);

    let totalWaterUsed = 0;
    let totalCost = 0;
    let avgEfficiency = 0;

    allZones.forEach(zone => {
      const efficiency = this.calculateWaterEfficiency(zone.id);
      totalWaterUsed += efficiency.totalWaterUsed;
      totalCost += efficiency.totalWaterUsed * efficiency.averageCostPerInch;
      avgEfficiency += efficiency.applicationEfficiency;
    });

    avgEfficiency = allZones.length > 0 ? avgEfficiency / allZones.length : 0;

    return {
      system: {
        status: this.systemStatus,
        totalZones: allZones.length,
        activeZones: activeZones.length,
        currentlyIrrigating: totalActiveEvents.length
      },
      water: {
        totalUsed: Math.round(totalWaterUsed * 100) / 100,
        totalCost: Math.round(totalCost * 100) / 100,
        averageEfficiency: Math.round(avgEfficiency * 100) / 100
      },
      alerts: {
        total: totalAlerts.length,
        critical: totalAlerts.filter(a => a.priority === 'critical').length,
        byType: this.groupAlertsByType(totalAlerts)
      },
      zones: allZones.map(zone => ({
        id: zone.id,
        name: zone.name,
        status: zone.status,
        efficiency: this.calculateWaterEfficiency(zone.id).applicationEfficiency,
        alerts: this.getAlerts(zone.id, true).length
      }))
    };
  }

  // Helper Methods
  private async getCurrentConditions(zoneId: string): Promise<IrrigationEvent['conditions']> {
    const tempReading = this.getLatestSensorReading(zoneId, 'ambient_temperature');
    const humidityReading = this.getLatestSensorReading(zoneId, 'humidity');
    const soilMoistureReading = this.getLatestSensorReading(zoneId, 'soil_moisture');

    // In a real implementation, this would get current weather data
    return {
      soilMoistureBefore: soilMoistureReading ? soilMoistureReading.value : undefined,
      temperature: tempReading ? tempReading.value : 70,
      humidity: humidityReading ? humidityReading.value : 60,
      windSpeed: 5, // Would come from weather service
      rainfall: 0 // Would come from weather service
    };
  }

  private calculateOptimalDuration(zone: IrrigationZone, waterAmount?: number): number {
    const targetWater = waterAmount || zone.settings.soilMoistureTarget.optimal / 100;
    const applicationRate = zone.settings.efficiency.applicationRate;
    
    // Basic calculation: water amount / application rate * 60 (convert to minutes)
    const duration = (targetWater / applicationRate) * 60;
    
    // Apply constraints
    return Math.min(
      Math.max(duration, 10), // minimum 10 minutes
      zone.settings.constraints.maxSessionDuration
    );
  }

  private calculateWaterRequirement(zone: IrrigationZone, duration: number): number {
    const applicationRate = zone.settings.efficiency.applicationRate;
    return (applicationRate * duration) / 60; // convert minutes to hours
  }

  private calculateDailyWaterRequirement(zone: IrrigationZone, weatherData: WeatherData, cropRequirements?: CropWaterRequirement): number {
    // Base ET calculation
    const baseET = weatherData.current.evapotranspiration || this.estimateEvapotranspiration(weatherData.current);
    
    // Apply crop coefficient
    const cropCoefficient = cropRequirements?.coefficient || zone.settings.cropFactors.cropCoefficient;
    const cropET = baseET * cropCoefficient;
    
    // Adjust for rainfall
    const effectiveRainfall = weatherData.current.rainfall * 0.8; // assume 80% effectiveness
    
    return Math.max(0, cropET - effectiveRainfall);
  }

  private estimateEvapotranspiration(weather: WeatherData['current']): number {
    // Simplified Penman-Monteith equation
    const temperature = weather.temperature;
    const humidity = weather.humidity;
    const windSpeed = weather.windSpeed;
    
    // Basic ET calculation (inches per day)
    const et = (temperature - 32) * 0.1 * (1 - humidity / 100) * (1 + windSpeed / 10);
    return Math.max(0, et / 25.4); // convert mm to inches
  }

  private getOptimalIrrigationTime(weatherData: WeatherData, forecastDay?: WeatherData['forecast'][0]): string {
    // Prefer early morning (4-8 AM) for minimal evaporation and wind
    const currentHour = new Date().getHours();
    
    if (currentHour >= 4 && currentHour <= 8) {
      return '06:00'; // Current optimal window
    } else if (currentHour >= 18 && currentHour <= 22) {
      return '20:00'; // Evening option
    } else {
      return '06:00'; // Default to early morning
    }
  }

  private shouldIrrigateBasedOnForecast(zone: IrrigationZone, forecast: WeatherData['forecast'][0], cropRequirements?: CropWaterRequirement): {
    needed: boolean;
    priority: IrrigationSchedule['priority'];
    duration: number;
    waterAmount: number;
  } {
    // Don't irrigate if high chance of rain
    if (forecast.precipitationProbability > 70) {
      return { needed: false, priority: 'low', duration: 0, waterAmount: 0 };
    }

    // Calculate water need based on ET and precipitation
    const dailyET = forecast.evapotranspiration || this.estimateEvapotranspiration({
      temperature: (forecast.temperature.min + forecast.temperature.max) / 2,
      humidity: forecast.humidity,
      windSpeed: forecast.windSpeed,
      pressure: 0,
      rainfall: forecast.precipitationAmount,
      evapotranspiration: 0
    });

    const cropET = dailyET * (cropRequirements?.coefficient || zone.settings.cropFactors.cropCoefficient);
    const effectiveRain = forecast.precipitationAmount * 0.8;
    const waterNeed = Math.max(0, cropET - effectiveRain);

    if (waterNeed > 0.1) { // Need at least 0.1 inches
      const priority: IrrigationSchedule['priority'] = 
        waterNeed > 0.3 ? 'high' :
        waterNeed > 0.15 ? 'medium' : 'low';

      return {
        needed: true,
        priority,
        duration: this.calculateOptimalDuration(zone, waterNeed),
        waterAmount: waterNeed
      };
    }

    return { needed: false, priority: 'low', duration: 0, waterAmount: 0 };
  }

  private getSeasonalMultiplier(): number {
    const month = new Date().getMonth(); // 0-11
    
    // Adjust based on season (Northern Hemisphere)
    if (month >= 2 && month <= 4) return 1.2; // Spring - higher water needs
    if (month >= 5 && month <= 8) return 1.3; // Summer - highest water needs
    if (month >= 9 && month <= 11) return 0.9; // Fall - lower water needs
    return 0.7; // Winter - lowest water needs
  }

  private async startPhysicalIrrigation(zone: IrrigationZone, event: IrrigationEvent): Promise<void> {
    // In a real implementation, this would interface with physical irrigation hardware
    // For now, we'll simulate the start
    console.log(`Starting irrigation in zone ${zone.name} for ${event.plannedDuration} minutes`);
    
    // Update system performance data
    event.systemPerformance.flowRate = zone.irrigationSystem.capacity.flowRate;
    event.systemPerformance.pressure = zone.irrigationSystem.capacity.pressure;
  }

  private async stopPhysicalIrrigation(zone: IrrigationZone, event: IrrigationEvent): Promise<void> {
    // In a real implementation, this would interface with physical irrigation hardware
    console.log(`Stopping irrigation in zone ${zone.name}`);
  }

  private async calculateIrrigationResults(zone: IrrigationZone, event: IrrigationEvent): Promise<IrrigationEvent['results']> {
    // Get soil moisture after irrigation
    const soilMoistureAfter = this.getLatestSensorReading(zone.id, 'soil_moisture');
    const moistureIncrease = soilMoistureAfter && event.conditions.soilMoistureBefore ? 
      soilMoistureAfter.value - event.conditions.soilMoistureBefore : 0;

    return {
      success: moistureIncrease > 0,
      soilMoistureIncrease: moistureIncrease,
      uniformity: zone.irrigationSystem.efficiency.distributionUniformity,
      runoff: Math.random() * 5, // Simulated - would be measured
      deepPercolation: Math.random() * 10 // Simulated - would be measured
    };
  }

  private calculateIrrigationCost(zone: IrrigationZone, event: IrrigationEvent): IrrigationEvent['cost'] {
    const waterAmount = event.waterApplied.actual || event.waterApplied.planned;
    const duration = event.actualDuration || event.plannedDuration;
    
    // Water cost (example: $2 per inch per acre)
    const waterCost = waterAmount * zone.area * 2;
    
    // Energy cost (example: $0.10 per kWh, 5 kWh per hour of operation)
    const energyCost = (duration / 60) * 5 * 0.10;
    
    return {
      water: Math.round(waterCost * 100) / 100,
      energy: Math.round(energyCost * 100) / 100,
      total: Math.round((waterCost + energyCost) * 100) / 100
    };
  }

  private updateWaterBudget(zone: IrrigationZone, event: IrrigationEvent): void {
    const waterUsed = event.waterApplied.actual || event.waterApplied.planned;
    
    zone.waterBudget.used += waterUsed;
    zone.waterBudget.remaining = Math.max(0, zone.waterBudget.allocation - zone.waterBudget.used);
    zone.waterBudget.cost.actual += event.cost.total;
    
    // Check if budget exceeded
    if (zone.waterBudget.used > zone.waterBudget.allocation) {
      this.createAlert(zone.id, 'budget_exceeded', 'high',
        'Water Budget Exceeded',
        `Zone "${zone.name}" has exceeded its water budget allocation`
      );
    }
  }

  private checkSensorThresholds(zoneId: string, sensor: IoTSensor, reading: SensorReading): void {
    if (!sensor.thresholds.alertEnabled) return;

    const value = reading.value;
    const thresholds = sensor.thresholds;

    if (value < thresholds.critical.min || value > thresholds.critical.max) {
      this.createAlert(zoneId, sensor.type === 'soil_moisture' ? 'low_moisture' : 'sensor_offline', 'critical',
        `Critical ${sensor.type} Reading`,
        `${sensor.name} reading (${value}${reading.unit}) is outside critical range`
      );
    } else if (value < thresholds.minimum || value > thresholds.maximum) {
      this.createAlert(zoneId, sensor.type === 'soil_moisture' ? 'low_moisture' : 'sensor_offline', 'high',
        `${sensor.type} Warning`,
        `${sensor.name} reading (${value}${reading.unit}) is outside normal range`
      );
    }
  }

  private calculateWaterUseEfficiency(zone: IrrigationZone, events: IrrigationEvent[]): number {
    // Calculate based on crop yield vs water applied
    // For now, return system efficiency
    return zone.irrigationSystem.efficiency.waterUseEfficiency;
  }

  private getSensorStatus(zoneId: string): any {
    const zone = this.zones.get(zoneId);
    if (!zone) return {};

    const sensorStatus: any = {};
    zone.sensors.forEach(sensor => {
      const latestReading = sensor.readings[sensor.readings.length - 1];
      sensorStatus[sensor.type] = {
        status: sensor.status,
        latestValue: latestReading ? latestReading.value : null,
        lastUpdate: latestReading ? latestReading.timestamp : null,
        batteryLevel: sensor.batteryLevel
      };
    });

    return sensorStatus;
  }

  private groupAlertsByType(alerts: IrrigationAlert[]): { [key: string]: number } {
    return alerts.reduce((groups, alert) => {
      groups[alert.type] = (groups[alert.type] || 0) + 1;
      return groups;
    }, {} as { [key: string]: number });
  }

  private generateAlertActions(type: IrrigationAlert['type']): AlertAction[] {
    const actions: AlertAction[] = [];

    switch (type) {
      case 'low_moisture':
        actions.push({
          type: 'start_irrigation',
          label: 'Start Irrigation',
          description: 'Begin irrigation to restore soil moisture',
          automated: false
        });
        break;
      case 'high_moisture':
        actions.push({
          type: 'stop_irrigation',
          label: 'Stop Irrigation',
          description: 'Stop current irrigation to prevent overwatering',
          automated: true
        });
        break;
      case 'system_fault':
        actions.push({
          type: 'maintenance_request',
          label: 'Request Maintenance',
          description: 'Schedule maintenance for system repair',
          automated: false
        });
        break;
      case 'sensor_offline':
        actions.push({
          type: 'sensor_check',
          label: 'Check Sensor',
          description: 'Inspect sensor and restore connection',
          automated: false
        });
        break;
    }

    return actions;
  }

  private generateZoneRecommendations(zone: IrrigationZone): string[] {
    const recommendations: string[] = [];
    const efficiency = this.calculateWaterEfficiency(zone.id);
    const activeAlerts = this.getAlerts(zone.id, true);

    // Efficiency recommendations
    if (efficiency.applicationEfficiency < 75) {
      recommendations.push('Consider system maintenance to improve application efficiency');
    }

    if (efficiency.distributionUniformity < 80) {
      recommendations.push('Check sprinkler heads and pressure for uniform distribution');
    }

    // Alert-based recommendations
    if (activeAlerts.some(a => a.type === 'sensor_offline')) {
      recommendations.push('Restore offline sensors for better monitoring');
    }

    if (zone.waterBudget.used / zone.waterBudget.allocation > 0.8) {
      recommendations.push('Monitor water usage closely - approaching budget limit');
    }

    // Scheduling recommendations
    const recentIrrigation = this.getIrrigationHistory(zone.id, 7);
    if (recentIrrigation.length === 0) {
      recommendations.push('Consider setting up automated irrigation schedules');
    }

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }

  private setupAutomaticMonitoring(): void {
    // Set up periodic monitoring and automation
    setInterval(() => {
      this.processScheduledIrrigation();
      this.monitorSensorAlerts();
      this.updateSystemStatus();
    }, 60 * 1000); // Every minute
  }

  private startRealTimeProcessing(): void {
    // In a real implementation, this would connect to IoT message queues
    // For now, simulate periodic sensor updates
    setInterval(() => {
      this.simulateSensorReadings();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  private processScheduledIrrigation(): void {
    const activeSchedules = this.getActiveSchedules();
    const now = new Date();

    activeSchedules.forEach(schedule => {
      if (this.shouldExecuteSchedule(schedule, now)) {
        if (!schedule.zoneId) {
          return;
        }
        const zone = this.zones.get(schedule.zoneId);
        if (zone) {
          this.startIrrigation(schedule.zoneId, {
            duration: schedule.timing.duration,
            scheduleId: schedule.id,
            trigger: {
              type: 'schedule',
              description: `Scheduled irrigation: ${schedule.name}`,
              data: { scheduleId: schedule.id }
            }
          });
        }
      }
    });
  }

  private shouldExecuteSchedule(schedule: IrrigationSchedule, now: Date): boolean {
    // Implementation would check all schedule conditions
    // For now, simplified check based on timing
    const scheduleTime = schedule.timing.startTime.split(':');
    const scheduleHour = parseInt(scheduleTime[0]);
    const scheduleMinute = parseInt(scheduleTime[1]);

    return now.getHours() === scheduleHour && now.getMinutes() === scheduleMinute;
  }

  private monitorSensorAlerts(): void {
    this.getAllZones().forEach(zone => {
      zone.sensors.forEach(sensor => {
        // Check if sensor is offline
        const latestReading = sensor.readings[sensor.readings.length - 1];
        if (latestReading) {
          const minutesSinceReading = (Date.now() - latestReading.timestamp.getTime()) / (1000 * 60);
          if (minutesSinceReading > 30 && sensor.status === 'online') { // 30 minutes without data
            sensor.status = 'offline';
            this.createAlert(zone.id, 'sensor_offline', 'high',
              'Sensor Offline',
              `${sensor.name} has not reported data for ${Math.round(minutesSinceReading)} minutes`
            );
          }
        }
      });
    });
  }

  private updateSystemStatus(): void {
    const allZones = this.getAllZones();
    const activeZones = allZones.filter(zone => zone.status === 'active');
    const faultedZones = allZones.filter(zone => zone.status === 'error');

    if (faultedZones.length > 0) {
      this.systemStatus = 'maintenance';
    } else if (activeZones.length === 0) {
      this.systemStatus = 'offline';
    } else {
      this.systemStatus = 'online';
    }
  }

  private simulateSensorReadings(): void {
    // Simulate sensor readings for testing
    this.getAllZones().forEach(zone => {
      zone.sensors.forEach(sensor => {
        if (sensor.status === 'online') {
          let value: number;
          
          switch (sensor.type) {
            case 'soil_moisture':
              value = 30 + Math.random() * 40; // 30-70%
              break;
            case 'soil_temperature':
              value = 60 + Math.random() * 20; // 60-80°F
              break;
            case 'ambient_temperature':
              value = 65 + Math.random() * 25; // 65-90°F
              break;
            case 'humidity':
              value = 40 + Math.random() * 40; // 40-80%
              break;
            default:
              value = Math.random() * 100;
          }

          this.updateSensorReading(zone.id, sensor.id, {
            value: Math.round(value * 100) / 100,
            unit: this.getSensorUnit(sensor.type),
            quality: 'good'
          });
        }
      });
    });
  }

  private getSensorUnit(sensorType: IoTSensor['type']): string {
    switch (sensorType) {
      case 'soil_moisture': return '%';
      case 'soil_temperature': return '°F';
      case 'ambient_temperature': return '°F';
      case 'humidity': return '%';
      case 'pressure': return 'PSI';
      case 'flow_rate': return 'GPM';
      case 'water_level': return 'inches';
      default: return 'units';
    }
  }

  private loadZonesFromStorage(): void {
    // In a real app, this would load from persistent storage
  }

  private saveZonesToStorage(): void {
    // In a real app, this would save to persistent storage
  }
}

// Export singleton instance
export const smartIrrigationService = new SmartIrrigationService();
export default SmartIrrigationService;