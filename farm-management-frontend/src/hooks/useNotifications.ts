import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { socketService } from '../services/socket';
import { notificationApi } from '../services/api';
import {
  NotificationData,
  NotificationFilter,
  NotificationPagination,
  UseNotificationsOptions,
  UseNotificationsReturn,
  NotificationEventCallback,
  ConnectionEventCallback,
  AnimalHealthEventCallback,
  AnimalLocationEventCallback,
  FarmUserEventCallback,
  ErrorEventCallback
} from '../types/notification';

export const useNotifications = (options: UseNotificationsOptions = {}): UseNotificationsReturn => {
  const { user, token } = useAuth();
  const {
    farmId = user?.farmId,
    autoConnect = true,
    enableRealtime = true,
    filters = {},
    pagination = { page: 1, limit: 20 }
  } = options;

  // State
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationData, setPaginationData] = useState<NotificationPagination | null>(null);

  // Refs for stable callbacks
  const currentFarmId = useRef(farmId);
  const currentFilters = useRef(filters);
  const currentPagination = useRef(pagination);

  // Update refs when props change
  useEffect(() => {
    currentFarmId.current = farmId;
    currentFilters.current = filters;
    currentPagination.current = pagination;
  }, [farmId, filters, pagination]);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!currentFarmId.current || !token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await notificationApi.getNotifications({
        farmId: currentFarmId.current,
        ...currentFilters.current,
        ...currentPagination.current
      });

      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
        setPaginationData(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch notifications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await notificationApi.markAsRead(notificationId);
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId 
              ? { ...n, isRead: true, updatedAt: new Date() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await notificationApi.deleteNotification(notificationId);
      if (response.success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        // Update unread count if the deleted notification was unread
        const deletedNotification = notifications.find(n => n.id === notificationId);
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  }, [notifications]);

  // Socket connection management
  const connect = useCallback(() => {
    if (!token || !currentFarmId.current) return;

    try {
      socketService.connect(token, currentFarmId.current);
      setIsConnected(true);
    } catch (err) {
      console.error('Error connecting to socket:', err);
      setError('Failed to connect to real-time updates');
    }
  }, [token]);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
  }, []);

  // Animal subscription methods
  const subscribeToAnimal = useCallback((animalId: string) => {
    socketService.subscribeToAnimal(animalId);
  }, []);

  const unsubscribeFromAnimal = useCallback((animalId: string) => {
    socketService.unsubscribeFromAnimal(animalId);
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!enableRealtime) return;

    const handleNewNotification: NotificationEventCallback = (notification) => {
      setNotifications(prev => [notification, ...prev]);
      if (!notification.isRead) {
        setUnreadCount(prev => prev + 1);
      }
    };

    const handleConnectionChange: ConnectionEventCallback = ({ connected }) => {
      setIsConnected(connected);
      if (connected) {
        setError(null);
      }
    };

    const handleError: ErrorEventCallback = ({ error }) => {
      setError(error);
      setIsConnected(false);
    };

    // Subscribe to all notification types
    socketService.on('notification:new', handleNewNotification);
    socketService.on('notification:animal_health', handleNewNotification);
    socketService.on('notification:feed_alert', handleNewNotification);
    socketService.on('notification:veterinary_reminder', handleNewNotification);
    socketService.on('notification:breeding_update', handleNewNotification);
    socketService.on('notification:system_alert', handleNewNotification);

    // Connection events
    socketService.on('socket:connected', handleConnectionChange);
    socketService.on('socket:disconnected', () => setIsConnected(false));
    socketService.on('socket:error', handleError);

    return () => {
      socketService.off('notification:new', handleNewNotification);
      socketService.off('notification:animal_health', handleNewNotification);
      socketService.off('notification:feed_alert', handleNewNotification);
      socketService.off('notification:veterinary_reminder', handleNewNotification);
      socketService.off('notification:breeding_update', handleNewNotification);
      socketService.off('notification:system_alert', handleNewNotification);
      socketService.off('socket:connected', handleConnectionChange);
      socketService.off('socket:disconnected');
      socketService.off('socket:error', handleError);
    };
  }, [enableRealtime]);

  // Auto-connect and fetch data on mount
  useEffect(() => {
    if (autoConnect && enableRealtime && token && farmId) {
      connect();
    }
    fetchNotifications();
  }, [autoConnect, enableRealtime, token, farmId, connect, fetchNotifications]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (enableRealtime) {
        disconnect();
      }
    };
  }, [enableRealtime, disconnect]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isConnected,
    error,
    pagination: paginationData,
    markAsRead,
    deleteNotification,
    refresh: fetchNotifications,
    connect,
    disconnect,
    subscribeToAnimal,
    unsubscribeFromAnimal
  };
};

// Hook for real-time animal health updates
export const useAnimalHealth = (animalId?: string) => {
  const [healthData, setHealthData] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!animalId) return;

    const handleHealthUpdate: AnimalHealthEventCallback = (update) => {
      if (update.animalId === animalId) {
        setHealthData(update.healthData);
        setLastUpdate(update.timestamp);
      }
    };

    socketService.on('animal:health_update', handleHealthUpdate);
    socketService.subscribeToAnimal(animalId);

    return () => {
      socketService.off('animal:health_update', handleHealthUpdate);
      socketService.unsubscribeFromAnimal(animalId);
    };
  }, [animalId]);

  return { healthData, lastUpdate };
};

// Hook for real-time animal location updates
export const useAnimalLocation = (animalId?: string) => {
  const [locationData, setLocationData] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    if (!animalId) return;

    const handleLocationUpdate: AnimalLocationEventCallback = (update) => {
      if (update.animalId === animalId) {
        setLocationData(update.locationData);
        setLastUpdate(update.timestamp);
      }
    };

    socketService.on('animal:location_update', handleLocationUpdate);
    socketService.subscribeToAnimal(animalId);

    return () => {
      socketService.off('animal:location_update', handleLocationUpdate);
      socketService.unsubscribeFromAnimal(animalId);
    };
  }, [animalId]);

  return { locationData, lastUpdate };
};

// Hook for farm user activity
export const useFarmActivity = (farmId?: string) => {
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!farmId) return;

    const handleUserJoined: FarmUserEventCallback = (event) => {
      if (event.farmId === farmId && event.action === 'joined') {
        setActiveUsers(prev => [...prev, event.userId]);
        setRecentActivity(prev => [event, ...prev.slice(0, 9)]);
      }
    };

    const handleUserLeft: FarmUserEventCallback = (event) => {
      if (event.farmId === farmId && event.action === 'left') {
        setActiveUsers(prev => prev.filter(id => id !== event.userId));
        setRecentActivity(prev => [event, ...prev.slice(0, 9)]);
      }
    };

    socketService.on('farm:user_joined', handleUserJoined);
    socketService.on('farm:user_left', handleUserLeft);

    return () => {
      socketService.off('farm:user_joined', handleUserJoined);
      socketService.off('farm:user_left', handleUserLeft);
    };
  }, [farmId]);

  return { activeUsers, recentActivity };
};