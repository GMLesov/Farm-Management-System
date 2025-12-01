import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tabs,
  Tab,
  FormControlLabel,
  Switch,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  WbSunny as WeatherIcon,
  Pets as LivestockIcon,
  Grass as CropIcon,
  Build as EquipmentIcon,
  AttachMoney as FinancialIcon,
  WaterDrop as IrrigationIcon,
  FilterList as FilterIcon,
  Delete as DeleteIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import notificationService from '../../services/notification';
import type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationPreference,
} from '../../services/notification';
import { formatDistanceToNow } from 'date-fns';

const typeIcons: Record<NotificationType, React.ReactElement> = {
  alert: <ErrorIcon color="error" />,
  reminder: <NotificationsIcon color="primary" />,
  warning: <WarningIcon color="warning" />,
  info: <InfoIcon color="info" />,
  success: <CheckCircleIcon color="success" />,
  weather: <WeatherIcon style={{ color: '#FFA726' }} />,
  livestock: <LivestockIcon style={{ color: '#8D6E63' }} />,
  crop: <CropIcon style={{ color: '#66BB6A' }} />,
  equipment: <EquipmentIcon style={{ color: '#78909C' }} />,
  financial: <FinancialIcon style={{ color: '#4CAF50' }} />,
  irrigation: <IrrigationIcon style={{ color: '#42A5F5' }} />,
};

const priorityColors: Record<NotificationPriority, string> = {
  critical: '#F44336',
  high: '#FF9800',
  medium: '#2196F3',
  low: '#9E9E9E',
};

const NotificationsDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const viewMode = searchParams.get('view');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [filterType, setFilterType] = useState<NotificationType | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<NotificationPriority | 'all'>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (viewMode === 'alerts') {
      setFilterType('alert');
      setFilterPriority('critical');
    }
  }, [viewMode]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const filter: any = { limit: 100 };
      if (tabValue === 0) filter.unreadOnly = true;
      if (filterType !== 'all') filter.type = filterType;
      if (filterPriority !== 'all') filter.priority = filterPriority;
      const response = await notificationService.getNotifications(filter);
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [tabValue, filterType, filterPriority]);

  const fetchPreferences = useCallback(async () => {
    try {
      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
    fetchUnreadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchNotifications]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleArchive = async (notificationId: string) => {
    try {
      await notificationService.archiveNotification(notificationId);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  const handlePreferenceToggle = async (path: string[], value: boolean) => {
    if (!preferences) return;
    try {
      const updates = { ...preferences };
      let current: any = updates;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      const updatedPrefs = await notificationService.updatePreferences(updates);
      setPreferences(updatedPrefs);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const renderNotificationList = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      );
    }
    if (!notifications || notifications.length === 0) {
      return (
        <Box p={4} textAlign="center">
          <NotificationsIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {tabValue === 0 ? 'No unread notifications' : 'No notifications'}
          </Typography>
        </Box>
      );
    }
    return (
      <List>
        {(notifications || []).map((notification: Notification, index: number) => (
          <React.Fragment key={notification._id}>
            {index > 0 && <Divider />}
            <ListItem
              sx={{
                backgroundColor: notification.readAt ? 'transparent' : 'action.hover',
                borderLeft: `4px solid ${priorityColors[notification.priority]}`,
                '&:hover': {
                  backgroundColor: 'action.selected',
                },
              }}
              secondaryAction={
                <Box display="flex" gap={1}>
                  {!notification.readAt && (
                    <Tooltip title="Mark as read">
                      <IconButton edge="end" aria-label="mark as read" onClick={() => handleMarkAsRead(notification._id)}>
                        <DoneIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="Archive">
                    <IconButton edge="end" aria-label="archive" onClick={() => handleArchive(notification._id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <ListItemIcon sx={{ minWidth: 48 }}>
                {typeIcons[notification.type]}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Typography variant="subtitle1" fontWeight={notification.readAt ? 400 : 600}>
                      {notification.title}
                    </Typography>
                    <Chip label={notification.priority} size="small" sx={{ height: 22, fontSize: '0.7rem', backgroundColor: priorityColors[notification.priority], color: 'white' }} />
                    <Chip label={notification.type} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getRelativeTime(notification.createdAt)}
                      {notification.readAt && (
                        <> • Read {getRelativeTime(notification.readAt)}</>
                      )}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    );
  };

  const renderPreferences = () => {
    if (!preferences) {
      return (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      );
    }
    return (
      <Box>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Global Settings
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={preferences.globalEnabled}
                  onChange={(e) => handlePreferenceToggle(['globalEnabled'], e.target.checked)}
                />
              }
              label="Enable all notifications"
            />
          </CardContent>
        </Card>
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Channels
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              {Object.entries(preferences.channels).map(([channel, prefs]: [string, any]) => (
                <Box key={channel} sx={{ minWidth: 200 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={prefs.enabled}
                        onChange={(e) => handlePreferenceToggle(['channels', channel, 'enabled'], e.target.checked)}
                      />
                    }
                    label={channel.charAt(0).toUpperCase() + channel.slice(1)}
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Notification Types
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={2}>
              {Object.entries(preferences.types).map(([type, prefs]: [string, any]) => (
                <Box key={type} sx={{ flex: '1 1 300px', maxWidth: 400 }}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      {typeIcons[type as NotificationType]}
                      <Typography variant="subtitle2">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Typography>
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={prefs.enabled}
                          onChange={(e) => handlePreferenceToggle(['types', type, 'enabled'], e.target.checked)}
                        />
                      }
                      label="Enabled"
                    />
                  </Paper>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
        Notifications
      </Typography>
      <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
        Review system notifications, alerts, and important farm updates.
      </Typography>
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={3}>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchNotifications();
              fetchUnreadCount();
            }}
          >
            Refresh
          </Button>
          {tabValue === 0 && unreadCount > 0 && (
            <Button
              variant="contained"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllAsRead}
            >
              Mark All Read
            </Button>
          )}
        </Box>
      </Box>
      {viewMode === 'alerts' && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Showing critical alerts that require immediate attention. 
          View all notifications to see complete activity feed.
        </Alert>
      )}
      {unreadCount > 0 && viewMode !== 'alerts' && (
        <Alert severity="info" sx={{ mb: 3 }}>
          You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
        </Alert>
      )}
      <Card>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`Unread (${unreadCount})`} />
          <Tab label="All" />
          <Tab label="Preferences" />
        </Tabs>
        {tabValue < 2 && (
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
              <Box sx={{ flex: '1 1 200px', maxWidth: 300 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="alert">Alert</MenuItem>
                  <MenuItem value="reminder">Reminder</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="weather">Weather</MenuItem>
                  <MenuItem value="livestock">Livestock</MenuItem>
                  <MenuItem value="crop">Crop</MenuItem>
                  <MenuItem value="equipment">Equipment</MenuItem>
                  <MenuItem value="financial">Financial</MenuItem>
                  <MenuItem value="irrigation">Irrigation</MenuItem>
                </TextField>
              </Box>
              <Box sx={{ flex: '1 1 200px', maxWidth: 300 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Priority"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value as any)}
                >
                  <MenuItem value="all">All Priorities</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </TextField>
              </Box>
            </Box>
          </Box>
        )}
        <CardContent sx={{ p: 0 }}>
          {tabValue === 0 && renderNotificationList()}
          {tabValue === 1 && renderNotificationList()}
          {tabValue === 2 && <Box p={3}>{renderPreferences()}</Box>}
        </CardContent>
      </Card>
    </Box>
  );
};

export default NotificationsDashboard;
