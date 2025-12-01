import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Snackbar,
  Switch,
  FormControlLabel,
  Autocomplete,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  AccountBalance,
  Receipt,
  Add,
  Edit,
  Download,
  Print,
  ArrowUpward,
  ArrowDownward,
  UploadFile,
  AttachFile,
  CurrencyExchange,
  Analytics,
  Assessment,
  Close,
  Save,
  FileUpload,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';

interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  method: string;
  currency: string;
  exchangeRate: number;
  usdAmount: number;
  receipt?: string;
  tags: string[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ReportData {
  type: string;
  data: any[];
  generated: Date;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const EnhancedFinancialDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error' | 'info'>('success');
  const [multiCurrency, setMultiCurrency] = useState(true);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState({ USD: 1, EUR: 0.85, GBP: 0.73, CAD: 1.25 });

  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    description: '',
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    method: 'cash',
    currency: 'USD',
    tags: [] as string[],
  });

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      date: '2025-11-01',
      type: 'income',
      category: 'Crop Sales',
      description: 'Corn harvest sale',
      amount: 15000,
      method: 'Bank Transfer',
      currency: 'USD',
      exchangeRate: 1,
      usdAmount: 15000,
      tags: ['harvest', 'corn'],
    },
    {
      id: '2',
      date: '2025-11-02',
      type: 'expense',
      category: 'Seeds',
      description: 'Winter wheat seeds',
      amount: 2500,
      method: 'Credit Card',
      currency: 'USD',
      exchangeRate: 1,
      usdAmount: 2500,
      tags: ['seeds', 'wheat'],
    },
    {
      id: '3',
      date: '2025-11-02',
      type: 'expense',
      category: 'Equipment',
      description: 'Irrigation system maintenance',
      amount: 800,
      method: 'Cash',
      currency: 'USD',
      exchangeRate: 1,
      usdAmount: 800,
      tags: ['equipment', 'irrigation'],
    },
    {
      id: '4',
      date: '2025-10-28',
      type: 'income',
      category: 'Livestock Sales',
      description: 'Cattle sale',
      amount: 8500,
      method: 'Check',
      currency: 'USD',
      exchangeRate: 1,
      usdAmount: 8500,
      tags: ['livestock', 'cattle'],
    },
  ]);

  const [categories, setCategories] = useState({
    income: ['Crop Sales', 'Livestock Sales', 'Equipment Rental', 'Government Subsidies', 'Insurance Claims'],
    expense: ['Seeds', 'Fertilizer', 'Equipment', 'Labor', 'Utilities', 'Insurance', 'Fuel', 'Maintenance', 'Feed', 'Veterinary'],
  });

  const monthlyData = [
    { month: 'Jan', income: 12000, expenses: 8000, profit: 4000 },
    { month: 'Feb', income: 15000, expenses: 9500, profit: 5500 },
    { month: 'Mar', income: 18000, expenses: 11000, profit: 7000 },
    { month: 'Apr', income: 22000, expenses: 13000, profit: 9000 },
    { month: 'May', income: 28000, expenses: 15000, profit: 13000 },
    { month: 'Jun', income: 32000, expenses: 18000, profit: 14000 },
    { month: 'Jul', income: 35000, expenses: 20000, profit: 15000 },
    { month: 'Aug', income: 38000, expenses: 22000, profit: 16000 },
    { month: 'Sep', income: 33000, expenses: 19000, profit: 14000 },
    { month: 'Oct', income: 29000, expenses: 17000, profit: 12000 },
    { month: 'Nov', income: 25000, expenses: 15000, profit: 10000 },
    { month: 'Dec', income: 20000, expenses: 12000, profit: 8000 },
  ];

  const expenseBreakdown = [
    { name: 'Seeds & Fertilizer', value: 8500, color: '#0088FE' },
    { name: 'Equipment', value: 6200, color: '#00C49F' },
    { name: 'Labor', value: 4800, color: '#FFBB28' },
    { name: 'Utilities', value: 2300, color: '#FF8042' },
    { name: 'Insurance', value: 1500, color: '#8884D8' },
    { name: 'Feed', value: 3200, color: '#82CA9D' },
  ];

  const dailyFlow = [
    { date: '2025-11-01', income: 1200, expenses: 800, net: 400 },
    { date: '2025-11-02', income: 1500, expenses: 1200, net: 300 },
    { date: '2025-11-03', income: 800, expenses: 900, net: -100 },
    { date: '2025-11-04', income: 2200, expenses: 1100, net: 1100 },
    { date: '2025-11-05', income: 1800, expenses: 1300, net: 500 },
    { date: '2025-11-06', income: 1600, expenses: 1000, net: 600 },
    { date: '2025-11-07', income: 2000, expenses: 1400, net: 600 },
  ];

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.usdAmount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.usdAmount, 0);

  const netProfit = totalIncome - totalExpenses;

  // Group income by category
  const incomeByCategory = transactions
    .filter(t => t.type === 'income')
    .reduce((acc: { category: string; amount: number }[], transaction) => {
      const existing = acc.find(item => item.category === transaction.category);
      if (existing) {
        existing.amount += transaction.usdAmount;
      } else {
        acc.push({ category: transaction.category, amount: transaction.usdAmount });
      }
      return acc;
    }, []);

  // Group expenses by category
  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc: { category: string; amount: number }[], transaction) => {
      const existing = acc.find(item => item.category === transaction.category);
      if (existing) {
        existing.amount += transaction.usdAmount;
      } else {
        acc.push({ category: transaction.category, amount: transaction.usdAmount });
      }
      return acc;
    }, []);

  const handleAddTransaction = () => {
    const id = (transactions.length + 1).toString();
    const rate = exchangeRates[newTransaction.currency as keyof typeof exchangeRates] || 1;
    const usdAmount = parseFloat(newTransaction.amount) / rate;
    
    const transaction: Transaction = {
      ...newTransaction,
      id,
      amount: parseFloat(newTransaction.amount),
      currency: newTransaction.currency,
      exchangeRate: rate,
      usdAmount,
      tags: newTransaction.tags,
    } as Transaction;

    setTransactions([transaction, ...transactions]);
    setDialogOpen(false);
    setNewTransaction({
      type: 'expense',
      description: '',
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      method: 'cash',
      currency: 'USD',
      tags: [],
    });
    
    showAlertMessage('Transaction added successfully!', 'success');
  };

  const handleExportData = (format: string) => {
    const data = transactions.map(t => ({
      Date: t.date,
      Type: t.type,
      Category: t.category,
      Description: t.description,
      Amount: `${t.amount} ${t.currency}`,
      'USD Amount': `$${t.usdAmount.toFixed(2)}`,
      Method: t.method,
      Tags: t.tags.join(', '),
    }));

    if (format === 'csv') {
      const csvContent = "data:text/csv;charset=utf-8," 
        + Object.keys(data[0]).join(",") + "\n"
        + data.map(row => Object.values(row).join(",")).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `financial_data_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showAlertMessage('Data exported as CSV!', 'success');
    } else if (format === 'json') {
      const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const link = document.createElement("a");
      link.setAttribute("href", jsonContent);
      link.setAttribute("download", `financial_data_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showAlertMessage('Data exported as JSON!', 'success');
    }
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const content = `
        <html>
          <head>
            <title>Financial Report - ${new Date().toLocaleDateString()}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .header { text-align: center; margin-bottom: 30px; }
              .summary { display: flex; justify-content: space-between; margin: 20px 0; }
              .summary-item { text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Farm Financial Report</h1>
              <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            <div class="summary">
              <div class="summary-item">
                <h3>Total Income</h3>
                <p>$${totalIncome.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <h3>Total Expenses</h3>
                <p>$${totalExpenses.toLocaleString()}</p>
              </div>
              <div class="summary-item">
                <h3>Net Profit</h3>
                <p>$${netProfit.toLocaleString()}</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                ${transactions.map(t => `
                  <tr>
                    <td>${new Date(t.date).toLocaleDateString()}</td>
                    <td>${t.type}</td>
                    <td>${t.category}</td>
                    <td>${t.description}</td>
                    <td>$${t.usdAmount.toFixed(2)}</td>
                    <td>${t.method}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
      
      showAlertMessage('Report sent to printer!', 'success');
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file upload
      showAlertMessage(`Receipt "${file.name}" uploaded successfully!`, 'success');
      setUploadDialogOpen(false);
    }
  };

  const generateReport = (reportType: string) => {
    setSelectedReport(reportType);
    setReportDialogOpen(true);
    showAlertMessage(`Generating ${reportType} report...`, 'info');
  };

  const showAlertMessage = (message: string, severity: 'success' | 'error' | 'info') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setShowAlert(true);
  };

  const addCategory = (type: 'income' | 'expense', newCategory: string) => {
    if (newCategory && !categories[type].includes(newCategory)) {
      setCategories(prev => ({
        ...prev,
        [type]: [...prev[type], newCategory]
      }));
    }
  };

  const formatCurrency = (amount: number, currency: string = baseCurrency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Financial Management Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={multiCurrency}
                onChange={(e) => setMultiCurrency(e.target.checked)}
              />
            }
            label="Multi-Currency"
          />
          <Button
            variant="outlined"
            startIcon={<UploadFile />}
            onClick={() => setUploadDialogOpen(true)}
          >
            Upload Receipt
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
          >
            Add Transaction
          </Button>
        </Box>
      </Box>

      {/* Currency Exchange Info */}
      {multiCurrency && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CurrencyExchange />
            <Typography>
              Multi-currency enabled. All amounts converted to {baseCurrency} for calculations.
              Exchange rates: EUR: {exchangeRates.EUR}, GBP: {exchangeRates.GBP}, CAD: {exchangeRates.CAD}
            </Typography>
          </Box>
        </Alert>
      )}

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
            sx={{ flex: '1 1 200px' }}
          >
            Add Transaction
          </Button>
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<UploadFile />}
            onClick={() => setUploadDialogOpen(true)}
            sx={{ flex: '1 1 200px' }}
          >
            Upload Receipt
          </Button>
          <Button 
            variant="contained" 
            color="success"
            startIcon={<Receipt />}
            onClick={() => generateReport('Profit & Loss Statement')}
            sx={{ flex: '1 1 200px' }}
          >
            Generate Report
          </Button>
          <Button 
            variant="outlined"
            startIcon={<Download />}
            onClick={() => handleExportData('csv')}
            sx={{ flex: '1 1 200px' }}
          >
            Export Data
          </Button>
        </Box>
      </Paper>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6">Total Income</Typography>
            </Box>
            <Typography variant="h4" color="success.main">
              {formatCurrency(totalIncome)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This month
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingDown sx={{ mr: 1, color: 'error.main' }} />
              <Typography variant="h6">Total Expenses</Typography>
            </Box>
            <Typography variant="h4" color="error.main">
              {formatCurrency(totalExpenses)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This month
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AttachMoney sx={{ mr: 1, color: netProfit >= 0 ? 'success.main' : 'error.main' }} />
              <Typography variant="h6">Net Profit</Typography>
            </Box>
            <Typography variant="h4" color={netProfit >= 0 ? 'success.main' : 'error.main'}>
              {formatCurrency(netProfit)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This month
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Cash Flow</Typography>
            </Box>
            <Typography variant="h4" color="primary.main">
              {formatCurrency(netProfit * 0.85)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Available balance
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Overview" />
            <Tab label="Transactions" />
            <Tab label="Reports" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* Monthly Performance Chart */}
            <Box sx={{ flex: 2, minWidth: 400 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Financial Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stackId="1" 
                    stroke="#4caf50" 
                    fill="#4caf50" 
                    name="Income" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stackId="2" 
                    stroke="#f44336" 
                    fill="#f44336" 
                    name="Expenses" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="profit" 
                    stroke="#2196f3" 
                    strokeWidth={3} 
                    name="Profit" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>

            {/* Expense Breakdown */}
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <Typography variant="h6" gutterBottom>
                Expense Breakdown
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={(entry: any) => `${entry.name} ${((entry.value / expenseBreakdown.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0)}%`}
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip formatter={(value) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            </Box>

            {/* Daily Cash Flow */}
            <Box sx={{ width: '100%', mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Daily Cash Flow (Last 7 Days)
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyFlow}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="net" 
                    stroke="#2196f3" 
                    strokeWidth={3} 
                    name="Net Cash Flow" 
                  />
                  <Bar dataKey="income" fill="#4caf50" name="Income" />
                  <Bar dataKey="expenses" fill="#f44336" name="Expenses" />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Recent Transactions</Typography>
            <Box>
              <Button 
                startIcon={<Download />} 
                sx={{ mr: 1 }}
                onClick={() => handleExportData('csv')}
              >
                Export CSV
              </Button>
              <Button 
                startIcon={<Download />} 
                sx={{ mr: 1 }}
                onClick={() => handleExportData('json')}
              >
                Export JSON
              </Button>
              <Button 
                startIcon={<Print />}
                onClick={handlePrintReport}
              >
                Print
              </Button>
            </Box>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Currency</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">USD Amount</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        icon={transaction.type === 'income' ? <ArrowUpward /> : <ArrowDownward />}
                        label={transaction.type}
                        color={transaction.type === 'income' ? 'success' : 'error'}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>
                      <Box>
                        {transaction.description}
                        {transaction.tags.length > 0 && (
                          <Box sx={{ mt: 0.5 }}>
                            {transaction.tags.map((tag, index) => (
                              <Chip key={index} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                            ))}
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>{transaction.method}</TableCell>
                    <TableCell>{transaction.currency}</TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.usdAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary">
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Financial Reports
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <List>
                <ListItem 
                  component="button" 
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                  onClick={() => generateReport('Profit & Loss Statement')}
                >
                  <ListItemIcon>
                    <Receipt />
                  </ListItemIcon>
                  <ListItemText
                    primary="Profit & Loss Statement"
                    secondary="Monthly P&L with detailed breakdown"
                  />
                </ListItem>
                <Divider />
                <ListItem 
                  component="button" 
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                  onClick={() => generateReport('Cash Flow Report')}
                >
                  <ListItemIcon>
                    <AccountBalance />
                  </ListItemIcon>
                  <ListItemText
                    primary="Cash Flow Report"
                    secondary="Track money in and out of your farm"
                  />
                </ListItem>
                <Divider />
                <ListItem 
                  component="button" 
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                  onClick={() => generateReport('Expense Analysis')}
                >
                  <ListItemIcon>
                    <ShoppingCart />
                  </ListItemIcon>
                  <ListItemText
                    primary="Expense Analysis"
                    secondary="Detailed breakdown of all farm expenses"
                  />
                </ListItem>
              </List>
            </Box>
            <Box sx={{ flex: 1, minWidth: 300 }}>
              <List>
                <ListItem 
                  component="button" 
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                  onClick={() => generateReport('Revenue Analysis')}
                >
                  <ListItemIcon>
                    <TrendingUp />
                  </ListItemIcon>
                  <ListItemText
                    primary="Revenue Analysis"
                    secondary="Track income sources and trends"
                  />
                </ListItem>
                <Divider />
                <ListItem 
                  component="button" 
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                  onClick={() => generateReport('Tax Summary')}
                >
                  <ListItemIcon>
                    <Print />
                  </ListItemIcon>
                  <ListItemText
                    primary="Tax Summary"
                    secondary="Annual tax preparation report"
                  />
                </ListItem>
                <Divider />
                <ListItem 
                  component="button" 
                  sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                  onClick={() => generateReport('Budget vs Actual')}
                >
                  <ListItemIcon>
                    <Download />
                  </ListItemIcon>
                  <ListItemText
                    primary="Budget vs Actual"
                    secondary="Compare planned vs actual spending"
                  />
                </ListItem>
              </List>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Advanced Analytics
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Card sx={{ flex: 1, minWidth: 300 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Expense Trends
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="expenses" stroke="#f44336" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, minWidth: 300 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Income vs Expenses
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="income" fill="#4caf50" />
                    <Bar dataKey="expenses" fill="#f44336" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Card>

      {/* Add Transaction Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Transaction Type</InputLabel>
              <Select 
                label="Transaction Type"
                value={newTransaction.type}
                onChange={(e) => setNewTransaction({ ...newTransaction, type: e.target.value as 'income' | 'expense' })}
              >
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
            
            <TextField 
              label="Description" 
              fullWidth 
              value={newTransaction.description}
              onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                label="Amount" 
                type="number" 
                sx={{ flex: 2 }}
                value={newTransaction.amount}
                onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })}
              />
              
              {multiCurrency && (
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel>Currency</InputLabel>
                  <Select 
                    label="Currency"
                    value={newTransaction.currency}
                    onChange={(e) => setNewTransaction({ ...newTransaction, currency: e.target.value })}
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                    <MenuItem value="CAD">CAD</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
            
            <Autocomplete
              freeSolo
              options={categories[newTransaction.type as keyof typeof categories]}
              value={newTransaction.category}
              onChange={(e, value) => {
                const category = value || '';
                setNewTransaction({ ...newTransaction, category });
                if (category && !categories[newTransaction.type as keyof typeof categories].includes(category)) {
                  addCategory(newTransaction.type as 'income' | 'expense', category);
                }
              }}
              renderInput={(params) => <TextField {...params} label="Category" />}
            />
            
            <TextField
              label="Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={newTransaction.date}
              onChange={(e) => setNewTransaction({ ...newTransaction, date: e.target.value })}
            />
            
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select 
                label="Payment Method"
                value={newTransaction.method}
                onChange={(e) => setNewTransaction({ ...newTransaction, method: e.target.value })}
              >
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="check">Check</MenuItem>
                <MenuItem value="credit">Credit Card</MenuItem>
                <MenuItem value="bank">Bank Transfer</MenuItem>
                <MenuItem value="digital">Digital Payment</MenuItem>
              </Select>
            </FormControl>
            
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={newTransaction.tags}
              onChange={(e, value) => setNewTransaction({ ...newTransaction, tags: value })}
              renderInput={(params) => (
                <TextField {...params} label="Tags" placeholder="Add tags (press enter)" />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddTransaction}>
            Add Transaction
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload Receipt Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Receipt/Invoice</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, pt: 2 }}>
            <Box sx={{ 
              border: '2px dashed #ccc', 
              borderRadius: 2, 
              p: 4, 
              textAlign: 'center',
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.main' }
            }}>
              <FileUpload sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Upload Receipt or Invoice
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Drag and drop files here or click to browse
              </Typography>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="receipt-upload"
              />
              <label htmlFor="receipt-upload">
                <Button variant="outlined" component="span">
                  Choose File
                </Button>
              </label>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Supported formats: PDF, JPG, PNG (Max 10MB)
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onClose={() => setReportDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedReport}</DialogTitle>
        <DialogContent>
          <Box sx={{ p: 2 }}>
            {selectedReport === 'Profit & Loss Statement' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Monthly P&L Statement
                </Typography>
                <Typography paragraph color="text.secondary">
                  Comprehensive profit and loss analysis for the current period.
                </Typography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell align="right"><strong>Amount</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell><strong>Revenue</strong></TableCell>
                        <TableCell align="right"><strong>{formatCurrency(totalIncome)}</strong></TableCell>
                      </TableRow>
                      {incomeByCategory.map((cat) => (
                        <TableRow key={cat.category}>
                          <TableCell sx={{ pl: 4 }}>{cat.category}</TableCell>
                          <TableCell align="right">{formatCurrency(cat.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell><strong>Expenses</strong></TableCell>
                        <TableCell align="right"><strong>{formatCurrency(totalExpenses)}</strong></TableCell>
                      </TableRow>
                      {expenseByCategory.map((cat) => (
                        <TableRow key={cat.category}>
                          <TableCell sx={{ pl: 4 }}>{cat.category}</TableCell>
                          <TableCell align="right">{formatCurrency(cat.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ bgcolor: netProfit >= 0 ? 'success.light' : 'error.light' }}>
                        <TableCell><strong>Net Profit/Loss</strong></TableCell>
                        <TableCell align="right"><strong>{formatCurrency(netProfit)}</strong></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {selectedReport === 'Cash Flow Report' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Cash Flow Analysis
                </Typography>
                <Typography paragraph color="text.secondary">
                  Track all money flowing in and out of your farm operations.
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom color="success.main">
                    Cash Inflows: {formatCurrency(totalIncome)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Revenue from crop sales, livestock, and other farm activities
                  </Typography>
                  
                  <Typography variant="subtitle1" gutterBottom color="error.main">
                    Cash Outflows: {formatCurrency(totalExpenses)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Operating expenses, equipment, supplies, and labor costs
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ color: netProfit >= 0 ? 'success.main' : 'error.main' }}>
                    Net Cash Flow: {formatCurrency(netProfit)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {netProfit >= 0 ? 'Positive cash flow indicates healthy operations' : 'Negative cash flow requires attention'}
                  </Typography>
                </Box>
              </>
            )}

            {selectedReport === 'Expense Analysis' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Detailed Expense Breakdown
                </Typography>
                <Typography paragraph color="text.secondary">
                  Complete analysis of all farm expenses by category.
                </Typography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell align="right"><strong>Amount</strong></TableCell>
                        <TableCell align="right"><strong>% of Total</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {expenseByCategory.map((cat) => (
                        <TableRow key={cat.category}>
                          <TableCell>{cat.category}</TableCell>
                          <TableCell align="right">{formatCurrency(cat.amount)}</TableCell>
                          <TableCell align="right">{((cat.amount / totalExpenses) * 100).toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell><strong>Total Expenses</strong></TableCell>
                        <TableCell align="right"><strong>{formatCurrency(totalExpenses)}</strong></TableCell>
                        <TableCell align="right"><strong>100%</strong></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {selectedReport === 'Revenue Analysis' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Revenue Source Analysis
                </Typography>
                <Typography paragraph color="text.secondary">
                  Breakdown of all income sources and revenue trends.
                </Typography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Income Source</strong></TableCell>
                        <TableCell align="right"><strong>Amount</strong></TableCell>
                        <TableCell align="right"><strong>% of Total</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {incomeByCategory.map((cat) => (
                        <TableRow key={cat.category}>
                          <TableCell>{cat.category}</TableCell>
                          <TableCell align="right">{formatCurrency(cat.amount)}</TableCell>
                          <TableCell align="right">{((cat.amount / totalIncome) * 100).toFixed(1)}%</TableCell>
                        </TableRow>
                      ))}
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell><strong>Total Revenue</strong></TableCell>
                        <TableCell align="right"><strong>{formatCurrency(totalIncome)}</strong></TableCell>
                        <TableCell align="right"><strong>100%</strong></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}

            {selectedReport === 'Tax Summary' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Annual Tax Summary
                </Typography>
                <Typography paragraph color="text.secondary">
                  Comprehensive tax preparation report for the fiscal year.
                </Typography>
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Taxable Income Summary:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                    <Typography>Gross Revenue: {formatCurrency(totalIncome)}</Typography>
                    <Typography>Deductible Expenses: {formatCurrency(totalExpenses)}</Typography>
                    <Divider />
                    <Typography variant="h6" sx={{ color: netProfit >= 0 ? 'success.main' : 'error.main' }}>
                      Taxable Income: {formatCurrency(netProfit)}
                    </Typography>
                  </Box>
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Deductible Categories:
                  </Typography>
                  <TableContainer component={Paper} sx={{ mt: 1 }}>
                    <Table size="small">
                      <TableBody>
                        {expenseByCategory.map((cat) => (
                          <TableRow key={cat.category}>
                            <TableCell>{cat.category}</TableCell>
                            <TableCell align="right">{formatCurrency(cat.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    Note: Consult with a tax professional for accurate filing and deductions.
                  </Typography>
                </Box>
              </>
            )}

            {selectedReport === 'Budget vs Actual' && (
              <>
                <Typography variant="h6" gutterBottom>
                  Budget vs Actual Comparison
                </Typography>
                <Typography paragraph color="text.secondary">
                  Compare your planned budget against actual spending and revenue.
                </Typography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell align="right"><strong>Budget</strong></TableCell>
                        <TableCell align="right"><strong>Actual</strong></TableCell>
                        <TableCell align="right"><strong>Variance</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={4}><strong>Revenue</strong></TableCell>
                      </TableRow>
                      {incomeByCategory.map((cat) => {
                        const budget = cat.amount * 1.1; // Mock budget as 110% of actual
                        const variance = cat.amount - budget;
                        return (
                          <TableRow key={cat.category}>
                            <TableCell sx={{ pl: 4 }}>{cat.category}</TableCell>
                            <TableCell align="right">{formatCurrency(budget)}</TableCell>
                            <TableCell align="right">{formatCurrency(cat.amount)}</TableCell>
                            <TableCell align="right" sx={{ color: variance >= 0 ? 'success.main' : 'error.main' }}>
                              {formatCurrency(variance)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow>
                        <TableCell colSpan={4}><strong>Expenses</strong></TableCell>
                      </TableRow>
                      {expenseByCategory.map((cat) => {
                        const budget = cat.amount * 0.95; // Mock budget as 95% of actual
                        const variance = budget - cat.amount; // For expenses, under budget is positive
                        return (
                          <TableRow key={cat.category}>
                            <TableCell sx={{ pl: 4 }}>{cat.category}</TableCell>
                            <TableCell align="right">{formatCurrency(budget)}</TableCell>
                            <TableCell align="right">{formatCurrency(cat.amount)}</TableCell>
                            <TableCell align="right" sx={{ color: variance >= 0 ? 'success.main' : 'error.main' }}>
                              {formatCurrency(variance)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => handleExportData('csv')}>
            Export Report
          </Button>
          <Button variant="outlined" onClick={handlePrintReport}>
            Print Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Snackbar */}
      <Snackbar
        open={showAlert}
        autoHideDuration={6000}
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setShowAlert(false)} 
          severity={alertSeverity}
          variant="filled"
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedFinancialDashboard;