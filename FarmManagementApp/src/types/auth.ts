export interface User {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'worker';
  farmId: string;
  profileImage?: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  message: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role?: 'admin' | 'manager' | 'worker';
  farmId: string;
  phoneNumber?: string;
}

export interface FarmRegistrationData {
  // Farm Information
  farmName: string;
  farmType: 'livestock' | 'crops' | 'mixed' | 'dairy' | 'poultry' | 'other';
  establishedYear: number;
  
  // Farm Details
  totalArea: number;
  areaUnit: 'acres' | 'hectares' | 'square_meters';
  primaryCrops: string[];
  animalTypes: string[];
  
  // Location
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  
  // Owner Information
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  
  // Business Information
  businessLicense?: string;
  taxId?: string;
  website?: string;
  description?: string;
  
  // Account Setup
  adminEmail: string;
  adminPassword: string;
  adminName: string;
}

export interface WorkerCredentials {
  id: string;
  name: string;
  email: string;
  role: 'worker' | 'supervisor';
  farmId: string;
  phoneNumber?: string;
  temporaryPassword?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface EmailVerificationRequest {
  uid: string;
}

export interface UpdateProfileRequest {
  uid: string;
  name?: string;
  phoneNumber?: string;
  profileImage?: string;
}