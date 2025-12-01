import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import {
  Surface,
  Card,
  Title,
  Text,
  Button,
  IconButton,
  Chip,
  ProgressBar,
  List,
  Divider,
} from 'react-native-paper';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { smartIrrigationService } from '../../services/SmartIrrigationService';

const { width } = Dimensions.get('window');

interface IrrigationZoneDetailsProps {
  navigation: any;
}

type RouteKey = 'overview' | 'sensors' | 'schedules' | 'history' | 'settings';
interface TabRoute {
  key: RouteKey;
  title: string;
  icon: string;
}

interface ZoneDetailsData {
  zone: any;
  analytics: any;
  recentEvents: any[];
  sensorReadings: any[];
  activeSchedules: any[];
  alerts: any[];
}

const IrrigationZoneDetails: React.FC<IrrigationZoneDetailsProps> = ({ navigation }) => {
  const route = useRoute();
  const { zoneId } = route.params as { zoneId: string };

  const [data, setData] = useState<ZoneDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  const [routes] = useState<TabRoute[]>([
    { key: 'overview', title: 'Overview', icon: 'information' },
    { key: 'sensors', title: 'Sensors', icon: 'chip' },
    { key: 'schedules', title: 'Schedules', icon: 'calendar-clock' },
    { key: 'history', title: 'History', icon: 'history' },
    { key: 'settings', title: 'Settings', icon: 'cog' },
  ]);

  const loadZoneDetails = useCallback(async () => {
    try {
      const zone = smartIrrigationService.getZone(zoneId);
      if (!zone) {
        Alert.alert('Error', 'Zone not found');
        navigation.goBack();
        return;
      }

      const analytics = smartIrrigationService.getZoneAnalytics(zoneId);
      const recentEvents = smartIrrigationService.getIrrigationHistory(zoneId, 30);
      const alerts = smartIrrigationService.getAlerts(zoneId);
      const activeSchedules = smartIrrigationService.getActiveSchedules(zoneId);

      // Get sensor readings for last 24 hours
      const sensorReadings: any[] = [];
      zone.sensors.forEach((sensor: any) => {
        const readings = smartIrrigationService.getSensorReadings(zoneId, sensor.id, 24);
        if (readings.length > 0) {
          sensorReadings.push({
            sensorId: sensor.id,
            sensorName: sensor.name,
            sensorType: sensor.type,
            readings: readings,
            latest: readings[readings.length - 1],
          });
        }
      });

      setData({
        zone,
        analytics,
        recentEvents,
        sensorReadings,
        activeSchedules,
        alerts,
      });
    } catch (error) {
      console.error('Error loading zone details:', error);
      Alert.alert('Error', 'Failed to load zone details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [zoneId, navigation]);

  useFocusEffect(
    useCallback(() => {
      loadZoneDetails();
    }, [loadZoneDetails])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadZoneDetails();
  }, [loadZoneDetails]);

  const handleStartIrrigation = async () => {
    Alert.alert(
      'Start Irrigation',
      'Do you want to start irrigation for this zone?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            try {
              await smartIrrigationService.startIrrigation(zoneId, {
                trigger: {
                  type: 'manual',
                  description: 'Manual irrigation started from zone details',
                },
              });
              loadZoneDetails();
            } catch (error) {
              Alert.alert('Error', 'Failed to start irrigation');
            }
          },
        },
      ]
    );
  };

  const handleStopIrrigation = async () => {
    Alert.alert(
      'Stop Irrigation',
      'Do you want to stop irrigation for this zone?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Stop',
          onPress: async () => {
            try {
              await smartIrrigationService.stopIrrigation(zoneId);
              loadZoneDetails();
            } catch (error) {
              Alert.alert('Error', 'Failed to stop irrigation');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#FFC107';
      case 'maintenance': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const renderOverviewTab = () => {
    if (!data) return null;

    const { zone, analytics } = data;
    const activeEvents = smartIrrigationService.getActiveIrrigationEvents();
    const isIrrigating = activeEvents.some(event => event.zoneId === zoneId);

    return (
      <ScrollView style={styles.tabContent}>
        {/* Zone Status Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.zoneStatusHeader}>
              <View>
                <Title>{zone.name}</Title>
                <Text style={styles.zoneDescription}>{zone.description}</Text>
              </View>
              <View style={styles.statusContainer}>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(zone.status) }]} />
                <Text style={styles.statusText}>{zone.status.toUpperCase()}</Text>
              </View>
            </View>

            {isIrrigating && (
              <View style={styles.irrigatingBanner}>
                <Icon name="water" size={20} color="#00BCD4" />
                <Text style={styles.irrigatingText}>Currently Irrigating</Text>
              </View>
            )}

            <View style={styles.quickStats}>
              <View style={styles.quickStatItem}>
                <Icon name="texture-box" size={24} color="#666" />
                <Text style={styles.quickStatLabel}>Soil Type</Text>
                <Text style={styles.quickStatValue}>{zone.soilType}</Text>
              </View>
              <View style={styles.quickStatItem}>
                <Icon name="ruler" size={24} color="#666" />
                <Text style={styles.quickStatLabel}>Area</Text>
                <Text style={styles.quickStatValue}>{zone.area} acres</Text>
              </View>
              <View style={styles.quickStatItem}>
                <Icon name="cog" size={24} color="#666" />
                <Text style={styles.quickStatLabel}>System</Text>
                <Text style={styles.quickStatValue}>{zone.irrigationSystem.type}</Text>
              </View>
            </View>
          </Card.Content>

          <Card.Actions>
            {isIrrigating ? (
              <Button
                mode="contained"
                buttonColor="#F44336"
                onPress={handleStopIrrigation}
              >
                Stop Irrigation
              </Button>
            ) : (
              <Button
                mode="contained"
                buttonColor="#00BCD4"
                disabled={zone.status !== 'active'}
                onPress={handleStartIrrigation}
              >
                Start Irrigation
              </Button>
            )}
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('EditIrrigationZone', { zoneId })}
            >
              Edit Zone
            </Button>
          </Card.Actions>
        </Card>

        {/* Current Conditions Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Current Conditions</Title>
            
            {data.sensorReadings.map((sensorData: any) => (
              <View key={sensorData.sensorId} style={styles.sensorReading}>
                <View style={styles.sensorHeader}>
                  <Icon 
                    name={getSensorIcon(sensorData.sensorType)} 
                    size={20} 
                    color="#666" 
                  />
                  <Text style={styles.sensorName}>{sensorData.sensorName}</Text>
                </View>
                <View style={styles.sensorValue}>
                  <Text style={styles.sensorValueText}>
                    {sensorData.latest.value.toFixed(1)} {sensorData.latest.unit}
                  </Text>
                  <Text style={styles.sensorTime}>
                    {new Date(sensorData.latest.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              </View>
            ))}

            {data.sensorReadings.length === 0 && (
              <Text style={styles.noDataText}>No sensor data available</Text>
            )}
          </Card.Content>
        </Card>

        {/* Performance Metrics Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Performance Metrics</Title>
            
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{analytics.efficiency.applicationEfficiency.toFixed(1)}%</Text>
                <Text style={styles.metricLabel}>Application Efficiency</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{analytics.efficiency.distributionUniformity.toFixed(1)}%</Text>
                <Text style={styles.metricLabel}>Distribution Uniformity</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{analytics.efficiency.totalWaterUsed.toFixed(1)}"</Text>
                <Text style={styles.metricLabel}>Water Used (30 days)</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>${analytics.efficiency.averageCostPerInch.toFixed(2)}</Text>
                <Text style={styles.metricLabel}>Cost per Inch</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Recent Alerts */}
        {data.alerts.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>Recent Alerts</Title>
              {data.alerts.slice(0, 3).map((alert: any) => (
                <View key={alert.id} style={styles.alertItem}>
                  <Icon 
                    name={alert.priority === 'critical' ? 'alert-circle' : 'alert'} 
                    size={20} 
                    color={alert.priority === 'critical' ? '#F44336' : '#FF9800'} 
                  />
                  <View style={styles.alertContent}>
                    <Text style={styles.alertTitle}>{alert.title}</Text>
                    <Text style={styles.alertMessage}>{alert.message}</Text>
                    <Text style={styles.alertTime}>
                      {alert.timestamp.toLocaleString()}
                    </Text>
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    );
  };

  const renderSensorsTab = () => {
    if (!data) return null;

    return (
      <ScrollView style={styles.tabContent}>
        {data.zone.sensors.map((sensor: any) => {
          const sensorData = data.sensorReadings.find((sr: any) => sr.sensorId === sensor.id);
          
          return (
            <Card key={sensor.id} style={styles.card}>
              <Card.Content>
                <View style={styles.sensorCardHeader}>
                  <View>
                    <Title style={styles.sensorTitle}>{sensor.name}</Title>
                    <Text style={styles.sensorType}>{sensor.type.replace('_', ' ').toUpperCase()}</Text>
                  </View>
                  <Chip 
                    mode="outlined"
                    textStyle={styles.statusChipText}
                    style={[styles.statusChip, { borderColor: getStatusColor(sensor.status) }]}
                  >
                    {sensor.status}
                  </Chip>
                </View>

                <View style={styles.sensorDetails}>
                  <View style={styles.sensorDetailItem}>
                    <Text style={styles.detailLabel}>Model</Text>
                    <Text style={styles.detailValue}>{sensor.model}</Text>
                  </View>
                  <View style={styles.sensorDetailItem}>
                    <Text style={styles.detailLabel}>Battery Level</Text>
                    <Text style={styles.detailValue}>
                      {sensor.batteryLevel ? `${sensor.batteryLevel}%` : 'N/A'}
                    </Text>
                  </View>
                  <View style={styles.sensorDetailItem}>
                    <Text style={styles.detailLabel}>Signal Strength</Text>
                    <Text style={styles.detailValue}>{sensor.signalStrength}%</Text>
                  </View>
                </View>

                {sensorData && sensorData.latest && (
                  <View style={styles.latestReading}>
                    <Text style={styles.readingLabel}>Latest Reading</Text>
                    <Text style={styles.readingValue}>
                      {sensorData.latest.value.toFixed(1)} {sensorData.latest.unit}
                    </Text>
                    <Text style={styles.readingTime}>
                      {new Date(sensorData.latest.timestamp).toLocaleString()}
                    </Text>
                  </View>
                )}

                {sensorData && sensorData.readings.length > 1 && (
                  <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>24-Hour Trend</Text>
                    <LineChart
                      data={{
                        labels: sensorData.readings
                          .filter((_: any, index: number) => index % 4 === 0)
                          .map((reading: any) => new Date(reading.timestamp).getHours().toString()),
                        datasets: [{
                          data: sensorData.readings
                            .filter((_: any, index: number) => index % 4 === 0)
                            .map((reading: any) => reading.value),
                        }],
                      }}
                      width={width - 80}
                      height={200}
                      chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 1,
                        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`,
                        style: {
                          borderRadius: 16,
                        },
                      }}
                      style={styles.chart}
                    />
                  </View>
                )}
              </Card.Content>
            </Card>
          );
        })}

        {data.zone.sensors.length === 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.emptyState}>
                <Icon name="chip" size={64} color="#E0E0E0" />
                <Text style={styles.emptyTitle}>No Sensors</Text>
                <Text style={styles.emptySubtitle}>
                  Add sensors to monitor this irrigation zone
                </Text>
                <Button
                  mode="contained"
                  style={styles.addButton}
                  onPress={() => navigation.navigate('AddSensor', { zoneId })}
                >
                  Add Sensor
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    );
  };

  const renderSchedulesTab = () => {
    if (!data) return null;

    return (
      <ScrollView style={styles.tabContent}>
        {data.zone.schedule.map((schedule: any) => (
          <Card key={schedule.id} style={styles.card}>
            <Card.Content>
              <View style={styles.scheduleHeader}>
                <View>
                  <Title style={styles.scheduleTitle}>{schedule.name}</Title>
                  <Text style={styles.scheduleType}>{schedule.type.toUpperCase()}</Text>
                </View>
                <Chip 
                  mode="outlined"
                  textStyle={styles.statusChipText}
                  style={[styles.statusChip, { 
                    borderColor: schedule.status === 'active' ? '#4CAF50' : '#FFC107' 
                  }]}
                >
                  {schedule.status}
                </Chip>
              </View>

              <View style={styles.scheduleDetails}>
                <View style={styles.scheduleDetailRow}>
                  <Icon name="clock-outline" size={16} color="#666" />
                  <Text style={styles.scheduleDetailText}>
                    {schedule.timing.startTime} for {formatDuration(schedule.timing.duration)}
                  </Text>
                </View>
                <View style={styles.scheduleDetailRow}>
                  <Icon name="water-outline" size={16} color="#666" />
                  <Text style={styles.scheduleDetailText}>
                    Target: {schedule.waterAmount.target}" water
                  </Text>
                </View>
                <View style={styles.scheduleDetailRow}>
                  <Icon name="calendar" size={16} color="#666" />
                  <Text style={styles.scheduleDetailText}>
                    {schedule.frequency.type === 'daily' ? 'Daily' : 
                     schedule.frequency.type === 'weekly' ? 'Weekly' : 
                     schedule.frequency.type}
                  </Text>
                </View>
              </View>
            </Card.Content>

            <Card.Actions>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('EditSchedule', { scheduleId: schedule.id, zoneId })}
              >
                Edit
              </Button>
              <Button
                mode="text"
                onPress={() => {
                  Alert.alert(
                    'Delete Schedule',
                    'Are you sure you want to delete this schedule?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { 
                        text: 'Delete', 
                        style: 'destructive',
                        onPress: () => {
                          smartIrrigationService.deleteSchedule(zoneId, schedule.id);
                          loadZoneDetails();
                        }
                      },
                    ]
                  );
                }}
              >
                Delete
              </Button>
            </Card.Actions>
          </Card>
        ))}

        {data.zone.schedule.length === 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.emptyState}>
                <Icon name="calendar-clock" size={64} color="#E0E0E0" />
                <Text style={styles.emptyTitle}>No Schedules</Text>
                <Text style={styles.emptySubtitle}>
                  Create irrigation schedules to automate watering
                </Text>
                <Button
                  mode="contained"
                  style={styles.addButton}
                  onPress={() => navigation.navigate('CreateSchedule', { zoneId })}
                >
                  Create Schedule
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    );
  };

  const renderHistoryTab = () => {
    if (!data) return null;

    return (
      <ScrollView style={styles.tabContent}>
        {data.recentEvents.map((event: any) => (
          <Card key={event.id} style={styles.card}>
            <Card.Content>
              <View style={styles.eventHeader}>
                <View>
                  <Text style={styles.eventType}>{event.type.toUpperCase()}</Text>
                  <Text style={styles.eventDate}>
                    {new Date(event.startTime).toLocaleDateString()}
                  </Text>
                </View>
                <Chip 
                  mode="outlined"
                  textStyle={styles.statusChipText}
                  style={[styles.statusChip, { 
                    borderColor: event.status === 'completed' ? '#4CAF50' : 
                                event.status === 'failed' ? '#F44336' : '#FF9800'
                  }]}
                >
                  {event.status}
                </Chip>
              </View>

              <View style={styles.eventDetails}>
                <View style={styles.eventDetailRow}>
                  <Icon name="clock-outline" size={16} color="#666" />
                  <Text style={styles.eventDetailText}>
                    {new Date(event.startTime).toLocaleTimeString()} - 
                    {event.endTime ? new Date(event.endTime).toLocaleTimeString() : 'Running'}
                  </Text>
                </View>
                <View style={styles.eventDetailRow}>
                  <Icon name="timer-outline" size={16} color="#666" />
                  <Text style={styles.eventDetailText}>
                    Duration: {formatDuration(event.actualDuration || event.plannedDuration)}
                  </Text>
                </View>
                <View style={styles.eventDetailRow}>
                  <Icon name="water-outline" size={16} color="#666" />
                  <Text style={styles.eventDetailText}>
                    Water: {(event.waterApplied.actual || event.waterApplied.planned).toFixed(2)}"
                  </Text>
                </View>
                <View style={styles.eventDetailRow}>
                  <Icon name="currency-usd" size={16} color="#666" />
                  <Text style={styles.eventDetailText}>
                    Cost: ${event.cost.total.toFixed(2)}
                  </Text>
                </View>
              </View>

              {event.trigger && (
                <View style={styles.triggerInfo}>
                  <Text style={styles.triggerLabel}>Trigger:</Text>
                  <Text style={styles.triggerText}>{event.trigger.description}</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        ))}

        {data.recentEvents.length === 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.emptyState}>
                <Icon name="history" size={64} color="#E0E0E0" />
                <Text style={styles.emptyTitle}>No Irrigation History</Text>
                <Text style={styles.emptySubtitle}>
                  Irrigation events will appear here once you start watering
                </Text>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    );
  };

  const renderSettingsTab = () => {
    if (!data) return null;

    const { zone } = data;

    return (
      <ScrollView style={styles.tabContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Irrigation Settings</Title>
            
            <List.Item
              title="Mode"
              description={zone.settings.mode}
              left={(props) => <List.Icon {...props} icon="cog" />}
              right={() => <Text>{zone.settings.mode}</Text>}
            />
            <Divider />
            
            <List.Item
              title="Auto Start"
              description="Automatically start scheduled irrigation"
              left={(props) => <List.Icon {...props} icon="play-circle" />}
              right={() => <Text>{zone.settings.autoStart ? 'Enabled' : 'Disabled'}</Text>}
            />
            <Divider />
            
            <List.Item
              title="Weather Integration"
              description="Adjust irrigation based on weather"
              left={(props) => <List.Icon {...props} icon="weather-cloudy" />}
              right={() => <Text>{zone.settings.weatherIntegration ? 'Enabled' : 'Disabled'}</Text>}
            />
            <Divider />
            
            <List.Item
              title="Soil Moisture Targets"
              description={`${zone.settings.soilMoistureTarget.minimum}% - ${zone.settings.soilMoistureTarget.maximum}%`}
              left={(props) => <List.Icon {...props} icon="water-percent" />}
              right={() => <Text>Optimal: {zone.settings.soilMoistureTarget.optimal}%</Text>}
            />
          </Card.Content>
          
          <Card.Actions>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('EditZoneSettings', { zoneId })}
            >
              Edit Settings
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>System Information</Title>
            
            <View style={styles.systemInfoGrid}>
              <View style={styles.systemInfoItem}>
                <Text style={styles.systemInfoLabel}>Manufacturer</Text>
                <Text style={styles.systemInfoValue}>{zone.irrigationSystem.manufacturer}</Text>
              </View>
              <View style={styles.systemInfoItem}>
                <Text style={styles.systemInfoLabel}>Model</Text>
                <Text style={styles.systemInfoValue}>{zone.irrigationSystem.model}</Text>
              </View>
              <View style={styles.systemInfoItem}>
                <Text style={styles.systemInfoLabel}>Flow Rate</Text>
                <Text style={styles.systemInfoValue}>{zone.irrigationSystem.capacity.flowRate} GPM</Text>
              </View>
              <View style={styles.systemInfoItem}>
                <Text style={styles.systemInfoLabel}>Pressure</Text>
                <Text style={styles.systemInfoValue}>{zone.irrigationSystem.capacity.pressure} PSI</Text>
              </View>
              <View style={styles.systemInfoItem}>
                <Text style={styles.systemInfoLabel}>Coverage</Text>
                <Text style={styles.systemInfoValue}>{zone.irrigationSystem.capacity.coverage} acres</Text>
              </View>
              <View style={styles.systemInfoItem}>
                <Text style={styles.systemInfoLabel}>Status</Text>
                <Text style={styles.systemInfoValue}>{zone.irrigationSystem.status}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Water Budget</Title>
            
            <View style={styles.budgetContainer}>
              <View style={styles.budgetHeader}>
                <Text style={styles.budgetLabel}>Monthly Allocation</Text>
                <Text style={styles.budgetValue}>{zone.waterBudget.allocation.toFixed(1)}"</Text>
              </View>
              
              <ProgressBar 
                progress={zone.waterBudget.used / zone.waterBudget.allocation} 
                color={zone.waterBudget.used > zone.waterBudget.allocation ? '#F44336' : '#4CAF50'}
                style={styles.budgetProgress}
              />
              
              <View style={styles.budgetDetails}>
                <View style={styles.budgetDetailItem}>
                  <Text style={styles.budgetDetailLabel}>Used</Text>
                  <Text style={styles.budgetDetailValue}>{zone.waterBudget.used.toFixed(1)}"</Text>
                </View>
                <View style={styles.budgetDetailItem}>
                  <Text style={styles.budgetDetailLabel}>Remaining</Text>
                  <Text style={styles.budgetDetailValue}>{zone.waterBudget.remaining.toFixed(1)}"</Text>
                </View>
                <View style={styles.budgetDetailItem}>
                  <Text style={styles.budgetDetailLabel}>Efficiency</Text>
                  <Text style={styles.budgetDetailValue}>{zone.waterBudget.efficiency.toFixed(1)}%</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  };

  const getSensorIcon = (sensorType: string): string => {
    switch (sensorType) {
      case 'soil_moisture': return 'water-percent';
      case 'soil_temperature': return 'thermometer';
      case 'ambient_temperature': return 'thermometer-lines';
      case 'humidity': return 'water-outline';
      case 'pressure': return 'gauge';
      case 'flow_rate': return 'speedometer';
      case 'water_level': return 'waves';
      default: return 'chip';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading zone details...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Text>Failed to load zone details</Text>
        <Button onPress={loadZoneDetails}>Retry</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index: tabIndex, routes }}
        renderScene={({ route }: { route: TabRoute }) => {
          switch (route.key) {
            case 'overview': return renderOverviewTab();
            case 'sensors': return renderSensorsTab();
            case 'schedules': return renderSchedulesTab();
            case 'history': return renderHistoryTab();
            case 'settings': return renderSettingsTab();
            default: return null;
          }
        }}
        onIndexChange={setTabIndex}
        renderTabBar={(props: any) => (
          <TabBar
            {...props}
            indicatorStyle={styles.tabIndicator}
            style={styles.tabBar}
            labelStyle={styles.tabLabel}
            scrollEnabled
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    backgroundColor: 'white',
  },
  tabIndicator: {
    backgroundColor: '#2196F3',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  zoneStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  zoneDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  irrigatingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0F7FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  irrigatingText: {
    marginLeft: 8,
    color: '#00838F',
    fontWeight: '600',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  quickStatValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  sensorReading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sensorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sensorName: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  sensorValue: {
    alignItems: 'flex-end',
  },
  sensorValueText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sensorTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  noDataText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  alertItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FFF3E0',
    marginBottom: 8,
  },
  alertContent: {
    marginLeft: 12,
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertMessage: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  alertTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  sensorCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sensorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sensorType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    fontSize: 11,
  },
  sensorDetails: {
    marginBottom: 16,
  },
  sensorDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  latestReading: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  readingLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  readingValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  readingTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  chartContainer: {
    marginTop: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  chart: {
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#666',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  addButton: {
    marginTop: 16,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scheduleType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  scheduleDetails: {
    marginBottom: 8,
  },
  scheduleDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scheduleDetailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  eventType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  eventDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  eventDetails: {
    marginBottom: 12,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventDetailText: {
    marginLeft: 8,
    fontSize: 13,
    color: '#333',
  },
  triggerInfo: {
    backgroundColor: '#F8F9FA',
    padding: 8,
    borderRadius: 6,
  },
  triggerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  triggerText: {
    fontSize: 12,
    color: '#333',
    marginTop: 2,
  },
  systemInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  systemInfoItem: {
    width: '48%',
    marginBottom: 12,
  },
  systemInfoLabel: {
    fontSize: 12,
    color: '#666',
  },
  systemInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  budgetContainer: {
    padding: 8,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  budgetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  budgetProgress: {
    height: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  budgetDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  budgetDetailItem: {
    alignItems: 'center',
  },
  budgetDetailLabel: {
    fontSize: 12,
    color: '#666',
  },
  budgetDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default IrrigationZoneDetails;