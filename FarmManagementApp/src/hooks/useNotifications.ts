import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { notificationService } from '../services/notificationService';
import { fetchNotifications, addNotificationLocally } from '../store/slices/notificationSlice';
import { Animal, Crop, Task } from '../types';

interface UseNotificationsOptions {
  enableAutoSync?: boolean;
  syncInterval?: number; // in minutes
}

export const useNotifications = (options: UseNotificationsOptions = {}) => {
  const { enableAutoSync = true, syncInterval = 5 } = options;
  
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { notifications, unreadCount, loading } = useSelector((state: RootState) => state.notifications);

  // Initialize notification service
  useEffect(() => {
    const initializeNotifications = async () => {
      if (!notificationService.isServiceInitialized()) {
        await notificationService.initialize();
      }
      
      if (user?.uid) {
        dispatch(fetchNotifications(user.uid));
      }
    };

    initializeNotifications();
  }, [dispatch, user?.uid]);

  // Auto-sync notifications
  useEffect(() => {
    if (!enableAutoSync || !user?.uid) return;

    const interval = setInterval(() => {
      dispatch(fetchNotifications(user.uid));
    }, syncInterval * 60 * 1000);

    return () => clearInterval(interval);
  }, [dispatch, user?.uid, enableAutoSync, syncInterval]);

  // Schedule task reminders
  const scheduleTaskReminder = useCallback(async (task: Task, reminderMinutes: number = 120) => {
    const dueDate = new Date(task.dueDate);
    const reminderTime = new Date(dueDate.getTime() - reminderMinutes * 60 * 1000);
    
    if (reminderTime > new Date()) {
      await notificationService.scheduleTaskReminder(task, reminderTime);
    }
  }, []);

  // Schedule vaccination reminders
  const scheduleVaccinationReminder = useCallback(async (animal: Animal, vaccinationDate: Date) => {
    const reminderDate = new Date(vaccinationDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before
    
    if (reminderDate > new Date()) {
      await notificationService.scheduleVaccinationReminder(animal, reminderDate);
    }
  }, []);

  // Schedule harvest reminders
  const scheduleHarvestReminder = useCallback(async (crop: Crop) => {
    await notificationService.scheduleHarvestReminder(crop);
  }, []);

  // Schedule feeding reminders
  const scheduleFeedingReminder = useCallback(async (animal: Animal, feedingTimes: string[]) => {
    await notificationService.scheduleFeedingReminder(animal, feedingTimes);
  }, []);

  // Send instant notification
  const sendInstantNotification = useCallback(async (title: string, message: string, type: 'reminder' | 'alert' | 'info' | 'warning' | 'success' = 'info') => {
    if (!user) return;

    const notification = {
      id: `instant_${Date.now()}`,
      title,
      message,
      type: type as any,
      priority: 'normal' as const,
      farmId: user.farmId || '',
      userId: user.uid,
    };

    await notificationService.showLocalNotification(notification);
    
    // Add to Redux store for history
    dispatch(addNotificationLocally({
      id: notification.id,
      title,
      message,
      type,
      category: 'general',
      relatedEntityId: undefined,
      relatedEntityType: undefined,
      isRead: false,
      actionRequired: false,
      scheduledFor: undefined,
      createdAt: new Date(),
      userId: user.uid,
    }));
  }, [dispatch, user]);

  // Schedule smart notifications for farm data
  const scheduleSmartNotifications = useCallback(async (animals: Animal[], crops: Crop[], tasks: Task[]) => {
    if (!user) return;
    
    await notificationService.scheduleSmartNotifications(user, animals, crops, tasks);
  }, [user]);

  // Cancel specific notification
  const cancelNotification = useCallback(async (notificationId: string) => {
    await notificationService.cancelNotification(notificationId);
  }, []);

  // Get scheduled notifications
  const getScheduledNotifications = useCallback(async () => {
    return await notificationService.getScheduledNotifications();
  }, []);

  // Check if notifications are enabled
  const isNotificationServiceReady = useCallback(() => {
    return notificationService.isServiceInitialized();
  }, []);

  // Get FCM token for push notifications
  const getFCMToken = useCallback(() => {
    return notificationService.getCurrentFCMToken();
  }, []);

  return {
    // State
    notifications,
    unreadCount,
    loading,
    
    // Actions
    scheduleTaskReminder,
    scheduleVaccinationReminder,
    scheduleHarvestReminder,
    scheduleFeedingReminder,
    scheduleSmartNotifications,
    sendInstantNotification,
    cancelNotification,
    getScheduledNotifications,
    
    // Utils
    isNotificationServiceReady,
    getFCMToken,
  };
};