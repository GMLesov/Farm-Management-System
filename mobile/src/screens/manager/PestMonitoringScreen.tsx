/**
 * Pest Monitoring Screen
 * Comprehensive pest detection, monitoring, and treatment recommendation system
 * with AI-powered identification and integrated treatment planning
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
  Image
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  List,
  Divider,
  Text,
  Surface,
  IconButton,
  Badge,
  FAB,
  Searchbar,
  Menu,
  Portal,
  Dialog
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { 
  cropManagementService, 
  PestMonitoring, 
  TreatmentRecommendation,
  Crop 
} from '../../services/CropManagementService';

const { width } = Dimensions.get('window');

interface PestSummaryStats {
  totalObservations: number;
  activePests: number;
  criticalAlerts: number;
  affectedCrops: number;
  avgSeverity: string;
  economicThreshold: number;
}

interface PestCardProps {
  pest: PestMonitoring;
  crop: Crop;
  onPress: () => void;
  onTreat: () => void;
}

const PestCard: React.FC<PestCardProps> = ({ pest, crop, onPress, onTreat }) => {
  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#FFC107';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const getPestTypeIcon = (type: string): string => {
    switch (type) {
      case 'insect': return 'bug';
      case 'disease': return 'biohazard';
      case 'weed': return 'grass';
      case 'vertebrate': return 'paw';
      case 'nematode': return 'worm';
      default: return 'alert-circle';
    }
  };

  const daysAgo = Math.ceil((Date.now() - pest.monitoringDate.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card style={styles.pestCard} onPress={onPress}>
      <Card.Content>
        <View style={styles.pestCardHeader}>
          <View style={styles.pestInfo}>
            <View style={styles.pestTitleRow}>
              <Icon 
                name={getPestTypeIcon(pest.pestType)} 
                size={20} 
                color={getSeverityColor(pest.severityLevel)} 
              />
              <Title style={styles.pestName}>{pest.pestName}</Title>
            </View>
            <View style={styles.pestMetadata}>
              <Chip
                mode="outlined"
                style={[styles.severityChip, { borderColor: getSeverityColor(pest.severityLevel) }]}
                textStyle={{ color: getSeverityColor(pest.severityLevel) }}
                compact
              >
                {pest.severityLevel.toUpperCase()}
              </Chip>
              <Text style={styles.pestType}>{pest.pestType}</Text>
              <Text style={styles.cropName}>• {crop.name}</Text>
            </View>
          </View>
          <View style={styles.pestActions}>
            <IconButton
              icon="medical-bag"
              size={20}
              onPress={onTreat}
              style={styles.treatButton}
            />
            {pest.damageAssessment.economicThreshold && (
              <Badge style={styles.thresholdBadge}>!</Badge>
            )}
          </View>
        </View>

        <View style={styles.pestStats}>
          <View style={styles.statItem}>
            <Icon name="percent" size={16} color="#666" />
            <Text style={styles.statText}>{pest.affectedArea.percentage}%</Text>
            <Text style={styles.statLabel}>Affected</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="calendar" size={16} color="#666" />
            <Text style={styles.statText}>{daysAgo}d</Text>
            <Text style={styles.statLabel}>Detected</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="chart-line-variant" size={16} color="#666" />
            <Text style={styles.statText}>{pest.populationDensity}</Text>
            <Text style={styles.statLabel}>Density</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="trending-down" size={16} color={pest.damageAssessment.estimatedYieldLoss > 0 ? '#F44336' : '#666'} />
            <Text style={[styles.statText, { color: pest.damageAssessment.estimatedYieldLoss > 0 ? '#F44336' : '#666' }]}>
              {pest.damageAssessment.estimatedYieldLoss}%
            </Text>
            <Text style={styles.statLabel}>Yield Loss</Text>
          </View>
        </View>

        <View style={styles.pestDetails}>
          <Text style={styles.pestLifecycle}>Lifecycle: {pest.lifecycle}</Text>
          <Text style={styles.pestDamage}>
            Damage Type: {pest.damageAssessment.type.replace('_', ' ')}
          </Text>
          <Text style={styles.pestIdentification}>
            ID Method: {pest.identificationMethod.replace('_', ' ')}
            <Text style={styles.confidenceText}> ({pest.identificationConfidence}% confidence)</Text>
          </Text>
        </View>

        {pest.damageAssessment.economicThreshold && (
          <View style={styles.thresholdAlert}>
            <Icon name="alert" size={16} color="#F44336" />
            <Text style={styles.thresholdText}>Economic threshold reached - Treatment recommended</Text>
          </View>
        )}

        {pest.recommendations.length > 0 && (
          <View style={styles.recommendationsPreview}>
            <Text style={styles.recommendationsTitle}>Top Recommendation:</Text>
            <Text style={styles.recommendationText}>
              {pest.recommendations[0].type} • {pest.recommendations[0].urgency.replace('_', ' ')}
            </Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const PestMonitoringScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [allPests, setAllPests] = useState<PestMonitoring[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [stats, setStats] = useState<PestSummaryStats>({
    totalObservations: 0,
    activePests: 0,
    criticalAlerts: 0,
    affectedCrops: 0,
    avgSeverity: 'low',
    economicThreshold: 0
  });
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'critical' | 'economic'>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const loadData = useCallback(async () => {
    try {
      const allCrops = cropManagementService.getAllCrops();
      setCrops(allCrops);

      // Collect all pest observations from all crops
      const allPestObservations: PestMonitoring[] = [];
      allCrops.forEach(crop => {
        const cropPests = cropManagementService.getPestHistory(crop.id);
        allPestObservations.push(...cropPests);
      });

      setAllPests(allPestObservations);

      // Calculate summary statistics
      const activePests = allPestObservations.filter(pest => {
        const daysSince = (Date.now() - pest.monitoringDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSince <= 14; // Active within last 2 weeks
      });

      const criticalAlerts = allPestObservations.filter(pest => 
        pest.severityLevel === 'critical' || pest.damageAssessment.economicThreshold
      );

      const affectedCropIds = new Set(allPestObservations.map(pest => pest.cropId));
      const economicThresholdCount = allPestObservations.filter(pest => 
        pest.damageAssessment.economicThreshold
      ).length;

      // Calculate average severity
      const severityValues = { low: 1, medium: 2, high: 3, critical: 4 };
      const avgSeverityValue = allPestObservations.length > 0 ?
        allPestObservations.reduce((sum, pest) => sum + severityValues[pest.severityLevel], 0) / allPestObservations.length : 1;
      
      const avgSeverity = avgSeverityValue >= 3.5 ? 'critical' :
                         avgSeverityValue >= 2.5 ? 'high' :
                         avgSeverityValue >= 1.5 ? 'medium' : 'low';

      setStats({
        totalObservations: allPestObservations.length,
        activePests: activePests.length,
        criticalAlerts: criticalAlerts.length,
        affectedCrops: affectedCropIds.size,
        avgSeverity,
        economicThreshold: economicThresholdCount
      });
    } catch (error) {
      console.error('Failed to load pest data:', error);
      Alert.alert('Error', 'Failed to load pest monitoring data. Please try again.');
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

  const getFilteredPests = () => {
    let filtered = allPests;

    // Apply main filter
    switch (selectedFilter) {
      case 'active':
        filtered = filtered.filter(pest => {
          const daysSince = (Date.now() - pest.monitoringDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysSince <= 14;
        });
        break;
      case 'critical':
        filtered = filtered.filter(pest => pest.severityLevel === 'critical');
        break;
      case 'economic':
        filtered = filtered.filter(pest => pest.damageAssessment.economicThreshold);
        break;
    }

    // Apply severity filter
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(pest => pest.severityLevel === selectedSeverity);
    }

    // Apply type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(pest => pest.pestType === selectedType);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(pest =>
        pest.pestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pest.pestType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort by severity and date
    return filtered.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severityLevel] - severityOrder[a.severityLevel];
      if (severityDiff !== 0) return severityDiff;
      return b.monitoringDate.getTime() - a.monitoringDate.getTime();
    });
  };

  const handlePestPress = (pest: PestMonitoring) => {
    navigation.navigate('PestDetails', { pestId: pest.id, cropId: pest.cropId });
  };

  const handleTreatmentPress = (pest: PestMonitoring) => {
    navigation.navigate('TreatmentRecommendations', { pestId: pest.id, cropId: pest.cropId });
  };

  const handleAddObservation = () => {
    navigation.navigate('AddPestObservation');
  };

  const handlePestIdentification = () => {
    navigation.navigate('PestIdentification');
  };

  const handleTreatmentHistory = () => {
    navigation.navigate('TreatmentHistory');
  };

  const renderStatsCard = () => (
    <Card style={styles.statsCard}>
      <Card.Content>
        <Title style={styles.statsTitle}>Pest Monitoring Overview</Title>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.totalObservations}</Text>
            <Text style={styles.statLabel}>Total Observations</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#FF9800' }]}>{stats.activePests}</Text>
            <Text style={styles.statLabel}>Active Pests</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#F44336' }]}>{stats.criticalAlerts}</Text>
            <Text style={styles.statLabel}>Critical Alerts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#2196F3' }]}>{stats.affectedCrops}</Text>
            <Text style={styles.statLabel}>Affected Crops</Text>
          </View>
        </View>
        
        <Divider style={styles.statsDivider} />
        
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Average Severity:</Text>
            <Chip
              mode="outlined"
              style={[styles.severityChip, { 
                borderColor: stats.avgSeverity === 'critical' ? '#F44336' :
                            stats.avgSeverity === 'high' ? '#FF9800' :
                            stats.avgSeverity === 'medium' ? '#FFC107' : '#4CAF50'
              }]}
              textStyle={{ 
                color: stats.avgSeverity === 'critical' ? '#F44336' :
                       stats.avgSeverity === 'high' ? '#FF9800' :
                       stats.avgSeverity === 'medium' ? '#FFC107' : '#4CAF50'
              }}
              compact
            >
              {stats.avgSeverity.toUpperCase()}
            </Chip>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Economic Threshold:</Text>
            <Text style={[styles.summaryValue, { color: stats.economicThreshold > 0 ? '#F44336' : '#4CAF50' }]}>
              {stats.economicThreshold} pests
            </Text>
          </View>
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
            onPress={handlePestIdentification}
            style={styles.actionButton}
            icon="camera"
            contentStyle={styles.actionButtonContent}
          >
            AI Pest ID
          </Button>
          <Button
            mode="contained"
            onPress={handleTreatmentHistory}
            style={styles.actionButton}
            icon="history"
            contentStyle={styles.actionButtonContent}
          >
            Treatment History
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('PestAnalytics')}
            style={styles.actionButton}
            icon="chart-box"
            contentStyle={styles.actionButtonContent}
          >
            Analytics
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderFilterBar = () => (
    <Surface style={styles.filterBar}>
      <Searchbar
        placeholder="Search pests..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <Menu
        visible={filterVisible}
        onDismiss={() => setFilterVisible(false)}
        anchor={
          <IconButton
            icon="filter-variant"
            onPress={() => setFilterVisible(true)}
            style={styles.filterButton}
          />
        }
      >
        <Menu.Item
          title="All Pests"
          onPress={() => {
            setSelectedFilter('all');
            setFilterVisible(false);
          }}
          leadingIcon={selectedFilter === 'all' ? 'check' : 'circle-outline'}
        />
        <Menu.Item
          title="Active Pests"
          onPress={() => {
            setSelectedFilter('active');
            setFilterVisible(false);
          }}
          leadingIcon={selectedFilter === 'active' ? 'check' : 'circle-outline'}
        />
        <Menu.Item
          title="Critical Alerts"
          onPress={() => {
            setSelectedFilter('critical');
            setFilterVisible(false);
          }}
          leadingIcon={selectedFilter === 'critical' ? 'check' : 'circle-outline'}
        />
        <Menu.Item
          title="Economic Threshold"
          onPress={() => {
            setSelectedFilter('economic');
            setFilterVisible(false);
          }}
          leadingIcon={selectedFilter === 'economic' ? 'check' : 'circle-outline'}
        />
        <Divider />
        <Menu.Item title="Severity Filters" disabled />
        {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
          <Menu.Item
            key={severity}
            title={severity === 'all' ? 'All Severities' : severity.charAt(0).toUpperCase() + severity.slice(1)}
            onPress={() => {
              setSelectedSeverity(severity);
              setFilterVisible(false);
            }}
            leadingIcon={selectedSeverity === severity ? 'check' : 'circle-outline'}
          />
        ))}
        <Divider />
        <Menu.Item title="Type Filters" disabled />
        {['all', 'insect', 'disease', 'weed', 'vertebrate', 'nematode'].map((type) => (
          <Menu.Item
            key={type}
            title={type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
            onPress={() => {
              setSelectedType(type);
              setFilterVisible(false);
            }}
            leadingIcon={selectedType === type ? 'check' : 'circle-outline'}
          />
        ))}
      </Menu>
    </Surface>
  );

  const renderFilterChips = () => {
    const activeFilters = [];
    if (selectedFilter !== 'all') {
      activeFilters.push({ key: 'filter', label: selectedFilter.replace('_', ' ') });
    }
    if (selectedSeverity !== 'all') {
      activeFilters.push({ key: 'severity', label: selectedSeverity });
    }
    if (selectedType !== 'all') {
      activeFilters.push({ key: 'type', label: selectedType });
    }

    if (activeFilters.length === 0) return null;

    return (
      <View style={styles.filterChipsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {activeFilters.map((filter) => (
            <Chip
              key={filter.key}
              onClose={() => {
                if (filter.key === 'filter') setSelectedFilter('all');
                if (filter.key === 'severity') setSelectedSeverity('all');
                if (filter.key === 'type') setSelectedType('all');
              }}
              style={styles.filterChip}
            >
              {filter.label}
            </Chip>
          ))}
          <Button
            mode="text"
            onPress={() => {
              setSelectedFilter('all');
              setSelectedSeverity('all');
              setSelectedType('all');
              setSearchQuery('');
            }}
            compact
          >
            Clear All
          </Button>
        </ScrollView>
      </View>
    );
  };

  const filteredPests = getFilteredPests();

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
        {renderFilterBar()}
        {renderFilterChips()}

        <View style={styles.pestsSection}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>
              {selectedFilter === 'all' ? 'All Pest Observations' :
               selectedFilter === 'active' ? 'Active Pests' :
               selectedFilter === 'critical' ? 'Critical Alerts' :
               'Economic Threshold Reached'}
            </Title>
            <Text style={styles.pestCount}>{filteredPests.length} observations</Text>
          </View>

          {filteredPests.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Icon name="bug" size={64} color="#E0E0E0" />
                <Title style={styles.emptyTitle}>
                  {selectedFilter === 'all' ? 'No pest observations yet' :
                   selectedFilter === 'active' ? 'No active pests detected' :
                   selectedFilter === 'critical' ? 'No critical pest alerts' :
                   'No pests at economic threshold'}
                </Title>
                <Paragraph style={styles.emptyText}>
                  {selectedFilter === 'all' ? 
                    'Start monitoring by adding your first pest observation.' :
                    'Great news! Try changing filters to see other pest observations.'}
                </Paragraph>
                {selectedFilter === 'all' && (
                  <Button
                    mode="contained"
                    onPress={handleAddObservation}
                    style={styles.addFirstButton}
                    icon="plus"
                  >
                    Add First Observation
                  </Button>
                )}
              </Card.Content>
            </Card>
          ) : (
            filteredPests.map((pest) => {
              const crop = crops.find(c => c.id === pest.cropId);
              if (!crop) return null;
              
              return (
                <PestCard
                  key={pest.id}
                  pest={pest}
                  crop={crop}
                  onPress={() => handlePestPress(pest)}
                  onTreat={() => handleTreatmentPress(pest)}
                />
              );
            })
          )}
        </View>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleAddObservation}
        label="Add Observation"
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
    textAlign: 'center',
  },
  statsDivider: {
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  severityChip: {
    height: 24,
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
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
    elevation: 1,
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
  },
  filterButton: {
    margin: 0,
  },
  filterChipsContainer: {
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#E3F2FD',
  },
  pestsSection: {
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
  pestCount: {
    fontSize: 14,
    color: '#666',
  },
  pestCard: {
    marginBottom: 12,
    elevation: 2,
  },
  pestCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  pestInfo: {
    flex: 1,
  },
  pestTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  pestName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  pestMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  pestType: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  cropName: {
    fontSize: 12,
    color: '#666',
  },
  pestActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  treatButton: {
    margin: 0,
  },
  thresholdBadge: {
    backgroundColor: '#F44336',
    marginLeft: 8,
  },
  pestStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
  },
  pestDetails: {
    marginBottom: 12,
  },
  pestLifecycle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  pestDamage: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  pestIdentification: {
    fontSize: 13,
    color: '#666',
    textTransform: 'capitalize',
  },
  confidenceText: {
    fontSize: 12,
    color: '#999',
  },
  thresholdAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  thresholdText: {
    fontSize: 12,
    color: '#F44336',
    marginLeft: 8,
    fontWeight: '500',
  },
  recommendationsPreview: {
    backgroundColor: '#E8F5E8',
    padding: 8,
    borderRadius: 4,
  },
  recommendationsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 2,
  },
  recommendationText: {
    fontSize: 12,
    color: '#4CAF50',
    textTransform: 'capitalize',
  },
  emptyCard: {
    marginTop: 32,
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addFirstButton: {
    minWidth: 200,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF9800',
  },
});

export default PestMonitoringScreen;