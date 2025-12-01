// Enhanced types for crop management with worker integration
export interface EnhancedCrop {
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

export interface WorkerAssignment {
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

export interface WorkerPerformance {
  efficiency: number; // 0-100
  qualityScore: number; // 0-100
  tasksCompleted: number;
  averageTimePerTask: number; // in minutes
  lastEvaluation: string;
}

export interface CropTask {
  id: string;
  title: string;
  description: string;
  type: 'planting' | 'watering' | 'fertilizing' | 'pest_control' | 'pruning' | 'harvesting' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  
  assignedWorkers: string[]; // worker IDs
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

export interface TaskRequirement {
  skill: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  certification?: string;
}

export interface MaterialRequirement {
  name: string;
  quantity: number;
  unit: string;
  cost?: number;
  supplier?: string;
}

export interface EquipmentRequirement {
  name: string;
  type: string;
  required: boolean;
  alternatives?: string[];
}

export interface WeatherRequirement {
  minTemperature?: number;
  maxTemperature?: number;
  maxWindSpeed?: number;
  precipitationAllowed: boolean;
  idealConditions: string;
}

export interface WorkHourLog {
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
  productivity: number; // 0-100
  notes: string;
  supervisorApproval: boolean;
  createdAt: string;
}

export interface CropStage {
  current: 'planning' | 'preparation' | 'planting' | 'germination' | 'vegetative' | 'flowering' | 'fruiting' | 'maturation' | 'harvest' | 'post_harvest';
  progress: number; // 0-100
  expectedDuration: number; // days
  actualDuration?: number; // days
  milestones: StageMilestone[];
}

export interface StageMilestone {
  name: string;
  targetDate: string;
  actualDate?: string;
  status: 'pending' | 'achieved' | 'missed';
  description: string;
  requirements: string[];
}

export interface VarietyInfo {
  scientificName: string;
  growthHabit: string;
  maturityDays: number;
  yieldPotential: number; // kg per hectare
  climateZone: string[];
  soilPreference: string[];
  waterRequirement: 'low' | 'medium' | 'high';
  sunlightRequirement: 'full_sun' | 'partial_shade' | 'shade';
  spacing: {
    rowSpacing: number; // cm
    plantSpacing: number; // cm
  };
}

export interface EnvironmentalConditions {
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

export interface HarvestSchedule {
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

export interface YieldRecord {
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
  productivity: number; // kg per hour
  notes: string;
  photos: string[];
  storageLocation: string;
  batchNumber: string;
  createdAt: string;
}

export interface QualityMetrics {
  overallGrade: 'A' | 'B' | 'C' | 'D';
  size: {
    average: number;
    range: { min: number; max: number };
    uniformity: number; // 0-100
  };
  color: {
    score: number; // 0-100
    consistency: number; // 0-100
  };
  defects: QualityDefect[];
  pestDamage: number; // 0-100
  diseasePresence: number; // 0-100
  nutritionalValue: NutritionalValue;
  shelfLife: number; // days
  lastAssessment: string;
}

export interface QualityDefect {
  type: string;
  severity: 'minor' | 'moderate' | 'severe';
  percentage: number;
  impact: string;
}

export interface NutritionalValue {
  protein?: number;
  carbohydrates?: number;
  fiber?: number;
  vitamins: { [key: string]: number };
  minerals: { [key: string]: number };
}

export interface PhotoRecord {
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

export interface HealthStatus {
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  plantVigor: number; // 0-100
  diseasePresence: DiseaseRecord[];
  pestPresence: PestRecord[];
  nutritionalDeficiency: DeficiencyRecord[];
  stressFactors: StressFactor[];
  treatmentHistory: TreatmentRecord[];
  lastAssessment: string;
  nextAssessmentDue: string;
}

export interface DiseaseRecord {
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  affectedArea: number; // percentage
  identifiedDate: string;
  treatment: string;
  status: 'active' | 'treated' | 'resolved';
}

export interface PestRecord {
  name: string;
  type: 'insect' | 'mite' | 'nematode' | 'rodent' | 'bird';
  severity: 'low' | 'medium' | 'high';
  population: number;
  identifiedDate: string;
  treatment: string;
  status: 'active' | 'controlled' | 'eliminated';
}

export interface DeficiencyRecord {
  nutrient: string;
  severity: 'mild' | 'moderate' | 'severe';
  symptoms: string[];
  identifiedDate: string;
  treatment: string;
  status: 'active' | 'treating' | 'resolved';
}

export interface StressFactor {
  type: 'water' | 'temperature' | 'light' | 'soil' | 'chemical' | 'physical';
  description: string;
  severity: 'low' | 'medium' | 'high';
  duration: string;
  impact: string;
  mitigation: string;
}

export interface TreatmentRecord {
  id: string;
  type: 'chemical' | 'biological' | 'cultural' | 'mechanical';
  product: string;
  dosage: string;
  method: string;
  appliedBy: string;
  appliedDate: string;
  reason: string;
  effectiveness: number; // 0-100
  sideEffects: string[];
  cost: number;
  witholdingPeriod?: number; // days
}

export interface RiskFactor {
  type: 'weather' | 'disease' | 'pest' | 'market' | 'operational';
  description: string;
  probability: number; // 0-100
  impact: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  contingencyPlan: string;
  status: 'monitoring' | 'active' | 'mitigated';
  lastUpdated: string;
}

export interface Recommendation {
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

export interface CostRecord {
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

export interface FertilizerRecord {
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

export interface IrrigationRecord {
  id: string;
  date: string;
  duration: number; // minutes
  amount: number; // liters
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

export interface PestControlRecord {
  id: string;
  pestName: string;
  pestType: 'insect' | 'disease' | 'weed' | 'rodent';
  treatmentType: 'chemical' | 'biological' | 'cultural' | 'mechanical';
  product: string;
  concentration: string;
  applicationDate: string;
  applicationMethod: string;
  coverage: number; // percentage
  cost: number;
  appliedBy: string;
  witholdingPeriod: number; // days
  effectiveness: number; // 0-100
  reapplicationRequired: boolean;
  nextApplicationDate?: string;
  notes: string;
}

// API Response Types
export interface CropResponse {
  success: boolean;
  data: EnhancedCrop;
  message?: string;
}

export interface CropsResponse {
  success: boolean;
  data: EnhancedCrop[];
  total: number;
  page?: number;
  limit?: number;
  message?: string;
}

export interface CropTaskResponse {
  success: boolean;
  data: CropTask;
  message?: string;
}

export interface CropTasksResponse {
  success: boolean;
  data: CropTask[];
  total: number;
  message?: string;
}

export interface WorkerAssignmentResponse {
  success: boolean;
  data: WorkerAssignment;
  message?: string;
}

export interface CropAnalytics {
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

export interface CropPrediction {
  cropId: string;
  predictedYield: number;
  confidence: number;
  factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  recommendations: string[];
  riskFactors: string[];
  optimizationOpportunities: string[];
}

// Filter and Search Types
export interface CropFilters {
  stage?: string[];
  category?: string[];
  assignedWorker?: string;
  fieldLocation?: string;
  plantingDateRange?: {
    start: string;
    end: string;
  };
  harvestDateRange?: {
    start: string;
    end: string;
  };
  riskLevel?: string[];
  healthStatus?: string[];
}

export interface CropSortOptions {
  field: 'name' | 'plantingDate' | 'harvestDate' | 'area' | 'expectedRevenue' | 'stage' | 'healthStatus';
  direction: 'asc' | 'desc';
}

export interface CropSearchParams {
  farmId?: string;
  query?: string;
  filters?: CropFilters;
  sort?: CropSortOptions;
  page?: number;
  limit?: number;
}