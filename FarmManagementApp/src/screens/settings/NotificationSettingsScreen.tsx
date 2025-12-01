import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Switch,
  List,
  Button,
  Text,
  Chip,
  IconButton,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { notificationService, NotificationPayload } from '../../services/notificationService';
import { 
  updateNotificationSettings,
  fetchNotificationHistory,
  clearNotificationHistory,
} from '../../store/slices/notificationSlice';

interface NotificationSettings {
  taskReminders: boolean;
  vaccinationAlerts: boolean;
  harvestNotifications: boolean;
  feedingReminders: boolean;
  weatherAlerts: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  reminderTime: number; // hours before due
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM
    end: string; // HH:MM
  };
}

const NotificationSettingsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { settings, history, loading } = useSelector((state: RootState) => state.notifications);
  
  const [localSettings, setLocalSettings] = useState<NotificationSettings>({
    taskReminders: true,
    vaccinationAlerts: true,
    harvestNotifications: true,
    feedingReminders: true,
    weatherAlerts: true,
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: false,
    reminderTime: 2, // 2 hours before
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00',
    },
  });

  const [scheduledNotifications, setScheduledNotifications] = useState<any[]>([]);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  useEffect(() => {
    loadNotificationData();
  }, []);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const loadNotificationData = async () => {
    try {
      // Load FCM token
      const token = notificationService.getCurrentFCMToken();
      setFcmToken(token);

      // Load scheduled notifications
      const scheduled = await notificationService.getScheduledNotifications();
      setScheduledNotifications(scheduled);

      // Load notification history
      if (user?.uid) {
        dispatch(fetchNotificationHistory(user.uid));
      }
    } catch (error) {
      console.error('Error loading notification data:', error);
    }
  };

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean | number) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleQuietHoursChange = (key: keyof NotificationSettings['quietHours'], value: boolean | string) => {
    setLocalSettings(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [key]: value,
      },
    }));
  };

  const saveSettings = async () => {
    try {
      await dispatch(updateNotificationSettings(localSettings));
      Alert.alert('Success', 'Notification settings saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save notification settings');
    }
  };

  const testNotification = async () => {
    try {
      const testPayload: NotificationPayload = {
        id: `test_${Date.now()}`,
        title: '🧪 Test Notification',
        message: 'This is a test notification from your Farm Management App',
        type: 'general',
        priority: 'normal',
        farmId: user?.farmId || '',
        userId: user?.uid || '',
      };

      await notificationService.showLocalNotification(testPayload);
      Alert.alert('Test Sent', 'Check your notifications to see the test message');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const clearAllNotifications = async () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to cancel all scheduled notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await notificationService.cancelAllNotifications();
            setScheduledNotifications([]);
            Alert.alert('Success', 'All notifications cleared');
          },
        },
      ]
    );
  };

  const clearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear the notification history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            if (user?.uid) {
              dispatch(clearNotificationHistory(user.uid));
            }
          },
        },
      ]
    );
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'task_reminder': return '#2196F3';
      case 'vaccination_due': return '#F44336';
      case 'harvest_ready': return '#4CAF50';
      case 'feeding_time': return '#FF9800';
      case 'weather_alert': return '#9C27B0';
      default: return '#757575';
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case 'task_reminder': return 'clipboard-check';
      case 'vaccination_due': return 'medical-bag';
      case 'harvest_ready': return 'food-variant';
      case 'feeding_time': return 'food';
      case 'weather_alert': return 'weather-cloudy';
      default: return 'bell';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading notification settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Notification Types */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>📱 Notification Types</Title>
          
          <List.Item
            title="Task Reminders"
            description="Get reminded about upcoming tasks"
            left={() => <List.Icon icon="clipboard-check" />}
            right={() => (
              <Switch
                value={localSettings.taskReminders}
                onValueChange={(value) => handleSettingChange('taskReminders', value)}
              />
            )}
          />
          
          <List.Item
            title="Vaccination Alerts"
            description="Animal vaccination due dates"
            left={() => <List.Icon icon="medical-bag" />}
            right={() => (
              <Switch
                value={localSettings.vaccinationAlerts}
                onValueChange={(value) => handleSettingChange('vaccinationAlerts', value)}
              />
            )}
          />
          
          <List.Item
            title="Harvest Notifications"
            description="Crop harvest readiness alerts"
            left={() => <List.Icon icon="food-variant" />}
            right={() => (
              <Switch
                value={localSettings.harvestNotifications}
                onValueChange={(value) => handleSettingChange('harvestNotifications', value)}
              />
            )}
          />
          
          <List.Item
            title="Feeding Reminders"
            description="Animal feeding schedule alerts"
            left={() => <List.Icon icon="food" />}
            right={() => (
              <Switch
                value={localSettings.feedingReminders}
                onValueChange={(value) => handleSettingChange('feedingReminders', value)}
              />
            )}
          />
          
          <List.Item
            title="Weather Alerts"
            description="Important weather notifications"
            left={() => <List.Icon icon="weather-cloudy" />}
            right={() => (
              <Switch
                value={localSettings.weatherAlerts}
                onValueChange={(value) => handleSettingChange('weatherAlerts', value)}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Delivery Methods */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>📬 Delivery Methods</Title>
          
          <List.Item
            title="Push Notifications"
            description="Mobile app notifications"
            left={() => <List.Icon icon="cellphone" />}
            right={() => (
              <Switch
                value={localSettings.pushNotifications}
                onValueChange={(value) => handleSettingChange('pushNotifications', value)}
              />
            )}
          />
          
          <List.Item
            title="Email Notifications"
            description="Send notifications via email"
            left={() => <List.Icon icon="email" />}
            right={() => (
              <Switch
                value={localSettings.emailNotifications}
                onValueChange={(value) => handleSettingChange('emailNotifications', value)}
              />
            )}
          />
          
          <List.Item
            title="SMS Notifications"
            description="Text message alerts"
            left={() => <List.Icon icon="message-text" />}
            right={() => (
              <Switch
                value={localSettings.smsNotifications}
                onValueChange={(value) => handleSettingChange('smsNotifications', value)}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Timing Settings */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>⏰ Timing Settings</Title>
          
          <View style={styles.reminderTimeContainer}>
            <Text style={styles.settingLabel}>Reminder Time</Text>
            <Text style={styles.settingDescription}>
              How many hours before due date to send reminders
            </Text>
            <View style={styles.reminderTimeButtons}>
              {[1, 2, 4, 8, 24].map((hours) => (
                <Chip
                  key={hours}
                  selected={localSettings.reminderTime === hours}
                  onPress={() => handleSettingChange('reminderTime', hours)}
                  style={styles.timeChip}
                >
                  {hours}h
                </Chip>
              ))}
            </View>
          </View>
          
          <Divider style={styles.divider} />
          
          <List.Item
            title="Quiet Hours"
            description="Disable notifications during these hours"
            left={() => <List.Icon icon="sleep" />}
            right={() => (
              <Switch
                value={localSettings.quietHours.enabled}
                onValueChange={(value) => handleQuietHoursChange('enabled', value)}
              />
            )}
          />
          
          {localSettings.quietHours.enabled && (
            <View style={styles.quietHoursContainer}>
              <Text style={styles.quietHoursText}>
                From {localSettings.quietHours.start} to {localSettings.quietHours.end}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Device Information */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>📟 Device Information</Title>
          
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceLabel}>FCM Token Status:</Text>
            <Text style={styles.deviceValue}>
              {fcmToken ? '✅ Connected' : '❌ Not connected'}
            </Text>
          </View>
          
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceLabel}>Scheduled Notifications:</Text>
            <Text style={styles.deviceValue}>{scheduledNotifications.length}</Text>
          </View>
          
          <View style={styles.deviceInfo}>
            <Text style={styles.deviceLabel}>Service Status:</Text>
            <Text style={styles.deviceValue}>
              {notificationService.isServiceInitialized() ? '✅ Active' : '❌ Inactive'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>🔧 Actions</Title>
          
          <View style={styles.actionButtons}>
            <Button 
              mode="contained" 
              onPress={saveSettings}
              style={styles.actionButton}
              icon="content-save"
            >
              Save Settings
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={testNotification}
              style={styles.actionButton}
              icon="bell-ring"
            >
              Test Notification
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={clearAllNotifications}
              style={styles.actionButton}
              icon="notification-clear-all"
            >
              Clear All
            </Button>
            
            <Button 
              mode="outlined" 
              onPress={clearHistory}
              style={styles.actionButton}
              icon="history"
            >
              Clear History
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Recent Notifications History */}
      {history && history.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>📋 Recent Notifications</Title>
            
            {history.slice(0, 5).map((notification, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Chip
                    icon={getNotificationTypeIcon(notification.type)}
                    style={[
                      styles.typeChip,
                      { backgroundColor: getNotificationTypeColor(notification.type) + '20' }
                    ]}
                    textStyle={{ color: getNotificationTypeColor(notification.type) }}
                  >
                    {notification.type.replace('_', ' ')}
                  </Chip>
                  <Text style={styles.historyTime}>
                    {new Date(notification.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.historyTitle}>{notification.title}</Text>
                <Text style={styles.historyMessage}>{notification.message}</Text>
                {index < history.slice(0, 5).length - 1 && <Divider style={styles.historyDivider} />}
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  reminderTimeContainer: {
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  reminderTimeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    marginRight: 8,
  },
  divider: {
    marginVertical: 16,
  },
  quietHoursContainer: {
    paddingLeft: 56,
    paddingVertical: 8,
  },
  quietHoursText: {
    fontSize: 14,
    color: '#666',
  },
  deviceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  deviceLabel: {
    fontSize: 14,
    color: '#666',
  },
  deviceValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    marginVertical: 4,
  },
  historyItem: {
    paddingVertical: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeChip: {
    height: 28,
  },
  historyTime: {
    fontSize: 12,
    color: '#666',
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  historyMessage: {
    fontSize: 13,
    color: '#666',
  },
  historyDivider: {
    marginTop: 12,
  },
});

export default NotificationSettingsScreen;