import React, { useState } from 'react';
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
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  method: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const FinancialDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      date: '2025-11-01',
      type: 'income',
      category: 'Crop Sales',
      description: 'Corn harvest sale',
      amount: 15000,
      method: 'Bank Transfer',
    },
    {
      id: '2',
      date: '2025-11-02',
      type: 'expense',
      category: 'Seeds',
      description: 'Winter wheat seeds',
      amount: 2500,
      method: 'Credit Card',
    },
    {
      id: '3',
      date: '2025-11-02',
      type: 'expense',
      category: 'Equipment',
      description: 'Irrigation system maintenance',
      amount: 800,
      method: 'Cash',
    },
    {
      id: '4',
      date: '2025-10-28',
      type: 'income',
      category: 'Livestock Sales',
      description: 'Cattle sale',
      amount: 8500,
      method: 'Check',
    },
  ]);

  const monthlyData = [
    { month: 'Jan', income: 12000, expenses: 8000, profit: 4000 },
    { month: 'Feb', income: 15000, expenses: 9500, profit: 5500 },
    { month: 'Mar', income: 18000, expenses: 11000, profit: 7000 },
    { month: 'Apr', income: 22000, expenses: 13000, profit: 9000 },
    { month: 'May', income: 28000, expenses: 15000, profit: 13000 },
    { month: 'Jun', income: 32000, expenses: 18000, profit: 14000 },
  ];

  const expenseBreakdown = [
    { name: 'Seeds & Fertilizer', value: 8500, color: '#0088FE' },
    { name: 'Equipment', value: 6200, color: '#00C49F' },
    { name: 'Labor', value: 4800, color: '#FFBB28' },
    { name: 'Utilities', value: 2300, color: '#FF8042' },
    { name: 'Insurance', value: 1500, color: '#8884D8' },
  ];

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpenses;

  return (
    <Box sx={{ p: 3 }}>
      {/* Main Heading */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
        Financial Dashboard
      </Typography>
      <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
        Monitor financial health, transactions, and summaries.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Add Transaction
        </Button>
      </Box>
      {/* ...existing code... */}

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="Overview" />
            <Tab label="Transactions" />
            <Tab label="Reports" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {/* Monthly Profit Chart */}
            <Box sx={{ flex: 2, minWidth: 400 }}>
              <Typography variant="h6" gutterBottom>
                Monthly Financial Performance
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="income" fill="#4caf50" name="Income" />
                  <Bar dataKey="expenses" fill="#f44336" name="Expenses" />
                  <Bar dataKey="profit" fill="#2196f3" name="Profit" />
                </BarChart>
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
                    label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Recent Transactions</Typography>
            <Box>
              <Button startIcon={<Download />} sx={{ mr: 1 }}>
                Export
              </Button>
              <Button startIcon={<Print />}>
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
                  <TableCell align="right">Amount</TableCell>
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
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.method}</TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
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
                <ListItem component="button" sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}>
                  <ListItemIcon>
                    <Receipt />
                  </ListItemIcon>
                  <ListItemText
                    primary="Profit & Loss Statement"
                    secondary="Monthly P&L with detailed breakdown"
                  />
                </ListItem>
                <Divider />
                <ListItem component="button" sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}>
                  <ListItemIcon>
                    <AccountBalance />
                  </ListItemIcon>
                  <ListItemText
                    primary="Cash Flow Report"
                    secondary="Track money in and out of your farm"
                  />
                </ListItem>
                <Divider />
                <ListItem component="button" sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}>
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
                <ListItem component="button" sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}>
                  <ListItemIcon>
                    <TrendingUp />
                  </ListItemIcon>
                  <ListItemText
                    primary="Revenue Analysis"
                    secondary="Track income sources and trends"
                  />
                </ListItem>
                <Divider />
                <ListItem component="button" sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}>
                  <ListItemIcon>
                    <Print />
                  </ListItemIcon>
                  <ListItemText
                    primary="Tax Summary"
                    secondary="Annual tax preparation report"
                  />
                </ListItem>
                <Divider />
                <ListItem component="button" sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}>
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
      </Card>

      {/* Add Transaction Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Transaction</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Transaction Type</InputLabel>
              <Select label="Transaction Type">
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Description" fullWidth />
            <TextField label="Amount" type="number" fullWidth />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select label="Category">
                <MenuItem value="crops">Crop Sales</MenuItem>
                <MenuItem value="livestock">Livestock Sales</MenuItem>
                <MenuItem value="seeds">Seeds & Fertilizer</MenuItem>
                <MenuItem value="equipment">Equipment</MenuItem>
                <MenuItem value="labor">Labor</MenuItem>
                <MenuItem value="utilities">Utilities</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select label="Payment Method">
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="check">Check</MenuItem>
                <MenuItem value="credit">Credit Card</MenuItem>
                <MenuItem value="bank">Bank Transfer</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained">Add Transaction</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinancialDashboard;