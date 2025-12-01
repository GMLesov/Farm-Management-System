import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { Surface, Button, Snackbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SyncManager, { SyncStatus } from '../services/SyncManager';

const OfflineStatusIndicator: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    isOnline: true,
    lastSyncTime: null,
    queuedActions: 0,
  });
  const [showDetails, setShowDetails] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [showSyncSnackbar, setShowSyncSnackbar] = useState(false);

  useEffect(() => {
    const syncManager = SyncManager.getInstance();
    
    // Subscribe to sync status updates
    const unsubscribe = syncManager.addSyncListener((status) => {
      setSyncStatus(status);
      
      // Animate when status changes
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });

    // Get initial status
    syncManager.getSyncStatus().then(setSyncStatus);

    return unsubscribe;
  }, [fadeAnim]);

  const handleManualSync = async () => {
    const syncManager = SyncManager.getInstance();
    const result = await syncManager.forceSync();
    
    if (result.success > 0 || result.failed > 0) {
      setShowSyncSnackbar(true);
    }
  };

  const getStatusColor = () => {
    if (!syncStatus.isOnline) return '#f44336'; // Red for offline
    if (syncStatus.isSyncing) return '#ff9800'; // Orange for syncing
    if (syncStatus.queuedActions > 0) return '#ff9800'; // Orange for pending sync
    return '#4caf50'; // Green for online and synced
  };

  const getStatusIcon = () => {
    if (!syncStatus.isOnline) return 'wifi-off';
    if (syncStatus.isSyncing) return 'sync';
    if (syncStatus.queuedActions > 0) return 'sync-problem';
    return 'wifi';
  };

  const getStatusText = () => {
    if (!syncStatus.isOnline) return 'Offline';
    if (syncStatus.isSyncing) return 'Syncing...';
    if (syncStatus.queuedActions > 0) return `${syncStatus.queuedActions} pending`;
    return 'Online';
  };

  const formatLastSyncTime = () => {
    if (!syncStatus.lastSyncTime) return 'Never';
    
    const now = Date.now();
    const diff = now - syncStatus.lastSyncTime;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  if (syncStatus.isOnline && syncStatus.queuedActions === 0 && !syncStatus.isSyncing) {
    // Don't show indicator when everything is normal
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.wrapper, { opacity: fadeAnim }]}>
        <TouchableOpacity
          onPress={() => setShowDetails(!showDetails)}
          activeOpacity={0.8}
        >
          <Surface style={[styles.indicator, { backgroundColor: getStatusColor() }]}>
            <Icon 
              name={getStatusIcon()} 
              size={16} 
              color="white" 
              style={syncStatus.isSyncing ? styles.spinningIcon : undefined}
            />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </Surface>
        </TouchableOpacity>

        {showDetails && (
          <Surface style={styles.detailsPanel}>
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>Sync Status</Text>
              <TouchableOpacity onPress={() => setShowDetails(false)}>
                <Icon name="close" size={20} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.detailsContent}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Connection:</Text>
                <View style={styles.detailValue}>
                  <Icon 
                    name={syncStatus.isOnline ? 'wifi' : 'wifi-off'} 
                    size={16} 
                    color={syncStatus.isOnline ? '#4caf50' : '#f44336'} 
                  />
                  <Text style={[styles.detailText, { 
                    color: syncStatus.isOnline ? '#4caf50' : '#f44336' 
                  }]}>
                    {syncStatus.isOnline ? 'Online' : 'Offline'}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Pending Actions:</Text>
                <Text style={styles.detailText}>{syncStatus.queuedActions}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Last Sync:</Text>
                <Text style={styles.detailText}>{formatLastSyncTime()}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={[styles.detailText, { 
                  color: syncStatus.isSyncing ? '#ff9800' : '#666' 
                }]}>
                  {syncStatus.isSyncing ? 'Syncing...' : 'Idle'}
                </Text>
              </View>
            </View>

            <View style={styles.detailsActions}>
              <Button
                mode="outlined"
                onPress={handleManualSync}
                disabled={syncStatus.isSyncing || !syncStatus.isOnline}
                style={styles.syncButton}
                compact
              >
                {syncStatus.isSyncing ? 'Syncing...' : 'Force Sync'}
              </Button>
            </View>
          </Surface>
        )}
      </Animated.View>

      <Snackbar
        visible={showSyncSnackbar}
        onDismiss={() => setShowSyncSnackbar(false)}
        duration={3000}
        style={styles.snackbar}
      >
        Sync completed successfully
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 1000,
  },
  wrapper: {
    alignItems: 'flex-end',
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  spinningIcon: {
    // Add rotation animation if needed
  },
  detailsPanel: {
    marginTop: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    minWidth: 200,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  detailsContent: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  detailValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  detailsActions: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  syncButton: {
    alignSelf: 'flex-end',
  },
  snackbar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
});

export default OfflineStatusIndicator;