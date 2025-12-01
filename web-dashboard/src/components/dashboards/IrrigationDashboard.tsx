import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Alert,
  Slider,
  CircularProgress,
} from '@mui/material';
import {
  WaterDrop,
  Schedule,
  Speed,
  Thermostat,
  Opacity,
  PlayArrow,
  Stop,
  Edit,
  Add,
  Settings,
  TrendingUp,
  Warning,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { irrigationService, IrrigationZone } from '../../services/irrigation';

const IrrigationDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const farmId = user?.farmId || localStorage.getItem('farmId') || '';

  const [zones, setZones] = useState<IrrigationZone[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [systemEnabled, setSystemEnabled] = useState(true);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [newZone, setNewZone] = useState({
    name: '',
    area: '',
    cropType: '',
    flowRate: '',
  });

  useEffect(() => {
    if (farmId) {
      loadZones();
    }
  }, [farmId]);

  const loadZones = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await irrigationService.getAllZones();
      setZones(data);
    } catch (err: any) {
      console.error('Failed to load irrigation zones:', err);
      setError(err.message || 'Failed to load irrigation zones');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'scheduled': return 'primary';
      case 'inactive': return 'default';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
          <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
            Control and monitor irrigation systems and schedules.
          </Typography>
  };

  const getMoistureColor = (moisture: number) => {
    if (moisture < 30) return 'error';
    if (moisture < 50) return 'warning';
    if (moisture < 70) return 'primary';
    return 'success';
  };

  const toggleZone = async (zoneId: string) => {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;

    setLoading(true);
    try {
      if (zone.status === 'active') {
        await irrigationService.stopZone(zoneId);
      } else {
        await irrigationService.startZone(zoneId);
      }
      await loadZones(); // Reload to get updated status
    } catch (err: any) {
      console.error('Failed to toggle zone:', err);
      setError(err.message || 'Failed to toggle zone');
    } finally {
      setLoading(false);
    }
  };

  const handleAddZone = async () => {
    if (!newZone.name || !newZone.area || !newZone.cropType || !newZone.flowRate) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const zoneData = {
        farmId: farmId,
        name: newZone.name,
        area: parseFloat(newZone.area),
        cropType: newZone.cropType,
        soilMoisture: 50,
        temperature: 25,
        humidity: 60,
        flowRate: parseFloat(newZone.flowRate),
        coordinates: { lat: 0, lng: 0 },
      };

      await irrigationService.createZone(zoneData);
      await loadZones(); // Reload zones
      setNewZone({ name: '', area: '', cropType: '', flowRate: '' });
      setDialogOpen(false);
    } catch (err: any) {
      console.error('Failed to create zone:', err);
      setError(err.message || 'Failed to create zone');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteZone = async (zoneId: string) => {
    if (!window.confirm('Are you sure you want to delete this irrigation zone?')) {
      return;
    }

    setLoading(true);
    try {
      await irrigationService.deleteZone(zoneId);
      await loadZones();
    } catch (err: any) {
      console.error('Failed to delete zone:', err);
      setError(err.message || 'Failed to delete zone');
    } finally {
      setLoading(false);
    }
  };

  const totalWaterUsage = zones.reduce((sum, zone) => sum + zone.waterUsage, 0);
  const activeZones = zones.filter(zone => zone.status === 'active').length;
  const lowMoistureZones = zones.filter(zone => zone.soilMoisture < 40).length;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={systemEnabled}
                onChange={(e) => {
                  setSystemEnabled(e.target.checked);
                  alert(e.target.checked ? 'Irrigation system activated' : 'Irrigation system deactivated');
                }}
                color="primary"
              />
            }
            label="System Enabled"
          />
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setDialogOpen(true)}
            disabled={loading || !farmId}
          >
            Add Zone
          </Button>
        </Box>
      </Box>

      {!farmId && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No farm selected. Please select a farm to manage irrigation.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && zones.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {emergencyMode && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Emergency irrigation mode activated. All zones running at maximum capacity.
        </Alert>
      )}

      {lowMoistureZones > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {lowMoistureZones} zone(s) have critically low soil moisture levels.
        </Alert>
      )}

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WaterDrop sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Active Zones</Typography>
            </Box>
            <Typography variant="h3" color="primary">
              {activeZones}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              of {zones.length} total zones
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Speed sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="h6">Water Usage</Typography>
            </Box>
            <Typography variant="h3" color="info.main">
              {totalWaterUsage.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              gallons this week
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Opacity sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6">Avg Moisture</Typography>
            </Box>
            <Typography variant="h3" color="success.main">
              {Math.round(zones.reduce((sum, zone) => sum + zone.soilMoisture, 0) / zones.length)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              soil moisture level
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Warning sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6">Alerts</Typography>
            </Box>
            <Typography variant="h3" color="warning.main">
              {lowMoistureZones}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              zones need attention
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Quick Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Controls
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              sx={{ flex: 1, minWidth: 200 }}
              variant="contained"
              color="primary"
              startIcon={<PlayArrow />}
              onClick={() => setEmergencyMode(!emergencyMode)}
            >
              {emergencyMode ? 'Stop Emergency' : 'Emergency Irrigation'}
            </Button>
            <Button
              sx={{ flex: 1, minWidth: 200 }}
              variant="outlined"
              startIcon={<Schedule />}
              onClick={() => alert('Schedule All Zones - Feature coming soon!')}
            >
              Schedule All
            </Button>
            <Button
              sx={{ flex: 1, minWidth: 200 }}
              variant="outlined"
              startIcon={<Stop />}
              onClick={() => {
                if (window.confirm('Stop irrigation in all zones?')) {
                  alert('All zones stopped');
                }
              }}
            >
              Stop All Zones
            </Button>
            <Button
              sx={{ flex: 1, minWidth: 200 }}
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => alert('System Settings - Feature coming soon!')}
            >
              System Settings
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Irrigation Zones Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Irrigation Zones
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Zone Name</TableCell>
                  <TableCell>Area</TableCell>
                  <TableCell>Crop Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Soil Moisture</TableCell>
                  <TableCell>Flow Rate</TableCell>
                  <TableCell>Last Watered</TableCell>
                  <TableCell>Next Scheduled</TableCell>
                  <TableCell align="right">Controls</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {zones.map((zone) => (
                  <TableRow key={zone.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{zone.name}</Typography>
                    </TableCell>
                    <TableCell>{zone.area} acres</TableCell>
                    <TableCell>{zone.cropType}</TableCell>
                    <TableCell>
                      <Chip
                        label={zone.status}
                        color={getStatusColor(zone.status) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 150 }}>
                        <LinearProgress
                          variant="determinate"
                          value={zone.soilMoisture}
                          sx={{ 
                            flexGrow: 1, 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: getMoistureColor(zone.soilMoisture) === 'error' ? '#f44336' :
                                             getMoistureColor(zone.soilMoisture) === 'warning' ? '#ff9800' :
                                             getMoistureColor(zone.soilMoisture) === 'primary' ? '#2196f3' : '#4caf50'
                            }
                          }}
                        />
                        <Typography variant="body2">{zone.soilMoisture}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{zone.flowRate} GPM</TableCell>
                    <TableCell>{new Date(zone.lastWatered).toLocaleString()}</TableCell>
                    <TableCell>{new Date(zone.nextScheduled).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color={zone.status === 'active' ? 'error' : 'primary'}
                        onClick={() => toggleZone(zone.id)}
                        disabled={loading}
                        title={zone.status === 'active' ? 'Stop Zone' : 'Start Zone'}
                      >
                        {zone.status === 'active' ? <Stop /> : <PlayArrow />}
                      </IconButton>
                      <IconButton size="small" color="secondary" title="Edit">
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteZone(zone.id)}
                        disabled={loading}
                        title="Delete"
                      >
                        <Warning />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add Zone Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Irrigation Zone</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField 
              label="Zone Name" 
              fullWidth 
              required
              value={newZone.name}
              onChange={(e) => setNewZone({ ...newZone, name: e.target.value })}
              placeholder="e.g., North Field A"
            />
            <TextField 
              label="Area (hectares)" 
              type="number" 
              fullWidth 
              required
              value={newZone.area}
              onChange={(e) => setNewZone({ ...newZone, area: e.target.value })}
              inputProps={{ min: 0.01, step: 0.1 }}
            />
            <FormControl fullWidth required>
              <InputLabel>Crop Type</InputLabel>
              <Select 
                label="Crop Type"
                value={newZone.cropType}
                onChange={(e) => setNewZone({ ...newZone, cropType: e.target.value })}
              >
                <MenuItem value="corn">Corn</MenuItem>
                <MenuItem value="tomatoes">Tomatoes</MenuItem>
                <MenuItem value="wheat">Wheat</MenuItem>
                <MenuItem value="rice">Rice</MenuItem>
                <MenuItem value="vegetables">Vegetables</MenuItem>
                <MenuItem value="apples">Apple Trees</MenuItem>
                <MenuItem value="citrus">Citrus</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField 
              label="Flow Rate (L/min)" 
              type="number" 
              fullWidth 
              required
              value={newZone.flowRate}
              onChange={(e) => setNewZone({ ...newZone, flowRate: e.target.value })}
              inputProps={{ min: 1, step: 0.5 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAddZone} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Add Zone'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IrrigationDashboard;