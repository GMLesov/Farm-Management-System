import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Text, Chip, Button, ActivityIndicator } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import WeatherService, { WeatherData, FarmingRecommendation } from '../services/WeatherService';

interface WeatherWidgetProps {
  farmLocation?: string;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ farmLocation = 'Your Farm' }) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recommendations, setRecommendations] = useState<FarmingRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForecast, setShowForecast] = useState(false);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      const weatherData = await WeatherService.getCurrentWeather(farmLocation);
      const farmRecommendations = WeatherService.generateFarmingRecommendations(weatherData);
      
      setWeather(weatherData);
      setRecommendations(farmRecommendations);
    } catch (error) {
      console.error('Failed to load weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherData();
  }, [farmLocation]);

  if (loading) {
    return (
      <Card style={styles.card}>
        <Card.Content style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading weather data...</Text>
        </Card.Content>
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card style={styles.card}>
        <Card.Content>
          <Text>Unable to load weather data</Text>
          <Button onPress={loadWeatherData} mode="outlined" style={styles.retryButton}>
            Retry
          </Button>
        </Card.Content>
      </Card>
    );
  }

  return (
    <View>
      {/* Current Weather */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.title}>Weather Conditions</Title>
            <Button onPress={loadWeatherData} mode="text" compact>
              Refresh
            </Button>
          </View>
          
          <View style={styles.currentWeather}>
            <View style={styles.weatherMain}>
              <MaterialCommunityIcons 
                name={WeatherService.getWeatherIcon(weather.condition)} 
                size={48} 
                color="#4CAF50" 
              />
              <View style={styles.temperatureSection}>
                <Text style={styles.temperature}>{Math.round(weather.temperature)}°C</Text>
                <Text style={styles.condition}>{weather.description}</Text>
                <Text style={styles.location}>{weather.location}</Text>
              </View>
            </View>
            
            <View style={styles.weatherDetails}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="water-percent" size={16} color="#2196F3" />
                <Text style={styles.detailText}>Humidity: {Math.round(weather.humidity)}%</Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="weather-windy" size={16} color="#9C27B0" />
                <Text style={styles.detailText}>Wind: {Math.round(weather.windSpeed)} km/h</Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="white-balance-sunny" size={16} color="#FF9800" />
                <Text style={styles.detailText}>UV Index: {Math.round(weather.uvIndex)}</Text>
              </View>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons name="water" size={16} color="#4CAF50" />
                <Text style={styles.detailText}>Soil Moisture: {Math.round(weather.soilMoisture)}%</Text>
              </View>
            </View>
          </View>

          <Button 
            mode="outlined" 
            onPress={() => setShowForecast(!showForecast)}
            style={styles.forecastButton}
          >
            {showForecast ? 'Hide' : 'Show'} 5-Day Forecast
          </Button>

          {showForecast && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecast}>
              {weather.forecast.map((day, index) => (
                <View key={index} style={styles.forecastDay}>
                  <Text style={styles.forecastDate}>
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                  <MaterialCommunityIcons 
                    name={WeatherService.getWeatherIcon(day.condition)} 
                    size={24} 
                    color="#4CAF50" 
                  />
                  <Text style={styles.forecastTemp}>
                    {Math.round(day.high)}°/{Math.round(day.low)}°
                  </Text>
                  <Text style={styles.forecastRain}>
                    {Math.round(day.chanceOfRain)}%
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}
        </Card.Content>
      </Card>

      {/* Farming Recommendations */}
      {recommendations.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Weather-Based Recommendations</Title>
            <View style={styles.recommendations}>
              {recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendation}>
                  <View style={styles.recommendationHeader}>
                    <View style={styles.recommendationIcon}>
                      <MaterialCommunityIcons 
                        name={WeatherService.getRecommendationIcon(rec.type)} 
                        size={20} 
                        color={WeatherService.getPriorityColor(rec.priority)} 
                      />
                    </View>
                    <View style={styles.recommendationContent}>
                      <Text style={styles.recommendationTitle}>{rec.title}</Text>
                      <Chip 
                        mode="outlined" 
                        compact 
                        style={[
                          styles.priorityChip, 
                          { borderColor: WeatherService.getPriorityColor(rec.priority) }
                        ]}
                        textStyle={{ color: WeatherService.getPriorityColor(rec.priority) }}
                      >
                        {rec.priority.toUpperCase()}
                      </Chip>
                    </View>
                  </View>
                  <Text style={styles.recommendationMessage}>{rec.message}</Text>
                  {rec.action && (
                    <Text style={styles.recommendationAction}>
                      Action: {rec.action}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 8,
    borderRadius: 12,
    elevation: 3,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  retryButton: {
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  currentWeather: {
    marginBottom: 16,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  temperatureSection: {
    marginLeft: 16,
    flex: 1,
  },
  temperature: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  condition: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
  },
  location: {
    fontSize: 14,
    color: '#999',
  },
  weatherDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  forecastButton: {
    marginVertical: 8,
  },
  forecast: {
    marginTop: 16,
  },
  forecastDay: {
    alignItems: 'center',
    marginRight: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  forecastDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  forecastTemp: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  forecastRain: {
    fontSize: 10,
    color: '#2196F3',
    marginTop: 2,
  },
  recommendations: {
    marginTop: 8,
  },
  recommendation: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  recommendationContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  priorityChip: {
    height: 24,
  },
  recommendationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    lineHeight: 20,
  },
  recommendationAction: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '500',
    fontStyle: 'italic',
  },
});

export default WeatherWidget;