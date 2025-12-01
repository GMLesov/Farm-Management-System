import React, { useState, useEffect } from 'react';
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
  Subheading,
  Surface,
  Text,
  Button,
  Paragraph,
  FAB,
  DataTable,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';

import { RootState, AppDispatch } from '../../store';

const { width: screenWidth } = Dimensions.get('window');

interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: (opacity?: number) => string;
    strokeWidth?: number;
  }>;
}

const ReportsScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tasks } = useSelector((state: RootState) => state.tasks);
  const { animals } = useSelector((state: RootState) => state.animals);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    // Fetch relevant data for reports
    // dispatch(fetchTaskReports());
    // dispatch(fetchAnimalHealthReports());
  }, [dispatch, selectedPeriod]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh report data
    setRefreshing(false);
  };

  // Mock data for demonstrations
  const taskCompletionData: ChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [8, 12, 6, 15, 10, 8, 4],
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const taskCategoryData = [
    { name: 'Feeding', population: 35, color: '#4CAF50', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Health Check', population: 25, color: '#2196F3', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Cleaning', population: 20, color: '#FF9800', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Maintenance', population: 15, color: '#9C27B0', legendFontColor: '#333', legendFontSize: 12 },
    { name: 'Other', population: 5, color: '#607D8B', legendFontColor: '#333', legendFontSize: 12 },
  ];

  const animalHealthData: ChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        data: [95, 93, 96, 94],
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  const renderSummaryCards = () => (
    <View style={styles.summaryContainer}>
      <Surface style={styles.summaryCard}>
        <Icon name="assignment" size={32} color="#4CAF50" />
        <Text style={styles.summaryNumber}>24</Text>
        <Text style={styles.summaryLabel}>Tasks Completed</Text>
        <Text style={styles.summarySubtext}>This month</Text>
      </Surface>

      <Surface style={styles.summaryCard}>
        <Icon name="pets" size={32} color="#2196F3" />
        <Text style={styles.summaryNumber}>96%</Text>
        <Text style={styles.summaryLabel}>Health Score</Text>
        <Text style={styles.summarySubtext}>Average</Text>
      </Surface>

      <Surface style={styles.summaryCard}>
        <Icon name="schedule" size={32} color="#FF9800" />
        <Text style={styles.summaryNumber}>2.5h</Text>
        <Text style={styles.summaryLabel}>Avg. Task Time</Text>
        <Text style={styles.summarySubtext}>Per task</Text>
      </Surface>

      <Surface style={styles.summaryCard}>
        <Icon name="trending-up" size={32} color="#9C27B0" />
        <Text style={styles.summaryNumber}>+12%</Text>
        <Text style={styles.summaryLabel}>Efficiency</Text>
        <Text style={styles.summarySubtext}>vs last month</Text>
      </Surface>
    </View>
  );

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      {['week', 'month', 'year'].map((period) => (
        <Button
          key={period}
          mode={selectedPeriod === period ? 'contained' : 'outlined'}
          onPress={() => setSelectedPeriod(period as any)}
          style={styles.periodButton}
          compact
        >
          {period.toUpperCase()}
        </Button>
      ))}
    </View>
  );

  const renderTaskCompletionChart = () => (
    <Card style={styles.chartCard}>
      <Card.Content>
        <Title style={styles.chartTitle}>Task Completion Trend</Title>
        <Subheading style={styles.chartSubtitle}>
          Tasks completed per day this {selectedPeriod}
        </Subheading>
        <LineChart
          data={taskCompletionData}
          width={screenWidth - 64}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </Card.Content>
    </Card>
  );

  const renderTaskCategoryChart = () => (
    <Card style={styles.chartCard}>
      <Card.Content>
        <Title style={styles.chartTitle}>Task Categories</Title>
        <Subheading style={styles.chartSubtitle}>
          Distribution of task types
        </Subheading>
        <PieChart
          data={taskCategoryData}
          width={screenWidth - 64}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 10]}
          style={styles.chart}
        />
      </Card.Content>
    </Card>
  );

  const renderAnimalHealthChart = () => (
    <Card style={styles.chartCard}>
      <Card.Content>
        <Title style={styles.chartTitle}>Animal Health Trend</Title>
        <Subheading style={styles.chartSubtitle}>
          Weekly health score percentage
        </Subheading>
        <BarChart
          data={animalHealthData}
          width={screenWidth - 64}
          height={220}
          yAxisLabel=""
          yAxisSuffix="%"
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </Card.Content>
    </Card>
  );

  const renderRecentActivity = () => (
    <Card style={styles.chartCard}>
      <Card.Content>
        <Title style={styles.chartTitle}>Recent Activity</Title>
        <DataTable>
          <DataTable.Header>
            <DataTable.Title>Task</DataTable.Title>
            <DataTable.Title>Status</DataTable.Title>
            <DataTable.Title>Date</DataTable.Title>
          </DataTable.Header>

          <DataTable.Row>
            <DataTable.Cell>Feed Morning Batch</DataTable.Cell>
            <DataTable.Cell>Completed</DataTable.Cell>
            <DataTable.Cell>Today</DataTable.Cell>
          </DataTable.Row>

          <DataTable.Row>
            <DataTable.Cell>Health Check - Barn A</DataTable.Cell>
            <DataTable.Cell>In Progress</DataTable.Cell>
            <DataTable.Cell>Today</DataTable.Cell>
          </DataTable.Row>

          <DataTable.Row>
            <DataTable.Cell>Clean Water Troughs</DataTable.Cell>
            <DataTable.Cell>Pending</DataTable.Cell>
            <DataTable.Cell>Tomorrow</DataTable.Cell>
          </DataTable.Row>
        </DataTable>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderPeriodSelector()}
        {renderSummaryCards()}
        {renderTaskCompletionChart()}
        {renderTaskCategoryChart()}
        {renderAnimalHealthChart()}
        {renderRecentActivity()}

        <View style={styles.bottomPadding} />
      </ScrollView>

      <FAB
        icon="file-download"
        style={styles.fab}
        onPress={() => {/* Handle export functionality */}}
        label="Export"
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
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  periodButton: {
    marginHorizontal: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginTop: 4,
  },
  summarySubtext: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  chartCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8,
  },
  bottomPadding: {
    height: 80,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});

export default ReportsScreen;