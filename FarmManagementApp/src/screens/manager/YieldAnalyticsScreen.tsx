/**
 * Yield Analytics Screen
 * Advanced yield prediction, performance analysis, and optimization insights
 * with machine learning-powered forecasting and historical comparisons
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
  SegmentedButtons
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

import { 
  cropManagementService, 
  Crop, 
  YieldPrediction 
} from '../../services/CropManagementService';

const { width } = Dimensions.get('window');
const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
  propsForLabels: {
    fontSize: 12,
  },
};

interface YieldAnalyticsStats {
  totalPredictedYield: number;
  avgConfidence: number;
  topPerformingCrop: string;
  yieldVariance: number;
  seasonProgress: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface CropYieldAnalytics {
  crop: Crop;
  prediction: YieldPrediction;
  analytics: any;
  performanceScore: number;
  riskFactors: string[];
  opportunities: string[];
}

const YieldAnalyticsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [yieldAnalytics, setYieldAnalytics] = useState<CropYieldAnalytics[]>([]);
  const [stats, setStats] = useState<YieldAnalyticsStats>({
    totalPredictedYield: 0,
    avgConfidence: 0,
    topPerformingCrop: '',
    yieldVariance: 0,
    seasonProgress: 0,
    riskLevel: 'low'
  });
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'predictions' | 'performance' | 'factors'>('overview');
  const [timeRange, setTimeRange] = useState<'current' | 'season' | 'historical'>('current');

  const loadAnalyticsData = useCallback(async () => {
    try {
      const allCrops = cropManagementService.getAllCrops().filter(crop => 
        crop.status === 'growing' || crop.status === 'planted'
      );
      setCrops(allCrops);

      // Generate yield analytics for each crop
      const analytics: CropYieldAnalytics[] = [];
      let totalYield = 0;
      let totalConfidence = 0;
      let highestYield = 0;
      let topCrop = '';
      const yields: number[] = [];

      for (const crop of allCrops) {
        const cropAnalytics = cropManagementService.getCropAnalytics(crop.id);
        const prediction = crop.predictions.yield;
        
        if (prediction && cropAnalytics) {
          const performanceScore = calculatePerformanceScore(crop, prediction, cropAnalytics);
          const riskFactors = extractRiskFactors(prediction);
          const opportunities = extractOpportunities(crop, prediction);

          analytics.push({
            crop,
            prediction,
            analytics: cropAnalytics,
            performanceScore,
            riskFactors,
            opportunities
          });

          totalYield += prediction.predictedYield.amount;
          totalConfidence += prediction.predictedYield.confidence;
          yields.push(prediction.predictedYield.amount);

          if (prediction.predictedYield.amount > highestYield) {
            highestYield = prediction.predictedYield.amount;
            topCrop = crop.name;
          }
        }
      }

      setYieldAnalytics(analytics);

      // Calculate summary statistics
      const avgConfidence = allCrops.length > 0 ? totalConfidence / allCrops.length : 0;
      const variance = calculateVariance(yields);
      const avgSeasonProgress = allCrops.length > 0 ?
        allCrops.reduce((sum, crop) => {
          const daysPlanted = Math.ceil((Date.now() - crop.plantingDate.getTime()) / (1000 * 60 * 60 * 24));
          const totalDays = Math.ceil((crop.expectedHarvestDate.getTime() - crop.plantingDate.getTime()) / (1000 * 60 * 60 * 24));
          return sum + (daysPlanted / totalDays) * 100;
        }, 0) / allCrops.length : 0;

      const riskLevel = assessOverallRisk(analytics);

      setStats({
        totalPredictedYield: Math.round(totalYield),
        avgConfidence: Math.round(avgConfidence),
        topPerformingCrop: topCrop,
        yieldVariance: Math.round(variance * 100) / 100,
        seasonProgress: Math.round(avgSeasonProgress),
        riskLevel
      });
    } catch (error) {
      console.error('Failed to load yield analytics:', error);
      Alert.alert('Error', 'Failed to load yield analytics. Please try again.');
    }
  }, []);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAnalyticsData();
    setRefreshing(false);
  }, [loadAnalyticsData]);

  const calculatePerformanceScore = (crop: Crop, prediction: YieldPrediction, analytics: any): number => {
    let score = 50; // Base score

    // Factor in health score
    score += (analytics.metrics.healthScore - 70) * 0.5;

    // Factor in prediction confidence
    score += (prediction.predictedYield.confidence - 60) * 0.3;

    // Factor in weather influence
    if (prediction.factors.weather.influence > 0) {
      score += prediction.factors.weather.influence * 0.2;
    }

    // Factor in management practices
    score += prediction.factors.management.influence * 0.1;

    // Penalize for pest influence
    score += prediction.factors.pests.influence * 0.3;

    return Math.min(100, Math.max(0, Math.round(score)));
  };

  const extractRiskFactors = (prediction: YieldPrediction): string[] => {
    const risks: string[] = [];

    if (prediction.factors.weather.influence < -10) {
      risks.push('Weather stress impacting yield');
    }

    if (prediction.factors.pests.influence < -5) {
      risks.push('Pest pressure reducing yield');
    }

    if (prediction.predictedYield.confidence < 70) {
      risks.push('Low prediction confidence');
    }

    if (prediction.factors.weather.riskFactors.length > 0) {
      risks.push(...prediction.factors.weather.riskFactors);
    }

    return risks.slice(0, 3); // Limit to top 3 risks
  };

  const extractOpportunities = (crop: Crop, prediction: YieldPrediction): string[] => {
    const opportunities: string[] = [];

    if (prediction.factors.management.influence > 5) {
      opportunities.push('Excellent management practices');
    }

    if (prediction.factors.weather.influence > 10) {
      opportunities.push('Favorable weather conditions');
    }

    if (prediction.predictedYield.confidence > 80) {
      opportunities.push('High confidence prediction');
    }

    // Check for growth stage opportunities
    if (crop.currentStage.weatherSensitivity === 'low') {
      opportunities.push('Low weather risk stage');
    }

    return opportunities.slice(0, 3); // Limit to top 3 opportunities
  };

  const calculateVariance = (values: number[]): number => {
    if (values.length === 0) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return variance;
  };

  const assessOverallRisk = (analytics: CropYieldAnalytics[]): 'low' | 'medium' | 'high' => {
    if (analytics.length === 0) return 'low';

    const avgConfidence = analytics.reduce((sum, a) => sum + a.prediction.predictedYield.confidence, 0) / analytics.length;
    const highRiskCount = analytics.filter(a => a.riskFactors.length > 1).length;
    const lowPerformanceCount = analytics.filter(a => a.performanceScore < 60).length;

    if (avgConfidence < 60 || highRiskCount / analytics.length > 0.5 || lowPerformanceCount / analytics.length > 0.3) {
      return 'high';
    }

    if (avgConfidence < 75 || highRiskCount / analytics.length > 0.3 || lowPerformanceCount / analytics.length > 0.2) {
      return 'medium';
    }

    return 'low';
  };

  const handleUpdatePredictions = async () => {
    for (const crop of crops) {
      cropManagementService.updateYieldPrediction(crop.id);
    }
    await loadAnalyticsData();
    Alert.alert('Success', 'All yield predictions updated successfully');
  };

  const renderOverviewStats = () => (
    <Card style={styles.statsCard}>
      <Card.Content>
        <Title style={styles.statsTitle}>Yield Analytics Overview</Title>
        
        <View style={styles.mainStats}>
          <View style={styles.primaryStat}>
            <Text style={styles.primaryValue}>{stats.totalPredictedYield.toLocaleString()}</Text>
            <Text style={styles.primaryLabel}>Total Predicted Yield (units)</Text>
          </View>
          
          <View style={styles.secondaryStats}>
            <View style={styles.secondaryStat}>
              <Text style={[styles.secondaryValue, { color: getConfidenceColor(stats.avgConfidence) }]}>
                {stats.avgConfidence}%
              </Text>
              <Text style={styles.secondaryLabel}>Avg Confidence</Text>
            </View>
            <View style={styles.secondaryStat}>
              <Text style={[styles.secondaryValue, { color: getRiskColor(stats.riskLevel) }]}>
                {stats.riskLevel.toUpperCase()}
              </Text>
              <Text style={styles.secondaryLabel}>Risk Level</Text>
            </View>
          </View>
        </View>

        <Divider style={styles.statsDivider} />

        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Season Progress</Text>
            <Text style={styles.progressValue}>{stats.seasonProgress}%</Text>
          </View>
          <ProgressBar
            progress={stats.seasonProgress / 100}
            color="#4CAF50"
            style={styles.progressBar}
          />
        </View>

        <View style={styles.additionalStats}>
          <View style={styles.additionalStat}>
            <Icon name="star" size={16} color="#FF9800" />
            <Text style={styles.additionalLabel}>Top Performer:</Text>
            <Text style={styles.additionalValue}>{stats.topPerformingCrop || 'N/A'}</Text>
          </View>
          <View style={styles.additionalStat}>
            <Icon name="chart-box-outline" size={16} color="#2196F3" />
            <Text style={styles.additionalLabel}>Yield Variance:</Text>
            <Text style={styles.additionalValue}>{stats.yieldVariance}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderYieldChart = () => {
    if (yieldAnalytics.length === 0) return null;

    const chartData = {
      labels: yieldAnalytics.map(a => a.crop.name.substring(0, 8)),
      datasets: [{
        data: yieldAnalytics.map(a => a.prediction.predictedYield.amount),
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        strokeWidth: 2
      }]
    };

    return (
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title style={styles.chartTitle}>Predicted Yield by Crop</Title>
          <BarChart
            data={chartData}
            width={width - 64}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={styles.chart}
            showValuesOnTopOfBars
          />
        </Card.Content>
      </Card>
    );
  };

  const renderConfidenceChart = () => {
    if (yieldAnalytics.length === 0) return null;

    const chartData = {
      labels: yieldAnalytics.map(a => a.crop.name.substring(0, 8)),
      datasets: [{
        data: yieldAnalytics.map(a => a.prediction.predictedYield.confidence),
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2
      }]
    };

    return (
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title style={styles.chartTitle}>Prediction Confidence</Title>
          <LineChart
            data={chartData}
            width={width - 64}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
            }}
            style={styles.chart}
            yAxisSuffix="%"
          />
        </Card.Content>
      </Card>
    );
  };

  const renderCropAnalytics = () => (
    <View>
      {yieldAnalytics.map((analytics) => (
        <Card key={analytics.crop.id} style={styles.cropCard}>
          <Card.Content>
            <View style={styles.cropHeader}>
              <View style={styles.cropInfo}>
                <Title style={styles.cropName}>{analytics.crop.name}</Title>
                <Text style={styles.cropVariety}>{analytics.crop.variety}</Text>
              </View>
              <Chip
                mode="outlined"
                style={[styles.performanceChip, { 
                  borderColor: getPerformanceColor(analytics.performanceScore) 
                }]}
                textStyle={{ color: getPerformanceColor(analytics.performanceScore) }}
                compact
              >
                {analytics.performanceScore}/100
              </Chip>
            </View>

            <View style={styles.yieldPrediction}>
              <View style={styles.yieldMain}>
                <Text style={styles.yieldAmount}>
                  {Math.round(analytics.prediction.predictedYield.amount)}
                </Text>
                <Text style={styles.yieldUnit}>{analytics.prediction.predictedYield.unit}</Text>
              </View>
              <Text style={styles.yieldConfidence}>
                {analytics.prediction.predictedYield.confidence}% confidence
              </Text>
            </View>

            <View style={styles.factorsGrid}>
              <View style={styles.factorItem}>
                <Icon name="weather-partly-cloudy" size={16} color="#666" />
                <Text style={[styles.factorValue, { 
                  color: analytics.prediction.factors.weather.influence >= 0 ? '#4CAF50' : '#F44336' 
                }]}>
                  {analytics.prediction.factors.weather.influence > 0 ? '+' : ''}
                  {analytics.prediction.factors.weather.influence}%
                </Text>
                <Text style={styles.factorLabel}>Weather</Text>
              </View>
              <View style={styles.factorItem}>
                <Icon name="account-hard-hat" size={16} color="#666" />
                <Text style={[styles.factorValue, { 
                  color: analytics.prediction.factors.management.influence >= 0 ? '#4CAF50' : '#F44336' 
                }]}>
                  {analytics.prediction.factors.management.influence > 0 ? '+' : ''}
                  {analytics.prediction.factors.management.influence}%
                </Text>
                <Text style={styles.factorLabel}>Management</Text>
              </View>
              <View style={styles.factorItem}>
                <Icon name="bug" size={16} color="#666" />
                <Text style={[styles.factorValue, { 
                  color: analytics.prediction.factors.pests.influence >= 0 ? '#4CAF50' : '#F44336' 
                }]}>
                  {analytics.prediction.factors.pests.influence > 0 ? '+' : ''}
                  {analytics.prediction.factors.pests.influence}%
                </Text>
                <Text style={styles.factorLabel}>Pests</Text>
              </View>
            </View>

            {analytics.riskFactors.length > 0 && (
              <View style={styles.riskSection}>
                <Text style={styles.riskTitle}>Risk Factors:</Text>
                {analytics.riskFactors.map((risk, index) => (
                  <Text key={index} style={styles.riskItem}>• {risk}</Text>
                ))}
              </View>
            )}

            {analytics.opportunities.length > 0 && (
              <View style={styles.opportunitySection}>
                <Text style={styles.opportunityTitle}>Opportunities:</Text>
                {analytics.opportunities.map((opportunity, index) => (
                  <Text key={index} style={styles.opportunityItem}>• {opportunity}</Text>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>
      ))}
    </View>
  );

  const renderContent = () => {
    switch (viewMode) {
      case 'overview':
        return (
          <View>
            {renderOverviewStats()}
            {renderYieldChart()}
            {renderConfidenceChart()}
          </View>
        );
      case 'predictions':
        return renderCropAnalytics();
      case 'performance':
        return (
          <View>
            {renderOverviewStats()}
            {renderCropAnalytics()}
          </View>
        );
      case 'factors':
        return renderCropAnalytics();
      default:
        return renderOverviewStats();
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 80) return '#4CAF50';
    if (confidence >= 60) return '#FF9800';
    return '#F44336';
  };

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      default: return '#666';
    }
  };

  const getPerformanceColor = (score: number): string => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.headerBar}>
        <View style={styles.headerContent}>
          <Title style={styles.headerTitle}>Yield Analytics</Title>
          <Button
            mode="outlined"
            onPress={handleUpdatePredictions}
            compact
            icon="refresh"
          >
            Update All
          </Button>
        </View>
        
        <SegmentedButtons
          value={viewMode}
          onValueChange={setViewMode as any}
          buttons={[
            { value: 'overview', label: 'Overview' },
            { value: 'predictions', label: 'Predictions' },
            { value: 'performance', label: 'Performance' },
            { value: 'factors', label: 'Factors' }
          ]}
          style={styles.segmentedButtons}
        />
      </Surface>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {yieldAnalytics.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Icon name="chart-line" size={64} color="#E0E0E0" />
              <Title style={styles.emptyTitle}>No Yield Data Available</Title>
              <Paragraph style={styles.emptyText}>
                Add crops and let them grow to see yield predictions and analytics here.
              </Paragraph>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('CropManagementDashboard')}
                style={styles.addCropsButton}
                icon="sprout"
              >
                Manage Crops
              </Button>
            </Card.Content>
          </Card>
        ) : (
          renderContent()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerBar: {
    elevation: 2,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
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
  mainStats: {
    marginBottom: 16,
  },
  primaryStat: {
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  primaryLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  secondaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  secondaryStat: {
    alignItems: 'center',
  },
  secondaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  secondaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statsDivider: {
    marginVertical: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  additionalStats: {
    gap: 8,
  },
  additionalStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  additionalLabel: {
    fontSize: 14,
    color: '#666',
  },
  additionalValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  chartCard: {
    marginBottom: 16,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  cropCard: {
    marginBottom: 12,
    elevation: 2,
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cropInfo: {
    flex: 1,
  },
  cropName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  cropVariety: {
    fontSize: 14,
    color: '#666',
  },
  performanceChip: {
    height: 28,
  },
  yieldPrediction: {
    alignItems: 'center',
    marginBottom: 16,
  },
  yieldMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  yieldAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  yieldUnit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  yieldConfidence: {
    fontSize: 14,
    color: '#666',
  },
  factorsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  factorItem: {
    alignItems: 'center',
    flex: 1,
  },
  factorValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 2,
  },
  factorLabel: {
    fontSize: 12,
    color: '#666',
  },
  riskSection: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  riskTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 4,
  },
  riskItem: {
    fontSize: 13,
    color: '#F44336',
    marginBottom: 2,
  },
  opportunitySection: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
  },
  opportunityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  opportunityItem: {
    fontSize: 13,
    color: '#4CAF50',
    marginBottom: 2,
  },
  emptyCard: {
    marginTop: 64,
    elevation: 1,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 48,
  },
  emptyTitle: {
    fontSize: 20,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  addCropsButton: {
    minWidth: 200,
  },
});

export default YieldAnalyticsScreen;