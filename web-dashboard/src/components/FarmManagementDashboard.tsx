import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Agriculture,
  WaterDrop,
  AttachMoney,
  Assessment,
  Cloud,
  Notifications,
  Settings,
  Person,
  Logout,
  Home,
  TrendingUp,
  Construction as ConstructionIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store';
import { logoutUser } from '../store/slices/authSlice';

// Import dashboard components
import MainDashboard from './dashboards/MainDashboard';
import EnhancedCropManagementDashboard from './EnhancedCropManagementDashboard';
import EnhancedIrrigationDashboard from './EnhancedIrrigationDashboard';
import EnhancedFinancialDashboard from './dashboards/EnhancedFinancialDashboard';
import EnhancedWeatherDashboard from './dashboards/EnhancedWeatherDashboard';
import ReportsDashboard from './dashboards/ReportsDashboard';
import AnalyticsDashboard from './dashboards/AnalyticsDashboard';
import WorkerManagementDashboard from './dashboards/WorkerManagementDashboard';
import InventoryManagementDashboard from './dashboards/InventoryManagementDashboard';
import AnimalHealthDashboard from './dashboards/AnimalHealthDashboard';
import CropPlanningDashboard from './dashboards/CropPlanningDashboard';
import TaskManagementDashboard from './dashboards/TaskManagementDashboard';
import PetsIcon from '@mui/icons-material/Pets';
import GroupIcon from '@mui/icons-material/Group';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import GrassIcon from '@mui/icons-material/Grass';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EnhancedAnimalManagementDashboard from './EnhancedAnimalManagementDashboard';
import EquipmentManagementDashboard from './EquipmentManagementDashboard';
import SettingsPage from './SettingsPage';
import NotificationCenter from './NotificationCenter';
import NotificationsDashboard from './dashboards/NotificationsDashboard';
import ManagerHomeDashboard from './dashboards/ManagerHomeDashboard';
import AnimalManagementDashboard from './dashboards/AnimalManagementDashboard';
import WorkerRotaDashboard from './dashboards/WorkerRotaDashboard';
import FarmCalendarDashboard from './dashboards/FarmCalendarDashboard';

const drawerWidth = 280;

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactElement;
  component: React.ComponentType;
  badge?: number;
  color?: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Manager Dashboard',
    icon: <Home />,
    component: ManagerHomeDashboard,
  },
  {
    id: 'overview',
    label: 'Farm Overview',
    icon: <DashboardIcon />,
    component: MainDashboard,
  },
  {
    id: 'analytics',
    label: 'Analytics Dashboard',
    icon: <TrendingUp />,
    component: AnalyticsDashboard,
  },
  {
    id: 'animals',
    label: 'Animal Management',
    icon: <PetsIcon />,
    component: AnimalManagementDashboard,
    color: '#6d4c41',
    badge: 2,
  },
  {
    id: 'crops',
    label: 'Crop Management',
    icon: <Agriculture />,
    component: EnhancedCropManagementDashboard,
    badge: 3,
    color: '#4CAF50',
  },
  {
    id: 'irrigation',
    label: 'Irrigation System',
    icon: <WaterDrop />,
    component: EnhancedIrrigationDashboard,
    badge: 1,
    color: '#2196F3',
  },
  {
    id: 'financial',
    label: 'Financial Management',
    icon: <AttachMoney />,
    component: EnhancedFinancialDashboard,
    color: '#FF9800',
  },
  {
    id: 'weather',
    label: 'Weather Monitoring',
    icon: <Cloud />,
    component: EnhancedWeatherDashboard,
    color: '#9C27B0',
  },
  {
    id: 'equipment',
    label: 'Equipment Management',
    icon: <ConstructionIcon />,
    component: EquipmentManagementDashboard,
    badge: 3,
    color: '#795548',
  },
  {
    id: 'inventory',
    label: 'Inventory Management',
    icon: <InventoryIcon />,
    component: InventoryManagementDashboard,
    badge: 2,
    color: '#00BCD4',
  },
  {
    id: 'animal-health',
    label: 'Animal Health & Breeding',
    icon: <LocalHospitalIcon />,
    component: AnimalHealthDashboard,
    badge: 1,
    color: '#E91E63',
  },
  {
    id: 'crop-planning',
    label: 'Crop Planning',
    icon: <GrassIcon />,
    component: CropPlanningDashboard,
    badge: 3,
    color: '#8BC34A',
  },
  {
    id: 'tasks',
    label: 'Task Management',
    icon: <AssignmentIcon />,
    component: TaskManagementDashboard,
    badge: 4,
    color: '#9C27B0',
  },
  {
    id: 'workers',
    label: 'Worker Management',
    icon: <GroupIcon />,
    component: WorkerManagementDashboard,
    color: '#1976d2',
  },
  {
    id: 'rota',
    label: 'Worker Rota & Leaves',
    icon: <CalendarTodayIcon />,
    component: WorkerRotaDashboard,
    badge: 3,
    color: '#00897B',
  },
  {
    id: 'calendar',
    label: 'Farm Calendar',
    icon: <CalendarTodayIcon />,
    component: FarmCalendarDashboard,
    color: '#673AB7',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: <Notifications />,
    component: NotificationsDashboard,
    color: '#E91E63',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <Settings />,
    component: SettingsPage,
  },
  {
    id: 'reports',
    label: 'Reports & Export',
    icon: <Assessment />,
    component: ReportsDashboard,
    color: '#F44336',
  },
];

const FarmManagementDashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Map between section ids and URL paths (use plain objects for broad TS compat)
  const sectionPaths = useMemo(() => ({
    home: '/home',
    overview: '/',
    analytics: '/analytics',
    animals: '/animals',
    crops: '/crops',
    irrigation: '/irrigation',
    financial: '/financial',
    weather: '/weather',
    equipment: '/equipment',
    inventory: '/inventory',
    'animal-health': '/animal-health',
    'crop-planning': '/crop-planning',
    tasks: '/tasks',
    workers: '/workers',
    rota: '/rota',
    calendar: '/calendar',
    notifications: '/notifications',
    settings: '/settings',
    reports: '/reports',
  } as Record<string, string>), []);

  const pathToSectionMap = useMemo(() => ({
    '/': 'overview',
    '/home': 'home',
    '/overview': 'overview',
    '/analytics': 'analytics',
    '/animals': 'animals',
    '/crops': 'crops',
    '/irrigation': 'irrigation',
    '/financial': 'financial',
    '/weather': 'weather',
    '/equipment': 'equipment',
    '/inventory': 'inventory',
    '/animal-health': 'animal-health',
    '/crop-planning': 'crop-planning',
    '/tasks': 'tasks',
    '/workers': 'workers',
    '/rota': 'rota',
    '/calendar': 'calendar',
    '/notifications': 'notifications',
    '/settings': 'settings',
    '/reports': 'reports',
  } as Record<string, string>), []);

  const pathToSection = (pathname: string): string => {
    return pathToSectionMap[pathname] || 'overview';
  };

  // Helper function to get subtitle for each section
  const getSubtitle = (sectionId: string): string => {
    const subtitles: Record<string, string> = {
      home: 'Your personalized farm management hub',
      overview: 'Real-time farm operations overview',
      analytics: 'Advanced farm analytics and performance insights',
      animals: 'Livestock tracking, health records, and breeding management',
      crops: 'Crop lifecycle, schedules, and harvest planning',
      irrigation: 'Water management and irrigation scheduling',
      financial: 'Budget tracking, expenses, and revenue analysis',
      weather: 'Weather forecasts and climate monitoring',
      equipment: 'Machinery maintenance and usage tracking',
      inventory: 'Stock management and supply tracking',
      'animal-health': 'Animal health monitoring and veterinary records',
      'crop-planning': 'Seasonal planning and crop rotation',
      tasks: 'Daily tasks, assignments, and progress tracking',
      workers: 'Team management and worker profiles',
      rota: 'Work shifts and scheduling',
      calendar: 'Farm events, tasks, and important dates',
      notifications: 'Alerts and updates',
      settings: 'System configuration and preferences',
      reports: 'Generate and export farm reports',
    };
    return subtitles[sectionId] || 'Manage your farm efficiently';
  };

  useEffect(() => {
    setActiveSection(pathToSection(location.pathname));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    if (isMobile) {
      setMobileOpen(false);
    }
    const path = sectionPaths[sectionId] || '/';
    navigate(path);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileSettings = () => {
    handleProfileMenuClose();
    navigate('/settings?tab=0'); // Navigate to Profile tab
  };

  const handlePreferences = () => {
    handleProfileMenuClose();
    navigate('/settings?tab=3'); // Navigate to Farm Preferences tab
  };

  const handleLogout = async () => {
    handleProfileMenuClose();
    await dispatch(logoutUser()).unwrap();
    navigate('/login');
  };

  const handleViewAlerts = () => {
    navigate('/notifications?view=alerts');
  };

  const getCurrentComponent = () => {
    const item = navigationItems.find(item => item.id === activeSection);
    if (!item) return MainDashboard;
    return item.component;
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Agriculture sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h6" noWrap component="div" color="primary.main" fontWeight="bold">
            AgriTech Pro
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      
      {/* Farm Status Overview */}
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Farm Status
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip 
            label="All Systems Active" 
            color="success" 
            size="small" 
            icon={<DashboardIcon />}
            onClick={() => alert('All farm systems are operating normally. Click here for detailed system status.')}
            sx={{ cursor: 'pointer' }}
          />
          <Chip 
            label="3 Alerts" 
            color="warning" 
            size="small" 
            icon={<Notifications />}
            onClick={handleViewAlerts}
            sx={{ cursor: 'pointer' }}
          />
        </Box>
      </Box>
      
      <Divider />
      
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.id} disablePadding>
            <ListItemButton
              selected={activeSection === item.id}
              onClick={() => handleSectionChange(item.id)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: `${item.color || theme.palette.primary.main}15`,
                  borderRight: `3px solid ${item.color || theme.palette.primary.main}`,
                  '& .MuiListItemIcon-root': {
                    color: item.color || theme.palette.primary.main,
                  },
                  '& .MuiListItemText-primary': {
                    color: item.color || theme.palette.primary.main,
                    fontWeight: 600,
                  },
                },
                '&:hover': {
                  backgroundColor: `${item.color || theme.palette.primary.main}08`,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: activeSection === item.id 
                    ? (item.color || theme.palette.primary.main)
                    : 'text.secondary',
                }}
              >
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: activeSection === item.id ? 600 : 400,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      {/* Quick Stats */}
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Today's Overview
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Active Crops
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="success.main">
              23
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Water Usage
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="primary.main">
              2,340L
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Daily Revenue
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="warning.main">
              $1,240
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  const CurrentComponent = getCurrentComponent();

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
          color: 'text.primary',
          boxShadow: '0 2px 8px rgba(126, 58, 242, 0.08)',
          borderBottom: '1px solid rgba(126, 58, 242, 0.1)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {navigationItems.find(item => item.id === activeSection)?.label || 'Farm Management'}
          </Typography>
          
          {/* Header Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationCenter />
            
            <IconButton color="inherit" onClick={() => handleSectionChange('settings')}>
              <Settings />
            </IconButton>
            
            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                JD
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleProfileSettings}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          Profile Settings
        </MenuItem>
        <MenuItem onClick={handlePreferences}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Preferences
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'background.paper',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: 'background.paper',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Toolbar />
        
        {/* Page Header - Modern & Responsive */}
        <Box
          sx={{
            mb: 3,
            pb: 2,
            borderBottom: '2px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
        </Box>

        {/* Dashboard Content */}
        <Box>
          <CurrentComponent />
        </Box>
      </Box>
    </Box>
  );
};

export default FarmManagementDashboard;