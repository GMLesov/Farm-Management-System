import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, PermissionsAndroid } from 'react-native';

export interface NotificationData {
  id?: string;
  title: string;
  body: string;
  data?: { [key: string]: any };
  scheduledTime?: Date;
  category?: 'weather' | 'irrigation' | 'crop' | 'financial' | 'general';
  priority?: 'low' | 'normal' | 'high';
  sound?: string;
  vibration?: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  weatherAlerts: boolean;
  irrigationReminders: boolean;
  cropNotifications: boolean;
  financialUpdates: boolean;
  sound: boolean;
  vibration: boolean;
}

class EnhancedNotificationService {
  private isInitialized = false;
  private fcmToken: string | null = null;
  private settings: NotificationSettings = {
    enabled: true,
    weatherAlerts: true,
    irrigationReminders: true,
    cropNotifications: true,
    financialUpdates: true,
    sound: true,
    vibration: true,
  };

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load saved settings
      await this.loadSettings();

      // Request permissions
      await this.requestPermissions();

      // Configure local notifications
      this.configurePushNotification();

      // Initialize Firebase messaging
      await this.initializeFirebaseMessaging();

      // Set up background handlers
      this.setupBackgroundHandlers();

      this.isInitialized = true;
      console.log('Enhanced Notification Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  private async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      } else {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        return enabled;
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  private configurePushNotification(): void {
    PushNotification.configure({
      onRegister: (token) => {
        console.log('Local notification token:', token);
      },

      onNotification: (notification) => {
        console.log('Local notification received:', notification);
        
        // Handle notification tap
        if (notification.userInteraction) {
          this.handleNotificationTap(notification);
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
      this.createNotificationChannels();
    }
  }

  private createNotificationChannels(): void {
    const channels = [
      {
        channelId: 'weather_alerts',
        channelName: 'Weather Alerts',
        channelDescription: 'Notifications for weather conditions and alerts',
        importance: 4,
        vibrate: true,
      },
      {
        channelId: 'irrigation_reminders',
        channelName: 'Irrigation Reminders',
        channelDescription: 'Reminders for irrigation schedules and tasks',
        importance: 3,
        vibrate: true,
      },
      {
        channelId: 'crop_notifications',
        channelName: 'Crop Notifications',
        channelDescription: 'Updates about crop health and growth stages',
        importance: 3,
        vibrate: false,
      },
      {
        channelId: 'financial_updates',
        channelName: 'Financial Updates',
        channelDescription: 'Financial reports and budget notifications',
        importance: 2,
        vibrate: false,
      },
      {
        channelId: 'general',
        channelName: 'General Notifications',
        channelDescription: 'General app notifications',
        importance: 2,
        vibrate: false,
      },
    ];

    channels.forEach(channel => {
      PushNotification.createChannel(channel, () => {
        console.log(`Created notification channel: ${channel.channelId}`);
      });
    });
  }

  private async initializeFirebaseMessaging(): Promise<void> {
    try {
      // Get FCM token
      this.fcmToken = await messaging().getToken();
      console.log('FCM Token:', this.fcmToken);

      // Save token to AsyncStorage and potentially send to server
      await AsyncStorage.setItem('fcm_token', this.fcmToken);

      // Listen for token refresh
      messaging().onTokenRefresh(async (token) => {
        this.fcmToken = token;
        await AsyncStorage.setItem('fcm_token', token);
        console.log('FCM Token refreshed:', token);
      });

      // Handle foreground messages
      messaging().onMessage(async (remoteMessage) => {
        console.log('Foreground message received:', remoteMessage);
        this.handleForegroundMessage(remoteMessage);
      });

    } catch (error) {
      console.error('Firebase messaging initialization failed:', error);
    }
  }

  private setupBackgroundHandlers(): void {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message received:', remoteMessage);
      // Process the message and potentially trigger local notification
      this.handleBackgroundMessage(remoteMessage);
    });

    // Handle notification opening app
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('App opened by notification:', remoteMessage);
      this.handleNotificationTap(remoteMessage);
    });

    // Check if app was opened by notification
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('App opened from quit state by notification:', remoteMessage);
          this.handleNotificationTap(remoteMessage);
        }
      });
  }

  private handleForegroundMessage(remoteMessage: FirebaseMessagingTypes.RemoteMessage): void {
    if (!this.settings.enabled) return;

    const { notification, data } = remoteMessage;
    
    if (notification) {
      this.showLocalNotification({
        title: notification.title || 'Farm Management',
        body: notification.body || '',
        data: data || {},
        category: this.getCategoryFromData(data),
      });
    }
  }

  private handleBackgroundMessage(remoteMessage: FirebaseMessagingTypes.RemoteMessage): void {
    // Process background message if needed
    console.log('Processing background message:', remoteMessage);
  }

  private handleNotificationTap(notification: any): void {
    console.log('Notification tapped:', notification);
    
    // Navigate to appropriate screen based on notification data
    const data = notification.data || {};
    
    // This would integrate with your navigation system
    // For example: NavigationService.navigate(data.screen, data.params);
  }

  private getCategoryFromData(data: any): NotificationData['category'] {
    if (data?.category) {
      return data.category as NotificationData['category'];
    }
    return 'general';
  }

  // Public methods
  async showLocalNotification(notification: NotificationData): Promise<void> {
    if (!this.settings.enabled) return;

    const category = notification.category || 'general';
    
    // Check if this category is enabled
    if (!this.isCategoryEnabled(category)) return;

    const notificationId = notification.id || Date.now().toString();

    PushNotification.localNotification({
      id: notificationId,
      title: notification.title,
      message: notification.body,
      userInfo: notification.data || {},
      channelId: this.getChannelId(category),
      playSound: this.settings.sound && (notification.sound !== undefined ? !!notification.sound : true),
      vibrate: this.settings.vibration && (notification.vibration !== undefined ? notification.vibration : true),
      priority: this.getPriority(notification.priority),
      importance: this.getImportance(notification.priority),
    });
  }

  async scheduleNotification(notification: NotificationData): Promise<void> {
    if (!this.settings.enabled || !notification.scheduledTime) return;

    const category = notification.category || 'general';
    if (!this.isCategoryEnabled(category)) return;

    const notificationId = notification.id || Date.now().toString();

    PushNotification.localNotificationSchedule({
      id: notificationId,
      title: notification.title,
      message: notification.body,
      date: notification.scheduledTime,
      userInfo: notification.data || {},
      channelId: this.getChannelId(category),
      playSound: this.settings.sound,
      vibrate: this.settings.vibration,
    });
  }

  async cancelNotification(notificationId: string): Promise<void> {
    PushNotification.cancelLocalNotifications({ id: notificationId });
  }

  async cancelAllNotifications(): Promise<void> {
    PushNotification.cancelAllLocalNotifications();
  }

  async getScheduledNotifications(): Promise<any[]> {
    return new Promise((resolve) => {
      PushNotification.getScheduledLocalNotifications(resolve);
    });
  }

  // Settings management
  async updateSettings(newSettings: Partial<NotificationSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await AsyncStorage.setItem('notification_settings', JSON.stringify(this.settings));
  }

  async getSettings(): Promise<NotificationSettings> {
    return { ...this.settings };
  }

  private async loadSettings(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('notification_settings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }

  private isCategoryEnabled(category: NotificationData['category']): boolean {
    switch (category) {
      case 'weather':
        return this.settings.weatherAlerts;
      case 'irrigation':
        return this.settings.irrigationReminders;
      case 'crop':
        return this.settings.cropNotifications;
      case 'financial':
        return this.settings.financialUpdates;
      default:
        return true;
    }
  }

  private getChannelId(category: NotificationData['category']): string {
    switch (category) {
      case 'weather':
        return 'weather_alerts';
      case 'irrigation':
        return 'irrigation_reminders';
      case 'crop':
        return 'crop_notifications';
      case 'financial':
        return 'financial_updates';
      default:
        return 'general';
    }
  }

  private getPriority(priority?: NotificationData['priority']): 'low' | 'high' | 'max' | 'min' | 'default' {
    switch (priority) {
      case 'high':
        return 'high';
      case 'low':
        return 'low';
      default:
        return 'default';
    }
  }

  private getImportance(priority?: NotificationData['priority']): 'low' | 'high' | 'max' | 'min' | 'default' | 'none' | 'unspecified' {
    switch (priority) {
      case 'high':
        return 'high';
      case 'low':
        return 'low';
      default:
        return 'default';
    }
  }

  // Utility methods for farm-specific notifications
  async sendWeatherAlert(title: string, message: string, severity: 'low' | 'medium' | 'high' = 'medium'): Promise<void> {
    await this.showLocalNotification({
      title,
      body: message,
      category: 'weather',
      priority: severity === 'high' ? 'high' : 'normal',
      sound: severity === 'high' ? 'default' : undefined,
      vibration: severity === 'high',
    });
  }

  async sendIrrigationReminder(fieldName: string, scheduledTime: Date): Promise<void> {
    await this.scheduleNotification({
      title: 'Irrigation Reminder',
      body: `Time to irrigate ${fieldName}`,
      category: 'irrigation',
      scheduledTime,
      priority: 'normal',
    });
  }

  async sendCropAlert(cropName: string, message: string, actionRequired: boolean = false): Promise<void> {
    await this.showLocalNotification({
      title: `${cropName} Alert`,
      body: message,
      category: 'crop',
      priority: actionRequired ? 'high' : 'normal',
      vibration: actionRequired,
    });
  }

  async sendFinancialUpdate(title: string, message: string): Promise<void> {
    await this.showLocalNotification({
      title,
      body: message,
      category: 'financial',
      priority: 'low',
      sound: undefined,
      vibration: false,
    });
  }

  getFCMToken(): string | null {
    return this.fcmToken;
  }
}

export const enhancedNotificationService = new EnhancedNotificationService();