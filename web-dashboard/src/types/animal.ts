// Enhanced Animal Management Types with Photo Management and Analytics

export interface EnhancedAnimal {
  id: string;
  farmId: string;
  
  // Basic Information
  name: string;
  tagNumber: string;
  rfidTag?: string;
  species: AnimalSpecies;
  breed: string;
  gender: 'male' | 'female';
  birthDate: string;
  acquisitionDate: string;
  acquisitionSource: 'born_on_farm' | 'purchased' | 'donated' | 'inherited';
  
  // Physical Characteristics
  physicalTraits: PhysicalTraits;
  identificationMarks: IdentificationMark[];
  
  // Location and Housing
  currentLocation: AnimalLocation;
  locationHistory: LocationHistory[];
  housing: HousingInfo;
  
  // Health and Medical
  healthStatus: AnimalHealthStatus;
  medicalHistory: MedicalRecord[];
  vaccinations: VaccinationRecord[];
  treatments: TreatmentRecord[];
  
  // Breeding and Reproduction
  breedingInfo: BreedingInfo;
  offspring: OffspringRecord[];
  parentage: ParentageInfo;
  
  // Performance and Production
  productionRecords: ProductionRecord[];
  performanceMetrics: PerformanceMetrics;
  feedConsumption: FeedRecord[];
  
  // Photo Management and Documentation
  photos: AnimalPhoto[];
  photoAnalytics: PhotoAnalytics;
  documents: AnimalDocument[];
  
  // Financial Information
  financialData: AnimalFinancialData;
  
  // Worker Assignment and Care
  assignedCaretakers: AnimalCaretaker[];
  careSchedule: CareTask[];
  
  // Analytics and Insights
  insights: AnimalInsights;
  predictiveAnalytics: PredictiveData;
  
  // Lifecycle Management
  status: AnimalStatus;
  lifecycle: LifecycleEvent[];
  
  // Metadata
  notes: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface AnimalSpecies {
  type: 'cattle' | 'sheep' | 'goats' | 'pigs' | 'chickens' | 'horses' | 'other';
  category: 'livestock' | 'poultry' | 'equine' | 'companion';
  expectedLifespan: number;
  maturityAge: number;
  breedingAge: number;
}

export interface PhysicalTraits {
  weight: WeightRecord[];
  height?: number;
  length?: number;
  color: string;
  markings: string[];
  distinguishingFeatures: string[];
  bodyConditionScore: number; // 1-9 scale
  temperament: 'calm' | 'nervous' | 'aggressive' | 'friendly' | 'timid';
}

export interface WeightRecord {
  id: string;
  weight: number;
  unit: 'kg' | 'lbs';
  date: string;
  method: 'scale' | 'tape_measure' | 'visual_estimate';
  recordedBy: string;
  bodyConditionScore?: number;
  notes: string;
}

export interface IdentificationMark {
  type: 'ear_tag' | 'tattoo' | 'brand' | 'microchip' | 'natural_marking';
  location: string;
  value: string;
  date: string;
  photo?: string;
}

export interface AnimalLocation {
  fieldId: string;
  fieldName: string;
  coordinates?: { lat: number; lng: number };
  paddockNumber?: string;
  barnSection?: string;
  lastMoved: string;
  movedBy: string;
  reason: string;
}

export interface LocationHistory {
  id: string;
  fromLocation: string;
  toLocation: string;
  movedDate: string;
  movedBy: string;
  reason: string;
  duration: number; // days
  notes: string;
}

export interface HousingInfo {
  type: 'pasture' | 'barn' | 'stable' | 'pen' | 'coop' | 'field';
  capacity: number;
  currentOccupancy: number;
  facilities: HousingFacility[];
  conditions: HousingConditions;
  lastInspection: string;
  inspectionScore: number;
}

export interface HousingFacility {
  name: string;
  type: 'feeder' | 'waterer' | 'shelter' | 'fencing' | 'bedding';
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'needs_repair';
  lastMaintenance: string;
  nextMaintenance: string;
}

export interface HousingConditions {
  temperature?: number;
  humidity?: number;
  ventilation: 'excellent' | 'good' | 'fair' | 'poor';
  cleanliness: 'excellent' | 'good' | 'fair' | 'poor';
  waterAccess: boolean;
  feedAccess: boolean;
  shelter: boolean;
}

export interface AnimalHealthStatus {
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

export interface HealthCondition {
  name: string;
  type: 'acute' | 'chronic' | 'genetic' | 'infectious';
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  diagnosedDate: string;
  symptoms: string[];
  treatment: string;
  prognosis: string;
  status: 'active' | 'resolved' | 'managed' | 'monitoring';
}

export interface MedicalRecord {
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

export interface Medication {
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

export interface VaccinationRecord {
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

export interface TreatmentRecord {
  id: string;
  date: string;
  type: 'preventive' | 'therapeutic' | 'emergency';
  condition: string;
  treatment: string;
  medications: Medication[];
  administeredBy: string;
  effectiveness: number; // 1-10 scale
  sideEffects: string[];
  cost: number;
  duration: number;
  followUpRequired: boolean;
  notes: string;
}

export interface BreedingInfo {
  breedingStatus: 'not_breeding' | 'available' | 'pregnant' | 'lactating' | 'retired';
  reproductiveHistory: ReproductiveEvent[];
  breedingValue: number;
  geneticMarkers: GeneticMarker[];
  lastBreeding?: string;
  expectedDelivery?: string;
  gestationPeriod?: number;
}

export interface ReproductiveEvent {
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

export interface GeneticMarker {
  trait: string;
  value: string;
  inheritance: 'dominant' | 'recessive' | 'codominant';
  expression: 'expressed' | 'carrier' | 'clear';
  tested: boolean;
  testDate?: string;
}

export interface OffspringRecord {
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

export interface ParentageInfo {
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

export interface ProductionRecord {
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

export interface ProductionQuality {
  grade: 'A' | 'B' | 'C' | 'premium' | 'standard';
  measurements: { [key: string]: number };
  defects: string[];
  testResults: QualityTest[];
}

export interface QualityTest {
  test: string;
  result: number;
  unit: string;
  passedStandard: boolean;
  standardValue: number;
  testDate: string;
  laboratory?: string;
}

export interface PerformanceMetrics {
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

export interface FeedRecord {
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

export interface NutritionalContent {
  protein: number;
  fat: number;
  fiber: number;
  moisture: number;
  ash: number;
  energy: number; // MJ/kg or kcal/kg
  vitamins: { [key: string]: number };
  minerals: { [key: string]: number };
}

export interface AnimalPhoto {
  id: string;
  url: string;
  thumbnail: string;
  caption: string;
  type: AnimalPhotoType;
  category: 'identification' | 'health' | 'breeding' | 'production' | 'growth' | 'general';
  
  // Photo metadata
  takenAt: string;
  takenBy: string;
  location?: string;
  equipment: string;
  settings: PhotoSettings;
  
  // AI Analysis
  aiAnalysis?: PhotoAIAnalysis;
  
  // Annotations
  annotations: PhotoAnnotation[];
  
  // Quality and validation
  quality: PhotoQuality;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  
  // Organization
  tags: string[];
  series?: string; // For grouping related photos
  sequenceNumber?: number;
  
  // Privacy and access
  visibility: 'public' | 'private' | 'restricted';
  accessLevel: 'farm_only' | 'veterinarian' | 'breeding_records' | 'insurance';
}

export type AnimalPhotoType = 
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

export interface PhotoSettings {
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

export interface PhotoAIAnalysis {
  confidence: number;
  detectedFeatures: DetectedFeature[];
  healthIndicators: HealthIndicator[];
  bodyConditionScore?: number;
  weightEstimate?: number;
  behaviorAnalysis?: BehaviorAnalysis;
  comparisonWithPrevious?: PhotoComparison;
}

export interface DetectedFeature {
  feature: string;
  confidence: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
  description: string;
}

export interface HealthIndicator {
  indicator: string;
  status: 'normal' | 'concerning' | 'abnormal';
  confidence: number;
  description: string;
  recommendation?: string;
}

export interface BehaviorAnalysis {
  posture: string;
  activity: string;
  alertness: 'alert' | 'normal' | 'lethargic';
  socialBehavior?: string;
  abnormalBehaviors: string[];
}

export interface PhotoComparison {
  previousPhotoId: string;
  changes: PhotoChange[];
  improvementScore: number;
  recommendations: string[];
}

export interface PhotoChange {
  aspect: string;
  changeType: 'improved' | 'worsened' | 'unchanged';
  magnitude: number;
  description: string;
}

export interface PhotoAnnotation {
  id: string;
  type: 'point' | 'rectangle' | 'polygon' | 'text';
  coordinates: number[];
  label: string;
  description: string;
  createdBy: string;
  createdAt: string;
  category: 'identification' | 'health' | 'abnormality' | 'measurement' | 'note';
}

export interface PhotoQuality {
  resolution: { width: number; height: number };
  fileSize: number;
  format: string;
  sharpness: number; // 1-10 scale
  lighting: number; // 1-10 scale
  composition: number; // 1-10 scale
  overallScore: number; // 1-10 scale
  usableForAI: boolean;
}

export interface PhotoAnalytics {
  totalPhotos: number;
  photosByType: { [key in AnimalPhotoType]: number };
  photosByMonth: Array<{ month: string; count: number }>;
  storageUsed: number; // in MB
  aiAnalysisSuccess: number;
  averageQuality: number;
  lastPhotoDate: string;
  mostFrequentType: AnimalPhotoType;
  photoSeries: PhotoSeries[];
}

export interface PhotoSeries {
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

export interface AnimalDocument {
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

export interface AnimalFinancialData {
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

export interface CostBreakdown {
  feed: number;
  medical: number;
  housing: number;
  breeding: number;
  labor: number;
  insurance: number;
  equipment: number;
  other: number;
}

export interface RevenueBreakdown {
  production: number;
  breeding: number;
  sale: number;
  insurance: number;
  other: number;
}

export interface AnimalCaretaker {
  id: string;
  workerId: string;
  workerName: string;
  role: 'primary_caretaker' | 'veterinarian' | 'feeder' | 'milker' | 'trainer' | 'specialist';
  assignedDate: string;
  responsibilities: string[];
  isActive: boolean;
  performance: CaretakerPerformance;
}

export interface CaretakerPerformance {
  animalHealthScore: number;
  taskCompletionRate: number;
  observationAccuracy: number;
  emergencyResponseTime: number; // minutes
  lastEvaluation: string;
  notes: string;
}

export interface CareTask {
  id: string;
  title: string;
  description: string;
  type: 'feeding' | 'medical' | 'grooming' | 'exercise' | 'observation' | 'breeding' | 'milking' | 'cleaning';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  assignedTo: string[];
  scheduledTime: string;
  estimatedDuration: number; // minutes
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

export interface TaskRequirement {
  type: 'equipment' | 'medication' | 'feed' | 'skill' | 'certification';
  item: string;
  quantity?: number;
  notes?: string;
}

export interface AnimalInsights {
  healthTrends: HealthTrend[];
  productionTrends: ProductionTrend[];
  behaviorPatterns: BehaviorPattern[];
  costEfficiency: EfficiencyMetric[];
  riskFactors: RiskFactor[];
  recommendations: Recommendation[];
  benchmarkComparison: BenchmarkData;
  alertsAndWarnings: Alert[];
}

export interface HealthTrend {
  metric: string;
  trend: 'improving' | 'stable' | 'declining';
  changePercent: number;
  period: string;
  significance: 'high' | 'medium' | 'low';
  description: string;
}

export interface ProductionTrend {
  productType: string;
  averageDaily: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  changePercent: number;
  seasonalPattern: boolean;
  peakPeriods: string[];
  projectedAnnual: number;
}

export interface BehaviorPattern {
  behavior: string;
  frequency: number;
  timeOfDay: string;
  triggers: string[];
  normalRange: boolean;
  significance: string;
  recommendations: string[];
}

export interface EfficiencyMetric {
  metric: string;
  value: number;
  unit: string;
  benchmarkValue: number;
  performance: 'above_average' | 'average' | 'below_average';
  improvementPotential: number;
}

export interface RiskFactor {
  factor: string;
  probability: number; // 0-100
  impact: 'low' | 'medium' | 'high' | 'critical';
  category: 'health' | 'financial' | 'production' | 'breeding' | 'environmental';
  mitigation: string;
  monitoringRequired: boolean;
}

export interface Recommendation {
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

export interface BenchmarkData {
  species: string;
  breed: string;
  region: string;
  farmSize: string;
  metrics: { [key: string]: BenchmarkMetric };
  lastUpdated: string;
  source: string;
}

export interface BenchmarkMetric {
  animalValue: number;
  benchmarkValue: number;
  percentile: number;
  status: 'excellent' | 'above_average' | 'average' | 'below_average' | 'poor';
  unit: string;
}

export interface Alert {
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

export interface PredictiveData {
  healthPredictions: HealthPrediction[];
  productionForecasts: ProductionForecast[];
  breedingPredictions: BreedingPrediction[];
  financialProjections: FinancialProjection[];
  riskAssessments: RiskAssessment[];
  optimalActions: OptimalAction[];
}

export interface HealthPrediction {
  condition: string;
  probability: number;
  timeframe: string;
  confidenceLevel: number;
  riskFactors: string[];
  prevention: string[];
  earlyWarnings: string[];
}

export interface ProductionForecast {
  productType: string;
  forecastPeriod: string;
  predictedQuantity: number;
  confidenceInterval: { lower: number; upper: number };
  factors: ForecastFactor[];
  recommendations: string[];
}

export interface ForecastFactor {
  factor: string;
  impact: number; // -100 to 100
  confidence: number;
  description: string;
}

export interface BreedingPrediction {
  breedingSuccess: number;
  optimalBreedingTime: string;
  expectedOffspring: number;
  geneticOutcomes: GeneticOutcome[];
  recommendations: string[];
}

export interface GeneticOutcome {
  trait: string;
  probability: number;
  desirability: 'high' | 'medium' | 'low';
  impact: string;
}

export interface FinancialProjection {
  metric: string;
  currentValue: number;
  projectedValue: number;
  timeframe: string;
  confidence: number;
  factors: string[];
  scenarios: ProjectionScenario[];
}

export interface ProjectionScenario {
  name: string;
  probability: number;
  value: number;
  description: string;
}

export interface RiskAssessment {
  riskType: string;
  currentRisk: number;
  futureRisk: number;
  mitigationStrategies: string[];
  monitoringRequired: string[];
  costOfInaction: number;
}

export interface OptimalAction {
  action: string;
  timing: string;
  expectedBenefit: number;
  cost: number;
  roi: number;
  urgency: number;
  dependencies: string[];
}

export type AnimalStatus = 
  | 'active' 
  | 'pregnant' 
  | 'lactating' 
  | 'sick' 
  | 'quarantined' 
  | 'breeding' 
  | 'retired' 
  | 'sold' 
  | 'deceased';

export interface LifecycleEvent {
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

// Analytics and Reporting Interfaces
export interface AnimalAnalytics {
  totalAnimals: number;
  animalsBySpecies: { [key: string]: number };
  animalsByStatus: { [key: string]: number };
  animalsByAge: { [key: string]: number };
  
  // Health Analytics
  healthOverview: {
    healthy: number;
    sick: number;
    quarantined: number;
    averageHealthScore: number;
  };
  
  // Production Analytics
  productionSummary: {
    totalProduction: number;
    averageProduction: number;
    topProducers: Array<{
      animalId: string;
      name: string;
      production: number;
    }>;
  };
  
  // Financial Analytics
  financialSummary: {
    totalValue: number;
    totalCosts: number;
    totalRevenue: number;
    netProfit: number;
    roi: number;
  };
  
  // Photo Analytics
  photoSummary: {
    totalPhotos: number;
    averagePhotosPerAnimal: number;
    aiAnalysisSuccessRate: number;
    storageUsed: number;
  };
  
  // Trends and Projections
  trends: {
    healthTrends: Array<{ date: string; score: number }>;
    productionTrends: Array<{ date: string; quantity: number }>;
    costTrends: Array<{ date: string; cost: number }>;
    populationTrends: Array<{ date: string; count: number }>;
  };
  
  // Performance Benchmarks
  benchmarks: {
    industryAverage: number;
    topPercentile: number;
    farmPerformance: number;
    improvementAreas: string[];
  };
}

export interface AnimalFilter {
  species?: string[];
  breed?: string[];
  status?: AnimalStatus[];
  ageRange?: { min: number; max: number };
  gender?: ('male' | 'female')[];
  location?: string[];
  caretaker?: string[];
  healthStatus?: string[];
  dateRange?: { start: string; end: string };
  tags?: string[];
  hasPhotos?: boolean;
  productionType?: string[];
  searchQuery?: string;
}

export interface AnimalSortOption {
  field: 'name' | 'age' | 'weight' | 'health_score' | 'production' | 'last_photo' | 'created_at';
  direction: 'asc' | 'desc';
}

// Utility types for form handling and API responses
export interface CreateAnimalRequest extends Omit<EnhancedAnimal, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'> {}

export interface UpdateAnimalRequest extends Partial<CreateAnimalRequest> {}

export interface AnimalResponse {
  success: boolean;
  data?: EnhancedAnimal;
  message?: string;
  error?: string;
}

export interface AnimalListResponse {
  success: boolean;
  data?: EnhancedAnimal[];
  total?: number;
  page?: number;
  limit?: number;
  message?: string;
  error?: string;
}

export interface PhotoUploadResponse {
  success: boolean;
  data?: {
    photoId: string;
    url: string;
    thumbnail: string;
    aiAnalysis?: PhotoAIAnalysis;
  };
  message?: string;
  error?: string;
}