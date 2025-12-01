import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Card,
  Text,
  Surface,
  Button,
  Chip,
  Badge,
  useTheme,
  Portal,
  Modal,
  List,
  ProgressBar,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import EnhancedWeatherService, {
  EnhancedWeatherData,
  AdvancedFarmingRecommendation,
  AgriculturalIndices,
  WeatherAlert,
} from '../services/EnhancedWeatherService';

const { width } = Dimensions.get('window');

interface EnhancedWeatherDashboardProps {
  farmProfile: {
    crops: string[];
    animals: string[];
    farmSize: number;
    irrigationSystem: string;
    location: string;
  };
  latitude?: number;
  longitude?: number;
}

const EnhancedWeatherDashboard: React.FC<EnhancedWeatherDashboardProps> = ({
  farmProfile,
  latitude = 40.7128,
  longitude = -74.0060,
}) => {
  const theme = useTheme();
  const [weatherData, setWeatherData] = useState<EnhancedWeatherData | null>(null);
  const [recommendations, setRecommendations] = useState<AdvancedFarmingRecommendation[]>([]);
  const [agriculturalIndices, setAgriculturalIndices] = useState<AgriculturalIndices | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState<AdvancedFarmingRecommendation | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadWeatherData();
  }, [latitude, longitude]);

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      const data = await EnhancedWeatherService.getEnhancedWeatherData(latitude, longitude);
      const recs = EnhancedWeatherService.generateAdvancedRecommendations(data, farmProfile);
      const indices = EnhancedWeatherService.calculateAgriculturalIndices(data);
      
      setWeatherData(data);
      setRecommendations(recs);
      setAgriculturalIndices(indices);
    } catch (error) {
      Alert.alert('Error', 'Failed to load weather data. Please try again.');
      console.error('Weather data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadWeatherData();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return theme.colors.error;
      case 'high': return theme.colors.primary;
      case 'medium': return theme.colors.tertiary;
      case 'low': return theme.colors.outline;
      default: return theme.colors.outline;
    }
  };

  const getIndexColor = (value: number) => {
    if (value >= 80) return theme.colors.primary;
    if (value >= 60) return '#4CAF50';
    if (value >= 40) return '#FF9800';
    return theme.colors.error;
  };

  const getIndexLabel = (value: number) => {
    if (value >= 80) return 'Excellent';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Fair';
    return 'Poor';
  };

  const showRecommendationDetails = (recommendation: AdvancedFarmingRecommendation) => {
    setSelectedRecommendation(recommendation);
    setModalVisible(true);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getWeatherIcon = (condition: string, size: number = 24) => {
    const iconMap: { [key: string]: string } = {
      'Clear': 'weather-sunny',
      'Partly cloudy': 'weather-partly-cloudy',
      'Cloudy': 'weather-cloudy',
      'Light rain': 'weather-rainy',
      'Rain': 'weather-pouring',
      'Thunderstorm': 'weather-lightning',
      'Snow': 'weather-snowy',
      'Fog': 'weather-fog',
    };
    return iconMap[condition] || 'weather-partly-cloudy';
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text variant="bodyLarge">Loading weather data...</Text>
      </View>
    );
  }

  if (!weatherData || !agriculturalIndices) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text variant="bodyLarge">Failed to load weather data</Text>
        <Button mode="contained" onPress={loadWeatherData} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Weather Alerts */}
        {weatherData.alerts.length > 0 && (
          <Card style={[styles.card, { backgroundColor: theme.colors.errorContainer }]}>
            <Card.Content>
              <View style={styles.alertHeader}>
                <Icon name="alert" size={24} color={theme.colors.error} />
                <Text variant="titleMedium" style={{ color: theme.colors.error, marginLeft: 8 }}>
                  Weather Alerts
                </Text>
              </View>
              {weatherData.alerts.map((alert) => (
                <View key={alert.id} style={styles.alertItem}>
                  <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                    {alert.title}
                  </Text>
                  <Text variant="bodySmall">{alert.description}</Text>
                  <View style={styles.alertMeta}>
                    <Chip mode="outlined" compact>
                      {alert.severity}
                    </Chip>
                    <Text variant="bodySmall">
                      {formatTime(alert.startTime)} - {formatTime(alert.endTime)}
                    </Text>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}

        {/* Current Weather */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.currentWeatherHeader}>
              <View>
                <Text variant="headlineMedium">{Math.round(weatherData.current.temperature)}°C</Text>
                <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                  Feels like {Math.round(weatherData.current.feelsLike)}°C
                </Text>
                <Text variant="bodySmall">{weatherData.current.condition}</Text>
              </View>
              <Icon 
                name={getWeatherIcon(weatherData.current.condition)} 
                size={64} 
                color={theme.colors.primary} 
              />
            </View>

            <View style={styles.weatherGrid}>
              <WeatherMetric
                icon="water-percent"
                label="Humidity"
                value={`${Math.round(weatherData.current.humidity)}%`}
              />
              <WeatherMetric
                icon="weather-windy"
                label="Wind"
                value={`${Math.round(weatherData.current.windSpeed)} km/h`}
              />
              <WeatherMetric
                icon="gauge"
                label="Pressure"
                value={`${Math.round(weatherData.current.pressure)} hPa`}
              />
              <WeatherMetric
                icon="weather-sunny"
                label="UV Index"
                value={Math.round(weatherData.current.uvIndex).toString()}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Agricultural Indices */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Agricultural Conditions
            </Text>
            <View style={styles.indicesGrid}>
              <IndexItem
                label="Planting"
                value={agriculturalIndices.plantingIndex}
                icon="seed"
              />
              <IndexItem
                label="Harvesting"
                value={agriculturalIndices.harvestingIndex}
                icon="wheat"
              />
              <IndexItem
                label="Spraying"
                value={agriculturalIndices.sprayingIndex}
                icon="spray"
              />
              <IndexItem
                label="Field Work"
                value={agriculturalIndices.fieldWorkIndex}
                icon="tractor"
              />
              <IndexItem
                label="Livestock"
                value={agriculturalIndices.livestockComfortIndex}
                icon="cow"
              />
              <IndexItem
                label="Disease Risk"
                value={100 - agriculturalIndices.diseaseRiskIndex}
                icon="leaf"
                inverted
              />
            </View>
          </Card.Content>
        </Card>

        {/* Soil & Agriculture Data */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Soil Conditions
            </Text>
            <View style={styles.soilGrid}>
              <SoilMetric
                label="Soil Temperature"
                value={`${Math.round(weatherData.agriculture.soilTemperature)}°C`}
                icon="thermometer"
              />
              <SoilMetric
                label="Soil Moisture"
                value={`${Math.round(weatherData.agriculture.soilMoisture)}%`}
                icon="water"
              />
              <SoilMetric
                label="Evapotranspiration"
                value={`${weatherData.agriculture.evapotranspiration.toFixed(1)} mm`}
                icon="weather-fog"
              />
              <SoilMetric
                label="Growing Degree Days"
                value={Math.round(weatherData.agriculture.growingDegreeDays).toString()}
                icon="trending-up"
              />
            </View>
          </Card.Content>
        </Card>

        {/* Recommendations */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.recommendationsHeader}>
              <Text variant="titleMedium">Smart Recommendations</Text>
              <Badge>{recommendations.length}</Badge>
            </View>
            
            {recommendations.length === 0 ? (
              <Text variant="bodyMedium" style={{ textAlign: 'center', marginTop: 16 }}>
                No specific recommendations at this time. Conditions are stable.
              </Text>
            ) : (
              recommendations.map((rec) => (
                <Surface 
                  key={rec.id} 
                  style={[styles.recommendationCard, { borderLeftColor: getPriorityColor(rec.priority) }]}
                  elevation={1}
                >
                  <View style={styles.recommendationHeader}>
                    <View style={styles.recommendationTitle}>
                      <Icon name={getRecommendationIcon(rec.type)} size={20} color={getPriorityColor(rec.priority)} />
                      <Text variant="bodyMedium" style={{ fontWeight: 'bold', marginLeft: 8 }}>
                        {rec.title}
                      </Text>
                    </View>
                    <View style={styles.recommendationMeta}>
                      <Chip 
                        mode="outlined" 
                        compact 
                        style={{ backgroundColor: getPriorityColor(rec.priority) + '20' }}
                      >
                        {rec.priority}
                      </Chip>
                      <Text variant="bodySmall">{rec.confidence}% confident</Text>
                    </View>
                  </View>
                  
                  <Text variant="bodySmall" style={styles.recommendationDescription}>
                    {rec.description}
                  </Text>
                  
                  <View style={styles.recommendationFooter}>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {rec.timing}
                    </Text>
                    <Button 
                      mode="text" 
                      compact 
                      onPress={() => showRecommendationDetails(rec)}
                    >
                      Details
                    </Button>
                  </View>
                </Surface>
              ))
            )}
          </Card.Content>
        </Card>

        {/* 7-Day Forecast */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              7-Day Forecast
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.forecastContainer}>
                {weatherData.forecast.daily.map((day, index) => (
                  <View key={index} style={styles.forecastDay}>
                    <Text variant="bodySmall">{formatDate(new Date(day.date).getTime())}</Text>
                    <Icon 
                      name={getWeatherIcon(day.condition)} 
                      size={32} 
                      color={theme.colors.primary} 
                      style={styles.forecastIcon}
                    />
                    <Text variant="bodySmall" style={{ fontWeight: 'bold' }}>
                      {Math.round(day.temperature.max)}°
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {Math.round(day.temperature.min)}°
                    </Text>
                    <View style={styles.precipitationInfo}>
                      <Icon name="water" size={12} color={theme.colors.primary} />
                      <Text variant="bodySmall">{Math.round(day.precipitationProbability)}%</Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Recommendation Details Modal */}
      <Portal>
        <Modal 
          visible={modalVisible} 
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedRecommendation && (
            <Card>
              <Card.Content>
                <View style={styles.modalHeader}>
                  <Icon 
                    name={getRecommendationIcon(selectedRecommendation.type)} 
                    size={24} 
                    color={getPriorityColor(selectedRecommendation.priority)} 
                  />
                  <Text variant="titleMedium" style={{ marginLeft: 8 }}>
                    {selectedRecommendation.title}
                  </Text>
                </View>

                <Text variant="bodyMedium" style={styles.modalDescription}>
                  {selectedRecommendation.description}
                </Text>

                <Text variant="bodySmall" style={styles.modalReasoning}>
                  <Text style={{ fontWeight: 'bold' }}>Reasoning: </Text>
                  {selectedRecommendation.reasoning}
                </Text>

                <View style={styles.modalSection}>
                  <Text variant="titleSmall">Actions Required:</Text>
                  {selectedRecommendation.actions.map((action, index) => (
                    <View key={index} style={styles.actionItem}>
                      <Icon name="chevron-right" size={16} color={theme.colors.primary} />
                      <Text variant="bodySmall" style={{ flex: 1, marginLeft: 4 }}>
                        {action}
                      </Text>
                    </View>
                  ))}
                </View>

                {selectedRecommendation.estimatedCost && (
                  <View style={styles.modalSection}>
                    <Text variant="titleSmall">Estimated Cost: ${selectedRecommendation.estimatedCost}</Text>
                    {selectedRecommendation.expectedBenefit && (
                      <Text variant="bodySmall">Expected Benefit: {selectedRecommendation.expectedBenefit}</Text>
                    )}
                  </View>
                )}

                <View style={styles.modalFooter}>
                  <Button mode="outlined" onPress={() => setModalVisible(false)}>
                    Close
                  </Button>
                  <Button mode="contained" onPress={() => {
                    // TODO: Implement action tracking
                    setModalVisible(false);
                    Alert.alert('Action Logged', 'Recommendation has been logged for tracking.');
                  }}>
                    Mark as Done
                  </Button>
                </View>
              </Card.Content>
            </Card>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

// Helper Components
const WeatherMetric: React.FC<{ icon: string; label: string; value: string }> = ({ icon, label, value }) => {
  const theme = useTheme();
  return (
    <View style={styles.weatherMetric}>
      <Icon name={icon} size={20} color={theme.colors.primary} />
      <Text variant="bodySmall" style={styles.metricLabel}>{label}</Text>
      <Text variant="bodyMedium" style={styles.metricValue}>{value}</Text>
    </View>
  );
};

const IndexItem: React.FC<{ label: string; value: number; icon: string; inverted?: boolean }> = ({ 
  label, 
  value, 
  icon, 
  inverted = false 
}) => {
  const theme = useTheme();
  const displayValue = inverted ? 100 - value : value;
  
  return (
    <View style={styles.indexItem}>
      <Icon name={icon} size={20} color={getIndexColor(displayValue)} />
      <Text variant="bodySmall" style={styles.indexLabel}>{label}</Text>
      <ProgressBar 
        progress={displayValue / 100} 
        color={getIndexColor(displayValue)} 
        style={styles.indexProgress}
      />
      <Text variant="bodySmall" style={[styles.indexValue, { color: getIndexColor(displayValue) }]}>
        {getIndexLabel(displayValue)}
      </Text>
    </View>
  );
};

const SoilMetric: React.FC<{ label: string; value: string; icon: string }> = ({ label, value, icon }) => {
  const theme = useTheme();
  return (
    <View style={styles.soilMetric}>
      <Icon name={icon} size={18} color={theme.colors.secondary} />
      <Text variant="bodySmall" style={styles.soilLabel}>{label}</Text>
      <Text variant="bodyMedium" style={styles.soilValue}>{value}</Text>
    </View>
  );
};

const getRecommendationIcon = (type: string) => {
  const iconMap: { [key: string]: string } = {
    irrigation: 'water',
    planting: 'seed',
    harvesting: 'wheat',
    pest_control: 'bug',
    fertilizer: 'leaf',
    protection: 'shield',
    general: 'information',
  };
  return iconMap[type] || 'information';
};

const getIndexColor = (value: number) => {
  if (value >= 80) return '#4CAF50';
  if (value >= 60) return '#8BC34A';
  if (value >= 40) return '#FF9800';
  return '#F44336';
};

const getIndexLabel = (value: number) => {
  if (value >= 80) return 'Excellent';
  if (value >= 60) return 'Good';
  if (value >= 40) return 'Fair';
  return 'Poor';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    marginTop: 16,
  },
  card: {
    margin: 8,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  
  // Current Weather
  currentWeatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weatherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  weatherMetric: {
    width: '48%',
    alignItems: 'center',
    padding: 8,
    marginBottom: 8,
  },
  metricLabel: {
    marginTop: 4,
    color: '#666',
  },
  metricValue: {
    fontWeight: 'bold',
    marginTop: 2,
  },

  // Agricultural Indices
  indicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  indexItem: {
    width: '48%',
    padding: 8,
    marginBottom: 12,
  },
  indexLabel: {
    marginTop: 4,
    marginBottom: 4,
  },
  indexProgress: {
    height: 4,
    marginBottom: 4,
  },
  indexValue: {
    fontWeight: 'bold',
    fontSize: 12,
  },

  // Soil Conditions
  soilGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  soilMetric: {
    width: '48%',
    alignItems: 'center',
    padding: 8,
    marginBottom: 8,
  },
  soilLabel: {
    marginTop: 4,
    textAlign: 'center',
    color: '#666',
  },
  soilValue: {
    fontWeight: 'bold',
    marginTop: 2,
  },

  // Alerts
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertItem: {
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  alertMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },

  // Recommendations
  recommendationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recommendationCard: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recommendationMeta: {
    alignItems: 'flex-end',
  },
  recommendationDescription: {
    marginBottom: 8,
    lineHeight: 18,
  },
  recommendationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Forecast
  forecastContainer: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  forecastDay: {
    alignItems: 'center',
    marginRight: 16,
    minWidth: 70,
  },
  forecastIcon: {
    marginVertical: 8,
  },
  precipitationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  // Modal
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalDescription: {
    marginBottom: 12,
    lineHeight: 20,
  },
  modalReasoning: {
    marginBottom: 16,
    fontStyle: 'italic',
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 4,
  },
  modalSection: {
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});

export default EnhancedWeatherDashboard;