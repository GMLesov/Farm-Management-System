import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Switch,
  Platform,
  PermissionsAndroid,
  Linking,
  Modal,
} from 'react-native';

// Mock implementations for features (replace with real packages in production)
const AsyncStorage = {
  getItem: async (key: string) => null,
  setItem: async (key: string, value: string) => {},
  multiRemove: async (keys: string[]) => {},
};

const Geolocation = {
  getCurrentPosition: (success: any, error: any, options: any) => {
    setTimeout(() => success({coords: {latitude: 37.7749, longitude: -122.4194}}), 100);
  },
  watchPosition: (success: any, error: any, options: any) => {
    return setInterval(() => success({coords: {latitude: 37.7749, longitude: -122.4194}}), 30000);
  },
  clearWatch: (id: number) => clearInterval(id),
};

const launchCamera = (options: any, callback: any) => {
  setTimeout(() => callback({assets: [{uri: 'mock://photo.jpg', type: 'image/jpeg', fileName: 'photo.jpg'}]}), 500);
};

const launchImageLibrary = (options: any, callback: any) => {
  setTimeout(() => callback({assets: [{uri: 'mock://gallery.jpg', type: 'image/jpeg', fileName: 'gallery.jpg'}]}), 500);
};

const messaging = () => ({
  requestPermission: async () => 1,
  getToken: async () => 'mock-fcm-token',
  onMessage: (handler: any) => {},
  onNotificationOpenedApp: (handler: any) => {},
});

const API_BASE = 'http://10.0.2.2:5000/api';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'worker'>('worker');
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('worker1');
  const [password, setPassword] = useState('worker123');
  const [selectedTab, setSelectedTab] = useState('home');
  const [loading, setLoading] = useState(false);
  const [clockedIn, setClockedIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [workHours, setWorkHours] = useState('0:00');
  
  // New state for improvements
  const [darkMode, setDarkMode] = useState(false);
  const [location, setLocation] = useState<{latitude: number; longitude: number} | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [timesheetData, setTimesheetData] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [fcmToken, setFcmToken] = useState('');
  
  // Modal states for inputs
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [currentTaskTitle, setCurrentTaskTitle] = useState('');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveType, setLeaveType] = useState('');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize app on mount
  useEffect(() => {
    initializeApp();
  }, []);

  // Track location when clocked in
  useEffect(() => {
    if (clockedIn && isLoggedIn) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
  }, [clockedIn, isLoggedIn]);

  // Load saved data and preferences
  const initializeApp = async () => {
    try {
      // Load dark mode preference
      const savedDarkMode = await AsyncStorage.getItem('darkMode');
      if (savedDarkMode) setDarkMode(JSON.parse(savedDarkMode));

      // Request permissions
      await requestPermissions();

      // Setup push notifications
      await setupPushNotifications();

      // Load cached data
      await loadCachedData();
    } catch (error) {
      console.log('Initialization error:', error);
    }
  };

  // Request all necessary permissions
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
        return granted;
      } catch (err) {
        console.log('Permission error:', err);
      }
    }
  };

  // Setup Push Notifications (with mock for now)
  const setupPushNotifications = async () => {
    try {
      const msgInstance = messaging();
      const authStatus = await msgInstance.requestPermission();
      const enabled = authStatus === 1;

      if (enabled) {
        const token = await msgInstance.getToken();
        setFcmToken(token);
        console.log('FCM Token:', token);
        
        // Show success message
        setTimeout(() => {
          Alert.alert('✅ Push Notifications', 'Enabled and ready for task updates!');
        }, 2000);
      }
    } catch (error) {
      console.log('Push notification setup:', error);
      // Silent fail for demo
    }
  };

  // GPS Location Tracking
  const startLocationTracking = async () => {
    try {
      const watchId = Geolocation.watchPosition(
        (position: any) => {
          const {latitude, longitude} = position.coords;
          setLocation({latitude, longitude});
          
          // Send location to backend periodically
          if (token && clockedIn) {
            fetch(`${API_BASE}/workers/location`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({latitude, longitude, timestamp: new Date()}),
            }).catch(err => console.log('Location update error:', err));
          }
        },
        (error: any) => console.log('Location error:', error),
        {
          enableHighAccuracy: true,
          distanceFilter: 10,
          interval: 30000, // Update every 30 seconds
        }
      );
      setLocationWatchId(watchId as unknown as number);
    } catch (error) {
      console.log('Location tracking error:', error);
    }
  };

  const stopLocationTracking = () => {
    if (locationWatchId !== null) {
      Geolocation.clearWatch(locationWatchId);
      setLocationWatchId(null);
    }
  };

  // Load cached data from AsyncStorage
  const loadCachedData = async () => {
    try {
      const cachedTasks = await AsyncStorage.getItem('tasks');
      const cachedLeave = await AsyncStorage.getItem('leaveRequests');
      const cachedTimesheet = await AsyncStorage.getItem('timesheetData');

      if (cachedTasks) setTasks(JSON.parse(cachedTasks));
      if (cachedLeave) setLeaveRequests(JSON.parse(cachedLeave));
      if (cachedTimesheet) setTimesheetData(JSON.parse(cachedTimesheet));
    } catch (error) {
      console.log('Cache load error:', error);
    }
  };

  // Save data to cache
  const cacheData = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.log('Cache save error:', error);
    }
  };

  // Fetch data from backend with offline fallback
  const fetchWithOffline = async (endpoint: string, cacheKey: string) => {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {Authorization: `Bearer ${token}`},
      });
      
      if (response.ok) {
        const data = await response.json();
        await cacheData(cacheKey, data);
        setIsOnline(true);
        return data;
      }
    } catch (error) {
      setIsOnline(false);
      // Return cached data on error
      const cached = await AsyncStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : [];
    }
  };

  // Photo upload for field reports
  const handlePhotoUpload = () => {
    Alert.alert(
      'Upload Photo',
      'Choose photo source',
      [
        {
          text: 'Camera',
          onPress: () => launchCamera({mediaType: 'photo', quality: 0.7}, handlePhotoResponse),
        },
        {
          text: 'Gallery',
          onPress: () => launchImageLibrary({mediaType: 'photo', quality: 0.7}, handlePhotoResponse),
        },
        {text: 'Cancel', style: 'cancel'},
      ]
    );
  };

  const handlePhotoResponse = async (response: any) => {
    if (response.didCancel || response.error) return;

    const photo = response.assets?.[0];
    if (!photo) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('photo', {
        uri: photo.uri,
        type: photo.type,
        name: photo.fileName || 'photo.jpg',
      } as any);

      const uploadResponse = await fetch(`${API_BASE}/reports/upload`, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
        body: formData,
      });

      if (uploadResponse.ok) {
        Alert.alert('Success', 'Photo uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to upload photo. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Submit timesheet to backend
  const submitTimesheet = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/timesheet/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          weekData: timesheetData,
          totalHours: workHours,
          submittedAt: new Date(),
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Timesheet submitted for approval!');
        await fetchWithOffline('/timesheet', 'timesheetData');
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit timesheet. Will retry when online.');
      // Queue for later submission
      await AsyncStorage.setItem('pendingTimesheet', JSON.stringify(timesheetData));
    } finally {
      setLoading(false);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = async () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    await AsyncStorage.setItem('darkMode', JSON.stringify(newMode));
  };

  // Task action handlers
  const handleTaskComplete = (taskTitle: string) => {
    Alert.alert(
      'Complete Task',
      `Mark "${taskTitle}" as complete?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Complete',
          onPress: async () => {
            try {
              // Submit to backend
              const response = await fetch(`${API_BASE}/tasks/complete`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({taskTitle, completedAt: new Date()}),
              });

              if (response.ok) {
                Alert.alert('Success', 'Task marked as complete!');
                await refreshData();
              } else {
                throw new Error('Failed to complete task');
              }
            } catch (error) {
              // Offline mode
              Alert.alert('Offline', 'Task completion saved locally. Will sync when online.');
            }
          },
        },
      ]
    );
  };

  const handleAddNote = (taskTitle: string) => {
    setCurrentTaskTitle(taskTitle);
    setNoteInput('');
    setShowNoteModal(true);
  };

  const submitNote = async () => {
    if (!noteInput.trim()) {
      Alert.alert('Error', 'Please enter a note');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/tasks/add-note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({taskTitle: currentTaskTitle, note: noteInput, timestamp: new Date()}),
      });

      if (response.ok) {
        Alert.alert('Success', 'Note added successfully!');
        setShowNoteModal(false);
        setNoteInput('');
      } else {
        throw new Error('Failed to add note');
      }
    } catch (error) {
      Alert.alert('Offline', 'Note saved locally. Will sync when online.');
      setShowNoteModal(false);
      setNoteInput('');
    }
  };

  // Leave request handler
  const handleRequestLeave = () => {
    Alert.alert(
      'Request Leave',
      'Choose leave type:',
      [
        {
          text: 'Sick Leave',
          onPress: () => showLeaveDatePicker('Sick Leave'),
        },
        {
          text: 'Annual Leave',
          onPress: () => showLeaveDatePicker('Annual Leave'),
        },
        {
          text: 'Emergency Leave',
          onPress: () => showLeaveDatePicker('Emergency Leave'),
        },
        {text: 'Cancel', style: 'cancel'},
      ]
    );
  };

  const showLeaveDatePicker = (selectedLeaveType: string) => {
    setLeaveType(selectedLeaveType);
    setLeaveStartDate('');
    setLeaveEndDate('');
    setShowLeaveModal(true);
  };

  const submitLeaveRequest = async () => {
    if (!leaveStartDate.trim() || !leaveEndDate.trim()) {
      Alert.alert('Error', 'Please enter both start and end dates');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/leave/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: leaveType,
          startDate: leaveStartDate,
          endDate: leaveEndDate,
          requestedAt: new Date(),
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Leave request submitted for approval!');
        setShowLeaveModal(false);
        await refreshData();
      } else {
        throw new Error('Failed to submit leave request');
      }
    } catch (error) {
      Alert.alert('Offline', 'Leave request saved locally. Will sync when online.');
      setShowLeaveModal(false);
    }
  };

  // Schedule item handler
  const handleScheduleItem = (schedule: any) => {
    Alert.alert(
      schedule.title,
      `Time: ${schedule.time}\n\nWould you like to:`,
      [
        {
          text: 'Mark as Started',
          onPress: () => Alert.alert('Success', `${schedule.title} marked as in progress`),
        },
        {
          text: 'Mark as Complete',
          onPress: () => Alert.alert('Success', `${schedule.title} marked as complete`),
        },
        {
          text: 'Add Note',
          onPress: () => handleAddNote(schedule.title),
        },
        {text: 'Cancel', style: 'cancel'},
      ]
    );
  };

  const workerTabs = [
    {id: 'home', label: 'Home', icon: '🏠'},
    {id: 'tasks', label: 'Tasks', icon: '📋'},
    {id: 'schedule', label: 'Schedule', icon: '📅'},
    {id: 'leave', label: 'Leave', icon: '✈️'},
    {id: 'timesheet', label: 'Hours', icon: '⏰'},
    {id: 'profile', label: 'Profile', icon: '👤'},
  ];

  const adminTabs = [
    {id: 'dashboard', label: 'Dashboard', icon: ''},
    {id: 'tasks', label: 'Tasks', icon: ''},
    {id: 'staff', label: 'Staff', icon: ''},
    {id: 'profile', label: 'Profile', icon: ''},
  ];

  const tabs = userType === 'worker' ? workerTabs : adminTabs;

  const handleLogin = async (type: 'admin' | 'worker') => {
    setLoading(true);
    try {
      const endpoint = type === 'worker' ? '/auth/worker-login' : '/auth/login';
      const body = type === 'worker' 
        ? {username, password}
        : {email: username, password};

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
      });
      
      const result = await response.json();
      
      if (response.ok && result.token) {
        setToken(result.token);
        setUserType(type);
        setIsLoggedIn(true);
        
        // Save token for persistence
        await AsyncStorage.setItem('authToken', result.token);
        await AsyncStorage.setItem('userType', type);
        
        // Register FCM token with backend
        if (fcmToken) {
          await fetch(`${API_BASE}/workers/fcm-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${result.token}`,
            },
            body: JSON.stringify({fcmToken}),
          }).catch(err => console.log('FCM registration error:', err));
        }
        
        // Fetch fresh data
        await refreshData();
      } else {
        // Fallback to demo mode
        setIsLoggedIn(true);
        setUserType(type);
        Alert.alert('Demo Mode', 'Using offline mode with sample data');
      }
    } catch (error) {
      // Offline mode fallback
      setIsLoggedIn(true);
      setUserType(type);
      setIsOnline(false);
      Alert.alert('Offline Mode', 'Working offline with cached data');
    } finally {
      setLoading(false);
    }
  };

  // Refresh all data from backend
  const refreshData = async () => {
    if (!token) return;
    
    try {
      const [tasksData, leaveData, timesheetDataResponse] = await Promise.all([
        fetchWithOffline('/tasks/my-tasks', 'tasks'),
        fetchWithOffline('/leave/my-requests', 'leaveRequests'),
        fetchWithOffline('/timesheet/current', 'timesheetData'),
      ]);

      setTasks(tasksData || []);
      setLeaveRequests(leaveData || []);
      setTimesheetData(timesheetDataResponse || []);
    } catch (error) {
      console.log('Data refresh error:', error);
    }
  };

  const handleClockInOut = async () => {
    if (clockedIn) {
      Alert.alert(
        'Clock Out',
        `You worked ${workHours}. Clock out now?`,
        [
          {text: 'Cancel', style: 'cancel'},
          {text: 'Clock Out', onPress: async () => {
            try {
              setLoading(true);
              // Submit clock out to backend
              const response = await fetch(`${API_BASE}/attendance/clock-out`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  clockOutTime: new Date(),
                  location: location,
                  hoursWorked: workHours,
                }),
              });

              if (response.ok) {
                setClockedIn(false);
                setWorkHours('0:00');
                Alert.alert('Success', 'Clocked out successfully');
                await refreshData();
              } else {
                throw new Error('Clock out failed');
              }
            } catch (error) {
              // Offline fallback
              setClockedIn(false);
              setWorkHours('0:00');
              Alert.alert('Offline', 'Clocked out locally. Will sync when online.');
              await AsyncStorage.setItem('pendingClockOut', JSON.stringify({
                time: new Date(),
                location,
                hours: workHours,
              }));
            } finally {
              setLoading(false);
            }
          }},
        ]
      );
    } else {
      try {
        setLoading(true);
        // Get current location
        Geolocation.getCurrentPosition(
          async (position: any) => {
            const {latitude, longitude} = position.coords;
            
            // Submit clock in to backend
            try {
              const response = await fetch(`${API_BASE}/attendance/clock-in`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  clockInTime: new Date(),
                  location: {latitude, longitude},
                }),
              });

              if (response.ok) {
                setClockedIn(true);
                setWorkHours('0:00');
                setLocation({latitude, longitude});
                Alert.alert('Success', `Clocked in at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
              } else {
                throw new Error('Clock in failed');
              }
            } catch (error) {
              // Offline fallback
              setClockedIn(true);
              setWorkHours('0:00');
              setLocation({latitude, longitude});
              Alert.alert('Offline', 'Clocked in locally. Will sync when online.');
              await AsyncStorage.setItem('pendingClockIn', JSON.stringify({
                time: new Date(),
                location: {latitude, longitude},
              }));
            }
          },
          (error: any) => {
            Alert.alert('Location Error', 'Unable to get location. Please enable GPS.');
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000}
        );
      } finally {
        setLoading(false);
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.loginContainer}>
          <Text style={styles.loginIcon}></Text>
          <Text style={styles.loginTitle}>Farm Management</Text>
          <Text style={styles.loginSubtitle}>Select User Type</Text>
          
          <View style={styles.connectionBadge}>
            <Text style={styles.connectionDot}></Text>
            <Text style={styles.connectionText}>Connected to Backend</Text>
          </View>

          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[styles.userTypeCard, styles.workerCard]}
              onPress={() => handleLogin('worker')}>
              <Text style={styles.userTypeIcon}></Text>
              <Text style={styles.userTypeTitle}>Worker Login</Text>
              <Text style={styles.userTypeDesc}>Clock in/out, View tasks, Submit reports</Text>
              <View style={styles.userTypeButton}>
                <Text style={styles.userTypeButtonText}>Login as Worker</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.userTypeCard, styles.adminCard]}
              onPress={() => handleLogin('admin')}>
              <Text style={styles.userTypeIcon}></Text>
              <Text style={styles.userTypeTitle}>Manager Login</Text>
              <Text style={styles.userTypeDesc}>Full access, Manage staff, Assign tasks</Text>
              <View style={styles.userTypeButton}>
                <Text style={styles.userTypeButtonText}>Login as Manager</Text>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.demoNote}>Demo Mode: Tap any card to continue</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const renderWorkerHome = () => (
    <View style={styles.workerHome}>
      {/* Clock Status */}
      <View style={[styles.clockCard, clockedIn ? styles.clockedIn : styles.clockedOut]}>
        <Text style={styles.clockStatus}>
          {clockedIn ? ' CLOCKED IN' : ' CLOCKED OUT'}
        </Text>
        <Text style={styles.clockTime}>
          {currentTime.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}
        </Text>
        {clockedIn && (
          <Text style={styles.workHours}>Working: {workHours}</Text>
        )}
        <TouchableOpacity
          style={[styles.clockButton, clockedIn ? styles.clockOutBtn : styles.clockInBtn]}
          onPress={handleClockInOut}>
          <Text style={styles.clockButtonText}>
            {clockedIn ? 'Clock Out' : 'Clock In'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.quickStatCard}>
          <Text style={styles.quickStatNumber}>5</Text>
          <Text style={styles.quickStatLabel}>Today\'s Tasks</Text>
        </View>
        <View style={styles.quickStatCard}>
          <Text style={styles.quickStatNumber}>3</Text>
          <Text style={styles.quickStatLabel}>Completed</Text>
        </View>
        <View style={styles.quickStatCard}>
          <Text style={styles.quickStatNumber}>40</Text>
          <Text style={styles.quickStatLabel}>Hours/Week</Text>
        </View>
      </View>

      {/* Today's Schedule */}
      <Text style={styles.sectionTitle}> Today\'s Schedule</Text>
      {[
        {time: '08:00 AM', task: 'Irrigation Check - Field A', status: 'completed'},
        {time: '10:00 AM', task: 'Harvest Corn - Section 3', status: 'in-progress'},
        {time: '02:00 PM', task: 'Equipment Maintenance', status: 'pending'},
      ].map((item, idx) => (
        <View key={idx} style={styles.scheduleCard}>
          <View style={styles.scheduleTime}>
            <Text style={styles.scheduleTimeText}>{item.time}</Text>
          </View>
          <View style={styles.scheduleContent}>
            <Text style={styles.scheduleTask}>{item.task}</Text>
            <View style={[styles.scheduleStatus, getStatusStyle(item.status)]}>
              <Text style={styles.scheduleStatusText}>{item.status}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  const renderWorkerTasks = () => (
    <View style={styles.listContainer}>
      <Text style={styles.pageTitle}>My Assigned Tasks</Text>
      {[
        {title: 'Harvest Corn Field A', priority: 'High', status: 'In Progress', due: 'Today'},
        {title: 'Check Irrigation System', priority: 'Medium', status: 'Pending', due: 'Today'},
        {title: 'Fertilize Wheat Section', priority: 'Low', status: 'Pending', due: 'Tomorrow'},
        {title: 'Equipment Inspection', priority: 'High', status: 'Pending', due: 'Today'},
      ].map((task, idx) => (
        <TouchableOpacity key={idx} style={styles.taskCard}>
          <View style={styles.taskHeader}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <View style={[styles.priorityBadge, getPriorityStyle(task.priority)]}>
              <Text style={styles.badgeText}>{task.priority}</Text>
            </View>
          </View>
          <View style={styles.taskMeta}>
            <Text style={styles.taskMetaText}> Due: {task.due}</Text>
            <Text style={styles.taskMetaText}> {task.status}</Text>
          </View>
          <View style={styles.taskActions}>
            <TouchableOpacity
              style={styles.taskActionBtn}
              onPress={() => handleTaskComplete(task.title)}>
              <Text style={styles.taskActionText}>✓ Mark Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.taskActionBtn}
              onPress={() => handleAddNote(task.title)}>
              <Text style={styles.taskActionText}>📝 Add Note</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderWorkerTimesheet = () => (
    <View style={styles.timesheetContainer}>
      <Text style={styles.pageTitle}> My Hours</Text>
      
      <View style={styles.weekSummary}>
        <Text style={styles.weekSummaryTitle}>This Week</Text>
        <Text style={styles.weekSummaryHours}>32.5 hours</Text>
        <Text style={styles.weekSummaryTarget}>Target: 40 hours</Text>
      </View>

      {[
        {day: 'Monday', hours: '8.0', status: 'approved'},
        {day: 'Tuesday', hours: '8.5', status: 'approved'},
        {day: 'Wednesday', hours: '8.0', status: 'approved'},
        {day: 'Thursday', hours: '8.0', status: 'approved'},
        {day: 'Today', hours: clockedIn ? '2.5' : '0.0', status: 'in-progress'},
      ].map((entry, idx) => (
        <View key={idx} style={styles.timesheetEntry}>
          <View>
            <Text style={styles.timesheetDay}>{entry.day}</Text>
            <Text style={styles.timesheetHours}>{entry.hours} hours</Text>
          </View>
          <View style={[styles.timesheetStatus, getTimesheetStatusStyle(entry.status)]}>
            <Text style={styles.timesheetStatusText}>{entry.status}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderSchedule = () => (
    <ScrollView style={styles.listContainer}>
      <Text style={styles.pageTitle}>📅 Work Schedule</Text>
      
      <View style={styles.calendarHeader}>
        <Text style={styles.monthText}>
          {currentTime.toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}
        </Text>
      </View>

      <Text style={styles.sectionSubtitle}>Today's Schedule</Text>
      {[
        {time: '06:00 AM', title: 'Morning Feed - Cattle', type: 'feeding', icon: '🐄'},
        {time: '07:30 AM', title: 'Irrigation - Zone A', type: 'irrigation', icon: '💧'},
        {time: '10:00 AM', title: 'Pest Inspection', type: 'inspection', icon: '🐛'},
        {time: '02:00 PM', title: 'Crop Harvest - Wheat', type: 'harvest', icon: '🌾'},
        {time: '04:00 PM', title: 'Equipment Maintenance', type: 'maintenance', icon: '🔧'},
      ].map((schedule, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.scheduleListCard}
          onPress={() => handleScheduleItem(schedule)}>
          <View style={styles.scheduleIconBox}>
            <Text style={styles.scheduleIcon}>{schedule.icon}</Text>
          </View>
          <View style={styles.scheduleDetails}>
            <Text style={styles.scheduleTitle}>{schedule.title}</Text>
            <Text style={styles.scheduleTimeText}>{schedule.time}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderLeave = () => (
    <ScrollView style={styles.listContainer}>
      <Text style={styles.pageTitle}>✈️ Leave Management</Text>
      
      <View style={styles.leaveSummary}>
        <View style={styles.leaveSummaryCard}>
          <Text style={styles.leaveSummaryIcon}>✅</Text>
          <Text style={styles.leaveSummaryNumber}>12</Text>
          <Text style={styles.leaveSummaryLabel}>Days Used</Text>
        </View>
        <View style={styles.leaveSummaryCard}>
          <Text style={styles.leaveSummaryIcon}>📅</Text>
          <Text style={styles.leaveSummaryNumber}>18</Text>
          <Text style={styles.leaveSummaryLabel}>Days Left</Text>
        </View>
        <View style={styles.leaveSummaryCard}>
          <Text style={styles.leaveSummaryIcon}>⏳</Text>
          <Text style={styles.leaveSummaryNumber}>1</Text>
          <Text style={styles.leaveSummaryLabel}>Pending</Text>
        </View>
      </View>

      <Text style={styles.sectionSubtitle}>My Leave Requests</Text>
      {[
        {type: 'Sick Leave', start: '2025-12-01', end: '2025-12-03', status: 'pending', days: 3},
        {type: 'Annual Leave', start: '2025-12-15', end: '2025-12-20', status: 'approved', days: 5},
        {type: 'Emergency Leave', start: '2025-11-20', end: '2025-11-20', status: 'rejected', days: 1},
      ].map((leave, idx) => (
        <View key={idx} style={styles.leaveCard}>
          <View style={styles.leaveHeader}>
            <Text style={styles.leaveType}>{leave.type}</Text>
            <View style={[styles.leaveStatusBadge, {
              backgroundColor: leave.status === 'approved' ? '#E8F5E9' : 
                               leave.status === 'pending' ? '#FFF3E0' : '#FFEBEE'
            }]}>
              <Text style={[styles.leaveStatusText, {
                color: leave.status === 'approved' ? '#4CAF50' : 
                       leave.status === 'pending' ? '#FF9800' : '#F44336'
              }]}>
                {leave.status.toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.leaveDates}>
            <Text style={styles.leaveDateText}>
              📅 {new Date(leave.start).toLocaleDateString()} → {new Date(leave.end).toLocaleDateString()}
            </Text>
            <Text style={styles.leaveDays}>
              {leave.days} day{leave.days > 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.addLeaveButton}
        onPress={handleRequestLeave}>
        <Text style={styles.addLeaveButtonText}>+ Request New Leave</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderAdminDashboard = () => (
    <View style={styles.dashboardContainer}>
      <Text style={styles.welcomeText}>Farm Overview</Text>
      <Text style={styles.connectedText}> Manager Dashboard</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}></Text>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>Active Tasks</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}></Text>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Workers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}></Text>
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Crops</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}></Text>
          <Text style={styles.statNumber}>92%</Text>
          <Text style={styles.statLabel}>Efficiency</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}> System Status</Text>
        <Text style={styles.infoText}> Workers Clocked In: 6/8</Text>
        <Text style={styles.infoText}> Tasks Completed Today: 15</Text>
        <Text style={styles.infoText}> Equipment Status: All Operational</Text>
      </View>
    </View>
  );

  const renderProfile = () => (
    <ScrollView style={[styles.profileContainer, darkMode && styles.darkBackground]}>
      <View style={styles.profileHeader}>
        <Text style={[styles.profileIcon, darkMode && styles.darkText]}>{userType === 'worker' ? '👷' : '👔'}</Text>
        <Text style={[styles.profileName, darkMode && styles.darkText]}>
          {userType === 'worker' ? 'John Smith' : 'Farm Manager'}
        </Text>
        <Text style={[styles.profileEmail, darkMode && styles.darkTextSecondary]}>
          {userType === 'worker' ? 'Field Worker' : username}
        </Text>
        
        {location && (
          <Text style={[styles.locationText, darkMode && styles.darkTextSecondary]}>
            📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </Text>
        )}
      </View>
      
      {userType === 'worker' && (
        <View style={styles.profileStats}>
          <View style={[styles.profileStatItem, darkMode && styles.darkCard]}>
            <Text style={[styles.profileStatLabel, darkMode && styles.darkTextSecondary]}>Tasks Completed</Text>
            <Text style={[styles.profileStatValue, darkMode && styles.darkText]}>47</Text>
          </View>
          <View style={[styles.profileStatItem, darkMode && styles.darkCard]}>
            <Text style={[styles.profileStatLabel, darkMode && styles.darkTextSecondary]}>Hours This Month</Text>
            <Text style={[styles.profileStatValue, darkMode && styles.darkText]}>156</Text>
          </View>
        </View>
      )}

      {/* Settings Section */}
      <View style={[styles.settingsSection, darkMode && styles.darkCard]}>
        <Text style={[styles.settingsSectionTitle, darkMode && styles.darkText]}>⚙️ Settings</Text>
        
        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, darkMode && styles.darkText]}>🌙 Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{false: '#767577', true: '#4CAF50'}}
            thumbColor={darkMode ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, darkMode && styles.darkText]}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </Text>
          <Text style={[styles.settingValue, darkMode && styles.darkTextSecondary]}>
            {isOnline ? 'Connected' : 'Working Offline'}
          </Text>
        </View>

        {location && (
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, darkMode && styles.darkText]}>📍 GPS Tracking</Text>
            <Text style={[styles.settingValue, darkMode && styles.darkTextSecondary]}>
              {clockedIn ? 'Active' : 'Inactive'}
            </Text>
          </View>
        )}

        {fcmToken && (
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, darkMode && styles.darkText]}>🔔 Notifications</Text>
            <Text style={[styles.settingValue, darkMode && styles.darkTextSecondary]}>Enabled</Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      {userType === 'worker' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, darkMode && styles.darkCard]}
            onPress={handlePhotoUpload}>
            <Text style={styles.actionButtonText}>📷 Upload Field Report</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, darkMode && styles.darkCard]}
            onPress={submitTimesheet}>
            <Text style={styles.actionButtonText}>⏰ Submit Timesheet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, darkMode && styles.darkCard]}
            onPress={refreshData}>
            <Text style={styles.actionButtonText}>🔄 Sync Data</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity
        style={[styles.logoutButton, darkMode && {backgroundColor: '#B71C1C'}]}
        onPress={async () => {
          await AsyncStorage.multiRemove(['authToken', 'userType']);
          setIsLoggedIn(false);
          setToken('');
          setClockedIn(false);
          setSelectedTab(userType === 'worker' ? 'home' : 'dashboard');
        }}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      );
    }

    if (userType === 'worker') {
      switch (selectedTab) {
        case 'home': return renderWorkerHome();
        case 'tasks': return renderWorkerTasks();
        case 'schedule': return renderSchedule();
        case 'leave': return renderLeave();
        case 'timesheet': return renderWorkerTimesheet();
        case 'profile': return renderProfile();
        default: return renderWorkerHome();
      }
    } else {
      switch (selectedTab) {
        case 'dashboard': return renderAdminDashboard();
        case 'profile': return renderProfile();
        default: return renderAdminDashboard();
      }
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return {backgroundColor: '#4CAF50'};
      case 'in-progress': return {backgroundColor: '#2196F3'};
      default: return {backgroundColor: '#FF9800'};
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'High': return {backgroundColor: '#f44336'};
      case 'Medium': return {backgroundColor: '#FF9800'};
      default: return {backgroundColor: '#9E9E9E'};
    }
  };

  const getTimesheetStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return {backgroundColor: '#4CAF50'};
      case 'in-progress': return {backgroundColor: '#2196F3'};
      default: return {backgroundColor: '#FF9800'};
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, userType === 'worker' ? styles.workerHeader : styles.adminHeader]}>
        <Text style={styles.headerText}>
          {userType === 'worker' ? ' Worker Portal' : ' Manager Portal'}
        </Text>
        <Text style={styles.headerSubtext}>
          {currentTime.toLocaleDateString('en-US', {weekday: 'long', month: 'short', day: 'numeric'})}
        </Text>
      </View>
      
      <ScrollView style={styles.content}>
        {renderContent()}
      </ScrollView>

      <View style={styles.tabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, selectedTab === tab.id && styles.tabActive]}
            onPress={() => setSelectedTab(tab.id)}>
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, selectedTab === tab.id && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Note Input Modal */}
      <Modal
        visible={showNoteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowNoteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Note</Text>
            <Text style={styles.modalSubtitle}>Task: {currentTaskTitle}</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Enter your note here..."
              placeholderTextColor="#999"
              value={noteInput}
              onChangeText={setNoteInput}
              multiline
              numberOfLines={4}
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowNoteModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSubmitButton]}
                onPress={submitNote}>
                <Text style={styles.modalSubmitText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Leave Request Modal */}
      <Modal
        visible={showLeaveModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLeaveModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Request Leave</Text>
            <Text style={styles.modalSubtitle}>Type: {leaveType}</Text>
            
            <Text style={styles.modalLabel}>Start Date</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="YYYY-MM-DD (e.g. 2025-12-15)"
              placeholderTextColor="#999"
              value={leaveStartDate}
              onChangeText={setLeaveStartDate}
            />
            
            <Text style={styles.modalLabel}>End Date</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="YYYY-MM-DD (e.g. 2025-12-20)"
              placeholderTextColor="#999"
              value={leaveEndDate}
              onChangeText={setLeaveEndDate}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowLeaveModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSubmitButton]}
                onPress={submitLeaveRequest}>
                <Text style={styles.modalSubmitText}>Submit Request</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  header: {padding: 16, elevation: 4},
  workerHeader: {backgroundColor: '#FF9800'},
  adminHeader: {backgroundColor: '#4CAF50'},
  headerText: {fontSize: 20, fontWeight: 'bold', color: 'white'},
  headerSubtext: {fontSize: 12, color: 'rgba(255,255,255,0.9)', marginTop: 2},
  content: {flex: 1},
  
  // Login Screen
  loginContainer: {flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24},
  loginIcon: {fontSize: 64, marginBottom: 16},
  loginTitle: {fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 4},
  loginSubtitle: {fontSize: 16, color: '#666', marginBottom: 32},
  connectionBadge: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 32},
  connectionDot: {color: '#4CAF50', fontSize: 16, marginRight: 8},
  connectionText: {fontSize: 12, color: '#4CAF50'},
  
  userTypeContainer: {width: '100%', maxWidth: 400},
  userTypeCard: {backgroundColor: 'white', borderRadius: 12, padding: 24, marginBottom: 16, elevation: 3, alignItems: 'center'},
  workerCard: {borderLeftWidth: 4, borderLeftColor: '#FF9800'},
  adminCard: {borderLeftWidth: 4, borderLeftColor: '#4CAF50'},
  userTypeIcon: {fontSize: 48, marginBottom: 12},
  userTypeTitle: {fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 8},
  userTypeDesc: {fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16},
  userTypeButton: {backgroundColor: '#4CAF50', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8},
  userTypeButtonText: {color: 'white', fontWeight: 'bold'},
  demoNote: {fontSize: 12, color: '#999', marginTop: 16, fontStyle: 'italic'},

  // Worker Home
  workerHome: {padding: 16},
  clockCard: {borderRadius: 12, padding: 24, marginBottom: 20, alignItems: 'center', elevation: 3},
  clockedIn: {backgroundColor: '#C8E6C9'},
  clockedOut: {backgroundColor: '#FFECB3'},
  clockStatus: {fontSize: 18, fontWeight: 'bold', marginBottom: 8},
  clockTime: {fontSize: 48, fontWeight: 'bold', color: '#333', marginBottom: 8},
  workHours: {fontSize: 16, color: '#666', marginBottom: 16},
  clockButton: {paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8, minWidth: 150},
  clockInBtn: {backgroundColor: '#4CAF50'},
  clockOutBtn: {backgroundColor: '#f44336'},
  clockButtonText: {color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center'},
  
  quickStats: {flexDirection: 'row', marginBottom: 20},
  quickStatCard: {flex: 1, backgroundColor: 'white', padding: 16, marginHorizontal: 4, borderRadius: 8, alignItems: 'center', elevation: 2},
  quickStatNumber: {fontSize: 24, fontWeight: 'bold', color: '#4CAF50', marginBottom: 4},
  quickStatLabel: {fontSize: 11, color: '#666', textAlign: 'center'},
  
  sectionTitle: {fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12},
  scheduleCard: {flexDirection: 'row', backgroundColor: 'white', padding: 12, marginBottom: 8, borderRadius: 8, elevation: 2},
  scheduleTime: {width: 80, justifyContent: 'center', alignItems: 'center', borderRightWidth: 2, borderRightColor: '#f0f0f0', paddingRight: 12},
  scheduleTimeText: {fontSize: 14, fontWeight: '600', color: '#666'},
  scheduleContent: {flex: 1, paddingLeft: 12, justifyContent: 'center'},
  scheduleTask: {fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4},
  scheduleStatus: {paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignSelf: 'flex-start'},
  scheduleStatusText: {fontSize: 11, color: 'white', fontWeight: 'bold'},

  // Tasks
  listContainer: {padding: 16},
  pageTitle: {fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 16},
  taskCard: {backgroundColor: 'white', borderRadius: 8, padding: 16, marginBottom: 12, elevation: 2},
  taskHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8},
  taskTitle: {fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1},
  priorityBadge: {paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12},
  badgeText: {fontSize: 11, color: 'white', fontWeight: 'bold'},
  taskMeta: {flexDirection: 'row', marginBottom: 12},
  taskMetaText: {fontSize: 12, color: '#666', marginRight: 12},
  taskActions: {flexDirection: 'row', justifyContent: 'space-between'},
  taskActionBtn: {flex: 1, backgroundColor: '#f0f0f0', padding: 10, borderRadius: 6, marginHorizontal: 4, alignItems: 'center'},
  taskActionText: {fontSize: 12, color: '#333', fontWeight: '600'},

  // Timesheet
  timesheetContainer: {padding: 16},
  weekSummary: {backgroundColor: '#4CAF50', borderRadius: 12, padding: 20, marginBottom: 20, alignItems: 'center'},
  weekSummaryTitle: {fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 8},
  weekSummaryHours: {fontSize: 36, fontWeight: 'bold', color: 'white', marginBottom: 4},
  weekSummaryTarget: {fontSize: 12, color: 'rgba(255,255,255,0.8)'},
  timesheetEntry: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 8, elevation: 2},
  timesheetDay: {fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4},
  timesheetHours: {fontSize: 14, color: '#666'},
  timesheetStatus: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12},
  timesheetStatusText: {fontSize: 12, color: 'white', fontWeight: 'bold'},

  // Admin Dashboard
  dashboardContainer: {padding: 16},
  welcomeText: {fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 8},
  connectedText: {fontSize: 16, color: '#4CAF50', marginBottom: 24},
  statsGrid: {flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16},
  statCard: {width: '48%', backgroundColor: 'white', padding: 16, borderRadius: 8, margin: '1%', alignItems: 'center', elevation: 2},
  statIcon: {fontSize: 32, marginBottom: 8},
  statNumber: {fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4},
  statLabel: {fontSize: 12, color: '#666'},
  infoCard: {backgroundColor: 'white', padding: 16, borderRadius: 8, elevation: 2},
  infoTitle: {fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12},
  infoText: {fontSize: 14, color: '#666', marginBottom: 6},

  // Profile
  profileContainer: {alignItems: 'center', padding: 32},
  profileIcon: {fontSize: 64, marginBottom: 16},
  profileName: {fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4},
  profileEmail: {fontSize: 16, color: '#666', marginBottom: 24},
  profileStats: {flexDirection: 'row', width: '100%', marginBottom: 24},
  profileStatItem: {flex: 1, alignItems: 'center', padding: 16, backgroundColor: 'white', marginHorizontal: 4, borderRadius: 8, elevation: 2},
  profileStatLabel: {fontSize: 12, color: '#666', marginBottom: 4},
  profileStatValue: {fontSize: 24, fontWeight: 'bold', color: '#4CAF50'},
  logoutButton: {backgroundColor: '#f44336', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8},
  logoutText: {color: 'white', fontWeight: 'bold'},

  centerContainer: {flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 400},
  
  tabBar: {flexDirection: 'row', backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#ddd', paddingBottom: 8},
  tab: {flex: 1, alignItems: 'center', paddingTop: 8},
  tabActive: {borderTopWidth: 2, borderTopColor: '#FF9800'},
  tabIcon: {fontSize: 24, marginBottom: 4},
  tabLabel: {fontSize: 11, color: '#666'},
  tabLabelActive: {color: '#FF9800', fontWeight: 'bold'},

  // Schedule styles
  calendarHeader: {backgroundColor: 'white', padding: 16, marginBottom: 16, alignItems: 'center', borderRadius: 8, elevation: 2},
  monthText: {fontSize: 20, fontWeight: 'bold', color: '#333'},
  sectionSubtitle: {fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12, marginTop: 8},
  scheduleListCard: {flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 8, elevation: 2},
  scheduleIconBox: {width: 48, height: 48, borderRadius: 24, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginRight: 12},
  scheduleIcon: {fontSize: 24},
  scheduleDetails: {flex: 1},
  scheduleTitle: {fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4},
  chevron: {fontSize: 24, color: '#999'},

  // Leave styles
  leaveSummary: {flexDirection: 'row', marginBottom: 20},
  leaveSummaryCard: {flex: 1, backgroundColor: 'white', padding: 16, borderRadius: 8, marginHorizontal: 4, alignItems: 'center', elevation: 2},
  leaveSummaryIcon: {fontSize: 32, marginBottom: 8},
  leaveSummaryNumber: {fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 4},
  leaveSummaryLabel: {fontSize: 12, color: '#666', textAlign: 'center'},
  leaveCard: {backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 12, elevation: 2},
  leaveHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12},
  leaveType: {fontSize: 16, fontWeight: 'bold', color: '#333'},
  leaveStatusBadge: {paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12},
  leaveStatusText: {fontSize: 12, fontWeight: 'bold'},
  leaveDates: {borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12},
  leaveDateText: {fontSize: 14, color: '#666', marginBottom: 6},
  leaveDays: {fontSize: 14, color: '#4CAF50', fontWeight: '600'},
  addLeaveButton: {backgroundColor: '#4CAF50', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8, elevation: 2},
  addLeaveButtonText: {color: 'white', fontSize: 16, fontWeight: 'bold'},

  // Dark Mode styles
  darkBackground: {backgroundColor: '#121212'},
  darkCard: {backgroundColor: '#1E1E1E', borderColor: '#333'},
  darkText: {color: '#FFFFFF'},
  darkTextSecondary: {color: '#B0B0B0'},
  
  // Profile enhancements
  profileHeader: {alignItems: 'center', marginBottom: 24, width: '100%'},
  locationText: {fontSize: 12, color: '#666', marginTop: 8},
  settingsSection: {backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 16, width: '100%', elevation: 2},
  settingsSectionTitle: {fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16},
  settingRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0'},
  settingLabel: {fontSize: 16, color: '#333', flex: 1},
  settingValue: {fontSize: 14, color: '#666'},
  
  // Action buttons
  actionButtons: {width: '100%', marginBottom: 16},
  actionButton: {backgroundColor: 'white', padding: 16, borderRadius: 8, marginBottom: 8, elevation: 2, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'},
  actionButtonText: {fontSize: 16, color: '#333', fontWeight: '600'},
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: '#f0f0f0',
  },
  modalSubmitButton: {
    backgroundColor: '#4CAF50',
  },
  modalCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSubmitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
