import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Alert,
  Fab,
  CircularProgress,
  Skeleton,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Add,
  Agriculture,
  Timeline,
  WaterDrop,
  Nature,
  TrendingUp,
  Warning,
  Edit,
  Delete,
  Grass,
  Visibility,
  Schedule,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import cropService from '../../services/crop';
import type { EnhancedCrop, CropStage } from '../../types/crop';

interface SimpleCrop {
  id: string;
  name: string;
  variety: string;
  plantedDate: string;
  expectedHarvest: string;
  area: number;
  status: 'planted' | 'growing' | 'flowering' | 'harvest-ready' | 'harvested';
  health: 'excellent' | 'good' | 'fair' | 'poor';
  progress: number;
}

const CropManagementDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const farmId = user?.farmId || localStorage.getItem('farmId') || '';
  
  const [crops, setCrops] = useState<SimpleCrop[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedCropForTask, setSelectedCropForTask] = useState<SimpleCrop | null>(null);
  const [newTask, setNewTask] = useState({
    taskType: 'watering',
    scheduledDate: '',
    description: '',
    recurring: false,
    recurringInterval: 'none'
  });
  const [newCrop, setNewCrop] = useState({
    name: '',
    variety: '',
    plantedDate: '',
    expectedHarvest: '',
    area: '',
    category: 'vegetables' as 'vegetables' | 'fruits' | 'grains' | 'herbs' | 'legumes' | 'flowers',
    fieldLocation: '',
  });

  useEffect(() => {
    if (farmId) {
      loadCrops();
    }
  }, [farmId]);

  const loadCrops = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Loading crops for farmId:', farmId);
      const response = await cropService.getAllCrops({ farmId: farmId });
      console.log('Crops response:', response);
      
      // Ensure response is an array
      if (!Array.isArray(response)) {
        console.error('Invalid crops response - not an array:', response);
        setCrops([]);
        setError('Invalid data format received');
        return;
      }
      
      // Convert EnhancedCrop to SimpleCrop for display
      const simpleCrops: SimpleCrop[] = response.map((crop: EnhancedCrop) => ({
        id: crop.id,
        name: crop.name,
        variety: crop.variety,
        plantedDate: crop.plantingDate,
        expectedHarvest: crop.expectedHarvestDate,
        area: crop.area,
        status: mapStageToStatus(crop.stage),
        health: mapHealthStatus(crop.healthStatus),
        progress: crop.growthProgress || 0,
      }));
      console.log('Processed crops:', simpleCrops);
      setCrops(simpleCrops);
    } catch (err: any) {
      console.error('Failed to load crops:', err);
      setError(err.message || 'Failed to load crops');
      setCrops([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const mapStageToStatus = (stage: CropStage | any): SimpleCrop['status'] => {
    if (!stage) return 'growing';
    const stageCurrent = typeof stage === 'object' ? stage.current : stage;
    const stageMap: Record<string, SimpleCrop['status']> = {
      'planted': 'planted',
      'germination': 'planted',
      'vegetative': 'growing',
      'flowering': 'flowering',
      'fruiting': 'harvest-ready',
      'maturation': 'harvest-ready',
      'harvested': 'harvested',
      'post_harvest': 'harvested',
    };
    return stageMap[stageCurrent] || 'growing';
  };

  const mapHealthStatus = (health: any): SimpleCrop['health'] => {
    if (!health || !health.overall) return 'good';
    const overall = health.overall;
    if (overall === 'excellent') return 'excellent';
    if (overall === 'good') return 'good';
    if (overall === 'fair') return 'fair';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planted': return 'info';
      case 'growing': return 'primary';
      case 'flowering': return 'secondary';
      case 'harvest-ready': return 'warning';
      case 'harvested': return 'success';
      default: return 'default';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'success';
      case 'good': return 'primary';
      case 'fair': return 'warning';
      case 'poor': return 'error';
      default: return 'default';
    }
  };

  const handleAddCrop = async () => {
    if (!newCrop.name || !newCrop.variety || !newCrop.plantedDate || !newCrop.expectedHarvest || !newCrop.area) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const cropData = {
        farmId: farmId,
        name: newCrop.name,
        variety: newCrop.variety,
        category: newCrop.category,
        fieldLocation: newCrop.fieldLocation || 'Main Field',
        area: parseFloat(newCrop.area),
        soilType: 'Unknown',
        plantingDate: newCrop.plantedDate,
        expectedHarvestDate: newCrop.expectedHarvest,
        stage: {
          current: 'planting' as const,
          progress: 0,
          expectedDuration: 90,
          milestones: [],
        },
        growthProgress: 0,
        assignedWorkers: [],
        taskSchedule: [],
        workHours: [],
        varietyInfo: {
          scientificName: 'Unknown',
          growthHabit: 'Unknown',
          maturityDays: 90,
          yieldPotential: 5000,
          climateZone: ['temperate'],
          soilPreference: ['loamy'],
          waterRequirement: 'medium' as const,
          sunlightRequirement: 'full_sun' as const,
          spacing: {
            rowSpacing: 50,
            plantSpacing: 30,
          },
        },
        environmentalConditions: {
          temperature: {
            min: 15,
            max: 30,
            average: 25,
            optimal: { min: 20, max: 28 },
          },
          humidity: {
            current: 60,
            optimal: { min: 50, max: 70 },
          },
          soilMoisture: {
            current: 50,
            optimal: { min: 40, max: 60 },
          },
          ph: {
            current: 6.5,
            optimal: { min: 6.0, max: 7.5 },
          },
          lightHours: 8,
          lastUpdated: new Date().toISOString(),
        },
        fertilizerPlan: [],
        irrigationSchedule: [],
        pestControlLog: [],
        harvestSchedule: [],
        qualityMetrics: {
          overallGrade: 'A' as const,
          size: {
            average: 100,
            range: { min: 90, max: 110 },
            uniformity: 100,
          },
          color: {
            score: 100,
            consistency: 100,
          },
          defects: [],
          pestDamage: 0,
          diseasePresence: 0,
          nutritionalValue: {
            vitamins: {},
            minerals: {},
          },
          shelfLife: 30,
          lastAssessment: new Date().toISOString(),
        },
        photos: [],
        healthStatus: {
          overall: 'good' as const,
          plantVigor: 100,
          diseasePresence: [],
          pestPresence: [],
          nutritionalDeficiency: [],
          stressFactors: [],
          treatmentHistory: [],
          lastAssessment: new Date().toISOString(),
          nextAssessmentDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        },
        riskFactors: [],
        recommendations: [],
        costs: [],
        expectedRevenue: 0,
        notes: '',
        tags: [],
        createdBy: user?.email || 'system',
      };

      const created = await cropService.createCrop(cropData);
      await loadCrops(); // Reload all crops
      setNewCrop({ 
        name: '', 
        variety: '', 
        plantedDate: '', 
        expectedHarvest: '', 
        area: '',
        category: 'vegetables',
        fieldLocation: '',
      });
      setDialogOpen(false);
    } catch (err: any) {
      console.error('Failed to create crop:', err);
      setError(err.message || 'Failed to create crop');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCrop = async (cropId: string) => {
    if (!window.confirm('Are you sure you want to delete this crop?')) {
      return;
    }

    setLoading(true);
    try {
      await cropService.deleteCrop(cropId);
      await loadCrops(); // Reload crops after deletion
    } catch (err: any) {
      console.error('Failed to delete crop:', err);
      setError(err.message || 'Failed to delete crop');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTaskDialog = (crop: SimpleCrop) => {
    setSelectedCropForTask(crop);
    setNewTask({
      taskType: 'watering',
      scheduledDate: '',
      description: '',
      recurring: false,
      recurringInterval: 'none'
    });
    setTaskDialogOpen(true);
  };

  const handleScheduleTask = async () => {
    if (!selectedCropForTask || !newTask.scheduledDate) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await cropService.scheduleTask(selectedCropForTask.id, newTask);
      setTaskDialogOpen(false);
      setSelectedCropForTask(null);
      // Show success message
      setError(null);
    } catch (err: any) {
      console.error('Failed to schedule task:', err);
      setError(err.message || 'Failed to schedule task');
    } finally {
      setLoading(false);
    }
  };

  const totalArea = (crops || []).reduce((sum, crop) => sum + crop.area, 0);
  const activeSeasons = (crops || []).filter(crop => crop.status !== 'harvested').length;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
        Crop Management
      </Typography>
      <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
        Track crop growth, field activities, and manage planting schedules
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          disabled={loading || !farmId}
        >
          Add New Crop
        </Button>
      </Box>

      {!farmId && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          No farm selected. Please select a farm to manage crops.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading && crops.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Card sx={{ 
          flex: 1,
          minWidth: 240,
          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 24px rgba(76, 175, 80, 0.15)',
          }
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Agriculture sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Total Crops</Typography>
            </Box>
            <Typography variant="h3" color="primary">
              {crops.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active growing seasons
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 240 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Nature sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6">Total Area</Typography>
            </Box>
            <Typography variant="h3" color="success.main">
              {totalArea.toFixed(1)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              acres under cultivation
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Timeline sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="h6">Active Seasons</Typography>
            </Box>
            <Typography variant="h3" color="info.main">
              {activeSeasons}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              crops in progress
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 240 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUp sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6">Avg Progress</Typography>
            </Box>
            <Typography variant="h3" color="warning.main">
              {Math.round(crops.length > 0 ? crops.reduce((sum, crop) => sum + crop.progress, 0) / crops.length : 0)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              to harvest
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Crops Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Crops
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Crop Name</TableCell>
                  <TableCell>Variety</TableCell>
                  <TableCell>Area (acres)</TableCell>
                  <TableCell>Planted Date</TableCell>
                  <TableCell>Expected Harvest</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Health</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(crops || []).length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Box sx={{ py: 8, textAlign: 'center' }}>
                        <Box
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                            margin: '0 auto 16px',
                          }}
                        >
                          <Grass sx={{ fontSize: 48, color: '#4CAF50', opacity: 0.7 }} />
                        </Box>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          No Crops Yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Start managing your farm by adding your first crop field
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<Add />}
                          onClick={() => setDialogOpen(true)}
                          sx={{ px: 4 }}
                        >
                          Add Your First Crop
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : null}
                {(crops || []).map((crop) => (
                  <TableRow key={crop.id} hover sx={{ '&:hover': { bgcolor: 'action.hover', transform: 'scale(1.002)', transition: 'all 0.2s' } }}>
                    <TableCell>
                      <Typography variant="subtitle2">{crop.name}</Typography>
                    </TableCell>
                    <TableCell>{crop.variety}</TableCell>
                    <TableCell>{crop.area}</TableCell>
                    <TableCell>{new Date(crop.plantedDate).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(crop.expectedHarvest).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label={crop.status}
                        color={getStatusColor(crop.status) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={crop.health}
                        color={getHealthColor(crop.health) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={crop.progress}
                          sx={{ flexGrow: 1, height: 8, borderRadius: 4 }}
                        />
                        <Typography variant="body2">{crop.progress}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="primary" title="View Details">
                        <Visibility />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="info" 
                        onClick={() => handleOpenTaskDialog(crop)}
                        disabled={loading}
                        title="Schedule Task"
                      >
                        <Schedule />
                      </IconButton>
                      <IconButton size="small" color="secondary" title="Edit">
                        <Edit />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleDeleteCrop(crop.id)}
                        disabled={loading}
                        title="Delete"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add Crop Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Crop</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Crop Name"
              value={newCrop.name}
              onChange={(e) => setNewCrop({ ...newCrop, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Variety"
              value={newCrop.variety}
              onChange={(e) => setNewCrop({ ...newCrop, variety: e.target.value })}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Category</InputLabel>
              <Select
                value={newCrop.category}
                label="Category"
                onChange={(e) => setNewCrop({ ...newCrop, category: e.target.value as any })}
              >
                <MenuItem value="vegetables">Vegetables</MenuItem>
                <MenuItem value="fruits">Fruits</MenuItem>
                <MenuItem value="grains">Grains</MenuItem>
                <MenuItem value="herbs">Herbs</MenuItem>
                <MenuItem value="legumes">Legumes</MenuItem>
                <MenuItem value="flowers">Flowers</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Field Location"
              value={newCrop.fieldLocation}
              onChange={(e) => setNewCrop({ ...newCrop, fieldLocation: e.target.value })}
              fullWidth
              placeholder="e.g., North Field, Greenhouse A"
            />
            <TextField
              label="Area (hectares)"
              type="number"
              value={newCrop.area}
              onChange={(e) => setNewCrop({ ...newCrop, area: e.target.value })}
              fullWidth
              required
              inputProps={{ min: 0.01, step: 0.1 }}
            />
            <TextField
              label="Planted Date"
              type="date"
              value={newCrop.plantedDate}
              onChange={(e) => setNewCrop({ ...newCrop, plantedDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="Expected Harvest Date"
              type="date"
              value={newCrop.expectedHarvest}
              onChange={(e) => setNewCrop({ ...newCrop, expectedHarvest: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleAddCrop} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Add Crop'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Task Dialog */}
      <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Schedule Task for {selectedCropForTask?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Task Type</InputLabel>
              <Select
                value={newTask.taskType}
                label="Task Type"
                onChange={(e) => setNewTask({ ...newTask, taskType: e.target.value })}
              >
                <MenuItem value="watering">Watering</MenuItem>
                <MenuItem value="fertilizing">Fertilizing</MenuItem>
                <MenuItem value="pest_control">Pest Control</MenuItem>
                <MenuItem value="weeding">Weeding</MenuItem>
                <MenuItem value="pruning">Pruning</MenuItem>
                <MenuItem value="harvesting">Harvesting</MenuItem>
                <MenuItem value="inspection">Inspection</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Scheduled Date"
              type="date"
              value={newTask.scheduledDate}
              onChange={(e) => setNewTask({ ...newTask, scheduledDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="Task details and special instructions..."
            />
            <FormControl component="fieldset">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2">Recurring Task:</Typography>
                <Button
                  size="small"
                  variant={newTask.recurring ? 'contained' : 'outlined'}
                  onClick={() => setNewTask({ ...newTask, recurring: !newTask.recurring })}
                >
                  {newTask.recurring ? 'Yes' : 'No'}
                </Button>
              </Box>
            </FormControl>
            {newTask.recurring && (
              <FormControl fullWidth>
                <InputLabel>Recurring Interval</InputLabel>
                <Select
                  value={newTask.recurringInterval}
                  label="Recurring Interval"
                  onChange={(e) => setNewTask({ ...newTask, recurringInterval: e.target.value })}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="biweekly">Bi-weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialogOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleScheduleTask} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Schedule Task'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CropManagementDashboard;
