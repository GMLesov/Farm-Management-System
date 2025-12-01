import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Card, Title, Text, ProgressBar, Chip, IconButton } from 'react-native-paper';
import { PieChart, LineChart, BarChart, ContributionGraph } from 'react-native-chart-kit';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: screenWidth } = Dimensions.get('window');

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onPress?: () => void;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  onPress,
}) => {
  return (
    <Card style={[styles.analyticsCard, { borderLeftColor: color }]} onPress={onPress}>
      <Card.Content style={styles.analyticsCardContent}>
        <View style={styles.analyticsHeader}>
          <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
            <MaterialCommunityIcons name={icon} size={24} color={color} />
          </View>
          {trend && (
            <Chip
              mode="outlined"
              compact
              style={[
                styles.trendChip,
                { backgroundColor: trend.isPositive ? '#E8F5E8' : '#FFEBEE' }
              ]}
              textStyle={{
                color: trend.isPositive ? '#4CAF50' : '#F44336',
                fontSize: 11,
              }}
            >
              {trend.isPositive ? '↗' : '↘'} {Math.abs(trend.value)}%
            </Chip>
          )}
        </View>
        <Text style={styles.analyticsValue}>{value}</Text>
        <Text style={styles.analyticsTitle}>{title}</Text>
        {subtitle && <Text style={styles.analyticsSubtitle}>{subtitle}</Text>}
      </Card.Content>
    </Card>
  );
};

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, children, actions }) => {
  return (
    <Card style={styles.chartCard}>
      <Card.Content>
        <View style={styles.chartHeader}>
          <Title style={styles.chartTitle}>{title}</Title>
          {actions && <View style={styles.chartActions}>{actions}</View>}
        </View>
        {children}
      </Card.Content>
    </Card>
  );
};

interface FarmHealthOverviewProps {
  animalHealth: {
    healthy: number;
    sick: number;
    treatment: number;
    quarantine: number;
  };
  cropHealth: {
    excellent: number;
    good: number;
    poor: number;
    critical: number;
  };
}

export const FarmHealthOverview: React.FC<FarmHealthOverviewProps> = ({
  animalHealth,
  cropHealth,
}) => {
  const [selectedView, setSelectedView] = useState<'animals' | 'crops'>('animals');

  const animalData = [
    {
      name: 'Healthy',
      population: animalHealth.healthy,
      color: '#4CAF50',
      legendFontColor: '#4CAF50',
      legendFontSize: 12,
    },
    {
      name: 'Sick',
      population: animalHealth.sick,
      color: '#FF9800',
      legendFontColor: '#FF9800',
      legendFontSize: 12,
    },
    {
      name: 'Treatment',
      population: animalHealth.treatment,
      color: '#F44336',
      legendFontColor: '#F44336',
      legendFontSize: 12,
    },
    {
      name: 'Quarantine',
      population: animalHealth.quarantine,
      color: '#9C27B0',
      legendFontColor: '#9C27B0',
      legendFontSize: 12,
    },
  ];

  const cropData = [
    {
      name: 'Excellent',
      population: cropHealth.excellent,
      color: '#4CAF50',
      legendFontColor: '#4CAF50',
      legendFontSize: 12,
    },
    {
      name: 'Good',
      population: cropHealth.good,
      color: '#8BC34A',
      legendFontColor: '#8BC34A',
      legendFontSize: 12,
    },
    {
      name: 'Poor',
      population: cropHealth.poor,
      color: '#FF9800',
      legendFontColor: '#FF9800',
      legendFontSize: 12,
    },
    {
      name: 'Critical',
      population: cropHealth.critical,
      color: '#F44336',
      legendFontColor: '#F44336',
      legendFontSize: 12,
    },
  ];

  const chartConfig = {
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
  };

  return (
    <ChartCard
      title="Farm Health Overview"
      actions={
        <View style={styles.segmentedControl}>
          <Chip
            mode={selectedView === 'animals' ? 'flat' : 'outlined'}
            onPress={() => setSelectedView('animals')}
            compact
            style={[
              styles.segmentButton,
              selectedView === 'animals' && styles.segmentButtonActive
            ]}
          >
            Animals
          </Chip>
          <Chip
            mode={selectedView === 'crops' ? 'flat' : 'outlined'}
            onPress={() => setSelectedView('crops')}
            compact
            style={[
              styles.segmentButton,
              selectedView === 'crops' && styles.segmentButtonActive
            ]}
          >
            Crops
          </Chip>
        </View>
      }
    >
      <View style={styles.chartContainer}>
        <PieChart
          data={selectedView === 'animals' ? animalData : cropData}
          width={screenWidth - 80}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          center={[10, 10]}
          absolute
        />
      </View>
    </ChartCard>
  );
};

interface ProductivityTrendsProps {
  data: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
      strokeWidth?: number;
    }>;
  };
  period: 'week' | 'month' | 'year';
  onPeriodChange: (period: 'week' | 'month' | 'year') => void;
}

export const ProductivityTrends: React.FC<ProductivityTrendsProps> = ({
  data,
  period,
  onPeriodChange,
}) => {
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4CAF50',
    },
  };

  return (
    <ChartCard
      title="Productivity Trends"
      actions={
        <View style={styles.periodSelector}>
          <Chip
            mode={period === 'week' ? 'flat' : 'outlined'}
            onPress={() => onPeriodChange('week')}
            compact
            style={styles.periodChip}
          >
            Week
          </Chip>
          <Chip
            mode={period === 'month' ? 'flat' : 'outlined'}
            onPress={() => onPeriodChange('month')}
            compact
            style={styles.periodChip}
          >
            Month
          </Chip>
          <Chip
            mode={period === 'year' ? 'flat' : 'outlined'}
            onPress={() => onPeriodChange('year')}
            compact
            style={styles.periodChip}
          >
            Year
          </Chip>
        </View>
      }
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          data={data}
          width={Math.max(screenWidth - 60, data.labels.length * 50)}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
          withDots={true}
          withShadow={false}
          withScrollableDot={true}
        />
      </ScrollView>
    </ChartCard>
  );
};

interface TaskCompletionHeatmapProps {
  data: Array<{
    date: string;
    count: number;
  }>;
}

export const TaskCompletionHeatmap: React.FC<TaskCompletionHeatmapProps> = ({ data }) => {
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
  };

  return (
    <ChartCard title="Task Completion Heatmap">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <ContributionGraph
          values={data}
          endDate={new Date()}
          numDays={105}
          width={screenWidth - 40}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          tooltipDataAttrs={(value) => ({})}
        />
      </ScrollView>
    </ChartCard>
  );
};

interface FinancialSummaryProps {
  revenue: number;
  expenses: number;
  profit: number;
  monthlyData: {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
    }>;
  };
}

export const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  revenue,
  expenses,
  profit,
  monthlyData,
}) => {
  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  return (
    <ChartCard title="Financial Overview">
      <View style={styles.financialMetrics}>
        <View style={styles.financialMetric}>
          <Text style={[styles.financialValue, { color: '#4CAF50' }]}>
            ${revenue.toLocaleString()}
          </Text>
          <Text style={styles.financialLabel}>Revenue</Text>
        </View>
        <View style={styles.financialMetric}>
          <Text style={[styles.financialValue, { color: '#F44336' }]}>
            ${expenses.toLocaleString()}
          </Text>
          <Text style={styles.financialLabel}>Expenses</Text>
        </View>
        <View style={styles.financialMetric}>
          <Text style={[styles.financialValue, { color: profit >= 0 ? '#4CAF50' : '#F44336' }]}>
            ${profit.toLocaleString()}
          </Text>
          <Text style={styles.financialLabel}>Profit</Text>
        </View>
      </View>
      <BarChart
        data={monthlyData}
        width={screenWidth - 60}
        height={200}
        chartConfig={chartConfig}
        style={styles.chart}
        verticalLabelRotation={30}
        showValuesOnTopOfBars
        yAxisLabel=""
        yAxisSuffix=""
      />
    </ChartCard>
  );
};

const styles = StyleSheet.create({
  analyticsCard: {
    marginVertical: 6,
    marginHorizontal: 2,
    borderLeftWidth: 4,
    borderRadius: 8,
    elevation: 2,
  },
  analyticsCardContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  analyticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendChip: {
    height: 24,
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  analyticsTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  analyticsSubtitle: {
    fontSize: 12,
    color: '#999',
  },
  chartCard: {
    margin: 8,
    borderRadius: 12,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  chartActions: {
    flexDirection: 'row',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    padding: 2,
  },
  segmentButton: {
    marginHorizontal: 2,
  },
  segmentButtonActive: {
    backgroundColor: '#4CAF50',
  },
  periodSelector: {
    flexDirection: 'row',
  },
  periodChip: {
    marginHorizontal: 2,
  },
  financialMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 8,
  },
  financialMetric: {
    alignItems: 'center',
  },
  financialValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  financialLabel: {
    fontSize: 12,
    color: '#666',
  },
});

export default {
  AnalyticsCard,
  ChartCard,
  FarmHealthOverview,
  ProductivityTrends,
  TaskCompletionHeatmap,
  FinancialSummary,
};