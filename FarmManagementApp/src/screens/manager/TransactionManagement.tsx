import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Alert,
  TouchableOpacity,
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
  Searchbar,
  Menu,
  Divider,
  RadioButton,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { financialManagementService, FinancialTransaction, FinancialCategory } from '../../services/FinancialManagementService';

interface TransactionManagementProps {
  navigation: any;
}

interface TransactionFilters {
  type?: 'income' | 'expense';
  status?: 'pending' | 'completed' | 'cancelled' | 'disputed';
  categoryId?: string;
  dateRange?: { startDate: Date; endDate: Date };
  amountRange?: { min: number; max: number };
}

const TransactionManagement: React.FC<TransactionManagementProps> = ({ navigation }) => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FinancialTransaction | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({});

  // Add Transaction Form State
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    categoryId: '',
    date: new Date(),
    paymentMethod: {
      id: 'cash',
      name: 'Cash',
      type: 'cash' as const,
      isActive: true,
    },
    status: 'completed' as const,
    tags: [] as string[],
    notes: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadTransactions = useCallback(async () => {
    try {
      const allTransactions = financialManagementService.getAllTransactions();
      const allCategories = financialManagementService.getAllCategories();
      
      let filteredTransactions = allTransactions;

      // Apply filters
      if (filters.type) {
        filteredTransactions = filteredTransactions.filter(t => t.type === filters.type);
      }
      if (filters.status) {
        filteredTransactions = filteredTransactions.filter(t => t.status === filters.status);
      }
      if (filters.categoryId) {
        filteredTransactions = filteredTransactions.filter(t => t.category.id === filters.categoryId);
      }
      if (filters.dateRange) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.date >= filters.dateRange!.startDate && t.date <= filters.dateRange!.endDate
        );
      }
      if (filters.amountRange) {
        filteredTransactions = filteredTransactions.filter(t => 
          t.amount >= filters.amountRange!.min && t.amount <= filters.amountRange!.max
        );
      }

      // Apply search
      if (searchQuery) {
        filteredTransactions = filteredTransactions.filter(t =>
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.vendor?.name && t.vendor.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (t.customer?.name && t.customer.name.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      // Sort by date (newest first)
      filteredTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());

      setTransactions(filteredTransactions);
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTransactions();
  }, [loadTransactions]);

  const handleAddTransaction = async () => {
    try {
      if (!newTransaction.amount || !newTransaction.description || !newTransaction.categoryId) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      const selectedCategory = categories.find(c => c.id === newTransaction.categoryId);
      if (!selectedCategory) {
        Alert.alert('Error', 'Please select a valid category');
        return;
      }

      const transactionData = {
        type: newTransaction.type,
        category: selectedCategory,
        amount: parseFloat(newTransaction.amount),
        currency: 'USD',
        date: newTransaction.date,
        description: newTransaction.description,
        paymentMethod: newTransaction.paymentMethod,
        status: newTransaction.status,
        tags: newTransaction.tags,
        notes: newTransaction.notes,
        attachments: [],
        createdBy: 'user',
      };

      await financialManagementService.createTransaction(transactionData);
      
      // Reset form
      setNewTransaction({
        type: 'expense',
        amount: '',
        description: '',
        categoryId: '',
        date: new Date(),
        paymentMethod: {
          id: 'cash',
          name: 'Cash',
          type: 'cash',
          isActive: true,
        },
        status: 'completed',
        tags: [],
        notes: '',
      });
      
      setShowAddModal(false);
      loadTransactions();
      
      Alert.alert('Success', 'Transaction added successfully');
    } catch (error) {
      console.error('Error adding transaction:', error);
      Alert.alert('Error', 'Failed to add transaction');
    }
  };

  const handleDeleteTransaction = (transactionId: string) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await financialManagementService.deleteTransaction(transactionId);
              loadTransactions();
              Alert.alert('Success', 'Transaction deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const handleUpdateTransactionStatus = async (transactionId: string, newStatus: FinancialTransaction['status']) => {
    try {
      await financialManagementService.updateTransaction(transactionId, { status: newStatus });
      loadTransactions();
    } catch (error) {
      Alert.alert('Error', 'Failed to update transaction status');
    }
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

  const renderTransactionItem = (transaction: FinancialTransaction) => (
    <Card key={transaction.id} style={styles.transactionCard}>
      <Card.Content>
        <View style={styles.transactionHeader}>
          <View style={styles.transactionHeaderLeft}>
            <Icon 
              name={transaction.type === 'income' ? 'arrow-down-circle' : 'arrow-up-circle'} 
              size={28} 
              color={transaction.type === 'income' ? '#4CAF50' : '#F44336'} 
            />
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionDescription}>{transaction.description}</Text>
              <Text style={styles.transactionCategory}>{transaction.category.name}</Text>
              <Text style={styles.transactionDate}>
                {transaction.date.toLocaleDateString()} • {transaction.paymentMethod.name}
              </Text>
            </View>
          </View>
          <View style={styles.transactionHeaderRight}>
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

        {transaction.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {transaction.tags.map((tag, index) => (
              <Chip key={index} mode="outlined" style={styles.tagChip}>
                {tag}
              </Chip>
            ))}
          </View>
        )}

        {transaction.vendor && (
          <View style={styles.vendorInfo}>
            <Icon name="store" size={16} color="#666" />
            <Text style={styles.vendorText}>Vendor: {transaction.vendor.name}</Text>
          </View>
        )}

        {transaction.customer && (
          <View style={styles.customerInfo}>
            <Icon name="account" size={16} color="#666" />
            <Text style={styles.customerText}>Customer: {transaction.customer.name}</Text>
          </View>
        )}

        {transaction.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{transaction.notes}</Text>
          </View>
        )}

        {transaction.weatherImpact && (
          <View style={styles.weatherImpact}>
            <Icon name="weather-cloudy" size={16} color="#FF9800" />
            <Text style={styles.weatherImpactText}>
              Weather Impact: {transaction.weatherImpact.weatherCondition}
              {transaction.weatherImpact.estimatedCostImpact && 
                ` (${formatCurrency(transaction.weatherImpact.estimatedCostImpact)})`
              }
            </Text>
          </View>
        )}
      </Card.Content>

      <Card.Actions style={styles.transactionActions}>
        <Button
          mode="text"
          onPress={() => navigation.navigate('TransactionDetails', { transactionId: transaction.id })}
        >
          View Details
        </Button>
        {transaction.status === 'pending' && (
          <Button
            mode="outlined"
            onPress={() => handleUpdateTransactionStatus(transaction.id, 'completed')}
          >
            Mark Complete
          </Button>
        )}
        <Menu
          visible={selectedTransaction?.id === transaction.id}
          onDismiss={() => setSelectedTransaction(null)}
          anchor={
            <IconButton
              icon="dots-vertical"
              onPress={() => setSelectedTransaction(transaction)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setSelectedTransaction(null);
              navigation.navigate('EditTransaction', { transactionId: transaction.id });
            }}
            title="Edit"
            leadingIcon="pencil"
          />
          <Menu.Item
            onPress={() => {
              setSelectedTransaction(null);
              // Duplicate transaction logic
            }}
            title="Duplicate"
            leadingIcon="content-copy"
          />
          <Divider />
          <Menu.Item
            onPress={() => {
              setSelectedTransaction(null);
              handleDeleteTransaction(transaction.id);
            }}
            title="Delete"
            leadingIcon="delete"
          />
        </Menu>
      </Card.Actions>
    </Card>
  );

  const renderAddTransactionModal = () => (
    <Portal>
      <Modal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        contentContainerStyle={styles.addModal}
      >
        <ScrollView>
          <Title style={styles.modalTitle}>Add Transaction</Title>

          <View style={styles.typeSelector}>
            <Text style={styles.fieldLabel}>Type</Text>
            <View style={styles.radioGroup}>
              <View style={styles.radioItem}>
                <RadioButton
                  value="income"
                  status={newTransaction.type === 'income' ? 'checked' : 'unchecked'}
                  onPress={() => setNewTransaction(prev => ({ ...prev, type: 'income' }))}
                />
                <Text>Income</Text>
              </View>
              <View style={styles.radioItem}>
                <RadioButton
                  value="expense"
                  status={newTransaction.type === 'expense' ? 'checked' : 'unchecked'}
                  onPress={() => setNewTransaction(prev => ({ ...prev, type: 'expense' }))}
                />
                <Text>Expense</Text>
              </View>
            </View>
          </View>

          <TextInput
            label="Amount"
            value={newTransaction.amount}
            onChangeText={(text) => setNewTransaction(prev => ({ ...prev, amount: text }))}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="currency-usd" />}
          />

          <TextInput
            label="Description"
            value={newTransaction.description}
            onChangeText={(text) => setNewTransaction(prev => ({ ...prev, description: text }))}
            mode="outlined"
            style={styles.input}
          />

          <View style={styles.categorySelector}>
            <Text style={styles.fieldLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories
                .filter(cat => cat.type === newTransaction.type)
                .map(category => (
                  <Chip
                    key={category.id}
                    selected={newTransaction.categoryId === category.id}
                    onPress={() => setNewTransaction(prev => ({ ...prev, categoryId: category.id }))}
                    style={styles.categoryChip}
                  >
                    {category.name}
                  </Chip>
                ))}
            </ScrollView>
          </View>

          <TouchableOpacity
            style={styles.dateSelector}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.fieldLabel}>Date</Text>
            <View style={styles.dateDisplay}>
              <Icon name="calendar" size={20} color="#666" />
              <Text style={styles.dateText}>{newTransaction.date.toLocaleDateString()}</Text>
            </View>
          </TouchableOpacity>

          <TextInput
            label="Notes (Optional)"
            value={newTransaction.notes}
            onChangeText={(text) => setNewTransaction(prev => ({ ...prev, notes: text }))}
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
              onPress={handleAddTransaction}
              style={styles.modalButton}
            >
              Add Transaction
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );

  const renderFilterModal = () => (
    <Portal>
      <Modal
        visible={showFilterModal}
        onDismiss={() => setShowFilterModal(false)}
        contentContainerStyle={styles.filterModal}
      >
        <Title style={styles.modalTitle}>Filter Transactions</Title>
        
        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Type</Text>
          <View style={styles.filterOptions}>
            <Chip
              selected={!filters.type}
              onPress={() => setFilters(prev => ({ ...prev, type: undefined }))}
              style={styles.filterChip}
            >
              All
            </Chip>
            <Chip
              selected={filters.type === 'income'}
              onPress={() => setFilters(prev => ({ ...prev, type: 'income' }))}
              style={styles.filterChip}
            >
              Income
            </Chip>
            <Chip
              selected={filters.type === 'expense'}
              onPress={() => setFilters(prev => ({ ...prev, type: 'expense' }))}
              style={styles.filterChip}
            >
              Expense
            </Chip>
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterSectionTitle}>Status</Text>
          <View style={styles.filterOptions}>
            <Chip
              selected={!filters.status}
              onPress={() => setFilters(prev => ({ ...prev, status: undefined }))}
              style={styles.filterChip}
            >
              All
            </Chip>
            <Chip
              selected={filters.status === 'completed'}
              onPress={() => setFilters(prev => ({ ...prev, status: 'completed' }))}
              style={styles.filterChip}
            >
              Completed
            </Chip>
            <Chip
              selected={filters.status === 'pending'}
              onPress={() => setFilters(prev => ({ ...prev, status: 'pending' }))}
              style={styles.filterChip}
            >
              Pending
            </Chip>
          </View>
        </View>

        <View style={styles.modalActions}>
          <Button
            mode="outlined"
            onPress={() => {
              setFilters({});
              setShowFilterModal(false);
            }}
            style={styles.modalButton}
          >
            Clear Filters
          </Button>
          <Button
            mode="contained"
            onPress={() => setShowFilterModal(false)}
            style={styles.modalButton}
          >
            Apply Filters
          </Button>
        </View>
      </Modal>
    </Portal>
  );

  const renderSummaryCard = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netAmount = totalIncome - totalExpenses;
    const pendingCount = transactions.filter(t => t.status === 'pending').length;

    return (
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Transaction Summary</Title>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                {formatCurrency(totalIncome)}
              </Text>
              <Text style={styles.summaryLabel}>Total Income</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#F44336' }]}>
                {formatCurrency(totalExpenses)}
              </Text>
              <Text style={styles.summaryLabel}>Total Expenses</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: netAmount >= 0 ? '#4CAF50' : '#F44336' }]}>
                {formatCurrency(netAmount)}
              </Text>
              <Text style={styles.summaryLabel}>Net Amount</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: '#FF9800' }]}>
                {pendingCount}
              </Text>
              <Text style={styles.summaryLabel}>Pending</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading transactions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search transactions..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <View style={styles.headerActions}>
          <IconButton
            icon="filter-variant"
            mode="outlined"
            onPress={() => setShowFilterModal(true)}
          />
          <IconButton
            icon="download"
            mode="outlined"
            onPress={() => navigation.navigate('ExportTransactions')}
          />
        </View>
      </View>

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
        {renderSummaryCard()}

        {transactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <View style={styles.emptyState}>
                <Icon name="receipt" size={64} color="#E0E0E0" />
                <Text style={styles.emptyTitle}>No Transactions Found</Text>
                <Text style={styles.emptySubtitle}>
                  {Object.keys(filters).length > 0 || searchQuery
                    ? 'No transactions match your current search or filter criteria'
                    : 'Start by adding your first transaction'
                  }
                </Text>
                <Button
                  mode="contained"
                  style={styles.emptyActionButton}
                  onPress={() => setShowAddModal(true)}
                >
                  Add Transaction
                </Button>
              </View>
            </Card.Content>
          </Card>
        ) : (
          transactions.map(renderTransactionItem)
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        label="Add Transaction"
      />

      {renderAddTransactionModal()}
      {renderFilterModal()}
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
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  searchBar: {
    flex: 1,
    marginRight: 8,
  },
  headerActions: {
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    margin: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  transactionCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  transactionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
  },
  transactionHeaderRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    fontSize: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tagChip: {
    marginRight: 8,
    marginBottom: 4,
    height: 24,
  },
  vendorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  vendorText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  customerText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#666',
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
  weatherImpact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 4,
  },
  weatherImpactText: {
    marginLeft: 8,
    fontSize: 12,
    color: '#FF9800',
  },
  transactionActions: {
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
  typeSelector: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  radioGroup: {
    flexDirection: 'row',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  input: {
    marginBottom: 16,
  },
  categorySelector: {
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
  },
  dateSelector: {
    marginBottom: 16,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    backgroundColor: '#F8F9FA',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
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
  filterModal: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterChip: {
    marginRight: 8,
    marginBottom: 8,
  },
});

export default TransactionManagement;