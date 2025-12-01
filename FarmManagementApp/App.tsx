/**
 * AgriReach Digital - Farm Management App
 * Enhanced with performance optimizations, error boundaries, and background sync
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar, useColorScheme, LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';

import { store } from './src/store';
import Navigation from './src/navigation';
import { getCurrentUser } from './src/store/slices/authSlice';
import { initializeOfflineServices } from './src/store/slices/offlineSlice';
import { OfflineFloatingStatus } from './src/components/OfflineStatus';
import { ErrorBoundary } from './src/components/ErrorBoundary';

// Enhanced services
import { enhancedNotificationService } from './src/services/enhancedNotificationService';
import { enhancedSyncManager } from './src/services/enhancedSyncManager';
import { performanceMonitor } from './src/services/performanceMonitor';

// Suppress specific warnings for better dev experience
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'VirtualizedLists should never be nested',
]);

const theme = {
  colors: {
    primary: '#4CAF50',
    accent: '#8BC34A',
    background: '#ffffff',
    surface: '#ffffff',
    text: '#000000',
    disabled: '#9E9E9E',
    placeholder: '#757575',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
};

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize performance monitoring first
        await performanceMonitor.initialize();
        performanceMonitor.startMetric('app_initialization', 'App initialization process');

        // Check if user is already logged in when app starts
        store.dispatch(getCurrentUser());
        
        // Initialize offline services
        store.dispatch(initializeOfflineServices());
        
        // Initialize enhanced sync manager
        await enhancedSyncManager.initialize();
        
        // Set up sync callbacks for different data types
        enhancedSyncManager.registerSyncCallback('crop_data', async (job) => {
          console.log('Syncing crop data:', job.data);
          // Implement actual crop data sync logic
        });
        
        enhancedSyncManager.registerSyncCallback('weather_data', async (job) => {
          console.log('Syncing weather data:', job.data);
          // Implement actual weather data sync logic
        });
        
        enhancedSyncManager.registerSyncCallback('financial_data', async (job) => {
          console.log('Syncing financial data:', job.data);
          // Implement actual financial data sync logic
        });
        
        // Initialize enhanced notification service
        await enhancedNotificationService.initialize();
        
        performanceMonitor.endMetric('app_initialization');
        
        console.log('App initialized successfully with all optimizations');
      } catch (error) {
        console.error('App initialization error:', error);
        if (error instanceof Error) {
          performanceMonitor.trackError(error, 'App initialization');
        }
      }
    };

    initializeApp();

    // Cleanup function
    return () => {
      enhancedSyncManager.destroy();
    };
  }, []);

  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <PaperProvider theme={theme}>
          <SafeAreaProvider>
            <StatusBar
              barStyle={isDarkMode ? 'light-content' : 'dark-content'}
              backgroundColor={theme.colors.primary}
            />
            <Navigation />
            <OfflineFloatingStatus />
          </SafeAreaProvider>
        </PaperProvider>
      </ReduxProvider>
    </ErrorBoundary>
  );
}

export default React.memo(App);
