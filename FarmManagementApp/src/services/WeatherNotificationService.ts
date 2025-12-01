// Weather Notification Service
// Handles push notifications and alerts for weather-related farming intelligence

import { Alert } from 'react-native';

export interface WeatherNotification {
  id: string;
  type: 'weather_alert' | 'farming_recommendation' | 'critical_warning' | 'daily_summary';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  data: any;
  scheduledTime?: number;
  expiresAt?: number;
  actionRequired?: boolean;
  farmingContext?: {
    crops?: string[];
    animals?: string[];
    operations?: string[];
  };
}

export interface NotificationPreferences {
  enabled: boolean;
  weatherAlerts: boolean;
  farmingRecommendations: boolean;
  criticalWarnings: boolean;
  dailySummary: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string; // "06:00"
  };
  minimumPriority: 'low' | 'medium' | 'high' | 'critical';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

class WeatherNotificationService {
  private notifications: WeatherNotification[] = [];
  private preferences: NotificationPreferences = {
    enabled: true,
    weatherAlerts: true,
    farmingRecommendations: true,
    criticalWarnings: true,
    dailySummary: true,
    quietHours: {
      enabled: true,
      startTime: '22:00',
      endTime: '06:00',
    },
    minimumPriority: 'medium',
    soundEnabled: true,
    vibrationEnabled: true,
  };

  // Initialize notification service
  async initialize(): Promise<void> {
    try {
      // In production, initialize push notification service
      // Request permissions, register device token, etc.
      console.log('Weather notification service initialized');
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  }

  // Set notification preferences
  setPreferences(prefs: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...prefs };
  }

  // Get current preferences
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  // Send a weather notification
  async sendNotification(notification: Omit<WeatherNotification, 'id'>): Promise<string> {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullNotification: WeatherNotification = {
      ...notification,
      id,
    };

    // Check if notifications are enabled
    if (!this.preferences.enabled) {
      return id;
    }

    // Check notification type preferences
    if (!this.shouldSendNotification(fullNotification)) {
      return id;
    }

    // Check quiet hours
    if (this.isQuietHours() && notification.priority !== 'critical') {
      // Schedule for later or skip
      this.scheduleNotification(fullNotification);
      return id;
    }

    // Check minimum priority
    if (!this.meetsPriorityThreshold(notification.priority)) {
      return id;
    }

    // Store notification
    this.notifications.push(fullNotification);

    // Send the notification
    await this.deliverNotification(fullNotification);

    return id;
  }

  // Schedule a notification for later delivery
  private scheduleNotification(notification: WeatherNotification): void {
    // In production, use a scheduling service
    console.log('Notification scheduled:', notification.title);
  }

  // Deliver the actual notification
  private async deliverNotification(notification: WeatherNotification): Promise<void> {
    try {
      // In production, use push notification service (Firebase, etc.)
      // For now, use React Native Alert for demonstration
      
      if (notification.priority === 'critical') {
        Alert.alert(
          '🚨 ' + notification.title,
          notification.message,
          [
            { text: 'Dismiss', style: 'cancel' },
            { text: 'View Details', onPress: () => this.handleNotificationAction(notification) },
          ],
          { cancelable: false }
        );
      } else {
        // In production, show as push notification
        console.log(`📱 Weather Notification: ${notification.title} - ${notification.message}`);
      }
    } catch (error) {
      console.error('Failed to deliver notification:', error);
    }
  }

  // Handle notification tap/action
  private handleNotificationAction(notification: WeatherNotification): void {
    // In production, navigate to relevant screen or perform action
    console.log('Notification action:', notification.id, notification.data);
  }

  // Check if notification should be sent based on preferences
  private shouldSendNotification(notification: WeatherNotification): boolean {
    switch (notification.type) {
      case 'weather_alert':
        return this.preferences.weatherAlerts;
      case 'farming_recommendation':
        return this.preferences.farmingRecommendations;
      case 'critical_warning':
        return this.preferences.criticalWarnings;
      case 'daily_summary':
        return this.preferences.dailySummary;
      default:
        return true;
    }
  }

  // Check if current time is within quiet hours
  private isQuietHours(): boolean {
    if (!this.preferences.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = this.preferences.quietHours.startTime.split(':').map(Number);
    const [endHour, endMin] = this.preferences.quietHours.endTime.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime > endTime) {
      // Quiet hours cross midnight
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  }

  // Check if notification meets minimum priority threshold
  private meetsPriorityThreshold(priority: string): boolean {
    const priorityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const minLevel = priorityLevels[this.preferences.minimumPriority as keyof typeof priorityLevels];
    const notificationLevel = priorityLevels[priority as keyof typeof priorityLevels];
    
    return notificationLevel >= minLevel;
  }

  // Send weather alert notification
  async sendWeatherAlert(
    title: string,
    message: string,
    severity: 'minor' | 'moderate' | 'severe' | 'extreme',
    weatherData?: any
  ): Promise<string> {
    const priorityMap = {
      minor: 'low' as const,
      moderate: 'medium' as const,
      severe: 'high' as const,
      extreme: 'critical' as const,
    };

    return this.sendNotification({
      type: 'weather_alert',
      priority: priorityMap[severity],
      title: `Weather Alert: ${title}`,
      message,
      data: { severity, weatherData },
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      actionRequired: severity === 'extreme' || severity === 'severe',
    });
  }

  // Send farming recommendation notification
  async sendFarmingRecommendation(
    title: string,
    description: string,
    priority: 'low' | 'medium' | 'high' | 'critical',
    recommendationData?: any
  ): Promise<string> {
    return this.sendNotification({
      type: 'farming_recommendation',
      priority,
      title: `Farming Recommendation: ${title}`,
      message: description,
      data: recommendationData,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
      actionRequired: priority === 'critical' || priority === 'high',
      farmingContext: {
        crops: recommendationData?.cropTypes || [],
        animals: recommendationData?.animalTypes || [],
        operations: [recommendationData?.type || 'general'],
      },
    });
  }

  // Send critical warning notification
  async sendCriticalWarning(
    title: string,
    message: string,
    urgency: 'immediate' | 'expected' | 'future',
    warningData?: any
  ): Promise<string> {
    const priorityMap = {
      immediate: 'critical' as const,
      expected: 'high' as const,
      future: 'medium' as const,
    };

    return this.sendNotification({
      type: 'critical_warning',
      priority: priorityMap[urgency],
      title: `⚠️ Critical Warning: ${title}`,
      message,
      data: { urgency, ...warningData },
      expiresAt: Date.now() + (48 * 60 * 60 * 1000), // 48 hours
      actionRequired: true,
    });
  }

  // Send daily weather summary
  async sendDailySummary(
    weatherData: any,
    recommendations: any[],
    farmProfile: any
  ): Promise<string> {
    const highPriorityRecs = recommendations.filter(rec => 
      rec.priority === 'critical' || rec.priority === 'high'
    ).length;

    const summaryMessage = this.createDailySummaryMessage(weatherData, recommendations, highPriorityRecs);

    return this.sendNotification({
      type: 'daily_summary',
      priority: highPriorityRecs > 0 ? 'medium' : 'low',
      title: '🌤️ Daily Farm Weather Summary',
      message: summaryMessage,
      data: { weatherData, recommendations, farmProfile },
      scheduledTime: this.getNextDailySummaryTime(),
    });
  }

  // Create daily summary message
  private createDailySummaryMessage(
    weatherData: any,
    recommendations: any[],
    highPriorityCount: number
  ): string {
    const temp = Math.round(weatherData.current?.temperature || 0);
    const condition = weatherData.current?.condition || 'Unknown';
    const precipProb = Math.round(weatherData.agriculture?.precipitationProbability || 0);

    let message = `Today: ${temp}°C, ${condition}. Rain chance: ${precipProb}%.`;

    if (highPriorityCount > 0) {
      message += ` ${highPriorityCount} urgent farming recommendations available.`;
    } else if (recommendations.length > 0) {
      message += ` ${recommendations.length} farming suggestions available.`;
    } else {
      message += ' No specific actions needed today.';
    }

    return message;
  }

  // Get next daily summary time (typically morning)
  private getNextDailySummaryTime(): number {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(7, 0, 0, 0); // 7:00 AM
    return tomorrow.getTime();
  }

  // Get all notifications
  getNotifications(): WeatherNotification[] {
    return [...this.notifications];
  }

  // Get unread notifications count
  getUnreadCount(): number {
    // In production, track read status
    return this.notifications.filter(n => 
      !n.expiresAt || n.expiresAt > Date.now()
    ).length;
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    // In production, update read status
    console.log('Notification marked as read:', notificationId);
  }

  // Clear expired notifications
  clearExpired(): void {
    const now = Date.now();
    this.notifications = this.notifications.filter(n => 
      !n.expiresAt || n.expiresAt > now
    );
  }

  // Test notification system
  async testNotification(): Promise<void> {
    await this.sendNotification({
      type: 'weather_alert',
      priority: 'medium',
      title: 'Test Notification',
      message: 'This is a test notification from the weather service.',
      data: { test: true },
    });
  }
}

export default new WeatherNotificationService();