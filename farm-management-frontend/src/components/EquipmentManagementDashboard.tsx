import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Badge,
  Tooltip,
  Alert,
  AlertTitle,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Construction as MaintenanceIcon,
  Analytics as AnalyticsIcon,
  Inventory as InventoryIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Build as BuildIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Timer as TimerIcon,
  Speed as SpeedIcon,
  EcoIcon,
  LocalGasStation as FuelIcon,
  Security as SafetyIcon,
  PhotoCamera as PhotoIcon,
  CalendarToday as CalendarIcon,
  Notifications as NotificationIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { equipmentService } from '../services/equipment';
import {
  Equipment,
  EquipmentAnalytics,
  EquipmentCategory,
  EquipmentStatus,
  EquipmentType,
  MaintenanceRecord,
  UsageRecord,
  InspectionRecord,
  UpcomingMaintenanceTask,
  EquipmentRecommendation
} from '../types/equipment';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`equipment-tabpanel-${index}`}
      aria-labelledby={`equipment-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `equipment-tab-${index}`,
    'aria-controls': `equipment-tabpanel-${index}`,
  };
}

const EquipmentManagementDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [analytics, setAnalytics] = useState<EquipmentAnalytics | null>(null);
  const [upcomingMaintenance, setUpcomingMaintenance] = useState<UpcomingMaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addEquipmentOpen, setAddEquipmentOpen] = useState(false);
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [equipmentResponse, analyticsResponse, maintenanceResponse] = await Promise.all([
        equipmentService.getAllEquipment(),
        equipmentService.getEquipmentAnalytics(),
        equipmentService.getMaintenanceSchedule()
      ]);

      if (equipmentResponse.success) {
        setEquipment(equipmentResponse.data);
      }

      if (analyticsResponse.success) {
        setAnalytics(analyticsResponse.data);
      }

      if (maintenanceResponse.success) {
        setUpcomingMaintenance(maintenanceResponse.data);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEquipmentClick = (equipmentItem: Equipment) => {
    setSelectedEquipment(equipmentItem);
    setDialogOpen(true);
  };

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const getStatusColor = (status: EquipmentStatus) => {
    switch (status) {
      case 'active': return 'success';
      case 'maintenance': return 'warning';
      case 'repair': return 'error';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return '#4caf50';
      case 'good': return '#8bc34a';
      case 'fair': return '#ff9800';
      case 'poor': return '#f44336';
      case 'critical': return '#d32f2f';
      default: return '#9e9e9e';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatHours = (hours: number) => {
    return `${hours.toLocaleString()} hrs`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Overview Tab
  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* Key Metrics Cards */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Equipment
                </Typography>
                <Typography variant="h4" component="div">
                  {analytics?.totalEquipment || 0}
                </Typography>
              </Box>
              <InventoryIcon color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Value
                </Typography>
                <Typography variant="h4" component="div">
                  {formatCurrency(analytics?.totalValue || 0)}
                </Typography>
              </Box>
              <MoneyIcon color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Fleet Efficiency
                </Typography>
                <Typography variant="h4" component="div">
                  {analytics?.fleetEfficiency || 0}%
                </Typography>
              </Box>
              <SpeedIcon color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Avg Utilization
                </Typography>
                <Typography variant="h4" component="div">
                  {analytics?.averageUtilization || 0}%
                </Typography>
              </Box>
              <TimerIcon color="primary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Equipment by Category Chart */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Equipment by Category
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(analytics?.equipmentByCategory || {}).map(([category, count]) => ({
                    name: category.charAt(0).toUpperCase() + category.slice(1),
                    value: count
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label
                >
                  {Object.keys(analytics?.equipmentByCategory || {}).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 50%)`} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Equipment Condition Status */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Equipment Condition
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(analytics?.equipmentByCondition || {}).map(([condition, count]) => ({
                condition: condition.charAt(0).toUpperCase() + condition.slice(1),
                count: count
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="condition" />
                <YAxis />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Upcoming Maintenance */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                Upcoming Maintenance
              </Typography>
              <Badge badgeContent={upcomingMaintenance.length} color="warning">
                <ScheduleIcon />
              </Badge>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Equipment</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Cost</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcomingMaintenance.slice(0, 5).map((task) => {
                    const equipmentItem = equipment.find(e => e.id === task.equipmentId);
                    return (
                      <TableRow key={task.id}>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                              {equipmentItem?.name.charAt(0)}
                            </Avatar>
                            {equipmentItem?.name}
                          </Box>
                        </TableCell>
                        <TableCell>{task.type.replace('_', ' ')}</TableCell>
                        <TableCell>{formatDate(task.dueDate)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={task.priority} 
                            color={getPriorityColor(task.priority)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{task.estimatedDuration} min</TableCell>
                        <TableCell>{formatCurrency(task.estimatedCost)}</TableCell>
                        <TableCell>
                          <Chip 
                            label={task.status} 
                            color={task.status === 'scheduled' ? 'info' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Performance Trends */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Fleet Performance Trends
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={analytics?.trends.utilizationTrend.map((item, index) => ({
                ...item,
                efficiency: analytics?.trends.efficiencyTrend[index]?.value || 0,
                reliability: analytics?.trends.reliabilityTrend[index]?.value || 0,
                maintenanceCost: analytics?.trends.maintenanceCostTrend[index]?.value || 0
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" name="Utilization %" />
                <Line type="monotone" dataKey="efficiency" stroke="#82ca9d" name="Efficiency %" />
                <Line type="monotone" dataKey="reliability" stroke="#ffc658" name="Reliability %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Equipment Inventory Tab
  const renderInventoryTab = () => (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Equipment Inventory</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddEquipmentOpen(true)}
        >
          Add Equipment
        </Button>
      </Box>

      <Grid container spacing={3}>
        {equipment.map((equipmentItem) => (
          <Grid item xs={12} md={6} lg={4} key={equipmentItem.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 4
                }
              }}
              onClick={() => handleEquipmentClick(equipmentItem)}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box>
                    <Typography variant="h6" component="div">
                      {equipmentItem.name}
                    </Typography>
                    <Typography color="textSecondary" variant="body2">
                      {equipmentItem.brand} {equipmentItem.model}
                    </Typography>
                  </Box>
                  <Chip 
                    label={equipmentItem.status} 
                    color={getStatusColor(equipmentItem.status)}
                    size="small"
                  />
                </Box>

                {equipmentItem.photos && equipmentItem.photos.length > 0 && (
                  <Box
                    component="img"
                    src={equipmentItem.photos[0].thumbnail}
                    alt={equipmentItem.name}
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                      borderRadius: 1,
                      mb: 2
                    }}
                  />
                )}

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Condition
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: getConditionColor(equipmentItem.condition.overall),
                        mr: 1
                      }}
                    />
                    <Typography variant="body2">
                      {equipmentItem.condition.overall.charAt(0).toUpperCase() + equipmentItem.condition.overall.slice(1)}
                    </Typography>
                  </Box>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Total Hours
                  </Typography>
                  <Typography variant="body2">
                    {formatHours(equipmentItem.totalHours)}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    Current Value
                  </Typography>
                  <Typography variant="body2">
                    {formatCurrency(equipmentItem.currentValue)}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body2" color="textSecondary">
                    Location
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <LocationIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2">
                      {equipmentItem.currentLocation.fieldName}
                    </Typography>
                  </Box>
                </Box>

                {equipmentItem.assignedTo && (
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="textSecondary">
                      Assigned To
                    </Typography>
                    <Box display="flex" alignItems="center">
                      <PersonIcon sx={{ fontSize: 16, mr: 0.5 }} />
                      <Typography variant="body2">
                        {equipmentItem.assignedTo}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {equipmentItem.alerts && equipmentItem.alerts.length > 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <AlertTitle>Alerts</AlertTitle>
                    {equipmentItem.alerts.length} active alert(s)
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  // Maintenance Tab
  const renderMaintenanceTab = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Maintenance Management
      </Typography>

      <Grid container spacing={3}>
        {/* Maintenance Overview */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Maintenance Overview
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2">
                  Upcoming Tasks
                </Typography>
                <Chip label={upcomingMaintenance.length} color="warning" />
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="body2">
                  Overdue Tasks
                </Typography>
                <Chip 
                  label={upcomingMaintenance.filter(t => new Date(t.dueDate) < new Date()).length} 
                  color="error" 
                />
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">
                  Total Cost This Month
                </Typography>
                <Typography variant="body2">
                  {formatCurrency(analytics?.totalMaintenanceCost || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Maintenance Calendar */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Maintenance Schedule
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Equipment</TableCell>
                      <TableCell>Task</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {upcomingMaintenance.map((task) => {
                      const equipmentItem = equipment.find(e => e.id === task.equipmentId);
                      const isOverdue = new Date(task.dueDate) < new Date();
                      
                      return (
                        <TableRow key={task.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ mr: 1, width: 32, height: 32 }}>
                                {equipmentItem?.name.charAt(0)}
                              </Avatar>
                              {equipmentItem?.name}
                            </Box>
                          </TableCell>
                          <TableCell>{task.description}</TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              {isOverdue && <ErrorIcon color="error" sx={{ mr: 1, fontSize: 16 }} />}
                              {formatDate(task.dueDate)}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={task.priority} 
                              color={getPriorityColor(task.priority)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={task.status} 
                              color={isOverdue ? 'error' : 'info'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton size="small">
                              <EditIcon />
                            </IconButton>
                            <IconButton size="small">
                              <CheckCircleIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Maintenance Cost Trends */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Maintenance Cost Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.trends.maintenanceCostTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => formatCurrency(value as number)} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#f44336" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  // Analytics Tab
  const renderAnalyticsTab = () => (
    <Box>
      <Typography variant="h5" gutterBottom>
        Equipment Analytics
      </Typography>

      <Grid container spacing={3}>
        {/* Performance Metrics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Fleet Performance Metrics
              </Typography>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Fleet Efficiency</Typography>
                  <Typography variant="body2">{analytics?.fleetEfficiency}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={analytics?.fleetEfficiency || 0} 
                  sx={{ mb: 1 }}
                />
              </Box>

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Fleet Reliability</Typography>
                  <Typography variant="body2">{analytics?.fleetReliability}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={analytics?.fleetReliability || 0} 
                  color="success"
                  sx={{ mb: 1 }}
                />
              </Box>

              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="body2">Fleet Safety</Typography>
                  <Typography variant="body2">{analytics?.fleetSafety}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={analytics?.fleetSafety || 0} 
                  color="warning"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Cost Analysis */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cost Analysis
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Maintenance', value: analytics?.totalMaintenanceCost || 0 },
                      { name: 'Operating', value: analytics?.totalOperatingCost || 0 },
                      { name: 'Other', value: (analytics?.totalValue || 0) * 0.1 }
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => formatCurrency(entry.value)}
                  >
                    <Cell fill="#8884d8" />
                    <Cell fill="#82ca9d" />
                    <Cell fill="#ffc658" />
                  </Pie>
                  <RechartsTooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Utilization Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Equipment Utilization Analysis
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={equipment.map(e => ({
                    name: e.name,
                    utilization: e.usageAnalytics.utilizationRate,
                    hours: e.totalHours,
                    efficiency: e.performanceMetrics.efficiency.productivityScore
                  }))}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="utilization" fill="#8884d8" name="Utilization %" />
                  <Bar dataKey="efficiency" fill="#82ca9d" name="Efficiency Score" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                AI Recommendations
              </Typography>
              <List>
                {analytics?.recommendations.map((rec) => {
                  const equipmentItem = equipment.find(e => e.id === rec.equipmentId);
                  return (
                    <ListItem key={rec.id}>
                      <ListItemIcon>
                        <Chip 
                          label={rec.priority} 
                          color={getPriorityColor(rec.priority)}
                          size="small"
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={rec.title}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              Equipment: {equipmentItem?.name}
                            </Typography>
                            <Typography variant="body2">
                              {rec.description}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Expected savings: {formatCurrency(rec.estimatedSavings)}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end">
                          <InfoIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  );
                })}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Equipment Management System
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="equipment management tabs">
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <AssessmentIcon sx={{ mr: 1 }} />
                Overview
              </Box>
            } 
            {...a11yProps(0)} 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <InventoryIcon sx={{ mr: 1 }} />
                Inventory
                <Badge badgeContent={equipment.length} color="primary" sx={{ ml: 1 }} />
              </Box>
            } 
            {...a11yProps(1)} 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <MaintenanceIcon sx={{ mr: 1 }} />
                Maintenance
                <Badge badgeContent={upcomingMaintenance.length} color="warning" sx={{ ml: 1 }} />
              </Box>
            } 
            {...a11yProps(2)} 
          />
          <Tab 
            label={
              <Box display="flex" alignItems="center">
                <AnalyticsIcon sx={{ mr: 1 }} />
                Analytics
              </Box>
            } 
            {...a11yProps(3)} 
          />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {renderOverviewTab()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderInventoryTab()}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {renderMaintenanceTab()}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {renderAnalyticsTab()}
      </TabPanel>

      {/* Equipment Details Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedEquipment?.name} Details
          <IconButton
            aria-label="close"
            onClick={() => setDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <EditIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedEquipment && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Equipment Information
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Brand: {selectedEquipment.brand}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Model: {selectedEquipment.model}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Year: {selectedEquipment.year}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Serial: {selectedEquipment.serialNumber}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Total Hours: {formatHours(selectedEquipment.totalHours)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Current Value: {formatCurrency(selectedEquipment.currentValue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Performance Metrics
                    </Typography>
                    <Box mb={2}>
                      <Typography variant="body2" gutterBottom>
                        Utilization Rate: {selectedEquipment.usageAnalytics.utilizationRate}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={selectedEquipment.usageAnalytics.utilizationRate} 
                      />
                    </Box>
                    <Box mb={2}>
                      <Typography variant="body2" gutterBottom>
                        Reliability Score: {selectedEquipment.performanceMetrics.reliability.reliabilityScore}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={selectedEquipment.performanceMetrics.reliability.reliabilityScore} 
                        color="success"
                      />
                    </Box>
                    <Box>
                      <Typography variant="body2" gutterBottom>
                        Safety Score: {selectedEquipment.performanceMetrics.safety.safetyScore}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={selectedEquipment.performanceMetrics.safety.safetyScore} 
                        color="warning"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Recent Maintenance History
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Cost</TableCell>
                            <TableCell>Performed By</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedEquipment.maintenanceHistory.slice(0, 5).map((record) => (
                            <TableRow key={record.id}>
                              <TableCell>{formatDate(record.date)}</TableCell>
                              <TableCell>{record.type.replace('_', ' ')}</TableCell>
                              <TableCell>{record.description}</TableCell>
                              <TableCell>{formatCurrency(record.totalCost)}</TableCell>
                              <TableCell>{record.performedBy.technicianName}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<EditIcon />}>
            Edit Equipment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Equipment FAB */}
      <Fab
        color="primary"
        aria-label="add equipment"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setAddEquipmentOpen(true)}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default EquipmentManagementDashboard;