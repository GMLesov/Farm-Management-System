// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'farmer' | 'manager' | 'worker';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Farm types
export interface Farm {
  id: string;
  name: string;
  location: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  size: number;
  farmType: 'crop' | 'livestock' | 'dairy' | 'poultry' | 'mixed' | 'organic';
  owner: string;
  managers: string[];
  workers?: string[];
  createdAt: string;
  updatedAt: string;
}

// Animal types
export interface Animal {
  id: string;
  farm: string;
  tagNumber: string;
  name?: string;
  species: 'cattle' | 'pig' | 'sheep' | 'goat' | 'chicken' | 'horse' | 'other';
  breed?: string;
  gender: 'male' | 'female';
  dateOfBirth?: string;
  weight?: number;
  healthStatus: 'healthy' | 'sick' | 'injured' | 'quarantine' | 'deceased';
  location?: {
    building?: string;
    pen?: string;
    pasture?: string;
  };
  acquisitionInfo: {
    type: 'purchased' | 'born_on_farm' | 'inherited' | 'gifted';
    date: string;
    cost?: number;
    vendor?: string;
    parentMother?: string;
    parentFather?: string;
  };
  healthRecords: HealthRecord[];
  productionRecords: ProductionRecord[];
  feedingSchedule: FeedingSchedule[];
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthRecord {
  id: string;
  date: string;
  type: 'vaccination' | 'treatment' | 'checkup' | 'injury' | 'illness' | 'medication' | 'other';
  description: string;
  veterinarian?: string;
  medication?: string;
  dosage?: string;
  cost?: number;
  nextDueDate?: string;
  notes?: string;
}

export interface ProductionRecord {
  id: string;
  date: string;
  type: 'milk' | 'eggs' | 'wool' | 'meat' | 'breeding' | 'other';
  quantity: number;
  unit: string;
  quality?: {
    grade?: string;
    fatContent?: number;
    proteinContent?: number;
    notes?: string;
  };
  marketValue?: number;
}

export interface FeedingSchedule {
  id: string;
  feedType: string;
  quantity: number;
  unit: string;
  frequency: 'daily' | 'twice_daily' | 'weekly' | 'as_needed';
  startDate: string;
  endDate?: string;
  notes?: string;
}

// Veterinary types
export interface VeterinaryRecord {
  id: string;
  farm: string;
  animal: string | Animal;
  veterinarian: {
    name: string;
    clinic: string;
    phone: string;
    email?: string;
    licenseNumber?: string;
  };
  appointment: {
    scheduledDate: string;
    actualDate?: string;
    duration?: number;
    type: 'routine_checkup' | 'emergency' | 'vaccination' | 'surgery' | 'dental' | 'reproduction' | 'other';
    status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  };
  examination: {
    weight?: number;
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
    bodyConditionScore?: number;
    generalCondition: string;
    findings: string[];
  };
  treatment: {
    diagnosis: string[];
    prescriptions: {
      medication: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }[];
    procedures: {
      name: string;
      description: string;
      duration?: number;
    }[];
    followUpRequired: boolean;
    followUpDate?: string;
    restrictions?: string[];
  };
  costs: {
    consultationFee: number;
    medicationCost: number;
    procedureCost: number;
    additionalCharges: number;
    totalCost: number;
    paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'overdue';
    paymentDate?: string;
  };
  documents: {
    type: 'prescription' | 'lab_report' | 'xray' | 'certificate' | 'other';
    name: string;
    url: string;
    uploadDate: string;
  }[];
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Feed types
export interface Feed {
  id: string;
  farm: string;
  name: string;
  type: 'concentrate' | 'forage' | 'supplement' | 'complete' | 'mineral';
  suitableFor: ('cattle' | 'pig' | 'sheep' | 'goat' | 'chicken' | 'horse')[];
  nutritionFacts: {
    protein: number;
    fat: number;
    fiber: number;
    moisture: number;
    ash: number;
    carbohydrates?: number;
    vitamins?: { [key: string]: number };
    minerals?: { [key: string]: number };
  };
  inventory: {
    currentStock: number;
    unit: string;
    reorderPoint: number;
    maxStock?: number;
    costPerUnit: number;
    lastRestockDate?: string;
    expiryDate?: string;
  };
  supplier: {
    name: string;
    contact: string;
    email?: string;
    address?: string;
  };
  usageHistory: {
    date: string;
    quantity: number;
    animalGroup?: string;
    notes?: string;
  }[];
  restockHistory: {
    date: string;
    quantity: number;
    costPerUnit: number;
    supplier: string;
    batchNumber?: string;
    expiryDate?: string;
  }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Breeding types
export interface BreedingRecord {
  id: string;
  farm: string;
  femaleAnimal: string | Animal;
  maleAnimal?: string | Animal;
  breedingType: 'natural' | 'artificial_insemination' | 'embryo_transfer';
  breedingDate: string;
  expectedBirthDate: string;
  actualBirthDate?: string;
  outcome: {
    status: 'pending' | 'successful' | 'failed' | 'aborted';
    offspring?: {
      animalId?: string;
      gender: 'male' | 'female' | 'unknown';
      weight?: number;
      healthStatus: 'healthy' | 'complications' | 'deceased';
      notes?: string;
    }[];
    complications?: string[];
  };
  veterinarian?: {
    name: string;
    clinic: string;
    phone: string;
  };
  cost: {
    serviceFee: number;
    medicationCost: number;
    additionalCharges: number;
    totalCost: number;
  };
  notes: string;
  documents: {
    type: 'breeding_certificate' | 'ai_record' | 'ultrasound' | 'other';
    name: string;
    url: string;
    uploadDate: string;
  }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics types
export interface AnimalAnalytics {
  summary: {
    totalAnimals: number;
    healthyAnimals: number;
    sickAnimals: number;
    averageAge: number;
    totalValue: number;
  };
  bySpecies: { [key: string]: number };
  byHealthStatus: { [key: string]: number };
  productionTrends: {
    month: string;
    production: number;
    revenue: number;
  }[];
  healthTrends: {
    month: string;
    healthyCount: number;
    sickCount: number;
  }[];
}

export interface VeterinaryAnalytics {
  summary: {
    totalRecords: number;
    upcomingAppointments: number;
    overdueFollowUps: number;
    costs: {
      totalCosts: number;
      totalPaid: number;
      totalPending: number;
    };
  };
  appointmentsByType: { _id: string; count: number }[];
  monthlyTrends: {
    _id: { month: number; year: number };
    count: number;
    totalCost: number;
  }[];
}

export interface FeedAnalytics {
  summary: {
    totalFeeds: number;
    lowStockFeeds: number;
    totalValue: number;
    monthlyConsumption: number;
  };
  feedsByType: { _id: string; count: number }[];
  consumptionTrends: {
    month: string;
    consumption: number;
    cost: number;
  }[];
  stockLevels: {
    feedName: string;
    currentStock: number;
    reorderPoint: number;
    status: 'normal' | 'low' | 'critical';
  }[];
}

// API request/response types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: any;
}

export interface FeedUsageRecord {
  id?: string;
  feedId: string;
  animalId?: string;
  date: string;
  quantity: number;
  unit?: string;
  notes?: string;
}