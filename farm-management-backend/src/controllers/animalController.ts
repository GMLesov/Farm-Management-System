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
interface EnhancedAnimal {
  id: string;
  farmId: string;
  name: string;
  tagNumber: string;
  rfidTag?: string;
  species: AnimalSpecies;
  breed: string;
  gender: 'male' | 'female';
  birthDate: string;
  acquisitionDate: string;
  acquisitionSource: 'born_on_farm' | 'purchased' | 'donated' | 'inherited';
  
  // Physical and identification
  physicalTraits: PhysicalTraits;
  identificationMarks: IdentificationMark[];
  
  // Location and housing
  currentLocation: AnimalLocation;
  locationHistory: LocationHistory[];
  housing: HousingInfo;
  
  // Health and medical
  healthStatus: AnimalHealthStatus;
  medicalHistory: MedicalRecord[];
  vaccinations: VaccinationRecord[];
  treatments: TreatmentRecord[];
  
  // Breeding and production
  breedingInfo: BreedingInfo;
  offspring: OffspringRecord[];
  parentage: ParentageInfo;
  productionRecords: ProductionRecord[];
  performanceMetrics: PerformanceMetrics;
  feedConsumption: FeedRecord[];
  
  // Photo and document management
  photos: AnimalPhoto[];
  photoAnalytics: PhotoAnalytics;
  documents: AnimalDocument[];
  
  // Financial and management
  financialData: AnimalFinancialData;
  assignedCaretakers: AnimalCaretaker[];
  careSchedule: CareTask[];
  
  // Analytics and insights
  insights: AnimalInsights;
  predictiveAnalytics: PredictiveData;
  
  // Lifecycle
  status: AnimalStatus;
  lifecycle: LifecycleEvent[];
  
  // Metadata
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface AnimalSpecies {
  type: 'cattle' | 'sheep' | 'goats' | 'pigs' | 'chickens' | 'horses' | 'other';
  category: 'livestock' | 'poultry' | 'equine' | 'companion';
  expectedLifespan: number;
  maturityAge: number;
  breedingAge: number;
}

interface PhysicalTraits {
  weight: WeightRecord[];
  height?: number;
  length?: number;
  color: string;
  markings: string[];
  distinguishingFeatures: string[];
  bodyConditionScore: number;
  temperament: 'calm' | 'nervous' | 'aggressive' | 'friendly' | 'timid';
}

interface WeightRecord {
  id: string;
  weight: number;
  unit: 'kg' | 'lbs';
  date: string;
  method: 'scale' | 'tape_measure' | 'visual_estimate';
  recordedBy: string;
  bodyConditionScore?: number;
  notes: string;
}

interface IdentificationMark {
  type: 'ear_tag' | 'tattoo' | 'brand' | 'microchip' | 'natural_marking';
  location: string;
  value: string;
  date: string;
  photo?: string;
}

interface AnimalLocation {
  fieldId: string;
  fieldName: string;
  coordinates?: { lat: number; lng: number };
  paddockNumber?: string;
  barnSection?: string;
  lastMoved: string;
  movedBy: string;
  reason: string;
}

interface LocationHistory {
  id: string;
  fromLocation: string;
  toLocation: string;
  movedDate: string;
  movedBy: string;
  reason: string;
  duration: number;
  notes: string;
}

interface HousingInfo {
  type: 'pasture' | 'barn' | 'stable' | 'pen' | 'coop' | 'field';
  capacity: number;
  currentOccupancy: number;
  facilities: HousingFacility[];
  conditions: HousingConditions;
  lastInspection: string;
  inspectionScore: number;
}

interface HousingFacility {
  name: string;
  type: 'feeder' | 'waterer' | 'shelter' | 'fencing' | 'bedding';
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'needs_repair';
  lastMaintenance: string;
  nextMaintenance: string;
}

interface HousingConditions {
  temperature?: number;
  humidity?: number;
  ventilation: 'excellent' | 'good' | 'fair' | 'poor';
  cleanliness: 'excellent' | 'good' | 'fair' | 'poor';
  waterAccess: boolean;
  feedAccess: boolean;
  shelter: boolean;
}

interface AnimalHealthStatus {
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  lastExamination: string;
  nextExamination: string;
  examiningVet: string;
  currentConditions: HealthCondition[];
  activeTreatments: string[];
  quarantineStatus: boolean;
  quarantineReason?: string;
  quarantineEndDate?: string;
}

interface HealthCondition {
  name: string;
  type: 'acute' | 'chronic' | 'genetic' | 'infectious';
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  diagnosedDate: string;
  symptoms: string[];
  treatment: string;
  prognosis: string;
  status: 'active' | 'resolved' | 'managed' | 'monitoring';
}

interface MedicalRecord {
  id: string;
  date: string;
  type: 'examination' | 'treatment' | 'surgery' | 'emergency' | 'routine_checkup';
  veterinarian: string;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  medications: Medication[];
  cost: number;
  followUpRequired: boolean;
  followUpDate?: string;
  notes: string;
  photos: string[];
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: 'oral' | 'injection' | 'topical' | 'intravenous';
  startDate: string;
  endDate: string;
  withdrawalPeriod?: number;
  cost: number;
}

interface VaccinationRecord {
  id: string;
  vaccine: string;
  disease: string;
  date: string;
  nextDue: string;
  administeredBy: string;
  batchNumber: string;
  manufacturer: string;
  site: string;
  dose: string;
  reactions: string[];
  cost: number;
  notes: string;
}

interface TreatmentRecord {
  id: string;
  date: string;
  type: 'preventive' | 'therapeutic' | 'emergency';
  condition: string;
  treatment: string;
  medications: Medication[];
  administeredBy: string;
  effectiveness: number;
  sideEffects: string[];
  cost: number;
  duration: number;
  followUpRequired: boolean;
  notes: string;
}

interface BreedingInfo {
  breedingStatus: 'not_breeding' | 'available' | 'pregnant' | 'lactating' | 'retired';
  reproductiveHistory: ReproductiveEvent[];
  breedingValue: number;
  geneticMarkers: GeneticMarker[];
  lastBreeding?: string;
  expectedDelivery?: string;
  gestationPeriod?: number;
}

interface ReproductiveEvent {
  id: string;
  type: 'breeding' | 'insemination' | 'pregnancy_check' | 'birth' | 'weaning';
  date: string;
  partner?: string;
  method: 'natural' | 'artificial_insemination' | 'embryo_transfer';
  result: 'successful' | 'unsuccessful' | 'pending';
  notes: string;
  cost: number;
  veterinarian?: string;
}

interface GeneticMarker {
  trait: string;
  value: string;
  inheritance: 'dominant' | 'recessive' | 'codominant';
  expression: 'expressed' | 'carrier' | 'clear';
  tested: boolean;
  testDate?: string;
}

interface OffspringRecord {
  id: string;
  animalId: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female';
  birthWeight: number;
  weaningDate?: string;
  weaningWeight?: number;
  status: 'alive' | 'deceased' | 'sold' | 'transferred';
  currentLocation?: string;
}

interface ParentageInfo {
  sire?: {
    id: string;
    name: string;
    breed: string;
    registrationNumber?: string;
  };
  dam?: {
    id: string;
    name: string;
    breed: string;
    registrationNumber?: string;
  };
  verified: boolean;
  verificationMethod: 'dna' | 'breeding_records' | 'visual' | 'pedigree';
}

interface ProductionRecord {
  id: string;
  type: 'milk' | 'eggs' | 'wool' | 'meat' | 'fiber' | 'other';
  date: string;
  quantity: number;
  unit: string;
  quality: ProductionQuality;
  price?: number;
  buyer?: string;
  notes: string;
}

interface ProductionQuality {
  grade: 'A' | 'B' | 'C' | 'premium' | 'standard';
  measurements: { [key: string]: number };
  defects: string[];
  testResults: QualityTest[];
}

interface QualityTest {
  test: string;
  result: number;
  unit: string;
  passedStandard: boolean;
  standardValue: number;
  testDate: string;
  laboratory?: string;
}

interface PerformanceMetrics {
  productionEfficiency: number;
  healthScore: number;
  reproductiveEfficiency: number;
  growthRate: number;
  feedConversionRatio: number;
  economicValue: number;
  lastCalculated: string;
  trends: {
    production: Array<{ date: string; value: number }>;
    health: Array<{ date: string; value: number }>;
    weight: Array<{ date: string; value: number }>;
  };
}

interface FeedRecord {
  id: string;
  date: string;
  feedType: string;
  quantity: number;
  unit: 'kg' | 'lbs' | 'tons';
  nutritionalContent: NutritionalContent;
  cost: number;
  supplier: string;
  fedBy: string;
  notes: string;
}

interface NutritionalContent {
  protein: number;
  fat: number;
  fiber: number;
  moisture: number;
  ash: number;
  energy: number;
  vitamins: { [key: string]: number };
  minerals: { [key: string]: number };
}

interface AnimalPhoto {
  id: string;
  url: string;
  thumbnail: string;
  caption: string;
  type: AnimalPhotoType;
  category: 'identification' | 'health' | 'breeding' | 'production' | 'growth' | 'general';
  takenAt: string;
  takenBy: string;
  location?: string;
  equipment: string;
  settings: PhotoSettings;
  aiAnalysis?: PhotoAIAnalysis;
  annotations: PhotoAnnotation[];
  quality: PhotoQuality;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  tags: string[];
  series?: string;
  sequenceNumber?: number;
  visibility: 'public' | 'private' | 'restricted';
  accessLevel: 'farm_only' | 'veterinarian' | 'breeding_records' | 'insurance';
}

type AnimalPhotoType = 
  | 'profile' 
  | 'identification' 
  | 'health_condition' 
  | 'injury' 
  | 'treatment' 
  | 'breeding' 
  | 'pregnancy' 
  | 'birth' 
  | 'growth_progress' 
  | 'production' 
  | 'before_after' 
  | 'x_ray' 
  | 'ultrasound' 
  | 'general';

interface PhotoSettings {
  camera: string;
  lens?: string;
  iso?: number;
  aperture?: string;
  shutterSpeed?: string;
  flash: boolean;
  gps?: { lat: number; lng: number };
  weather?: string;
  lighting: 'natural' | 'artificial' | 'mixed';
}

interface PhotoAIAnalysis {
  confidence: number;
  detectedFeatures: DetectedFeature[];
  healthIndicators: HealthIndicator[];
  bodyConditionScore?: number;
  weightEstimate?: number;
  behaviorAnalysis?: BehaviorAnalysis;
  comparisonWithPrevious?: PhotoComparison;
}

interface DetectedFeature {
  feature: string;
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
  description: string;
}

interface HealthIndicator {
  indicator: string;
  status: 'normal' | 'concerning' | 'abnormal';
  confidence: number;
  description: string;
  recommendation?: string;
}

interface BehaviorAnalysis {
  posture: string;
  activity: string;
  alertness: 'alert' | 'normal' | 'lethargic';
  socialBehavior?: string;
  abnormalBehaviors: string[];
}

interface PhotoComparison {
  previousPhotoId: string;
  changes: PhotoChange[];
  improvementScore: number;
  recommendations: string[];
}

interface PhotoChange {
  aspect: string;
  changeType: 'improved' | 'worsened' | 'unchanged';
  magnitude: number;
  description: string;
}

interface PhotoAnnotation {
  id: string;
  type: 'point' | 'rectangle' | 'polygon' | 'text';
  coordinates: number[];
  label: string;
  description: string;
  createdBy: string;
  createdAt: string;
  category: 'identification' | 'health' | 'abnormality' | 'measurement' | 'note';
}

interface PhotoQuality {
  resolution: { width: number; height: number };
  fileSize: number;
  format: string;
  sharpness: number;
  lighting: number;
  composition: number;
  overallScore: number;
  usableForAI: boolean;
}

interface PhotoAnalytics {
  totalPhotos: number;
  photosByType: { [key in AnimalPhotoType]: number };
  photosByMonth: Array<{ month: string; count: number }>;
  storageUsed: number;
  aiAnalysisSuccess: number;
  averageQuality: number;
  lastPhotoDate: string;
  mostFrequentType: AnimalPhotoType;
  photoSeries: PhotoSeries[];
}

interface PhotoSeries {
  id: string;
  name: string;
  type: 'growth_tracking' | 'health_monitoring' | 'treatment_progress' | 'breeding_cycle';
  startDate: string;
  endDate?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'as_needed';
  photoCount: number;
  lastPhoto: string;
  nextScheduled?: string;
  purpose: string;
}

interface AnimalDocument {
  id: string;
  type: 'registration' | 'health_certificate' | 'breeding_certificate' | 'insurance' | 'purchase_receipt' | 'other';
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  expiryDate?: string;
  issuer?: string;
  documentNumber?: string;
  verified: boolean;
  tags: string[];
}

interface AnimalFinancialData {
  acquisitionCost: number;
  currentValue: number;
  insuranceValue: number;
  totalMedicalCosts: number;
  totalFeedCosts: number;
  totalProduction: number;
  netValue: number;
  roi: number;
  costBreakdown: CostBreakdown;
  revenueBreakdown: RevenueBreakdown;
  projectedValue: number;
  depreciationRate: number;
}

interface CostBreakdown {
  feed: number;
  medical: number;
  housing: number;
  breeding: number;
  labor: number;
  insurance: number;
  equipment: number;
  other: number;
}

interface RevenueBreakdown {
  production: number;
  breeding: number;
  sale: number;
  insurance: number;
  other: number;
}

interface AnimalCaretaker {
  id: string;
  workerId: string;
  workerName: string;
  role: 'primary_caretaker' | 'veterinarian' | 'feeder' | 'milker' | 'trainer' | 'specialist';
  assignedDate: string;
  responsibilities: string[];
  isActive: boolean;
  performance: CaretakerPerformance;
}

interface CaretakerPerformance {
  animalHealthScore: number;
  taskCompletionRate: number;
  observationAccuracy: number;
  emergencyResponseTime: number;
  lastEvaluation: string;
  notes: string;
}

interface CareTask {
  id: string;
  title: string;
  description: string;
  type: 'feeding' | 'medical' | 'grooming' | 'exercise' | 'observation' | 'breeding' | 'milking' | 'cleaning';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  assignedTo: string[];
  scheduledTime: string;
  estimatedDuration: number;
  actualDuration?: number;
  completedAt?: string;
  completedBy?: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'as_needed';
  nextDue?: string;
  requirements: TaskRequirement[];
  notes: string;
  photos: string[];
  verified: boolean;
}

interface TaskRequirement {
  type: 'equipment' | 'medication' | 'feed' | 'skill' | 'certification';
  item: string;
  quantity?: number;
  notes?: string;
}

interface AnimalInsights {
  healthTrends: HealthTrend[];
  productionTrends: ProductionTrend[];
  behaviorPatterns: BehaviorPattern[];
  costEfficiency: EfficiencyMetric[];
  riskFactors: RiskFactor[];
  recommendations: Recommendation[];
  benchmarkComparison: BenchmarkData;
  alertsAndWarnings: Alert[];
}

interface HealthTrend {
  metric: string;
  trend: 'improving' | 'stable' | 'declining';
  changePercent: number;
  period: string;
  significance: 'high' | 'medium' | 'low';
  description: string;
}

interface ProductionTrend {
  productType: string;
  averageDaily: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  changePercent: number;
  seasonalPattern: boolean;
  peakPeriods: string[];
  projectedAnnual: number;
}

interface BehaviorPattern {
  behavior: string;
  frequency: number;
  timeOfDay: string;
  triggers: string[];
  normalRange: boolean;
  significance: string;
  recommendations: string[];
}

interface EfficiencyMetric {
  metric: string;
  value: number;
  unit: string;
  benchmarkValue: number;
  performance: 'above_average' | 'average' | 'below_average';
  improvementPotential: number;
}

interface RiskFactor {
  factor: string;
  probability: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: 'health' | 'financial' | 'production' | 'breeding' | 'environmental';
  mitigation: string;
  monitoringRequired: boolean;
}

interface Recommendation {
  id: string;
  type: 'health' | 'nutrition' | 'breeding' | 'production' | 'financial' | 'management';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  reasoning: string;
  expectedBenefit: string;
  implementation: string;
  cost?: number;
  timeline: string;
  status: 'new' | 'reviewed' | 'approved' | 'implemented' | 'dismissed';
  createdAt: string;
  createdBy: 'ai' | 'veterinarian' | 'farm_manager' | 'specialist';
}

interface BenchmarkData {
  species: string;
  breed: string;
  region: string;
  farmSize: string;
  metrics: { [key: string]: BenchmarkMetric };
  lastUpdated: string;
  source: string;
}

interface BenchmarkMetric {
  animalValue: number;
  benchmarkValue: number;
  percentile: number;
  status: 'excellent' | 'above_average' | 'average' | 'below_average' | 'poor';
  unit: string;
}

interface Alert {
  id: string;
  type: 'health' | 'breeding' | 'production' | 'financial' | 'maintenance' | 'regulatory';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  actionRequired: boolean;
  deadline?: string;
  assignedTo?: string;
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

interface PredictiveData {
  healthPredictions: HealthPrediction[];
  productionForecasts: ProductionForecast[];
  breedingPredictions: BreedingPrediction[];
  financialProjections: FinancialProjection[];
  riskAssessments: RiskAssessment[];
  optimalActions: OptimalAction[];
}

interface HealthPrediction {
  condition: string;
  probability: number;
  timeframe: string;
  confidenceLevel: number;
  riskFactors: string[];
  prevention: string[];
  earlyWarnings: string[];
}

interface ProductionForecast {
  productType: string;
  forecastPeriod: string;
  predictedQuantity: number;
  confidenceInterval: { lower: number; upper: number };
  factors: ForecastFactor[];
  recommendations: string[];
}

interface ForecastFactor {
  factor: string;
  impact: number;
  confidence: number;
  description: string;
}

interface BreedingPrediction {
  breedingSuccess: number;
  optimalBreedingTime: string;
  expectedOffspring: number;
  geneticOutcomes: GeneticOutcome[];
  recommendations: string[];
}

interface GeneticOutcome {
  trait: string;
  probability: number;
  desirability: 'high' | 'medium' | 'low';
  impact: string;
}

interface FinancialProjection {
  metric: string;
  currentValue: number;
  projectedValue: number;
  timeframe: string;
  confidence: number;
  factors: string[];
  scenarios: ProjectionScenario[];
}

interface ProjectionScenario {
  name: string;
  probability: number;
  value: number;
  description: string;
}

interface RiskAssessment {
  riskType: string;
  currentRisk: number;
  futureRisk: number;
  mitigationStrategies: string[];
  monitoringRequired: string[];
  costOfInaction: number;
}

interface OptimalAction {
  action: string;
  timing: string;
  expectedBenefit: number;
  cost: number;
  roi: number;
  urgency: number;
  dependencies: string[];
}

type AnimalStatus = 
  | 'active' 
  | 'pregnant' 
  | 'lactating' 
  | 'sick' 
  | 'quarantined' 
  | 'breeding' 
  | 'retired' 
  | 'sold' 
  | 'deceased';

interface LifecycleEvent {
  id: string;
  type: 'birth' | 'weaning' | 'breeding_age' | 'first_breeding' | 'production_start' | 'retirement' | 'death' | 'sale';
  date: string;
  description: string;
  significance: 'milestone' | 'routine' | 'concern';
  recordedBy: string;
  relatedAnimals?: string[];
  documents?: string[];
  photos?: string[];
  cost?: number;
  revenue?: number;
  notes: string;
}

interface AnimalAnalytics {
  totalAnimals: number;
  animalsBySpecies: { [key: string]: number };
  animalsByStatus: { [key: string]: number };
  animalsByAge: { [key: string]: number };
  healthOverview: {
    healthy: number;
    sick: number;
    quarantined: number;
    averageHealthScore: number;
  };
  productionSummary: {
    totalProduction: number;
    averageProduction: number;
    topProducers: Array<{
      animalId: string;
      name: string;
      production: number;
    }>;
  };
  financialSummary: {
    totalValue: number;
    totalCosts: number;
    totalRevenue: number;
    netProfit: number;
    roi: number;
  };
  photoSummary: {
    totalPhotos: number;
    averagePhotosPerAnimal: number;
    aiAnalysisSuccessRate: number;
    storageUsed: number;
  };
  trends: {
    healthTrends: Array<{ date: string; score: number }>;
    productionTrends: Array<{ date: string; quantity: number }>;
    costTrends: Array<{ date: string; cost: number }>;
    populationTrends: Array<{ date: string; count: number }>;
  };
  benchmarks: {
    industryAverage: number;
    topPercentile: number;
    farmPerformance: number;
    improvementAreas: string[];
  };
}

// Mock data storage
let animals: EnhancedAnimal[] = [
  {
    id: '1',
    farmId: 'farm_1',
    name: 'Bessie',
    tagNumber: 'C001',
    rfidTag: 'RFID001',
    species: {
      type: 'cattle',
      category: 'livestock',
      expectedLifespan: 20,
      maturityAge: 2,
      breedingAge: 15
    },
    breed: 'Holstein',
    gender: 'female',
    birthDate: '2022-03-15T00:00:00Z',
    acquisitionDate: '2022-03-15T00:00:00Z',
    acquisitionSource: 'born_on_farm',
    physicalTraits: {
      weight: [
        {
          id: 'w1',
          weight: 650,
          unit: 'kg',
          date: '2024-11-01T00:00:00Z',
          method: 'scale',
          recordedBy: 'John Smith',
          bodyConditionScore: 7,
          notes: 'Good condition'
        }
      ],
      height: 150,
      color: 'Black and White',
      markings: ['White blaze', 'Black spots'],
      distinguishingFeatures: ['Star on forehead'],
      bodyConditionScore: 7,
      temperament: 'calm'
    },
    identificationMarks: [
      {
        type: 'ear_tag',
        location: 'Left ear',
        value: 'C001',
        date: '2022-03-15T00:00:00Z'
      }
    ],
    currentLocation: {
      fieldId: 'field_1',
      fieldName: 'North Pasture',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      lastMoved: '2024-10-01T00:00:00Z',
      movedBy: 'John Smith',
      reason: 'Seasonal rotation'
    },
    locationHistory: [],
    housing: {
      type: 'pasture',
      capacity: 50,
      currentOccupancy: 35,
      facilities: [
        {
          name: 'Water trough',
          type: 'waterer',
          condition: 'good',
          lastMaintenance: '2024-10-15T00:00:00Z',
          nextMaintenance: '2024-11-15T00:00:00Z'
        }
      ],
      conditions: {
        temperature: 18,
        humidity: 65,
        ventilation: 'excellent',
        cleanliness: 'good',
        waterAccess: true,
        feedAccess: true,
        shelter: true
      },
      lastInspection: '2024-11-01T00:00:00Z',
      inspectionScore: 8.5
    },
    healthStatus: {
      overall: 'excellent',
      lastExamination: '2024-10-15T00:00:00Z',
      nextExamination: '2025-01-15T00:00:00Z',
      examiningVet: 'Dr. Wilson',
      currentConditions: [],
      activeTreatments: [],
      quarantineStatus: false
    },
    medicalHistory: [],
    vaccinations: [],
    treatments: [],
    breedingInfo: {
      breedingStatus: 'available',
      reproductiveHistory: [],
      breedingValue: 8.5,
      geneticMarkers: [],
      lastBreeding: '2024-08-15T00:00:00Z'
    },
    offspring: [],
    parentage: {
      verified: true,
      verificationMethod: 'breeding_records'
    },
    productionRecords: [],
    performanceMetrics: {
      productionEfficiency: 92,
      healthScore: 95,
      reproductiveEfficiency: 85,
      growthRate: 88,
      feedConversionRatio: 1.4,
      economicValue: 89,
      lastCalculated: '2024-11-03T00:00:00Z',
      trends: {
        production: [
          { date: '2024-10', value: 750 },
          { date: '2024-11', value: 775 }
        ],
        health: [
          { date: '2024-10', value: 94 },
          { date: '2024-11', value: 95 }
        ],
        weight: [
          { date: '2024-10', value: 645 },
          { date: '2024-11', value: 650 }
        ]
      }
    },
    feedConsumption: [],
    photos: [],
    photoAnalytics: {
      totalPhotos: 15,
      photosByType: {
        profile: 5,
        identification: 3,
        health_condition: 2,
        injury: 0,
        treatment: 1,
        breeding: 2,
        pregnancy: 0,
        birth: 0,
        growth_progress: 2,
        production: 0,
        before_after: 0,
        x_ray: 0,
        ultrasound: 0,
        general: 0
      },
      photosByMonth: [
        { month: '2024-09', count: 3 },
        { month: '2024-10', count: 7 },
        { month: '2024-11', count: 5 }
      ],
      storageUsed: 45.2,
      aiAnalysisSuccess: 93,
      averageQuality: 8.2,
      lastPhotoDate: '2024-11-01T10:30:00Z',
      mostFrequentType: 'profile',
      photoSeries: []
    },
    documents: [],
    financialData: {
      acquisitionCost: 2500,
      currentValue: 3200,
      insuranceValue: 3500,
      totalMedicalCosts: 350,
      totalFeedCosts: 1200,
      totalProduction: 4500,
      netValue: 1450,
      roi: 58,
      costBreakdown: {
        feed: 1200,
        medical: 350,
        housing: 200,
        breeding: 100,
        labor: 300,
        insurance: 150,
        equipment: 75,
        other: 25
      },
      revenueBreakdown: {
        production: 4200,
        breeding: 300,
        sale: 0,
        insurance: 0,
        other: 0
      },
      projectedValue: 3500,
      depreciationRate: 5
    },
    assignedCaretakers: [],
    careSchedule: [],
    insights: {
      healthTrends: [],
      productionTrends: [],
      behaviorPatterns: [],
      costEfficiency: [],
      riskFactors: [],
      recommendations: [],
      benchmarkComparison: {
        species: 'cattle',
        breed: 'Holstein',
        region: 'Northeast US',
        farmSize: 'Medium',
        metrics: {},
        lastUpdated: '2024-11-01T00:00:00Z',
        source: 'USDA'
      },
      alertsAndWarnings: []
    },
    predictiveAnalytics: {
      healthPredictions: [],
      productionForecasts: [],
      breedingPredictions: [],
      financialProjections: [],
      riskAssessments: [],
      optimalActions: []
    },
    status: 'active',
    lifecycle: [],
    notes: 'High-producing Holstein with excellent health record',
    tags: ['high_producer', 'excellent_health', 'breeding_candidate'],
    createdAt: '2022-03-15T00:00:00Z',
    updatedAt: '2024-11-03T12:00:00Z',
    createdBy: 'farm_manager'
  }
];

// Utility functions
const updateAnimal = (animalId: string, updates: Partial<EnhancedAnimal>): EnhancedAnimal | null => {
  const animalIndex = animals.findIndex(a => a.id === animalId);
  if (animalIndex === -1) return null;
  
  const existingAnimal = animals[animalIndex];
  if (!existingAnimal) return null;
  
  animals[animalIndex] = {
    ...existingAnimal,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  return animals[animalIndex] || null;
};

const generateAnalytics = (): AnimalAnalytics => {
  const totalAnimals = animals.length;
  const animalsBySpecies = animals.reduce((acc, animal) => {
    acc[animal.species.type] = (acc[animal.species.type] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  const animalsByStatus = animals.reduce((acc, animal) => {
    acc[animal.status] = (acc[animal.status] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const totalValue = animals.reduce((sum, animal) => sum + animal.financialData.currentValue, 0);
  const totalCosts = animals.reduce((sum, animal) => sum + animal.financialData.totalMedicalCosts + animal.financialData.totalFeedCosts, 0);
  const totalRevenue = animals.reduce((sum, animal) => sum + animal.financialData.totalProduction, 0);
  
  return {
    totalAnimals,
    animalsBySpecies,
    animalsByStatus,
    animalsByAge: {
      '0-1 years': 8,
      '1-3 years': 15,
      '3-5 years': 12,
      '5+ years': 10
    },
    healthOverview: {
      healthy: animals.filter(a => a.healthStatus.overall === 'excellent' || a.healthStatus.overall === 'good').length,
      sick: animals.filter(a => a.healthStatus.overall === 'poor').length,
      quarantined: animals.filter(a => a.healthStatus.quarantineStatus).length,
      averageHealthScore: animals.reduce((sum, a) => sum + a.performanceMetrics.healthScore, 0) / totalAnimals
    },
    productionSummary: {
      totalProduction: totalRevenue,
      averageProduction: totalRevenue / totalAnimals,
      topProducers: animals
        .map(a => ({
          animalId: a.id,
          name: a.name,
          production: a.financialData.totalProduction
        }))
        .sort((a, b) => b.production - a.production)
        .slice(0, 3)
    },
    financialSummary: {
      totalValue,
      totalCosts,
      totalRevenue,
      netProfit: totalRevenue - totalCosts,
      roi: totalRevenue > 0 ? ((totalRevenue - totalCosts) / totalCosts) * 100 : 0
    },
    photoSummary: {
      totalPhotos: animals.reduce((sum, a) => sum + a.photoAnalytics.totalPhotos, 0),
      averagePhotosPerAnimal: animals.reduce((sum, a) => sum + a.photoAnalytics.totalPhotos, 0) / totalAnimals,
      aiAnalysisSuccessRate: 89,
      storageUsed: animals.reduce((sum, a) => sum + a.photoAnalytics.storageUsed, 0)
    },
    trends: {
      healthTrends: [
        { date: '2024-08', score: 89 },
        { date: '2024-09', score: 91 },
        { date: '2024-10', score: 92 },
        { date: '2024-11', score: 93 }
      ],
      productionTrends: [
        { date: '2024-08', quantity: 1180 },
        { date: '2024-09', quantity: 1220 },
        { date: '2024-10', quantity: 1250 },
        { date: '2024-11', quantity: 1275 }
      ],
      costTrends: [
        { date: '2024-08', cost: 11200 },
        { date: '2024-09', cost: 11500 },
        { date: '2024-10', cost: 11800 },
        { date: '2024-11', cost: 12000 }
      ],
      populationTrends: [
        { date: '2024-08', count: 42 },
        { date: '2024-09', count: 44 },
        { date: '2024-10', count: 45 },
        { date: '2024-11', count: 45 }
      ]
    },
    benchmarks: {
      industryAverage: 85,
      topPercentile: 95,
      farmPerformance: 92,
      improvementAreas: ['Feed efficiency', 'Reproductive performance']
    }
  };
};

export class AnimalController {
  // Animal Management
  static async getAllAnimals(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const farmId = req.user?.farmId || 'farm_1';
      const farmAnimals = animals.filter(animal => animal.farmId === farmId);
      
      res.json({
        success: true,
        data: farmAnimals,
        total: farmAnimals.length,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve animals',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getAnimalById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { animalId } = req.params;
      const animal = animals.find(a => a.id === animalId);
      
      if (!animal) {
        res.status(404).json({
          success: false,
          message: 'Animal not found',
        });
        return;
      }

      res.json({
        success: true,
        data: animal,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve animal',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async createAnimal(req: AuthenticatedRequest, res: Response): Promise<void> {
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
      const newAnimal: EnhancedAnimal = {
        id: Date.now().toString(),
        farmId,
        ...req.body,
        photos: [],
        medicalHistory: [],
        vaccinations: [],
        treatments: [],
        offspring: [],
        productionRecords: [],
        feedConsumption: [],
        documents: [],
        assignedCaretakers: [],
        careSchedule: [],
        locationHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: req.user?.userId || 'user_1',
      };

      animals.push(newAnimal);

      res.status(201).json({
        success: true,
        message: 'Animal created successfully',
        data: newAnimal,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create animal',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async updateAnimal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { animalId } = req.params;
      if (!animalId) {
        res.status(400).json({
          success: false,
          message: 'Animal ID is required',
        });
        return;
      }

      const updates = req.body;
      const updatedAnimal = updateAnimal(animalId, updates);
      
      if (!updatedAnimal) {
        res.status(404).json({
          success: false,
          message: 'Animal not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Animal updated successfully',
        data: updatedAnimal,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update animal',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async deleteAnimal(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { animalId } = req.params;
      if (!animalId) {
        res.status(400).json({
          success: false,
          message: 'Animal ID is required',
        });
        return;
      }

      const animalIndex = animals.findIndex(a => a.id === animalId);
      
      if (animalIndex === -1) {
        res.status(404).json({
          success: false,
          message: 'Animal not found',
        });
        return;
      }

      animals.splice(animalIndex, 1);

      res.json({
        success: true,
        message: 'Animal deleted successfully',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete animal',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Photo Management
  static async uploadAnimalPhoto(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { animalId } = req.params;
      if (!animalId) {
        res.status(400).json({
          success: false,
          message: 'Animal ID is required',
        });
        return;
      }

      const animal = animals.find(a => a.id === animalId);
      if (!animal) {
        res.status(404).json({
          success: false,
          message: 'Animal not found',
        });
        return;
      }

      // Mock photo upload
      const photoRecord: AnimalPhoto = {
        id: Date.now().toString(),
        url: `https://example.com/photos/${animalId}/${Date.now()}.jpg`,
        thumbnail: `https://example.com/photos/${animalId}/${Date.now()}_thumb.jpg`,
        caption: req.body.caption || 'Animal photo',
        type: req.body.type || 'general',
        category: req.body.category || 'general',
        takenAt: new Date().toISOString(),
        takenBy: req.user?.userId || 'user_1',
        equipment: 'Digital Camera',
        settings: {
          camera: 'Digital Camera',
          flash: false,
          lighting: 'natural'
        },
        aiAnalysis: {
          confidence: 85,
          detectedFeatures: [
            {
              feature: 'Body condition',
              confidence: 90,
              description: 'Good body condition detected'
            }
          ],
          healthIndicators: [
            {
              indicator: 'Overall health',
              status: 'normal',
              confidence: 88,
              description: 'Animal appears healthy'
            }
          ]
        },
        annotations: [],
        quality: {
          resolution: { width: 1920, height: 1080 },
          fileSize: 2.5,
          format: 'jpeg',
          sharpness: 8,
          lighting: 9,
          composition: 7,
          overallScore: 8,
          usableForAI: true
        },
        verified: false,
        tags: [],
        visibility: 'private',
        accessLevel: 'farm_only'
      };

      animal.photos.push(photoRecord);
      animal.updatedAt = new Date().toISOString();

      res.json({
        success: true,
        message: 'Photo uploaded successfully',
        data: { 
          photoId: photoRecord.id,
          url: photoRecord.url,
          thumbnail: photoRecord.thumbnail,
          aiAnalysis: photoRecord.aiAnalysis
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to upload photo',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  // Analytics
  static async getAnimalAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
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

  static async getAnimalInsights(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { animalId } = req.params;
      if (!animalId) {
        res.status(400).json({
          success: false,
          message: 'Animal ID is required',
        });
        return;
      }

      const animal = animals.find(a => a.id === animalId);
      
      if (!animal) {
        res.status(404).json({
          success: false,
          message: 'Animal not found',
        });
        return;
      }

      res.json({
        success: true,
        data: animal.insights,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve insights',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  static async getPredictiveAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { animalId } = req.params;
      if (!animalId) {
        res.status(400).json({
          success: false,
          message: 'Animal ID is required',
        });
        return;
      }

      const animal = animals.find(a => a.id === animalId);
      
      if (!animal) {
        res.status(404).json({
          success: false,
          message: 'Animal not found',
        });
        return;
      }

      res.json({
        success: true,
        data: animal.predictiveAnalytics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve predictions',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

// Validation rules
export const animalValidation = {
  createAnimal: [
    body('name').notEmpty().withMessage('Animal name is required'),
    body('tagNumber').notEmpty().withMessage('Tag number is required'),
    body('species.type').isIn(['cattle', 'sheep', 'goats', 'pigs', 'chickens', 'horses', 'other']).withMessage('Invalid species type'),
    body('breed').notEmpty().withMessage('Breed is required'),
    body('gender').isIn(['male', 'female']).withMessage('Invalid gender'),
    body('birthDate').isISO8601().withMessage('Invalid birth date'),
    body('acquisitionDate').isISO8601().withMessage('Invalid acquisition date'),
  ],
  
  updateAnimal: [
    param('animalId').notEmpty().withMessage('Animal ID is required'),
  ],
  
  uploadPhoto: [
    param('animalId').notEmpty().withMessage('Animal ID is required'),
    body('caption').optional().isString().withMessage('Caption must be a string'),
    body('type').optional().isIn(['profile', 'identification', 'health_condition', 'injury', 'treatment', 'breeding', 'pregnancy', 'birth', 'growth_progress', 'production', 'before_after', 'x_ray', 'ultrasound', 'general']).withMessage('Invalid photo type'),
  ],
};