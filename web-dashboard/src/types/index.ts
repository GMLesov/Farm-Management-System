// Shared types for the web dashboard
export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'manager' | 'worker';
  farmId?: string;
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Animal {
  id: string;
  name: string;
  species: 'cattle' | 'pig' | 'goat' | 'sheep' | 'chicken' | 'other';
  breed: string;
  dateOfBirth?: Date;
  gender: 'male' | 'female';
  weight: number;
  healthStatus: 'healthy' | 'sick' | 'treatment' | 'quarantine';
  location: string;
  feedLog: FeedingRecord[];
  vaccinations: VaccinationRecord[];
  medicalHistory: MedicalRecord[];
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
  farmId: string;
  createdBy: string;
}

export interface FeedingRecord {
  id: string;
  date: Date;
  feedType: string;
  quantity: number;
  unit: 'kg' | 'liters' | 'bags';
  cost?: number;
  recordedBy: string;
  notes?: string;
}

export interface VaccinationRecord {
  id: string;
  vaccineName: string;
  dateAdministered: Date;
  nextDueDate?: Date;
  administeredBy: string;
  batchNumber?: string;
  veterinarianId?: string;
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  date: Date;
  diagnosis: string;
  treatment: string;
  veterinarianId?: string;
  cost?: number;
  followUpDate?: Date;
  notes?: string;
}

export interface Crop {
  id: string;
  name: string;
  variety: string;
  fieldLocation: string;
  plantingDate: Date;
  expectedHarvestDate: Date;
  actualHarvestDate?: Date;
  stage: 'planted' | 'growing' | 'flowering' | 'fruiting' | 'harvested';
  area: number; // in hectares
  fertilizerPlan: FertilizerRecord[];
  irrigationSchedule: IrrigationRecord[];
  pestControlLog: PestControlRecord[];
  harvestYield?: number;
  photos: string[];
  createdAt: Date;
  updatedAt: Date;
  farmId: string;
  managedBy: string;
}

export interface FertilizerRecord {
  id: string;
  date: Date;
  fertilizerType: string;
  quantity: number;
  unit: 'kg' | 'liters' | 'bags';
  cost?: number;
  appliedBy: string;
  notes?: string;
}

export interface IrrigationRecord {
  id: string;
  date: Date;
  duration: number; // in minutes
  method: 'sprinkler' | 'drip' | 'flood' | 'manual';
  waterSource: string;
  recordedBy: string;
}

export interface PestControlRecord {
  id: string;
  date: Date;
  pestType: string;
  treatmentUsed: string;
  quantity: number;
  cost?: number;
  appliedBy: string;
  effectiveness?: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'feeding' | 'cleaning' | 'vaccination' | 'harvesting' | 'planting' | 'maintenance' | 'inspection' | 'other';
  category?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue' | 'cancelled';
  assignedTo: string;
  assignedBy: string;
  relatedEntityId?: string;
  relatedEntityType?: 'animal' | 'crop';
  dueDate: Date;
  estimatedDuration?: number;
  actualDuration?: number;
  completedAt?: Date;
  proofPhotos: string[];
  notes?: string;
  location?: string;
  recurringPattern?: RecurringPattern;
  createdAt: Date;
  updatedAt: Date;
  farmId: string;
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number;
  endDate?: Date;
}

export interface DashboardMetrics {
  totalAnimals: number;
  healthyAnimals: number;
  sickAnimals: number;
  totalCrops: number;
  activeCrops: number;
  harvestedCrops: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  pendingTasks: number;
  totalWorkers: number;
  activeWorkers: number;
  totalRevenue: number;
  totalExpenses: number;
  profitMargin: number;
  period: 'week' | 'month' | 'quarter' | 'year';
  updatedAt: Date;
}

export interface ChartData {
  label: string;
  value: number;
  color?: string;
  category?: string;
}

export interface Report {
  id: string;
  farmId: string;
  title: string;
  description: string;
  type: 'animals' | 'crops' | 'tasks' | 'financial' | 'comprehensive';
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  status: 'generating' | 'generated' | 'failed';
  downloadUrl: string;
  fileSize: number;
  format: 'pdf' | 'excel' | 'csv';
}

export interface ReportData {
  id: string;
  title: string;
  description: string;
  type: 'financial' | 'production' | 'health' | 'task_completion' | 'inventory' | 'custom';
  dateRange: {
    start: Date;
    end: Date;
  };
  data: any;
  generatedAt: Date;
  generatedBy: string;
  farmId: string;
}

export interface ExportFormat {
  type: 'csv' | 'excel' | 'pdf' | 'json';
  filename: string;
  includeCharts?: boolean;
  includeImages?: boolean;
}

export interface FilterOptions {
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: string[];
  type?: string[];
  assignedTo?: string[];
  location?: string[];
  category?: string[];
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  total?: number;
  page?: number;
  limit?: number;
}