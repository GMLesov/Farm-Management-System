import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { RootState } from '../store';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';

// Manager Screens
import ManagerDashboardScreen from '../screens/manager/DashboardScreen';
import AnimalListScreen from '../screens/animals/AnimalListScreen';
import AnimalDetailScreen from '../screens/animals/AnimalDetailScreen';
import AddAnimalScreen from '../screens/animals/AddAnimalScreen';
import CropListScreen from '../screens/crops/CropListScreen';
import CropDetailScreen from '../screens/crops/CropDetailScreen';
import AddCropScreen from '../screens/crops/AddCropScreen';
import TaskListScreen from '../screens/tasks/TaskListScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import AddTaskScreen from '../screens/tasks/AddTaskScreen';

// Worker Screens
import WorkerDashboardScreen from '../screens/worker/DashboardScreen';
import WorkerTaskListScreen from '../screens/worker/TaskListScreen';

// Shared Screens  
import ProfileScreen from '../screens/profile/ProfileScreen';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Signup: undefined;
  AnimalDetail: { animalId: string };
  AddAnimal: undefined;
  CropDetail: { cropId: string };
  AddCrop: undefined;
  TaskList: undefined;
  TaskDetail: { taskId: string };
  AddTask: undefined;
  Profile: undefined;
  Notifications: undefined;
  Settings: undefined;
};

export type ManagerTabParamList = {
  Dashboard: undefined;
  Animals: undefined;
  Crops: undefined;
  Tasks: undefined;
  Profile: undefined;
};

export type WorkerTabParamList = {
  Dashboard: undefined;
  MyTasks: undefined;
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const ManagerTab = createBottomTabNavigator<ManagerTabParamList>();
const WorkerTab = createBottomTabNavigator<WorkerTabParamList>();

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Signup" component={SignupScreen} />
  </Stack.Navigator>
);

// Manager Tab Navigator
const ManagerTabNavigator = () => (
  <ManagerTab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string;

        switch (route.name) {
          case 'Dashboard':
            iconName = 'dashboard';
            break;
          case 'Animals':
            iconName = 'pets';
            break;
          case 'Crops':
            iconName = 'eco';
            break;
          case 'Tasks':
            iconName = 'assignment';
            break;
          case 'Profile':
            iconName = 'person';
            break;
          default:
            iconName = 'circle';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4CAF50',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <ManagerTab.Screen 
      name="Dashboard" 
      component={ManagerDashboardScreen}
      options={{ title: 'Dashboard' }}
    />
    <ManagerTab.Screen 
      name="Animals" 
      component={AnimalListScreen}
      options={{ title: 'Animals' }}
    />
    <ManagerTab.Screen 
      name="Crops" 
      component={CropListScreen}
      options={{ title: 'Crops' }}
    />
    <ManagerTab.Screen 
      name="Tasks" 
      component={TaskListScreen}
      options={{ title: 'Tasks' }}
    />
    <ManagerTab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </ManagerTab.Navigator>
);

// Worker Tab Navigator
const WorkerTabNavigator = () => (
  <WorkerTab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: string;

        switch (route.name) {
          case 'Dashboard':
            iconName = 'dashboard';
            break;
          case 'MyTasks':
            iconName = 'assignment';
            break;
          case 'Profile':
            iconName = 'person';
            break;
          default:
            iconName = 'circle';
        }

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4CAF50',
      tabBarInactiveTintColor: 'gray',
      headerShown: false,
    })}
  >
    <WorkerTab.Screen 
      name="Dashboard" 
      component={WorkerDashboardScreen}
      options={{ title: 'Dashboard' }}
    />
    <WorkerTab.Screen 
      name="MyTasks" 
      component={WorkerTaskListScreen}
      options={{ title: 'My Tasks' }}
    />
    <WorkerTab.Screen 
      name="Profile" 
      component={ProfileScreen}
      options={{ title: 'Profile' }}
    />
  </WorkerTab.Navigator>
);

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  if (!isAuthenticated || !user) {
    return <AuthStack />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#4CAF50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Main" 
        component={user.role === 'manager' ? ManagerTabNavigator : WorkerTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AnimalDetail" 
        component={AnimalDetailScreen}
        options={{ title: 'Animal Details' }}
      />
      <Stack.Screen 
        name="AddAnimal" 
        component={AddAnimalScreen}
        options={{ title: 'Add Animal' }}
      />
      <Stack.Screen 
        name="CropDetail" 
        component={CropDetailScreen}
        options={{ title: 'Crop Details' }}
      />
      <Stack.Screen 
        name="AddCrop" 
        component={AddCropScreen}
        options={{ title: 'Add Crop' }}
      />
      <Stack.Screen 
        name="TaskDetail" 
        component={TaskDetailScreen}
        options={{ title: 'Task Details' }}
      />
      <Stack.Screen 
        name="AddTask" 
        component={AddTaskScreen}
        options={{ title: 'Add Task' }}
      />
      <Stack.Screen 
        name="Notifications" 
        component={NotificationsScreen}
        options={{ title: 'Notifications' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Stack.Navigator>
  );
};

export default function Navigation() {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}