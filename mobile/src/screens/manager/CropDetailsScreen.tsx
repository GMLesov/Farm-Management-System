/**
 * Crop Details Screen
 * Comprehensive view of individual crop information including
 * growth stages, treatments, pest monitoring, and predictions
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
  Chip,
  ProgressBar,
  List,
  Divider,
  Text,
  Surface,
  IconButton,
  Badge
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

import { 
  cropManagementService, 
  Crop, 
  GrowthStageRecord, 
  TreatmentRecord,
  PestMonitoring 
} from '../../services/CropManagementService';

const { width } = Dimensions.get('window');
const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};

interface CropDetailsProps {
  route: {
    params: {
      cropId: string;
    };
  };
}

const CropDetailsScreen: React.FC<CropDetailsProps> = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { cropId } = route.params;

  const [crop, setCrop] = useState<Crop | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [growthHistory, setGrowthHistory] = useState<GrowthStageRecord[]>([]);
  const [treatments, setTreatments] = useState<TreatmentRecord[]>([]);
  const [pests, setPests] = useState<PestMonitoring[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'growth' | 'treatments' | 'pests' | 'predictions'>('overview');

  const loadCropData = useCallback(async () => {
    try {
      const cropData = cropManagementService.getCrop(cropId);
      if (!cropData) {
        Alert.alert('Error', 'Crop not found');
        navigation.goBack();
        return;
      }

      const cropAnalytics = cropManagementService.getCropAnalytics(cropId);
      const treatmentHistory = cropManagementService.getTreatmentHistory(cropId);
      const pestHistory = cropManagementService.getPestHistory(cropId);

      setCrop(cropData);
      setAnalytics(cropAnalytics);
      setGrowthHistory(cropData.growthHistory);
      setTreatments(treatmentHistory);
      setPests(pestHistory);
    } catch (error) {
      console.error('Failed to load crop data:', error);
      Alert.alert('Error', 'Failed to load crop data. Please try again.');
    }
  }, [cropId, navigation]);

  useEffect(() => {
    loadCropData();
  }, [loadCropData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCropData();
    setRefreshing(false);
  }, [loadCropData]);

  const handleAdvanceStage = () => {
    navigation.navigate('AdvanceGrowthStage', { cropId });
  };

  const handleAddTreatment = () => {
    navigation.navigate('AddTreatment', { cropId });
  };

  const handleAddPestObservation = () => {
    navigation.navigate('AddPestObservation', { cropId });
  };

  const handleUpdatePredictions = async () => {
    const prediction = cropManagementService.updateYieldPrediction(cropId);
    if (prediction) {
      await loadCropData();
      Alert.alert('Success', 'Yield predictions updated successfully');
    }
  };

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

  const renderTabBar = () => (
    <Surface style={styles.tabBar}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { key: 'overview', label: 'Overview', icon: 'view-dashboard' },
          { key: 'growth', label: 'Growth', icon: 'chart-timeline-variant' },
          { key: 'treatments', label: 'Treatments', icon: 'medical-bag' },
          { key: 'pests', label: 'Pests', icon: 'bug' },
          { key: 'predictions', label: 'Predictions', icon: 'crystal-ball' }
        ].map((tab) => (
          <Button
            key={tab.key}
            mode={activeTab === tab.key ? 'contained' : 'text'}
            onPress={() => setActiveTab(tab.key as any)}
            style={styles.tabButton}
            icon={tab.icon}
            compact
          >
            {tab.label}
          </Button>
        ))}
      </ScrollView>
    </Surface>
  );

  const renderOverview = () => {
    if (!crop || !analytics) return null;

    const daysPlanted = Math.ceil((Date.now() - crop.plantingDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysToHarvest = Math.ceil((crop.expectedHarvestDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const activePests = cropManagementService.getActivePests(cropId);

    return (
      <View>
        <Card style={styles.overviewCard}>
          <Card.Content>
            <View style={styles.cropHeader}>
              <View style={styles.cropInfo}>
                <Title style={styles.cropName}>{crop.name}</Title>
                <Paragraph style={styles.cropVariety}>{crop.variety}</Paragraph>
                <View style={styles.metadataRow}>
                  <Chip
                    mode="outlined"
                    style={[styles.statusChip, { borderColor: getStatusColor(crop.status) }]}
                    textStyle={{ color: getStatusColor(crop.status) }}
                  >
                    {crop.status.toUpperCase()}
                  </Chip>
                  <Text style={styles.fieldText}>Field {crop.fieldId}</Text>
                </View>
              </View>
              <IconButton
                icon="pencil"
                size={24}
                onPress={() => navigation.navigate('EditCrop', { cropId })}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Icon name="calendar" size={20} color="#666" />
                <Text style={styles.metricValue}>{daysPlanted}</Text>
                <Text style={styles.metricLabel}>Days Planted</Text>
              </View>
              <View style={styles.metricItem}>
                <Icon name="calendar-clock" size={20} color="#666" />
                <Text style={styles.metricValue}>{daysToHarvest > 0 ? daysToHarvest : 'Ready'}</Text>
                <Text style={styles.metricLabel}>Days to Harvest</Text>
              </View>
              <View style={styles.metricItem}>
                <Icon name="heart" size={20} color={getHealthColor(analytics.metrics.healthScore)} />
                <Text style={[styles.metricValue, { color: getHealthColor(analytics.metrics.healthScore) }]}>
                  {analytics.metrics.healthScore}
                </Text>
                <Text style={styles.metricLabel}>Health Score</Text>
              </View>
              <View style={styles.metricItem}>
                <Icon name="chart-line" size={20} color="#4CAF50" />
                <Text style={styles.metricValue}>
                  {Math.round(crop.predictions.yield.predictedYield.amount)}
                </Text>
                <Text style={styles.metricLabel}>{crop.predictions.yield.predictedYield.unit}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.stageCard}>
          <Card.Content>
            <View style={styles.stageHeader}>
              <Title style={styles.stageTitle}>Current Growth Stage</Title>
              <Button
                mode="outlined"
                onPress={handleAdvanceStage}
                compact
                icon="arrow-right"
              >
                Advance
              </Button>
            </View>
            
            <View style={styles.stageInfo}>
              <Text style={styles.stageName}>{crop.currentStage.name}</Text>
              <Text style={styles.stageDescription}>{crop.currentStage.description}</Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Stage Progress</Text>
                <Text style={styles.progressValue}>
                  {Math.round(crop.currentStage.completionPercentage)}%
                </Text>
              </View>
              <ProgressBar
                progress={crop.currentStage.completionPercentage / 100}
                color="#2196F3"
                style={styles.progressBar}
              />
            </View>

            <View style={styles.stageDetails}>
              <Text style={styles.detailsTitle}>Key Characteristics:</Text>
              {crop.currentStage.characteristics.map((char, index) => (
                <Text key={index} style={styles.characteristicItem}>• {char}</Text>
              ))}
            </View>

            <View style={styles.recommendations}>
              <Text style={styles.detailsTitle}>Recommended Actions:</Text>
              {crop.currentStage.recommendedActions.map((action, index) => (
                <Text key={index} style={styles.recommendationItem}>• {action}</Text>
              ))}
            </View>
          </Card.Content>
        </Card>

        {activePests.length > 0 && (
          <Card style={styles.alertCard}>
            <Card.Content>
              <View style={styles.alertHeader}>
                <Icon name="alert" size={24} color="#FF9800" />
                <Title style={styles.alertTitle}>Active Pest Alerts</Title>
                <Badge style={styles.pestCount}>{activePests.length}</Badge>
              </View>
              {activePests.slice(0, 3).map((pest) => (
                <View key={pest.id} style={styles.pestSummary}>
                  <Text style={styles.pestName}>{pest.pestName}</Text>
                  <Chip
                    mode="outlined"
                    style={[styles.severityChip, { borderColor: pest.severityLevel === 'critical' ? '#F44336' : '#FF9800' }]}
                    textStyle={{ color: pest.severityLevel === 'critical' ? '#F44336' : '#FF9800' }}
                    compact
                  >
                    {pest.severityLevel.toUpperCase()}
                  </Chip>
                </View>
              ))}
              <Button
                mode="outlined"
                onPress={() => setActiveTab('pests')}
                style={styles.viewAllPestsButton}
                compact
              >
                View All Pests
              </Button>
            </Card.Content>
          </Card>
        )}
      </View>
    );
  };

  const renderGrowthHistory = () => (
    <View>
      <Card style={styles.historyCard}>
        <Card.Content>
          <Title style={styles.historyTitle}>Growth Stage History</Title>
          {growthHistory.length === 0 ? (
            <Text style={styles.emptyText}>No growth history recorded yet</Text>
          ) : (
            growthHistory.map((stage, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyHeader}>
                  <Text style={styles.historyStage}>{stage.stageName}</Text>
                  <Text style={styles.historyDuration}>
                    {stage.actualDuration} days
                  </Text>
                </View>
                <Text style={styles.historyDates}>
                  {stage.startDate.toLocaleDateString()} - {stage.endDate?.toLocaleDateString()}
                </Text>
                <View style={styles.healthScoreRow}>
                  <Text style={styles.healthLabel}>Health Score:</Text>
                  <Text style={[styles.healthValue, { color: getHealthColor(stage.healthScore) }]}>
                    {stage.healthScore}/100
                  </Text>
                </View>
                {stage.notes && (
                  <Text style={styles.stageNotes}>{stage.notes}</Text>
                )}
                <Divider style={styles.historyDivider} />
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    </View>
  );

  const renderTreatments = () => (
    <View>
      <Card style={styles.treatmentsCard}>
        <Card.Content>
          <View style={styles.treatmentsHeader}>
            <Title style={styles.treatmentsTitle}>Treatment History</Title>
            <Button
              mode="contained"
              onPress={handleAddTreatment}
              compact
              icon="plus"
            >
              Add Treatment
            </Button>
          </View>
          
          {treatments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="medical-bag" size={48} color="#E0E0E0" />
              <Text style={styles.emptyText}>No treatments recorded</Text>
              <Button
                mode="outlined"
                onPress={handleAddTreatment}
                style={styles.addFirstButton}
                icon="plus"
              >
                Add First Treatment
              </Button>
            </View>
          ) : (
            treatments.map((treatment) => (
              <View key={treatment.id} style={styles.treatmentItem}>
                <View style={styles.treatmentHeader}>
                  <Text style={styles.treatmentName}>{treatment.name}</Text>
                  <Chip
                    mode="outlined"
                    style={styles.treatmentType}
                    compact
                  >
                    {treatment.type}
                  </Chip>
                </View>
                
                <Text style={styles.treatmentDate}>
                  Applied: {treatment.applicationDate.toLocaleDateString()}
                </Text>
                
                <View style={styles.treatmentDetails}>
                  <Text style={styles.treatmentDetail}>
                    Dosage: {treatment.dosage.amount} {treatment.dosage.unit}
                  </Text>
                  <Text style={styles.treatmentDetail}>
                    Method: {treatment.applicationMethod}
                  </Text>
                  <Text style={styles.treatmentDetail}>
                    Coverage: {treatment.coverage.area} acres ({treatment.coverage.percentage}%)
                  </Text>
                </View>

                {treatment.effectiveness > 0 && (
                  <View style={styles.effectivenessRow}>
                    <Text style={styles.effectivenessLabel}>Effectiveness:</Text>
                    <Text style={[styles.effectivenessValue, { 
                      color: treatment.effectiveness >= 80 ? '#4CAF50' : 
                             treatment.effectiveness >= 60 ? '#FF9800' : '#F44336' 
                    }]}>
                      {treatment.effectiveness}%
                    </Text>
                  </View>
                )}

                <Text style={styles.treatmentPurpose}>{treatment.purpose}</Text>
                <Divider style={styles.treatmentDivider} />
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    </View>
  );

  const renderPests = () => {
    const activePests = cropManagementService.getActivePests(cropId);
    
    return (
      <View>
        <Card style={styles.pestsCard}>
          <Card.Content>
            <View style={styles.pestsHeader}>
              <Title style={styles.pestsTitle}>Pest Monitoring</Title>
              <Button
                mode="contained"
                onPress={handleAddPestObservation}
                compact
                icon="plus"
              >
                Add Observation
              </Button>
            </View>

            {activePests.length > 0 && (
              <View style={styles.activePestsSection}>
                <Text style={styles.activePestsTitle}>Active Pests ({activePests.length})</Text>
                {activePests.map((pest) => (
                  <View key={pest.id} style={styles.activePestItem}>
                    <View style={styles.pestHeader}>
                      <Text style={styles.pestName}>{pest.pestName}</Text>
                      <Chip
                        mode="outlined"
                        style={[styles.severityChip, { 
                          borderColor: pest.severityLevel === 'critical' ? '#F44336' : 
                                      pest.severityLevel === 'high' ? '#FF9800' : '#4CAF50' 
                        }]}
                        textStyle={{ 
                          color: pest.severityLevel === 'critical' ? '#F44336' : 
                                pest.severityLevel === 'high' ? '#FF9800' : '#4CAF50' 
                        }}
                        compact
                      >
                        {pest.severityLevel.toUpperCase()}
                      </Chip>
                    </View>
                    
                    <Text style={styles.pestType}>{pest.pestType}</Text>
                    <Text style={styles.pestAffected}>
                      Affected Area: {pest.affectedArea.percentage}%
                    </Text>
                    <Text style={styles.pestDate}>
                      Detected: {pest.monitoringDate.toLocaleDateString()}
                    </Text>
                    
                    {pest.damageAssessment.estimatedYieldLoss > 0 && (
                      <Text style={styles.yieldLoss}>
                        Est. Yield Loss: {pest.damageAssessment.estimatedYieldLoss}%
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            <Divider style={styles.pestsDivider} />

            <Text style={styles.allPestsTitle}>All Observations ({pests.length})</Text>
            {pests.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="bug" size={48} color="#E0E0E0" />
                <Text style={styles.emptyText}>No pest observations recorded</Text>
                <Button
                  mode="outlined"
                  onPress={handleAddPestObservation}
                  style={styles.addFirstButton}
                  icon="plus"
                >
                  Add First Observation
                </Button>
              </View>
            ) : (
              pests.slice(0, 10).map((pest) => (
                <View key={pest.id} style={styles.pestHistoryItem}>
                  <View style={styles.pestHistoryHeader}>
                    <Text style={styles.pestHistoryName}>{pest.pestName}</Text>
                    <Text style={styles.pestHistoryDate}>
                      {pest.monitoringDate.toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.pestHistoryDetails}>
                    {pest.pestType} • {pest.severityLevel} severity • {pest.affectedArea.percentage}% affected
                  </Text>
                </View>
              ))
            )}
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderPredictions = () => {
    if (!crop) return null;

    const prediction = crop.predictions.yield;
    const harvestPrediction = crop.predictions.harvest;

    return (
      <View>
        <Card style={styles.predictionsCard}>
          <Card.Content>
            <View style={styles.predictionsHeader}>
              <Title style={styles.predictionsTitle}>Yield Predictions</Title>
              <Button
                mode="outlined"
                onPress={handleUpdatePredictions}
                compact
                icon="refresh"
              >
                Update
              </Button>
            </View>

            <View style={styles.yieldPrediction}>
              <View style={styles.yieldMain}>
                <Text style={styles.yieldAmount}>
                  {Math.round(prediction.predictedYield.amount)}
                </Text>
                <Text style={styles.yieldUnit}>{prediction.predictedYield.unit}</Text>
              </View>
              
              <View style={styles.yieldRange}>
                <Text style={styles.rangeLabel}>Range:</Text>
                <Text style={styles.rangeValue}>
                  {Math.round(prediction.predictedYield.range.min)} - {Math.round(prediction.predictedYield.range.max)}
                </Text>
              </View>

              <View style={styles.confidenceRow}>
                <Text style={styles.confidenceLabel}>Confidence:</Text>
                <Text style={[styles.confidenceValue, { 
                  color: prediction.predictedYield.confidence >= 80 ? '#4CAF50' : 
                         prediction.predictedYield.confidence >= 60 ? '#FF9800' : '#F44336' 
                }]}>
                  {prediction.predictedYield.confidence}%
                </Text>
              </View>
            </View>

            <Divider style={styles.predictionsDivider} />

            <Text style={styles.qualityTitle}>Quality Prediction</Text>
            <View style={styles.qualityPrediction}>
              <Text style={styles.qualityGrade}>{prediction.qualityPrediction.grade}</Text>
              <Text style={styles.qualityConfidence}>
                {Math.round(prediction.qualityPrediction.confidence)}% confidence
              </Text>
            </View>

            <Divider style={styles.predictionsDivider} />

            <Text style={styles.harvestTitle}>Harvest Timing</Text>
            <View style={styles.harvestTiming}>
              <Text style={styles.harvestDate}>
                Optimal Date: {harvestPrediction.optimalDate.toLocaleDateString()}
              </Text>
              <Text style={styles.harvestWindow}>
                Quality Window: {harvestPrediction.qualityWindow.start.toLocaleDateString()} - {harvestPrediction.qualityWindow.end.toLocaleDateString()}
              </Text>
              <View style={styles.riskRow}>
                <Text style={styles.riskLabel}>Weather Risk:</Text>
                <Chip
                  mode="outlined"
                  style={[styles.riskChip, { 
                    borderColor: harvestPrediction.weatherRisk === 'high' ? '#F44336' : 
                                harvestPrediction.weatherRisk === 'medium' ? '#FF9800' : '#4CAF50' 
                  }]}
                  textStyle={{ 
                    color: harvestPrediction.weatherRisk === 'high' ? '#F44336' : 
                           harvestPrediction.weatherRisk === 'medium' ? '#FF9800' : '#4CAF50' 
                  }}
                  compact
                >
                  {harvestPrediction.weatherRisk.toUpperCase()}
                </Chip>
              </View>
            </View>

            <Divider style={styles.predictionsDivider} />

            <Text style={styles.factorsTitle}>Contributing Factors</Text>
            <View style={styles.factors}>
              {Object.entries(prediction.factors).map(([key, factor]) => (
                <View key={key} style={styles.factorItem}>
                  <Text style={styles.factorName}>{key.charAt(0).toUpperCase() + key.slice(1)}:</Text>
                  <Text style={[styles.factorInfluence, { 
                    color: (factor as any).influence > 0 ? '#4CAF50' : 
                           (factor as any).influence < 0 ? '#F44336' : '#666' 
                  }]}>
                    {(factor as any).influence > 0 ? '+' : ''}{(factor as any).influence}%
                  </Text>
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'growth':
        return renderGrowthHistory();
      case 'treatments':
        return renderTreatments();
      case 'pests':
        return renderPests();
      case 'predictions':
        return renderPredictions();
      default:
        return renderOverview();
    }
  };

  if (!crop) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading crop details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderTabBar()}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderContent()}
      </ScrollView>
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
  tabBar: {
    elevation: 2,
    paddingVertical: 8,
  },
  tabButton: {
    marginHorizontal: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  overviewCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cropVariety: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusChip: {
    height: 24,
  },
  fieldText: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    marginVertical: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
  },
  stageCard: {
    marginBottom: 16,
    elevation: 2,
  },
  stageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  stageInfo: {
    marginBottom: 16,
  },
  stageName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  stageDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  stageDetails: {
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  characteristicItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
    lineHeight: 18,
  },
  recommendations: {
    marginTop: 8,
  },
  recommendationItem: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
    lineHeight: 18,
  },
  alertCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#FFF8E1',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  pestCount: {
    backgroundColor: '#FF9800',
  },
  pestSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pestName: {
    fontSize: 14,
    fontWeight: '500',
  },
  severityChip: {
    height: 20,
  },
  viewAllPestsButton: {
    marginTop: 8,
  },
  historyCard: {
    marginBottom: 16,
    elevation: 2,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  historyItem: {
    marginBottom: 16,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyStage: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyDuration: {
    fontSize: 14,
    color: '#666',
  },
  historyDates: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  healthScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  healthLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  healthValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stageNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  historyDivider: {
    marginTop: 12,
  },
  treatmentsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  treatmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  treatmentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    marginBottom: 16,
  },
  addFirstButton: {
    minWidth: 200,
  },
  treatmentItem: {
    marginBottom: 16,
  },
  treatmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  treatmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  treatmentType: {
    height: 24,
  },
  treatmentDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  treatmentDetails: {
    marginBottom: 8,
  },
  treatmentDetail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  effectivenessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  effectivenessLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  effectivenessValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  treatmentPurpose: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  treatmentDivider: {
    marginTop: 12,
  },
  pestsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  pestsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  pestsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  activePestsSection: {
    marginBottom: 16,
  },
  activePestsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#FF9800',
  },
  activePestItem: {
    backgroundColor: '#FFF8E1',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  pestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pestType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  pestAffected: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  pestDate: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  yieldLoss: {
    fontSize: 13,
    color: '#F44336',
    fontWeight: 'bold',
  },
  pestsDivider: {
    marginVertical: 16,
  },
  allPestsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  pestHistoryItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  pestHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  pestHistoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  pestHistoryDate: {
    fontSize: 12,
    color: '#666',
  },
  pestHistoryDetails: {
    fontSize: 12,
    color: '#999',
  },
  predictionsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  predictionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  predictionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  yieldPrediction: {
    alignItems: 'center',
    marginBottom: 16,
  },
  yieldMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  yieldAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  yieldUnit: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  yieldRange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rangeLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  rangeValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  predictionsDivider: {
    marginVertical: 16,
  },
  qualityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  qualityPrediction: {
    alignItems: 'center',
  },
  qualityGrade: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  qualityConfidence: {
    fontSize: 14,
    color: '#666',
  },
  harvestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  harvestTiming: {
    marginBottom: 16,
  },
  harvestDate: {
    fontSize: 14,
    marginBottom: 4,
  },
  harvestWindow: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  riskChip: {
    height: 24,
  },
  factorsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  factors: {
    gap: 8,
  },
  factorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  factorName: {
    fontSize: 14,
    color: '#666',
  },
  factorInfluence: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CropDetailsScreen;