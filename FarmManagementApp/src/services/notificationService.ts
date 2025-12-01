import messaging from '@react-native-firebase/messaging';
import functions from '@react-native-firebase/functions';
import PushNotification from 'react-native-push-notification';
import { Platform, Alert, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Animal, Crop, Task, User } from '../types';

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  type: 'task_reminder' | 'vaccination_due' | 'harvest_ready' | 'feeding_time' | 'weather_alert' | 'general';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  entityId?: string; // Related animal, crop, or task ID
  entityType?: 'animal' | 'crop' | 'task';
  actionUrl?: string;
  scheduledTime?: string;
  isRecurring?: boolean;
  farmId: string;
  userId: string;
}

export interface NotificationSchedule {
  id: string;
  notificationId: string;
  cronExpression?: string; // For complex recurring patterns
  nextTrigger: Date;
  isActive: boolean;
}

class NotificationService {
  private fcmToken: string | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    try {
      await this.requestPermissions();
      await this.setupForegroundHandler();
      await this.setupBackgroundHandler();
      await this.getAndSaveFCMToken();
      await this.setupLocalNotifications();
      
      this.isInitialized = true;
      console.log('🔔 Notification service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize notification service:', error);
    }
  }

  private async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        // Request notification permission for Android 13+
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      } else {
        // iOS permission request
        const authStatus = await messaging().requestPermission();
        return authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
               authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  private async setupForegroundHandler(): Promise<void> {
    // Handle notifications when app is in foreground
    messaging().onMessage(async (remoteMessage) => {
      console.log('📱 Foreground notification received:', remoteMessage);
      
      if (remoteMessage.notification) {
        this.showLocalNotification({
          title: remoteMessage.notification.title || 'Farm Alert',
          message: remoteMessage.notification.body || '',
          type: (remoteMessage.data?.type as any) || 'general',
          priority: (remoteMessage.data?.priority as any) || 'normal',
          farmId: String(remoteMessage.data?.farmId || ''),
          userId: String(remoteMessage.data?.userId || ''),
          id: remoteMessage.messageId || Date.now().toString(),
        });
      }
    });
  }

  private async setupBackgroundHandler(): Promise<void> {
    // Handle notifications when app is in background/killed
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('📱 Background notification opened:', remoteMessage);
      this.handleNotificationAction(remoteMessage);
    });

    // Handle notification when app was opened from killed state
    const initialNotification = await messaging().getInitialNotification();
    if (initialNotification) {
      console.log('📱 Initial notification:', initialNotification);
      setTimeout(() => this.handleNotificationAction(initialNotification), 2000);
    }
  }

  private async getAndSaveFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      this.fcmToken = token;
      console.log('🔑 FCM Token:', token);
      
      // Save token to user profile in Firestore
      await this.saveFCMToken(token);
      
      // Monitor token refresh
      messaging().onTokenRefresh(async (newToken) => {
        console.log('🔄 FCM Token refreshed:', newToken);
        this.fcmToken = newToken;
        await this.saveFCMToken(newToken);
      });
      
      return token;
    } catch (error) {
      console.error('❌ Error getting FCM token:', error);
      return null;
    }
  }

  private async saveFCMToken(token: string): Promise<void> {
    try {
      // Save locally
      await AsyncStorage.setItem('fcm_token', token);
      
      // TODO: Save to user profile in Firestore
      // This would be done via a Firebase function or direct Firestore update
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  }

  private setupLocalNotifications(): void {
    PushNotification.configure({
      onRegister: function(token: any) {
        console.log('📱 Local notification token:', token);
      },
      onNotification: function(notification: any) {
        console.log('📱 Local notification received:', notification);
        // Handle local notification actions
        if (notification.userInteraction) {
          // User tapped the notification
          console.log('User interacted with local notification');
        }
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create notification channels for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'task-reminders',
          channelName: 'Task Reminders',
          channelDescription: 'Reminders for upcoming farm tasks',
          importance: 4,
          vibrate: true,
        },
        () => console.log('📱 Task reminders channel created')
      );

      PushNotification.createChannel(
        {
          channelId: 'health-alerts',
          channelName: 'Animal Health Alerts',
          channelDescription: 'Alerts for animal health and vaccinations',
          importance: 4 as const,
          vibrate: true,
        },
        () => console.log('📱 Health alerts channel created')
      );

      PushNotification.createChannel(
        {
          channelId: 'harvest-notifications',
          channelName: 'Harvest Notifications',
          channelDescription: 'Notifications for crop harvest timing',
          importance: 3,
          vibrate: true,
        },
        () => console.log('📱 Harvest notifications channel created')
      );
    }
  }

  private handleNotificationAction(remoteMessage: any): void {
    if (remoteMessage.data) {
      const { type, entityId, entityType, actionUrl } = remoteMessage.data;
      
      // TODO: Navigate to appropriate screen based on notification type
      console.log('Handling notification action:', { type, entityId, entityType, actionUrl });
    }
  }

  // Public methods for sending notifications

  async scheduleTaskReminder(task: Task, reminderTime: Date): Promise<void> {
    const notification: NotificationPayload = {
      id: `task_reminder_${task.id}_${Date.now()}`,
      title: '📝 Task Reminder',
      message: `Don't forget: ${task.title}`,
      type: 'task_reminder',
      priority: task.priority === 'urgent' ? 'urgent' : 'normal',
      entityId: task.id,
      entityType: 'task',
      scheduledTime: reminderTime.toISOString(),
      farmId: task.farmId,
      userId: task.assignedTo,
    };

    await this.scheduleLocalNotification(notification, reminderTime);
  }

  async scheduleVaccinationReminder(animal: Animal, vaccinationDate: Date): Promise<void> {
    const notification: NotificationPayload = {
      id: `vaccination_${animal.id}_${Date.now()}`,
      title: '💉 Vaccination Due',
      message: `${animal.name} needs vaccination`,
      type: 'vaccination_due',
      priority: 'high',
      entityId: animal.id,
      entityType: 'animal',
      scheduledTime: vaccinationDate.toISOString(),
      farmId: animal.farmId,
      userId: animal.createdBy,
    };

    await this.scheduleLocalNotification(notification, vaccinationDate);
  }

  async scheduleHarvestReminder(crop: Crop): Promise<void> {
    const harvestDate = new Date(crop.expectedHarvestDate);
    const reminderDate = new Date(harvestDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days before

    const notification: NotificationPayload = {
      id: `harvest_${crop.id}_${Date.now()}`,
      title: '🌾 Harvest Ready',
      message: `${crop.name} will be ready for harvest in 7 days`,
      type: 'harvest_ready',
      priority: 'normal',
      entityId: crop.id,
      entityType: 'crop',
      scheduledTime: reminderDate.toISOString(),
      farmId: crop.farmId,
      userId: crop.managedBy,
    };

    await this.scheduleLocalNotification(notification, reminderDate);
  }

  async scheduleFeedingReminder(animal: Animal, feedingTimes: string[]): Promise<void> {
    for (const time of feedingTimes) {
      const [hours, minutes] = time.split(':').map(Number);
      const feedingDate = new Date();
      feedingDate.setHours(hours, minutes, 0, 0);
      
      // If time has passed today, schedule for tomorrow
      if (feedingDate.getTime() < Date.now()) {
        feedingDate.setDate(feedingDate.getDate() + 1);
      }

      const notification: NotificationPayload = {
        id: `feeding_${animal.id}_${time}_${Date.now()}`,
        title: '🥛 Feeding Time',
        message: `Time to feed ${animal.name}`,
        type: 'feeding_time',
        priority: 'normal',
        entityId: animal.id,
        entityType: 'animal',
        scheduledTime: feedingDate.toISOString(),
        isRecurring: true,
        farmId: animal.farmId,
        userId: animal.createdBy,
      };

      await this.scheduleLocalNotification(notification, feedingDate);
    }
  }

  private async scheduleLocalNotification(payload: NotificationPayload, scheduleDate: Date): Promise<void> {
    const channelId = this.getChannelId(payload.type);
    
    PushNotification.localNotificationSchedule({
      id: payload.id,
      title: payload.title,
      message: payload.message,
      date: scheduleDate,
      userInfo: {
        type: payload.type,
        entityId: payload.entityId,
        entityType: payload.entityType,
        farmId: payload.farmId,
        userId: payload.userId,
      },
      channelId,
      priority: payload.priority === 'urgent' ? 'max' : 'high',
      vibrate: true,
      playSound: true,
      soundName: 'default',
      repeatType: payload.isRecurring ? 'day' : undefined,
    });

    console.log(`📅 Scheduled ${payload.type} notification for ${scheduleDate}`);
  }

  private getChannelId(notificationType: string): string {
    switch (notificationType) {
      case 'task_reminder':
        return 'task-reminders';
      case 'vaccination_due':
      case 'feeding_time':
        return 'health-alerts';
      case 'harvest_ready':
        return 'harvest-notifications';
      default:
        return 'task-reminders';
    }
  }

  async showLocalNotification(payload: NotificationPayload): Promise<void> {
    const channelId = this.getChannelId(payload.type);
    
    PushNotification.localNotification({
      id: payload.id,
      title: payload.title,
      message: payload.message,
      userInfo: {
        type: payload.type,
        entityId: payload.entityId,
        entityType: payload.entityType,
        farmId: payload.farmId,
        userId: payload.userId,
      },
      channelId,
      priority: payload.priority === 'urgent' ? 'max' : 'high',
      vibrate: true,
      playSound: true,
      soundName: 'default',
    });
  }

  async sendPushNotification(payload: NotificationPayload, targetUserIds: string[]): Promise<void> {
    try {
      // Call Firebase Cloud Function to send push notification
      const sendNotification = functions().httpsCallable('sendPushNotification');
      
      await sendNotification({
        notification: payload,
        targetUsers: targetUserIds,
      });
      
      console.log('📤 Push notification sent via Firebase Function');
    } catch (error) {
      console.error('❌ Error sending push notification:', error);
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    PushNotification.cancelLocalNotification(notificationId);
    console.log(`🚫 Cancelled notification: ${notificationId}`);
  }

  async cancelAllNotifications(): Promise<void> {
    PushNotification.cancelAllLocalNotifications();
    console.log('🚫 Cancelled all local notifications');
  }

  async getScheduledNotifications(): Promise<any[]> {
    return new Promise((resolve) => {
      PushNotification.getScheduledLocalNotifications((notifications: any) => {
        resolve(notifications);
      });
    });
  }

  getCurrentFCMToken(): string | null {
    return this.fcmToken;
  }

  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  // Smart notification scheduling based on farm data
  async scheduleSmartNotifications(user: User, animals: Animal[], crops: Crop[], tasks: Task[]): Promise<void> {
    console.log('🧠 Scheduling smart notifications...');

    // Schedule task reminders
    for (const task of tasks.filter(t => t.status === 'pending' && t.assignedTo === user.uid)) {
      const dueDate = new Date(task.dueDate);
      const reminderTime = new Date(dueDate.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
      
      if (reminderTime > new Date()) {
        await this.scheduleTaskReminder(task, reminderTime);
      }
    }

    // Schedule vaccination reminders
    for (const animal of animals) {
      for (const vaccination of animal.vaccinations) {
        if (vaccination.nextDueDate) {
          const dueDate = new Date(vaccination.nextDueDate);
          const reminderDate = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before
          
          if (reminderDate > new Date()) {
            await this.scheduleVaccinationReminder(animal, reminderDate);
          }
        }
      }
    }

    // Schedule harvest reminders
    for (const crop of crops.filter(c => c.stage !== 'harvested')) {
      await this.scheduleHarvestReminder(crop);
    }

    console.log('✅ Smart notifications scheduled');
  }
}

// Export singleton instance
export const notificationService = new NotificationService();