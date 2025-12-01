import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
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
  FAB,
  Portal,
  Modal,
  TextInput,
  ProgressBar,
  Snackbar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { financialManagementService, Budget } from '../../services/FinancialManagementService';

interface SimpleBudgetPlanningProps {
  navigation: any;
}

const SimpleBudgetPlanning: React.FC<SimpleBudgetPlanningProps> = ({ navigation }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Add Budget Form State
  const [newBudget, setNewBudget] = useState({
    name: '',
    period: {
      type: 'monthly' as 'monthly' | 'quarterly' | 'annual' | 'seasonal' | 'custom',
      fiscalYear: new Date().getFullYear(),
    },
    startDate: new Date(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    status: 'draft' as 'draft' | 'active' | 'completed' | 'archived',
    totalBudgetedIncome: '',
    totalBudgetedExpenses: '',
    notes: '',
    createdBy: 'user',
  });

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
      if (!newBudget.name || !newBudget.totalBudgetedIncome || !newBudget.totalBudgetedExpenses) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const budgetData = {
        ...newBudget,
        totalBudgetedIncome: parseFloat(newBudget.totalBudgetedIncome),
        totalBudgetedExpenses: parseFloat(newBudget.totalBudgetedExpenses),
        projectedProfit: parseFloat(newBudget.totalBudgetedIncome) - parseFloat(newBudget.totalBudgetedExpenses),
      };

      await financialManagementService.createBudget(budgetData);
      
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
        totalBudgetedIncome: '',
        totalBudgetedExpenses: '',
        notes: '',
        createdBy: 'user',
      });
      
      setShowAddModal(false);
      loadBudgets();
      
      setSnackbarMessage('Budget created successfully');
      setShowSnackbar(true);
    } catch (error) {
      console.error('Error adding budget:', error);
      Alert.alert('Error', 'Failed to create budget');
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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'draft': return '#FF9800';
      case 'completed': return '#2196F3';
      case 'archived': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const renderBudgetOverview = () => {
    if (budgets.length === 0) return null;

    const totalBudgetedIncome = budgets.reduce((sum, budget) => sum + budget.totalBudgetedIncome, 0);
    const totalBudgetedExpenses = budgets.reduce((sum, budget) => sum + budget.totalBudgetedExpenses, 0);
    const totalProjectedProfit = budgets.reduce((sum, budget) => sum + budget.projectedProfit, 0);
    const activeBudgets = budgets.filter(b => b.status === 'active').length;

    return (
      <Card style={styles.overviewCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Budget Overview</Title>
          
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewValue, { color: '#4CAF50' }]}>
                {formatCurrency(totalBudgetedIncome)}
              </Text>
              <Text style={styles.overviewLabel}>Total Budgeted Income</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewValue, { color: '#F44336' }]}>
                {formatCurrency(totalBudgetedExpenses)}
              </Text>
              <Text style={styles.overviewLabel}>Total Budgeted Expenses</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewValue, { color: totalProjectedProfit >= 0 ? '#4CAF50' : '#F44336' }]}>
                {formatCurrency(totalProjectedProfit)}
              </Text>
              <Text style={styles.overviewLabel}>Projected Profit</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={[styles.overviewValue, { color: '#2196F3' }]}>
                {activeBudgets}
              </Text>
              <Text style={styles.overviewLabel}>Active Budgets</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderBudgetCard = (budget: Budget) => {
    const profitMargin = budget.totalBudgetedIncome > 0 ? 
      (budget.projectedProfit / budget.totalBudgetedIncome) * 100 : 0;

    return (
      <Card key={budget.id} style={styles.budgetCard}>
        <Card.Content>
          <View style={styles.budgetHeader}>
            <View style={styles.budgetHeaderLeft}>
              <Title style={styles.budgetName}>{budget.name}</Title>
              <Text style={styles.budgetPeriod}>
                {budget.period.type} • FY {budget.period.fiscalYear}
              </Text>
              <Text style={styles.budgetDates}>
                {budget.startDate.toLocaleDateString()} - {budget.endDate.toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.budgetHeaderRight}>
              <Chip 
                mode="outlined"
                textStyle={[styles.statusChipText, { color: getStatusColor(budget.status) }]}
                style={[styles.statusChip, { borderColor: getStatusColor(budget.status) }]}
              >
                {budget.status}
              </Chip>
            </View>
          </View>

          <View style={styles.budgetSummary}>
            <View style={styles.budgetStat}>
              <Text style={[styles.budgetStatValue, { color: '#4CAF50' }]}>
                {formatCurrency(budget.totalBudgetedIncome)}
              </Text>
              <Text style={styles.budgetStatLabel}>Budgeted Income</Text>
            </View>
            <View style={styles.budgetStat}>
              <Text style={[styles.budgetStatValue, { color: '#F44336' }]}>
                {formatCurrency(budget.totalBudgetedExpenses)}
              </Text>
              <Text style={styles.budgetStatLabel}>Budgeted Expenses</Text>
            </View>
            <View style={styles.budgetStat}>
              <Text style={[styles.budgetStatValue, { color: budget.projectedProfit >= 0 ? '#4CAF50' : '#F44336' }]}>
                {formatCurrency(budget.projectedProfit)}
              </Text>
              <Text style={styles.budgetStatLabel}>Projected Profit</Text>
            </View>
          </View>

          <View style={styles.profitMarginContainer}>
            <View style={styles.profitMarginHeader}>
              <Text style={styles.profitMarginLabel}>Profit Margin</Text>
              <Text style={[styles.profitMarginPercentage, { color: profitMargin >= 0 ? '#4CAF50' : '#F44336' }]}>
                {profitMargin.toFixed(1)}%
              </Text>
            </View>
            <ProgressBar 
              progress={Math.abs(profitMargin) / 100} 
              color={profitMargin >= 0 ? '#4CAF50' : '#F44336'}
              style={styles.profitMarginBar}
            />
          </View>

          {budget.actualProfit !== undefined && (
            <View style={styles.actualVsBudgeted}>
              <Text style={styles.actualLabel}>Actual Profit:</Text>
              <Text style={[styles.actualValue, { color: budget.actualProfit >= 0 ? '#4CAF50' : '#F44336' }]}>
                {formatCurrency(budget.actualProfit)}
              </Text>
              {budget.variance !== undefined && (
                <Text style={[styles.varianceText, { color: budget.variance >= 0 ? '#4CAF50' : '#F44336' }]}>
                  {budget.variance >= 0 ? '+' : ''}{formatCurrency(budget.variance)} variance
                </Text>
              )}
            </View>
          )}

          {budget.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{budget.notes}</Text>
            </View>
          )}
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
          {budget.status === 'draft' && (
            <Button
              mode="contained"
              onPress={() => {
                // Activate budget logic
                Alert.alert('Info', 'Budget activation feature coming soon');
              }}
            >
              Activate
            </Button>
          )}
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
            label="Budget Name *"
            value={newBudget.name}
            onChangeText={(text) => setNewBudget(prev => ({ ...prev, name: text }))}
            mode="outlined"
            style={styles.input}
          />

          <View style={styles.periodSelector}>
            <Text style={styles.fieldLabel}>Budget Period</Text>
            <View style={styles.periodOptions}>
              {[
                { key: 'monthly', label: 'Monthly' },
                { key: 'quarterly', label: 'Quarterly' },
                { key: 'annual', label: 'Annual' },
                { key: 'seasonal', label: 'Seasonal' },
              ].map((period) => (
                <Chip
                  key={period.key}
                  selected={newBudget.period.type === period.key}
                  onPress={() => setNewBudget(prev => ({ 
                    ...prev, 
                    period: { ...prev.period, type: period.key as any } 
                  }))}
                  style={styles.periodChip}
                >
                  {period.label}
                </Chip>
              ))}
            </View>
          </View>

          <TextInput
            label="Fiscal Year"
            value={newBudget.period.fiscalYear.toString()}
            onChangeText={(text) => setNewBudget(prev => ({ 
              ...prev, 
              period: { ...prev.period, fiscalYear: parseInt(text) || new Date().getFullYear() }
            }))}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Total Budgeted Income *"
            value={newBudget.totalBudgetedIncome}
            onChangeText={(text) => setNewBudget(prev => ({ ...prev, totalBudgetedIncome: text }))}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="currency-usd" />}
          />

          <TextInput
            label="Total Budgeted Expenses *"
            value={newBudget.totalBudgetedExpenses}
            onChangeText={(text) => setNewBudget(prev => ({ ...prev, totalBudgetedExpenses: text }))}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="currency-usd" />}
          />

          {newBudget.totalBudgetedIncome && newBudget.totalBudgetedExpenses && (
            <View style={styles.projectedProfit}>
              <Text style={styles.projectedProfitLabel}>Projected Profit:</Text>
              <Text style={[
                styles.projectedProfitValue,
                { color: (parseFloat(newBudget.totalBudgetedIncome) - parseFloat(newBudget.totalBudgetedExpenses)) >= 0 ? '#4CAF50' : '#F44336' }
              ]}>
                {formatCurrency(parseFloat(newBudget.totalBudgetedIncome || '0') - parseFloat(newBudget.totalBudgetedExpenses || '0'))}
              </Text>
            </View>
          )}

          <TextInput
            label="Notes (Optional)"
            value={newBudget.notes}
            onChangeText={(text) => setNewBudget(prev => ({ ...prev, notes: text }))}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
          />

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
              disabled={!newBudget.name || !newBudget.totalBudgetedIncome || !newBudget.totalBudgetedExpenses}
            >
              Create Budget
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );

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

        {budgets.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyState}>
                <Icon name="wallet" size={64} color="#E0E0E0" />
                <Text style={styles.emptyTitle}>No Budgets Created</Text>
                <Text style={styles.emptySubtitle}>
                  Create your first budget to start planning your farm finances
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
    marginBottom: 2,
  },
  budgetDates: {
    fontSize: 12,
    color: '#999',
  },
  budgetHeaderRight: {
    marginLeft: 16,
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    fontSize: 10,
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
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  budgetStatLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  profitMarginContainer: {
    marginBottom: 12,
  },
  profitMarginHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  profitMarginLabel: {
    fontSize: 14,
    color: '#666',
  },
  profitMarginPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  profitMarginBar: {
    height: 6,
    borderRadius: 3,
  },
  actualVsBudgeted: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  actualLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  actualValue: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 8,
  },
  varianceText: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  notesContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 12,
    color: '#333',
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
  projectedProfit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
    marginBottom: 16,
  },
  projectedProfitLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  projectedProfitValue: {
    fontSize: 16,
    fontWeight: 'bold',
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

export default SimpleBudgetPlanning;