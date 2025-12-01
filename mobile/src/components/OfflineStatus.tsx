import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Card, IconButton, Chip, ProgressBar } from 'react-native-paper';
import SyncManager, { SyncStatus } from '../services/SyncManager';
import OfflineStatusIndicator from './OfflineStatusIndicator';

interface OfflineStatusProps {
  style?: any;
}

export const OfflineStatusBar: React.FC<OfflineStatusProps> = ({ style }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    isOnline: true,
    lastSyncTime: null,
    queuedActions: 0,
  });

  useEffect(() => {
    const syncManager = SyncManager.getInstance();
    syncManager.initialize();
    const unsubscribe = syncManager.addSyncListener(setSyncStatus);
    syncManager.getSyncStatus().then(setSyncStatus);
    return () => unsubscribe();
  }, []);

  const handleManualSync = async () => {
    const syncManager = SyncManager.getInstance();
    await syncManager.forceSync();
  };

  const getStatusInfo = () => {
    if (!syncStatus.isOnline) return { label: 'Offline', color: '#f44336', icon: 'wifi-off' };
    if (syncStatus.isSyncing) return { label: 'Syncing...', color: '#ff9800', icon: 'sync' };
    if (syncStatus.queuedActions > 0) return { label: `${syncStatus.queuedActions} pending`, color: '#ff9800', icon: 'sync-problem' };
    return { label: 'Online', color: '#4caf50', icon: 'wifi' };
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={[styles.container, style]}>
      <Card style={[styles.card, { borderLeftColor: statusInfo.color }]}>
        <View style={styles.content}>
          <View style={styles.statusRow}>
            <IconButton 
              icon={statusInfo.icon} 
              size={20} 
              iconColor={statusInfo.color}
            />
            <View style={styles.statusInfo}>
              <Text style={styles.statusLabel}>Connection Status</Text>
              <Chip 
                mode="outlined"
                textStyle={{ color: statusInfo.color }}
                style={{ borderColor: statusInfo.color }}
              >
                {statusInfo.label}
              </Chip>
            </View>
          </View>

          {syncStatus.isSyncing && (
            <ProgressBar 
              indeterminate 
              color={statusInfo.color}
              style={styles.progressBar}
            />
          )}

          <View style={styles.actions}>
            <Button
              mode="outlined"
              onPress={handleManualSync}
              disabled={syncStatus.isSyncing || !syncStatus.isOnline}
              compact
            >
              {syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
          </View>
        </View>
      </Card>
    </View>
  );
};

export const OfflineFloatingStatus: React.FC = () => {
  return <OfflineStatusIndicator />;
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  card: {
    borderLeftWidth: 4,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusInfo: {
    flex: 1,
    marginLeft: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    marginVertical: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
});

export default OfflineStatusBar;