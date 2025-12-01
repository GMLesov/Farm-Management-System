import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Switch,
  FormControlLabel,
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Alert,
  Slider,
  Tab,
  Tabs,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  WaterDrop,
  Schedule,
  Speed,
  Thermostat,
  Opacity,
  PlayArrow,
  Stop,
  Edit,
  Add,
  Settings,
  TrendingUp,
  Warning,
  Timer,
  CalendarToday,
  Analytics,
  WbSunny,
  Cloud,
  Visibility,
  NotificationsActive,
  CheckCircle,
  Error,
  ExpandMore,
  Refresh,
  Save,
  Delete,
  History,
  AutoMode,
  Handyman as ManualMode,
  WaterDropOutlined,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import irrigationService, { IrrigationZone, IrrigationSchedule, WeatherConditions } from '../services/irrigation';

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  forecast: string;
  rainChance: number;
}

interface WaterUsageData {
  date: string;
  zone: string;
  usage: number;
  efficiency: number;
}

const EnhancedIrrigationDashboard: React.FC = () => {
  const [zones, setZones] = useState<IrrigationZone[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [systemEnabled, setSystemEnabled] = useState(true);
  const [autoMode, setAutoMode] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: 22,
    humidity: 65,
    windSpeed: 8,
    precipitation: 0,
    forecast: 'Partly Cloudy',
    rainChance: 15,
  });

  const [newZone, setNewZone] = useState({
    name: '',
    area: 0,
    cropType: '',
    flowRate: 0,
  });

  const [newSchedule, setNewSchedule] = useState<Partial<IrrigationSchedule>>({
    name: '',
    startTime: '',
    duration: 30,
    frequency: 'daily',
    daysOfWeek: [],
    enabled: true,
    conditions: {},
  });

  // Load initial data
  useEffect(() => {
    loadZones();
    loadWeatherData();
    loadSystemStatus();
  }, []);

  const loadZones = async () => {
    try {
      setLoading(true);
      const zonesData = await irrigationService.getAllZones();
      setZones(zonesData);
    } catch (error) {
      showSnackbar('Failed to load irrigation zones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadWeatherData = async () => {
    try {
      const weather = await irrigationService.getWeatherConditions();
      setWeatherData(weather);
    } catch (error) {
      console.warn('Failed to load weather data, using defaults');
    }
  };

  const loadSystemStatus = async () => {
    try {
      const status = await irrigationService.getSystemStatus();
      setSystemEnabled(status.enabled);
      setAutoMode(status.autoMode);
      setEmergencyMode(status.emergencyMode);
    } catch (error) {
      console.warn('Failed to load system status');
    }
  };

  const startZone = async (zoneId: string) => {
    setLoading(true);
    try {
      const result = await irrigationService.startZone(zoneId);
      if (result.success) {
        await loadZones(); // Refresh zone data
        showSnackbar(result.message, 'success');
      } else {
        showSnackbar('Failed to start zone', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to start zone', 'error');
    }
    setLoading(false);
  };

  const stopZone = async (zoneId: string) => {
    setLoading(true);
    try {
      const result = await irrigationService.stopZone(zoneId);
      if (result.success) {
        await loadZones();
        showSnackbar(result.message, 'success');
      } else {
        showSnackbar('Failed to stop zone', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to stop zone', 'error');
    }
    setLoading(false);
  };

  const scheduleZone = async (zoneId: string, schedule: IrrigationSchedule) => {
    setLoading(true);
    try {
      await irrigationService.createSchedule(zoneId, schedule);
      await loadZones();
      showSnackbar('Schedule created successfully', 'success');
      setScheduleDialogOpen(false);
    } catch (error) {
      showSnackbar('Failed to create schedule', 'error');
    }
    setLoading(false);
  };

  const emergencyIrrigation = async () => {
    setLoading(true);
    try {
      const result = emergencyMode 
        ? await irrigationService.deactivateEmergencyMode()
        : await irrigationService.activateEmergencyMode();
      
      if (result.success) {
        setEmergencyMode(!emergencyMode);
        await loadZones();
        showSnackbar(result.message, emergencyMode ? 'info' : 'warning');
      } else {
        showSnackbar('Emergency operation failed', 'error');
      }
    } catch (error) {
      showSnackbar('Emergency operation failed', 'error');
    }
    setLoading(false);
  };

  const stopAllZones = async () => {
    setLoading(true);
    try {
      const result = await irrigationService.stopAllZones();
      if (result.success) {
        await loadZones();
        showSnackbar(result.message, 'info');
      } else {
        showSnackbar('Failed to stop all zones', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to stop all zones', 'error');
    }
    setLoading(false);
  };

  const addNewZone = async () => {
    if (!newZone.name || !newZone.cropType || newZone.area <= 0) {
      showSnackbar('Please fill in all required fields', 'warning');
      return;
    }

    setLoading(true);
    try {
      const zone = await irrigationService.createZone({
        name: newZone.name,
        area: newZone.area,
        cropType: newZone.cropType,
        flowRate: newZone.flowRate,
        soilMoisture: 50,
        temperature: 20,
        humidity: 60,
        coordinates: { lat: 40.7128 + Math.random() * 0.01, lng: -74.0060 + Math.random() * 0.01 },
      });

      await loadZones();
      setNewZone({ name: '', area: 0, cropType: '', flowRate: 0 });
      setDialogOpen(false);
      showSnackbar('Zone added successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to add zone', 'error');
    }
    setLoading(false);
  };

  const handleSystemToggle = async (enabled: boolean) => {
    try {
      const result = enabled 
        ? await irrigationService.enableSystem()
        : await irrigationService.disableSystem();
      
      if (result.success) {
        setSystemEnabled(enabled);
        showSnackbar(result.message, 'success');
      }
    } catch (error) {
      showSnackbar('Failed to update system status', 'error');
    }
  };

  const handleAutoModeToggle = async (enabled: boolean) => {
    try {
      const result = enabled 
        ? await irrigationService.enableAutoMode()
        : await irrigationService.disableAutoMode();
      
      if (result.success) {
        setAutoMode(enabled);
        showSnackbar(result.message, 'success');
      }
    } catch (error) {
      showSnackbar('Failed to update auto mode', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const refreshData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadZones(),
        loadWeatherData(),
        loadSystemStatus()
      ]);
      showSnackbar('Data refreshed successfully', 'success');
    } catch (error) {
      showSnackbar('Failed to refresh data', 'error');
    }
    setLoading(false);
  };

  // Utility functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'scheduled': return 'primary';
      case 'inactive': return 'default';
      case 'maintenance': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getMoistureColor = (moisture: number) => {
    if (moisture < 30) return '#f44336';
    if (moisture < 50) return '#ff9800';
    if (moisture < 70) return '#2196f3';
    return '#4caf50';
  };

  // Mock data for charts
  const waterUsageData = [
    { date: 'Mon', usage: 1200, target: 1100, efficiency: 92 },
    { date: 'Tue', usage: 980, target: 1100, efficiency: 89 },
    { date: 'Wed', usage: 1450, target: 1100, efficiency: 85 },
    { date: 'Thu', usage: 1100, target: 1100, efficiency: 95 },
    { date: 'Fri', usage: 1250, target: 1100, efficiency: 88 },
    { date: 'Sat', usage: 1050, target: 1100, efficiency: 96 },
    { date: 'Sun', usage: 1180, target: 1100, efficiency: 93 },
  ];

  const zoneEfficiencyData = zones.map(zone => ({
    name: zone.name,
    efficiency: zone.efficiency,
    usage: zone.waterUsage,
  }));

  // Real-time updates simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (zones.length > 0) {
        setZones(prevZones => prevZones.map(zone => ({
          ...zone,
          soilMoisture: Math.max(0, Math.min(100, zone.soilMoisture + (Math.random() - 0.5) * 2)),
          temperature: Math.max(0, zone.temperature + (Math.random() - 0.5) * 1),
          pressure: Math.max(0, zone.pressure + (Math.random() - 0.5) * 2),
        })));
      }
    }, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, [zones.length]);

  const totalWaterUsage = zones.reduce((sum, zone) => sum + zone.waterUsage, 0);
  const activeZones = zones.filter(zone => zone.status === 'active').length;
  const lowMoistureZones = zones.filter(zone => zone.soilMoisture < 40).length;
  const avgEfficiency = zones.reduce((sum, zone) => sum + zone.efficiency, 0) / zones.length;
  const lowBatteryZones = zones.filter(zone => zone.sensorBattery < 20).length;

  const renderDashboardTab = () => (
    <Box>
      {emergencyMode && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography>Emergency irrigation mode activated. All zones running at maximum capacity.</Typography>
            <Button color="inherit" size="small" onClick={emergencyIrrigation}>
              DEACTIVATE
            </Button>
          </Box>
        </Alert>
      )}

      {lowMoistureZones > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography>{lowMoistureZones} zone(s) have critically low soil moisture levels.</Typography>
            <Button color="inherit" size="small" onClick={() => setTabValue(1)}>
              VIEW ZONES
            </Button>
          </Box>
        </Alert>
      )}

      {lowBatteryZones > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {lowBatteryZones} sensor(s) have low battery levels and need replacement.
        </Alert>
      )}

      {/* Enhanced Summary Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WaterDrop sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">Active Zones</Typography>
                </Box>
                <Typography variant="h3" color="primary">
                  {activeZones}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  of {zones.length} total zones
                </Typography>
              </Box>
              <IconButton color="primary" onClick={refreshData} disabled={loading}>
                {loading ? <CircularProgress size={24} /> : <Refresh />}
              </IconButton>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Speed sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="h6">Water Usage</Typography>
            </Box>
            <Typography variant="h3" color="info.main">
              {totalWaterUsage.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              gallons this week
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(totalWaterUsage / 3000) * 100} 
              sx={{ mt: 1 }}
            />
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6">Efficiency</Typography>
            </Box>
            <Typography variant="h3" color="success.main">
              {Math.round(avgEfficiency)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              average system efficiency
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Warning sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6">Alerts</Typography>
            </Box>
            <Typography variant="h3" color="warning.main">
              {lowMoistureZones + lowBatteryZones}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              zones need attention
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Weather Integration */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Weather Conditions & Forecast
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center', flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WbSunny color="warning" />
              <Typography>{weatherData.temperature}°C</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Opacity color="info" />
              <Typography>{weatherData.humidity}% Humidity</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Cloud color="action" />
              <Typography>{weatherData.forecast}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WaterDropOutlined color="primary" />
              <Typography>{weatherData.rainChance}% Rain</Typography>
            </Box>
          </Box>
          {weatherData.rainChance > 70 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              High chance of rain expected. Consider adjusting irrigation schedules.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Enhanced Quick Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            System Controls
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <Button
              sx={{ flex: 1, minWidth: 200 }}
              variant="contained"
              color={emergencyMode ? "error" : "primary"}
              startIcon={emergencyMode ? <Stop /> : <PlayArrow />}
              onClick={emergencyIrrigation}
              disabled={loading}
            >
              {emergencyMode ? 'Stop Emergency' : 'Emergency Irrigation'}
            </Button>
            <Button
              sx={{ flex: 1, minWidth: 200 }}
              variant="outlined"
              startIcon={<Schedule />}
              onClick={() => setScheduleDialogOpen(true)}
            >
              Schedule All
            </Button>
            <Button
              sx={{ flex: 1, minWidth: 200 }}
              variant="outlined"
              color="warning"
              startIcon={<Stop />}
              onClick={stopAllZones}
              disabled={loading}
            >
              Stop All Zones
            </Button>
            <Button
              sx={{ flex: 1, minWidth: 200 }}
              variant="outlined"
              startIcon={<Settings />}
            >
              System Settings
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={systemEnabled}
                  onChange={(e) => handleSystemToggle(e.target.checked)}
                  color="primary"
                />
              }
              label="System Enabled"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={autoMode}
                  onChange={(e) => handleAutoModeToggle(e.target.checked)}
                  color="secondary"
                />
              }
              label="Auto Mode"
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  const renderZoneManagementTab = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Irrigation Zone Management</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Add New Zone
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Zone Details</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Soil Moisture</TableCell>
              <TableCell>Environmental</TableCell>
              <TableCell>System Data</TableCell>
              <TableCell>Efficiency</TableCell>
              <TableCell align="center">Controls</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {zones.map((zone) => (
              <TableRow key={zone.id} hover>
                <TableCell>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">{zone.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {zone.area} acres • {zone.cropType}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Flow: {zone.flowRate} GPM
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Chip
                      label={zone.status}
                      color={getStatusColor(zone.status) as any}
                      size="small"
                      sx={{ textTransform: 'capitalize', mb: 0.5 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Valve: {zone.valveStatus}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ minWidth: 120 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={zone.soilMoisture}
                        sx={{ 
                          flexGrow: 1, 
                          height: 8, 
                          borderRadius: 4,
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getMoistureColor(zone.soilMoisture)
                          }
                        }}
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {zone.soilMoisture}%
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Target: 50-70%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      🌡️ {zone.temperature}°C
                    </Typography>
                    <Typography variant="body2">
                      💧 {zone.humidity}% RH
                    </Typography>
                    <Typography variant="body2">
                      ⚡ Pressure: {zone.pressure} PSI
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2">
                      Last: {new Date(zone.lastWatered).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      Next: {new Date(zone.nextScheduled).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2">
                      🔋 Battery: {zone.sensorBattery}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress
                      variant="determinate"
                      value={zone.efficiency}
                      size={40}
                      sx={{
                        color: zone.efficiency >= 90 ? '#4caf50' : 
                               zone.efficiency >= 75 ? '#ff9800' : '#f44336'
                      }}
                    />
                    <Typography variant="body2" fontWeight="bold">
                      {zone.efficiency}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                    <Tooltip title={zone.status === 'active' ? 'Stop Zone' : 'Start Zone'}>
                      <IconButton
                        size="small"
                        color={zone.status === 'active' ? 'error' : 'primary'}
                        onClick={() => zone.status === 'active' ? stopZone(zone.id) : startZone(zone.id)}
                        disabled={loading}
                      >
                        {zone.status === 'active' ? <Stop /> : <PlayArrow />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Schedule Zone">
                      <IconButton 
                        size="small" 
                        color="secondary"
                        onClick={() => {
                          setSelectedZone(zone.id);
                          setScheduleDialogOpen(true);
                        }}
                      >
                        <Schedule />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Zone">
                      <IconButton size="small" color="info">
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderAnalyticsTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Water Usage Analytics</Typography>
      
      {/* Water Usage Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Weekly Water Usage vs Target</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={waterUsageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <RechartsTooltip />
              <Legend />
              <Line type="monotone" dataKey="usage" stroke="#2196f3" strokeWidth={2} name="Actual Usage" />
              <Line type="monotone" dataKey="target" stroke="#4caf50" strokeWidth={2} strokeDasharray="5 5" name="Target" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Efficiency Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Zone Efficiency Comparison</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={zoneEfficiencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="efficiency" fill="#4caf50" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Water Distribution Pie Chart */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Water Distribution by Zone</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={zones.map(zone => ({ name: zone.name, value: zone.waterUsage }))}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {zones.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                ))}
              </Pie>
              <RechartsTooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </Box>
  );

  const renderRecommendationsTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>System Recommendations</Typography>
      
      {zones.map((zone) => (
        <Accordion key={zone.id} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
              <Typography variant="h6">{zone.name}</Typography>
              <Chip 
                label={`${zone.recommendations.length} recommendations`} 
                size="small" 
                color="primary"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {zone.recommendations.map((rec, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    {rec.includes('Optimal') ? <CheckCircle color="success" /> :
                     rec.includes('Low') || rec.includes('High') ? <Warning color="warning" /> :
                     <NotificationsActive color="info" />}
                  </ListItemIcon>
                  <ListItemText primary={rec} />
                </ListItem>
              ))}
            </List>
            
            {/* Smart Recommendations based on data */}
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>Smart Analysis:</Typography>
              {zone.soilMoisture < 40 && (
                <Alert severity="warning" sx={{ mb: 1 }}>
                  Soil moisture below optimal range. Consider increasing irrigation frequency.
                </Alert>
              )}
              {zone.efficiency < 80 && (
                <Alert severity="info" sx={{ mb: 1 }}>
                  Zone efficiency below target. Check for leaks or adjust flow rates.
                </Alert>
              )}
              {zone.sensorBattery < 20 && (
                <Alert severity="error" sx={{ mb: 1 }}>
                  Sensor battery critically low. Schedule maintenance immediately.
                </Alert>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Enhanced Irrigation Management System
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Badge badgeContent={lowMoistureZones + lowBatteryZones} color="error">
            <NotificationsActive />
          </Badge>
          <Chip 
            icon={autoMode ? <AutoMode /> : <ManualMode />} 
            label={autoMode ? 'Auto Mode' : 'Manual Mode'} 
            color={autoMode ? 'success' : 'default'}
            onClick={() => handleAutoModeToggle(!autoMode)}
            clickable
          />
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Dashboard" icon={<Visibility />} />
          <Tab label="Zone Management" icon={<Settings />} />
          <Tab label="Analytics" icon={<Analytics />} />
          <Tab label="Recommendations" icon={<TrendingUp />} />
        </Tabs>
      </Box>

      {tabValue === 0 && renderDashboardTab()}
      {tabValue === 1 && renderZoneManagementTab()}
      {tabValue === 2 && renderAnalyticsTab()}
      {tabValue === 3 && renderRecommendationsTab()}

      {/* Add Zone Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Irrigation Zone</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField 
              label="Zone Name" 
              fullWidth 
              value={newZone.name}
              onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
            />
            <TextField 
              label="Area (acres)" 
              type="number" 
              fullWidth 
              value={newZone.area}
              onChange={(e) => setNewZone({ ...newZone, area: parseFloat(e.target.value) || 0 })}
            />
            <FormControl fullWidth>
              <InputLabel>Crop Type</InputLabel>
              <Select 
                label="Crop Type"
                value={newZone.cropType}
                onChange={(e) => setNewZone({ ...newZone, cropType: e.target.value })}
              >
                <MenuItem value="corn">Corn</MenuItem>
                <MenuItem value="tomatoes">Tomatoes</MenuItem>
                <MenuItem value="wheat">Wheat</MenuItem>
                <MenuItem value="apples">Apple Trees</MenuItem>
                <MenuItem value="lettuce">Lettuce</MenuItem>
                <MenuItem value="carrots">Carrots</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField 
              label="Flow Rate (GPM)" 
              type="number" 
              fullWidth 
              value={newZone.flowRate}
              onChange={(e) => setNewZone({ ...newZone, flowRate: parseFloat(e.target.value) || 0 })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={addNewZone} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Add Zone'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Irrigation Schedule</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField 
              label="Schedule Name" 
              fullWidth 
              value={newSchedule.name}
              onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                label="Start Time" 
                type="time" 
                fullWidth 
                value={newSchedule.startTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField 
                label="Duration (minutes)" 
                type="number" 
                fullWidth 
                value={newSchedule.duration}
                onChange={(e) => setNewSchedule({ ...newSchedule, duration: parseInt(e.target.value) || 30 })}
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select 
                label="Frequency"
                value={newSchedule.frequency}
                onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value as any })}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="bi-weekly">Bi-weekly</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
            
            <Box>
              <Typography variant="subtitle2" gutterBottom>Conditions (Optional)</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField 
                  label="Min Soil Moisture %" 
                  type="number" 
                  size="small"
                  sx={{ minWidth: 150 }}
                />
                <TextField 
                  label="Max Temperature °C" 
                  type="number" 
                  size="small"
                  sx={{ minWidth: 150 }}
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Create Schedule'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnhancedIrrigationDashboard;