import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
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
  Chip,
  CircularProgress,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Refresh,
  LocationOn,
  Settings,
  WbSunny,
  Cloud,
  Grain,
  Air,
  Visibility,
  Thermostat,
  Water,
  Warning,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';

interface WeatherData {
  location: string;
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    pressure: number;
    visibility: number;
    uvIndex: number;
    condition: string;
    icon: string;
    feelsLike: number;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    humidity: number;
    precipitation: number;
    windSpeed: number;
    icon: string;
  }>;
  alerts: Array<{
    id: string;
    type: 'warning' | 'watch' | 'advisory';
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
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

const EnhancedWeatherDashboard: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('Farm Location, Rural County');
  const [newLocation, setNewLocation] = useState('');
  const [useMetric, setUseMetric] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Load weather data
  useEffect(() => {
    loadWeatherData();
  }, [currentLocation, useMetric]);

  const loadWeatherData = async () => {
    setLoading(true);
    try {
      // Simulate API call with sample data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const sampleData: WeatherData = {
        location: currentLocation,
        current: {
          temperature: useMetric ? 24 : 75,
          humidity: 68,
          windSpeed: useMetric ? 15 : 9.3,
          windDirection: 'NE',
          pressure: useMetric ? 1013 : 29.91,
          visibility: useMetric ? 10 : 6.2,
          uvIndex: 6,
          condition: 'Partly Cloudy',
          icon: 'partly-cloudy',
          feelsLike: useMetric ? 26 : 79,
        },
        forecast: [
          {
            date: 'Today',
            high: useMetric ? 26 : 79,
            low: useMetric ? 18 : 64,
            condition: 'Partly Cloudy',
            humidity: 65,
            precipitation: 10,
            windSpeed: useMetric ? 12 : 7.5,
            icon: 'partly-cloudy',
          },
          {
            date: 'Tomorrow',
            high: useMetric ? 28 : 82,
            low: useMetric ? 20 : 68,
            condition: 'Sunny',
            humidity: 60,
            precipitation: 0,
            windSpeed: useMetric ? 8 : 5,
            icon: 'sunny',
          },
          {
            date: 'Wednesday',
            high: useMetric ? 25 : 77,
            low: useMetric ? 17 : 63,
            condition: 'Light Rain',
            humidity: 75,
            precipitation: 60,
            windSpeed: useMetric ? 18 : 11,
            icon: 'rain',
          },
          {
            date: 'Thursday',
            high: useMetric ? 23 : 73,
            low: useMetric ? 15 : 59,
            condition: 'Cloudy',
            humidity: 70,
            precipitation: 20,
            windSpeed: useMetric ? 14 : 8.7,
            icon: 'cloudy',
          },
          {
            date: 'Friday',
            high: useMetric ? 27 : 81,
            low: useMetric ? 19 : 66,
            condition: 'Sunny',
            humidity: 55,
            precipitation: 5,
            windSpeed: useMetric ? 10 : 6.2,
            icon: 'sunny',
          },
        ],
        alerts: [
          {
            id: '1',
            type: 'advisory',
            title: 'Frost Advisory',
            description: 'Temperatures may drop below freezing tonight. Protect sensitive crops.',
            severity: 'medium',
          },
          {
            id: '2',
            type: 'watch',
            title: 'Irrigation Recommendation',
            description: 'Low precipitation expected. Consider increasing irrigation schedule.',
            severity: 'low',
          },
        ],
      };
      
      setWeatherData(sampleData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationChange = () => {
    if (newLocation.trim()) {
      setCurrentLocation(newLocation.trim());
      setLocationDialogOpen(false);
      setNewLocation('');
    }
  };

  const getTemperatureUnit = () => useMetric ? '°C' : '°F';
  const getWindSpeedUnit = () => useMetric ? 'km/h' : 'mph';
  const getPressureUnit = () => useMetric ? 'hPa' : 'inHg';
  const getVisibilityUnit = () => useMetric ? 'km' : 'mi';

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return <WbSunny sx={{ color: 'orange' }} />;
      case 'partly-cloudy': return <Cloud sx={{ color: 'gray' }} />;
      case 'cloudy': return <Cloud sx={{ color: 'darkgray' }} />;
      case 'rain': return <Grain sx={{ color: 'blue' }} />;
      default: return <WbSunny sx={{ color: 'orange' }} />;
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'info';
    }
  };

  const getAgriculturalRecommendations = () => {
    if (!weatherData) return [];
    
    const recommendations = [];
    const { current, forecast } = weatherData;
    
    if (current.temperature < (useMetric ? 5 : 41)) {
      recommendations.push({
        type: 'warning',
        title: 'Frost Protection',
        description: 'Protect sensitive plants from potential frost damage.',
      });
    }
    
    if (current.humidity > 80) {
      recommendations.push({
        type: 'warning',
        title: 'Disease Risk',
        description: 'High humidity increases fungal disease risk. Monitor crops closely.',
      });
    }
    
    if (forecast[0].precipitation < 20) {
      recommendations.push({
        type: 'info',
        title: 'Irrigation Needed',
        description: 'Low precipitation expected. Increase irrigation schedule.',
      });
    }
    
    if (current.windSpeed > (useMetric ? 25 : 15)) {
      recommendations.push({
        type: 'warning',
        title: 'High Winds',
        description: 'Strong winds may damage crops. Secure loose structures.',
      });
    }
    
    return recommendations;
  };

  if (!weatherData) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Weather Monitoring
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<LocationOn />}
            onClick={() => setLocationDialogOpen(true)}
          >
            Change Location
          </Button>
          <IconButton onClick={() => setSettingsDialogOpen(true)}>
            <Settings />
          </IconButton>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={loadWeatherData}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        {weatherData.location} • Last updated: {lastRefresh.toLocaleTimeString()}
      </Typography>

      {/* Current Weather */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Conditions
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 200 }}>
              {getWeatherIcon(weatherData.current.icon)}
              <Box>
                <Typography variant="h3">
                  {weatherData.current.temperature}{getTemperatureUnit()}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Feels like {weatherData.current.feelsLike}{getTemperatureUnit()}
                </Typography>
                <Typography variant="body2">
                  {weatherData.current.condition}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', flex: 2 }}>
              <Box sx={{ minWidth: 150 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Water sx={{ mr: 1, color: 'info.main' }} />
                  <Typography variant="body2">Humidity</Typography>
                </Box>
                <Typography variant="h6">{weatherData.current.humidity}%</Typography>
              </Box>

              <Box sx={{ minWidth: 150 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Air sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="body2">Wind</Typography>
                </Box>
                <Typography variant="h6">
                  {weatherData.current.windSpeed} {getWindSpeedUnit()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {weatherData.current.windDirection}
                </Typography>
              </Box>

              <Box sx={{ minWidth: 150 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Thermostat sx={{ mr: 1, color: 'warning.main' }} />
                  <Typography variant="body2">Pressure</Typography>
                </Box>
                <Typography variant="h6">
                  {weatherData.current.pressure} {getPressureUnit()}
                </Typography>
              </Box>

              <Box sx={{ minWidth: 150 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Visibility sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2">Visibility</Typography>
                </Box>
                <Typography variant="h6">
                  {weatherData.current.visibility} {getVisibilityUnit()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Weather Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab icon={<TrendingUp />} label="5-Day Forecast" />
            <Tab icon={<Warning />} label="Alerts & Warnings" />
            <Tab icon={<CheckCircle />} label="Agricultural Advice" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            5-Day Weather Forecast
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
            {weatherData.forecast.map((day, index) => (
              <Card key={index} sx={{ minWidth: 200, flex: '0 0 auto' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {day.date}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {getWeatherIcon(day.icon)}
                    <Box sx={{ ml: 2 }}>
                      <Typography variant="h5">
                        {day.high}{getTemperatureUnit()}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Low: {day.low}{getTemperatureUnit()}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" gutterBottom>
                    {day.condition}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Humidity:</Typography>
                      <Typography variant="body2">{day.humidity}%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Rain:</Typography>
                      <Typography variant="body2">{day.precipitation}%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Wind:</Typography>
                      <Typography variant="body2">{day.windSpeed} {getWindSpeedUnit()}</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Weather Alerts & Warnings
          </Typography>
          {weatherData.alerts.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {weatherData.alerts.map((alert) => (
                <Alert 
                  key={alert.id} 
                  severity={getAlertSeverityColor(alert.severity) as any}
                  sx={{ '& .MuiAlert-message': { width: '100%' } }}
                >
                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      {alert.title}
                    </Typography>
                    <Typography variant="body2">
                      {alert.description}
                    </Typography>
                    <Chip 
                      label={alert.type.toUpperCase()} 
                      size="small" 
                      sx={{ mt: 1 }}
                      color={getAlertSeverityColor(alert.severity) as any}
                    />
                  </Box>
                </Alert>
              ))}
            </Box>
          ) : (
            <Alert severity="success">
              No active weather alerts for your area.
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Agricultural Recommendations
          </Typography>
          {getAgriculturalRecommendations().map((rec, index) => (
            <Alert 
              key={index} 
              severity={rec.type as any} 
              sx={{ mb: 2, '& .MuiAlert-message': { width: '100%' } }}
            >
              <Typography variant="subtitle1" gutterBottom>
                {rec.title}
              </Typography>
              <Typography variant="body2">
                {rec.description}
              </Typography>
            </Alert>
          ))}
          
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Optimal Farming Conditions
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<CheckCircle />} 
                  label="Good for outdoor work" 
                  color="success" 
                  variant="outlined" 
                />
                <Chip 
                  icon={<TrendingUp />} 
                  label="Favorable growing conditions" 
                  color="primary" 
                  variant="outlined" 
                />
                <Chip 
                  icon={<Water />} 
                  label="Moderate irrigation needed" 
                  color="info" 
                  variant="outlined" 
                />
              </Box>
            </CardContent>
          </Card>
        </TabPanel>
      </Card>

      {/* Location Change Dialog */}
      <Dialog open={locationDialogOpen} onClose={() => setLocationDialogOpen(false)}>
        <DialogTitle>Change Weather Location</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Location"
            fullWidth
            variant="outlined"
            value={newLocation}
            onChange={(e) => setNewLocation(e.target.value)}
            placeholder="Enter city, state or coordinates"
            helperText="Enter location name, zip code, or coordinates (lat,lng)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLocationDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleLocationChange} variant="contained">
            Update Location
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)}>
        <DialogTitle>Weather Settings</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={useMetric}
                  onChange={(e) => setUseMetric(e.target.checked)}
                />
              }
              label="Use Metric System (°C, km/h, hPa)"
            />
            <Typography variant="body2" color="text.secondary">
              Toggle between metric and imperial units for temperature, wind speed, and pressure.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)} variant="contained">
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedWeatherDashboard;