import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Surface,
  Card,
  Title,
  Text,
  Button,
  IconButton,
  Chip,
  ProgressBar,
  FAB,
  Portal,
  Modal,
  Searchbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { smartIrrigationService, IrrigationZone, IrrigationAlert } from '../../services/SmartIrrigationService';

const { width } = Dimensions.get('window');

interface SmartIrrigationDashboardProps {
  navigation: any;
}

interface DashboardStats {
  totalZones: number;
  activeZones: number;
  currentlyIrrigating: number;
  totalWaterUsed: number;
  averageEfficiency: number;
  activeAlerts: number;
  criticalAlerts: number;
}

interface ZoneCardData {
  id: string;
  name: string;
  description: string;
  fieldId: string;
  cropId?: string;
  area: number;
  location: {
    latitude: number;
    longitude: number;
    elevation: number;
  };
  soilType: 'clay' | 'loam' | 'sand' | 'silt' | 'rocky' | 'mixed';
  soilCharacteristics: any;
  irrigationSystem: any;
  sensors: any[];
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  settings: {
    soilMoistureTarget: {
      minimum: number;
      maximum: number;
      optimal: number;
    };
    [key: string]: any;
  };
  schedule: any[];
  history: any[];
  waterBudget: any;
  alerts: any[];
  currentMoisture?: number;
  isIrrigating: boolean;
  efficiency: number;
  alertCount: number;
}

const SmartIrrigationDashboard: React.FC<SmartIrrigationDashboardProps> = ({ navigation }) => {
  const [zones, setZones] = useState<ZoneCardData[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalZones: 0,
    activeZones: 0,
    currentlyIrrigating: 0,
    totalWaterUsed: 0,
    averageEfficiency: 0,
    activeAlerts: 0,
    criticalAlerts: 0,
  });
  const [alerts, setAlerts] = useState<IrrigationAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'irrigating' | 'alerts'>('all');
  const [showQuickActions, setShowQuickActions] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      // Get system analytics
      const systemAnalytics = smartIrrigationService.getSystemAnalytics();
      
      // Get all zones with additional data
      const allZones = smartIrrigationService.getAllZones();
      const activeEvents = smartIrrigationService.getActiveIrrigationEvents();
      const systemAlerts = smartIrrigationService.getAlerts(undefined, true);

      // Process zones with additional data
      const processedZones: ZoneCardData[] = allZones.map(zone => {
        const isIrrigating = activeEvents.some(event => event.zoneId === zone.id);
        const efficiency = smartIrrigationService.calculateWaterEfficiency(zone.id);
        const zoneAlerts = smartIrrigationService.getAlerts(zone.id, true);
        const latestMoisture = smartIrrigationService.getLatestSensorReading(zone.id, 'soil_moisture');

        return {
          ...zone,
          currentMoisture: latestMoisture?.value,
          isIrrigating,
          efficiency: efficiency.applicationEfficiency,
          alertCount: zoneAlerts.length,
        };
      });

      // Update stats
      setStats({
        totalZones: systemAnalytics.system.totalZones,
        activeZones: systemAnalytics.system.activeZones,
        currentlyIrrigating: systemAnalytics.system.currentlyIrrigating,
        totalWaterUsed: systemAnalytics.water.totalUsed,
        averageEfficiency: systemAnalytics.water.averageEfficiency,
        activeAlerts: systemAnalytics.alerts.total,
        criticalAlerts: systemAnalytics.alerts.critical,
      });

      setZones(processedZones);
      setAlerts(systemAlerts);
    } catch (error) {
      console.error('Error loading irrigation dashboard data:', error);
      Alert.alert('Error', 'Failed to load irrigation data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, [loadDashboardData]);

  const handleStartIrrigation = (zoneId: string) => {
    Alert.alert(
      'Start Irrigation',
      'Do you want to start irrigation for this zone?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            try {
              await smartIrrigationService.startIrrigation(zoneId, {
                trigger: {
                  type: 'manual',
                  description: 'Manual irrigation started from dashboard',
                },
              });
              loadDashboardData();
            } catch (error) {
              Alert.alert('Error', 'Failed to start irrigation');
            }
          },
        },
      ]
    );
  };

  const handleStopIrrigation = (zoneId: string) => {
    Alert.alert(
      'Stop Irrigation',
      'Do you want to stop irrigation for this zone?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          onPress: async () => {
            try {
              await smartIrrigationService.stopIrrigation(zoneId);
              loadDashboardData();
            } catch (error) {
              Alert.alert('Error', 'Failed to stop irrigation');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#FFC107';
      case 'maintenance': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getMoistureColor = (moisture: number, target: number): string => {
    const diff = Math.abs(moisture - target);
    if (diff <= 5) return '#4CAF50'; // Good
    if (diff <= 15) return '#FF9800'; // Warning
    return '#F44336'; // Critical
  };

  const filterZones = (zones: ZoneCardData[]): ZoneCardData[] => {
    let filtered = zones;

    // Apply filter
    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(zone => zone.status === 'active');
        break;
      case 'irrigating':
        filtered = filtered.filter(zone => zone.isIrrigating);
        break;
      case 'alerts':
        filtered = filtered.filter(zone => zone.alertCount > 0);
        break;
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(zone =>
        zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        zone.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const renderStatsCard = () => (
    <Card style={styles.statsCard}>
      <Card.Content>
        <Title style={styles.sectionTitle}>System Overview</Title>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Icon name="sprinkler-variant" size={24} color="#2196F3" />
            <Text style={styles.statValue}>{stats.totalZones}</Text>
            <Text style={styles.statLabel}>Total Zones</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="check-circle" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{stats.activeZones}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="water" size={24} color="#00BCD4" />
            <Text style={styles.statValue}>{stats.currentlyIrrigating}</Text>
            <Text style={styles.statLabel}>Irrigating</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="water-outline" size={24} color="#3F51B5" />
            <Text style={styles.statValue}>{stats.totalWaterUsed.toFixed(1)}"</Text>
            <Text style={styles.statLabel}>Water Used</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon name="gauge" size={24} color="#FF9800" />
            <Text style={styles.statValue}>{stats.averageEfficiency.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Avg Efficiency</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="alert" size={24} color={stats.criticalAlerts > 0 ? '#F44336' : '#FFC107'} />
            <Text style={styles.statValue}>{stats.activeAlerts}</Text>
            <Text style={styles.statLabel}>Active Alerts</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Chip
          selected={selectedFilter === 'all'}
          onPress={() => setSelectedFilter('all')}
          style={styles.filterChip}
        >
          All Zones
        </Chip>
        <Chip
          selected={selectedFilter === 'active'}
          onPress={() => setSelectedFilter('active')}
          style={styles.filterChip}
        >
          Active
        </Chip>
        <Chip
          selected={selectedFilter === 'irrigating'}
          onPress={() => setSelectedFilter('irrigating')}
          style={styles.filterChip}
        >
          Currently Irrigating
        </Chip>
        <Chip
          selected={selectedFilter === 'alerts'}
          onPress={() => setSelectedFilter('alerts')}
          style={styles.filterChip}
        >
          With Alerts
        </Chip>
      </ScrollView>
    </View>
  );

  const renderZoneCard = (zone: ZoneCardData) => (
    <Card key={zone.id} style={styles.zoneCard}>
      <Card.Content>
        <View style={styles.zoneHeader}>
          <View style={styles.zoneHeaderLeft}>
            <Title style={styles.zoneName}>{zone.name}</Title>
            <Text style={styles.zoneDescription}>{zone.description}</Text>
          </View>
          <View style={styles.zoneHeaderRight}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(zone.status) }]} />
            {zone.alertCount > 0 && (
              <Chip mode="outlined" textStyle={styles.alertChipText} style={styles.alertChip}>
                {zone.alertCount} alerts
              </Chip>
            )}
          </View>
        </View>

        <View style={styles.zoneMetrics}>
          <View style={styles.metricItem}>
            <Icon name="texture-box" size={20} color="#666" />
            <Text style={styles.metricLabel}>Soil Type</Text>
            <Text style={styles.metricValue}>{zone.soilType}</Text>
          </View>
          <View style={styles.metricItem}>
            <Icon name="ruler" size={20} color="#666" />
            <Text style={styles.metricLabel}>Area</Text>
            <Text style={styles.metricValue}>{zone.area} acres</Text>
          </View>
          <View style={styles.metricItem}>
            <Icon name="water-percent" size={20} color="#666" />
            <Text style={styles.metricLabel}>Target Moisture</Text>
            <Text style={styles.metricValue}>{zone.settings.soilMoistureTarget.optimal}%</Text>
          </View>
        </View>

        {zone.currentMoisture !== undefined && (
          <View style={styles.moistureSection}>
            <View style={styles.moistureHeader}>
              <Text style={styles.moistureLabel}>Current Soil Moisture</Text>
              <Text 
                style={[
                  styles.moistureValue,
                  { color: getMoistureColor(zone.currentMoisture, zone.settings.soilMoistureTarget.optimal) }
                ]}
              >
                {zone.currentMoisture.toFixed(1)}%
              </Text>
            </View>
            <ProgressBar 
              progress={zone.currentMoisture / 100} 
              color={getMoistureColor(zone.currentMoisture, zone.settings.soilMoistureTarget.optimal)}
              style={styles.moistureBar}
            />
          </View>
        )}

        <View style={styles.systemInfo}>
          <View style={styles.systemMetric}>
            <Icon name="cog" size={18} color="#666" />
            <Text style={styles.systemLabel}>System</Text>
            <Text style={styles.systemValue}>{zone.irrigationSystem.type}</Text>
          </View>
          <View style={styles.systemMetric}>
            <Icon name="gauge" size={18} color="#666" />
            <Text style={styles.systemLabel}>Efficiency</Text>
            <Text style={styles.systemValue}>{zone.efficiency.toFixed(1)}%</Text>
          </View>
          <View style={styles.systemMetric}>
            <Icon name="flash" size={18} color="#666" />
            <Text style={styles.systemLabel}>Capacity</Text>
            <Text style={styles.systemValue}>{zone.irrigationSystem.capacity.flowRate} GPM</Text>
          </View>
        </View>

        {zone.isIrrigating && (
          <View style={styles.irrigatingBanner}>
            <Icon name="water" size={20} color="#00BCD4" />
            <Text style={styles.irrigatingText}>Currently Irrigating</Text>
          </View>
        )}
      </Card.Content>

      <Card.Actions style={styles.zoneActions}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('IrrigationZoneDetails', { zoneId: zone.id })}
        >
          View Details
        </Button>
        {zone.isIrrigating ? (
          <Button
            mode="contained"
            buttonColor="#F44336"
            onPress={() => handleStopIrrigation(zone.id)}
          >
            Stop Irrigation
          </Button>
        ) : (
          <Button
            mode="contained"
            buttonColor="#00BCD4"
            disabled={zone.status !== 'active'}
            onPress={() => handleStartIrrigation(zone.id)}
          >
            Start Irrigation
          </Button>
        )}
      </Card.Actions>
    </Card>
  );

  const renderAlertsSection = () => {
    if (alerts.length === 0) return null;

    const criticalAlerts = alerts.filter(alert => alert.priority === 'critical').slice(0, 3);
    
    return (
      <Card style={styles.alertsCard}>
        <Card.Content>
          <View style={styles.alertsHeader}>
            <Title style={styles.sectionTitle}>Recent Alerts</Title>
            <Button
              mode="text"
              onPress={() => navigation.navigate('IrrigationAlerts')}
            >
              View All
            </Button>
          </View>
          {criticalAlerts.map(alert => (
            <View key={alert.id} style={styles.alertItem}>
              <Icon 
                name={alert.priority === 'critical' ? 'alert-circle' : 'alert'} 
                size={20} 
                color={alert.priority === 'critical' ? '#F44336' : '#FF9800'} 
              />
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{alert.title}</Text>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertTime}>
                  {alert.timestamp.toLocaleTimeString()}
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>
    );
  };

  const renderQuickActions = () => (
    <Portal>
      <Modal
        visible={showQuickActions}
        onDismiss={() => setShowQuickActions(false)}
        contentContainerStyle={styles.quickActionsModal}
      >
        <Title style={styles.modalTitle}>Quick Actions</Title>
        <Button
          mode="outlined"
          icon="plus"
          style={styles.quickActionButton}
          onPress={() => {
            setShowQuickActions(false);
            navigation.navigate('CreateIrrigationZone');
          }}
        >
          Add New Zone
        </Button>
        <Button
          mode="outlined"
          icon="calendar-clock"
          style={styles.quickActionButton}
          onPress={() => {
            setShowQuickActions(false);
            navigation.navigate('IrrigationSchedules');
          }}
        >
          Manage Schedules
        </Button>
        <Button
          mode="outlined"
          icon="chart-line"
          style={styles.quickActionButton}
          onPress={() => {
            setShowQuickActions(false);
            navigation.navigate('IrrigationAnalytics');
          }}
        >
          View Analytics
        </Button>
        <Button
          mode="outlined"
          icon="cog"
          style={styles.quickActionButton}
          onPress={() => {
            setShowQuickActions(false);
            navigation.navigate('IrrigationSettings');
          }}
        >
          System Settings
        </Button>
      </Modal>
    </Portal>
  );

  const filteredZones = filterZones(zones);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading irrigation data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2196F3']}
          />
        }
      >
        {renderStatsCard()}
        {renderAlertsSection()}

        <View style={styles.zonesSection}>
          <View style={styles.zonesSectionHeader}>
            <Title style={styles.sectionTitle}>Irrigation Zones</Title>
            <IconButton
              icon="filter-variant"
              mode="outlined"
              size={20}
              onPress={() => {/* Filter modal would go here */}}
            />
          </View>
          
          <Searchbar
            placeholder="Search zones..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />

          {renderFilterChips()}

          {filteredZones.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <View style={styles.emptyState}>
                  <Icon name="sprinkler-variant" size={64} color="#E0E0E0" />
                  <Text style={styles.emptyTitle}>No Irrigation Zones</Text>
                  <Text style={styles.emptySubtitle}>
                    {zones.length === 0
                      ? 'Create your first irrigation zone to get started'
                      : 'No zones match your current filter criteria'
                    }
                  </Text>
                  {zones.length === 0 && (
                    <Button
                      mode="contained"
                      style={styles.createZoneButton}
                      onPress={() => navigation.navigate('CreateIrrigationZone')}
                    >
                      Create Zone
                    </Button>
                  )}
                </View>
              </Card.Content>
            </Card>
          ) : (
            filteredZones.map(renderZoneCard)
          )}
        </View>
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowQuickActions(true)}
        label="Quick Actions"
      />

      {renderQuickActions()}
    </View>
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
  scrollView: {
    flex: 1,
  },
  statsCard: {
    margin: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    width: '22%',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  alertsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertItem: {
    flexDirection: 'row',
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFF3E0',
    marginBottom: 8,
  },
  alertContent: {
    marginLeft: 12,
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertMessage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  alertTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  zonesSection: {
    margin: 16,
    marginTop: 0,
  },
  zonesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  zoneCard: {
    marginBottom: 16,
    elevation: 4,
  },
  zoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  zoneHeaderLeft: {
    flex: 1,
  },
  zoneHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoneName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  zoneDescription: {
    fontSize: 14,
    color: '#666',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  alertChip: {
    height: 24,
  },
  alertChipText: {
    fontSize: 10,
  },
  zoneMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  moistureSection: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  moistureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  moistureLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  moistureValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  moistureBar: {
    height: 8,
    borderRadius: 4,
  },
  systemInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  systemMetric: {
    alignItems: 'center',
    flex: 1,
  },
  systemLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  systemValue: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  irrigatingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F7FA',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  irrigatingText: {
    marginLeft: 8,
    color: '#00838F',
    fontWeight: '600',
  },
  zoneActions: {
    justifyContent: 'space-between',
  },
  emptyCard: {
    elevation: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#666',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  createZoneButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  quickActionsModal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  quickActionButton: {
    marginBottom: 12,
  },
});

export default SmartIrrigationDashboard;