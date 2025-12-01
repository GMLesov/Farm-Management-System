import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive,
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
  MarkEmailRead,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Done as DoneIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import notificationService, {
  Notification,
  NotificationType,
  NotificationPriority,
} from '../services/notification';
import { format, formatDistanceToNow } from 'date-fns';

const typeIcons: Record<NotificationType, React.ReactElement> = {
  alert: <ErrorIcon color="error" />,
  reminder: <NotificationsActive color="primary" />,
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`notification-tabpanel-${index}`}
      aria-labelledby={`notification-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
    </div>
  );
}

export const NotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const open = Boolean(anchorEl);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const filter = tabValue === 0 ? { unreadOnly: true } : {};
      const response = await notificationService.getNotifications({
        ...filter,
        limit: 50,
      });
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [tabValue]);

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
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleMarkAsRead = async (notificationId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
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

  const handleArchive = async (notificationId: string, event?: React.MouseEvent) => {
    event?.stopPropagation();
    try {
      await notificationService.archiveNotification(notificationId);
      fetchNotifications();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error archiving notification:', error);
    }
  };

  const handleSettingsClick = () => {
    handleClose();
    navigate('/settings');
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.readAt) {
      handleMarkAsRead(notification._id);
    }
    
    // Navigate or perform action if notification has actions
    if (notification.actions && notification.actions.length > 0) {
      const primaryAction = notification.actions[0];
      if (primaryAction.type === 'link' && primaryAction.url) {
        window.location.href = primaryAction.url;
      }
    }
  };

  const getRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Unknown time';
    }
  };

  const renderNotificationList = (notifs: Notification[]) => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress size={32} />
        </Box>
      );
    }

    if (notifs.length === 0) {
      return (
        <Box p={4} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            {tabValue === 0 ? 'No unread notifications' : 'No notifications'}
          </Typography>
        </Box>
      );
    }

    return (
      <List sx={{ maxHeight: 500, overflow: 'auto', p: 0 }}>
        {notifs.map((notification, index) => (
          <React.Fragment key={notification._id}>
            {index > 0 && <Divider />}
            <ListItem
              sx={{
                backgroundColor: notification.readAt ? 'transparent' : 'action.hover',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.selected',
                },
                borderLeft: `4px solid ${priorityColors[notification.priority]}`,
              }}
              onClick={() => handleNotificationClick(notification)}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {typeIcons[notification.type]}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight={notification.readAt ? 400 : 600}>
                      {notification.title}
                    </Typography>
                    <Chip
                      label={notification.priority}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        backgroundColor: priorityColors[notification.priority],
                        color: 'white',
                      }}
                    />
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {notification.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {getRelativeTime(notification.createdAt)}
                    </Typography>
                  </Box>
                }
              />
              <Box display="flex" gap={0.5}>
                {!notification.readAt && (
                  <Tooltip title="Mark as read">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMarkAsRead(notification._id, e)}
                    >
                      <DoneIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title="Archive">
                  <IconButton
                    size="small"
                    onClick={(e) => handleArchive(notification._id, e)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </ListItem>
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          onClick={handleClick}
          size="large"
          aria-label={`${unreadCount} unread notifications`}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 450,
            maxWidth: '95vw',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6">Notifications</Typography>
            <Box display="flex" gap={1}>
              <Tooltip title="Mark all as read">
                <IconButton size="small" onClick={handleMarkAllAsRead} disabled={unreadCount === 0}>
                  <DoneAllIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Settings">
                <IconButton size="small" onClick={handleSettingsClick}>
                  <SettingsIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
            <Tab
              label={
                <Badge badgeContent={unreadCount} color="error">
                  Unread
                </Badge>
              }
            />
            <Tab label="All" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          {renderNotificationList((notifications || []).filter((n) => !n.readAt))}
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          {renderNotificationList(notifications || [])}
        </TabPanel>
      </Menu>
    </>
  );
};

export default NotificationCenter;
