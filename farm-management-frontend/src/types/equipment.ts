// Equipment Management System Types
export interface Equipment {
  id: string;
  farmId: string;
  name: string;
  category: EquipmentCategory;
  type: EquipmentType;
  brand: string;
  model: string;
  serialNumber: string;
  year: number;
  
  // Financial Information
  purchaseInfo: PurchaseInfo;
  currentValue: number;
  depreciationInfo: DepreciationInfo;
  
  // Specifications
  specifications: EquipmentSpecifications;
  
  // Location and Assignment
  currentLocation: EquipmentLocation;
  assignedTo?: string; // Worker ID
  availability: EquipmentAvailability;
  
  // Maintenance
  maintenanceSchedule: MaintenanceSchedule;
  maintenanceHistory: MaintenanceRecord[];
  nextMaintenanceDue: string;
  
  // Usage Tracking
  usageRecords: UsageRecord[];
  totalHours: number;
  hoursThisMonth: number;
  usageAnalytics: UsageAnalytics;
  
  // Condition and Inspections
  condition: EquipmentCondition;
  inspectionHistory: InspectionRecord[];
  lastInspection: string;
  nextInspection: string;
  
  // Documentation
  documents: EquipmentDocument[];
  warranties: WarrantyInfo[];
  insurance: InsuranceInfo[];
  
  // Alerts and Notifications
  alerts: EquipmentAlert[];
  notifications: EquipmentNotification[];
  
  // Performance and Analytics
  performanceMetrics: EquipmentPerformanceMetrics;
  costAnalysis: EquipmentCostAnalysis;
  
  // Metadata
  status: EquipmentStatus;
  tags: string[];
  notes: string;
  photos: EquipmentPhoto[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type EquipmentCategory = 
  | 'tractors' 
  | 'harvesting' 
  | 'tillage' 
  | 'planting' 
  | 'irrigation' 
  | 'livestock' 
  | 'transport' 
  | 'tools' 
  | 'technology' 
  | 'building_systems';

export type EquipmentType = 
  | 'tractor' 
  | 'combine_harvester' 
  | 'plow' 
  | 'disc' 
  | 'planter' 
  | 'sprayer' 
  | 'spreader' 
  | 'mower' 
  | 'baler' 
  | 'cultivator' 
  | 'trailer' 
  | 'loader' 
  | 'milking_system' 
  | 'feeder' 
  | 'irrigation_pump' 
  | 'drone' 
  | 'generator' 
  | 'other';

export interface PurchaseInfo {
  purchaseDate: string;
  purchasePrice: number;
  vendor: string;
  purchaseMethod: 'cash' | 'finance' | 'lease' | 'rental';
  financingDetails?: FinancingDetails;
  invoiceNumber?: string;
  warrantyPeriod: number; // months
  purchaseNotes: string;
}

export interface FinancingDetails {
  lender: string;
  loanAmount: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  remainingBalance: number;
  nextPaymentDue: string;
}

export interface DepreciationInfo {
  method: 'straight_line' | 'declining_balance' | 'sum_of_years' | 'units_of_production';
  usefulLife: number; // years
  salvageValue: number;
  depreciationRate: number;
  accumulatedDepreciation: number;
  currentBookValue: number;
  annualDepreciation: number;
  depreciationSchedule: DepreciationEntry[];
}

export interface DepreciationEntry {
  year: number;
  beginningValue: number;
  depreciation: number;
  endingValue: number;
  accumulatedDepreciation: number;
}

export interface EquipmentSpecifications {
  dimensions: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
  engine?: EngineSpecs;
  capacity?: CapacitySpecs;
  powerRequirements?: PowerRequirements;
  operatingConditions: OperatingConditions;
  attachments: AttachmentInfo[];
  technicalSpecs: { [key: string]: string | number };
}

export interface EngineSpecs {
  type: string;
  horsepower: number;
  displacement: number;
  fuelType: 'diesel' | 'gasoline' | 'electric' | 'hybrid';
  emissions: string;
  coolingSystem: string;
}

export interface CapacitySpecs {
  workingWidth?: number;
  tankCapacity?: number;
  payloadCapacity?: number;
  liftCapacity?: number;
  throughput?: number;
  groundSpeed?: number;
}

export interface PowerRequirements {
  voltage?: number;
  amperage?: number;
  phase?: number;
  powerConsumption?: number;
  powerOutput?: number;
}

export interface OperatingConditions {
  temperatureRange: { min: number; max: number };
  humidityRange: { min: number; max: number };
  terrainTypes: string[];
  weatherLimitations: string[];
  safetyRequirements: string[];
}

export interface AttachmentInfo {
  id: string;
  name: string;
  type: string;
  compatibility: string[];
  currentlyAttached: boolean;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  maintenanceRequired: boolean;
}

export interface EquipmentLocation {
  fieldId?: string;
  fieldName?: string;
  buildingId?: string;
  buildingName?: string;
  coordinates?: { lat: number; lng: number };
  address?: string;
  lastMoved: string;
  movedBy: string;
  locationHistory: LocationHistory[];
}

export interface LocationHistory {
  id: string;
  fromLocation: string;
  toLocation: string;
  movedDate: string;
  movedBy: string;
  reason: string;
  mileage?: number;
  notes: string;
}

export interface EquipmentAvailability {
  status: 'available' | 'in_use' | 'maintenance' | 'repair' | 'reserved' | 'out_of_service';
  availableFrom?: string;
  availableUntil?: string;
  reservedBy?: string;
  reservationNotes?: string;
  downtimeReason?: string;
  estimatedRepairCompletion?: string;
}

export interface MaintenanceSchedule {
  intervals: MaintenanceInterval[];
  customSchedules: CustomMaintenanceSchedule[];
  seasonalMaintenance: SeasonalMaintenance[];
  upcomingTasks: UpcomingMaintenanceTask[];
}

export interface MaintenanceInterval {
  id: string;
  type: MaintenanceType;
  description: string;
  intervalHours?: number;
  intervalDays?: number;
  intervalMiles?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number; // minutes
  estimatedCost: number;
  requiredParts: MaintenancePart[];
  requiredSkills: string[];
  safetyPrecautions: string[];
  isActive: boolean;
}

export type MaintenanceType = 
  | 'oil_change' 
  | 'filter_replacement' 
  | 'lubrication' 
  | 'inspection' 
  | 'calibration' 
  | 'tire_rotation' 
  | 'belt_replacement' 
  | 'hydraulic_service' 
  | 'electrical_check' 
  | 'cleaning' 
  | 'winterization' 
  | 'storage_prep';

export interface MaintenancePart {
  partNumber: string;
  description: string;
  quantity: number;
  unitCost: number;
  supplier: string;
  inStock: boolean;
  leadTime: number; // days
}

export interface CustomMaintenanceSchedule {
  id: string;
  name: string;
  description: string;
  schedule: string; // cron-like expression
  tasks: MaintenanceTask[];
  isActive: boolean;
  createdBy: string;
}

export interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  type: MaintenanceType;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number;
  requiredParts: MaintenancePart[];
  instructions: string[];
  safetyNotes: string[];
  completionCriteria: string[];
}

export interface SeasonalMaintenance {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  tasks: MaintenanceTask[];
  startDate: string;
  endDate: string;
  isCompleted: boolean;
}

export interface UpcomingMaintenanceTask {
  id: string;
  equipmentId: string;
  taskId: string;
  type: MaintenanceType;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: number;
  estimatedCost: number;
  assignedTo?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
  notifications: TaskNotification[];
}

export interface TaskNotification {
  type: 'email' | 'sms' | 'app' | 'dashboard';
  recipient: string;
  sentAt: string;
  acknowledged: boolean;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: MaintenanceType;
  description: string;
  performedBy: MaintenancePerformedBy;
  hoursAtMaintenance: number;
  
  // Tasks and Procedures
  tasksCompleted: CompletedTask[];
  proceduresFollowed: string[];
  
  // Parts and Materials
  partsUsed: UsedPart[];
  fluidsAdded: FluidRecord[];
  
  // Labor and Cost
  laborHours: number;
  laborCost: number;
  partsCost: number;
  totalCost: number;
  
  // Quality and Verification
  qualityChecks: QualityCheck[];
  verified: boolean;
  verifiedBy?: string;
  verificationDate?: string;
  
  // Documentation
  photos: string[];
  documents: string[];
  notes: string;
  
  // Next Maintenance
  nextMaintenanceRecommended: string;
  recommendedActions: string[];
  
  // Performance Impact
  performanceImprovement: number; // percentage
  expectedLifeExtension: number; // hours
  
  // Warranty and Compliance
  warrantyWork: boolean;
  complianceChecks: ComplianceCheck[];
}

export interface MaintenancePerformedBy {
  type: 'internal' | 'external' | 'dealer' | 'manufacturer';
  technicianId?: string;
  technicianName: string;
  company?: string;
  certification: string[];
  contact: ContactInfo;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address?: string;
}

export interface CompletedTask {
  taskId: string;
  description: string;
  startTime: string;
  endTime: string;
  status: 'completed' | 'partial' | 'skipped';
  notes: string;
  followUpRequired: boolean;
}

export interface UsedPart {
  partNumber: string;
  description: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplier: string;
  warrantyPeriod?: number;
  lotNumber?: string;
  serialNumber?: string;
}

export interface FluidRecord {
  type: 'oil' | 'hydraulic' | 'coolant' | 'fuel' | 'grease' | 'other';
  brand: string;
  grade: string;
  quantity: number;
  unit: 'liters' | 'gallons' | 'quarts';
  cost: number;
  replaced: boolean;
  topped_off: boolean;
}

export interface QualityCheck {
  checkType: string;
  description: string;
  passed: boolean;
  measurements: { [key: string]: number };
  notes: string;
  inspector: string;
}

export interface ComplianceCheck {
  regulation: string;
  requirement: string;
  compliant: boolean;
  notes: string;
  inspector: string;
  certificationRequired: boolean;
}

export interface UsageRecord {
  id: string;
  date: string;
  operatorId: string;
  operatorName: string;
  startTime: string;
  endTime: string;
  
  // Usage Metrics
  hoursUsed: number;
  milesDriven?: number;
  acresCovered?: number;
  fuelConsumed: number;
  
  // Location and Activity
  startLocation: string;
  endLocation: string;
  activities: ActivityRecord[];
  fieldsWorked: string[];
  
  // Performance
  efficiency: EfficiencyMetrics;
  conditions: OperatingConditions;
  
  // Issues and Notes
  issues: IssueRecord[];
  maintenanceNeeded: boolean;
  notes: string;
  
  // Cost Tracking
  operatingCost: number;
  fuelCost: number;
  revenueGenerated?: number;
}

export interface ActivityRecord {
  type: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  quantityCompleted: number;
  unit: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  notes: string;
}

export interface EfficiencyMetrics {
  fuelEfficiency: number; // gallons per hour or miles per gallon
  workRate: number; // acres per hour
  downtime: number; // minutes
  productivityScore: number; // 1-100
  operatorPerformance: number; // 1-100
}

export interface IssueRecord {
  type: 'mechanical' | 'electrical' | 'hydraulic' | 'operator_error' | 'other';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  timeOccurred: string;
  resolved: boolean;
  resolutionTime?: string;
  resolutionDescription?: string;
  repairCost?: number;
  followUpRequired: boolean;
}

export interface UsageAnalytics {
  totalHours: number;
  averageHoursPerDay: number;
  averageHoursPerMonth: number;
  peakUsageMonths: string[];
  utilizationRate: number; // percentage of available time used
  
  // Efficiency Trends
  fuelEfficiencyTrend: TrendData[];
  productivityTrend: TrendData[];
  costPerHourTrend: TrendData[];
  
  // Predictive Analytics
  predictedLifeRemaining: number; // hours
  predictedMaintenanceDates: PredictedMaintenance[];
  costProjections: CostProjection[];
  
  // Benchmarking
  industryBenchmarks: BenchmarkData;
  farmBenchmarks: FarmBenchmarkData;
}

export interface TrendData {
  date: string;
  value: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface PredictedMaintenance {
  type: MaintenanceType;
  predictedDate: string;
  confidence: number; // percentage
  estimatedCost: number;
  criticality: 'low' | 'medium' | 'high' | 'critical';
}

export interface CostProjection {
  category: 'maintenance' | 'fuel' | 'repairs' | 'depreciation';
  period: 'month' | 'quarter' | 'year';
  projectedCost: number;
  confidence: number;
  factors: string[];
}

export interface BenchmarkData {
  category: string;
  metric: string;
  farmValue: number;
  industryAverage: number;
  topPercentile: number;
  performanceRating: 'excellent' | 'above_average' | 'average' | 'below_average' | 'poor';
}

export interface FarmBenchmarkData {
  bestPerformingEquipment: string;
  averageUtilization: number;
  totalMaintenanceCost: number;
  averageAge: number;
  replacementRecommendations: string[];
}

export interface EquipmentCondition {
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  components: ComponentCondition[];
  lastAssessment: string;
  nextAssessment: string;
  assessedBy: string;
  
  // Wear Analysis
  wearIndicators: WearIndicator[];
  remainingLife: number; // percentage
  criticalWearPoints: CriticalWearPoint[];
  
  // Performance Impact
  performanceImpact: number; // percentage reduction
  reliabilityScore: number; // 1-100
  safetyRating: 'safe' | 'caution' | 'unsafe';
}

export interface ComponentCondition {
  component: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  wearPercentage: number;
  lastInspected: string;
  inspector: string;
  notes: string;
  photos: string[];
  maintenanceRequired: boolean;
  replacementRequired: boolean;
  estimatedReplacementCost: number;
}

export interface WearIndicator {
  indicator: string;
  currentValue: number;
  thresholdValue: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  alertLevel: 'green' | 'yellow' | 'red';
  projectedFailureDate?: string;
}

export interface CriticalWearPoint {
  component: string;
  description: string;
  currentWear: number;
  criticalWear: number;
  estimatedFailureHours: number;
  replacementCost: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  monitoringRequired: boolean;
}

export interface InspectionRecord {
  id: string;
  date: string;
  type: 'routine' | 'pre_operation' | 'post_operation' | 'safety' | 'compliance' | 'detailed';
  inspector: string;
  
  // Inspection Areas
  inspectionAreas: InspectionArea[];
  checklistCompleted: InspectionChecklist;
  
  // Results
  overallRating: number; // 1-10
  issuesFound: InspectionIssue[];
  photosCount: number;
  
  // Recommendations
  immediateActions: string[];
  plannedActions: string[];
  followUpInspection?: string;
  
  // Compliance
  regulatoryCompliance: boolean;
  certificationValid: boolean;
  complianceNotes: string;
  
  // Documentation
  report: string;
  photos: string[];
  documents: string[];
}

export interface InspectionArea {
  area: string;
  status: 'pass' | 'fail' | 'warning' | 'not_applicable';
  notes: string;
  measurements: { [key: string]: number };
  photosCount: number;
}

export interface InspectionChecklist {
  items: InspectionItem[];
  completionPercentage: number;
  totalItems: number;
  passedItems: number;
  failedItems: number;
}

export interface InspectionItem {
  item: string;
  category: string;
  status: 'pass' | 'fail' | 'warning' | 'not_applicable' | 'not_checked';
  notes: string;
  correctionRequired: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface InspectionIssue {
  type: 'safety' | 'mechanical' | 'electrical' | 'hydraulic' | 'cosmetic' | 'operational';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  location: string;
  actionRequired: string;
  estimatedCost: number;
  deadline?: string;
  photos: string[];
}

export interface EquipmentDocument {
  id: string;
  type: 'manual' | 'warranty' | 'invoice' | 'maintenance_record' | 'inspection_report' | 'certification' | 'insurance' | 'registration' | 'other';
  title: string;
  description: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  expiryDate?: string;
  version: string;
  tags: string[];
  accessLevel: 'public' | 'internal' | 'restricted' | 'confidential';
}

export interface WarrantyInfo {
  id: string;
  type: 'manufacturer' | 'extended' | 'dealer' | 'third_party';
  provider: string;
  startDate: string;
  endDate: string;
  coverage: string[];
  exclusions: string[];
  claimsProcedure: string;
  contactInfo: ContactInfo;
  documentsIds: string[];
  claimsHistory: WarrantyClaim[];
  isActive: boolean;
  remainingValue: number;
}

export interface WarrantyClaim {
  id: string;
  claimDate: string;
  issue: string;
  claimAmount: number;
  status: 'submitted' | 'approved' | 'denied' | 'completed';
  resolution: string;
  documentsIds: string[];
}

export interface InsuranceInfo {
  id: string;
  provider: string;
  policyNumber: string;
  startDate: string;
  endDate: string;
  coverage: InsuranceCoverage;
  premium: number;
  deductible: number;
  contactInfo: ContactInfo;
  claimsHistory: InsuranceClaim[];
  isActive: boolean;
}

export interface InsuranceCoverage {
  replacement: boolean;
  actualCashValue: boolean;
  liability: boolean;
  theft: boolean;
  damage: boolean;
  breakdown: boolean;
  coverageAmount: number;
  limitations: string[];
}

export interface InsuranceClaim {
  id: string;
  claimDate: string;
  incident: string;
  claimAmount: number;
  settlementAmount: number;
  status: 'submitted' | 'investigating' | 'approved' | 'denied' | 'settled';
  adjuster: string;
  documentsIds: string[];
}

export interface EquipmentAlert {
  id: string;
  type: 'maintenance_due' | 'inspection_overdue' | 'warranty_expiring' | 'high_usage' | 'performance_decline' | 'safety_concern' | 'cost_threshold';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  equipmentId: string;
  triggered: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedAt?: string;
  action: AlertAction;
  autoResolve: boolean;
}

export interface AlertAction {
  required: boolean;
  description: string;
  deadline?: string;
  assignedTo?: string;
  estimatedCost?: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface EquipmentNotification {
  id: string;
  type: 'reminder' | 'alert' | 'update' | 'report';
  channel: 'email' | 'sms' | 'app' | 'dashboard';
  recipient: string;
  subject: string;
  message: string;
  sent: boolean;
  sentAt?: string;
  delivered: boolean;
  deliveredAt?: string;
  read: boolean;
  readAt?: string;
  response?: string;
}

export interface EquipmentPerformanceMetrics {
  efficiency: EfficiencyMetrics;
  utilization: UtilizationMetrics;
  reliability: ReliabilityMetrics;
  productivity: ProductivityMetrics;
  safety: SafetyMetrics;
  environmental: EnvironmentalMetrics;
  lastCalculated: string;
}

export interface UtilizationMetrics {
  hoursPerYear: number;
  utilizationRate: number; // percentage
  peakUtilization: number;
  averageUtilization: number;
  seasonalVariation: number;
  downtimeHours: number;
  downtimeReasons: { [reason: string]: number };
}

export interface ReliabilityMetrics {
  mtbf: number; // mean time between failures
  mttr: number; // mean time to repair
  availabilityRate: number; // percentage
  failureRate: number;
  criticalFailures: number;
  minorFailures: number;
  reliabilityScore: number; // 1-100
}

export interface ProductivityMetrics {
  workRate: number; // units per hour
  qualityScore: number; // 1-100
  costPerUnit: number;
  revenuePerHour: number;
  profitMargin: number;
  benchmarkComparison: number; // percentage vs industry standard
}

export interface SafetyMetrics {
  safetyScore: number; // 1-100
  incidentCount: number;
  nearMissCount: number;
  safetyTrainingCompliance: number; // percentage
  lastSafetyIncident?: string;
  safetyRating: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
}

export interface EnvironmentalMetrics {
  fuelConsumption: number; // per hour
  emissions: number; // per hour
  noiseLevel: number; // decibels
  environmentalCompliance: boolean;
  efficiencyRating: 'A' | 'B' | 'C' | 'D' | 'F';
  carbonFootprint: number; // kg CO2 per hour
}

export interface EquipmentCostAnalysis {
  acquisitionCost: number;
  totalOwnershipCost: number;
  annualOperatingCost: number;
  
  // Cost Breakdown
  costBreakdown: CostBreakdown;
  
  // ROI Analysis
  roi: ROIAnalysis;
  
  // Lifecycle Costs
  lifecycleCosts: LifecycleCosts;
  
  // Projections
  costProjections: CostProjection[];
  
  // Benchmarks
  costBenchmarks: CostBenchmarks;
}

export interface CostBreakdown {
  fuel: number;
  maintenance: number;
  repairs: number;
  labor: number;
  insurance: number;
  depreciation: number;
  financing: number;
  storage: number;
  other: number;
}

export interface ROIAnalysis {
  totalInvestment: number;
  totalReturn: number;
  netReturn: number;
  roiPercentage: number;
  paybackPeriod: number; // months
  npv: number; // net present value
  irr: number; // internal rate of return
}

export interface LifecycleCosts {
  phase1_acquisition: number;
  phase2_operation: number;
  phase3_maintenance: number;
  phase4_disposal: number;
  totalLifecycleCost: number;
  averageAnnualCost: number;
}

export interface CostBenchmarks {
  industryAverage: number;
  topPercentile: number;
  farmAverage: number;
  costPerformanceRating: 'excellent' | 'above_average' | 'average' | 'below_average' | 'poor';
  improvementOpportunities: string[];
}

export type EquipmentStatus = 
  | 'active' 
  | 'inactive' 
  | 'maintenance' 
  | 'repair' 
  | 'retired' 
  | 'sold' 
  | 'leased_out';

export interface EquipmentPhoto {
  id: string;
  url: string;
  thumbnail: string;
  caption: string;
  type: 'general' | 'condition' | 'damage' | 'maintenance' | 'inspection' | 'before_after';
  takenAt: string;
  takenBy: string;
  equipment: string;
  tags: string[];
  verified: boolean;
}

// Equipment Management Analytics
export interface EquipmentAnalytics {
  totalEquipment: number;
  equipmentByCategory: { [category: string]: number };
  equipmentByCondition: { [condition: string]: number };
  equipmentByAge: { [ageRange: string]: number };
  
  // Financial Overview
  totalValue: number;
  totalMaintenanceCost: number;
  totalOperatingCost: number;
  averageAge: number;
  averageUtilization: number;
  
  // Performance Metrics
  fleetEfficiency: number;
  fleetReliability: number;
  fleetSafety: number;
  
  // Upcoming Items
  upcomingMaintenance: UpcomingMaintenanceTask[];
  expiringWarranties: WarrantyInfo[];
  overdueInspections: Equipment[];
  
  // Trends
  trends: {
    utilizationTrend: TrendData[];
    maintenanceCostTrend: TrendData[];
    reliabilityTrend: TrendData[];
    efficiencyTrend: TrendData[];
  };
  
  // Recommendations
  recommendations: EquipmentRecommendation[];
  
  // Benchmarks
  benchmarks: FleetBenchmarks;
}

export interface EquipmentRecommendation {
  id: string;
  type: 'maintenance' | 'replacement' | 'upgrade' | 'optimization' | 'cost_reduction';
  priority: 'low' | 'medium' | 'high' | 'critical';
  equipmentId: string;
  title: string;
  description: string;
  reasoning: string;
  expectedBenefit: string;
  estimatedCost: number;
  estimatedSavings: number;
  implementation: string;
  timeline: string;
  status: 'new' | 'reviewed' | 'approved' | 'rejected' | 'implemented';
  createdAt: string;
  createdBy: 'ai' | 'manager' | 'technician' | 'system';
}

export interface FleetBenchmarks {
  industryBenchmarks: {
    averageUtilization: number;
    averageMaintenanceCost: number;
    averageLifespan: number;
    averageEfficiency: number;
  };
  farmPerformance: {
    utilization: number;
    maintenanceCost: number;
    efficiency: number;
    reliability: number;
  };
  performanceRatings: {
    utilization: 'excellent' | 'above_average' | 'average' | 'below_average' | 'poor';
    maintenance: 'excellent' | 'above_average' | 'average' | 'below_average' | 'poor';
    efficiency: 'excellent' | 'above_average' | 'average' | 'below_average' | 'poor';
    cost: 'excellent' | 'above_average' | 'average' | 'below_average' | 'poor';
  };
}

// Equipment API Responses
export interface EquipmentListResponse {
  success: boolean;
  data: Equipment[];
  total: number;
  page: number;
  totalPages: number;
  message?: string;
}

export interface EquipmentResponse {
  success: boolean;
  data: Equipment;
  message?: string;
}

export interface EquipmentAnalyticsResponse {
  success: boolean;
  data: EquipmentAnalytics;
  message?: string;
}

export interface MaintenanceScheduleResponse {
  success: boolean;
  data: UpcomingMaintenanceTask[];
  message?: string;
}

export interface EquipmentCostResponse {
  success: boolean;
  data: EquipmentCostAnalysis;
  message?: string;
}