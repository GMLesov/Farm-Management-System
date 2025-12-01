import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Button,
  Box,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Collapse,
  Divider
} from '@mui/material';
import {
  Warning as WarningIcon,
  Build as MaintenanceIcon,
  Pets as AnimalIcon,
  Grass as CropIcon,
  Inventory as ResourceIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';

interface PredictiveAlert {
  id: string;
  type: 'maintenance' | 'health' | 'crop' | 'resource';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  affectedItem: {
    id: string;
    name: string;
    type: string;
  };
  predictedDate: string;
  recommendations: string[];
  estimatedCost?: number;
}

const PredictiveAlertsDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<PredictiveAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
    // Refresh every hour
    const interval = setInterval(fetchAlerts, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [activeTab, alerts]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'all' 
        ? '/api/alerts' 
        : activeTab === 'critical'
        ? '/api/alerts/critical'
        : `/api/alerts/${activeTab}`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAlerts = () => {
    if (activeTab === 'all') {
      setFilteredAlerts(alerts);
    } else if (activeTab === 'critical') {
      setFilteredAlerts(alerts.filter(a => a.severity === 'critical' || a.severity === 'high'));
    } else {
      setFilteredAlerts(alerts.filter(a => a.type === activeTab));
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleExpandClick = (alertId: string) => {
    setExpanded(expanded === alertId ? null : alertId);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#d32f2f';
      case 'high':
        return '#f57c00';
      case 'medium':
        return '#1976d2';
      default:
        return '#388e3c';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <MaintenanceIcon />;
      case 'health':
        return <AnimalIcon />;
      case 'crop':
        return <CropIcon />;
      case 'resource':
        return <ResourceIcon />;
      default:
        return <WarningIcon />;
    }
  };

  const getAlertCounts = () => {
    return {
      all: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length,
      equipment: alerts.filter(a => a.type === 'maintenance').length,
      animals: alerts.filter(a => a.type === 'health').length,
      crops: alerts.filter(a => a.type === 'crop').length,
      resources: alerts.filter(a => a.type === 'resource').length
    };
  };

  const counts = getAlertCounts();

  const handleCreateTask = (alert: PredictiveAlert) => {
    // Navigate to task creation with pre-filled data
    const taskData = {
      title: alert.title,
      description: alert.description,
      type: alert.type === 'maintenance' ? 'maintenance' : 'other',
      priority: alert.severity === 'critical' ? 'urgent' : alert.severity,
      dueDate: alert.predictedDate
    };
    localStorage.setItem('prefill_task', JSON.stringify(taskData));
    window.location.href = '/admin/tasks/create';
  };

  const handleDismiss = async (alertId: string) => {
    // In a real implementation, this would mark the alert as dismissed in the backend
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        avatar={
          <Badge badgeContent={counts.critical} color="error">
            <WarningIcon color="warning" />
          </Badge>
        }
        title="Predictive Alerts"
        subheader="Proactive maintenance and monitoring"
        action={
          <Button size="small" onClick={fetchAlerts} disabled={loading}>
            Refresh
          </Button>
        }
      />

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
      >
        <Tab
          label={
            <Badge badgeContent={counts.all} color="primary">
              All
            </Badge>
          }
          value="all"
        />
        <Tab
          label={
            <Badge badgeContent={counts.critical} color="error">
              Critical
            </Badge>
          }
          value="critical"
        />
        <Tab
          label={
            <Badge badgeContent={counts.equipment} color="default">
              Equipment
            </Badge>
          }
          value="equipment"
          icon={<MaintenanceIcon fontSize="small" />}
          iconPosition="start"
        />
        <Tab
          label={
            <Badge badgeContent={counts.animals} color="default">
              Animals
            </Badge>
          }
          value="animals"
          icon={<AnimalIcon fontSize="small" />}
          iconPosition="start"
        />
        <Tab
          label={
            <Badge badgeContent={counts.crops} color="default">
              Crops
            </Badge>
          }
          value="crops"
          icon={<CropIcon fontSize="small" />}
          iconPosition="start"
        />
        <Tab
          label={
            <Badge badgeContent={counts.resources} color="default">
              Resources
            </Badge>
          }
          value="resources"
          icon={<ResourceIcon fontSize="small" />}
          iconPosition="start"
        />
      </Tabs>

      <CardContent sx={{ maxHeight: 600, overflow: 'auto' }}>
        {filteredAlerts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No {activeTab !== 'all' ? activeTab : ''} alerts at this time
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Everything is running smoothly!
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredAlerts.map((alert, index) => (
              <React.Fragment key={alert.id}>
                {index > 0 && <Divider sx={{ my: 2 }} />}

                <ListItem
                  sx={{
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                    border: 2,
                    borderColor: getSeverityColor(alert.severity),
                    borderLeft: 6
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                    <ListItemIcon sx={{ minWidth: 56 }}>
                      <Avatar
                        sx={{
                          bgcolor: getSeverityColor(alert.severity),
                          width: 48,
                          height: 48
                        }}
                      >
                        {getTypeIcon(alert.type)}
                      </Avatar>
                    </ListItemIcon>

                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6">
                          {alert.title}
                        </Typography>
                        <Chip
                          label={alert.severity.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: getSeverityColor(alert.severity),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                        <Chip
                          label={alert.type}
                          size="small"
                          variant="outlined"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {alert.description}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        <Chip
                          icon={<CalendarIcon />}
                          label={`Due: ${new Date(alert.predictedDate).toLocaleDateString()}`}
                          size="small"
                          variant="outlined"
                        />
                        {alert.estimatedCost && (
                          <Chip
                            icon={<MoneyIcon />}
                            label={`Est. $${alert.estimatedCost}`}
                            size="small"
                            variant="outlined"
                            color="primary"
                          />
                        )}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleExpandClick(alert.id)}
                        sx={{
                          transform: expanded === alert.id ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: '0.3s'
                        }}
                      >
                        <ExpandMoreIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  <Collapse in={expanded === alert.id} timeout="auto" unmountOnExit>
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                        📋 Recommendations:
                      </Typography>
                      <List dense>
                        {alert.recommendations.map((rec, idx) => (
                          <ListItem key={idx} sx={{ py: 0.5 }}>
                            <ListItemText
                              primary={`• ${rec}`}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                      </List>

                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleCreateTask(alert)}
                          startIcon={<CheckIcon />}
                        >
                          Create Task
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => window.location.href = `/admin/${alert.affectedItem.type}/${alert.affectedItem.id}`}
                        >
                          View Details
                        </Button>
                        <Button
                          variant="text"
                          size="small"
                          color="error"
                          onClick={() => handleDismiss(alert.id)}
                        >
                          Dismiss
                        </Button>
                      </Box>
                    </Box>
                  </Collapse>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictiveAlertsDashboard;
