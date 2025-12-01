export interface NotificationMetadata {
  read?: boolean;
  readAt?: Date;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  actionRequired?: boolean;
  expiresAt?: Date;
  sourceSystem?: string;
  category?: string;
  tags?: string[];
}

export interface NotificationRelatedData {
  animalId?: string;
  veterinaryRecordId?: string;
  feedId?: string;
  breedingRecordId?: string;
  userId?: string;
  deviceId?: string;
  sensorData?: any;
  actionUrl?: string;
  additionalData?: Record<string, any>;
}

export interface NotificationData {
  id: string;
  farmId: string;
  type: 'animal_health' | 'feed_alert' | 'veterinary_reminder' | 'breeding_update' | 'system_alert';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: NotificationMetadata;
  relatedData?: NotificationRelatedData;
}

export interface NotificationFilter {
  type?: string;
  isRead?: boolean;
  priority?: string;
  farmId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface NotificationResponse {
  success: boolean;
  data: {
    notifications: NotificationData[];
    pagination: NotificationPagination;
    unreadCount: number;
  };
  message?: string;
}

export interface NotificationConnectionStatus {
  connected: boolean;
  socketId?: string;
  farmId?: string;
  userId?: string;
  connectedUsers: number;
  lastActivity?: Date;
  uptime: number;
}

// Real-time event types
export interface SocketEventData {
  timestamp: Date;
  source: string;
  eventId?: string;
}

export interface AnimalHealthUpdate extends SocketEventData {
  animalId: string;
  healthData: {
    temperature?: number;
    heartRate?: number;
    activity?: string;
    status?: string;
    notes?: string;
  };
}

export interface AnimalLocationUpdate extends SocketEventData {
  animalId: string;
  locationData: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    zone?: string;
    enclosure?: string;
  };
}

export interface FarmUserEvent extends SocketEventData {
  userId: string;
  farmId: string;
  action: 'joined' | 'left';
  userInfo?: {
    name: string;
    role: string;
  };
}

// Notification creation types
export interface CreateNotificationRequest {
  farmId: string;
  type: NotificationData['type'];
  title: string;
  message: string;
  severity: NotificationData['severity'];
  metadata?: NotificationMetadata;
  relatedData?: NotificationRelatedData;
}

export interface TestNotificationRequest {
  type?: string;
  title: string;
  message: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  farmId?: string;
}

// Hook types for React integration
export interface UseNotificationsOptions {
  farmId?: string;
  autoConnect?: boolean;
  enableRealtime?: boolean;
  filters?: NotificationFilter;
  pagination?: {
    page?: number;
    limit?: number;
  };
}

export interface UseNotificationsReturn {
  notifications: NotificationData[];
  unreadCount: number;
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;
  pagination: NotificationPagination | null;
  
  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  refresh: () => Promise<void>;
  connect: () => void;
  disconnect: () => void;
  
  // Real-time actions
  subscribeToAnimal: (animalId: string) => void;
  unsubscribeFromAnimal: (animalId: string) => void;
}

// Socket event callback types
export type NotificationEventCallback = (notification: NotificationData) => void;
export type ConnectionEventCallback = (status: { connected: boolean; socketId?: string }) => void;
export type AnimalHealthEventCallback = (update: AnimalHealthUpdate) => void;
export type AnimalLocationEventCallback = (update: AnimalLocationUpdate) => void;
export type FarmUserEventCallback = (event: FarmUserEvent) => void;
export type ErrorEventCallback = (error: { error: string }) => void;