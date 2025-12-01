import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  Switch, 
  Divider, 
  List, 
  useTheme,
  Surface,
  Chip,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import EnhancedWeatherDashboard from '../../components/EnhancedWeatherDashboard';
import EnhancedWeatherService, { 
  EnhancedWeatherData, 
  AdvancedFarmingRecommendation 
} from '../../services/EnhancedWeatherService';

interface WeatherAnalyticsScreenProps {
  navigation: any;
}

const WeatherAnalyticsScreen: React.FC<WeatherAnalyticsScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  
  // Mock farm data - in production, this would come from user preferences/Redux
  const mockCrops = [
    { type: 'Corn', variety: 'Sweet Corn' },
    { type: 'Tomato', variety: 'Cherry' },
    { type: 'Wheat', variety: 'Winter Wheat' },
  ];
  
  const mockLivestock = [
    { type: 'Cattle', breed: 'Holstein' },
    { type: 'Chicken', breed: 'Rhode Island Red' },
  ];

  const [weatherEnabled, setWeatherEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoRecommendations, setAutoRecommendations] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState({
    latitude: 40.7128,
    longitude: -74.0060,
    name: 'Farm Location'
  });

  // Create farm profile from mock data
  const farmProfile = {
    crops: mockCrops.map((crop: any) => crop.type),
    animals: mockLivestock.map((animal: any) => animal.type),
    farmSize: 100, // hectares - could be stored in user preferences
    irrigationSystem: 'drip', // could be stored in user preferences
    location: selectedLocation.name,
  };

  const handleLocationSelect = () => {
    // TODO: Implement location picker
    Alert.alert(
      'Location Selection',
      'Location picker will be implemented to allow selecting farm coordinates.',
      [{ text: 'OK' }]
    );
  };

  const handleExportReport = async () => {
    try {
      // TODO: Implement weather report export
      Alert.alert(
        'Export Weather Report',
        'Weather analytics report export functionality will be implemented.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export weather report.');
    }
  };

  const handleSetupAlerts = () => {
    // TODO: Navigate to weather alerts configuration
    Alert.alert(
      'Weather Alerts',
      'Advanced weather alert configuration will be implemented.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Weather Service Status */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.statusHeader}>
              <Icon 
                name={weatherEnabled ? 'weather-sunny' : 'weather-cloudy'} 
                size={24} 
                color={weatherEnabled ? theme.colors.primary : theme.colors.outline} 
              />
              <Text variant="titleMedium" style={styles.statusTitle}>
                Weather Intelligence
              </Text>
              <Switch
                value={weatherEnabled}
                onValueChange={setWeatherEnabled}
              />
            </View>
            
            {weatherEnabled && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.settingsSection}>
                  <List.Item
                    title="Location"
                    description={selectedLocation.name}
                    left={(props) => <List.Icon {...props} icon="map-marker" />}
                    right={(props) => <List.Icon {...props} icon="chevron-right" />}
                    onPress={handleLocationSelect}
                  />
                  
                  <View style={styles.switchRow}>
                    <View style={styles.switchInfo}>
                      <Text variant="bodyMedium">Push Notifications</Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Receive weather alerts and recommendations
                      </Text>
                    </View>
                    <Switch
                      value={notificationsEnabled}
                      onValueChange={setNotificationsEnabled}
                    />
                  </View>

                  <View style={styles.switchRow}>
                    <View style={styles.switchInfo}>
                      <Text variant="bodyMedium">Auto Recommendations</Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        Automatically generate farming suggestions
                      </Text>
                    </View>
                    <Switch
                      value={autoRecommendations}
                      onValueChange={setAutoRecommendations}
                    />
                  </View>
                </View>

                <Divider style={styles.divider} />
                
                <View style={styles.actionButtons}>
                  <Button 
                    mode="outlined" 
                    icon="bell-ring" 
                    onPress={handleSetupAlerts}
                    style={styles.actionButton}
                  >
                    Configure Alerts
                  </Button>
                  <Button 
                    mode="outlined" 
                    icon="file-export" 
                    onPress={handleExportReport}
                    style={styles.actionButton}
                  >
                    Export Report
                  </Button>
                </View>
              </>
            )}
          </Card.Content>
        </Card>

        {/* Farm Profile Summary */}
        {weatherEnabled && (
          <Card style={styles.card}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Farm Profile
              </Text>
              
              <View style={styles.profileSection}>
                <View style={styles.profileItem}>
                  <Icon name="sprout" size={20} color={theme.colors.primary} />
                  <Text variant="bodyMedium" style={styles.profileLabel}>Crops</Text>
                  <View style={styles.chipContainer}>
                    {farmProfile.crops.length > 0 ? (
                      farmProfile.crops.slice(0, 3).map((crop: string, index: number) => (
                        <Chip key={index} mode="outlined" compact style={styles.chip}>
                          {crop}
                        </Chip>
                      ))
                    ) : (
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        No crops added
                      </Text>
                    )}
                    {farmProfile.crops.length > 3 && (
                      <Chip mode="outlined" compact style={styles.chip}>
                        +{farmProfile.crops.length - 3} more
                      </Chip>
                    )}
                  </View>
                </View>

                <View style={styles.profileItem}>
                  <Icon name="cow" size={20} color={theme.colors.secondary} />
                  <Text variant="bodyMedium" style={styles.profileLabel}>Livestock</Text>
                  <View style={styles.chipContainer}>
                    {farmProfile.animals.length > 0 ? (
                      farmProfile.animals.slice(0, 3).map((animal: string, index: number) => (
                        <Chip key={index} mode="outlined" compact style={styles.chip}>
                          {animal}
                        </Chip>
                      ))
                    ) : (
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        No livestock added
                      </Text>
                    )}
                    {farmProfile.animals.length > 3 && (
                      <Chip mode="outlined" compact style={styles.chip}>
                        +{farmProfile.animals.length - 3} more
                      </Chip>
                    )}
                  </View>
                </View>

                <View style={styles.profileRow}>
                  <View style={styles.profileMetric}>
                    <Icon name="resize" size={16} color={theme.colors.tertiary} />
                    <Text variant="bodySmall">Farm Size: {farmProfile.farmSize} ha</Text>
                  </View>
                  <View style={styles.profileMetric}>
                    <Icon name="water" size={16} color={theme.colors.tertiary} />
                    <Text variant="bodySmall">Irrigation: {farmProfile.irrigationSystem}</Text>
                  </View>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Weather Dashboard */}
        {weatherEnabled && (
          <EnhancedWeatherDashboard
            farmProfile={farmProfile}
            latitude={selectedLocation.latitude}
            longitude={selectedLocation.longitude}
          />
        )}

        {/* Weather Service Info */}
        {!weatherEnabled && (
          <Card style={styles.card}>
            <Card.Content style={styles.disabledContent}>
              <Icon name="weather-cloudy-alert" size={48} color={theme.colors.outline} />
              <Text variant="titleMedium" style={[styles.disabledText, { marginTop: 16 }]}>
                Weather Intelligence Disabled
              </Text>
              <Text variant="bodyMedium" style={[styles.disabledText, { textAlign: 'center', marginTop: 8 }]}>
                Enable weather intelligence to receive real-time weather data, 
                agricultural recommendations, and smart farming insights.
              </Text>
              <Button 
                mode="contained" 
                onPress={() => setWeatherEnabled(true)}
                style={styles.enableButton}
              >
                Enable Weather Intelligence
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Integration Info */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Weather Integration Features
            </Text>
            
            <View style={styles.featuresList}>
              <FeatureItem
                icon="weather-partly-cloudy"
                title="Real-time Weather Data"
                description="Current conditions, forecasts, and weather alerts"
                enabled={weatherEnabled}
              />
              <FeatureItem
                icon="chart-line"
                title="Agricultural Analytics"
                description="Planting, harvesting, and field work indices"
                enabled={weatherEnabled}
              />
              <FeatureItem
                icon="lightbulb"
                title="Smart Recommendations"
                description="AI-powered farming suggestions based on weather"
                enabled={weatherEnabled && autoRecommendations}
              />
              <FeatureItem
                icon="bell"
                title="Weather Alerts"
                description="Critical weather warnings and notifications"
                enabled={weatherEnabled && notificationsEnabled}
              />
              <FeatureItem
                icon="water"
                title="Irrigation Intelligence"
                description="Soil moisture and irrigation timing recommendations"
                enabled={weatherEnabled}
              />
              <FeatureItem
                icon="bug"
                title="Pest & Disease Risk"
                description="Weather-based pest and disease risk assessment"
                enabled={weatherEnabled}
              />
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

// Helper component for feature list
const FeatureItem: React.FC<{
  icon: string;
  title: string;
  description: string;
  enabled: boolean;
}> = ({ icon, title, description, enabled }) => {
  const theme = useTheme();
  
  return (
    <View style={[styles.featureItem, { opacity: enabled ? 1 : 0.5 }]}>
      <Icon 
        name={icon} 
        size={24} 
        color={enabled ? theme.colors.primary : theme.colors.outline} 
      />
      <View style={styles.featureContent}>
        <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
          {title}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {description}
        </Text>
      </View>
      <Icon 
        name={enabled ? 'check-circle' : 'circle-outline'} 
        size={20} 
        color={enabled ? theme.colors.primary : theme.colors.outline} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 8,
    elevation: 2,
  },
  
  // Status Section
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusTitle: {
    flex: 1,
    marginLeft: 12,
    fontWeight: 'bold',
  },
  
  // Settings
  settingsSection: {
    marginTop: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  switchInfo: {
    flex: 1,
  },
  divider: {
    marginVertical: 16,
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  
  // Farm Profile
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profileSection: {
    gap: 16,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  profileLabel: {
    fontWeight: 'bold',
    minWidth: 80,
  },
  chipContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  chip: {
    marginRight: 4,
    marginBottom: 4,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  profileMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  
  // Disabled State
  disabledContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  disabledText: {
    color: '#666',
  },
  enableButton: {
    marginTop: 24,
  },
  
  // Features List
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  
  bottomSpacing: {
    height: 24,
  },
});

export default WeatherAnalyticsScreen;