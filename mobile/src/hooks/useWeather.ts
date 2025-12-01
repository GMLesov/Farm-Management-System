// Custom React Hook for Weather Integration
// Provides comprehensive weather intelligence for farming operations

import { useState, useEffect, useCallback, useRef } from 'react';
import EnhancedWeatherService, {
  EnhancedWeatherData,
  AdvancedFarmingRecommendation,
  AgriculturalIndices,
} from '../services/EnhancedWeatherService';
import WeatherNotificationService from '../services/WeatherNotificationService';

export interface WeatherHookConfig {
  farmProfile: {
    crops: string[];
    animals: string[];
    farmSize: number;
    irrigationSystem: string;
    location: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  autoRefresh?: boolean;
  refreshInterval?: number; // minutes
  enableNotifications?: boolean;
  enableBackgroundUpdates?: boolean;
}

export interface WeatherHookState {
  weatherData: EnhancedWeatherData | null;
  recommendations: AdvancedFarmingRecommendation[];
  agriculturalIndices: AgriculturalIndices | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  isStale: boolean;
}

export interface WeatherHookActions {
  refresh: () => Promise<void>;
  setLocation: (latitude: number, longitude: number) => void;
  updateFarmProfile: (profile: Partial<WeatherHookConfig['farmProfile']>) => void;
  dismissRecommendation: (recommendationId: string) => void;
  markRecommendationCompleted: (recommendationId: string) => void;
  enableNotifications: (enable: boolean) => void;
  testNotifications: () => Promise<void>;
}

export interface UseWeatherReturn extends WeatherHookState, WeatherHookActions {
  weatherStatus: 'good' | 'moderate' | 'poor' | 'critical';
  criticalAlerts: any[];
  todayRecommendations: AdvancedFarmingRecommendation[];
  weekRecommendations: AdvancedFarmingRecommendation[];
  farmingConditions: {
    planting: 'excellent' | 'good' | 'fair' | 'poor';
    harvesting: 'excellent' | 'good' | 'fair' | 'poor';
    fieldWork: 'excellent' | 'good' | 'fair' | 'poor';
    irrigation: 'not_needed' | 'recommended' | 'required' | 'critical';
  };
}

const REFRESH_INTERVAL = 30; // 30 minutes
const STALE_THRESHOLD = 60; // 60 minutes

export const useWeather = (config: WeatherHookConfig): UseWeatherReturn => {
  const [state, setState] = useState<WeatherHookState>({
    weatherData: null,
    recommendations: [],
    agriculturalIndices: null,
    loading: true,
    error: null,
    lastUpdated: null,
    isStale: false,
  });

  const [farmProfile, setFarmProfile] = useState(config.farmProfile);
  const [location, setLocationState] = useState(config.location);
  const [notificationsEnabled, setNotificationsEnabled] = useState(config.enableNotifications ?? true);
  
  const refreshIntervalRef = useRef<number | null>(null);
  const lastNotificationCheck = useRef<number>(0);

  // Load weather data
  const loadWeatherData = useCallback(async (): Promise<void> => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Fetch enhanced weather data
      const weatherData = await EnhancedWeatherService.getEnhancedWeatherData(
        location.latitude,
        location.longitude
      );

      // Generate recommendations
      const recommendations = EnhancedWeatherService.generateAdvancedRecommendations(
        weatherData,
        farmProfile
      );

      // Calculate agricultural indices
      const agriculturalIndices = EnhancedWeatherService.calculateAgriculturalIndices(weatherData);

      // Update state
      setState(prev => ({
        ...prev,
        weatherData,
        recommendations,
        agriculturalIndices,
        loading: false,
        error: null,
        lastUpdated: Date.now(),
        isStale: false,
      }));

      // Process notifications if enabled
      if (notificationsEnabled) {
        await processNotifications(weatherData, recommendations);
      }

    } catch (error) {
      console.error('Weather data loading failed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load weather data',
      }));
    }
  }, [location, farmProfile, notificationsEnabled]);

  // Process weather notifications
  const processNotifications = async (
    weatherData: EnhancedWeatherData,
    recommendations: AdvancedFarmingRecommendation[]
  ): Promise<void> => {
    const now = Date.now();
    
    // Avoid spam notifications - check at most every 2 hours
    if (now - lastNotificationCheck.current < 2 * 60 * 60 * 1000) {
      return;
    }

    lastNotificationCheck.current = now;

    try {
      // Send weather alerts
      for (const alert of weatherData.alerts) {
        await WeatherNotificationService.sendWeatherAlert(
          alert.title,
          alert.description,
          alert.severity,
          alert
        );
      }

      // Send critical farming recommendations
      const criticalRecs = recommendations.filter(rec => 
        rec.priority === 'critical' && rec.category === 'immediate'
      );

      for (const rec of criticalRecs) {
        await WeatherNotificationService.sendFarmingRecommendation(
          rec.title,
          rec.description,
          rec.priority,
          rec
        );
      }

      // Send critical warnings based on agricultural indices
      await checkCriticalConditions(weatherData, recommendations);

    } catch (error) {
      console.error('Failed to process notifications:', error);
    }
  };

  // Check for critical farming conditions
  const checkCriticalConditions = async (
    weatherData: EnhancedWeatherData,
    recommendations: AdvancedFarmingRecommendation[]
  ): Promise<void> => {
    const indices = EnhancedWeatherService.calculateAgriculturalIndices(weatherData);
    
    // Critical soil moisture
    if (weatherData.agriculture.soilMoisture < 20) {
      await WeatherNotificationService.sendCriticalWarning(
        'Critical Soil Moisture',
        `Soil moisture critically low at ${Math.round(weatherData.agriculture.soilMoisture)}%. Immediate irrigation required.`,
        'immediate',
        { soilMoisture: weatherData.agriculture.soilMoisture }
      );
    }

    // Extreme temperature for livestock
    if (weatherData.current.temperature > 35 || weatherData.current.temperature < 0) {
      await WeatherNotificationService.sendCriticalWarning(
        'Extreme Temperature Alert',
        `Temperature ${Math.round(weatherData.current.temperature)}°C poses risk to livestock. Take immediate protective measures.`,
        'immediate',
        { temperature: weatherData.current.temperature }
      );
    }

    // High disease risk
    if (indices.diseaseRiskIndex > 85) {
      await WeatherNotificationService.sendCriticalWarning(
        'High Disease Risk',
        'Weather conditions highly favorable for plant diseases. Increase monitoring and consider preventive treatments.',
        'expected',
        { diseaseRiskIndex: indices.diseaseRiskIndex }
      );
    }
  };

  // Check if data is stale
  const checkStaleData = useCallback((): void => {
    if (state.lastUpdated) {
      const now = Date.now();
      const isStale = (now - state.lastUpdated) > (STALE_THRESHOLD * 60 * 1000);
      
      if (isStale !== state.isStale) {
        setState(prev => ({ ...prev, isStale }));
      }
    }
  }, [state.lastUpdated, state.isStale]);

  // Set up auto-refresh
  useEffect(() => {
    if (config.autoRefresh !== false) {
      const interval = (config.refreshInterval || REFRESH_INTERVAL) * 60 * 1000;
      
      refreshIntervalRef.current = setInterval(() => {
        loadWeatherData();
      }, interval);

      // Also check for stale data more frequently
      const staleCheckInterval = setInterval(checkStaleData, 5 * 60 * 1000);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
        clearInterval(staleCheckInterval);
      };
    }
  }, [config.autoRefresh, config.refreshInterval, loadWeatherData, checkStaleData]);

  // Initial load
  useEffect(() => {
    loadWeatherData();
  }, [loadWeatherData]);

  // Initialize notification service
  useEffect(() => {
    if (notificationsEnabled) {
      WeatherNotificationService.initialize();
    }
  }, [notificationsEnabled]);

  // Calculate derived states
  const weatherStatus = (() => {
    if (!state.weatherData || !state.agriculturalIndices) return 'moderate';
    
    const indices = state.agriculturalIndices;
    const alerts = state.weatherData.alerts;
    
    if (alerts.some(a => a.severity === 'extreme')) return 'critical';
    if (alerts.some(a => a.severity === 'severe')) return 'poor';
    
    const avgIndex = (
      indices.plantingIndex + 
      indices.harvestingIndex + 
      indices.fieldWorkIndex + 
      indices.livestockComfortIndex
    ) / 4;
    
    if (avgIndex >= 75) return 'good';
    if (avgIndex >= 50) return 'moderate';
    return 'poor';
  })();

  const criticalAlerts = state.weatherData?.alerts.filter(alert => 
    alert.severity === 'extreme' || alert.severity === 'severe'
  ) || [];

  const todayRecommendations = state.recommendations.filter(rec => 
    rec.category === 'immediate' || rec.category === 'today'
  );

  const weekRecommendations = state.recommendations.filter(rec => 
    rec.category === 'this_week' || rec.category === 'planning'
  );

  const farmingConditions = (() => {
    if (!state.agriculturalIndices) {
      return {
        planting: 'fair' as const,
        harvesting: 'fair' as const,
        fieldWork: 'fair' as const,
        irrigation: 'recommended' as const,
      };
    }

    const getConditionLevel = (index: number) => {
      if (index >= 80) return 'excellent' as const;
      if (index >= 60) return 'good' as const;
      if (index >= 40) return 'fair' as const;
      return 'poor' as const;
    };

    const getIrrigationLevel = (soilMoisture: number) => {
      if (soilMoisture < 20) return 'critical' as const;
      if (soilMoisture < 40) return 'required' as const;
      if (soilMoisture < 60) return 'recommended' as const;
      return 'not_needed' as const;
    };

    return {
      planting: getConditionLevel(state.agriculturalIndices.plantingIndex),
      harvesting: getConditionLevel(state.agriculturalIndices.harvestingIndex),
      fieldWork: getConditionLevel(state.agriculturalIndices.fieldWorkIndex),
      irrigation: getIrrigationLevel(state.weatherData?.agriculture.soilMoisture || 50),
    };
  })();

  // Actions
  const refresh = async (): Promise<void> => {
    await loadWeatherData();
  };

  const setLocation = (latitude: number, longitude: number): void => {
    setLocationState({ latitude, longitude });
  };

  const updateFarmProfile = (profile: Partial<WeatherHookConfig['farmProfile']>): void => {
    setFarmProfile(prev => ({ ...prev, ...profile }));
  };

  const dismissRecommendation = (recommendationId: string): void => {
    setState(prev => ({
      ...prev,
      recommendations: prev.recommendations.filter(rec => rec.id !== recommendationId),
    }));
  };

  const markRecommendationCompleted = (recommendationId: string): void => {
    setState(prev => ({
      ...prev,
      recommendations: prev.recommendations.map(rec =>
        rec.id === recommendationId ? { ...rec, completed: true } : rec
      ),
    }));
    
    // In production, save completion status
    console.log('Recommendation completed:', recommendationId);
  };

  const enableNotifications = (enable: boolean): void => {
    setNotificationsEnabled(enable);
  };

  const testNotifications = async (): Promise<void> => {
    await WeatherNotificationService.testNotification();
  };

  return {
    // State
    ...state,
    
    // Derived state
    weatherStatus,
    criticalAlerts,
    todayRecommendations,
    weekRecommendations,
    farmingConditions,
    
    // Actions
    refresh,
    setLocation,
    updateFarmProfile,
    dismissRecommendation,
    markRecommendationCompleted,
    enableNotifications,
    testNotifications,
  };
};

export default useWeather;