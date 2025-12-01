import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import {
  Cloud,
  WbSunny,
  Opacity,
  Air,
  Thermostat,
  Visibility,
  Speed,
  Warning,
  Umbrella,
  CloudQueue,
  Refresh,
  LocationOn,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';

const WeatherDashboard: React.FC = () => {
  const currentWeather = {
    temperature: 72,
    humidity: 65,
    windSpeed: 8.5,
    windDirection: 'NW',
    pressure: 30.12,
    visibility: 10,
    uvIndex: 6,
    condition: 'Partly Cloudy',
  };

  const forecast = [
    { date: '2025-11-03', high: 75, low: 58, condition: 'Sunny', precipitation: 0 },
    { date: '2025-11-04', high: 78, low: 62, condition: 'Partly Cloudy', precipitation: 10 },
    { date: '2025-11-05', high: 73, low: 55, condition: 'Rain', precipitation: 75 },
    { date: '2025-11-06', high: 69, low: 51, condition: 'Cloudy', precipitation: 25 },
    { date: '2025-11-07', high: 71, low: 53, condition: 'Sunny', precipitation: 5 },
  ];

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny': return <WbSunny />;
      case 'rain': return <Umbrella />;
      case 'cloudy': return <Cloud />;
      case 'partly cloudy': return <CloudQueue />;
      default: return <WbSunny />;
    }
  };

  const alerts = [
    { type: 'warning', message: 'Heavy rain expected tomorrow - consider irrigation scheduling' },
    { type: 'info', message: 'Ideal conditions for crop spraying this afternoon' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip icon={<LocationOn />} label="Farm Location: Johnson County, IA" />
          <IconButton color="primary">
            <Refresh />
          </IconButton>
        </Box>
      </Box>

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {alerts.map((alert, index) => (
            <Alert key={index} severity={alert.type as any} sx={{ mb: 1 }}>
              {alert.message}
            </Alert>
          ))}
        </Box>
      )}

      {/* Current Weather */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Card sx={{ minWidth: 300 }}>
          <CardContent>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Current Weather
              </Typography>
              <Box sx={{ fontSize: 48, color: 'primary.main', mb: 2 }}>
                {getWeatherIcon(currentWeather.condition)}
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
                Weather Dashboard
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
                Check current weather, forecasts, and farm location conditions.
              </Typography>
              <Typography variant="h2" gutterBottom>
                {currentWeather.temperature}°F
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {currentWeather.condition}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Last updated: {new Date().toLocaleTimeString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 400 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Weather Details
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ textAlign: 'center', p: 2, minWidth: 120 }}>
                <Opacity sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                <Typography variant="h6">{currentWeather.humidity}%</Typography>
                <Typography variant="body2" color="text.secondary">Humidity</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, minWidth: 120 }}>
                <Air sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                <Typography variant="h6">{currentWeather.windSpeed} mph</Typography>
                <Typography variant="body2" color="text.secondary">Wind {currentWeather.windDirection}</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, minWidth: 120 }}>
                <Speed sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                <Typography variant="h6">{currentWeather.pressure}"</Typography>
                <Typography variant="body2" color="text.secondary">Pressure</Typography>
              </Box>
              <Box sx={{ textAlign: 'center', p: 2, minWidth: 120 }}>
                <Visibility sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6">{currentWeather.visibility} mi</Typography>
                <Typography variant="body2" color="text.secondary">Visibility</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* 5-Day Forecast */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            5-Day Forecast
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 1 }}>
            {forecast.map((day, index) => (
              <Paper key={index} sx={{ p: 2, textAlign: 'center', minWidth: 140 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </Typography>
                <Box sx={{ fontSize: 32, color: 'primary.main', mb: 1 }}>
                  {getWeatherIcon(day.condition)}
                </Box>
                <Typography variant="body2" gutterBottom>
                  {day.condition}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="h6">{day.high}°</Typography>
                  <Typography variant="body2" color="text.secondary">/{day.low}°</Typography>
                </Box>
                <Chip
                  icon={<Umbrella />}
                  label={`${day.precipitation}%`}
                  size="small"
                  color={day.precipitation > 50 ? 'primary' : 'default'}
                />
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Agricultural Recommendations */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Agricultural Recommendations
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <WbSunny sx={{ color: 'warning.main' }} />
              </ListItemIcon>
              <ListItemText
                primary="Optimal spraying conditions"
                secondary="Low wind speeds and no rain forecast for next 6 hours"
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <Umbrella sx={{ color: 'primary.main' }} />
              </ListItemIcon>
              <ListItemText
                primary="Irrigation adjustment recommended"
                secondary="Rain expected tomorrow, reduce irrigation by 30%"
              />
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <Thermostat sx={{ color: 'error.main' }} />
              </ListItemIcon>
              <ListItemText
                primary="Frost warning"
                secondary="Temperatures may drop below 35°F on Nov 6th"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WeatherDashboard;