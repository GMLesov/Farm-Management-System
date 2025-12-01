/**
 * Crop Management Dashboard Screen
 * Main interface for comprehensive crop lifecycle management,
 * pest monitoring, yield prediction, and harvest optimization
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Chip,
  ProgressBar,
  Avatar,
  List,
  Divider,
  Badge,
  IconButton,
  Text,
  Surface
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { cropManagementService, Crop, CropNotification } from '../../services/CropManagementService';

const { width } = Dimensions.get('window');

interface CropSummaryStats {
  totalCrops: number;
  activeCrops: number;
  readyForHarvest: number;
  avgHealthScore: number;
  totalPredictedYield: number;
  criticalAlerts: number;
}

interface CropCardProps {
  crop: Crop;
  onPress: () => void;
  onEdit: () => void;
}

const CropCard: React.FC<CropCardProps> = ({ crop, onPress, onEdit }) => {
  const analytics = cropManagementService.getCropAnalytics(crop.id);
  const activePests = cropManagementService.getActivePests(crop.id);
  
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'planted': return '#4CAF50';
      case 'growing': return '#2196F3';
      case 'harvested': return '#FF9800';
      case 'failed': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getHealthColor = (score: number): string => {
    if (score >= 85) return '#4CAF50';
    if (score >= 70) return '#FF9800';
    return '#F44336';
  };

  const daysPlanted = Math.ceil((Date.now() - crop.plantingDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysToHarvest = Math.ceil((crop.expectedHarvestDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Card style={styles.cropCard} onPress={onPress}>
      <Card.Content>
        <View style={styles.cropCardHeader}>
          <View style={styles.cropInfo}>
            <Title style={styles.cropName}>{crop.name}</Title>
            <Paragraph style={styles.cropVariety}>{crop.variety}</Paragraph>
            <View style={styles.cropMetadata}>
              <Chip
                mode="outlined"
                style={[styles.statusChip, { borderColor: getStatusColor(crop.status) }]}
                textStyle={{ color: getStatusColor(crop.status) }}
                compact
              >
                {crop.status.toUpperCase()}
              </Chip>
              <Text style={styles.fieldInfo}>Field {crop.fieldId}</Text>
            </View>
          </View>
          <View style={styles.cropActions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={onEdit}
              style={styles.editButton}
            />
            {activePests.length > 0 && (
              <Badge style={styles.pestBadge}>{activePests.length}</Badge>
            )}
          </View>
        </View>

        <View style={styles.cropProgress}>
          <View style={styles.progressHeader}>
            <Text style={styles.stageText}>{crop.currentStage.name}</Text>
            <Text style={styles.progressText}>
              {Math.round(crop.currentStage.completionPercentage)}%
            </Text>
          </View>
          <ProgressBar
            progress={crop.currentStage.completionPercentage / 100}
            color="#2196F3"
            style={styles.progressBar}
          />
        </View>

        <View style={styles.cropStats}>
          <View style={styles.statItem}>
            <Icon name="heart" size={16} color={getHealthColor(analytics.metrics.healthScore)} />
            <Text style={styles.statText}>{analytics.metrics.healthScore}/100</Text>
            <Text style={styles.statLabel}>Health</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="calendar" size={16} color="#666" />
            <Text style={styles.statText}>{daysPlanted}d</Text>
            <Text style={styles.statLabel}>Planted</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="calendar-clock" size={16} color="#666" />
            <Text style={styles.statText}>{daysToHarvest > 0 ? `${daysToHarvest}d` : 'Ready'}</Text>
            <Text style={styles.statLabel}>Harvest</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="chart-line" size={16} color="#4CAF50" />
            <Text style={styles.statText}>
              {Math.round(crop.predictions.yield.predictedYield.amount)}
            </Text>
            <Text style={styles.statLabel}>{crop.predictions.yield.predictedYield.unit}</Text>
          </View>
        </View>

        {activePests.length > 0 && (
          <View style={styles.alertSection}>
            <Icon name="alert" size={16} color="#FF9800" />
            <Text style={styles.alertText}>
              {activePests.length} active pest{activePests.length > 1 ? 's' : ''} detected
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const CropManagementDashboard: React.FC = () => {
  const navigation = useNavigation<any>();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [notifications, setNotifications] = useState<CropNotification[]>([]);
  const [stats, setStats] = useState<CropSummaryStats>({
    totalCrops: 0,
    activeCrops: 0,
    readyForHarvest: 0,
    avgHealthScore: 0,
    totalPredictedYield: 0,
    criticalAlerts: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'growing' | 'harvest_ready' | 'alerts'>('all');

  const loadData = useCallback(async () => {
    try {
      const allCrops = cropManagementService.getAllCrops();
      const allNotifications = cropManagementService.getNotifications();
      
      setCrops(allCrops);
      setNotifications(allNotifications);
      
      // Calculate summary statistics
      const activeCrops = allCrops.filter((crop: Crop) => crop.status === 'growing' || crop.status === 'planted');
      const harvestReady = cropManagementService.getHarvestReadyCrops();
      const criticalAlerts = allNotifications.filter((n: CropNotification) => n.priority === 'critical' && !n.readAt);
      
      const healthScores = allCrops.map((crop: Crop) => cropManagementService.getCropAnalytics(crop.id)?.metrics.healthScore || 0);
      const avgHealthScore = healthScores.length > 0 ? 
        healthScores.reduce((sum: number, score: number) => sum + score, 0) / healthScores.length : 0;
      
      const totalPredictedYield = allCrops.reduce((sum: number, crop: Crop) => 
        sum + (crop.predictions.yield?.predictedYield.amount || 0), 0
      );

      setStats({
        totalCrops: allCrops.length,
        activeCrops: activeCrops.length,
        readyForHarvest: harvestReady.length,
        avgHealthScore: Math.round(avgHealthScore),
        totalPredictedYield: Math.round(totalPredictedYield),
        criticalAlerts: criticalAlerts.length
      });
    } catch (error) {
      console.error('Failed to load crop data:', error);
      Alert.alert('Error', 'Failed to load crop data. Please try again.');
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const getFilteredCrops = () => {
    switch (selectedFilter) {
      case 'growing':
        return crops.filter(crop => crop.status === 'growing');
      case 'harvest_ready':
        return cropManagementService.getHarvestReadyCrops();
      case 'alerts':
        return crops.filter(crop => {
          const activePests = cropManagementService.getActivePests(crop.id);
          const cropNotifications = notifications.filter(n => n.cropId === crop.id && !n.readAt);
          return activePests.length > 0 || cropNotifications.length > 0;
        });
      default:
        return crops;
    }
  };

  const handleCropPress = (crop: Crop) => {
    navigation.navigate('CropDetails', { cropId: crop.id });
  };

  const handleEditCrop = (crop: Crop) => {
    navigation.navigate('EditCrop', { cropId: crop.id });
  };

  const handleAddCrop = () => {
    navigation.navigate('AddCrop');
  };

  const handleViewNotifications = () => {
    navigation.navigate('CropNotifications');
  };

  const handlePestMonitoring = () => {
    navigation.navigate('PestMonitoring');
  };

  const handleYieldAnalytics = () => {
    navigation.navigate('YieldAnalytics');
  };

  const renderStatsCard = () => (
    <Card style={styles.statsCard}>
      <Card.Content>
        <Title style={styles.statsTitle}>Farm Overview</Title>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.totalCrops}</Text>
            <Text style={styles.statLabel}>Total Crops</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#4CAF50' }]}>{stats.activeCrops}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#FF9800' }]}>{stats.readyForHarvest}</Text>
            <Text style={styles.statLabel}>Harvest Ready</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: stats.criticalAlerts > 0 ? '#F44336' : '#4CAF50' }]}>
              {stats.criticalAlerts}
            </Text>
            <Text style={styles.statLabel}>Critical Alerts</Text>
          </View>
        </View>
        <Divider style={styles.statsDivider} />
        <View style={styles.healthRow}>
          <Text style={styles.healthLabel}>Average Health Score</Text>
          <View style={styles.healthIndicator}>
            <Text style={[styles.healthScore, { color: stats.avgHealthScore >= 80 ? '#4CAF50' : stats.avgHealthScore >= 60 ? '#FF9800' : '#F44336' }]}>
              {stats.avgHealthScore}/100
            </Text>
          </View>
        </View>
        <View style={styles.yieldRow}>
          <Text style={styles.yieldLabel}>Total Predicted Yield</Text>
          <Text style={styles.yieldValue}>{stats.totalPredictedYield.toLocaleString()} units</Text>
        </View>
      </Card.Content>
    </Card>
  );

  const renderQuickActions = () => (
    <Card style={styles.actionsCard}>
      <Card.Content>
        <Title style={styles.actionsTitle}>Quick Actions</Title>
        <View style={styles.actionButtons}>
          <Button
            mode="contained"
            onPress={handlePestMonitoring}
            style={styles.actionButton}
            icon="bug"
            contentStyle={styles.actionButtonContent}
          >
            Pest Monitoring
          </Button>
          <Button
            mode="contained"
            onPress={handleYieldAnalytics}
            style={styles.actionButton}
            icon="chart-line"
            contentStyle={styles.actionButtonContent}
          >
            Yield Analytics
          </Button>
          <Button
            mode="outlined"
            onPress={handleViewNotifications}
            style={styles.actionButton}
            icon="bell"
            contentStyle={styles.actionButtonContent}
          >
            Notifications
            {notifications.filter(n => !n.readAt).length > 0 && (
              <Badge style={styles.notificationBadge}>
                {notifications.filter(n => !n.readAt).length}
              </Badge>
            )}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderFilterChips = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterChips}>
        {[
          { key: 'all', label: 'All Crops', count: crops.length },
          { key: 'growing', label: 'Growing', count: crops.filter(c => c.status === 'growing').length },
          { key: 'harvest_ready', label: 'Harvest Ready', count: cropManagementService.getHarvestReadyCrops().length },
          { key: 'alerts', label: 'Alerts', count: crops.filter(c => cropManagementService.getActivePests(c.id).length > 0).length }
        ].map((filter) => (
          <Chip
            key={filter.key}
            selected={selectedFilter === filter.key}
            onPress={() => setSelectedFilter(filter.key as any)}
            style={[
              styles.filterChip,
              selectedFilter === filter.key && styles.selectedFilterChip
            ]}
            textStyle={[
              styles.filterChipText,
              selectedFilter === filter.key && styles.selectedFilterChipText
            ]}
          >
            {filter.label} ({filter.count})
          </Chip>
        ))}
      </ScrollView>
    </View>
  );

  const filteredCrops = getFilteredCrops();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderStatsCard()}
        {renderQuickActions()}
        {renderFilterChips()}

        <View style={styles.cropsSection}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>
              {selectedFilter === 'all' ? 'All Crops' :
               selectedFilter === 'growing' ? 'Growing Crops' :
               selectedFilter === 'harvest_ready' ? 'Harvest Ready' :
               'Crops with Alerts'}
            </Title>
            <Text style={styles.cropCount}>{filteredCrops.length} crops</Text>
          </View>

          {filteredCrops.length === 0 ? (
            <Card style={styles.emptyCropsCard}>
              <Card.Content style={styles.emptyCropsContent}>
                <Icon name="sprout" size={64} color="#E0E0E0" />
                <Title style={styles.emptyCropsTitle}>
                  {selectedFilter === 'all' ? 'No crops planted yet' :
                   selectedFilter === 'growing' ? 'No crops currently growing' :
                   selectedFilter === 'harvest_ready' ? 'No crops ready for harvest' :
                   'No crops with alerts'}
                </Title>
                <Paragraph style={styles.emptyCropsText}>
                  {selectedFilter === 'all' ? 'Start by adding your first crop to begin tracking its lifecycle.' :
                   'Try changing the filter or add new crops to see them here.'}
                </Paragraph>
                {selectedFilter === 'all' && (
                  <Button
                    mode="contained"
                    onPress={handleAddCrop}
                    style={styles.addFirstCropButton}
                    icon="plus"
                  >
                    Add Your First Crop
                  </Button>
                )}
              </Card.Content>
            </Card>
          ) : (
            filteredCrops.map((crop: Crop) => (
              <CropCard
                key={crop.id}
                crop={crop}
                onPress={() => handleCropPress(crop)}
                onEdit={() => handleEditCrop(crop)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleAddCrop}
        label="Add Crop"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 80,
  },
  statsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statsDivider: {
    marginVertical: 16,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthLabel: {
    fontSize: 14,
    color: '#666',
  },
  healthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  yieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  yieldLabel: {
    fontSize: 14,
    color: '#666',
  },
  yieldValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  actionsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    minWidth: (width - 48) / 2 - 4,
    marginBottom: 8,
  },
  actionButtonContent: {
    height: 40,
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterChips: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    backgroundColor: '#fff',
  },
  selectedFilterChip: {
    backgroundColor: '#2196F3',
  },
  filterChipText: {
    color: '#666',
  },
  selectedFilterChipText: {
    color: '#fff',
  },
  cropsSection: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cropCount: {
    fontSize: 14,
    color: '#666',
  },
  cropCard: {
    marginBottom: 12,
    elevation: 2,
  },
  cropCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cropVariety: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cropMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusChip: {
    height: 24,
  },
  fieldInfo: {
    fontSize: 12,
    color: '#666',
  },
  cropActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    margin: 0,
  },
  pestBadge: {
    backgroundColor: '#FF9800',
    marginLeft: 8,
  },
  cropProgress: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stageText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  cropStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
  },
  alertSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  alertText: {
    fontSize: 12,
    color: '#FF9800',
    marginLeft: 8,
    fontWeight: '500',
  },
  emptyCropsCard: {
    marginTop: 32,
    elevation: 1,
  },
  emptyCropsContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyCropsTitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyCropsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addFirstCropButton: {
    minWidth: 200,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});

export default CropManagementDashboard;