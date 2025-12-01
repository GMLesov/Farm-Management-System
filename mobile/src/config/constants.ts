// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:5000', // Android emulator localhost - backend running on port 3000
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json'
  }
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'Farm Manager',
  VERSION: '1.0.0',
  BUNDLE_ID: 'com.farmmanager.mobile'
};

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@farm_auth_token',
  USER_DATA: '@farm_user_data',
  OFFLINE_TASKS: '@farm_offline_tasks',
  SETTINGS: '@farm_settings'
};

// Task Types
export const TASK_TYPES = [
  'planting',
  'harvesting',
  'irrigation',
  'fertilizing',
  'spraying',
  'weeding',
  'feeding',
  'cleaning',
  'maintenance',
  'other'
];

// Task Status
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Task Priority
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};

// Colors
export const COLORS = {
  primary: '#2e7d32',
  secondary: '#388e3c',
  accent: '#66bb6a',
  background: '#f5f5f5',
  surface: '#ffffff',
  error: '#d32f2f',
  success: '#4caf50',
  warning: '#ff9800',
  info: '#2196f3',
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#9e9e9e',
    light: '#ffffff'
  },
  border: '#e0e0e0',
  shadow: '#000000'
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40
};

// Typography
export const TYPOGRAPHY = {
  h1: { fontSize: 32, fontWeight: 'bold' as const },
  h2: { fontSize: 28, fontWeight: 'bold' as const },
  h3: { fontSize: 24, fontWeight: '600' as const },
  h4: { fontSize: 20, fontWeight: '600' as const },
  h5: { fontSize: 18, fontWeight: '500' as const },
  body1: { fontSize: 16 },
  body2: { fontSize: 14 },
  caption: { fontSize: 12 },
  button: { fontSize: 14, fontWeight: '600' as const, textTransform: 'uppercase' as const }
};

// Animation Durations
export const ANIMATION = {
  fast: 200,
  normal: 300,
  slow: 500
};

// Location Update Interval (5 minutes)
export const LOCATION_UPDATE_INTERVAL = 5 * 60 * 1000;

// Offline Sync Interval (10 minutes)
export const OFFLINE_SYNC_INTERVAL = 10 * 60 * 1000;

