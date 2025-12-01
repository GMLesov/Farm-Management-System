import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  AlertTitle,
  Chip,
  Button,
  Box,
  Divider,
  IconButton,
  Collapse
} from '@mui/material';
import {
  Cloud as WeatherIcon,
  Warning as WarningIcon,
  WbSunny as SunnyIcon,
  CloudQueue as CloudyIcon,
  Thunderstorm as StormIcon,
  AcUnit as SnowIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

interface WeatherAlert {
  taskId: string;
  taskTitle: string;
  scheduledDate: string;
  weather: {
    temperature: number;
    condition: string;
    precipitation: number;
    windSpeed: number;
  };
  issue: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

const WeatherAlertsWidget: React.FC = () => {
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherAlerts();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeatherAlerts, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeatherAlerts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks/weather/alerts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error('Failed to fetch weather alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <SunnyIcon sx={{ color: '#FDB813' }} />;
      case 'cloudy':
        return <CloudyIcon sx={{ color: '#9E9E9E' }} />;
      case 'rainy':
        return <WeatherIcon sx={{ color: '#2196F3' }} />;
      case 'stormy':
        return <StormIcon sx={{ color: '#FF5722' }} />;
      case 'snowy':
        return <SnowIcon sx={{ color: '#00BCD4' }} />;
      default:
        return <WeatherIcon />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const handleExpandClick = (taskId: string) => {
    setExpanded(expanded === taskId ? null : taskId);
  };

  const handleReschedule = (taskId: string) => {
    // Navigate to task edit page or open reschedule dialog
    window.location.href = `/admin/tasks/${taskId}/edit`;
  };

  if (alerts.length === 0 && !loading) {
    return (
      <Card>
        <CardHeader
          avatar={<SunnyIcon color="success" />}
          title="Weather Alerts"
          subheader="No weather concerns for upcoming tasks"
        />
        <CardContent>
          <Alert severity="success">
            <AlertTitle>All Clear</AlertTitle>
            All scheduled tasks have favorable weather conditions. Great time to get work done!
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        avatar={<WeatherIcon color="primary" />}
        title="Weather Alerts"
        subheader={`${alerts.length} task${alerts.length !== 1 ? 's' : ''} with weather concerns`}
        action={
          <Button size="small" onClick={fetchWeatherAlerts} disabled={loading}>
            Refresh
          </Button>
        }
      />

      <CardContent>
        <List>
          {alerts.map((alert, index) => (
            <React.Fragment key={alert.taskId}>
              {index > 0 && <Divider sx={{ my: 2 }} />}

              <ListItem
                sx={{
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  p: 2,
                  bgcolor: alert.severity === 'critical' ? 'error.light' : 'background.paper',
                  borderRadius: 1,
                  border: 1,
                  borderColor: alert.severity === 'critical' ? 'error.main' : 'divider'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    {getWeatherIcon(alert.weather.condition)}
                  </ListItemIcon>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {alert.taskTitle}
                      </Typography>
                      <Chip
                        label={alert.severity.toUpperCase()}
                        color={getSeverityColor(alert.severity) as any}
                        size="small"
                        icon={<WarningIcon />}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                      <Chip
                        icon={<ScheduleIcon />}
                        label={new Date(alert.scheduledDate).toLocaleDateString()}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`${alert.weather.temperature}°C`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={alert.weather.condition}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`${alert.weather.precipitation}% rain`}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`${alert.weather.windSpeed} km/h wind`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    <Alert severity={getSeverityColor(alert.severity) as any} sx={{ mt: 1 }}>
                      <AlertTitle>Weather Concerns</AlertTitle>
                      <List dense>
                        {alert.issue.map((issue, idx) => (
                          <ListItem key={idx} sx={{ py: 0 }}>
                            <ListItemText
                              primary={`• ${issue}`}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Alert>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleExpandClick(alert.taskId)}
                      sx={{
                        transform: expanded === alert.taskId ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: '0.3s'
                      }}
                    >
                      <ExpandMoreIcon />
                    </IconButton>
                    <Button
                      variant="contained"
                      size="small"
                      color={alert.severity === 'critical' ? 'error' : 'warning'}
                      onClick={() => handleReschedule(alert.taskId)}
                    >
                      Reschedule
                    </Button>
                  </Box>
                </Box>

                <Collapse in={expanded === alert.taskId} timeout="auto" unmountOnExit>
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      💡 Recommendation:
                    </Typography>
                    <Typography variant="body2">
                      {alert.recommendation}
                    </Typography>
                  </Box>
                </Collapse>
              </ListItem>
            </React.Fragment>
          ))}
        </List>

        <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            🌤️ Weather alerts are updated every 30 minutes. Click "Reschedule" to find better dates
            for weather-sensitive tasks.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default WeatherAlertsWidget;
