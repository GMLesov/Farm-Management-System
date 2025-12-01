import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Alert,
  Grid,
  Chip,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Build,
  Warning,
  CheckCircle,
  Schedule,
  LocalShipping,
  Agriculture,
  Settings,
  Add,
  Visibility,
  Edit,
  Delete,
} from '@mui/icons-material';

interface Equipment {
  id: string;
  name: string;
  type: string;
  status: 'operational' | 'maintenance' | 'broken' | 'idle';
  lastMaintenance: string;
  nextMaintenance: string;
  condition: number;
  location: string;
}

interface MaintenanceAlert {
  id: string;
  equipment: string;
  type: 'overdue' | 'upcoming' | 'urgent';
  message: string;
  date: string;
}

const EquipmentManagementDashboard: React.FC = () => {
  const [viewAlertsOpen, setViewAlertsOpen] = useState(false);
  const [addEquipmentOpen, setAddEquipmentOpen] = useState(false);

  const equipment: Equipment[] = [
    {
      id: '1',
      name: 'Tractor - John Deere 5075E',
      type: 'Tractor',
      status: 'operational',
      lastMaintenance: '2025-10-15',
      nextMaintenance: '2025-12-15',
      condition: 85,
      location: 'Main Barn',
    },
    {
      id: '2',
      name: 'Irrigation Pump #1',
      type: 'Irrigation',
      status: 'maintenance',
      lastMaintenance: '2025-09-20',
      nextMaintenance: '2025-11-20',
      condition: 60,
      location: 'Field A',
    },
    {
      id: '3',
      name: 'Harvester',
      type: 'Harvester',
      status: 'operational',
      lastMaintenance: '2025-11-01',
      nextMaintenance: '2026-01-01',
      condition: 90,
      location: 'Equipment Shed',
    },
    {
      id: '4',
      name: 'Sprayer System',
      type: 'Sprayer',
      status: 'broken',
      lastMaintenance: '2025-08-10',
      nextMaintenance: '2025-10-10',
      condition: 35,
      location: 'Field C',
    },
    {
      id: '5',
      name: 'Fertilizer Spreader',
      type: 'Spreader',
      status: 'operational',
      lastMaintenance: '2025-10-25',
      nextMaintenance: '2025-12-25',
      condition: 78,
      location: 'Main Barn',
    },
  ];

  const maintenanceAlerts: MaintenanceAlert[] = [
    {
      id: '1',
      equipment: 'Sprayer System',
      type: 'urgent',
      message: 'Critical repair needed - pump malfunction detected',
      date: '2025-11-10',
    },
    {
      id: '2',
      equipment: 'Irrigation Pump #1',
      type: 'overdue',
      message: 'Maintenance overdue by 15 days',
      date: '2025-10-29',
    },
    {
      id: '3',
      equipment: 'Tractor - John Deere 5075E',
      type: 'upcoming',
      message: 'Scheduled maintenance in 30 days',
      date: '2025-12-15',
    },
  ];

  const stats = {
    total: equipment.length,
    operational: equipment.filter((e) => e.status === 'operational').length,
    maintenance: equipment.filter((e) => e.status === 'maintenance').length,
    broken: equipment.filter((e) => e.status === 'broken').length,
    alerts: maintenanceAlerts.length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'success';
      case 'maintenance':
        return 'warning';
      case 'broken':
        return 'error';
      case 'idle':
        return 'default';
      default:
        return 'default';
    }
  };

  const getAlertSeverity = (type: string): 'error' | 'warning' | 'info' => {
    switch (type) {
      case 'urgent':
        return 'error';
      case 'overdue':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Equipment Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Visibility />}
            onClick={() => setViewAlertsOpen(true)}
            color="warning"
          >
            View Alerts ({stats.alerts})
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setAddEquipmentOpen(true)}>
            Add Equipment
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3} {...{} as any}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Equipment
                  </Typography>
                  <Typography variant="h4">{stats.total}</Typography>
                </Box>
                <Build sx={{ fontSize: 48, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} {...{} as any}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Operational
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {stats.operational}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 48, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} {...{} as any}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    In Maintenance
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {stats.maintenance}
                  </Typography>
                </Box>
                <Schedule sx={{ fontSize: 48, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3} {...{} as any}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Broken/Repair
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {stats.broken}
                  </Typography>
                </Box>
                <Warning sx={{ fontSize: 48, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Equipment List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Equipment Inventory
          </Typography>
          <List>
            {equipment.map((item, index) => (
              <React.Fragment key={item.id}>
                {index > 0 && <Divider />}
                <ListItem
                  secondaryAction={
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton edge="end" size="small">
                        <Edit />
                      </IconButton>
                      <IconButton edge="end" size="small">
                        <Delete />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <Agriculture />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1">{item.name}</Typography>
                        <Chip label={item.status} color={getStatusColor(item.status)} size="small" />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" display="block">
                          Type: {item.type} | Location: {item.location}
                        </Typography>
                        <Typography variant="caption" display="block">
                          Last Maintenance: {item.lastMaintenance} | Next: {item.nextMaintenance}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption">Condition: {item.condition}%</Typography>
                          <LinearProgress
                            variant="determinate"
                            value={item.condition}
                            sx={{ mt: 0.5 }}
                            color={item.condition > 70 ? 'success' : item.condition > 40 ? 'warning' : 'error'}
                          />
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* View Alerts Dialog */}
      <Dialog open={viewAlertsOpen} onClose={() => setViewAlertsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Maintenance Alerts</DialogTitle>
        <DialogContent>
          <List>
            {maintenanceAlerts.map((alert, index) => (
              <React.Fragment key={alert.id}>
                {index > 0 && <Divider sx={{ my: 1 }} />}
                <Alert severity={getAlertSeverity(alert.type)} sx={{ mb: 1 }}>
                  <Typography variant="subtitle2">{alert.equipment}</Typography>
                  <Typography variant="body2">{alert.message}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {alert.date}
                  </Typography>
                </Alert>
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewAlertsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Equipment Dialog */}
      <Dialog open={addEquipmentOpen} onClose={() => setAddEquipmentOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Equipment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField fullWidth label="Equipment Name" />
            <TextField fullWidth label="Type" />
            <TextField fullWidth label="Location" />
            <TextField fullWidth label="Purchase Date" type="date" InputLabelProps={{ shrink: true }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddEquipmentOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAddEquipmentOpen(false)}>
            Add Equipment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EquipmentManagementDashboard;
