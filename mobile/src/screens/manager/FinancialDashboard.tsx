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
  Menu,
  Divider,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { financialManagementService, FinancialTransaction, FinancialKPI, ProfitabilityAnalysis } from '../../services/FinancialManagementService';

const { width } = Dimensions.get('window');

interface FinancialDashboardProps {
  navigation: any;
}

interface DashboardData {
  recentTransactions: FinancialTransaction[];
  profitabilityAnalysis: ProfitabilityAnalysis;
  kpis: FinancialKPI[];
  monthlyTrends: any[];
  budgetStatus: any;
  upcomingPayments: FinancialTransaction[];
  weatherImpactSummary: any;
}

interface QuickStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  budgetVariance: number;
  pendingPayments: number;
}

const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ navigation }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats>({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    budgetVariance: 0,
    pendingPayments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'income' | 'expense' | 'pending'>('all');

  const loadDashboardData = useCallback(async () => {
    try {
      const now = new Date();
      let startDate: Date;

      // Calculate date range based on selected period
      switch (selectedPeriod) {
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90d':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case '1y':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      // Get financial data
      const recentTransactions = financialManagementService
        .getTransactionsByDateRange(startDate, now)
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 10);

      const profitabilityAnalysis = financialManagementService.calculateProfitabilityAnalysis(startDate, now);
      const kpis = financialManagementService.generateFinancialKPIs();
      const weatherImpactSummary = financialManagementService.analyzeWeatherImpact(startDate, now);

      // Get monthly trends for chart
      const monthlyTrends = generateMonthlyTrends(startDate, now);

      // Get budget status
      const activeBudget = financialManagementService.getActiveBudget();
      const budgetStatus = activeBudget ? calculateBudgetStatus(activeBudget, startDate, now) : null;

      // Get upcoming payments (recurring transactions due soon)
      const upcomingPayments = getUpcomingPayments();

      // Calculate quick stats
      const revenue = recentTransactions
        .filter(t => t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = recentTransactions
        .filter(t => t.type === 'expense' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      const netProfit = revenue - expenses;
      const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

      const pendingAmount = recentTransactions
        .filter(t => t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0);

      const budgetVariance = budgetStatus ? budgetStatus.variance : 0;

      setQuickStats({
        totalRevenue: revenue,
        totalExpenses: expenses,
        netProfit,
        profitMargin,
        budgetVariance,
        pendingPayments: pendingAmount,
      });

      setData({
        recentTransactions,
        profitabilityAnalysis,
        kpis,
        monthlyTrends,
        budgetStatus,
        upcomingPayments,
        weatherImpactSummary,
      });

    } catch (error) {
      console.error('Error loading financial dashboard data:', error);
      Alert.alert('Error', 'Failed to load financial data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPeriod]);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, [loadDashboardData]);

  const generateMonthlyTrends = (startDate: Date, endDate: Date) => {
    const months = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      
      const monthTransactions = financialManagementService.getTransactionsByDateRange(monthStart, monthEnd);
      const income = monthTransactions
        .filter(t => t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = monthTransactions
        .filter(t => t.type === 'expense' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      months.push({
        month: current.toLocaleDateString('en-US', { month: 'short' }),
        income,
        expenses,
        profit: income - expenses,
      });

      current.setMonth(current.getMonth() + 1);
    }

    return months;
  };

  const calculateBudgetStatus = (budget: any, startDate: Date, endDate: Date) => {
    const actualTransactions = financialManagementService.getTransactionsByDateRange(startDate, endDate);
    
    const actualIncome = actualTransactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const actualExpenses = actualTransactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const budgetedIncome = budget.totalBudgetedIncome;
    const budgetedExpenses = budget.totalBudgetedExpenses;

    return {
      budgetedIncome,
      actualIncome,
      incomeVariance: actualIncome - budgetedIncome,
      budgetedExpenses,
      actualExpenses,
      expenseVariance: actualExpenses - budgetedExpenses,
      variance: (actualIncome - actualExpenses) - (budgetedIncome - budgetedExpenses),
    };
  };

  const getUpcomingPayments = (): FinancialTransaction[] => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return financialManagementService
      .getAllTransactions()
      .filter(t => 
        t.status === 'pending' && 
        t.date >= now && 
        t.date <= nextWeek
      )
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#F44336';
      case 'disputed': return '#9C27B0';
      default: return '#9E9E9E';
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const filterTransactions = (transactions: FinancialTransaction[]): FinancialTransaction[] => {
    let filtered = transactions;

    // Apply type filter
    switch (selectedFilter) {
      case 'income':
        filtered = filtered.filter(t => t.type === 'income');
        break;
      case 'expense':
        filtered = filtered.filter(t => t.type === 'expense');
        break;
      case 'pending':
        filtered = filtered.filter(t => t.status === 'pending');
        break;
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.vendor?.name && t.vendor.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.customer?.name && t.customer.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

  const renderQuickStatsCard = () => (
    <Card style={styles.statsCard}>
      <Card.Content>
        <View style={styles.statsHeader}>
          <Title style={styles.sectionTitle}>Financial Overview</Title>
          <Menu
            visible={showPeriodMenu}
            onDismiss={() => setShowPeriodMenu(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setShowPeriodMenu(true)}
              >
                {selectedPeriod.toUpperCase()}
              </Button>
            }
          >
            <Menu.Item onPress={() => { setSelectedPeriod('7d'); setShowPeriodMenu(false); }} title="7 Days" />
            <Menu.Item onPress={() => { setSelectedPeriod('30d'); setShowPeriodMenu(false); }} title="30 Days" />
            <Menu.Item onPress={() => { setSelectedPeriod('90d'); setShowPeriodMenu(false); }} title="90 Days" />
            <Menu.Item onPress={() => { setSelectedPeriod('1y'); setShowPeriodMenu(false); }} title="1 Year" />
          </Menu>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Icon name="trending-up" size={24} color="#4CAF50" />
            <Text style={[styles.statValue, { color: '#4CAF50' }]}>
              {formatCurrency(quickStats.totalRevenue)}
            </Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="trending-down" size={24} color="#F44336" />
            <Text style={[styles.statValue, { color: '#F44336' }]}>
              {formatCurrency(quickStats.totalExpenses)}
            </Text>
            <Text style={styles.statLabel}>Total Expenses</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="cash" size={24} color={quickStats.netProfit >= 0 ? '#4CAF50' : '#F44336'} />
            <Text style={[styles.statValue, { color: quickStats.netProfit >= 0 ? '#4CAF50' : '#F44336' }]}>
              {formatCurrency(quickStats.netProfit)}
            </Text>
            <Text style={styles.statLabel}>Net Profit</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="percent" size={24} color="#2196F3" />
            <Text style={[styles.statValue, { color: '#2196F3' }]}>
              {quickStats.profitMargin.toFixed(1)}%
            </Text>
            <Text style={styles.statLabel}>Profit Margin</Text>
          </View>
        </View>

        <View style={styles.additionalStats}>
          <View style={styles.additionalStatItem}>
            <Icon name="clock-outline" size={20} color="#FF9800" />
            <Text style={styles.additionalStatLabel}>Pending Payments</Text>
            <Text style={styles.additionalStatValue}>{formatCurrency(quickStats.pendingPayments)}</Text>
          </View>
          {data?.budgetStatus && (
            <View style={styles.additionalStatItem}>
              <Icon name="target" size={20} color={quickStats.budgetVariance >= 0 ? '#4CAF50' : '#F44336'} />
              <Text style={styles.additionalStatLabel}>Budget Variance</Text>
              <Text style={[
                styles.additionalStatValue,
                { color: quickStats.budgetVariance >= 0 ? '#4CAF50' : '#F44336' }
              ]}>
                {formatCurrency(quickStats.budgetVariance)}
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderKPICard = () => {
    if (!data?.kpis || data.kpis.length === 0) return null;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Key Performance Indicators</Title>
          <View style={styles.kpiGrid}>
            {data.kpis.map((kpi, index) => (
              <View key={index} style={styles.kpiItem}>
                <View style={styles.kpiHeader}>
                  <Text style={styles.kpiName}>{kpi.name}</Text>
                  <Icon 
                    name={kpi.trend === 'up' ? 'trending-up' : kpi.trend === 'down' ? 'trending-down' : 'trending-neutral'} 
                    size={16} 
                    color={kpi.trend === 'up' ? '#4CAF50' : kpi.trend === 'down' ? '#F44336' : '#9E9E9E'} 
                  />
                </View>
                <Text style={styles.kpiValue}>
                  {kpi.value.toFixed(1)} {kpi.unit}
                </Text>
                {kpi.targetValue && (
                  <Text style={styles.kpiTarget}>
                    Target: {kpi.targetValue} {kpi.unit}
                  </Text>
                )}
                {kpi.benchmark && (
                  <Text style={styles.kpiBenchmark}>
                    Industry: {kpi.benchmark} {kpi.unit}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderMonthlyTrendsChart = () => {
    if (!data?.monthlyTrends || data.monthlyTrends.length === 0) return null;

    const chartData = {
      labels: data.monthlyTrends.map(item => item.month),
      datasets: [
        {
          data: data.monthlyTrends.map(item => item.income),
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 2,
        },
        {
          data: data.monthlyTrends.map(item => item.expenses),
          color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
          strokeWidth: 2,
        },
      ],
      legend: ['Income', 'Expenses'],
    };

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Monthly Trends</Title>
          <LineChart
            data={chartData}
            width={width - 64}
            height={200}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
              },
            }}
            style={styles.chart}
          />
        </Card.Content>
      </Card>
    );
  };

  const renderExpenseBreakdownChart = () => {
    if (!data?.profitabilityAnalysis) return null;

    const expenseCategories = Object.keys(data.profitabilityAnalysis.expensesByCategory);
    if (expenseCategories.length === 0) return null;

    const chartData = expenseCategories.map((category, index) => ({
      name: category,
      amount: data.profitabilityAnalysis.expensesByCategory[category],
      color: getChartColor(index),
      legendFontColor: '#333',
      legendFontSize: 12,
    }));

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Expense Breakdown</Title>
          <PieChart
            data={chartData}
            width={width - 64}
            height={200}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </Card.Content>
      </Card>
    );
  };

  const renderRecentTransactions = () => {
    if (!data?.recentTransactions) return null;

    const filteredTransactions = filterTransactions(data.recentTransactions);

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.transactionsHeader}>
            <Title style={styles.sectionTitle}>Recent Transactions</Title>
            <IconButton
              icon="plus"
              mode="outlined"
              size={20}
              onPress={() => navigation.navigate('AddTransaction')}
            />
          </View>

          <Searchbar
            placeholder="Search transactions..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
          />

          <View style={styles.filterChips}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Chip
                selected={selectedFilter === 'all'}
                onPress={() => setSelectedFilter('all')}
                style={styles.filterChip}
              >
                All
              </Chip>
              <Chip
                selected={selectedFilter === 'income'}
                onPress={() => setSelectedFilter('income')}
                style={styles.filterChip}
              >
                Income
              </Chip>
              <Chip
                selected={selectedFilter === 'expense'}
                onPress={() => setSelectedFilter('expense')}
                style={styles.filterChip}
              >
                Expenses
              </Chip>
              <Chip
                selected={selectedFilter === 'pending'}
                onPress={() => setSelectedFilter('pending')}
                style={styles.filterChip}
              >
                Pending
              </Chip>
            </ScrollView>
          </View>

          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Icon name="receipt" size={64} color="#E0E0E0" />
              <Text style={styles.emptyTitle}>No Transactions</Text>
              <Text style={styles.emptySubtitle}>
                {data.recentTransactions.length === 0
                  ? 'Start by adding your first transaction'
                  : 'No transactions match your current filter criteria'
                }
              </Text>
            </View>
          ) : (
            filteredTransactions.map(transaction => (
              <View key={transaction.id} style={styles.transactionItem}>
                <View style={styles.transactionLeft}>
                  <Icon 
                    name={transaction.type === 'income' ? 'arrow-down-circle' : 'arrow-up-circle'} 
                    size={24} 
                    color={transaction.type === 'income' ? '#4CAF50' : '#F44336'} 
                  />
                  <View style={styles.transactionDetails}>
                    <Text style={styles.transactionDescription}>{transaction.description}</Text>
                    <Text style={styles.transactionCategory}>{transaction.category.name}</Text>
                    <Text style={styles.transactionDate}>
                      {transaction.date.toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.transactionRight}>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.type === 'income' ? '#4CAF50' : '#F44336' }
                  ]}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </Text>
                  <Chip 
                    mode="outlined"
                    textStyle={styles.statusChipText}
                    style={[styles.statusChip, { borderColor: getStatusColor(transaction.status) }]}
                  >
                    {transaction.status}
                  </Chip>
                </View>
              </View>
            ))
          )}

          {filteredTransactions.length > 0 && (
            <Button
              mode="outlined"
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('TransactionsList')}
            >
              View All Transactions
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderUpcomingPayments = () => {
    if (!data?.upcomingPayments || data.upcomingPayments.length === 0) return null;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Upcoming Payments</Title>
          {data.upcomingPayments.map(payment => (
            <View key={payment.id} style={styles.upcomingPaymentItem}>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentDescription}>{payment.description}</Text>
                <Text style={styles.paymentDate}>
                  Due: {payment.date.toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.paymentAmount}>
                {formatCurrency(payment.amount)}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    );
  };

  const renderWeatherImpactCard = () => {
    if (!data?.weatherImpactSummary || data.weatherImpactSummary.totalImpact === 0) return null;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Weather Impact Analysis</Title>
          <View style={styles.weatherImpact}>
            <Icon name="weather-cloudy" size={24} color="#FF9800" />
            <View style={styles.weatherImpactContent}>
              <Text style={styles.weatherImpactAmount}>
                {formatCurrency(Math.abs(data.weatherImpactSummary.totalImpact))}
              </Text>
              <Text style={styles.weatherImpactLabel}>
                Total Weather Impact ({selectedPeriod})
              </Text>
              <Text style={styles.weatherImpactDetails}>
                {data.weatherImpactSummary.affectedTransactions.length} transactions affected
              </Text>
            </View>
          </View>
          
          {data.weatherImpactSummary.recommendations.length > 0 && (
            <View style={styles.recommendations}>
              <Text style={styles.recommendationsTitle}>Recommendations:</Text>
              {data.weatherImpactSummary.recommendations.slice(0, 2).map((rec: string, index: number) => (
                <Text key={index} style={styles.recommendationItem}>• {rec}</Text>
              ))}
            </View>
          )}
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
            navigation.navigate('AddTransaction');
          }}
        >
          Add Transaction
        </Button>
        <Button
          mode="outlined"
          icon="cash-multiple"
          style={styles.quickActionButton}
          onPress={() => {
            setShowQuickActions(false);
            navigation.navigate('CreateBudget');
          }}
        >
          Create Budget
        </Button>
        <Button
          mode="outlined"
          icon="file-chart"
          style={styles.quickActionButton}
          onPress={() => {
            setShowQuickActions(false);
            navigation.navigate('GenerateReport');
          }}
        >
          Generate Report
        </Button>
        <Button
          mode="outlined"
          icon="account-plus"
          style={styles.quickActionButton}
          onPress={() => {
            setShowQuickActions(false);
            navigation.navigate('ManageVendors');
          }}
        >
          Manage Vendors
        </Button>
        <Button
          mode="outlined"
          icon="chart-timeline-variant"
          style={styles.quickActionButton}
          onPress={() => {
            setShowQuickActions(false);
            navigation.navigate('CashFlowProjection');
          }}
        >
          Cash Flow Projection
        </Button>
      </Modal>
    </Portal>
  );

  const getChartColor = (index: number): string => {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading financial data...</Text>
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
        {renderQuickStatsCard()}
        {renderKPICard()}
        {renderMonthlyTrendsChart()}
        {renderExpenseBreakdownChart()}
        {renderWeatherImpactCard()}
        {renderUpcomingPayments()}
        {renderRecentTransactions()}
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
  card: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  additionalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  additionalStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  additionalStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  additionalStatValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  kpiItem: {
    width: '48%',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  kpiTarget: {
    fontSize: 12,
    color: '#666',
  },
  kpiBenchmark: {
    fontSize: 12,
    color: '#999',
  },
  chart: {
    borderRadius: 8,
    marginTop: 8,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 16,
  },
  filterChips: {
    marginBottom: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionDetails: {
    marginLeft: 12,
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    fontSize: 10,
  },
  viewAllButton: {
    marginTop: 16,
  },
  upcomingPaymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentDescription: {
    fontSize: 14,
    fontWeight: '500',
  },
  paymentDate: {
    fontSize: 12,
    color: '#FF9800',
    marginTop: 2,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F44336',
  },
  weatherImpact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  weatherImpactContent: {
    marginLeft: 12,
    flex: 1,
  },
  weatherImpactAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  weatherImpactLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  weatherImpactDetails: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  recommendations: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
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

export default FinancialDashboard;