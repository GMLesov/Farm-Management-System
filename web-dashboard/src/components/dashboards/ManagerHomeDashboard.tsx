import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  LinearProgress,
  Avatar,
  Button,
  Badge,
  Grid,
} from '@mui/material';
import {
  Pets,
  Grass,
  Warning,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Notifications,
  CalendarToday,
  AttachMoney,
  LocalShipping,
  WaterDrop,
  Thermostat,
  Speed,
  AssignmentTurnedIn,
  Assignment,
  Inventory,
  HealthAndSafety,
  ArrowForward,
  Cloud,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface KPI {
  label: string;
  value: string | number;
  change: number;
  icon: React.ReactElement;
  color: string;
  unit?: string;
}

interface AlertItem {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: string;
  message: string;
  time: string;
  action?: string;
  link?: string;
}

interface QuickStat {
  label: string;
  value: string | number;
  status: 'good' | 'warning' | 'critical';
  icon: React.ReactElement;
}

const ManagerHomeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Key Performance Indicators
  const kpis: KPI[] = [
    {
      label: 'Total Animals',
      value: 905,
      change: 2.5,
      icon: <Pets />,
      color: '#8B4513',
      unit: 'head',
    },
    {
      label: 'Active Crop Fields',
      value: 14,
      change: 0,
      icon: <Grass />,
      color: '#4CAF50',
      unit: 'acres',
    },
    {
      label: 'Monthly Revenue',
      value: '$48,250',
      change: 12.3,
      icon: <AttachMoney />,
      color: '#FF9800',
    },
    {
      label: 'Feed Inventory',
      value: '85%',
      change: -5.2,
      icon: <Inventory />,
      color: '#2196F3',
    },
    {
      label: 'Tasks Completed',
      value: '87%',
      change: 3.1,
      icon: <AssignmentTurnedIn />,
      color: '#9C27B0',
    },
    {
      label: 'Health Score',
      value: '92%',
      change: 1.5,
      icon: <HealthAndSafety />,
      color: '#4CAF50',
    },
  ];

  // Critical Alerts & Notifications
  const alerts: AlertItem[] = [
    {
      id: 'a1',
      type: 'critical',
      category: 'Breeding',
      message: '3 sows expected to farrow in next 48 hours',
      time: '2 hours ago',
      action: 'View Details',
      link: '/animal-health',
    },
    {
      id: 'a2',
      type: 'critical',
      category: 'Vaccination',
      message: 'Cattle vaccination due today - 50 animals',
      time: '4 hours ago',
      action: 'Schedule',
      link: '/animal-health',
    },
    {
      id: 'a3',
      type: 'warning',
      category: 'Inventory',
      message: 'Broiler feed below reorder level (15 bags remaining)',
      time: '5 hours ago',
      action: 'Reorder',
      link: '/inventory',
    },
    {
      id: 'a4',
      type: 'warning',
      category: 'Irrigation',
      message: 'Maize field Section A needs watering today',
      time: '6 hours ago',
      action: 'Irrigate',
      link: '/crop-planning',
    },
    {
      id: 'a5',
      type: 'info',
      category: 'Tasks',
      message: '4 workers have completed daily feeding routine',
      time: '1 hour ago',
      action: 'Review',
      link: '/tasks',
    },
    {
      id: 'a6',
      type: 'warning',
      category: 'Health',
      message: '2 dairy cows showing signs of mastitis',
      time: '3 hours ago',
      action: 'Treat',
      link: '/animals',
    },
  ];

  // Quick Stats
  const livestockStats: QuickStat[] = [
    { label: 'Dairy Cows', value: 50, status: 'good', icon: <Pets sx={{ color: '#8B4513' }} /> },
    { label: 'Breeding Sows', value: 15, status: 'good', icon: <Pets sx={{ color: '#FFC0CB' }} /> },
    { label: 'Grower Pigs', value: 120, status: 'good', icon: <Pets sx={{ color: '#FFB6C1' }} /> },
    { label: 'Broilers', value: 500, status: 'warning', icon: <Pets sx={{ color: '#FFD700' }} /> },
    { label: 'Layers', value: 200, status: 'good', icon: <Pets sx={{ color: '#FFA500' }} /> },
    { label: 'Sheep', value: 20, status: 'good', icon: <Pets sx={{ color: '#DEB887' }} /> },
  ];

  const cropStats: QuickStat[] = [
    { label: 'Maize', value: '5 acres', status: 'good', icon: <Grass sx={{ color: '#FFD700' }} /> },
    { label: 'Wheat', value: '3 acres', status: 'warning', icon: <Grass sx={{ color: '#DEB887' }} /> },
    { label: 'Tomatoes', value: '2 acres', status: 'good', icon: <Grass sx={{ color: '#FF6347' }} /> },
    { label: 'Potatoes', value: '4 acres', status: 'critical', icon: <Grass sx={{ color: '#8B4513' }} /> },
  ];

  // Today's Tasks
  const todaysTasks = [
    { id: 1, task: 'Morning cattle feeding', assignedTo: 'John Kamau', status: 'completed', time: '06:00' },
    { id: 2, task: 'Broiler vaccination', assignedTo: 'Mary Wanjiku', status: 'in-progress', time: '08:00' },
    { id: 3, task: 'Maize field inspection', assignedTo: 'Peter Mwangi', status: 'pending', time: '10:00' },
    { id: 4, task: 'Evening cattle feeding', assignedTo: 'John Kamau', status: 'pending', time: '17:00' },
    { id: 5, task: 'Pig pen cleaning', assignedTo: 'David Ochieng', status: 'in-progress', time: '09:00' },
  ];

  // Weather Data
  const weatherData = {
    temperature: 28,
    condition: 'Partly Cloudy',
    rainfall: 0,
    humidity: 65,
    windSpeed: 12,
    forecast: 'Chance of rain tomorrow',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const getAlertSeverity = (type: string) => {
    switch (type) {
      case 'critical': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      default: return 'info';
    }
  };

  return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
          Manager Home
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
          Overview of farm status, quick actions, and management tools.
        </Typography>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {' • '}
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="contained" startIcon={<Pets />} onClick={() => navigate('/animals')}>
              Add Animal
            </Button>
            <Button variant="outlined" startIcon={<Grass />} onClick={() => navigate('/crop-planning')}>
              Add Field
            </Button>
            <Button variant="outlined" startIcon={<Assignment />} onClick={() => navigate('/tasks')}>
              Assign Task
            </Button>
          </Box>
        </Box>

      {/* Key Performance Indicators */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {kpis.map((kpi, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 2 }} key={index}>
            <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${kpi.color}15 0%, ${kpi.color}05 100%)` }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {kpi.label}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: kpi.color }}>
                      {kpi.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: `${kpi.color}20`, color: kpi.color, width: 48, height: 48 }}>
                    {kpi.icon}
                  </Avatar>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {kpi.change > 0 ? (
                    <TrendingUp sx={{ fontSize: 16, color: 'success.main' }} />
                  ) : kpi.change < 0 ? (
                    <TrendingDown sx={{ fontSize: 16, color: 'error.main' }} />
                  ) : null}
                  <Typography variant="caption" color={kpi.change > 0 ? 'success.main' : kpi.change < 0 ? 'error.main' : 'text.secondary'}>
                    {kpi.change > 0 ? '+' : ''}{kpi.change}% vs last month
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Critical Alerts */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge badgeContent={alerts.filter(a => a.type === 'critical').length} color="error">
                <Notifications sx={{ fontSize: 28 }} />
              </Badge>
              <Typography variant="h6">Critical Alerts & Notifications</Typography>
            </Box>
            <Button size="small" onClick={() => navigate('/notifications')}>
              View All
            </Button>
          </Box>
          <List>
            {alerts.slice(0, 4).map((alert, index) => (
              <React.Fragment key={alert.id}>
                <ListItem
                  sx={{
                    bgcolor: alert.type === 'critical' ? 'error.light' : alert.type === 'warning' ? 'warning.light' : 'info.light',
                    borderRadius: 1,
                    mb: 1,
                    py: 1.5,
                  }}
                  secondaryAction={
                    alert.action && (
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => alert.link && navigate(alert.link)}
                      >
                        {alert.action}
                      </Button>
                    )
                  }
                >
                  <ListItemIcon>
                    <Warning sx={{ color: alert.type === 'critical' ? 'error.main' : alert.type === 'warning' ? 'warning.main' : 'info.main' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip label={alert.category} size="small" />
                        <Typography variant="subtitle2">{alert.message}</Typography>
                      </Box>
                    }
                    secondary={alert.time}
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Livestock Overview */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Livestock Overview</Typography>
                <IconButton onClick={() => navigate('/animals')}>
                  <ArrowForward />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                {livestockStats.map((stat, index) => (
                  <Grid size={{ xs: 6 }} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: stat.status === 'critical' ? 'error.light' : stat.status === 'warning' ? 'warning.light' : 'success.light',
                      }}
                    >
                      {stat.icon}
                      <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Health Alerts:</strong> 2 animals require attention
                  </Typography>
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Crop Fields Status */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Crop Fields Status</Typography>
                <IconButton onClick={() => navigate('/crop-planning')}>
                  <ArrowForward />
                </IconButton>
              </Box>
              <Grid container spacing={2}>
                {cropStats.map((stat, index) => (
                  <Grid size={{ xs: 6 }} key={index}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        bgcolor: stat.status === 'critical' ? 'error.light' : stat.status === 'warning' ? 'warning.light' : 'success.light',
                      }}
                    >
                      {stat.icon}
                      <Typography variant="h5" sx={{ fontWeight: 600, mt: 1 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {stat.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Alert severity="warning">
                  <Typography variant="body2">
                    <strong>Irrigation:</strong> 2 fields need watering today
                  </Typography>
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Today's Tasks */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Today's Tasks</Typography>
                <Chip label={`${todaysTasks.filter(t => t.status === 'completed').length}/${todaysTasks.length} Completed`} color="primary" size="small" />
              </Box>
              <List dense>
                {todaysTasks.map((task) => (
                  <ListItem
                    key={task.id}
                    sx={{
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      mb: 1,
                    }}
                  >
                    <ListItemIcon>
                      {task.status === 'completed' ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Assignment color={task.status === 'in-progress' ? 'info' : 'disabled'} />
                      )}
                    </ListItemIcon>
                    <ListItemText
                      primary={task.task}
                      secondary={`${task.assignedTo} • ${task.time}`}
                    />
                    <Chip label={task.status} size="small" color={getStatusColor(task.status)} />
                  </ListItem>
                ))}
              </List>
              <Button fullWidth variant="outlined" onClick={() => navigate('/tasks')} sx={{ mt: 1 }}>
                View All Tasks
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Weather & Environmental */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Weather & Environment</Typography>
                <Cloud sx={{ fontSize: 32, color: 'info.main' }} />
              </Box>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h1" sx={{ fontWeight: 300 }}>
                  {weatherData.temperature}°C
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {weatherData.condition}
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                    <WaterDrop color="primary" />
                    <Typography variant="body2">Humidity</Typography>
                    <Typography variant="h6">{weatherData.humidity}%</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                    <Speed color="primary" />
                    <Typography variant="body2">Wind Speed</Typography>
                    <Typography variant="h6">{weatherData.windSpeed} km/h</Typography>
                  </Paper>
                </Grid>
              </Grid>
              <Alert severity="info" sx={{ mt: 2 }}>
                {weatherData.forecast}
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Stock Levels */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Stock Levels Overview</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Dairy Meal</Typography>
                      <Typography variant="body2" fontWeight={600}>85%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={85} color="success" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Broiler Feed</Typography>
                      <Typography variant="body2" fontWeight={600} color="warning.main">35%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={35} color="warning" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Fertilizer</Typography>
                      <Typography variant="body2" fontWeight={600}>92%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={92} color="success" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">Medicines</Typography>
                      <Typography variant="body2" fontWeight={600}>68%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={68} color="info" sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                </Grid>
              </Grid>
              <Button fullWidth variant="outlined" onClick={() => navigate('/inventory')} sx={{ mt: 2 }}>
                View Full Inventory
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManagerHomeDashboard;
