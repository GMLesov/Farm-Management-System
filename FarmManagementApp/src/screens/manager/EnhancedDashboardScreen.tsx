import React, { useEffect, useState } from 'react';
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
  Text,
  ProgressBar,
  Button,
  Chip,
  Surface,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { RootState, AppDispatch } from '../../store';
import { fetchDashboardMetrics, fetchChartData } from '../../store/slices/dashboardSlice';
import { OfflineStatusBar } from '../../components/OfflineStatus';
import {
  AnalyticsCard,
  ChartCard,
  FarmHealthOverview,
  ProductivityTrends,
  FinancialSummary,
} from '../../components/DashboardCharts';
import WeatherWidget from '../../components/WeatherWidget';

const { width: screenWidth } = Dimensions.get('window');

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  onPress: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon,
  color,
  onPress,
}) => {
  return (
    <Card style={[styles.quickActionCard, { borderLeftColor: color }]} onPress={onPress}>
      <Card.Content style={styles.quickActionContent}>
        <View style={styles.quickActionHeader}>
          <MaterialCommunityIcons name={icon} size={32} color={color} />
          <View style={styles.quickActionText}>
            <Text style={styles.quickActionTitle}>{title}</Text>
            <Text style={styles.quickActionDescription}>{description}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const EnhancedManagerDashboardScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { animals } = useSelector((state: RootState) => state.animals);
  const { crops } = useSelector((state: RootState) => state.crops);
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const { metrics, isLoading } = useSelector((state: RootState) => state.dashboard);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week');

  // Calculate enhanced analytics from existing data
  const analytics = React.useMemo(() => {
    const healthyAnimals = animals.filter(a => a.healthStatus === 'healthy').length;
    const sickAnimals = animals.filter(a => a.healthStatus === 'sick').length;
    const treatmentAnimals = animals.filter(a => a.healthStatus === 'treatment').length;
    const quarantineAnimals = animals.filter(a => a.healthStatus === 'quarantine').length;

    const activeCrops = crops.filter(c => c.stage !== 'harvested').length;
    const harvestedCrops = crops.filter(c => c.stage === 'harvested').length;

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const overdueTasks = tasks.filter(t => t.status === 'overdue').length;

    // Calculate completion rate
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Calculate growth trends (mock data for now)
    const mockTrends = {
      animalGrowth: 5.2,
      cropGrowth: 12.3,
      taskEfficiency: 8.7,
      revenueGrowth: 15.4,
    };

    return {
      animals: {
        total: animals.length,
        healthy: healthyAnimals,
        sick: sickAnimals,
        treatment: treatmentAnimals,
        quarantine: quarantineAnimals,
        growth: mockTrends.animalGrowth,
      },
      crops: {
        total: crops.length,
        active: activeCrops,
        harvested: harvestedCrops,
        readyForHarvest: crops.filter(c => c.stage === 'flowering').length,
        growth: mockTrends.cropGrowth,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        pending: pendingTasks,
        overdue: overdueTasks,
        completionRate,
        efficiency: mockTrends.taskEfficiency,
      },
      financial: {
        monthlyRevenue: metrics?.monthlyRevenue || 0,
        monthlyExpenses: metrics?.monthlyExpenses || 0,
        profit: (metrics?.monthlyRevenue || 0) - (metrics?.monthlyExpenses || 0),
        growth: mockTrends.revenueGrowth,
      },
    };
  }, [animals, crops, tasks, metrics]);

  // Mock chart data
  const mockChartData = {
    productivity: {
      labels: selectedPeriod === 'week' 
        ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        : selectedPeriod === 'month'
        ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        : ['2022', '2023', '2024'],
      datasets: [{
        data: selectedPeriod === 'week'
          ? [12, 18, 15, 22, 28, 25, 20]
          : selectedPeriod === 'month'
          ? [120, 145, 167, 189, 210, 185]
          : [1200, 1850, 2340],
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      }],
    },
    financial: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          data: [25000, 28000, 32000, 35000, 31000, 38000],
          color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
        },
        {
          data: [18000, 19500, 21000, 22500, 20000, 24000],
          color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
        },
      ],
    },
  };

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
        onRefresh();
      }
    }, [user?.farmId, onRefresh])
  );

  const quickActions = [
    {
      title: 'Add Animal',
      description: 'Register new livestock',
      icon: 'cow',
      color: '#4CAF50',
      onPress: () => {/* Navigate to add animal */},
    },
    {
      title: 'Create Task',
      description: 'Assign new work',
      icon: 'clipboard-plus',
      color: '#2196F3',
      onPress: () => {/* Navigate to add task */},
    },
    {
      title: 'Health Check',
      description: 'Record animal health',
      icon: 'stethoscope',
      color: '#FF9800',
      onPress: () => {/* Navigate to health check */},
    },
    {
      title: 'Harvest Log',
      description: 'Record crop harvest',
      icon: 'corn',
      color: '#8BC34A',
      onPress: () => {/* Navigate to harvest */},
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <OfflineStatusBar />
      
      {/* Header */}
      <Surface style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back, {user?.name || 'Farm Manager'}</Text>
        <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</Text>
      </Surface>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Quick Actions</Title>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} {...action} />
          ))}
        </View>
      </View>

      {/* Key Metrics */}
      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Farm Overview</Title>
        <View style={styles.metricsGrid}>
          <AnalyticsCard
            title="Total Animals"
            value={analytics.animals.total}
            subtitle={`${analytics.animals.healthy} healthy`}
            icon="cow"
            color="#4CAF50"
            trend={{
              value: analytics.animals.growth,
              isPositive: analytics.animals.growth > 0,
            }}
          />
          
          <AnalyticsCard
            title="Active Crops"
            value={analytics.crops.active}
            subtitle={`${analytics.crops.readyForHarvest} ready for harvest`}
            icon="corn"
            color="#8BC34A"
            trend={{
              value: analytics.crops.growth,
              isPositive: analytics.crops.growth > 0,
            }}
          />
          
          <AnalyticsCard
            title="Task Completion"
            value={`${analytics.tasks.completionRate.toFixed(1)}%`}
            subtitle={`${analytics.tasks.completed}/${analytics.tasks.total} completed`}
            icon="clipboard-check"
            color="#2196F3"
            trend={{
              value: analytics.tasks.efficiency,
              isPositive: analytics.tasks.efficiency > 0,
            }}
          />
          
          <AnalyticsCard
            title="Monthly Profit"
            value={`$${analytics.financial.profit.toLocaleString()}`}
            subtitle={`Revenue: $${analytics.financial.monthlyRevenue.toLocaleString()}`}
            icon="currency-usd"
            color="#FF9800"
            trend={{
              value: analytics.financial.growth,
              isPositive: analytics.financial.growth > 0,
            }}
          />
        </View>
      </View>

      {/* Weather Information */}
      <View style={styles.section}>
        <WeatherWidget farmLocation="Your Farm" />
      </View>

      {/* Health Overview Chart */}
      <View style={styles.section}>
        <FarmHealthOverview
          animalHealth={{
            healthy: analytics.animals.healthy,
            sick: analytics.animals.sick,
            treatment: analytics.animals.treatment,
            quarantine: analytics.animals.quarantine,
          }}
          cropHealth={{
            excellent: Math.floor(analytics.crops.active * 0.6),
            good: Math.floor(analytics.crops.active * 0.3),
            poor: Math.floor(analytics.crops.active * 0.08),
            critical: Math.floor(analytics.crops.active * 0.02),
          }}
        />
      </View>

      {/* Productivity Trends */}
      <View style={styles.section}>
        <ProductivityTrends
          data={mockChartData.productivity}
          period={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
      </View>

      {/* Financial Summary */}
      <View style={styles.section}>
        <FinancialSummary
          revenue={analytics.financial.monthlyRevenue}
          expenses={analytics.financial.monthlyExpenses}
          profit={analytics.financial.profit}
          monthlyData={mockChartData.financial}
        />
      </View>

      {/* Alerts and Notifications */}
      <View style={styles.section}>
        <ChartCard title="Farm Alerts">
          <View style={styles.alertsContainer}>
            {analytics.animals.sick > 0 && (
              <View style={[styles.alert, { backgroundColor: '#FFEBEE' }]}>
                <MaterialCommunityIcons name="alert-circle" size={20} color="#F44336" />
                <Text style={[styles.alertText, { color: '#F44336' }]}>
                  {analytics.animals.sick} animals need medical attention
                </Text>
              </View>
            )}
            
            {analytics.tasks.overdue > 0 && (
              <View style={[styles.alert, { backgroundColor: '#FFF3E0' }]}>
                <MaterialCommunityIcons name="clock-alert" size={20} color="#FF9800" />
                <Text style={[styles.alertText, { color: '#FF9800' }]}>
                  {analytics.tasks.overdue} tasks are overdue
                </Text>
              </View>
            )}
            
            {analytics.crops.readyForHarvest > 0 && (
              <View style={[styles.alert, { backgroundColor: '#E8F5E8' }]}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
                <Text style={[styles.alertText, { color: '#4CAF50' }]}>
                  {analytics.crops.readyForHarvest} crops ready for harvest
                </Text>
              </View>
            )}
            
            {analytics.animals.sick === 0 && analytics.tasks.overdue === 0 && analytics.crops.readyForHarvest === 0 && (
              <View style={[styles.alert, { backgroundColor: '#E8F5E8' }]}>
                <MaterialCommunityIcons name="check-all" size={20} color="#4CAF50" />
                <Text style={[styles.alertText, { color: '#4CAF50' }]}>
                  All systems running smoothly!
                </Text>
              </View>
            )}
          </View>
        </ChartCard>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  quickActionCard: {
    width: (screenWidth - 48) / 2,
    margin: 8,
    borderLeftWidth: 4,
    borderRadius: 8,
    elevation: 2,
  },
  quickActionContent: {
    padding: 16,
  },
  quickActionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionText: {
    marginLeft: 12,
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#666',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  alertsContainer: {
    marginTop: 8,
  },
  alert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  alertText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default EnhancedManagerDashboardScreen;