import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  BottomNavigation,
  BottomNavigationAction,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  Divider,
  LinearProgress,
  IconButton,
  TextField,
  Fab,
  Snackbar,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel
} from '@mui/material';
import { workerApi } from '../../services/workerApi';
import socketClient from '../../socket/client';
import { dbManager } from '../../services/indexedDBManager';
import { mediaManager } from '../../services/mediaCaptureManager';
import { pushManager } from '../../services/pushNotificationManager';
import { swManager } from '../../services/serviceWorkerManager';
import {
  Assignment as TaskIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  PhotoCamera as CameraIcon,
  Pets as PetsIcon,
  Agriculture as AgricultureIcon,
  Warning as WarningIcon,
  Mic as MicIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  MyLocation as GpsIcon,
  CloudOff as OfflineIcon,
  CloudDone as OnlineIcon,
  Report as ReportIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Build as EquipmentIcon,
  Grass as CropIcon,
  Medication as HealthIcon,
  Event as LeaveIcon,
  CalendarMonth as CalendarIcon,
  HourglassEmpty as PendingIcon,
  Close as DeniedIcon
} from '@mui/icons-material';

interface Task {
  _id?: string;
  id?: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  location: string;
  deadline: string;
  dueDate?: string;
  type: 'animals' | 'crops' | 'maintenance' | string;
  assignedTo?: any;
  assignedBy?: any;
  notes?: string;
  photos?: string[];
  createdAt?: string;
}

interface LeaveRequest {
  _id?: string;
  id?: number;
  type: string;
  start?: string;
  end?: string;
  startDate?: string;
  endDate?: string;
  status: 'pending' | 'approved' | 'denied';
  reason: string;
}

const WorkerMobileDashboard: React.FC = () => {
  const [bottomNav, setBottomNav] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [taskTimer, setTaskTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [voiceNote, setVoiceNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' | 'warning' });
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [reportConcern, setReportConcern] = useState('');
  const [reportPhotos, setReportPhotos] = useState<string[]>([]);
  const [reportCategory, setReportCategory] = useState('equipment');
  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
  const [leaveType, setLeaveType] = useState('vacation');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [openRotaDialog, setOpenRotaDialog] = useState(false);
  const [openCalendarDialog, setOpenCalendarDialog] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [user, setUser] = useState<any>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [offlineMode, setOfflineMode] = useState(!navigator.onLine);
  const videoRef = useRef<HTMLVideoElement>(null);

  const workerName = user?.name || "Worker";
  const workerRole = user?.role || "Farm Worker";

  // Calendar Events
  const calendarEvents = [
    { id: 1, title: 'Safety Training', date: '2025-11-22', type: 'special', description: 'Mandatory safety training for all workers', color: '#2196f3' },
    { id: 2, title: 'Harvest Festival', date: '2025-11-28', type: 'special', description: 'Community harvest celebration', color: '#9c27b0' },
    { id: 3, title: 'Farm Equipment Maintenance', date: '2025-11-18', type: 'special', description: 'Annual equipment inspection', color: '#2196f3' },
    { id: 4, title: 'Farm Inspection', date: '2025-11-25', type: 'special', description: 'Government regulatory inspection', color: '#f44336' },
    { id: 5, title: 'Team Meeting', date: '2025-12-01', type: 'special', description: 'Monthly team meeting', color: '#2196f3' },
  ];

  // Team Schedule Data - Who is on/off
  const teamSchedule = [
    { id: 1, name: 'John Doe (You)', date: '2025-11-14', shift: 'Morning (7AM-3PM)', status: 'on' },
    { id: 2, name: 'Jane Smith', date: '2025-11-14', shift: 'Morning (7AM-3PM)', status: 'on' },
    { id: 3, name: 'Mike Johnson', date: '2025-11-14', shift: 'Afternoon (3PM-11PM)', status: 'on' },
    { id: 4, name: 'Sarah Williams', date: '2025-11-14', shift: 'Off', status: 'off' },
    { id: 5, name: 'Tom Brown', date: '2025-11-14', shift: 'Morning (7AM-3PM)', status: 'on' },
    { id: 6, name: 'John Doe (You)', date: '2025-11-15', shift: 'Afternoon (3PM-11PM)', status: 'on' },
    { id: 7, name: 'Jane Smith', date: '2025-11-15', shift: 'Off', status: 'off' },
    { id: 8, name: 'Mike Johnson', date: '2025-11-15', shift: 'Morning (7AM-3PM)', status: 'on' },
    { id: 9, name: 'Sarah Williams', date: '2025-11-15', shift: 'Morning (7AM-3PM)', status: 'on' },
    { id: 10, name: 'Tom Brown', date: '2025-11-15', shift: 'Off', status: 'off' },
    { id: 11, name: 'John Doe (You)', date: '2025-11-16', shift: 'Off', status: 'off' },
    { id: 12, name: 'Jane Smith', date: '2025-11-16', shift: 'Morning (7AM-3PM)', status: 'on' },
    { id: 13, name: 'Mike Johnson', date: '2025-11-16', shift: 'Afternoon (3PM-11PM)', status: 'on' },
    { id: 14, name: 'Sarah Williams', date: '2025-11-16', shift: 'Morning (7AM-3PM)', status: 'on' },
    { id: 15, name: 'Tom Brown', date: '2025-11-16', shift: 'Morning (7AM-3PM)', status: 'on' },
  ];
  const tasksCompleted = tasks.filter(t => t.status === 'completed').length;
  const tasksPending = tasks.filter(t => t.status === 'pending').length;
  const tasksInProgress = tasks.filter(t => t.status === 'in-progress').length;

  // Initialize PWA features
  useEffect(() => {
    const initializePWA = async () => {
      try {
        // Initialize IndexedDB
        await dbManager.initialize();
        console.log('[PWA] IndexedDB initialized');

        // Register Service Worker
        await swManager.register({
          onSuccess: () => {
            console.log('[PWA] Service Worker registered');
            setSnackbar({ 
              open: true, 
              message: 'App ready for offline use!', 
              severity: 'success' 
            });
          },
          onUpdate: () => {
            setSnackbar({ 
              open: true, 
              message: 'New version available! Refresh to update.', 
              severity: 'info' 
            });
          }
        });

        // Check push notification permission
        if ('Notification' in window) {
          const permission = Notification.permission;
          setPushEnabled(permission === 'granted');
        }
      } catch (error) {
        console.error('[PWA] Initialization failed:', error);
      }
    };

    initializePWA();
  }, []);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userStr = localStorage.getItem('user');
        if (userStr) {
          setUser(JSON.parse(userStr));
        }

        // Try to load from IndexedDB first (offline support)
        if (dbManager.isInitialized()) {
          const cachedTasks = await dbManager.getTasks();
          if (cachedTasks.length > 0) {
            setTasks(cachedTasks);
            setLoading(false);
          }

          const cachedLeaves = await dbManager.getLeaveRequests();
          if (cachedLeaves.length > 0) {
            setLeaveRequests(cachedLeaves);
          }
        }

        // Fetch from API
        const fetchedTasks = await workerApi.getTasks();
        setTasks(fetchedTasks);
        
        // Save to IndexedDB
        if (dbManager.isInitialized()) {
          await dbManager.saveTasks(fetchedTasks);
        }

        // Fetch leave requests
        const fetchedLeaves = await workerApi.getLeaveRequests();
        setLeaveRequests(fetchedLeaves);
        
        // Save to IndexedDB
        if (dbManager.isInitialized()) {
          await dbManager.saveLeaveRequests(fetchedLeaves);
        }

        // Connect to Socket.io for real-time updates
        const token = localStorage.getItem('token');
        if (token) {
          socketClient.connect(token);
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setSnackbar({ 
          open: true, 
          message: 'Failed to load data. Working offline.', 
          severity: 'warning' 
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      socketClient.disconnect();
    };
  }, []);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setOpenTaskDialog(true);
  };

  const handleStartTask = async (task: Task) => {
    try {
      const taskId = task._id || task.id?.toString() || '';
      await workerApi.startTask(taskId);
      
      // Update local state
      setTasks(tasks.map(t => 
        (t._id || t.id) === (task._id || task.id) 
          ? { ...t, status: 'in-progress' as const } 
          : t
      ));
      
      setSelectedTask({ ...task, status: 'in-progress' });
      handleStartTimer();
      setSnackbar({ open: true, message: 'Task started!', severity: 'success' });
    } catch (error: any) {
      console.error('Start task error:', error);
      setSnackbar({ open: true, message: 'Failed to start task', severity: 'error' });
    }
  };

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTaskTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Online/offline detection with data sync
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setSnackbar({ open: true, message: 'Back online! Syncing data...', severity: 'success' });
      
      // Sync offline changes
      try {
        const offlineData = localStorage.getItem('offlineChanges');
        if (offlineData) {
          const changes = JSON.parse(offlineData);
          await workerApi.syncOfflineData(changes);
          localStorage.removeItem('offlineChanges');
        }
        
        // Refresh data from server
        await handlePullRefresh();
      } catch (error) {
        console.error('Sync error:', error);
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setSnackbar({ open: true, message: 'Working offline. Changes will sync when online.', severity: 'info' });
      
      // Save current tasks to localStorage
      localStorage.setItem('workerTasks', JSON.stringify(tasks));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [tasks]);

  const handlePullRefresh = async () => {
    setIsRefreshing(true);
    try {
      const fetchedTasks = await workerApi.getTasks();
      setTasks(fetchedTasks);
      const fetchedLeaves = await workerApi.getLeaveRequests();
      setLeaveRequests(fetchedLeaves);
      setSnackbar({ open: true, message: 'Tasks refreshed!', severity: 'success' });
    } catch (error) {
      console.error('Refresh error:', error);
      setSnackbar({ open: true, message: 'Refresh failed', severity: 'error' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStartTimer = () => {
    setIsTimerRunning(true);
    setSnackbar({ open: true, message: 'Timer started', severity: 'info' });
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    setSnackbar({ open: true, message: `Task completed in ${formatTime(taskTimer)}`, severity: 'success' });
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGpsLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setSnackbar({ open: true, message: 'Location verified!', severity: 'success' });
        },
        () => {
          setSnackbar({ open: true, message: 'Unable to get location', severity: 'error' });
        }
      );
    }
  };

  const handleVoiceRecord = async () => {
    try {
      if (!isRecording) {
        // Start recording
        const hasPermission = await mediaManager.requestMicrophonePermission();
        if (!hasPermission) {
          setSnackbar({ open: true, message: 'Microphone permission denied', severity: 'error' });
          return;
        }

        await mediaManager.startRecording();
        setIsRecording(true);
        setSnackbar({ open: true, message: 'Recording...', severity: 'info' });
      } else {
        // Stop recording
        const audio = await mediaManager.stopRecording();
        setIsRecording(false);
        
        // Upload voice note
        const url = await workerApi.uploadVoiceNote(audio.blob);
        setVoiceNote(`Voice note recorded (${Math.round(audio.duration / 1000)}s)`);
        
        // Save to IndexedDB
        if (selectedTask && dbManager.isInitialized()) {
          await dbManager.savePhoto({
            taskId: selectedTask._id || selectedTask.id?.toString(),
            data: audio.blob,
            timestamp: audio.timestamp
          });
        }
        
        setSnackbar({ open: true, message: 'Voice note saved!', severity: 'success' });
      }
    } catch (error: any) {
      console.error('Voice recording error:', error);
      setIsRecording(false);
      setSnackbar({ open: true, message: 'Recording failed', severity: 'error' });
    }
  };

  const handleCameraCapture = async () => {
    try {
      if (!cameraActive) {
        // Open camera
        const hasPermission = await mediaManager.requestCameraPermission();
        if (!hasPermission) {
          setSnackbar({ open: true, message: 'Camera permission denied', severity: 'error' });
          return;
        }

        if (videoRef.current) {
          await mediaManager.startCamera(videoRef.current);
          setCameraActive(true);
        }
      } else {
        // Capture photo
        const photo = await mediaManager.capturePhoto(videoRef.current || undefined);
        
        // Upload photo
        const file = new File([photo.blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const url = await workerApi.uploadPhoto(file);
        
        setReportPhotos([...reportPhotos, url]);
        
        // Save to IndexedDB
        if (selectedTask && dbManager.isInitialized()) {
          await dbManager.savePhoto({
            taskId: selectedTask._id || selectedTask.id?.toString(),
            data: photo.blob,
            timestamp: photo.timestamp
          });
        }
        
        mediaManager.stopCamera();
        setCameraActive(false);
        setSnackbar({ open: true, message: 'Photo captured!', severity: 'success' });
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      setCameraActive(false);
      setSnackbar({ open: true, message: 'Camera failed', severity: 'error' });
    }
  };

  const handleTogglePushNotifications = async () => {
    try {
      if (!pushEnabled) {
        // Enable push notifications
        const permission = await pushManager.requestPermission();
        if (permission !== 'granted') {
          setSnackbar({ open: true, message: 'Notification permission denied', severity: 'error' });
          return;
        }

        // Note: You need to configure Firebase in your project
        // For now, just show test notification
        await pushManager.showTestNotification();
        setPushEnabled(true);
        setSnackbar({ open: true, message: 'Push notifications enabled!', severity: 'success' });
      } else {
        // Disable push notifications (just toggle UI state)
        setPushEnabled(false);
        setSnackbar({ open: true, message: 'Push notifications disabled', severity: 'info' });
      }
    } catch (error: any) {
      console.error('Push notification error:', error);
      setSnackbar({ open: true, message: 'Failed to enable notifications', severity: 'error' });
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;
    
    try {
      const taskId = selectedTask._id || selectedTask.id?.toString() || '';
      
      // Update via API
      await workerApi.completeTask(taskId, voiceNote, reportPhotos);
      
      // Update local state
      const updatedTasks = tasks.map(t => 
        (t._id || t.id) === (selectedTask._id || selectedTask.id) 
          ? { ...t, status: 'completed' as const } 
          : t
      );
      setTasks(updatedTasks);
      
      // Save to IndexedDB
      if (dbManager.isInitialized()) {
        await dbManager.saveTasks(updatedTasks);
      }
      
      setOpenTaskDialog(false);
      setTaskTimer(0);
      setIsTimerRunning(false);
      setVoiceNote('');
      setReportPhotos([]);
      setSnackbar({ open: true, message: 'Task completed successfully!', severity: 'success' });
    } catch (error: any) {
      console.error('Complete task error:', error);
      
      // If offline, queue for sync
      if (!navigator.onLine && dbManager.isInitialized()) {
        await dbManager.addToSyncQueue({
          type: 'complete-task',
          taskId: selectedTask._id || selectedTask.id,
          data: { voiceNote, reportPhotos }
        });
        setSnackbar({ open: true, message: 'Task queued for sync', severity: 'info' });
      } else {
        setSnackbar({ open: true, message: 'Failed to complete task', severity: 'error' });
      }
    }
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const handleReportConcern = async () => {
    if (!reportConcern.trim()) {
      setSnackbar({ open: true, message: 'Please describe the concern', severity: 'error' });
      return;
    }
    
    try {
      await workerApi.submitReport({
        category: reportCategory,
        description: reportConcern,
        priority: 'high',
        photos: reportPhotos
      });
      
      setOpenReportDialog(false);
      setReportConcern('');
      setReportPhotos([]);
      setSnackbar({ open: true, message: 'Concern reported successfully!', severity: 'success' });
      
      // Refresh tasks to include the new report
      const fetchedTasks = await workerApi.getTasks();
      setTasks(fetchedTasks);
    } catch (error: any) {
      console.error('Report error:', error);
      setSnackbar({ open: true, message: 'Failed to submit report', severity: 'error' });
    }
  };

  const handleAddPhoto = () => {
    // Simulate photo capture
    const photoUrl = `photo_${Date.now()}.jpg`;
    setReportPhotos([...reportPhotos, photoUrl]);
    setSnackbar({ open: true, message: 'Photo added', severity: 'success' });
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = reportPhotos.filter((_, i) => i !== index);
    setReportPhotos(newPhotos);
  };

  const handleLeaveRequest = async () => {
    if (!leaveStartDate || !leaveEndDate || !leaveReason.trim()) {
      setSnackbar({ open: true, message: 'Please fill all fields', severity: 'error' });
      return;
    }
    
    try {
      const newLeave = await workerApi.createLeaveRequest({
        type: leaveType === 'vacation' ? 'Vacation' : leaveType === 'sick' ? 'Sick Leave' : 'Personal Leave',
        startDate: leaveStartDate,
        endDate: leaveEndDate,
        reason: leaveReason
      });
      
      setLeaveRequests([...leaveRequests, newLeave]);
      setOpenLeaveDialog(false);
      setLeaveStartDate('');
      setLeaveEndDate('');
      setLeaveReason('');
      setSnackbar({ open: true, message: 'Leave request submitted!', severity: 'success' });
    } catch (error: any) {
      console.error('Leave request error:', error);
      setSnackbar({ open: true, message: 'Failed to submit leave request', severity: 'error' });
    }
  };

  const getLeaveStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'denied': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const renderTaskList = () => (
    <Box sx={{ pb: 8, pt: 2 }}>
      <Box sx={{ px: 2, pt: 5, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
          9:41 AM • {isOnline ? <OnlineIcon sx={{ fontSize: 12 }} /> : <OfflineIcon sx={{ fontSize: 12 }} />}
          {isOnline ? 'Online' : 'Offline Mode'}
        </Typography>
        <IconButton size="small" onClick={handlePullRefresh} disabled={isRefreshing}>
          {isRefreshing ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
        </IconButton>
      </Box>

      <Box sx={{ px: 2, py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
            {workerName.split(' ').map((n: string) => n[0]).join('')}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>{workerName}</Typography>
            <Typography variant="body2" color="text.secondary">{workerRole}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          <Card sx={{ flex: 1, textAlign: 'center' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="h6" color="success.main">{tasksCompleted}</Typography>
              <Typography variant="caption" color="text.secondary">Completed</Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, textAlign: 'center' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="h6" color="warning.main">{tasksPending}</Typography>
              <Typography variant="caption" color="text.secondary">Pending</Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, textAlign: 'center' }}>
            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="h6" color="info.main">{tasksInProgress}</Typography>
              <Typography variant="caption" color="text.secondary">In Progress</Typography>
            </CardContent>
          </Card>
        </Box>

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Today's Tasks
        </Typography>
      </Box>

      <List sx={{ px: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={40} />
          </Box>
        ) : tasks.length === 0 ? (
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ p: 3 }}>
            No tasks assigned yet
          </Typography>
        ) : tasks.map((task) => (
          <Paper
            key={task._id || task.id}
            elevation={1}
            sx={{ mb: 1, mx: 1, cursor: 'pointer' }}
            onClick={() => handleTaskClick(task)}
          >
            <ListItem>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: task.type === 'animals' ? 'success.main' : 'primary.main' }}>
                  {task.type === 'animals' ? <PetsIcon /> : <AgricultureIcon />}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {task.title}
                    </Typography>
                    <Chip
                      label={task.priority}
                      size="small"
                      color={getPriorityColor(task.priority)}
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {task.description}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption">{task.location}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <TimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Typography variant="caption">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : task.deadline || 'No deadline'}
                        </Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={task.status.replace('-', ' ')}
                      size="small"
                      color={getStatusColor(task.status)}
                      sx={{ height: 18, fontSize: '0.65rem', mt: 0.5 }}
                    />
                  </Box>
                }
              />
            </ListItem>
          </Paper>
        ))}
      </List>
    </Box>
  );

  const renderNotifications = () => (
    <Box sx={{ p: 2, pb: 8, pt: 7 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Notifications
      </Typography>
      <List>
        <Paper elevation={1} sx={{ mb: 1 }}>
          <ListItem>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <WarningIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Urgent Task Assigned"
              secondary="Feed Cattle - Due Today 9:00 AM"
            />
          </ListItem>
        </Paper>
        <Paper elevation={1} sx={{ mb: 1 }}>
          <ListItem>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <CheckIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Task Completed"
              secondary="Morning Crop Inspection - Well done!"
            />
          </ListItem>
        </Paper>
        <Paper elevation={1} sx={{ mb: 1 }}>
          <ListItem>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <TaskIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Schedule Update"
              secondary="2 new tasks added for tomorrow"
            />
          </ListItem>
        </Paper>
      </List>
    </Box>
  );

  const renderProfile = () => (
    <Box sx={{ p: 2, pb: 8, pt: 7 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main', mb: 2 }}>
          {workerName.split(' ').map((n: string) => n[0]).join('')}
        </Avatar>
        <Typography variant="h5" fontWeight="bold">{workerName}</Typography>
        <Typography variant="body2" color="text.secondary">{workerRole}</Typography>
      </Box>

      {/* PWA Settings */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            📱 App Settings
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={pushEnabled}
                  onChange={handleTogglePushNotifications}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Push Notifications</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Get alerts for new tasks
                  </Typography>
                </Box>
              }
            />
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2">Offline Mode</Typography>
                <Typography variant="caption" color="text.secondary">
                  {offlineMode ? 'Working offline' : 'Connected'}
                </Typography>
              </Box>
              <Chip
                icon={offlineMode ? <OfflineIcon /> : <OnlineIcon />}
                label={offlineMode ? 'Offline' : 'Online'}
                size="small"
                color={offlineMode ? 'warning' : 'success'}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Performance Summary
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Tasks Completed</Typography>
              <Typography variant="body2" fontWeight="bold">{tasksCompleted}</Typography>
            </Box>
            <LinearProgress variant="determinate" value={80} sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">On-Time Delivery</Typography>
              <Typography variant="body2" fontWeight="bold">95%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={95} color="success" sx={{ mb: 2 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2">Quality Rating</Typography>
              <Typography variant="body2" fontWeight="bold">4.8/5.0</Typography>
            </Box>
            <LinearProgress variant="determinate" value={96} color="success" />
          </Box>
        </CardContent>
      </Card>

      {/* Farm Calendar & Events */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              📅 Farm Calendar & Events
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CalendarIcon />}
              onClick={() => setOpenCalendarDialog(true)}
            >
              View Calendar
            </Button>
          </Box>
          <List sx={{ p: 0 }}>
            {calendarEvents.slice(0, 3).map((event) => (
              <Paper key={event.id} elevation={0} sx={{ mb: 1, p: 1.5, bgcolor: 'info.50' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon sx={{ color: event.color }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight="bold">
                      {event.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Typography>
                  </Box>
                </Box>
                {event.description && (
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    {event.description}
                  </Typography>
                )}
              </Paper>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Work Schedule / Rota */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              My Work Schedule
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<CalendarIcon />}
              onClick={() => setOpenRotaDialog(true)}
            >
              View Full Rota
            </Button>
          </Box>
          <List sx={{ p: 0 }}>
            {teamSchedule.filter(s => s.name.includes('You')).slice(0, 3).map((schedule) => (
              <Paper key={schedule.id} elevation={0} sx={{ mb: 1, p: 1.5, bgcolor: schedule.status === 'off' ? 'grey.50' : 'success.50' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {schedule.shift}
                    </Typography>
                  </Box>
                  <Chip
                    label={schedule.status === 'on' ? 'Working' : 'Day Off'}
                    size="small"
                    color={schedule.status === 'on' ? 'success' : 'default'}
                    icon={schedule.status === 'on' ? <CheckIcon /> : <CalendarIcon />}
                  />
                </Box>
              </Paper>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Leave Requests */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              Leave Requests
            </Typography>
            <Button
              size="small"
              variant="contained"
              startIcon={<LeaveIcon />}
              onClick={() => setOpenLeaveDialog(true)}
            >
              Request Leave
            </Button>
          </Box>
          <List sx={{ p: 0 }}>
            {leaveRequests.map((request) => (
              <Paper key={request._id || request.id} elevation={0} sx={{ mb: 1, p: 1.5, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">{request.type}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(request.startDate || request.start || '').toLocaleDateString()} - {new Date(request.endDate || request.end || '').toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={request.status}
                    size="small"
                    color={getLeaveStatusColor(request.status)}
                    icon={
                      request.status === 'pending' ? <PendingIcon /> :
                      request.status === 'approved' ? <CheckIcon /> :
                      <DeniedIcon />
                    }
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Reason: {request.reason}
                </Typography>
              </Paper>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Contact Information
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Email: john.doe@farm.com
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Phone: +1 (555) 123-4567
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Employee ID: EMP-2024-001
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        bgcolor: '#1a1a1a' 
      }}>
        <CircularProgress size={60} sx={{ color: '#4caf50' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      bgcolor: '#1a1a1a',
      p: 2 
    }}>
      <Box sx={{ 
        width: 375, 
        height: 812, 
        bgcolor: '#000',
        borderRadius: 6,
        padding: '12px',
        boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 150,
          height: 30,
          bgcolor: '#000',
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          zIndex: 10
        }} />
        
        <Box sx={{ 
          width: '100%', 
          height: '100%', 
          bgcolor: 'background.default',
          borderRadius: 4,
          overflow: 'auto',
          position: 'relative'
        }}>
          {bottomNav === 0 && renderTaskList()}
          {bottomNav === 1 && renderNotifications()}
          {bottomNav === 2 && renderProfile()}

          <Paper 
            sx={{ 
              position: 'fixed', 
              bottom: 0, 
              left: 0, 
              right: 0,
              borderRadius: 0
            }} 
            elevation={3}
          >
            <BottomNavigation
              value={bottomNav}
              onChange={(event, newValue) => {
                setBottomNav(newValue);
              }}
              showLabels
            >
              <BottomNavigationAction 
                label="Tasks" 
                icon={
                  <Badge badgeContent={tasksPending} color="error">
                    <TaskIcon />
                  </Badge>
                } 
              />
              <BottomNavigationAction 
                label="Notifications" 
                icon={
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                } 
              />
              <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
            </BottomNavigation>
          </Paper>

          {/* Floating Report Button */}
          <Fab
            color="error"
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 16,
              zIndex: 1000
            }}
            onClick={() => setOpenReportDialog(true)}
          >
            <ReportIcon />
          </Fab>
        </Box>
      </Box>

      {/* Report Concern Dialog */}
      <Dialog
        open={openReportDialog}
        onClose={() => setOpenReportDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Report Concern</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Report equipment issues, safety concerns, or any problems you encounter.
          </Typography>
          
          {/* Category Selection */}
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Category
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                icon={<EquipmentIcon />}
                label="Equipment"
                onClick={() => setReportCategory('equipment')}
                color={reportCategory === 'equipment' ? 'primary' : 'default'}
                variant={reportCategory === 'equipment' ? 'filled' : 'outlined'}
              />
              <Chip
                icon={<CropIcon />}
                label="Crops"
                onClick={() => setReportCategory('crops')}
                color={reportCategory === 'crops' ? 'primary' : 'default'}
                variant={reportCategory === 'crops' ? 'filled' : 'outlined'}
              />
              <Chip
                icon={<PetsIcon />}
                label="Animals"
                onClick={() => setReportCategory('animals')}
                color={reportCategory === 'animals' ? 'primary' : 'default'}
                variant={reportCategory === 'animals' ? 'filled' : 'outlined'}
              />
              <Chip
                icon={<HealthIcon />}
                label="Safety"
                onClick={() => setReportCategory('safety')}
                color={reportCategory === 'safety' ? 'error' : 'default'}
                variant={reportCategory === 'safety' ? 'filled' : 'outlined'}
              />
            </Box>
          </Box>

          {/* Description */}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Describe the concern"
            placeholder="Provide details about the issue..."
            value={reportConcern}
            onChange={(e) => setReportConcern(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Photos */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Supporting Photos ({reportPhotos.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {reportPhotos.map((photo, index) => (
                <Card key={index} sx={{ width: 80, height: 80, position: 'relative' }}>
                  <CardContent sx={{ p: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.200' }}>
                    <CameraIcon color="action" />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        bgcolor: 'error.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'error.dark' }
                      }}
                      onClick={() => handleRemovePhoto(index)}
                    >
                      <DeleteIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </CardContent>
                </Card>
              ))}
              {reportPhotos.length < 5 && (
                <Card 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    cursor: 'pointer',
                    border: '2px dashed',
                    borderColor: 'primary.main',
                    bgcolor: 'transparent'
                  }}
                  onClick={handleAddPhoto}
                >
                  <CardContent sx={{ p: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AddIcon color="primary" />
                  </CardContent>
                </Card>
              )}
            </Box>
            <Typography variant="caption" color="text.secondary">
              Tap to add photos (max 5)
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<CameraIcon />}
              onClick={handleCameraCapture}
              sx={{ mt: 1 }}
            >
              {cameraActive ? 'Capture Photo' : 'Open Camera'}
            </Button>
            
            {/* Camera Preview */}
            {cameraActive && (
              <Box sx={{ mt: 2, position: 'relative' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    maxHeight: '300px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 1, width: '100%' }}
                  onClick={handleCameraCapture}
                >
                  Capture Photo
                </Button>
              </Box>
            )}
          </Box>

          {/* GPS Location */}
          {gpsLocation && (
            <Box sx={{ mt: 2, p: 1, bgcolor: 'success.50', borderRadius: 1 }}>
              <Typography variant="caption" color="success.main">
                ✓ Location captured: {gpsLocation.lat.toFixed(4)}, {gpsLocation.lng.toFixed(4)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReportDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<ReportIcon />}
            onClick={handleReportConcern}
          >
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openTaskDialog} 
        onClose={() => setOpenTaskDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {selectedTask?.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            {selectedTask?.description}
          </Typography>
          <Divider sx={{ my: 2 }} />
          
          {/* Task Timer */}
          <Card sx={{ mb: 2, bgcolor: 'primary.50' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Task Timer</Typography>
                  <Typography variant="h6" fontWeight="bold">{formatTime(taskTimer)}</Typography>
                </Box>
                <IconButton 
                  onClick={isTimerRunning ? handleStopTimer : handleStartTimer}
                  color={isTimerRunning ? 'error' : 'primary'}
                >
                  {isTimerRunning ? <StopIcon /> : <PlayIcon />}
                </IconButton>
              </Box>
            </CardContent>
          </Card>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationIcon fontSize="small" color="action" />
              <Typography variant="body2">{selectedTask?.location}</Typography>
              <Button 
                size="small" 
                startIcon={<GpsIcon />} 
                onClick={handleGetLocation}
                sx={{ ml: 'auto' }}
              >
                {gpsLocation ? 'Verified' : 'Check-in'}
              </Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimeIcon fontSize="small" color="action" />
              <Typography variant="body2">{selectedTask?.deadline}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight="bold">Priority:</Typography>
              <Chip
                label={selectedTask?.priority}
                size="small"
                color={selectedTask ? getPriorityColor(selectedTask.priority) : 'default'}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" fontWeight="bold">Status:</Typography>
              <Chip
                label={selectedTask?.status.replace('-', ' ')}
                size="small"
                color={selectedTask ? getStatusColor(selectedTask.status) : 'default'}
              />
            </Box>

            {/* Voice Note */}
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" fontWeight="bold">Voice Note:</Typography>
                <IconButton 
                  size="small" 
                  color={isRecording ? 'error' : 'primary'}
                  onClick={handleVoiceRecord}
                >
                  <MicIcon />
                </IconButton>
                {isRecording && <CircularProgress size={20} />}
              </Box>
              {voiceNote && (
                <Typography variant="caption" color="success.main">
                  ✓ {voiceNote}
                </Typography>
              )}
            </Box>

            {/* Photo Upload */}
            <Button
              variant="outlined"
              startIcon={<CameraIcon />}
              fullWidth
              sx={{ mt: 1 }}
            >
              Take Photo
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Close</Button>
          {selectedTask?.status === 'pending' && (
            <Button 
              variant="outlined" 
              color="primary"
              startIcon={<PlayIcon />}
              onClick={() => selectedTask && handleStartTask(selectedTask)}
            >
              Start Task
            </Button>
          )}
          {selectedTask?.status !== 'completed' && (
            <Button 
              variant="contained" 
              color="success"
              startIcon={<CheckIcon />}
              onClick={handleCompleteTask}
              disabled={!gpsLocation}
            >
              Complete Task
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Team Rota Dialog */}
      <Dialog
        open={openRotaDialog}
        onClose={() => setOpenRotaDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon />
            Team Work Schedule
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            View who's working and who's off for better planning and coordination.
          </Typography>

          {/* Group by date */}
          {['2025-11-14', '2025-11-15', '2025-11-16'].map((date) => (
            <Box key={date} sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: 'primary.main' }}>
                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Typography>
              <List sx={{ p: 0 }}>
                {teamSchedule.filter(s => s.date === date).map((schedule) => (
                  <Paper 
                    key={schedule.id} 
                    elevation={0} 
                    sx={{ 
                      mb: 1, 
                      p: 1.5, 
                      bgcolor: schedule.name.includes('You') 
                        ? (schedule.status === 'off' ? 'grey.100' : 'success.100')
                        : (schedule.status === 'off' ? 'grey.50' : 'background.paper'),
                      border: schedule.name.includes('You') ? 2 : 0,
                      borderColor: schedule.name.includes('You') ? 'primary.main' : 'transparent'
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: schedule.status === 'on' ? 'success.main' : 'grey.400' }}>
                          {schedule.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={schedule.name.includes('You') ? 'bold' : 'normal'}>
                            {schedule.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {schedule.shift}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={schedule.status === 'on' ? 'ON' : 'OFF'}
                        size="small"
                        color={schedule.status === 'on' ? 'success' : 'default'}
                        sx={{ fontWeight: 'bold', minWidth: 50 }}
                      />
                    </Box>
                  </Paper>
                ))}
              </List>
            </Box>
          ))}

          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
            <Typography variant="caption" color="info.main">
              💡 Your shifts are highlighted. Contact your manager if you need to swap shifts or request time off.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRotaDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Farm Calendar Dialog (Read-Only) */}
      <Dialog
        open={openCalendarDialog}
        onClose={() => setOpenCalendarDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarIcon />
            Farm Calendar & Events
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            View upcoming farm events, special occasions, and important dates.
          </Typography>

          <List sx={{ p: 0 }}>
            {calendarEvents.map((event) => (
              <Paper key={event.id} elevation={0} sx={{ mb: 2, p: 2, bgcolor: 'grey.50' }}>
                <Box sx={{ display: 'flex', alignItems: 'start', gap: 1.5 }}>
                  <Avatar sx={{ width: 40, height: 40, bgcolor: event.color }}>
                    <CalendarIcon />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      📅 {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Typography>
                    {event.description && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {event.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            ))}
          </List>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
            <Typography variant="caption" color="info.main">
              ℹ️ Calendar is managed by your administrator. Contact your manager for questions about events.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCalendarDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Leave Request Dialog */}
      <Dialog
        open={openLeaveDialog}
        onClose={() => setOpenLeaveDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Request Time Off</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            Submit your leave request for manager approval.
          </Typography>

          {/* Leave Type */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Leave Type
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                icon={<LeaveIcon />}
                label="Vacation"
                onClick={() => setLeaveType('vacation')}
                color={leaveType === 'vacation' ? 'primary' : 'default'}
                variant={leaveType === 'vacation' ? 'filled' : 'outlined'}
              />
              <Chip
                icon={<HealthIcon />}
                label="Sick Leave"
                onClick={() => setLeaveType('sick')}
                color={leaveType === 'sick' ? 'primary' : 'default'}
                variant={leaveType === 'sick' ? 'filled' : 'outlined'}
              />
              <Chip
                icon={<PersonIcon />}
                label="Personal"
                onClick={() => setLeaveType('personal')}
                color={leaveType === 'personal' ? 'primary' : 'default'}
                variant={leaveType === 'personal' ? 'filled' : 'outlined'}
              />
            </Box>
          </Box>

          {/* Date Range */}
          <TextField
            fullWidth
            type="date"
            label="Start Date"
            value={leaveStartDate}
            onChange={(e) => setLeaveStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            type="date"
            label="End Date"
            value={leaveEndDate}
            onChange={(e) => setLeaveEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          {/* Reason */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason"
            placeholder="Brief reason for your leave request..."
            value={leaveReason}
            onChange={(e) => setLeaveReason(e.target.value)}
          />

          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'info.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              💡 Your manager will review and respond to your request within 24-48 hours.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLeaveDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CalendarIcon />}
            onClick={handleLeaveRequest}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WorkerMobileDashboard;
