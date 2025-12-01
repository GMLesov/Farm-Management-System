import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { RootState } from '../store';
import { RootStackParamList, TabParamList } from './types';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
// import SignupScreen from '../screens/auth/SignupScreen';

// Main App Screens
import DashboardScreen from '../screens/worker/DashboardScreen';
import TasksScreen from '../screens/tasks/TasksScreen';
import AnimalHealthScreen from '../screens/worker/AnimalHealthScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Loading Screen Component
const LoadingScreen: React.FC = () => (
  <Surface style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#4CAF50" />
  </Surface>
);

// Auth Stack Navigator
const AuthStack: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
      cardStyle: { backgroundColor: '#f5f5f5' },
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    {/* <Stack.Screen name="Signup" component={SignupScreen} /> */}
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabs: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Tasks':
              iconName = 'assignment';
              break;
            case 'Health':
              iconName = 'pets';
              break;
            case 'Reports':
              iconName = 'bar-chart';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          headerTitle: `Welcome, ${user?.name || 'Farm Worker'}`,
        }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TasksScreen}
        options={{
          title: 'My Tasks',
        }}
      />
      <Tab.Screen 
        name="Health" 
        component={AnimalHealthScreen}
        options={{
          title: 'Animal Health',
        }}
      />
      <Tab.Screen 
        name="Reports" 
        component={ReportsScreen}
        options={{
          title: 'Reports',
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Stack Navigator
const AppStack: React.FC = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="MainTabs" component={MainTabs} />
  </Stack.Navigator>
);

// Root Navigation Component
const Navigation: React.FC = () => {
  const { user, isLoading } = useSelector((state: RootState) => state.auth);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

export default Navigation;