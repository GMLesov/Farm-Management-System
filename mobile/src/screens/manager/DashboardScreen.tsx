import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Text,
  ActivityIndicator,
  Chip,
  IconButton,
  ProgressBar,
  Button,
  Surface,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { PieChart, BarChart, LineChart } from 'react-native-chart-kit';

import { RootState, AppDispatch } from '../../store';
import { fetchDashboardMetrics, fetchChartData } from '../../store/slices/dashboardSlice';
import { OfflineStatusBar } from '../../components/OfflineStatus';

const { width: screenWidth } = Dimensions.get('window');

const ManagerDashboardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { animals } = useSelector((state: RootState) => state.animals);
  const { crops } = useSelector((state: RootState) => state.crops);
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const { metrics, isLoading, chartData } = useSelector((state: RootState) => state.dashboard);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    if (user?.farmId) {
      setRefreshing(true);
      await Promise.all([
        dispatch(fetchDashboardMetrics(user.farmId)),
        dispatch(fetchChartData(user.farmId)),
      ]);
      setRefreshing(false);
    }
  }, [dispatch, user?.farmId]);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.farmId) {
        dispatch(fetchDashboardMetrics(user.farmId));
        dispatch(fetchChartData(user.farmId));
      }
    }, [dispatch, user?.farmId])
  );

  // Calculate analytics data
  const analytics = useMemo(() => {
    // Animal analytics
    const totalAnimals = animals?.length || 0;
    const healthyAnimals = animals?.filter(a => a.healthStatus === 'healthy').length || 0;
    const sickAnimals = animals?.filter(a => a.healthStatus === 'sick').length || 0;
    const treatmentAnimals = animals?.filter(a => a.healthStatus === 'treatment').length || 0;
    const quarantineAnimals = animals?.filter(a => a.healthStatus === 'quarantine').length || 0;

    // Task analytics
    const totalTasks = tasks?.length || 0;
    const pendingTasks = tasks?.filter(t => t.status === 'pending').length || 0;
    const inProgressTasks = tasks?.filter(t => t.status === 'in-progress').length || 0;
    const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
    const overdueTasks = tasks?.filter(t => t.status === 'overdue').length || 0;

    // Crop analytics
    const totalCrops = crops?.length || 0;
    const plantedCrops = crops?.filter(c => c.stage === 'planted').length || 0;
    const growingCrops = crops?.filter(c => c.stage === 'growing').length || 0;
    const floweringCrops = crops?.filter(c => c.stage === 'flowering').length || 0;
    const fruitingCrops = crops?.filter(c => c.stage === 'fruiting').length || 0;
    const harvestedCrops = crops?.filter(c => c.stage === 'harvested').length || 0;

    return {
      animals: { total: totalAnimals, healthy: healthyAnimals, sick: sickAnimals, treatment: treatmentAnimals, quarantine: quarantineAnimals },
      tasks: { total: totalTasks, pending: pendingTasks, inProgress: inProgressTasks, completed: completedTasks, overdue: overdueTasks },
      crops: { total: totalCrops, planted: plantedCrops, growing: growingCrops, flowering: floweringCrops, fruiting: fruitingCrops, harvested: harvestedCrops },
    };
  }, [animals, tasks, crops]);

  const getTaskCompletionRate = () => {
    if (analytics.tasks.total === 0) return 0;
    return Math.round((analytics.tasks.completed / analytics.tasks.total) * 100);
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Offline Status Bar */}
      <OfflineStatusBar />
      
      {/* Welcome Header */}
      <Card style={styles.welcomeCard}>
        <Card.Content>
          <Title style={styles.welcomeTitle}>Welcome back, {user?.name || 'Manager'}!</Title>
          <Paragraph style={styles.welcomeSubtitle}>
            Here's your farm overview for today
          </Paragraph>
        </Card.Content>
      </Card>

      {/* Key Metrics Row */}
      <View style={styles.metricsRow}>
        <Surface style={[styles.metricCard, styles.animalsMetric]}>
          <Text style={styles.metricNumber}>{analytics.animals.total}</Text>
          <Text style={styles.metricLabel}>Animals</Text>
          <Text style={styles.metricSubtext}>{analytics.animals.healthy} healthy</Text>
        </Surface>

        <Surface style={[styles.metricCard, styles.cropsMetric]}>
          <Text style={styles.metricNumber}>{analytics.crops.total}</Text>
          <Text style={styles.metricLabel}>Crops</Text>
          <Text style={styles.metricSubtext}>{analytics.crops.growing} growing</Text>
        </Surface>

        <Surface style={[styles.metricCard, styles.tasksMetric]}>
          <Text style={styles.metricNumber}>{analytics.tasks.total}</Text>
          <Text style={styles.metricLabel}>Tasks</Text>
          <Text style={styles.metricSubtext}>{analytics.tasks.pending} pending</Text>
        </Surface>
      </View>

      {/* Task Completion Progress */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title style={styles.cardTitle}>Task Completion Rate</Title>
            <Chip mode="outlined" style={styles.percentageChip}>
              {getTaskCompletionRate()}%
            </Chip>
          </View>
          <ProgressBar 
            progress={getTaskCompletionRate() / 100} 
            color="#4CAF50" 
            style={styles.progressBar}
          />
          <View style={styles.taskBreakdown}>
            <View style={styles.taskStat}>
              <Text style={styles.taskStatNumber}>{analytics.tasks.completed}</Text>
              <Text style={styles.taskStatLabel}>Completed</Text>
            </View>
            <View style={styles.taskStat}>
              <Text style={[styles.taskStatNumber, { color: '#FF9800' }]}>{analytics.tasks.inProgress}</Text>
              <Text style={styles.taskStatLabel}>In Progress</Text>
            </View>
            <View style={styles.taskStat}>
              <Text style={[styles.taskStatNumber, { color: '#F44336' }]}>{analytics.tasks.overdue}</Text>
              <Text style={styles.taskStatLabel}>Overdue</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Animal Health Status */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Animal Health Overview</Title>
          <View style={styles.healthOverview}>
            <View style={styles.healthStat}>
              <Text style={[styles.healthNumber, { color: '#4CAF50' }]}>{analytics.animals.healthy}</Text>
              <Text style={styles.healthLabel}>Healthy</Text>
            </View>
            <View style={styles.healthStat}>
              <Text style={[styles.healthNumber, { color: '#FF9800' }]}>{analytics.animals.sick}</Text>
              <Text style={styles.healthLabel}>Sick</Text>
            </View>
            <View style={styles.healthStat}>
              <Text style={[styles.healthNumber, { color: '#F44336' }]}>{analytics.animals.treatment}</Text>
              <Text style={styles.healthLabel}>Treatment</Text>
            </View>
            <View style={styles.healthStat}>
              <Text style={[styles.healthNumber, { color: '#9C27B0' }]}>{analytics.animals.quarantine}</Text>
              <Text style={styles.healthLabel}>Quarantine</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Crop Stages */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Crop Growth Stages</Title>
          <View style={styles.cropStages}>
            <View style={styles.cropStage}>
              <Text style={styles.cropStageNumber}>{analytics.crops.planted}</Text>
              <Text style={styles.cropStageLabel}>Planted</Text>
            </View>
            <View style={styles.cropStage}>
              <Text style={styles.cropStageNumber}>{analytics.crops.growing}</Text>
              <Text style={styles.cropStageLabel}>Growing</Text>
            </View>
            <View style={styles.cropStage}>
              <Text style={styles.cropStageNumber}>{analytics.crops.flowering}</Text>
              <Text style={styles.cropStageLabel}>Flowering</Text>
            </View>
            <View style={styles.cropStage}>
              <Text style={styles.cropStageNumber}>{analytics.crops.fruiting}</Text>
              <Text style={styles.cropStageLabel}>Fruiting</Text>
            </View>
            <View style={styles.cropStage}>
              <Text style={styles.cropStageNumber}>{analytics.crops.harvested}</Text>
              <Text style={styles.cropStageLabel}>Harvested</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Quick Actions</Title>
          <View style={styles.quickActions}>
            <Button 
              mode="outlined" 
              icon="plus"
              style={styles.actionButton}
              onPress={() => {/* Navigate to AddAnimal */}}
            >
              Add Animal
            </Button>
            <Button 
              mode="outlined" 
              icon="seedling"
              style={styles.actionButton}
              onPress={() => {/* Navigate to AddCrop */}}
            >
              Plant Crop
            </Button>
            <Button 
              mode="outlined" 
              icon="clipboard-plus"
              style={styles.actionButton}
              onPress={() => {/* Navigate to AddTask */}}
            >
              Create Task
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
  welcomeCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: '#4CAF50',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#E8F5E8',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  metricCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    alignItems: 'center',
  },
  animalsMetric: {
    backgroundColor: '#E3F2FD',
  },
  cropsMetric: {
    backgroundColor: '#E8F5E8',
  },
  tasksMetric: {
    backgroundColor: '#FFF3E0',
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  metricSubtext: {
    fontSize: 12,
    color: '#888',
  },
  card: {
    margin: 16,
    marginVertical: 8,
    elevation: 4,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  percentageChip: {
    backgroundColor: '#E8F5E8',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 16,
  },
  taskBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  taskStat: {
    alignItems: 'center',
  },
  taskStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  taskStatLabel: {
    fontSize: 12,
    color: '#666',
  },
  healthOverview: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  healthStat: {
    alignItems: 'center',
  },
  healthNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  healthLabel: {
    fontSize: 12,
    color: '#666',
  },
  cropStages: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  cropStage: {
    alignItems: 'center',
  },
  cropStageNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  cropStageLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default ManagerDashboardScreen;