// User and Authentication Types
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

// Animal Management Types
export interface Animal {
  id: string;
  name: string;
  species: 'cattle' | 'pig' | 'goat' | 'sheep' | 'chicken' | 'other';
  breed: string;
  dateOfBirth?: Date | string;
  gender: 'male' | 'female';
  weight: number;
  currentWeight?: number; // For offline compatibility
  healthStatus: 'healthy' | 'sick' | 'treatment' | 'quarantine';
  location: string;
  currentLocation?: string; // For offline compatibility
  notes?: string; // For offline compatibility
  feedLog: FeedingRecord[];
  vaccinations: VaccinationRecord[];
  medicalHistory: MedicalRecord[];
  photos: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
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
  notes?: string;
}

export interface MedicalRecord {
  id: string;
  date: Date;
  condition: string;
  treatment: string;
  veterinarian?: string;
  cost?: number;
  followUpDate?: Date;
  notes?: string;
}

// Crop Management Types
export interface Crop {
  id: string;
  name: string;
  variety: string;
  fieldLocation: string;
  plantingDate: Date | string;
  expectedHarvestDate: Date | string;
  actualHarvestDate?: Date | string;
  stage: 'planted' | 'growing' | 'flowering' | 'fruiting' | 'harvested';
  status?: 'planted' | 'growing' | 'flowering' | 'fruiting' | 'harvested'; // For offline compatibility
  area: number; // in hectares
  soilType?: string; // For offline compatibility
  totalYield?: number; // For offline compatibility
  notes?: string; // For offline compatibility
  fertilizerPlan: FertilizerRecord[];
  irrigationSchedule: IrrigationRecord[];
  pestControlLog: PestControlRecord[];
  harvestYield?: number;
  photos: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
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

// Task Management Types
export interface Task {
  id: string;
  title: string;
  description: string;
  type: 'feeding' | 'cleaning' | 'vaccination' | 'harvesting' | 'planting' | 'maintenance' | 'inspection' | 'other';
  category?: string; // Optional category for better organization
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'overdue' | 'cancelled';
  assignedTo: string; // user ID
  assignedBy: string; // manager ID
  relatedEntityId?: string; // animal or crop ID
  relatedEntityType?: 'animal' | 'crop';
  relatedEntity?: string; // For offline compatibility
  dueDate: Date | string;
  estimatedDuration?: number; // in minutes
  actualDuration?: number;
  completedAt?: Date | string;
  proofPhotos: string[];
  notes?: string;
  location?: string;
  recurringPattern?: RecurringPattern;
  createdAt: Date | string;
  updatedAt: Date | string;
  farmId: string;
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'custom';
  interval: number;
  endDate?: Date;
  daysOfWeek?: number[]; // 0 = Sunday, 1 = Monday, etc.
}

// Farm and Financial Types
export interface Farm {
  id: string;
  name: string;
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  ownerId: string;
  managersIds: string[];
  workersIds: string[];
  farmType: 'livestock' | 'crops' | 'mixed' | 'dairy' | 'poultry';
  totalArea: number; // in hectares
  establishedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  category: 'feed' | 'fertilizer' | 'veterinary' | 'labor' | 'equipment' | 'utilities' | 'other';
  description: string;
  amount: number;
  currency: 'USD' | 'ZWL';
  date: Date;
  relatedEntityId?: string;
  relatedEntityType?: 'animal' | 'crop' | 'task';
  receipt?: string; // photo URL
  recordedBy: string;
  farmId: string;
  createdAt: Date;
}

export interface Revenue {
  id: string;
  source: 'livestock-sale' | 'crop-sale' | 'milk' | 'eggs' | 'other';
  description: string;
  amount: number;
  currency: 'USD' | 'ZWL';
  date: Date;
  quantity?: number;
  unitPrice?: number;
  buyer?: string;
  relatedEntityId?: string;
  relatedEntityType?: 'animal' | 'crop';
  recordedBy: string;
  farmId: string;
  createdAt: Date;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reminder' | 'alert' | 'info' | 'warning' | 'success';
  category: 'feeding' | 'vaccination' | 'task' | 'health' | 'harvest' | 'general';
  relatedEntityId?: string;
  relatedEntityType?: 'animal' | 'crop' | 'task';
  isRead: boolean;
  actionRequired: boolean;
  scheduledFor?: Date;
  createdAt: Date;
}

// Dashboard and Analytics Types
export interface DashboardMetrics {
  totalAnimals: number;
  healthyAnimals: number;
  sickAnimals: number;
  totalCrops: number;
  activeCrops: number;
  harvestedCrops: number;
  pendingTasks: number;
  overdueTasks: number;
  completedTasksToday: number;
  monthlyExpenses: number;
  monthlyRevenue: number;
  feedConsumptionToday: number;
  upcomingVaccinations: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    color?: (opacity: number) => string;
    strokeWidth?: number;
  }[];
}

// Form and UI Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'textarea' | 'photo' | 'switch';
  required?: boolean;
  options?: { label: string; value: string }[];
  validation?: any;
  placeholder?: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// State Management Types
export interface RootState {
  auth: AuthState;
  animals: AnimalState;
  crops: CropState;
  tasks: TaskState;
  dashboard: DashboardState;
  notifications: NotificationState;
  offline: OfflineState;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AnimalState {
  animals: Animal[];
  isLoading: boolean;
  error: string | null;
  selectedAnimal: Animal | null;
}

export interface CropState {
  crops: Crop[];
  isLoading: boolean;
  error: string | null;
  selectedCrop: Crop | null;
}

export interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filter: TaskFilter;
}

export interface TaskFilter {
  status?: string;
  assignedTo?: string;
  type?: string;
  priority?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface DashboardState {
  metrics: DashboardMetrics | null;
  isLoading: boolean;
  error: string | null;
  chartData: {
    animalHealth: ChartData;
    taskCompletion: ChartData;
    expenses: ChartData;
    feedConsumption: ChartData;
  };
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface OfflineState {
  isOnline: boolean;
  pendingActions: OfflineAction[];
  lastSyncTime: Date | null;
}

export interface OfflineAction {
  id: string;
  type: string;
  payload: any;
  timestamp: Date;
  retryCount: number;
}

// Settings and Configuration Types
export interface AppSettings {
  language: 'en' | 'sn' | 'nd'; // English, Shona, Ndebele
  theme: 'light' | 'dark' | 'auto';
  units: {
    weight: 'kg' | 'lbs';
    area: 'hectares' | 'acres';
    temperature: 'celsius' | 'fahrenheit';
  };
  notifications: {
    push: boolean;
    email: boolean;
    sms: boolean;
    reminderTime: number; // hours before due
  };
  offlineMode: boolean;
  autoSync: boolean;
  dataRetention: number; // days
}

// Offline Database Types
export interface FeedingLog {
  id: string;
  animalId: string;
  feedType: string;
  quantity: number;
  unit: string;
  feedingTime: string;
  notes?: string;
  createdAt: string;
}

export interface CropActivity {
  id: string;
  cropId: string;
  activityType: string;
  description?: string;
  date: string;
  quantity?: number;
  unit?: string;
  notes?: string;
  createdAt: string;
}