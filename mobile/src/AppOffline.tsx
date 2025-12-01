import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { store } from './store';
import { theme } from './config/theme';
import AppNavigator from './navigation';
import { OfflineFloatingStatus } from './components/OfflineStatus';
import { initializeOfflineServices } from './store/slices/offlineSlice';

const App: React.FC = () => {
  useEffect(() => {
    // Initialize offline services when app starts
    store.dispatch(initializeOfflineServices());
  }, []);

  return (
    <Provider store={store}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <AppNavigator />
          <OfflineFloatingStatus />
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );
};

export default App;