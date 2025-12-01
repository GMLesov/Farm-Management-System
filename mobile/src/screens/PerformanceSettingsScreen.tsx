import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import {
  Card,
  Text,
  Switch,
  Button,
  Divider,
  List,
  ProgressBar,
  Chip,
  IconButton,
} from 'react-native-paper';
import { enhancedNotificationService, NotificationSettings } from '../services/enhancedNotificationService';
import { enhancedSyncManager, SyncStats } from '../services/enhancedSyncManager';
import { performanceMonitor, ScreenMetrics, AppMetrics } from '../services/performanceMonitor';

export const PerformanceSettingsScreen: React.FC = () => {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    enabled: true,
    weatherAlerts: true,
    irrigationReminders: true,
    cropNotifications: true,
    financialUpdates: true,
    sound: true,
    vibration: true,
  });

  const [syncStats, setSyncStats] = useState<SyncStats>({
    totalJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    pendingJobs: 0,
    lastSyncTime: null,
    syncInProgress: false,
  });

  const [appMetrics, setAppMetrics] = useState<AppMetrics>({
    appStartTime: 0,
    totalScreens: 0,
    averageScreenLoadTime: 0,
    crashCount: 0,
    totalSessions: 0,
    averageSessionDuration: 0,
  });

  const [slowestScreens, setSlowestScreens] = useState<ScreenMetrics[]>([]);

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await enhancedNotificationService.getSettings();
      setNotificationSettings(settings);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const loadStats = () => {
    try {
      const stats = enhancedSyncManager.getSyncStats();
      setSyncStats(stats);

      const metrics = performanceMonitor.getAppMetrics();
      setAppMetrics(metrics);

      const slowScreens = performanceMonitor.getSlowestScreens(5);
      setSlowestScreens(slowScreens);
    } catch (error) {
      console.error('Failed to load performance stats:', error);
    }
  };

  const updateNotificationSetting = async (key: keyof NotificationSettings, value: boolean) => {
    try {
      const newSettings = { ...notificationSettings, [key]: value };
      setNotificationSettings(newSettings);
      await enhancedNotificationService.updateSettings({ [key]: value });
    } catch (error) {
      console.error('Failed to update notification setting:', error);
    }
  };

  const handleForcSync = async () => {
    try {
      await enhancedSyncManager.forceSyncNow();
      loadStats();
      Alert.alert('Success', 'Sync completed successfully');
    } catch (error) {
      Alert.alert('Error', 'Sync failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data and performance metrics. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await enhancedSyncManager.clearSyncQueue();
              await performanceMonitor.clearMetrics();
              loadStats();
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear cache');
            }
          },
        },
      ]
    );
  };

  const handleExportMetrics = async () => {
    try {
      const metrics = await performanceMonitor.exportMetrics();
      console.log('Performance Metrics Export:', metrics);
      Alert.alert('Export', 'Metrics exported to console');
    } catch (error) {
      Alert.alert('Error', 'Failed to export metrics');
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatDateTime = (date: Date | null): string => {
    if (!date) return 'Never';
    return date.toLocaleString();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Notification Settings */}
      <Card style={styles.card}>
        <Card.Title title="Notification Settings" />
        <Card.Content>
          <List.Item
            title="Enable Notifications"
            right={() => (
              <Switch
                value={notificationSettings.enabled}
                onValueChange={(value) => updateNotificationSetting('enabled', value)}
              />
            )}
          />
          <Divider />
          
          <List.Item
            title="Weather Alerts"
            description="Receive notifications for weather conditions"
            right={() => (
              <Switch
                value={notificationSettings.weatherAlerts}
                onValueChange={(value) => updateNotificationSetting('weatherAlerts', value)}
                disabled={!notificationSettings.enabled}
              />
            )}
          />
          
          <List.Item
            title="Irrigation Reminders"
            description="Get reminders for irrigation schedules"
            right={() => (
              <Switch
                value={notificationSettings.irrigationReminders}
                onValueChange={(value) => updateNotificationSetting('irrigationReminders', value)}
                disabled={!notificationSettings.enabled}
              />
            )}
          />
          
          <List.Item
            title="Crop Notifications"
            description="Updates about crop health and growth"
            right={() => (
              <Switch
                value={notificationSettings.cropNotifications}
                onValueChange={(value) => updateNotificationSetting('cropNotifications', value)}
                disabled={!notificationSettings.enabled}
              />
            )}
          />
          
          <List.Item
            title="Financial Updates"
            description="Financial reports and budget notifications"
            right={() => (
              <Switch
                value={notificationSettings.financialUpdates}
                onValueChange={(value) => updateNotificationSetting('financialUpdates', value)}
                disabled={!notificationSettings.enabled}
              />
            )}
          />
          
          <Divider />
          
          <List.Item
            title="Sound"
            right={() => (
              <Switch
                value={notificationSettings.sound}
                onValueChange={(value) => updateNotificationSetting('sound', value)}
                disabled={!notificationSettings.enabled}
              />
            )}
          />
          
          <List.Item
            title="Vibration"
            right={() => (
              <Switch
                value={notificationSettings.vibration}
                onValueChange={(value) => updateNotificationSetting('vibration', value)}
                disabled={!notificationSettings.enabled}
              />
            )}
          />
        </Card.Content>
      </Card>

      {/* Sync Status */}
      <Card style={styles.card}>
        <Card.Title 
          title="Background Sync" 
          right={(props) => (
            <IconButton
              {...props}
              icon="refresh"
              onPress={loadStats}
            />
          )}
        />
        <Card.Content>
          <View style={styles.syncStats}>
            <View style={styles.statItem}>
              <Text variant="bodyLarge">{syncStats.pendingJobs}</Text>
              <Text variant="bodySmall">Pending</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="bodyLarge">{syncStats.completedJobs}</Text>
              <Text variant="bodySmall">Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="bodyLarge">{syncStats.failedJobs}</Text>
              <Text variant="bodySmall">Failed</Text>
            </View>
          </View>
          
          <Text variant="bodySmall" style={styles.lastSync}>
            Last sync: {formatDateTime(syncStats.lastSyncTime)}
          </Text>
          
          {syncStats.syncInProgress && (
            <View style={styles.syncProgress}>
              <ProgressBar indeterminate />
              <Text variant="bodySmall" style={styles.syncText}>Syncing...</Text>
            </View>
          )}
          
          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={handleForcSync}
              disabled={syncStats.syncInProgress}
              style={styles.button}
            >
              Force Sync
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Performance Metrics */}
      <Card style={styles.card}>
        <Card.Title title="Performance Metrics" />
        <Card.Content>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text variant="headlineSmall">{appMetrics.totalSessions}</Text>
              <Text variant="bodySmall">Total Sessions</Text>
            </View>
            <View style={styles.metricItem}>
              <Text variant="headlineSmall">{appMetrics.totalScreens}</Text>
              <Text variant="bodySmall">Screens Loaded</Text>
            </View>
            <View style={styles.metricItem}>
              <Text variant="headlineSmall">
                {formatDuration(appMetrics.averageScreenLoadTime)}
              </Text>
              <Text variant="bodySmall">Avg Load Time</Text>
            </View>
            <View style={styles.metricItem}>
              <Text variant="headlineSmall">{appMetrics.crashCount}</Text>
              <Text variant="bodySmall">Crashes</Text>
            </View>
          </View>
          
          {slowestScreens.length > 0 && (
            <>
              <Divider style={styles.divider} />
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Slowest Screens
              </Text>
              {slowestScreens.map((screen, index) => (
                <View key={index} style={styles.screenItem}>
                  <Text variant="bodyMedium">{screen.screenName}</Text>
                  <Chip compact>{formatDuration(screen.loadTime)}</Chip>
                </View>
              ))}
            </>
          )}
        </Card.Content>
      </Card>

      {/* Actions */}
      <Card style={styles.card}>
        <Card.Title title="Actions" />
        <Card.Content>
          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={handleExportMetrics}
              style={styles.button}
              icon="download"
            >
              Export Metrics
            </Button>
            <Button
              mode="outlined"
              onPress={handleClearCache}
              style={[styles.button, styles.dangerButton]}
              icon="delete"
            >
              Clear Cache
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  syncStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  lastSync: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  syncProgress: {
    marginVertical: 16,
  },
  syncText: {
    textAlign: 'center',
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  dangerButton: {
    borderColor: '#d32f2f',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    alignItems: 'center',
    marginVertical: 8,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  screenItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
});