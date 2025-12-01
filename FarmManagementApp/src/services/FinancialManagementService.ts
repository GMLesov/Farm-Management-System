/**
 * Financial Management Service
 * Comprehensive financial tracking with expense management, revenue analysis,
 * budget planning, profitability analysis, and weather impact assessment
 */

// Core Financial Data Models
export interface FinancialTransaction {
  id: string;
  type: 'income' | 'expense';
  category: FinancialCategory;
  subcategory?: string;
  amount: number;
  currency: string;
  date: Date;
  description: string;
  reference?: string; // invoice number, receipt number, etc.
  paymentMethod: PaymentMethod;
  vendor?: Vendor;
  customer?: Customer;
  cropId?: string; // associated crop if applicable
  fieldId?: string; // associated field if applicable
  seasonId?: string; // associated growing season
  tags: string[];
  status: 'pending' | 'completed' | 'cancelled' | 'disputed';
  recurring?: RecurringSchedule;
  attachments: string[]; // file paths or URLs
  taxInfo?: TaxInformation;
  weatherImpact?: WeatherImpact;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  code: string; // for accounting systems
  description: string;
  parentCategory?: string;
  isActive: boolean;
  budgetable: boolean; // can this category have budget allocations
  taxDeductible?: boolean;
  defaultAccount?: string;
  subcategories: string[];
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'check' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet' | 'other';
  account?: string;
  provider?: string; // bank name, credit card company, etc.
  lastFourDigits?: string;
  isActive: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  category: 'seed_supplier' | 'equipment_dealer' | 'fertilizer_supplier' | 'fuel_provider' | 'service_provider' | 'insurance' | 'other';
  contactInfo: ContactInfo;
  paymentTerms?: PaymentTerms;
  taxId?: string;
  isActive: boolean;
  notes?: string;
  rating?: number; // 1-5 star rating
  totalSpent: number;
  averageOrderValue: number;
  lastTransactionDate?: Date;
}

export interface Customer {
  id: string;
  name: string;
  type: 'individual' | 'business' | 'cooperative' | 'distributor';
  contactInfo: ContactInfo;
  paymentTerms?: PaymentTerms;
  creditLimit?: number;
  taxId?: string;
  isActive: boolean;
  notes?: string;
  totalRevenue: number;
  averageOrderValue: number;
  lastTransactionDate?: Date;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export interface PaymentTerms {
  daysNet: number; // payment due in X days
  discountPercent?: number; // early payment discount
  discountDays?: number; // discount applies if paid within X days
  lateFeePercent?: number;
  lateFeeFlat?: number;
}

export interface RecurringSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
  interval: number; // every X periods
  startDate: Date;
  endDate?: Date;
  nextDueDate: Date;
  isActive: boolean;
}

export interface TaxInformation {
  taxRate?: number;
  taxAmount?: number;
  taxCategory?: string;
  deductible: boolean;
  depreciation?: DepreciationInfo;
}

export interface DepreciationInfo {
  method: 'straight_line' | 'declining_balance' | 'sum_of_years';
  usefulLife: number; // years
  salvageValue?: number;
  currentValue: number;
  annualDepreciation: number;
}

export interface WeatherImpact {
  impactType: 'positive' | 'negative' | 'neutral';
  severity: 'low' | 'medium' | 'high';
  description: string;
  estimatedCostImpact?: number;
  weatherCondition: string; // drought, flood, hail, etc.
  dateOfImpact: Date;
  recoveryExpected?: boolean;
  insuranceClaim?: string;
}

export interface Budget {
  id: string;
  name: string;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'completed' | 'archived';
  categories: BudgetCategory[];
  totalBudgetedIncome: number;
  totalBudgetedExpenses: number;
  projectedProfit: number;
  actualProfit?: number;
  variance?: number; // actual vs budgeted
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetPeriod {
  type: 'monthly' | 'quarterly' | 'annual' | 'seasonal' | 'custom';
  fiscalYear?: number;
  season?: 'spring' | 'summer' | 'fall' | 'winter';
  customLabel?: string;
}

export interface BudgetCategory {
  categoryId: string;
  budgetedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercent: number;
  allocations?: BudgetAllocation[];
  notes?: string;
}

export interface BudgetAllocation {
  cropId?: string;
  fieldId?: string;
  amount: number;
  percentage: number;
  reasoning?: string;
}

export interface FinancialReport {
  id: string;
  type: ReportType;
  title: string;
  period: ReportPeriod;
  generatedAt: Date;
  generatedBy: string;
  data: any; // report-specific data structure
  summary: ReportSummary;
  charts?: ChartData[];
  filters?: ReportFilters;
  format: 'pdf' | 'excel' | 'csv' | 'json';
  filePath?: string;
}

export interface ReportType {
  id: string;
  name: string;
  description: string;
  category: 'profitability' | 'cashflow' | 'budget' | 'tax' | 'crop_analysis' | 'vendor_analysis';
  template: string;
  parameters: ReportParameter[];
}

export interface ReportPeriod {
  startDate: Date;
  endDate: Date;
  label: string;
  comparisonPeriod?: {
    startDate: Date;
    endDate: Date;
    label: string;
  };
}

export interface ReportSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  keyMetrics: { [key: string]: number | string };
  trends: TrendAnalysis[];
  alerts: string[];
}

export interface TrendAnalysis {
  metric: string;
  direction: 'up' | 'down' | 'stable';
  change: number;
  changePercent: number;
  significance: 'low' | 'medium' | 'high';
}

export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area';
  title: string;
  data: any;
  options?: any;
}

export interface ReportParameter {
  name: string;
  type: 'date' | 'number' | 'string' | 'boolean' | 'select';
  required: boolean;
  defaultValue?: any;
  options?: string[];
}

export interface ReportFilters {
  dateRange?: { startDate: Date; endDate: Date };
  categories?: string[];
  crops?: string[];
  fields?: string[];
  vendors?: string[];
  customers?: string[];
  amountRange?: { min: number; max: number };
}

export interface CashFlowProjection {
  id: string;
  name: string;
  projectionPeriod: number; // months
  startDate: Date;
  monthlyProjections: MonthlyProjection[];
  assumptions: ProjectionAssumption[];
  scenarios: CashFlowScenario[];
  riskFactors: RiskFactor[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthlyProjection {
  month: Date;
  projectedIncome: number;
  projectedExpenses: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
  confidence: number; // 0-100%
  scenarios?: { [scenarioName: string]: number };
}

export interface ProjectionAssumption {
  category: string;
  description: string;
  value: number | string;
  impact: 'high' | 'medium' | 'low';
  source: string; // historical data, market research, etc.
}

export interface CashFlowScenario {
  name: string;
  description: string;
  type: 'optimistic' | 'realistic' | 'pessimistic';
  adjustments: ScenarioAdjustment[];
  totalImpact: number;
}

export interface ScenarioAdjustment {
  category: string;
  adjustmentType: 'percentage' | 'fixed_amount';
  value: number;
  reasoning: string;
}

export interface RiskFactor {
  name: string;
  description: string;
  probability: number; // 0-100%
  impact: number; // dollar amount
  mitigation: string;
  category: 'weather' | 'market' | 'operational' | 'financial' | 'regulatory';
}

export interface FinancialKPI {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  targetValue?: number;
  benchmark?: number;
  category: 'profitability' | 'efficiency' | 'liquidity' | 'leverage';
  calculation: string;
  lastUpdated: Date;
}

export interface ProfitabilityAnalysis {
  period: { startDate: Date; endDate: Date };
  totalRevenue: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  grossMargin: number;
  netMargin: number;
  returnOnInvestment: number;
  revenueByCategory: { [category: string]: number };
  expensesByCategory: { [category: string]: number };
  cropProfitability: CropProfitability[];
  seasonalTrends: SeasonalTrend[];
  yearOverYearComparison?: YearOverYearComparison;
}

export interface CropProfitability {
  cropId: string;
  cropName: string;
  revenue: number;
  directCosts: number;
  indirectCosts: number;
  grossProfit: number;
  netProfit: number;
  profitPerAcre: number;
  margin: number;
  roi: number;
}

export interface SeasonalTrend {
  season: string;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
  yearOverYearChange: number;
}

export interface YearOverYearComparison {
  currentYear: FinancialSummary;
  previousYear: FinancialSummary;
  changes: {
    revenue: { amount: number; percent: number };
    expenses: { amount: number; percent: number };
    profit: { amount: number; percent: number };
    margin: { amount: number; percent: number };
  };
}

export interface FinancialSummary {
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
}

/**
 * Financial Management Service
 * Comprehensive financial tracking and analysis system
 */
class FinancialManagementService {
  private transactions: Map<string, FinancialTransaction> = new Map();
  private categories: Map<string, FinancialCategory> = new Map();
  private vendors: Map<string, Vendor> = new Map();
  private customers: Map<string, Customer> = new Map();
  private paymentMethods: Map<string, PaymentMethod> = new Map();
  private budgets: Map<string, Budget> = new Map();
  private reports: Map<string, FinancialReport> = new Map();
  private cashFlowProjections: Map<string, CashFlowProjection> = new Map();

  constructor() {
    this.initializeService();
  }

  private initializeService(): void {
    this.loadDataFromStorage();
    this.initializeDefaultCategories();
    this.setupRecurringTransactionProcessor();
  }

  // Transaction Management
  public createTransaction(transactionData: Omit<FinancialTransaction, 'id' | 'createdAt' | 'updatedAt'>): string {
    const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const transaction: FinancialTransaction = {
      id: transactionId,
      ...transactionData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.transactions.set(transactionId, transaction);
    
    // Update vendor/customer totals
    this.updateVendorCustomerTotals(transaction);
    
    // Process recurring transaction if applicable
    if (transaction.recurring) {
      this.scheduleNextRecurringTransaction(transaction);
    }

    this.saveDataToStorage();
    return transactionId;
  }

  public getTransaction(transactionId: string): FinancialTransaction | null {
    return this.transactions.get(transactionId) || null;
  }

  public getAllTransactions(): FinancialTransaction[] {
    return Array.from(this.transactions.values());
  }

  public getTransactionsByDateRange(startDate: Date, endDate: Date): FinancialTransaction[] {
    return this.getAllTransactions().filter(
      transaction => transaction.date >= startDate && transaction.date <= endDate
    );
  }

  public getTransactionsByCategory(categoryId: string): FinancialTransaction[] {
    return this.getAllTransactions().filter(
      transaction => transaction.category.id === categoryId
    );
  }

  public getTransactionsByCrop(cropId: string): FinancialTransaction[] {
    return this.getAllTransactions().filter(
      transaction => transaction.cropId === cropId
    );
  }

  public updateTransaction(transactionId: string, updates: Partial<FinancialTransaction>): boolean {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) return false;

    const updatedTransaction = {
      ...transaction,
      ...updates,
      updatedAt: new Date()
    };

    this.transactions.set(transactionId, updatedTransaction);
    this.updateVendorCustomerTotals(updatedTransaction);
    this.saveDataToStorage();
    return true;
  }

  public deleteTransaction(transactionId: string): boolean {
    const success = this.transactions.delete(transactionId);
    if (success) {
      this.saveDataToStorage();
    }
    return success;
  }

  // Category Management
  public createCategory(categoryData: Omit<FinancialCategory, 'id'>): string {
    const categoryId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const category: FinancialCategory = {
      id: categoryId,
      ...categoryData
    };

    this.categories.set(categoryId, category);
    this.saveDataToStorage();
    return categoryId;
  }

  public getCategory(categoryId: string): FinancialCategory | null {
    return this.categories.get(categoryId) || null;
  }

  public getAllCategories(): FinancialCategory[] {
    return Array.from(this.categories.values());
  }

  public getIncomeCategories(): FinancialCategory[] {
    return this.getAllCategories().filter(cat => cat.type === 'income');
  }

  public getExpenseCategories(): FinancialCategory[] {
    return this.getAllCategories().filter(cat => cat.type === 'expense');
  }

  // Vendor Management
  public createVendor(vendorData: Omit<Vendor, 'id' | 'totalSpent' | 'averageOrderValue'>): string {
    const vendorId = `vendor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const vendor: Vendor = {
      id: vendorId,
      ...vendorData,
      totalSpent: 0,
      averageOrderValue: 0
    };

    this.vendors.set(vendorId, vendor);
    this.saveDataToStorage();
    return vendorId;
  }

  public getVendor(vendorId: string): Vendor | null {
    return this.vendors.get(vendorId) || null;
  }

  public getAllVendors(): Vendor[] {
    return Array.from(this.vendors.values());
  }

  // Customer Management
  public createCustomer(customerData: Omit<Customer, 'id' | 'totalRevenue' | 'averageOrderValue'>): string {
    const customerId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const customer: Customer = {
      id: customerId,
      ...customerData,
      totalRevenue: 0,
      averageOrderValue: 0
    };

    this.customers.set(customerId, customer);
    this.saveDataToStorage();
    return customerId;
  }

  public getCustomer(customerId: string): Customer | null {
    return this.customers.get(customerId) || null;
  }

  public getAllCustomers(): Customer[] {
    return Array.from(this.customers.values());
  }

  // Budget Management
  public createBudget(budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'categories'>): string {
    const budgetId = `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const budget: Budget = {
      id: budgetId,
      ...budgetData,
      categories: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.budgets.set(budgetId, budget);
    this.saveDataToStorage();
    return budgetId;
  }

  public getBudget(budgetId: string): Budget | null {
    return this.budgets.get(budgetId) || null;
  }

  public getAllBudgets(): Budget[] {
    return Array.from(this.budgets.values());
  }

  public getActiveBudget(): Budget | null {
    return this.getAllBudgets().find(budget => budget.status === 'active') || null;
  }

  public updateBudget(budgetId: string, updates: Partial<Budget>): boolean {
    const budget = this.budgets.get(budgetId);
    if (!budget) return false;

    const updatedBudget = {
      ...budget,
      ...updates,
      updatedAt: new Date()
    };

    this.budgets.set(budgetId, updatedBudget);
    this.saveDataToStorage();
    return true;
  }

  public deleteBudget(budgetId: string): boolean {
    const success = this.budgets.delete(budgetId);
    if (success) {
      this.saveDataToStorage();
    }
    return success;
  }

  // Financial Analysis
  public calculateProfitabilityAnalysis(startDate: Date, endDate: Date): ProfitabilityAnalysis {
    const transactions = this.getTransactionsByDateRange(startDate, endDate);
    
    const revenue = transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);

    const grossProfit = revenue - expenses;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
    const netProfit = grossProfit; // Simplified - would include taxes, depreciation, etc.
    const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    // Calculate revenue by category
    const revenueByCategory: { [category: string]: number } = {};
    transactions
      .filter(t => t.type === 'income' && t.status === 'completed')
      .forEach(t => {
        const categoryName = t.category.name;
        revenueByCategory[categoryName] = (revenueByCategory[categoryName] || 0) + t.amount;
      });

    // Calculate expenses by category
    const expensesByCategory: { [category: string]: number } = {};
    transactions
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .forEach(t => {
        const categoryName = t.category.name;
        expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + t.amount;
      });

    // Calculate crop profitability
    const cropProfitability = this.calculateCropProfitability(transactions);

    // Calculate seasonal trends
    const seasonalTrends = this.calculateSeasonalTrends(transactions);

    return {
      period: { startDate, endDate },
      totalRevenue: revenue,
      totalExpenses: expenses,
      grossProfit,
      netProfit,
      grossMargin,
      netMargin,
      returnOnInvestment: 0, // Would need asset value calculation
      revenueByCategory,
      expensesByCategory,
      cropProfitability,
      seasonalTrends
    };
  }

  public generateFinancialKPIs(): FinancialKPI[] {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const analysis = this.calculateProfitabilityAnalysis(thirtyDaysAgo, now);

    const kpis: FinancialKPI[] = [
      {
        name: 'Gross Profit Margin',
        value: analysis.grossMargin,
        unit: '%',
        trend: 'stable', // Would be calculated from historical data
        changePercent: 0,
        targetValue: 30,
        benchmark: 25,
        category: 'profitability',
        calculation: '(Revenue - COGS) / Revenue * 100',
        lastUpdated: now
      },
      {
        name: 'Net Profit Margin',
        value: analysis.netMargin,
        unit: '%',
        trend: 'stable',
        changePercent: 0,
        targetValue: 20,
        benchmark: 15,
        category: 'profitability',
        calculation: 'Net Profit / Revenue * 100',
        lastUpdated: now
      },
      {
        name: 'Revenue per Acre',
        value: analysis.totalRevenue / Math.max(1, this.getTotalFarmAcreage()),
        unit: '$/acre',
        trend: 'stable',
        changePercent: 0,
        category: 'efficiency',
        calculation: 'Total Revenue / Total Acreage',
        lastUpdated: now
      },
      {
        name: 'Cost per Acre',
        value: analysis.totalExpenses / Math.max(1, this.getTotalFarmAcreage()),
        unit: '$/acre',
        trend: 'stable',
        changePercent: 0,
        category: 'efficiency',
        calculation: 'Total Expenses / Total Acreage',
        lastUpdated: now
      }
    ];

    return kpis;
  }

  public generateCashFlowProjection(projectionPeriods: number = 12): CashFlowProjection {
    const projectionId = `projection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const historicalData = this.getHistoricalMonthlyData(12); // Last 12 months
    const monthlyProjections: MonthlyProjection[] = [];
    
    let cumulativeCashFlow = 0;
    const startDate = new Date();

    for (let i = 0; i < projectionPeriods; i++) {
      const projectionMonth = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      
      // Simple projection based on historical averages
      const avgIncome = this.calculateAverageMonthlyIncome(historicalData);
      const avgExpenses = this.calculateAverageMonthlyExpenses(historicalData);
      
      // Apply seasonal adjustments
      const seasonalMultiplier = this.getSeasonalMultiplier(projectionMonth);
      const projectedIncome = avgIncome * seasonalMultiplier.income;
      const projectedExpenses = avgExpenses * seasonalMultiplier.expenses;
      
      const netCashFlow = projectedIncome - projectedExpenses;
      cumulativeCashFlow += netCashFlow;

      monthlyProjections.push({
        month: projectionMonth,
        projectedIncome,
        projectedExpenses,
        netCashFlow,
        cumulativeCashFlow,
        confidence: this.calculateProjectionConfidence(i, historicalData.length)
      });
    }

    const projection: CashFlowProjection = {
      id: projectionId,
      name: `Cash Flow Projection - ${startDate.toDateString()}`,
      projectionPeriod: projectionPeriods,
      startDate,
      monthlyProjections,
      assumptions: this.generateProjectionAssumptions(),
      scenarios: this.generateCashFlowScenarios(),
      riskFactors: this.generateRiskFactors(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.cashFlowProjections.set(projectionId, projection);
    return projection;
  }

  // Report Generation
  public generateReport(reportType: string, period: ReportPeriod, filters?: ReportFilters): FinancialReport {
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let reportData: any;
    let reportSummary: ReportSummary;

    switch (reportType) {
      case 'profit_loss':
        reportData = this.generateProfitLossReport(period, filters);
        break;
      case 'cash_flow':
        reportData = this.generateCashFlowReport(period, filters);
        break;
      case 'budget_variance':
        reportData = this.generateBudgetVarianceReport(period, filters);
        break;
      case 'crop_profitability':
        reportData = this.generateCropProfitabilityReport(period, filters);
        break;
      case 'vendor_analysis':
        reportData = this.generateVendorAnalysisReport(period, filters);
        break;
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }

    reportSummary = this.generateReportSummary(reportData, reportType);

    const report: FinancialReport = {
      id: reportId,
      type: this.getReportTypeDefinition(reportType),
      title: `${reportType.replace('_', ' ').toUpperCase()} Report`,
      period,
      generatedAt: new Date(),
      generatedBy: 'system',
      data: reportData,
      summary: reportSummary,
      filters,
      format: 'json'
    };

    this.reports.set(reportId, report);
    return report;
  }

  // Weather Impact Analysis
  public analyzeWeatherImpact(startDate: Date, endDate: Date): {
    totalImpact: number;
    impactByType: { [type: string]: number };
    affectedTransactions: FinancialTransaction[];
    recommendations: string[];
  } {
    const transactions = this.getTransactionsByDateRange(startDate, endDate);
    const weatherImpactedTransactions = transactions.filter(t => t.weatherImpact);

    const totalImpact = weatherImpactedTransactions.reduce((sum, t) => 
      sum + (t.weatherImpact?.estimatedCostImpact || 0), 0
    );

    const impactByType: { [type: string]: number } = {};
    weatherImpactedTransactions.forEach(t => {
      if (t.weatherImpact) {
        const condition = t.weatherImpact.weatherCondition;
        impactByType[condition] = (impactByType[condition] || 0) + (t.weatherImpact.estimatedCostImpact || 0);
      }
    });

    const recommendations = this.generateWeatherImpactRecommendations(weatherImpactedTransactions);

    return {
      totalImpact,
      impactByType,
      affectedTransactions: weatherImpactedTransactions,
      recommendations
    };
  }

  // Helper Methods
  private updateVendorCustomerTotals(transaction: FinancialTransaction): void {
    if (transaction.vendor) {
      const vendor = this.vendors.get(transaction.vendor.id);
      if (vendor && transaction.type === 'expense' && transaction.status === 'completed') {
        vendor.totalSpent += transaction.amount;
        vendor.lastTransactionDate = transaction.date;
        
        // Recalculate average order value
        const vendorTransactions = this.getAllTransactions()
          .filter(t => t.vendor?.id === vendor.id && t.status === 'completed');
        vendor.averageOrderValue = vendorTransactions.length > 0 
          ? vendor.totalSpent / vendorTransactions.length 
          : 0;
      }
    }

    if (transaction.customer) {
      const customer = this.customers.get(transaction.customer.id);
      if (customer && transaction.type === 'income' && transaction.status === 'completed') {
        customer.totalRevenue += transaction.amount;
        customer.lastTransactionDate = transaction.date;
        
        // Recalculate average order value
        const customerTransactions = this.getAllTransactions()
          .filter(t => t.customer?.id === customer.id && t.status === 'completed');
        customer.averageOrderValue = customerTransactions.length > 0 
          ? customer.totalRevenue / customerTransactions.length 
          : 0;
      }
    }
  }

  private scheduleNextRecurringTransaction(transaction: FinancialTransaction): void {
    if (!transaction.recurring || !transaction.recurring.isActive) return;

    const nextDate = this.calculateNextRecurringDate(transaction.recurring);
    if (nextDate && (!transaction.recurring.endDate || nextDate <= transaction.recurring.endDate)) {
      // In a real implementation, this would schedule the next transaction
      console.log(`Next recurring transaction scheduled for ${nextDate.toDateString()}`);
    }
  }

  private calculateNextRecurringDate(recurring: RecurringSchedule): Date {
    const nextDate = new Date(recurring.nextDueDate);
    
    switch (recurring.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + recurring.interval);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + (recurring.interval * 7));
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + recurring.interval);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + (recurring.interval * 3));
        break;
      case 'annually':
        nextDate.setFullYear(nextDate.getFullYear() + recurring.interval);
        break;
    }

    return nextDate;
  }

  private calculateCropProfitability(transactions: FinancialTransaction[]): CropProfitability[] {
    const cropData: { [cropId: string]: { revenue: number; costs: number; cropName: string } } = {};

    transactions.forEach(transaction => {
      if (transaction.cropId && transaction.status === 'completed') {
        if (!cropData[transaction.cropId]) {
          cropData[transaction.cropId] = {
            revenue: 0,
            costs: 0,
            cropName: transaction.cropId // In real implementation, would lookup crop name
          };
        }

        if (transaction.type === 'income') {
          cropData[transaction.cropId].revenue += transaction.amount;
        } else {
          cropData[transaction.cropId].costs += transaction.amount;
        }
      }
    });

    return Object.keys(cropData).map(cropId => {
      const data = cropData[cropId];
      const grossProfit = data.revenue - data.costs;
      const margin = data.revenue > 0 ? (grossProfit / data.revenue) * 100 : 0;
      const roi = data.costs > 0 ? (grossProfit / data.costs) * 100 : 0;
      const acres = this.getCropAcreage(cropId); // Would implement based on crop management system

      return {
        cropId,
        cropName: data.cropName,
        revenue: data.revenue,
        directCosts: data.costs,
        indirectCosts: 0, // Would calculate based on allocation
        grossProfit,
        netProfit: grossProfit,
        profitPerAcre: acres > 0 ? grossProfit / acres : 0,
        margin,
        roi
      };
    });
  }

  private calculateSeasonalTrends(transactions: FinancialTransaction[]): SeasonalTrend[] {
    const seasons = ['Spring', 'Summer', 'Fall', 'Winter'];
    const seasonalData: { [season: string]: { revenue: number; expenses: number } } = {};

    seasons.forEach(season => {
      seasonalData[season] = { revenue: 0, expenses: 0 };
    });

    transactions.forEach(transaction => {
      if (transaction.status === 'completed') {
        const season = this.getSeason(transaction.date);
        if (transaction.type === 'income') {
          seasonalData[season].revenue += transaction.amount;
        } else {
          seasonalData[season].expenses += transaction.amount;
        }
      }
    });

    return seasons.map(season => {
      const data = seasonalData[season];
      const profit = data.revenue - data.expenses;
      const margin = data.revenue > 0 ? (profit / data.revenue) * 100 : 0;

      return {
        season,
        revenue: data.revenue,
        expenses: data.expenses,
        profit,
        margin,
        yearOverYearChange: 0 // Would calculate from previous year data
      };
    });
  }

  private getSeason(date: Date): string {
    const month = date.getMonth();
    if (month >= 2 && month <= 4) return 'Spring';
    if (month >= 5 && month <= 7) return 'Summer';
    if (month >= 8 && month <= 10) return 'Fall';
    return 'Winter';
  }

  private getHistoricalMonthlyData(months: number): { month: Date; income: number; expenses: number }[] {
    const data: { month: Date; income: number; expenses: number }[] = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthTransactions = this.getTransactionsByDateRange(month, monthEnd);
      const income = monthTransactions
        .filter(t => t.type === 'income' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = monthTransactions
        .filter(t => t.type === 'expense' && t.status === 'completed')
        .reduce((sum, t) => sum + t.amount, 0);

      data.push({ month, income, expenses });
    }

    return data;
  }

  private calculateAverageMonthlyIncome(historicalData: { income: number }[]): number {
    if (historicalData.length === 0) return 0;
    return historicalData.reduce((sum, data) => sum + data.income, 0) / historicalData.length;
  }

  private calculateAverageMonthlyExpenses(historicalData: { expenses: number }[]): number {
    if (historicalData.length === 0) return 0;
    return historicalData.reduce((sum, data) => sum + data.expenses, 0) / historicalData.length;
  }

  private getSeasonalMultiplier(month: Date): { income: number; expenses: number } {
    const monthNum = month.getMonth();
    
    // Simplified seasonal adjustments for agriculture
    if (monthNum >= 2 && monthNum <= 4) { // Spring
      return { income: 0.8, expenses: 1.3 }; // Higher expenses for planting
    } else if (monthNum >= 5 && monthNum <= 7) { // Summer
      return { income: 1.2, expenses: 1.1 }; // Some early harvest income
    } else if (monthNum >= 8 && monthNum <= 10) { // Fall
      return { income: 1.8, expenses: 0.9 }; // Peak harvest income
    } else { // Winter
      return { income: 0.6, expenses: 0.7 }; // Lower activity
    }
  }

  private calculateProjectionConfidence(monthsOut: number, historicalMonths: number): number {
    // Confidence decreases with distance and increases with historical data
    const baseConfidence = Math.min(90, (historicalMonths / 12) * 90);
    const distanceReduction = Math.min(50, monthsOut * 3);
    return Math.max(30, baseConfidence - distanceReduction);
  }

  private generateProjectionAssumptions(): ProjectionAssumption[] {
    return [
      {
        category: 'Market Prices',
        description: 'Commodity prices remain stable within 10% of current levels',
        value: '±10%',
        impact: 'high',
        source: 'Current market analysis'
      },
      {
        category: 'Weather',
        description: 'Normal weather patterns with no major disasters',
        value: 'Normal',
        impact: 'high',
        source: 'Historical weather data'
      },
      {
        category: 'Input Costs',
        description: 'Input costs increase by 3% annually',
        value: 3,
        impact: 'medium',
        source: 'Industry trends'
      }
    ];
  }

  private generateCashFlowScenarios(): CashFlowScenario[] {
    return [
      {
        name: 'Optimistic',
        description: 'Above average yields and prices',
        type: 'optimistic',
        adjustments: [
          {
            category: 'Revenue',
            adjustmentType: 'percentage',
            value: 20,
            reasoning: 'Higher commodity prices and yields'
          }
        ],
        totalImpact: 0
      },
      {
        name: 'Pessimistic',
        description: 'Below average yields or market downturn',
        type: 'pessimistic',
        adjustments: [
          {
            category: 'Revenue',
            adjustmentType: 'percentage',
            value: -25,
            reasoning: 'Lower yields due to weather or market conditions'
          }
        ],
        totalImpact: 0
      }
    ];
  }

  private generateRiskFactors(): RiskFactor[] {
    return [
      {
        name: 'Weather Events',
        description: 'Drought, flooding, or severe storms affecting crop yields',
        probability: 30,
        impact: 50000,
        mitigation: 'Crop insurance and diversification',
        category: 'weather'
      },
      {
        name: 'Market Volatility',
        description: 'Significant changes in commodity prices',
        probability: 50,
        impact: 30000,
        mitigation: 'Forward contracts and price hedging',
        category: 'market'
      },
      {
        name: 'Equipment Failure',
        description: 'Major equipment breakdown during critical periods',
        probability: 20,
        impact: 25000,
        mitigation: 'Preventive maintenance and equipment reserves',
        category: 'operational'
      }
    ];
  }

  private generateProfitLossReport(period: ReportPeriod, filters?: ReportFilters): any {
    const transactions = this.getTransactionsByDateRange(period.startDate, period.endDate);
    // Implementation would generate detailed P&L structure
    return { transactions, period, filters };
  }

  private generateCashFlowReport(period: ReportPeriod, filters?: ReportFilters): any {
    const transactions = this.getTransactionsByDateRange(period.startDate, period.endDate);
    // Implementation would generate cash flow analysis
    return { transactions, period, filters };
  }

  private generateBudgetVarianceReport(period: ReportPeriod, filters?: ReportFilters): any {
    const activeBudget = this.getActiveBudget();
    const actualTransactions = this.getTransactionsByDateRange(period.startDate, period.endDate);
    // Implementation would compare budget vs actual
    return { budget: activeBudget, actual: actualTransactions, period, filters };
  }

  private generateCropProfitabilityReport(period: ReportPeriod, filters?: ReportFilters): any {
    const transactions = this.getTransactionsByDateRange(period.startDate, period.endDate);
    const cropProfitability = this.calculateCropProfitability(transactions);
    return { cropProfitability, period, filters };
  }

  private generateVendorAnalysisReport(period: ReportPeriod, filters?: ReportFilters): any {
    const transactions = this.getTransactionsByDateRange(period.startDate, period.endDate);
    // Implementation would analyze vendor performance and spending
    return { transactions, vendors: this.getAllVendors(), period, filters };
  }

  private generateReportSummary(reportData: any, reportType: string): ReportSummary {
    // Implementation would generate appropriate summary based on report type
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
      profitMargin: 0,
      keyMetrics: {},
      trends: [],
      alerts: []
    };
  }

  private getReportTypeDefinition(reportType: string): ReportType {
    // Implementation would return report type definitions
    return {
      id: reportType,
      name: reportType.replace('_', ' ').toUpperCase(),
      description: `${reportType} analysis report`,
      category: 'profitability',
      template: reportType,
      parameters: []
    };
  }

  private generateWeatherImpactRecommendations(transactions: FinancialTransaction[]): string[] {
    const recommendations: string[] = [];
    
    // Analyze weather impacts and generate recommendations
    const droughtImpacts = transactions.filter(t => 
      t.weatherImpact?.weatherCondition === 'drought'
    );
    
    if (droughtImpacts.length > 0) {
      recommendations.push('Consider investing in drought-resistant crop varieties');
      recommendations.push('Evaluate irrigation system upgrades');
    }

    const stormImpacts = transactions.filter(t => 
      t.weatherImpact?.weatherCondition === 'storm' || 
      t.weatherImpact?.weatherCondition === 'hail'
    );
    
    if (stormImpacts.length > 0) {
      recommendations.push('Review crop insurance coverage');
      recommendations.push('Consider windbreaks or protective structures');
    }

    return recommendations;
  }

  private getTotalFarmAcreage(): number {
    // In real implementation, would integrate with field management system
    return 100; // Placeholder
  }

  private getCropAcreage(cropId: string): number {
    // In real implementation, would integrate with crop management system
    return 25; // Placeholder
  }

  private initializeDefaultCategories(): void {
    const defaultCategories = [
      // Income Categories
      {
        name: 'Crop Sales',
        type: 'income' as const,
        code: 'CROP_SALES',
        description: 'Revenue from crop sales',
        parentCategory: undefined,
        isActive: true,
        budgetable: true,
        taxDeductible: false,
        subcategories: ['Grain Sales', 'Produce Sales', 'Specialty Crops']
      },
      {
        name: 'Government Payments',
        type: 'income' as const,
        code: 'GOV_PAYMENTS',
        description: 'Government subsidies and payments',
        parentCategory: undefined,
        isActive: true,
        budgetable: true,
        taxDeductible: false,
        subcategories: ['Conservation Payments', 'Insurance Payments', 'Disaster Relief']
      },
      // Expense Categories
      {
        name: 'Seeds & Plants',
        type: 'expense' as const,
        code: 'SEEDS',
        description: 'Cost of seeds and planting materials',
        parentCategory: undefined,
        isActive: true,
        budgetable: true,
        taxDeductible: true,
        subcategories: ['Certified Seeds', 'Hybrid Seeds', 'Organic Seeds']
      },
      {
        name: 'Fertilizers',
        type: 'expense' as const,
        code: 'FERTILIZERS',
        description: 'Fertilizer and soil amendment costs',
        parentCategory: undefined,
        isActive: true,
        budgetable: true,
        taxDeductible: true,
        subcategories: ['Nitrogen', 'Phosphorus', 'Potassium', 'Organic Fertilizers']
      },
      {
        name: 'Fuel & Energy',
        type: 'expense' as const,
        code: 'FUEL',
        description: 'Fuel and energy costs',
        parentCategory: undefined,
        isActive: true,
        budgetable: true,
        taxDeductible: true,
        subcategories: ['Diesel', 'Gasoline', 'Electricity', 'Propane']
      },
      {
        name: 'Labor',
        type: 'expense' as const,
        code: 'LABOR',
        description: 'Labor costs including wages and benefits',
        parentCategory: undefined,
        isActive: true,
        budgetable: true,
        taxDeductible: true,
        subcategories: ['Seasonal Labor', 'Full-time Employees', 'Contract Labor']
      },
      {
        name: 'Equipment & Maintenance',
        type: 'expense' as const,
        code: 'EQUIPMENT',
        description: 'Equipment purchases and maintenance',
        parentCategory: undefined,
        isActive: true,
        budgetable: true,
        taxDeductible: true,
        subcategories: ['Equipment Purchase', 'Repairs', 'Maintenance', 'Parts']
      }
    ];

    defaultCategories.forEach(categoryData => {
      this.createCategory(categoryData);
    });
  }

  private setupRecurringTransactionProcessor(): void {
    // Set up periodic processing of recurring transactions
    setInterval(() => {
      this.processRecurringTransactions();
    }, 24 * 60 * 60 * 1000); // Check daily
  }

  private processRecurringTransactions(): void {
    const now = new Date();
    const allTransactions = this.getAllTransactions();
    
    allTransactions.forEach(transaction => {
      if (transaction.recurring && 
          transaction.recurring.isActive && 
          transaction.recurring.nextDueDate <= now) {
        
        // Create new transaction based on recurring template
        const newTransactionData = {
          ...transaction,
          date: new Date(transaction.recurring.nextDueDate),
          recurring: {
            ...transaction.recurring,
            nextDueDate: this.calculateNextRecurringDate(transaction.recurring)
          }
        };
        
        delete (newTransactionData as any).id;
        delete (newTransactionData as any).createdAt;
        delete (newTransactionData as any).updatedAt;
        
        this.createTransaction(newTransactionData);
      }
    });
  }

  private loadDataFromStorage(): void {
    // In a real app, this would load from persistent storage
  }

  private saveDataToStorage(): void {
    // In a real app, this would save to persistent storage
  }
}

// Export singleton instance
export const financialManagementService = new FinancialManagementService();
export default FinancialManagementService;