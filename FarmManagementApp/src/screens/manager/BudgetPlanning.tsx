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
  FAB,
  Portal,
  Modal,
  TextInput,
  ProgressBar,
  Divider,
  Snackbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { financialManagementService, Budget, BudgetCategory, FinancialCategory } from '../../services/FinancialManagementService';

interface BudgetPlanningProps {
  navigation: any;
}

const BudgetPlanning: React.FC<BudgetPlanningProps> = ({ navigation }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Add Budget Form State
  const [newBudget, setNewBudget] = useState<Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'categories'>>({
    name: '',
    period: {
      type: 'monthly',
      fiscalYear: new Date().getFullYear(),
    },
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    status: 'draft',
    totalBudgetedIncome: 0,
    totalBudgetedExpenses: 0,
    projectedProfit: 0,
    notes: '',
    createdBy: 'user',
  });

  const [newCategory, setNewCategory] = useState<{ name: string; allocatedAmount: string; description?: string }>({
    name: '',
    allocatedAmount: '',
    description: '',
  });

  const [categoriesDraft, setCategoriesDraft] = useState<BudgetCategory[]>([]);
  const [budgetAlerts] = useState<{ message: string; budgetName: string; createdAt: Date; severity: 'warning' | 'critical' }[]>([]);

  const loadBudgets = useCallback(async () => {
    try {
      const allBudgets = financialManagementService.getAllBudgets();
      setBudgets(allBudgets);
    } catch (error) {
      console.error('Error loading budgets:', error);
      Alert.alert('Error', 'Failed to load budgets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBudgets();
    }, [loadBudgets])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBudgets();
  }, [loadBudgets]);

  const handleAddBudget = async () => {
    try {
      if (!newBudget.name) {
        Alert.alert('Error', 'Please provide a budget name');
        return;
      }

      const budgetId = financialManagementService.createBudget(newBudget);
      if (categoriesDraft.length > 0) {
        // Recalculate totals from draft categories
        const totalExpenses = categoriesDraft.reduce((sum, c) => sum + (c.budgetedAmount || 0), 0);
        financialManagementService.updateBudget(budgetId, {
          categories: categoriesDraft,
          totalBudgetedExpenses: totalExpenses,
        } as Partial<Budget>);
      }
      
      // Reset form
      setNewBudget({
        name: '',
        period: {
          type: 'monthly',
          fiscalYear: new Date().getFullYear(),
        },
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        status: 'draft',
        totalBudgetedIncome: 0,
        totalBudgetedExpenses: 0,
        projectedProfit: 0,
        notes: '',
        createdBy: 'user',
      });
      setCategoriesDraft([]);
      
      setShowAddModal(false);
      loadBudgets();
      
      setSnackbarMessage('Budget created successfully');
      setShowSnackbar(true);
    } catch (error) {
      console.error('Error adding budget:', error);
      Alert.alert('Error', 'Failed to create budget');
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.name || !newCategory.allocatedAmount) {
      Alert.alert('Error', 'Please provide category name and amount');
      return;
    }

    // Ensure FinancialCategory exists
    const createdCategoryId = financialManagementService.createCategory({
      name: newCategory.name,
      type: 'expense',
      code: `CAT_${Date.now()}`,
      description: newCategory.description || '',
      isActive: true,
      budgetable: true,
      subcategories: [],
    } as Omit<FinancialCategory, 'id'>);

    const category: BudgetCategory = {
      categoryId: createdCategoryId,
      budgetedAmount: parseFloat(newCategory.allocatedAmount),
      actualAmount: 0,
      variance: 0,
      variancePercent: 0,
      notes: newCategory.description,
    };

    setCategoriesDraft(prev => [...prev, category]);

    setNewCategory({ name: '', allocatedAmount: '', description: '' });
  };

  const handleRemoveCategory = (categoryId: string) => {
    setCategoriesDraft(prev => prev.filter(cat => cat.categoryId !== categoryId));
  };

  const handleDeleteBudget = (budgetId: string) => {
    Alert.alert(
      'Delete Budget',
      'Are you sure you want to delete this budget?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              financialManagementService.deleteBudget(budgetId);
              loadBudgets();
              setSnackbarMessage('Budget deleted successfully');
              setShowSnackbar(true);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete budget');
            }
          },
        },
      ]
    );
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getUtilizationColor = (percentage: number): string => {
    if (percentage >= 95) return '#F44336';
    if (percentage >= 80) return '#FF9800';
    if (percentage >= 60) return '#FFC107';
    return '#4CAF50';
  };

  const renderBudgetOverview = () => {
    if (budgets.length === 0) return null;

    const totalAllocated = budgets.reduce((sum, budget) => 
      sum + budget.categories.reduce((catSum, cat) => catSum + (cat.budgetedAmount || 0), 0), 0
    );
    
    const totalSpent = budgets.reduce((sum, budget) => 
      sum + budget.categories.reduce((catSum, cat) => catSum + (cat.actualAmount || 0), 0), 0
    );
    
    const totalRemaining = totalAllocated - totalSpent;
    const utilizationPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

    return (
      <Card style={styles.overviewCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Budget Overview</Title>
          
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewValue}>{formatCurrency(totalAllocated)}</Text>
              <Text style={styles.overviewLabel}>Total Allocated</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewValue, { color: '#F44336' }]}>
                {formatCurrency(totalSpent)}
              </Text>
              <Text style={styles.overviewLabel}>Total Spent</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewValue, { color: totalRemaining >= 0 ? '#4CAF50' : '#F44336' }]}>
                {formatCurrency(totalRemaining)}
              </Text>
              <Text style={styles.overviewLabel}>Remaining</Text>
            </View>
          </View>

          <View style={styles.utilizationContainer}>
            <View style={styles.utilizationHeader}>
              <Text style={styles.utilizationLabel}>Overall Utilization</Text>
              <Text style={[styles.utilizationPercentage, { color: getUtilizationColor(utilizationPercentage) }]}>
                {utilizationPercentage.toFixed(1)}%
              </Text>
            </View>
            <ProgressBar 
              progress={utilizationPercentage / 100} 
              color={getUtilizationColor(utilizationPercentage)}
              style={styles.utilizationBar}
            />
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderBudgetAlerts = () => {
    if (budgetAlerts.length === 0) return null;

    return (
      <Card style={styles.alertsCard}>
        <Card.Content>
          <View style={styles.alertsHeader}>
            <Icon name="alert-circle" size={24} color="#FF9800" />
            <Title style={styles.alertsTitle}>Budget Alerts</Title>
          </View>
          
          {budgetAlerts.map((alert, index) => (
            <View key={index} style={styles.alertItem}>
              <View style={styles.alertContent}>
                <Text style={styles.alertMessage}>{alert.message}</Text>
                <Text style={styles.alertBudget}>{alert.budgetName}</Text>
                <Text style={styles.alertDate}>
                  {alert.createdAt.toLocaleDateString()}
                </Text>
              </View>
              <Icon 
                name={alert.severity === 'critical' ? 'alert' : 'alert-circle-outline'} 
                size={20} 
                color={alert.severity === 'critical' ? '#F44336' : '#FF9800'} 
              />
            </View>
          ))}
        </Card.Content>
      </Card>
    );
  };

  const renderBudgetCard = (budget: Budget) => {
    const totalAllocated = budget.categories.reduce((sum, cat) => sum + (cat.budgetedAmount || 0), 0);
    const totalSpent = budget.categories.reduce((sum, cat) => sum + (cat.actualAmount || 0), 0);
    const utilizationPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
    const remaining = totalAllocated - totalSpent;

    return (
      <Card key={budget.id} style={styles.budgetCard}>
        <Card.Content>
          <View style={styles.budgetHeader}>
            <View style={styles.budgetHeaderLeft}>
              <Title style={styles.budgetName}>{budget.name}</Title>
              <Text style={styles.budgetPeriod}>
                {budget.period.type} • {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
              </Text>
              {budget.notes && (
                <Text style={styles.budgetDescription}>{budget.notes}</Text>
              )}
            </View>
            <View style={styles.budgetHeaderRight}>
              <Chip 
                mode="outlined"
                style={[styles.statusChip, { borderColor: budget.status === 'active' ? '#4CAF50' : '#9E9E9E' }]}
              >
                {budget.status === 'active' ? 'Active' : 'Inactive'}
              </Chip>
            </View>
          </View>

          <View style={styles.budgetSummary}>
            <View style={styles.budgetStat}>
              <Text style={styles.budgetStatValue}>{formatCurrency(totalAllocated)}</Text>
              <Text style={styles.budgetStatLabel}>Allocated</Text>
            </View>
            <View style={styles.budgetStat}>
              <Text style={[styles.budgetStatValue, { color: '#F44336' }]}>
                {formatCurrency(totalSpent)}
              </Text>
              <Text style={styles.budgetStatLabel}>Spent</Text>
            </View>
            <View style={styles.budgetStat}>
              <Text style={[styles.budgetStatValue, { color: remaining >= 0 ? '#4CAF50' : '#F44336' }]}>
                {formatCurrency(remaining)}
              </Text>
              <Text style={styles.budgetStatLabel}>Remaining</Text>
            </View>
          </View>

          <View style={styles.utilizationContainer}>
            <View style={styles.utilizationHeader}>
              <Text style={styles.utilizationLabel}>Budget Utilization</Text>
              <Text style={[styles.utilizationPercentage, { color: getUtilizationColor(utilizationPercentage) }]}>
                {utilizationPercentage.toFixed(1)}%
              </Text>
            </View>
            <ProgressBar 
              progress={utilizationPercentage / 100} 
              color={getUtilizationColor(utilizationPercentage)}
              style={styles.utilizationBar}
            />
          </View>

          <View style={styles.categoriesContainer}>
            <Text style={styles.categoriesTitle}>Categories</Text>
            {budget.categories.map((category) => {
              const categoryPercentage = (category.budgetedAmount || 0) > 0 ? 
                ((category.actualAmount || 0) / (category.budgetedAmount || 0)) * 100 : 0;
              const catMeta = financialManagementService.getCategory(category.categoryId);
              const categoryName = catMeta?.name ?? 'Category';
              
              return (
                <View key={category.categoryId} style={styles.categoryItem}>
                  <View style={styles.categoryHeader}>
                    <Text style={styles.categoryName}>{categoryName}</Text>
                    <Text style={styles.categoryAmount}>
                      {formatCurrency(category.actualAmount || 0)} / {formatCurrency(category.budgetedAmount || 0)}
                    </Text>
                  </View>
                  <ProgressBar 
                    progress={categoryPercentage / 100} 
                    color={getUtilizationColor(categoryPercentage)}
                    style={styles.categoryBar}
                  />
                  <Text style={[styles.categoryPercentage, { color: getUtilizationColor(categoryPercentage) }]}>
                    {categoryPercentage.toFixed(1)}%
                  </Text>
                </View>
              );
            })}
          </View>
        </Card.Content>

        <Card.Actions style={styles.budgetActions}>
          <Button
            mode="text"
            onPress={() => navigation.navigate('BudgetDetails', { budgetId: budget.id })}
          >
            View Details
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('EditBudget', { budgetId: budget.id })}
          >
            Edit
          </Button>
          <IconButton
            icon="delete"
            iconColor="#F44336"
            onPress={() => handleDeleteBudget(budget.id)}
          />
        </Card.Actions>
      </Card>
    );
  };

  const renderAddBudgetModal = () => (
    <Portal>
      <Modal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        contentContainerStyle={styles.addModal}
      >
        <ScrollView>
          <Title style={styles.modalTitle}>Create New Budget</Title>

          <TextInput
            label="Budget Name"
            value={newBudget.name}
            onChangeText={(text) => setNewBudget(prev => ({ ...prev, name: text }))}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Description (Optional)"
            value={newBudget.notes || ''}
            onChangeText={(text) => setNewBudget(prev => ({ ...prev, notes: text }))}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
          />

          <View style={styles.periodSelector}>
            <Text style={styles.fieldLabel}>Budget Period</Text>
            <View style={styles.periodOptions}>
              {(['monthly', 'quarterly', 'annual', 'seasonal', 'custom'] as const).map((period) => (
                <Chip
                  key={period}
                  selected={newBudget.period.type === period}
                  onPress={() => setNewBudget(prev => ({ 
                    ...prev, 
                    period: { ...prev.period, type: period } 
                  }))}
                  style={styles.periodChip}
                >
                  {period}
                </Chip>
              ))}
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.categoriesSection}>
            <Text style={styles.fieldLabel}>Budget Categories</Text>
            
            <View style={styles.addCategoryForm}>
              <TextInput
                label="Category Name"
                value={newCategory.name}
                onChangeText={(text) => setNewCategory(prev => ({ ...prev, name: text }))}
                mode="outlined"
                style={styles.categoryInput}
              />
              <TextInput
                label="Amount"
                value={newCategory.allocatedAmount}
                onChangeText={(text) => setNewCategory(prev => ({ ...prev, allocatedAmount: text }))}
                keyboardType="numeric"
                mode="outlined"
                style={styles.categoryInput}
                left={<TextInput.Icon icon="currency-usd" />}
              />
              <Button
                mode="contained"
                onPress={handleAddCategory}
                style={styles.addCategoryButton}
              >
                Add Category
              </Button>
            </View>

            {categoriesDraft.length > 0 && (
              <View style={styles.categoriesList}>
                {categoriesDraft.map((category) => {
                  const catMeta = financialManagementService.getCategory(category.categoryId);
                  const categoryName = catMeta?.name ?? 'Category';
                  return (
                  <Surface key={category.categoryId} style={styles.categoryPreview}>
                    <View style={styles.categoryPreviewContent}>
                      <Text style={styles.categoryPreviewName}>{categoryName}</Text>
                      <Text style={styles.categoryPreviewAmount}>
                        {formatCurrency(category.budgetedAmount || 0)}
                      </Text>
                    </View>
                    <IconButton
                      icon="close"
                      size={16}
                      onPress={() => handleRemoveCategory(category.categoryId)}
                    />
                  </Surface>
                );})}
                <View style={styles.categoryTotal}>
                  <Text style={styles.categoryTotalLabel}>Total Budget:</Text>
                  <Text style={styles.categoryTotalAmount}>
                    {formatCurrency(categoriesDraft.reduce((sum, cat) => sum + (cat.budgetedAmount || 0), 0))}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setShowAddModal(false)}
              style={styles.modalButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleAddBudget}
              style={styles.modalButton}
              disabled={!newBudget.name || categoriesDraft.length === 0}
            >
              Create Budget
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderBudgetAnalytics = () => {
    if (budgets.length === 0) return null;

    // Prepare data for pie chart
    const categoryData = budgets.flatMap(budget => budget.categories)
      .reduce((acc, category) => {
        const meta = financialManagementService.getCategory(category.categoryId);
        const name = meta?.name ?? 'Category';
        const existing = acc.find(item => item.name === name);
        if (existing) {
          existing.spentAmount += (category.actualAmount || 0);
        } else {
          acc.push({
            name,
            spentAmount: (category.actualAmount || 0),
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
          });
        }
        return acc;
      }, [] as any[])
      .filter(item => item.spentAmount > 0)
      .sort((a, b) => b.spentAmount - a.spentAmount)
      .slice(0, 6);

    const pieData = categoryData.map(item => ({
      name: item.name,
      population: item.spentAmount,
      color: item.color,
      legendFontColor: '#333',
      legendFontSize: 12,
    }));

    return (
      <Card style={styles.analyticsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Spending by Category</Title>
          {pieData.length > 0 ? (
            <PieChart
              data={pieData}
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
          ) : (
            <View style={styles.noDataContainer}>
              <Icon name="chart-pie" size={48} color="#E0E0E0" />
              <Text style={styles.noDataText}>No spending data available</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading budgets...</Text>
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
        {renderBudgetOverview()}
        {renderBudgetAlerts()}
        {renderBudgetAnalytics()}

        {budgets.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyState}>
                <Icon name="wallet" size={64} color="#E0E0E0" />
                <Text style={styles.emptyTitle}>No Budgets Created</Text>
                <Text style={styles.emptySubtitle}>
                  Create your first budget to start tracking your farm expenses and income
                </Text>
                <Button
                  mode="contained"
                  style={styles.emptyActionButton}
                  onPress={() => setShowAddModal(true)}
                >
                  Create Budget
                </Button>
              </View>
            </Card.Content>
          </Card>
        ) : (
          budgets.map(renderBudgetCard)
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        label="New Budget"
      />

      {renderAddBudgetModal()}

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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  overviewLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  utilizationContainer: {
    marginTop: 8,
  },
  utilizationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  utilizationLabel: {
    fontSize: 14,
    color: '#666',
  },
  utilizationPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  utilizationBar: {
    height: 8,
    borderRadius: 4,
  },
  alertsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  alertsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  alertBudget: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  alertDate: {
    fontSize: 12,
    color: '#999',
  },
  analyticsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 32,
  },
  noDataText: {
    marginTop: 16,
    color: '#999',
  },
  budgetCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  budgetHeaderLeft: {
    flex: 1,
  },
  budgetName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  budgetPeriod: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  budgetDescription: {
    fontSize: 14,
    color: '#999',
  },
  budgetHeaderRight: {
    marginLeft: 16,
  },
  statusChip: {
    height: 24,
  },
  budgetSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  budgetStat: {
    alignItems: 'center',
    flex: 1,
  },
  budgetStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  budgetStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  categoriesContainer: {
    marginTop: 16,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoryItem: {
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 12,
    color: '#666',
  },
  categoryBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  categoryPercentage: {
    fontSize: 12,
    fontWeight: '500',
    alignSelf: 'flex-end',
  },
  budgetActions: {
    justifyContent: 'space-between',
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  addModal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  periodSelector: {
    marginBottom: 16,
  },
  periodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  periodChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  categoriesSection: {
    marginBottom: 16,
  },
  addCategoryForm: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  categoryInput: {
    marginBottom: 12,
  },
  addCategoryButton: {
    alignSelf: 'flex-start',
  },
  categoriesList: {
    marginTop: 8,
  },
  categoryPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    borderRadius: 4,
    elevation: 1,
  },
  categoryPreviewContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPreviewName: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryPreviewAmount: {
    fontSize: 14,
    color: '#666',
  },
  categoryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
    marginTop: 8,
  },
  categoryTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  categoryTotalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default BudgetPlanning;