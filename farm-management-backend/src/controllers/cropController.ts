// @ts-nocheck
import { Request, Response } from 'express';
import { body, param, query, validationResult } from 'express-validator';

// Extend Request interface to include user property
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    farmId: string;
    role: string;
  };
}

// Mock database - in production, this would be replaced with actual database models
interface EnhancedCrop {
  id: string;
  farmId: string;
  name: string;
  variety: string;
  category: 'vegetables' | 'fruits' | 'grains' | 'herbs' | 'legumes' | 'flowers';
  
  // Location and Area
  fieldLocation: string;
  coordinates?: { lat: number; lng: number };
  area: number; // in hectares
  soilType: string;
  
  // Lifecycle Management
  plantingDate: string;
  expectedHarvestDate: string;
  actualHarvestDate?: string;
  stage: CropStage;
  growthProgress: number; // percentage 0-100
  
  // Worker Assignment and Task Management
  assignedWorkers: WorkerAssignment[];
  taskSchedule: CropTask[];
  workHours: WorkHourLog[];
  
  // Agricultural Data
  varietyInfo: VarietyInfo;
  environmentalConditions: EnvironmentalConditions;
  
  // Management Records
  fertilizerPlan: FertilizerRecord[];
  irrigationSchedule: IrrigationRecord[];
  pestControlLog: PestControlRecord[];
  
  // Harvest and Yield
  harvestSchedule: HarvestSchedule[];
  harvestYield?: YieldRecord[];
  qualityMetrics: QualityMetrics;
  
  // Monitoring and Analytics
  photos: PhotoRecord[];
  healthStatus: HealthStatus;
  riskFactors: RiskFactor[];
  recommendations: Recommendation[];
  
  // Financial
  costs: CostRecord[];
  expectedRevenue: number;
  actualRevenue?: number;
  profitMargin?: number;
  
  // Metadata
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface CropStage {
  current: 'planning' | 'preparation' | 'planting' | 'germination' | 'vegetative' | 'flowering' | 'fruiting' | 'maturation' | 'harvest' | 'post_harvest';
  progress: number;
  expectedDuration: number;
  actualDuration?: number;
  milestones: StageMilestone[];
}

interface StageMilestone {
  name: string;
  targetDate: string;
  actualDate?: string;
  status: 'pending' | 'achieved' | 'missed';
  description: string;
  requirements: string[];
}

interface WorkerAssignment {
  id: string;
  workerId: string;
  workerName: string;
  role: 'supervisor' | 'field_worker' | 'specialist' | 'harvester';
  assignedDate: string;
  endDate?: string;
  responsibilities: string[];
  isActive: boolean;
  performance: WorkerPerformance;
}

interface WorkerPerformance {
  efficiency: number;
  qualityScore: number;
  tasksCompleted: number;
  averageTimePerTask: number;
  lastEvaluation: string;
}

interface CropTask {
  id: string;
  title: string;
  description: string;
  type: 'planting' | 'watering' | 'fertilizing' | 'pest_control' | 'pruning' | 'harvesting' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  assignedWorkers: string[];
  estimatedHours: number;
  actualHours?: number;
  scheduledDate: string;
  startedAt?: string;
  completedAt?: string;
  dueDate: string;
  requirements: TaskRequirement[];
  materials: MaterialRequirement[];
  equipment: EquipmentRequirement[];
  weather: WeatherRequirement;
  notes: string;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

interface TaskRequirement {
  skill: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  certification?: string;
}

interface MaterialRequirement {
  name: string;
  quantity: number;
  unit: string;
  cost?: number;
  supplier?: string;
}

interface EquipmentRequirement {
  name: string;
  type: string;
  required: boolean;
  alternatives?: string[];
}

interface WeatherRequirement {
  minTemperature?: number;
  maxTemperature?: number;
  maxWindSpeed?: number;
  precipitationAllowed: boolean;
  idealConditions: string;
}

interface WorkHourLog {
  id: string;
  workerId: string;
  workerName: string;
  taskId?: string;
  taskType: string;
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  breakHours: number;
  productivity: number;
  notes: string;
  supervisorApproval: boolean;
  createdAt: string;
}

interface VarietyInfo {
  scientificName: string;
  growthHabit: string;
  maturityDays: number;
  yieldPotential: number;
  climateZone: string[];
  soilPreference: string[];
  waterRequirement: 'low' | 'medium' | 'high';
  sunlightRequirement: 'full_sun' | 'partial_shade' | 'shade';
  spacing: {
    rowSpacing: number;
    plantSpacing: number;
  };
}

interface EnvironmentalConditions {
  temperature: {
    min: number;
    max: number;
    average: number;
    optimal: { min: number; max: number };
  };
  humidity: {
    current: number;
    optimal: { min: number; max: number };
  };
  soilMoisture: {
    current: number;
    optimal: { min: number; max: number };
  };
  ph: {
    current: number;
    optimal: { min: number; max: number };
  };
  lightHours: number;
  lastUpdated: string;
}

interface HarvestSchedule {
  id: string;
  estimatedDate: string;
  estimatedYield: number;
  assignedWorkers: string[];
  estimatedHours: number;
  equipment: string[];
  marketPrice?: number;
  buyer?: string;
  qualityTarget: string;
  storageArrangements: string;
  transportArrangements: string;
  weather: WeatherRequirement;
  status: 'planned' | 'scheduled' | 'in_progress' | 'completed' | 'postponed';
  createdAt: string;
  updatedAt: string;
}

interface YieldRecord {
  id: string;
  harvestDate: string;
  quantity: number;
  unit: string;
  quality: 'premium' | 'grade_a' | 'grade_b' | 'processing' | 'waste';
  marketPrice: number;
  buyer: string;
  revenue: number;
  harvestCost: number;
  netProfit: number;
  workerHours: number;
  productivity: number;
  notes: string;
  photos: string[];
  storageLocation: string;
  batchNumber: string;
  createdAt: string;
}

interface QualityMetrics {
  overallGrade: 'A' | 'B' | 'C' | 'D';
  size: {
    average: number;
    range: { min: number; max: number };
    uniformity: number;
  };
  color: {
    score: number;
    consistency: number;
  };
  defects: QualityDefect[];
  pestDamage: number;
  diseasePresence: number;
  nutritionalValue: NutritionalValue;
  shelfLife: number;
  lastAssessment: string;
}

interface QualityDefect {
  type: string;
  severity: 'minor' | 'moderate' | 'severe';
  percentage: number;
  impact: string;
}

interface NutritionalValue {
  protein?: number;
  carbohydrates?: number;
  fiber?: number;
  vitamins: { [key: string]: number };
  minerals: { [key: string]: number };
}

interface PhotoRecord {
  id: string;
  url: string;
  thumbnail: string;
  caption: string;
  type: 'growth' | 'disease' | 'pest' | 'harvest' | 'quality' | 'general';
  stage: string;
  takenBy: string;
  takenAt: string;
  location?: { lat: number; lng: number };
  metadata: {
    weather: string;
    equipment: string;
    settings: any;
  };
}

interface HealthStatus {
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  plantVigor: number;
  diseasePresence: DiseaseRecord[];
  pestPresence: PestRecord[];
  nutritionalDeficiency: DeficiencyRecord[];
  stressFactors: StressFactor[];
  treatmentHistory: TreatmentRecord[];
  lastAssessment: string;
  nextAssessmentDue: string;
}

interface DiseaseRecord {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  affectedArea: number;
  identifiedDate: string;
  treatment: string;
  status: 'active' | 'treated' | 'resolved';
}

interface PestRecord {
  name: string;
  type: 'insect' | 'mite' | 'nematode' | 'rodent' | 'bird';
  severity: 'low' | 'medium' | 'high';
  population: number;
  identifiedDate: string;
  treatment: string;
  status: 'active' | 'controlled' | 'eliminated';
}

interface DeficiencyRecord {
  nutrient: string;
  severity: 'mild' | 'moderate' | 'severe';
  symptoms: string[];
  identifiedDate: string;
  treatment: string;
  status: 'active' | 'treating' | 'resolved';
}

interface StressFactor {
  type: 'water' | 'temperature' | 'light' | 'soil' | 'chemical' | 'physical';
  description: string;
  severity: 'low' | 'medium' | 'high';
  duration: string;
  impact: string;
  mitigation: string;
}

interface TreatmentRecord {
  id: string;
  type: 'chemical' | 'biological' | 'cultural' | 'mechanical';
  product: string;
  dosage: string;
  method: string;
  appliedBy: string;
  appliedDate: string;
  reason: string;
  effectiveness: number;
  sideEffects: string[];
  cost: number;
  witholdingPeriod?: number;
}

interface RiskFactor {
  type: 'weather' | 'disease' | 'pest' | 'market' | 'operational';
  description: string;
  probability: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  contingencyPlan: string;
  status: 'monitoring' | 'active' | 'mitigated';
  lastUpdated: string;
}

interface Recommendation {
  id: string;
  type: 'irrigation' | 'fertilization' | 'pest_control' | 'pruning' | 'harvest' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  reasoning: string;
  actionRequired: string;
  timeline: string;
  estimatedCost?: number;
  estimatedBenefit?: number;
  roi?: number;
  status: 'new' | 'reviewed' | 'approved' | 'implemented' | 'dismissed';
  createdBy: 'ai' | 'expert' | 'user';
  createdAt: string;
  implementedAt?: string;
  feedback?: string;
}

interface CostRecord {
  id: string;
  category: 'seeds' | 'fertilizer' | 'pesticide' | 'labor' | 'equipment' | 'irrigation' | 'fuel' | 'maintenance' | 'other';
  description: string;
  amount: number;
  currency: string;
  date: string;
  vendor?: string;
  invoice?: string;
  notes: string;
  allocatedBy: string;
  createdAt: string;
}

interface FertilizerRecord {
  id: string;
  name: string;
  type: 'organic' | 'synthetic' | 'biological';
  npkRatio: string;
  applicationRate: number;
  applicationDate: string;
  applicationMethod: string;
  cost: number;
  appliedBy: string;
  weatherConditions: string;
  soilConditions: string;
  effectiveness?: number;
  notes: string;
}

interface IrrigationRecord {
  id: string;
  date: string;
  duration: number;
  amount: number;
  method: 'sprinkler' | 'drip' | 'flood' | 'manual';
  pressure: number;
  soilMoistureBefore: number;
  soilMoistureAfter: number;
  weatherConditions: string;
  operatedBy: string;
  cost: number;
  effectiveness: number;
  notes: string;
}

interface PestControlRecord {
  id: string;
  pestName: string;
  pestType: 'insect' | 'disease' | 'weed' | 'rodent';
  treatmentType: 'chemical' | 'biological' | 'cultural' | 'mechanical';
  product: string;
  concentration: string;
  applicationDate: string;
  applicationMethod: string;
  coverage: number;
  cost: number;
  appliedBy: string;
  witholdingPeriod: number;
  effectiveness: number;
  reapplicationRequired: boolean;
  nextApplicationDate?: string;
  notes: string;
}

interface CropAnalytics {
  totalCrops: number;
  cropsByStage: { [key: string]: number };
  cropsByCategory: { [key: string]: number };
  totalArea: number;
  averageYield: number;
  totalRevenue: number;
  totalCosts: number;
  profitMargin: number;
  productivity: {
    workHoursPerHectare: number;
    yieldPerWorkerHour: number;
    costPerKg: number;
    revenuePerHectare: number;
  };
  trends: {
    yieldTrend: Array<{ date: string; yield: number }>;
    costTrend: Array<{ date: string; cost: number }>;
    profitTrend: Array<{ date: string; profit: number }>;
  };
  topPerformingCrops: Array<{
    cropId: string;
    name: string;
    yield: number;
    profit: number;
    roi: number;
  }>;
  workerPerformance: Array<{
    workerId: string;
    name: string;
    efficiency: number;
    tasksCompleted: number;
    averageQuality: number;
  }>;
}

// Mock data storage
let crops: EnhancedCrop[] = [
  {
    id: '1',
    farmId: 'farm_1',
    name: 'Premium Tomatoes',
    variety: 'Cherokee Purple',
    category: 'vegetables',
    fieldLocation: 'Greenhouse Block A',
    coordinates: { lat: 40.7128, lng: -74.0060 },
    area: 2.5,
    soilType: 'Loamy',
    plantingDate: '2025-09-15T00:00:00Z',
    expectedHarvestDate: '2025-12-01T00:00:00Z',
    stage: {
      current: 'fruiting',
      progress: 75,
      expectedDuration: 85,
      actualDuration: 63,
      milestones: [
        {
          name: 'First Flowering',
          targetDate: '2025-10-20T00:00:00Z',
          actualDate: '2025-10-18T00:00:00Z',
          status: 'achieved',
          description: 'First flowers appeared',
          requirements: ['Adequate pollination', 'Temperature control']
        }
      ]
    },
    growthProgress: 75,
    assignedWorkers: [
      {
        id: 'wa_1',
        workerId: 'worker_1',
        workerName: 'Maria Rodriguez',
        role: 'supervisor',
        assignedDate: '2025-09-15T00:00:00Z',
        responsibilities: ['Daily monitoring', 'Pest control', 'Harvest coordination'],
        isActive: true,
        performance: {
          efficiency: 92,
          qualityScore: 95,
          tasksCompleted: 28,
          averageTimePerTask: 45,
          lastEvaluation: '2025-10-30T00:00:00Z'
        }
      }
    ],
    taskSchedule: [],
    workHours: [],
    varietyInfo: {
      scientificName: 'Solanum lycopersicum',
      growthHabit: 'Indeterminate',
      maturityDays: 85,
      yieldPotential: 60000,
      climateZone: ['Zone 6', 'Zone 7', 'Zone 8'],
      soilPreference: ['Loamy', 'Sandy Loam'],
      waterRequirement: 'high',
      sunlightRequirement: 'full_sun',
      spacing: {
        rowSpacing: 120,
        plantSpacing: 60
      }
    },
    environmentalConditions: {
      temperature: {
        min: 18,
        max: 28,
        average: 23,
        optimal: { min: 20, max: 26 }
      },
      humidity: {
        current: 65,
        optimal: { min: 60, max: 70 }
      },
      soilMoisture: {
        current: 70,
        optimal: { min: 65, max: 80 }
      },
      ph: {
        current: 6.2,
        optimal: { min: 6.0, max: 6.8 }
      },
      lightHours: 14,
      lastUpdated: '2025-11-03T12:00:00Z'
    },
    fertilizerPlan: [],
    irrigationSchedule: [],
    pestControlLog: [],
    harvestSchedule: [],
    harvestYield: [],
    qualityMetrics: {
      overallGrade: 'A',
      size: {
        average: 150,
        range: { min: 120, max: 180 },
        uniformity: 88
      },
      color: {
        score: 92,
        consistency: 85
      },
      defects: [],
      pestDamage: 5,
      diseasePresence: 2,
      nutritionalValue: {
        vitamins: { 'C': 28, 'K': 7.9 },
        minerals: { 'Potassium': 237, 'Folate': 15 }
      },
      shelfLife: 7,
      lastAssessment: '2025-11-01T00:00:00Z'
    },
    photos: [],
    healthStatus: {
      overall: 'excellent',
      plantVigor: 92,
      diseasePresence: [],
      pestPresence: [],
      nutritionalDeficiency: [],
      stressFactors: [],
      treatmentHistory: [],
      lastAssessment: '2025-11-01T00:00:00Z',
      nextAssessmentDue: '2025-11-08T00:00:00Z'
    },
    riskFactors: [],
    recommendations: [],
    costs: [],
    expectedRevenue: 45000,
    actualRevenue: 0,
    notes: 'High-value heirloom variety for premium market',
    tags: ['premium', 'heirloom', 'organic'],
    createdAt: '2025-09-15T00:00:00Z',
    updatedAt: '2025-11-03T12:00:00Z',
    createdBy: 'user_1'
  }
];

let cropTasks: { [cropId: string]: CropTask[] } = {
  '1': [
    {
      id: 'task_1',
      title: 'Daily Plant Inspection',
      description: 'Check plant health, growth progress, and identify any issues',
      type: 'maintenance',
      priority: 'high',
      status: 'in_progress',
      assignedWorkers: ['worker_1'],
      estimatedHours: 2,
      scheduledDate: '2025-11-03T08:00:00Z',
      dueDate: '2025-11-03T18:00:00Z',
      requirements: [
        {
          skill: 'Plant Health Assessment',
          experienceLevel: 'intermediate'
        }
      ],
      materials: [],
      equipment: [
        {
          name: 'Digital Camera',
          type: 'photography',
          required: true
        }
      ],
      weather: {
        precipitationAllowed: true,
        idealConditions: 'Clear morning for best visibility'
      },
      notes: 'Focus on flowering stage development',
      photos: [],
      createdAt: '2025-11-01T00:00:00Z',
      updatedAt: '2025-11-03T08:00:00Z'
    }
  ]
};

// Utility functions
const updateCrop = (cropId: string, updates: Partial<EnhancedCrop>): EnhancedCrop | null => {
  const cropIndex = crops.findIndex(c => c.id === cropId);
  if (cropIndex === -1) return null;
  
  const existingCrop = crops[cropIndex];
  crops[cropIndex] = {
    ...existingCrop,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  return crops[cropIndex] || null;
};

const generateAnalytics = (): CropAnalytics => {
  const totalCrops = crops.length;
  const cropsByStage = crops.reduce((acc, crop) => {
    acc[crop.stage.current] = (acc[crop.stage.current] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  const cropsByCategory = crops.reduce((acc, crop) => {
    acc[crop.category] = (acc[crop.category] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  const totalArea = crops.reduce((sum, crop) => sum + crop.area, 0);
  const totalRevenue = crops.reduce((sum, crop) => sum + (crop.actualRevenue || crop.expectedRevenue), 0);
  const totalCosts = crops.reduce((sum, crop) => sum + crop.costs.reduce((costSum, cost) => costSum + cost.amount, 0), 0);
  
  return {
    totalCrops,
    cropsByStage,
    cropsByCategory,
    totalArea,
    averageYield: 35750, // Mock average
    totalRevenue,
    totalCosts,
    profitMargin: totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalRevenue) * 100 : 0,
    productivity: {
      workHoursPerHectare: 32,
      yieldPerWorkerHour: 145.8,
      costPerKg: 1.08,
      revenuePerHectare: totalArea > 0 ? totalRevenue / totalArea : 0
    },
    trends: {
      yieldTrend: [
        { date: '2025-08', yield: 11500 },
        { date: '2025-09', yield: 8500 },
        { date: '2025-10', yield: 15500 }
      ],
      costTrend: [
        { date: '2025-08', cost: 3500 },
        { date: '2025-09', cost: 2800 },
        { date: '2025-10', cost: 4200 }
      ],
      profitTrend: [
        { date: '2025-08', profit: 25250 },
        { date: '2025-09', profit: 18750 },
        { date: '2025-10', profit: 28500 }
      ]
    },
    topPerformingCrops: crops.slice(0, 3).map(crop => ({
      cropId: crop.id,
      name: crop.name,
      yield: crop.varietyInfo.yieldPotential * crop.area,
      profit: (crop.actualRevenue || crop.expectedRevenue) - crop.costs.reduce((sum, cost) => sum + cost.amount, 0),
      roi: 150 // Mock ROI
    })),
    workerPerformance: [
      {
        workerId: 'worker_1',
        name: 'Maria Rodriguez',
        efficiency: 92,
        tasksCompleted: 28,
        averageQuality: 95
      }
    ]
  };
};

export class CropController {
  // Crop Management
  static async getAllCrops(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const farmId = req.user?.farmId || 'farm_1';
      const farmCrops = crops.filter(crop => crop.farmId === farmId);
      
      res.json({
        success: true,
        data: farmCrops,
        total: farmCrops.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve crops',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getCropById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { cropId } = req.params;
      const crop = crops.find(c => c.id === cropId);
      
      if (!crop) {
        res.status(404).json({
          success: false,
          message: 'Crop not found',
        });
        return;
      }

      res.json({
        success: true,
        data: crop,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve crop',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async createCrop(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array(),
        });
        return;
      }

      const farmId = req.user?.farmId || 'farm_1';
      const newCrop: EnhancedCrop = {
        id: Date.now().toString(),
        farmId,
        ...req.body,
        assignedWorkers: [],
        taskSchedule: [],
        workHours: [],
        photos: [],
        costs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: req.user?.userId || 'user_1',
      };

      crops.push(newCrop);

      res.status(201).json({
        success: true,
        message: 'Crop created successfully',
        data: newCrop,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create crop',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async updateCrop(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { cropId } = req.params;
      if (!cropId) {
        res.status(400).json({
          success: false,
          message: 'Crop ID is required',
        });
        return;
      }

      const updates = req.body;
      const updatedCrop = updateCrop(cropId, updates);
      
      if (!updatedCrop) {
        res.status(404).json({
          success: false,
          message: 'Crop not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Crop updated successfully',
        data: updatedCrop,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update crop',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async deleteCrop(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { cropId } = req.params;
      if (!cropId) {
        res.status(400).json({
          success: false,
          message: 'Crop ID is required',
        });
        return;
      }

      const cropIndex = crops.findIndex(c => c.id === cropId);
      
      if (cropIndex === -1) {
        res.status(404).json({
          success: false,
          message: 'Crop not found',
        });
        return;
      }

      crops.splice(cropIndex, 1);
      // Also remove associated tasks
      if (cropTasks[cropId]) {
        delete cropTasks[cropId];
      }

      res.json({
        success: true,
        message: 'Crop deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete crop',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Task Management
  static async getCropTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { cropId } = req.params;
      if (!cropId) {
        res.status(400).json({
          success: false,
          message: 'Crop ID is required',
        });
        return;
      }

      const tasks = cropTasks[cropId] || [];
      
      res.json({
        success: true,
        data: tasks,
        total: tasks.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve crop tasks',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async createCropTask(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { cropId } = req.params;
      if (!cropId) {
        res.status(400).json({
          success: false,
          message: 'Crop ID is required',
        });
        return;
      }

      const newTask: CropTask = {
        id: Date.now().toString(),
        ...req.body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (!cropTasks[cropId]) {
        cropTasks[cropId] = [];
      }
      cropTasks[cropId].push(newTask);

      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: newTask,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create task',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Worker Assignment
  static async assignWorkerToCrop(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { cropId } = req.params;
      if (!cropId) {
        res.status(400).json({
          success: false,
          message: 'Crop ID is required',
        });
        return;
      }

      const assignment: WorkerAssignment = {
        id: Date.now().toString(),
        ...req.body,
      };

      const crop = crops.find(c => c.id === cropId);
      if (!crop) {
        res.status(404).json({
          success: false,
          message: 'Crop not found',
        });
        return;
      }

      crop.assignedWorkers.push(assignment);
      crop.updatedAt = new Date().toISOString();

      res.status(201).json({
        success: true,
        message: 'Worker assigned successfully',
        data: assignment,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to assign worker',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Analytics
  static async getCropAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const analytics = generateAnalytics();
      
      res.json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve analytics',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getCropPredictions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { cropId } = req.params;
      if (!cropId) {
        res.status(400).json({
          success: false,
          message: 'Crop ID is required',
        });
        return;
      }

      const crop = crops.find(c => c.id === cropId);
      
      if (!crop) {
        res.status(404).json({
          success: false,
          message: 'Crop not found',
        });
        return;
      }

      // Mock prediction data
      const prediction = {
        cropId,
        predictedYield: crop.varietyInfo.yieldPotential * crop.area * 0.85,
        confidence: 87,
        factors: [
          {
            factor: 'Weather Conditions',
            impact: 15,
            description: 'Favorable temperature and rainfall patterns'
          },
          {
            factor: 'Soil Health',
            impact: 12,
            description: 'Optimal nutrient levels and pH balance'
          }
        ],
        recommendations: [
          'Maintain current irrigation schedule',
          'Apply booster fertilizer in week 3'
        ],
        riskFactors: [
          'Late season frost risk in December'
        ],
        optimizationOpportunities: [
          'Implement precision irrigation for 5% yield increase'
        ]
      };

      res.json({
        success: true,
        data: prediction,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve predictions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Photo Upload
  static async uploadCropPhoto(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { cropId } = req.params;
      if (!cropId) {
        res.status(400).json({
          success: false,
          message: 'Crop ID is required',
        });
        return;
      }

      const crop = crops.find(c => c.id === cropId);
      
      if (!crop) {
        res.status(404).json({
          success: false,
          message: 'Crop not found',
        });
        return;
      }

      // Mock photo upload
      const photoRecord: PhotoRecord = {
        id: Date.now().toString(),
        url: `https://example.com/photos/${cropId}/${Date.now()}.jpg`,
        thumbnail: `https://example.com/photos/${cropId}/${Date.now()}_thumb.jpg`,
        caption: req.body.caption || 'Crop photo',
        type: req.body.type || 'general',
        stage: crop.stage.current,
        takenBy: req.user?.userId || 'user_1',
        takenAt: new Date().toISOString(),
        metadata: {
          weather: 'Clear',
          equipment: 'Digital Camera',
          settings: {}
        }
      };

      crop.photos.push(photoRecord);
      crop.updatedAt = new Date().toISOString();

      res.json({
        success: true,
        message: 'Photo uploaded successfully',
        data: { url: photoRecord.url },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to upload photo',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

// Validation rules
export const cropValidation = {
  createCrop: [
    body('name').notEmpty().withMessage('Crop name is required'),
    body('variety').notEmpty().withMessage('Variety is required'),
    body('category').isIn(['vegetables', 'fruits', 'grains', 'herbs', 'legumes', 'flowers']).withMessage('Invalid category'),
    body('fieldLocation').notEmpty().withMessage('Field location is required'),
    body('area').isNumeric().withMessage('Area must be a number')
      .custom((value) => {
        if (value <= 0) {
          throw new Error('Area must be positive');
        }
        return true;
      }),
    body('plantingDate').isISO8601().withMessage('Invalid planting date'),
    body('expectedHarvestDate').isISO8601().withMessage('Invalid harvest date')
      .custom((value, { req }) => {
        const plantingDate = new Date(req.body.plantingDate);
        const harvestDate = new Date(value);
        if (harvestDate <= plantingDate) {
          throw new Error('Expected harvest date must be after planting date');
        }
        return true;
      }),
  ],
  
  updateCrop: [
    param('cropId').notEmpty().withMessage('Crop ID is required'),
  ],
  
  createTask: [
    param('cropId').notEmpty().withMessage('Crop ID is required'),
    body('title').notEmpty().withMessage('Task title is required'),
    body('type').isIn(['planting', 'watering', 'fertilizing', 'pest_control', 'pruning', 'harvesting', 'maintenance']).withMessage('Invalid task type'),
    body('priority').isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority'),
    body('scheduledDate').isISO8601().withMessage('Invalid scheduled date'),
    body('dueDate').isISO8601().withMessage('Invalid due date'),
  ],
};