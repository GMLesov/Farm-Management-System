import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { COLORS } from '../config/constants';

// Screens (to be created)
import LoginScreen from '../screens/auth/LoginScreen';
import TasksScreen from '../screens/tasks/TasksScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import ScheduleScreen from '../screens/schedule/ScheduleScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import LeaveScreen from '../screens/leave/LeaveScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator (Main App)
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'home';

          switch (route.name) {
            case 'Tasks':
              iconName = 'assignment';
              break;
            case 'Schedule':
              iconName = 'calendar-today';
              break;
            case 'Leave':
              iconName = 'event-busy';
              break;
            case 'Profile':
              iconName = 'person';
              break;
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.secondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8
        },
        headerStyle: {
          backgroundColor: COLORS.primary
        },
        headerTintColor: COLORS.text.light,
        headerTitleStyle: {
          fontWeight: 'bold'
        }
      })}
    >
      <Tab.Screen 
        name="Tasks" 
        component={TasksScreen}
        options={{ title: 'My Tasks' }}
      />
      <Tab.Screen 
        name="Schedule" 
        component={ScheduleScreen}
        options={{ title: 'Schedule' }}
      />
      <Tab.Screen 
        name="Leave" 
        component={LeaveScreen}
        options={{ title: 'Leave Requests' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Main Navigator
const AppNavigator = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen 
              name="TaskDetail" 
              component={TaskDetailScreen}
              options={{
                headerShown: true,
                title: 'Task Details',
                headerStyle: {
                  backgroundColor: COLORS.primary
                },
                headerTintColor: COLORS.text.light
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
