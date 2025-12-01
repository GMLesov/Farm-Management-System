import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Surface,
  Card,
  Title,
  Text,
  Button,
  IconButton,
  Chip,
  Portal,
  Modal,
  TextInput,
  Menu,
  Divider,
  ProgressBar,
  Snackbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart, PieChart, BarChart } from 'react-native-chart-kit';
import { financialManagementService, FinancialReport, ProfitabilityAnalysis } from '../../services/FinancialManagementService';

interface FinancialReportsProps {
  navigation: any;
}

const FinancialReports: React.FC<FinancialReportsProps> = ({ navigation }) => {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [profitabilityAnalysis, setProfitabilityAnalysis] = useState<ProfitabilityAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const periodOptions = [
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: '90d', label: 'Last 3 Months' },
    { key: '365d', label: 'Last Year' },
    { key: 'ytd', label: 'Year to Date' },
    { key: 'custom', label: 'Custom Range' },
  ];

  const loadReports = useCallback(async () => {
    try {
      // For demo purposes, create mock reports array
      const mockReports: FinancialReport[] = [];
      
      // Calculate period dates
      const endDate = new Date();
      let startDate = new Date();
      
      switch (selectedPeriod) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '365d':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        case 'ytd':
          startDate = new Date(endDate.getFullYear(), 0, 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Get profitability analysis for the selected period
      const analysis = financialManagementService.calculateProfitabilityAnalysis(startDate, endDate);
      
      setReports(mockReports);
      setProfitabilityAnalysis(analysis);
    } catch (error) {
      console.error('Error loading reports:', error);
      Alert.alert('Error', 'Failed to load financial reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPeriod]);

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, [loadReports])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReports();
  }, [loadReports]);

  const handleGenerateReport = async (reportType: string) => {
    try {
      setSnackbarMessage(`Generating ${reportType} report...`);
      setShowSnackbar(true);
      
      // In a real app, this would generate the actual report
      await new Promise(resolve => setTimeout(() => resolve(undefined), 2000));
      
      setSnackbarMessage(`${reportType} report generated successfully`);
      setShowSnackbar(true);
      
      loadReports();
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate report');
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  const renderProfitabilityOverview = () => {
    if (!profitabilityAnalysis) return null;

    const { totalRevenue, totalExpenses, grossProfit, grossMargin, netProfit, netMargin } = profitabilityAnalysis;

    return (
      <Card style={styles.overviewCard}>
        <Card.Content>
          <View style={styles.overviewHeader}>
            <Title style={styles.sectionTitle}>Profitability Overview</Title>
            <View style={styles.periodSelector}>
              {periodOptions.map((period) => (
                <Chip
                  key={period.key}
                  selected={selectedPeriod === period.key}
                  onPress={() => setSelectedPeriod(period.key)}
                  style={styles.periodChip}
                  compact
                >
                  {period.label}
                </Chip>
              ))}
            </View>
          </View>
          
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewValue, { color: '#4CAF50' }]}>
                {formatCurrency(totalRevenue)}
              </Text>
              <Text style={styles.overviewLabel}>Total Revenue</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewValue, { color: '#F44336' }]}>
                {formatCurrency(totalExpenses)}
              </Text>
              <Text style={styles.overviewLabel}>Total Expenses</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewValue, { color: grossProfit >= 0 ? '#4CAF50' : '#F44336' }]}>
                {formatCurrency(grossProfit)}
              </Text>
              <Text style={styles.overviewLabel}>Gross Profit</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewValue, { color: netProfit >= 0 ? '#4CAF50' : '#F44336' }]}>
                {formatCurrency(netProfit)}
              </Text>
              <Text style={styles.overviewLabel}>Net Profit</Text>
            </View>
          </View>

          <View style={styles.marginContainer}>
            <View style={styles.marginItem}>
              <Text style={styles.marginLabel}>Gross Margin</Text>
              <Text style={[styles.marginValue, { color: grossMargin >= 0 ? '#4CAF50' : '#F44336' }]}>
                {formatPercentage(grossMargin)}
              </Text>
              <ProgressBar 
                progress={Math.abs(grossMargin) / 100} 
                color={grossMargin >= 0 ? '#4CAF50' : '#F44336'}
                style={styles.marginBar}
              />
            </View>
            <View style={styles.marginItem}>
              <Text style={styles.marginLabel}>Net Margin</Text>
              <Text style={[styles.marginValue, { color: netMargin >= 0 ? '#4CAF50' : '#F44336' }]}>
                {formatPercentage(netMargin)}
              </Text>
              <ProgressBar 
                progress={Math.abs(netMargin) / 100} 
                color={netMargin >= 0 ? '#4CAF50' : '#F44336'}
                style={styles.marginBar}
              />
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderRevenueExpenseChart = () => {
    if (!profitabilityAnalysis) return null;

    const { revenueByCategory, expensesByCategory } = profitabilityAnalysis;

    // Prepare data for revenue pie chart
    const revenueData = Object.entries(revenueByCategory)
      .filter(([_, amount]) => amount > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount], index) => ({
        name: category,
        population: amount,
        color: `hsl(${120 + index * 40}, 70%, 50%)`,
        legendFontColor: '#333',
        legendFontSize: 12,
      }));

    // Prepare data for expense pie chart
    const expenseData = Object.entries(expensesByCategory)
      .filter(([_, amount]) => amount > 0)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 5)
      .map(([category, amount], index) => ({
        name: category,
        population: amount,
        color: `hsl(${0 + index * 40}, 70%, 50%)`,
        legendFontColor: '#333',
        legendFontSize: 12,
      }));

    return (
      <Card style={styles.chartCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Revenue & Expense Breakdown</Title>
          
          {revenueData.length > 0 && (
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>Revenue by Category</Text>
              <PieChart
                data={revenueData}
                width={Dimensions.get('window').width - 80}
                height={200}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          )}

          {expenseData.length > 0 && (
            <View style={styles.chartSection}>
              <Text style={styles.chartTitle}>Expenses by Category</Text>
              <PieChart
                data={expenseData}
                width={Dimensions.get('window').width - 80}
                height={200}
                chartConfig={{
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          )}

          {revenueData.length === 0 && expenseData.length === 0 && (
            <View style={styles.noDataContainer}>
              <Icon name="chart-pie" size={48} color="#E0E0E0" />
              <Text style={styles.noDataText}>No financial data available for the selected period</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderQuickReportActions = () => (
    <Card style={styles.actionsCard}>
      <Card.Content>
        <Title style={styles.sectionTitle}>Quick Report Generation</Title>
        
        <View style={styles.reportButtonActions}>
          <Button
            mode="outlined"
            icon="file-chart"
            onPress={() => handleGenerateReport('Profit & Loss')}
            style={styles.reportButton}
          >
            P&L Statement
          </Button>
          
          <Button
            mode="outlined"
            icon="cash-multiple"
            onPress={() => handleGenerateReport('Cash Flow')}
            style={styles.reportButton}
          >
            Cash Flow
          </Button>
          
          <Button
            mode="outlined"
            icon="chart-bar"
            onPress={() => handleGenerateReport('Budget vs Actual')}
            style={styles.reportButton}
          >
            Budget Analysis
          </Button>
          
          <Button
            mode="outlined"
            icon="receipt"
            onPress={() => handleGenerateReport('Tax')}
            style={styles.reportButton}
          >
            Tax Report
          </Button>
          
          <Button
            mode="outlined"
            icon="sprout"
            onPress={() => handleGenerateReport('Crop Profitability')}
            style={styles.reportButton}
          >
            Crop Analysis
          </Button>
          
          <Button
            mode="outlined"
            icon="account-group"
            onPress={() => handleGenerateReport('Vendor')}
            style={styles.reportButton}
          >
            Vendor Analysis
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const renderRecentReports = () => {
    if (reports.length === 0) return null;

    const recentReports = reports
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
      .slice(0, 5);

    return (
      <Card style={styles.reportsCard}>
        <Card.Content>
          <View style={styles.reportsHeader}>
            <Title style={styles.sectionTitle}>Recent Reports</Title>
            <Button
              mode="text"
              onPress={() => navigation.navigate('AllReports')}
            >
              View All
            </Button>
          </View>
          
          {recentReports.map((report) => (
            <Surface key={report.id} style={styles.reportItem}>
              <View style={styles.reportContent}>
                <View style={styles.reportLeft}>
                  <Icon 
                    name={getReportIcon(report.type.category)} 
                    size={24} 
                    color="#2196F3" 
                  />
                  <View style={styles.reportInfo}>
                    <Text style={styles.reportTitle}>{report.title}</Text>
                    <Text style={styles.reportSubtitle}>
                      {report.type.name} • {report.period.label}
                    </Text>
                    <Text style={styles.reportDate}>
                      Generated {report.generatedAt.toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View style={styles.reportRight}>
                  <Chip mode="outlined" style={styles.formatChip}>
                    {report.format.toUpperCase()}
                  </Chip>
                  <View style={styles.reportItemActions}>
                    <IconButton
                      icon="eye"
                      mode="outlined"
                      size={16}
                      onPress={() => navigation.navigate('ViewReport', { reportId: report.id })}
                    />
                    <IconButton
                      icon="download"
                      mode="outlined"
                      size={16}
                      onPress={() => {
                        setSnackbarMessage('Downloading report...');
                        setShowSnackbar(true);
                      }}
                    />
                    <IconButton
                      icon="share-variant"
                      mode="outlined"
                      size={16}
                      onPress={() => {
                        setSnackbarMessage('Sharing report...');
                        setShowSnackbar(true);
                      }}
                    />
                  </View>
                </View>
              </View>
            </Surface>
          ))}
        </Card.Content>
      </Card>
    );
  };

  const getReportIcon = (category: string): string => {
    switch (category) {
      case 'profitability': return 'chart-line';
      case 'cashflow': return 'cash-multiple';
      case 'budget': return 'wallet';
      case 'tax': return 'receipt';
      case 'crop_analysis': return 'sprout';
      case 'vendor_analysis': return 'account-group';
      default: return 'file-chart';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading financial reports...</Text>
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
        {renderProfitabilityOverview()}
        {renderRevenueExpenseChart()}
        {renderQuickReportActions()}
        {renderRecentReports()}

        {reports.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyState}>
                <Icon name="file-chart" size={64} color="#E0E0E0" />
                <Text style={styles.emptyTitle}>No Reports Generated</Text>
                <Text style={styles.emptySubtitle}>
                  Generate your first financial report to analyze your farm's performance
                </Text>
                <Button
                  mode="contained"
                  style={styles.emptyActionButton}
                  onPress={() => handleGenerateReport('Profit & Loss')}
                >
                  Generate P&L Report
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
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
  overviewCard: {
    margin: 16,
    elevation: 4,
  },
  overviewHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  periodChip: {
    marginRight: 8,
    marginBottom: 8,
    height: 28,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  overviewStat: {
    alignItems: 'center',
    flex: 1,
  },
  overviewValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  overviewLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  marginContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  marginItem: {
    flex: 1,
    marginHorizontal: 8,
  },
  marginLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  marginValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  marginBar: {
    height: 6,
    borderRadius: 3,
  },
  chartCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  chartSection: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noDataText: {
    marginTop: 16,
    color: '#999',
    textAlign: 'center',
  },
  actionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  reportButtonActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  reportButton: {
    width: '48%',
    marginBottom: 12,
  },
  reportsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  reportsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reportItem: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  reportContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reportInfo: {
    marginLeft: 12,
    flex: 1,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  reportSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  reportDate: {
    fontSize: 10,
    color: '#999',
  },
  reportRight: {
    alignItems: 'center',
  },
  formatChip: {
    height: 20,
    marginBottom: 8,
  },
  reportItemActions: {
    flexDirection: 'row',
  },
  emptyCard: {
    margin: 16,
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
  emptyActionButton: {
    marginTop: 16,
  },
});

export default FinancialReports;