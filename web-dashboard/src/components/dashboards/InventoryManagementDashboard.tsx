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
  Alert,
  Tabs,
  Tab,
  LinearProgress,
  Snackbar,
  Grid,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Inventory,
  Warning,
  CheckCircle,
  TrendingDown,
  ShoppingCart,
  LocalShipping,
  Assessment,
} from '@mui/icons-material';

interface InventoryItem {
  id: string;
  name: string;
  category: 'feed' | 'raw-material' | 'chemical' | 'fertilizer' | 'seed' | 'other';
  quantity: number;
  unit: string;
  reorderLevel: number;
  costPerUnit: number;
  totalValue: number;
  supplier: string;
  lastPurchaseDate: string;
  location: string;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

interface Transaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'purchase' | 'usage' | 'adjustment';
  quantity: number;
  unit: string;
  cost?: number;
  purpose?: string;
  date: string;
  recordedBy: string;
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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const InventoryManagementDashboard: React.FC = () => {
    // ...existing code...
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  // ...existing code...

  const [inventory, setInventory] = useState<InventoryItem[]>([
    {
      id: '1',
      name: 'Dairy Meal Concentrate',
      category: 'feed',
      quantity: 500,
      unit: 'kg',
      reorderLevel: 200,
      costPerUnit: 45,
      totalValue: 22500,
      supplier: 'FeedCorp Ltd',
      lastPurchaseDate: '2025-11-01',
      location: 'Feed Storage A',
      status: 'in-stock',
    },
    {
      id: '2',
      name: 'Hay Bales',
      category: 'feed',
      quantity: 150,
      unit: 'bales',
      reorderLevel: 100,
      costPerUnit: 15,
      totalValue: 2250,
      supplier: 'Local Supplier',
      lastPurchaseDate: '2025-11-05',
      location: 'Hay Barn',
      status: 'low-stock',
    },
    {
      id: '3',
      name: 'Maize (Raw)',
      category: 'raw-material',
      quantity: 800,
      unit: 'kg',
      reorderLevel: 300,
      costPerUnit: 25,
      totalValue: 20000,
      supplier: 'GrainMart',
      lastPurchaseDate: '2025-10-28',
      location: 'Grain Storage',
      status: 'in-stock',
    },
    {
      id: '4',
      name: 'Sunflower Meal',
      category: 'raw-material',
      quantity: 200,
      unit: 'kg',
      reorderLevel: 150,
      costPerUnit: 35,
      totalValue: 7000,
      supplier: 'Oil Mill Co',
      lastPurchaseDate: '2025-11-03',
      location: 'Grain Storage',
      status: 'in-stock',
    },
    {
      id: '5',
      name: 'Dipping Chemical',
      category: 'chemical',
      quantity: 50,
      unit: 'liters',
      reorderLevel: 20,
      costPerUnit: 120,
      totalValue: 6000,
      supplier: 'VetChem Ltd',
      lastPurchaseDate: '2025-10-15',
      location: 'Chemical Storage',
      status: 'in-stock',
    },
    {
      id: '6',
      name: 'Deworming Medicine',
      category: 'chemical',
      quantity: 15,
      unit: 'liters',
      reorderLevel: 10,
      costPerUnit: 150,
      totalValue: 2250,
      supplier: 'VetChem Ltd',
      lastPurchaseDate: '2025-10-20',
      location: 'Chemical Storage',
      status: 'low-stock',
    },
    {
      id: '7',
      name: 'NPK Fertilizer (17:17:17)',
      category: 'fertilizer',
      quantity: 1000,
      unit: 'kg',
      reorderLevel: 500,
      costPerUnit: 55,
      totalValue: 55000,
      supplier: 'AgriChem Supplies',
      lastPurchaseDate: '2025-10-25',
      location: 'Fertilizer Store',
      status: 'in-stock',
    },
    {
      id: '8',
      name: 'Urea Fertilizer',
      category: 'fertilizer',
      quantity: 300,
      unit: 'kg',
      reorderLevel: 200,
      costPerUnit: 48,
      totalValue: 14400,
      supplier: 'AgriChem Supplies',
      lastPurchaseDate: '2025-11-02',
      location: 'Fertilizer Store',
      status: 'in-stock',
    },
    {
      id: '9',
      name: 'Maize Seeds (Hybrid)',
      category: 'seed',
      quantity: 50,
      unit: 'kg',
      reorderLevel: 20,
      costPerUnit: 180,
      totalValue: 9000,
      supplier: 'SeedTech',
      lastPurchaseDate: '2025-10-10',
      location: 'Seed Storage',
      status: 'in-stock',
    },
    {
      id: '10',
      name: 'Wheat Seeds',
      category: 'seed',
      quantity: 80,
      unit: 'kg',
      reorderLevel: 30,
      costPerUnit: 120,
      totalValue: 9600,
      supplier: 'SeedTech',
      lastPurchaseDate: '2025-10-12',
      location: 'Seed Storage',
      status: 'in-stock',
    },
    {
      id: '11',
      name: 'Silage',
      category: 'feed',
      quantity: 2000,
      unit: 'kg',
      reorderLevel: 1000,
      costPerUnit: 8,
      totalValue: 16000,
      supplier: 'Farm Produced',
      lastPurchaseDate: '2025-10-01',
      location: 'Silage Pit',
      status: 'in-stock',
    },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 't1',
      itemId: '1',
      itemName: 'Dairy Meal Concentrate',
      type: 'usage',
      quantity: 50,
      unit: 'kg',
      purpose: 'Dairy cattle feeding',
      date: '2025-11-13',
      recordedBy: 'John Doe',
    },
    {
      id: 't2',
      itemId: '5',
      itemName: 'Dipping Chemical',
      type: 'usage',
      quantity: 5,
      unit: 'liters',
      purpose: 'Cattle dipping - weekly schedule',
      date: '2025-11-12',
      recordedBy: 'Jane Smith',
    },
    {
      id: 't3',
      itemId: '7',
      itemName: 'NPK Fertilizer (17:17:17)',
      type: 'usage',
      quantity: 100,
      unit: 'kg',
      purpose: 'Maize field - Section A (2 acres)',
      date: '2025-11-10',
      recordedBy: 'Mike Johnson',
    },
  ]);

  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    name: '',
    category: 'feed',
    quantity: 0,
    unit: 'kg',
    reorderLevel: 0,
    costPerUnit: 0,
    supplier: '',
    location: '',
  });

  const [transactionData, setTransactionData] = useState({
    itemId: '',
    type: 'usage' as 'purchase' | 'usage' | 'adjustment',
    quantity: 0,
    cost: 0,
    purpose: '',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData(item);
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        category: 'feed',
        quantity: 0,
        unit: 'kg',
        reorderLevel: 0,
        costPerUnit: 0,
        supplier: '',
        location: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleSaveItem = () => {
    if (!formData.name || !formData.quantity || !formData.costPerUnit) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    const totalValue = (formData.quantity || 0) * (formData.costPerUnit || 0);
    let status: 'in-stock' | 'low-stock' | 'out-of-stock' = 'in-stock';
    
    if ((formData.quantity || 0) === 0) {
      status = 'out-of-stock';
    } else if ((formData.quantity || 0) <= (formData.reorderLevel || 0)) {
      status = 'low-stock';
    }

    if (editingItem) {
      setInventory(inventory.map(item =>
        item.id === editingItem.id
          ? { ...item, ...formData, totalValue, status, id: item.id }
          : item
      ));
      setSnackbar({ open: true, message: 'Item updated successfully!', severity: 'success' });
    } else {
      const newItem: InventoryItem = {
        ...formData as InventoryItem,
        id: `item-${Date.now()}`,
        totalValue,
        status,
        lastPurchaseDate: new Date().toISOString().split('T')[0],
      };
      setInventory([...inventory, newItem]);
      setSnackbar({ open: true, message: 'Item added successfully!', severity: 'success' });
    }

    handleCloseDialog();
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      setInventory(inventory.filter(item => item.id !== id));
      setSnackbar({ open: true, message: 'Item deleted successfully!', severity: 'success' });
    }
  };

  const handleOpenTransactionDialog = () => {
    setTransactionData({
      itemId: '',
      type: 'usage',
      quantity: 0,
      cost: 0,
      purpose: '',
    });
    setTransactionDialogOpen(true);
  };

  const handleSaveTransaction = () => {
    if (!transactionData.itemId || !transactionData.quantity) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    const item = inventory.find(i => i.id === transactionData.itemId);
    if (!item) return;

    // Update inventory quantity
    let newQuantity = item.quantity;
    if (transactionData.type === 'purchase') {
      newQuantity += transactionData.quantity;
    } else if (transactionData.type === 'usage') {
      newQuantity -= transactionData.quantity;
    } else {
      newQuantity = transactionData.quantity;
    }

    const totalValue = newQuantity * item.costPerUnit;
    let status: 'in-stock' | 'low-stock' | 'out-of-stock' = 'in-stock';
    
    if (newQuantity === 0) {
      status = 'out-of-stock';
    } else if (newQuantity <= item.reorderLevel) {
      status = 'low-stock';
    }

    setInventory(inventory.map(i =>
      i.id === item.id
        ? { ...i, quantity: newQuantity, totalValue, status, lastPurchaseDate: transactionData.type === 'purchase' ? new Date().toISOString().split('T')[0] : i.lastPurchaseDate }
        : i
    ));

    // Add transaction record
    const newTransaction: Transaction = {
      id: `t-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      type: transactionData.type,
      quantity: transactionData.quantity,
      unit: item.unit,
      cost: transactionData.type === 'purchase' ? transactionData.cost : undefined,
      purpose: transactionData.purpose,
      date: new Date().toISOString().split('T')[0],
      recordedBy: 'Current User',
    };

    setTransactions([newTransaction, ...transactions]);
    setTransactionDialogOpen(false);
    setSnackbar({ open: true, message: 'Transaction recorded successfully!', severity: 'success' });
  };

  const getFilteredInventory = (category?: string) => {
    if (!category) return inventory;
    return inventory.filter(item => item.category === category);
  };

  const getCategoryStats = (category: string) => {
    const items = getFilteredInventory(category);
    const totalValue = items.reduce((sum, item) => sum + item.totalValue, 0);
    const lowStock = items.filter(item => item.status === 'low-stock').length;
    const outOfStock = items.filter(item => item.status === 'out-of-stock').length;
    return { count: items.length, totalValue, lowStock, outOfStock };
  };

  const totalInventoryValue = inventory.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockItems = inventory.filter(item => item.status === 'low-stock').length;
  const outOfStockItems = inventory.filter(item => item.status === 'out-of-stock').length;

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'feed': 'Feed',
      'raw-material': 'Raw Materials',
      'chemical': 'Chemicals',
      'fertilizer': 'Fertilizers',
      'seed': 'Seeds',
      'other': 'Other',
    };
    return labels[category] || category;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
        Inventory Management
      </Typography>
      <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
        Track stock levels, manage supplies, and monitor inventory transactions
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3, gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ShoppingCart />}
          onClick={handleOpenTransactionDialog}
        >
          Record Transaction
        </Button>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Item
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Inventory Value
                  </Typography>
                  <Typography variant="h5">${totalInventoryValue.toLocaleString()}</Typography>
                </Box>
                <Inventory sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Total Items
                  </Typography>
                  <Typography variant="h5">{inventory.length}</Typography>
                </Box>
                <Assessment sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Low Stock Items
                  </Typography>
                  <Typography variant="h5" color="warning.main">{lowStockItems}</Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Out of Stock
                  </Typography>
                  <Typography variant="h5" color="error.main">{outOfStockItems}</Typography>
                </Box>
                <TrendingDown sx={{ fontSize: 40, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      {(lowStockItems > 0 || outOfStockItems > 0) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Attention Required:</strong> {lowStockItems} items are low on stock and {outOfStockItems} items are out of stock. 
          Please reorder to maintain adequate inventory levels.
        </Alert>
      )}

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="All Inventory" />
          <Tab label="Feed" />
          <Tab label="Raw Materials" />
          <Tab label="Chemicals" />
          <Tab label="Fertilizers" />
          <Tab label="Seeds" />
          <Tab label="Recent Transactions" />
        </Tabs>

        <CardContent>
          {/* All Inventory Tab */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Reorder Level</TableCell>
                    <TableCell>Cost/Unit</TableCell>
                    <TableCell>Total Value</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventory.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{item.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Supplier: {item.supplier}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={getCategoryLabel(item.category)} size="small" />
                      </TableCell>
                      <TableCell>
                        {item.quantity} {item.unit}
                        {item.quantity <= item.reorderLevel && (
                          <LinearProgress
                            variant="determinate"
                            value={(item.quantity / item.reorderLevel) * 100}
                            color={item.quantity === 0 ? 'error' : 'warning'}
                            sx={{ mt: 1 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>{item.reorderLevel} {item.unit}</TableCell>
                      <TableCell>${item.costPerUnit}</TableCell>
                      <TableCell>${item.totalValue.toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={item.status.replace('-', ' ')}
                          size="small"
                          color={
                            item.status === 'in-stock' ? 'success' :
                            item.status === 'low-stock' ? 'warning' : 'error'
                          }
                          icon={
                            item.status === 'in-stock' ? <CheckCircle /> :
                            item.status === 'low-stock' ? <Warning /> : <TrendingDown />
                          }
                        />
                      </TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                          <Edit />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteItem(item.id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Category Tabs */}
          {['feed', 'raw-material', 'chemical', 'fertilizer', 'seed'].map((category, index) => (
            <TabPanel value={tabValue} index={index + 1} key={category}>
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  {(() => {
                    const stats = getCategoryStats(category);
                    return (
                      <>
                        <Grid size={{ xs: 3 }}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="body2" color="text.secondary">Total Items</Typography>
                            <Typography variant="h6">{stats.count}</Typography>
                          </Paper>
                        </Grid>
                        <Grid size={{ xs: 3 }}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="body2" color="text.secondary">Total Value</Typography>
                            <Typography variant="h6">${stats.totalValue.toLocaleString()}</Typography>
                          </Paper>
                        </Grid>
                        <Grid size={{ xs: 3 }}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="body2" color="text.secondary">Low Stock</Typography>
                            <Typography variant="h6" color="warning.main">{stats.lowStock}</Typography>
                          </Paper>
                        </Grid>
                        <Grid size={{ xs: 3 }}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="body2" color="text.secondary">Out of Stock</Typography>
                            <Typography variant="h6" color="error.main">{stats.outOfStock}</Typography>
                          </Paper>
                        </Grid>
                      </>
                    );
                  })()}
                </Grid>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Reorder Level</TableCell>
                      <TableCell>Cost/Unit</TableCell>
                      <TableCell>Total Value</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Supplier</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getFilteredInventory(category).map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2">{item.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Last Purchase: {new Date(item.lastPurchaseDate).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {item.quantity} {item.unit}
                          {item.quantity <= item.reorderLevel && (
                            <LinearProgress
                              variant="determinate"
                              value={(item.quantity / item.reorderLevel) * 100}
                              color={item.quantity === 0 ? 'error' : 'warning'}
                              sx={{ mt: 1 }}
                            />
                          )}
                        </TableCell>
                        <TableCell>{item.reorderLevel} {item.unit}</TableCell>
                        <TableCell>${item.costPerUnit}</TableCell>
                        <TableCell>${item.totalValue.toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip
                            label={item.status.replace('-', ' ')}
                            size="small"
                            color={
                              item.status === 'in-stock' ? 'success' :
                              item.status === 'low-stock' ? 'warning' : 'error'
                            }
                          />
                        </TableCell>
                        <TableCell>{item.supplier}</TableCell>
                        <TableCell>{item.location}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleOpenDialog(item)}>
                            <Edit />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => handleDeleteItem(item.id)}>
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </TabPanel>
          ))}

          {/* Recent Transactions Tab */}
          <TabPanel value={tabValue} index={6}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Item</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Quantity</TableCell>
                    <TableCell>Purpose</TableCell>
                    <TableCell>Recorded By</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} hover>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>{transaction.itemName}</TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.type}
                          size="small"
                          color={
                            transaction.type === 'purchase' ? 'success' :
                            transaction.type === 'usage' ? 'warning' : 'info'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {transaction.type === 'usage' ? '-' : '+'}{transaction.quantity} {transaction.unit}
                      </TableCell>
                      <TableCell>{transaction.purpose || '-'}</TableCell>
                      <TableCell>{transaction.recordedBy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Add/Edit Item Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Item Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                >
                  <MenuItem value="feed">Feed</MenuItem>
                  <MenuItem value="raw-material">Raw Material</MenuItem>
                  <MenuItem value="chemical">Chemical</MenuItem>
                  <MenuItem value="fertilizer">Fertilizer</MenuItem>
                  <MenuItem value="seed">Seed</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Unit"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                fullWidth
                required
                placeholder="kg, liters, bales, etc."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Reorder Level"
                type="number"
                value={formData.reorderLevel}
                onChange={(e) => setFormData({ ...formData, reorderLevel: parseFloat(e.target.value) })}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Cost Per Unit ($)"
                type="number"
                value={formData.costPerUnit}
                onChange={(e) => setFormData({ ...formData, costPerUnit: parseFloat(e.target.value) })}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Total Value"
                value={`$${((formData.quantity || 0) * (formData.costPerUnit || 0)).toLocaleString()}`}
                fullWidth
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Storage Location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveItem}>
            {editingItem ? 'Update' : 'Add'} Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* Record Transaction Dialog */}
      <Dialog open={transactionDialogOpen} onClose={() => setTransactionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Transaction</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Select Item</InputLabel>
                <Select
                  value={transactionData.itemId}
                  label="Select Item"
                  onChange={(e) => setTransactionData({ ...transactionData, itemId: e.target.value })}
                >
                  {inventory.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name} ({item.quantity} {item.unit} available)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={transactionData.type}
                  label="Transaction Type"
                  onChange={(e) => setTransactionData({ ...transactionData, type: e.target.value as any })}
                >
                  <MenuItem value="purchase">Purchase (Add Stock)</MenuItem>
                  <MenuItem value="usage">Usage (Remove Stock)</MenuItem>
                  <MenuItem value="adjustment">Adjustment (Set Stock)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Quantity"
                type="number"
                value={transactionData.quantity}
                onChange={(e) => setTransactionData({ ...transactionData, quantity: parseFloat(e.target.value) })}
                fullWidth
                required
              />
            </Grid>
            {transactionData.type === 'purchase' && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Total Cost ($)"
                  type="number"
                  value={transactionData.cost}
                  onChange={(e) => setTransactionData({ ...transactionData, cost: parseFloat(e.target.value) })}
                  fullWidth
                />
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Purpose / Notes"
                value={transactionData.purpose}
                onChange={(e) => setTransactionData({ ...transactionData, purpose: e.target.value })}
                fullWidth
                multiline
                rows={3}
                placeholder="e.g., Fed to dairy cattle, Applied to maize field Section A"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransactionDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTransaction}>
            Record Transaction
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InventoryManagementDashboard;






