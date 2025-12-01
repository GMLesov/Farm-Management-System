import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  Agriculture,
  WaterDrop,
  AttachMoney,
  Cloud,
  Thermostat,
  Opacity,
  Speed,
  Warning,
  CheckCircle,
  Error,
  Info,
  Refresh,
  MoreVert,
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
} from 'recharts';

const MainDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Sample data - in real app, this would come from your services
  const farmOverviewData = {
    totalCrops: 23,
    activeTasks: 156,
    completedTasks: 145,
    totalRevenue: 87500,
    monthlyGrowth: 12.5,
    waterUsage: 15420,
    weatherCondition: 'Partly Cloudy',
    temperature: 24,
    humidity: 68,
    soilMoisture: 72,
    alerts: 3,
  };

  const monthlyTrendsData = [
    { month: 'Jan', revenue: 65000, expenses: 45000, crops: 18, yield: 2400 },
    { month: 'Feb', revenue: 71000, expenses: 48000, crops: 20, yield: 2600 },
    { month: 'Mar', revenue: 68000, expenses: 46000, crops: 19, yield: 2500 },
    { month: 'Apr', revenue: 74000, expenses: 51000, crops: 22, yield: 2800 },
    { month: 'May', revenue: 82000, expenses: 55000, crops: 23, yield: 3100 },
    { month: 'Jun', revenue: 87500, expenses: 58000, crops: 23, yield: 3200 },
  ];

  const cropDistributionData = [
    { name: 'Wheat', value: 35, color: '#FFD700' },
    { name: 'Corn', value: 25, color: '#32CD32' },
    { name: 'Soybeans', value: 20, color: '#8FBC8F' },
    { name: 'Barley', value: 12, color: '#DEB887' },
    { name: 'Others', value: 8, color: '#D3D3D3' },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'irrigation',
      message: 'Irrigation system activated for Field A',
      time: '10 minutes ago',
      icon: <WaterDrop color="primary" />,
      severity: 'info',
    },
    {
      id: 2,
      type: 'harvest',
      message: 'Wheat harvest completed in Field C',
      time: '2 hours ago',
      icon: <Agriculture color="success" />,
      severity: 'success',
    },
    {
      id: 3,
      type: 'alert',
      message: 'Low soil moisture detected in Field B',
      time: 'Just now',
      icon: <Warning color="warning" />,
      severity: 'error',
    },
    {
      id: 4,
      type: 'financial',
      message: 'Monthly revenue target achieved',
      time: '1 day ago',
      icon: <AttachMoney color="success" />,
      severity: 'success',
    },
  ];

  const systemStatus = [
    { name: 'Irrigation System', status: 'operational', uptime: '99.2%' },
    { name: 'Weather Monitoring', status: 'operational', uptime: '98.7%' },
    { name: 'Crop Sensors', status: 'warning', uptime: '95.1%' },
    { name: 'Financial Tracking', status: 'operational', uptime: '100%' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle color="success" />;
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Error color="error" />;
      default:
        return <Info color="info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'info';
    }
  };

  return (
    <Box sx={{ p: 3 }}>

      {/* Alert Banner */}
      {farmOverviewData.alerts > 0 && (
        <Alert 
          severity="warning" 
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/notifications?view=alerts')}>
              View All Alerts
            </Button>
          }
          sx={{ mb: 3 }}
        >
          You have {farmOverviewData.alerts} active alerts that require attention
        </Alert>
      )}

      {/* KPI Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Card sx={{ minWidth: 250, flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Total Crops
                </Typography>
                <Typography variant="h3" component="div" color="success.main">
                  {farmOverviewData.totalCrops}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUp sx={{ color: 'success.main', mr: 0.5 }} fontSize="small" />
                  <Typography variant="body2" color="success.main">
                    +2 this month
                  </Typography>
                </Box>
              </Box>
              <Agriculture sx={{ fontSize: 40, color: 'success.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 250, flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Monthly Revenue
                </Typography>
                <Typography variant="h3" component="div" color="warning.main">
                  ${(farmOverviewData.totalRevenue / 1000).toFixed(0)}k
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUp sx={{ color: 'success.main', mr: 0.5 }} fontSize="small" />
                  <Typography variant="body2" color="success.main">
                    +{farmOverviewData.monthlyGrowth}%
                  </Typography>
                </Box>
              </Box>
              <AttachMoney sx={{ fontSize: 40, color: 'warning.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 250, flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Task Completion
                </Typography>
                <Typography variant="h3" component="div" color="info.main">
                  {Math.round((farmOverviewData.completedTasks / farmOverviewData.activeTasks) * 100)}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {farmOverviewData.completedTasks}/{farmOverviewData.activeTasks} completed
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(farmOverviewData.completedTasks / farmOverviewData.activeTasks) * 100}
                  sx={{ mt: 1 }}
                />
              </Box>
              <Speed sx={{ fontSize: 40, color: 'info.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ minWidth: 250, flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom variant="body2">
                  Water Usage
                </Typography>
                <Typography variant="h3" component="div" color="primary.main">
                  {(farmOverviewData.waterUsage / 1000).toFixed(1)}k
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Liters today
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                  15% below target
                </Typography>
              </Box>
              <WaterDrop sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Charts Row */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 3, height: 400, flex: 2, minWidth: 400 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="div">
              Monthly Performance Trends
            </Typography>
            <IconButton size="small">
              <MoreVert />
            </IconButton>
          </Box>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                typeof name === 'string' && (name === 'revenue' || name === 'expenses') ? `$${value}` : value,
                typeof name === 'string' ? name.charAt(0).toUpperCase() + name.slice(1) : name
              ]} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#FF9800" strokeWidth={3} />
              <Line type="monotone" dataKey="expenses" stroke="#F44336" strokeWidth={3} />
              <Line type="monotone" dataKey="yield" stroke="#4CAF50" strokeWidth={3} yAxisId="right" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        <Paper sx={{ p: 3, height: 400, flex: 1, minWidth: 300 }}>
          <Typography variant="h6" component="div" sx={{ mb: 2 }}>
            Crop Distribution
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={cropDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {cropDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* Bottom Row */}
      <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 3, flex: 1, minWidth: 400 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" component="div">
              Recent Activities
            </Typography>
            <Button size="small" endIcon={<Refresh />}>
              Refresh
            </Button>
          </Box>
          <List>
            {recentActivities.map((activity, index) => (
              <React.Fragment key={activity.id}>
                <ListItem>
                  <ListItemIcon>
                    {activity.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={activity.message}
                    secondary={activity.time}
                  />
                  <Chip 
                    label={activity.type} 
                    size="small" 
                    color={getStatusColor(activity.severity) as any}
                    variant="outlined"
                  />
                </ListItem>
                {index < recentActivities.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>

        <Paper sx={{ p: 3, flex: 1, minWidth: 400 }}>
          <Typography variant="h6" component="div" sx={{ mb: 2 }}>
            System Status
          </Typography>
          <List>
            {systemStatus.map((system, index) => (
              <React.Fragment key={system.name}>
                <ListItem>
                  <ListItemIcon>
                    {getStatusIcon(system.status)}
                  </ListItemIcon>
                  <ListItemText
                    primary={system.name}
                    secondary={`Uptime: ${system.uptime}`}
                  />
                  <Chip 
                    label={system.status} 
                    size="small" 
                    color={getStatusColor(system.status) as any}
                  />
                </ListItem>
                {index < systemStatus.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" component="div" sx={{ mb: 2 }}>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            startIcon={<Agriculture />}
            onClick={() => navigate('/crops')}
            sx={{ flex: '1 1 200px' }}
          >
            Manage Crops
          </Button>
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<AttachMoney />}
            onClick={() => navigate('/financial')}
            sx={{ flex: '1 1 200px' }}
          >
            Add Transaction
          </Button>
          <Button 
            variant="contained" 
            color="success"
            startIcon={<WaterDrop />}
            onClick={() => navigate('/equipment')}
            sx={{ flex: '1 1 200px' }}
          >
            Irrigation Control
          </Button>
          <Button 
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
            sx={{ flex: '1 1 200px' }}
          >
            Refresh Data
          </Button>
        </Box>
      </Paper>

      {/* Environmental Conditions Card */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" component="div" sx={{ mb: 2 }}>
          Current Environmental Conditions
        </Typography>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Cloud sx={{ mr: 2, color: 'info.main' }} />
            <Box>
              <Typography variant="body2" color="textSecondary">
                Weather
              </Typography>
              <Typography variant="h6">
                {farmOverviewData.weatherCondition}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Thermostat sx={{ mr: 2, color: 'warning.main' }} />
            <Box>
              <Typography variant="body2" color="textSecondary">
                Temperature
              </Typography>
              <Typography variant="h6">
                {farmOverviewData.temperature}°C
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Opacity sx={{ mr: 2, color: 'primary.main' }} />
            <Box>
              <Typography variant="body2" color="textSecondary">
                Humidity
              </Typography>
              <Typography variant="h6">
                {farmOverviewData.humidity}%
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WaterDrop sx={{ mr: 2, color: 'success.main' }} />
            <Box>
              <Typography variant="body2" color="textSecondary">
                Soil Moisture
              </Typography>
              <Typography variant="h6">
                {farmOverviewData.soilMoisture}%
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default MainDashboard;