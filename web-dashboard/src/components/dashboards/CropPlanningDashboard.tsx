import React, { useState } from 'react';
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
  Alert,
  Tabs,
  Tab,
  Snackbar,
  LinearProgress,
  Grid,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Grass,
  CalendarToday,
  WaterDrop,
  BugReport,
  TrendingUp,
  CheckCircle,
  Warning,
  Schedule,
} from '@mui/icons-material';

interface CropField {
  id: string;
  name: string;
  cropType: string;
  variety: string;
  area: number; // in acres or hectares
  unit: 'acres' | 'hectares';
  plantingDate: string;
  expectedHarvestDate: string;
  actualHarvestDate?: string;
  growthStage: 'planted' | 'germination' | 'vegetative' | 'flowering' | 'maturity' | 'harvested';
  expectedYield: number;
  actualYield?: number;
  yieldUnit: string;
  status: 'active' | 'harvested' | 'fallow';
  notes: string;
}

interface FertilizerApplication {
  id: string;
  fieldId: string;
  fieldName: string;
  fertilizerType: string;
  amountPerArea: number;
  totalAmount: number;
  unit: string;
  applicationDate: string;
  applicationMethod: string;
  cost: number;
  appliedBy: string;
  notes: string;
}

interface PesticideApplication {
  id: string;
  fieldId: string;
  fieldName: string;
  pesticideType: string;
  targetPest: string;
  amount: number;
  unit: string;
  applicationDate: string;
  applicationMethod: string;
  cost: number;
  appliedBy: string;
  notes: string;
}

interface IrrigationSchedule {
  id: string;
  fieldId: string;
  fieldName: string;
  method: 'sprinkler' | 'drip' | 'flood' | 'manual';
  frequency: string;
  duration: number; // in hours
  waterSource: string;
  nextIrrigation: string;
  status: 'active' | 'paused' | 'completed';
}

interface CropTask {
  id: string;
  fieldId: string;
  fieldName: string;
  taskType: 'watering' | 'weeding' | 'fertilizing' | 'pest-control' | 'pruning' | 'harvesting' | 'soil-prep' | 'other';
  taskName: string;
  description: string;
  scheduledDate: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  estimatedDuration: number; // in hours
  completedDate?: string;
  notes: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const CropPlanningDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [fertilizerDialogOpen, setFertilizerDialogOpen] = useState(false);
  const [pesticideDialogOpen, setPesticideDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editingField, setEditingField] = useState<CropField | null>(null);
  const [editingTask, setEditingTask] = useState<CropTask | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const [cropFields, setCropFields] = useState<CropField[]>([
    {
      id: 'f1',
      name: 'North Field Section A',
      cropType: 'Maize',
      variety: 'Hybrid DK-8031',
      area: 5,
      unit: 'acres',
      plantingDate: '2025-10-15',
      expectedHarvestDate: '2026-02-15',
      growthStage: 'flowering',
      expectedYield: 2500,
      yieldUnit: 'kg',
      status: 'active',
      notes: 'Good soil preparation, irrigation system active',
    },
    {
      id: 'f2',
      name: 'South Field',
      cropType: 'Wheat',
      variety: 'Kenya Fahari',
      area: 3,
      unit: 'acres',
      plantingDate: '2025-09-01',
      expectedHarvestDate: '2026-01-15',
      growthStage: 'maturity',
      expectedYield: 1800,
      yieldUnit: 'kg',
      status: 'active',
      notes: 'Ready for harvest soon',
    },
    {
      id: 'f3',
      name: 'East Field',
      cropType: 'Tomatoes',
      variety: 'Money Maker',
      area: 2,
      unit: 'acres',
      plantingDate: '2025-09-20',
      expectedHarvestDate: '2025-12-20',
      growthStage: 'vegetative',
      expectedYield: 3000,
      yieldUnit: 'kg',
      status: 'active',
      notes: 'Under greenhouse, drip irrigation',
    },
    {
      id: 'f4',
      name: 'West Field',
      cropType: 'Potatoes',
      variety: 'Shangi',
      area: 4,
      unit: 'acres',
      plantingDate: '2025-08-01',
      expectedHarvestDate: '2025-11-15',
      actualHarvestDate: '2025-11-18',
      growthStage: 'harvested',
      expectedYield: 4000,
      actualYield: 4200,
      yieldUnit: 'kg',
      status: 'harvested',
      notes: 'Good yield, exceeded expectations by 5%',
    },
  ]);

  const [fertilizerApplications, setFertilizerApplications] = useState<FertilizerApplication[]>([
    {
      id: 'fa1',
      fieldId: 'f1',
      fieldName: 'North Field Section A',
      fertilizerType: 'NPK 17:17:17',
      amountPerArea: 50,
      totalAmount: 250,
      unit: 'kg',
      applicationDate: '2025-10-20',
      applicationMethod: 'Broadcasting',
      cost: 13750,
      appliedBy: 'John Kamau',
      notes: 'Applied 5 days after planting',
    },
    {
      id: 'fa2',
      fieldId: 'f1',
      fieldName: 'North Field Section A',
      fertilizerType: 'Urea',
      amountPerArea: 30,
      totalAmount: 150,
      unit: 'kg',
      applicationDate: '2025-11-10',
      applicationMethod: 'Top dressing',
      cost: 7200,
      appliedBy: 'John Kamau',
      notes: 'Top dressing at 4 weeks',
    },
    {
      id: 'fa3',
      fieldId: 'f2',
      fieldName: 'South Field',
      fertilizerType: 'DAP',
      amountPerArea: 40,
      totalAmount: 120,
      unit: 'kg',
      applicationDate: '2025-09-05',
      applicationMethod: 'Banding',
      cost: 8400,
      appliedBy: 'Peter Mwangi',
      notes: 'Placed in rows during planting',
    },
  ]);

  const [pesticideApplications, setPesticideApplications] = useState<PesticideApplication[]>([
    {
      id: 'pa1',
      fieldId: 'f1',
      fieldName: 'North Field Section A',
      pesticideType: 'Duduthrin 1.75EC',
      targetPest: 'Fall Armyworm',
      amount: 500,
      unit: 'ml',
      applicationDate: '2025-11-05',
      applicationMethod: 'Spraying',
      cost: 1500,
      appliedBy: 'John Kamau',
      notes: 'Early morning application',
    },
    {
      id: 'pa2',
      fieldId: 'f3',
      fieldName: 'East Field',
      pesticideType: 'Ridomil Gold',
      targetPest: 'Late Blight',
      amount: 300,
      unit: 'grams',
      applicationDate: '2025-10-15',
      applicationMethod: 'Spraying',
      cost: 2000,
      appliedBy: 'Mary Wanjiku',
      notes: 'Preventive application',
    },
  ]);

  const [cropTasks, setCropTasks] = useState<CropTask[]>([
    {
      id: 'ct1',
      fieldId: 'f1',
      fieldName: 'North Field Section A',
      taskType: 'watering',
      taskName: 'Weekly Irrigation',
      description: 'Water the maize field for 3 hours',
      scheduledDate: '2025-11-16',
      dueDate: '2025-11-16',
      status: 'pending',
      priority: 'high',
      assignedTo: 'John Kamau',
      estimatedDuration: 3,
      notes: 'Use drip irrigation system',
    },
    {
      id: 'ct2',
      fieldId: 'f1',
      fieldName: 'North Field Section A',
      taskType: 'weeding',
      taskName: 'Manual Weeding',
      description: 'Remove weeds between crop rows',
      scheduledDate: '2025-11-18',
      dueDate: '2025-11-20',
      status: 'pending',
      priority: 'medium',
      assignedTo: 'Peter Mwangi',
      estimatedDuration: 6,
      notes: 'Focus on north section first',
    },
    {
      id: 'ct3',
      fieldId: 'f2',
      fieldName: 'South Field',
      taskType: 'fertilizing',
      taskName: 'Top Dressing',
      description: 'Apply nitrogen fertilizer to wheat crop',
      scheduledDate: '2025-11-15',
      dueDate: '2025-11-15',
      status: 'in-progress',
      priority: 'urgent',
      assignedTo: 'Mary Wanjiku',
      estimatedDuration: 4,
      notes: 'Apply during dry weather',
    },
  ]);

  const [fieldFormData, setFieldFormData] = useState<Partial<CropField>>({
    name: '',
    cropType: '',
    variety: '',
    area: 0,
    unit: 'acres',
    plantingDate: '',
    expectedHarvestDate: '',
    growthStage: 'planted',
    expectedYield: 0,
    yieldUnit: 'kg',
    notes: '',
  });

  const [fertilizerFormData, setFertilizerFormData] = useState<Partial<FertilizerApplication>>({
    fieldId: '',
    fertilizerType: '',
    amountPerArea: 0,
    unit: 'kg',
    applicationDate: '',
    applicationMethod: '',
    cost: 0,
    appliedBy: '',
    notes: '',
  });

  const [pesticideFormData, setPesticideFormData] = useState<Partial<PesticideApplication>>({
    fieldId: '',
    pesticideType: '',
    targetPest: '',
    amount: 0,
    unit: 'ml',
    applicationDate: '',
    applicationMethod: '',
    cost: 0,
    appliedBy: '',
    notes: '',
  });

  const [taskFormData, setTaskFormData] = useState<Partial<CropTask>>({
    fieldId: '',
    taskType: 'watering',
    taskName: '',
    description: '',
    scheduledDate: '',
    dueDate: '',
    status: 'pending',
    priority: 'medium',
    assignedTo: '',
    estimatedDuration: 2,
    notes: '',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getGrowthStageProgress = (stage: string): number => {
    const stages = {
      'planted': 10,
      'germination': 25,
      'vegetative': 50,
      'flowering': 75,
      'maturity': 90,
      'harvested': 100,
    };
    return stages[stage as keyof typeof stages] || 0;
  };

  const getGrowthStageColor = (stage: string) => {
    const colors = {
      'planted': 'default',
      'germination': 'info',
      'vegetative': 'success',
      'flowering': 'primary',
      'maturity': 'warning',
      'harvested': 'default',
    };
    return colors[stage as keyof typeof colors] as any || 'default';
  };

  const handleSaveField = () => {
    if (!fieldFormData.name || !fieldFormData.cropType || !fieldFormData.plantingDate) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    if (editingField) {
      setCropFields(cropFields.map(f => 
        f.id === editingField.id 
          ? { ...f, ...fieldFormData, status: fieldFormData.growthStage === 'harvested' ? 'harvested' : 'active' } as CropField 
          : f
      ));
      setSnackbar({ open: true, message: 'Field updated successfully!', severity: 'success' });
    } else {
      const newField: CropField = {
        ...fieldFormData as CropField,
        id: `f-${Date.now()}`,
        status: 'active',
      };
      setCropFields([...cropFields, newField]);
      setSnackbar({ open: true, message: 'Field added successfully!', severity: 'success' });
    }

    setFieldDialogOpen(false);
    setEditingField(null);
  };

  const handleSaveFertilizer = () => {
    if (!fertilizerFormData.fieldId || !fertilizerFormData.fertilizerType || !fertilizerFormData.applicationDate) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    const field = cropFields.find(f => f.id === fertilizerFormData.fieldId);
    if (!field) return;

    const totalAmount = (fertilizerFormData.amountPerArea || 0) * field.area;

    const newApplication: FertilizerApplication = {
      id: `fa-${Date.now()}`,
      ...fertilizerFormData,
      fieldName: field.name,
      totalAmount,
    } as FertilizerApplication;

    setFertilizerApplications([...fertilizerApplications, newApplication]);
    setFertilizerDialogOpen(false);
    setSnackbar({ open: true, message: 'Fertilizer application recorded!', severity: 'success' });
  };

  const handleSavePesticide = () => {
    if (!pesticideFormData.fieldId || !pesticideFormData.pesticideType || !pesticideFormData.applicationDate) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    const field = cropFields.find(f => f.id === pesticideFormData.fieldId);
    if (!field) return;

    const newApplication: PesticideApplication = {
      id: `pa-${Date.now()}`,
      ...pesticideFormData,
      fieldName: field.name,
    } as PesticideApplication;

    setPesticideApplications([...pesticideApplications, newApplication]);
    setPesticideDialogOpen(false);
    setSnackbar({ open: true, message: 'Pesticide application recorded!', severity: 'success' });
  };

  const handleSaveTask = () => {
    if (!taskFormData.fieldId || !taskFormData.taskName || !taskFormData.scheduledDate || !taskFormData.dueDate) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    const field = cropFields.find(f => f.id === taskFormData.fieldId);
    if (!field) return;

    if (editingTask) {
      setCropTasks(cropTasks.map(t => t.id === editingTask.id ? { ...t, ...taskFormData, fieldName: field.name } as CropTask : t));
      setSnackbar({ open: true, message: 'Task updated successfully!', severity: 'success' });
    } else {
      const newTask: CropTask = {
        id: `ct-${Date.now()}`,
        ...taskFormData,
        fieldName: field.name,
      } as CropTask;
      setCropTasks([...cropTasks, newTask]);
      setSnackbar({ open: true, message: 'Task scheduled successfully!', severity: 'success' });
    }

    setTaskDialogOpen(false);
    setEditingTask(null);
  };

  const openTaskDialog = (task?: CropTask) => {
    if (task) {
      setEditingTask(task);
      setTaskFormData(task);
    } else {
      setEditingTask(null);
      setTaskFormData({
        fieldId: '',
        taskType: 'watering',
        taskName: '',
        description: '',
        scheduledDate: '',
        dueDate: '',
        status: 'pending',
        priority: 'medium',
        assignedTo: '',
        estimatedDuration: 2,
        notes: '',
      });
    }
    setTaskDialogOpen(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setCropTasks(cropTasks.filter(t => t.id !== taskId));
    setSnackbar({ open: true, message: 'Task deleted!', severity: 'info' });
  };

  const handleUpdateTaskStatus = (taskId: string, status: CropTask['status']) => {
    setCropTasks(cropTasks.map(t => 
      t.id === taskId 
        ? { ...t, status, completedDate: status === 'completed' ? new Date().toISOString().split('T')[0] : undefined }
        : t
    ));
    setSnackbar({ open: true, message: `Task marked as ${status}!`, severity: 'success' });
  };

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'overdue': return 'error';
      case 'pending': return 'default';
      default: return 'default';
    }
  };

  const openFieldDialog = (field?: CropField) => {
    if (field) {
      setEditingField(field);
      setFieldFormData(field);
    } else {
      setEditingField(null);
      setFieldFormData({
        name: '',
        cropType: '',
        variety: '',
        area: 0,
        unit: 'acres',
        plantingDate: '',
        expectedHarvestDate: '',
        growthStage: 'planted',
        expectedYield: 0,
        yieldUnit: 'kg',
        notes: '',
      });
    }
    setFieldDialogOpen(true);
  };

  const openFertilizerDialog = () => {
    setFertilizerFormData({
      fieldId: '',
      fertilizerType: '',
      amountPerArea: 0,
      unit: 'kg',
      applicationDate: new Date().toISOString().split('T')[0],
      applicationMethod: '',
      cost: 0,
      appliedBy: '',
      notes: '',
    });
    setFertilizerDialogOpen(true);
  };

  const openPesticideDialog = () => {
    setPesticideFormData({
      fieldId: '',
      pesticideType: '',
      targetPest: '',
      amount: 0,
      unit: 'ml',
      applicationDate: new Date().toISOString().split('T')[0],
      applicationMethod: '',
      cost: 0,
      appliedBy: '',
      notes: '',
    });
    setPesticideDialogOpen(true);
  };

  const totalArea = cropFields.reduce((sum, f) => sum + f.area, 0);
  const activeFields = cropFields.filter(f => f.status === 'active').length;
  const harvestedFields = cropFields.filter(f => f.status === 'harvested').length;
  const totalFertilizerCost = fertilizerApplications.reduce((sum, f) => sum + f.cost, 0);
  const totalPesticideCost = pesticideApplications.reduce((sum, p) => sum + p.cost, 0);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Crop Planning & Management</Typography>
          <Typography variant="body2" color="text.secondary">Plan crop rotations, manage field assignments, and optimize planting schedules</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Add />} onClick={openFertilizerDialog}>
            Record Fertilizer
          </Button>
          <Button variant="outlined" startIcon={<Add />} onClick={openPesticideDialog}>
            Record Pesticide
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => openFieldDialog()}>
            Add Crop Field
          </Button>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Total Area</Typography>
                  <Typography variant="h5">{totalArea} acres</Typography>
                </Box>
                <Grass sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Active Fields</Typography>
                  <Typography variant="h5">{activeFields}</Typography>
                </Box>
                <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Fertilizer Cost</Typography>
                  <Typography variant="h5">${totalFertilizerCost.toLocaleString()}</Typography>
                </Box>
                <WaterDrop sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Pesticide Cost</Typography>
                  <Typography variant="h5">${totalPesticideCost.toLocaleString()}</Typography>
                </Box>
                <BugReport sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Crop Fields" icon={<Grass />} iconPosition="start" />
          <Tab label="Task Schedules" icon={<Schedule />} iconPosition="start" />
          <Tab label="Fertilizer Applications" icon={<WaterDrop />} iconPosition="start" />
          <Tab label="Pesticide Applications" icon={<BugReport />} iconPosition="start" />
        </Tabs>

        <CardContent>
          {/* Crop Fields Tab */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Field Name</TableCell>
                    <TableCell>Crop</TableCell>
                    <TableCell>Area</TableCell>
                    <TableCell>Planting Date</TableCell>
                    <TableCell>Expected Harvest</TableCell>
                    <TableCell>Growth Stage</TableCell>
                    <TableCell>Expected Yield</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cropFields.map((field) => {
                    const daysToHarvest = Math.floor(
                      (new Date(field.expectedHarvestDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <TableRow key={field.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2">{field.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {field.variety}
                          </Typography>
                        </TableCell>
                        <TableCell>{field.cropType}</TableCell>
                        <TableCell>
                          {field.area} {field.unit}
                        </TableCell>
                        <TableCell>{new Date(field.plantingDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {new Date(field.expectedHarvestDate).toLocaleDateString()}
                          {field.status === 'active' && daysToHarvest > 0 && (
                            <Typography variant="caption" display="block" color="info.main">
                              {daysToHarvest} days to go
                            </Typography>
                          )}
                          {field.actualHarvestDate && (
                            <Typography variant="caption" display="block" color="success.main">
                              Harvested: {new Date(field.actualHarvestDate).toLocaleDateString()}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={field.growthStage}
                            size="small"
                            color={getGrowthStageColor(field.growthStage)}
                          />
                          <LinearProgress
                            variant="determinate"
                            value={getGrowthStageProgress(field.growthStage)}
                            sx={{ mt: 1 }}
                          />
                        </TableCell>
                        <TableCell>
                          {field.expectedYield} {field.yieldUnit}
                          {field.actualYield && (
                            <Typography variant="caption" display="block" color="success.main">
                              Actual: {field.actualYield} {field.yieldUnit}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={field.status}
                            size="small"
                            color={field.status === 'active' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => openFieldDialog(field)}>
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              if (window.confirm('Delete this crop field?')) {
                                setCropFields(cropFields.filter(f => f.id !== field.id));
                                setSnackbar({ open: true, message: 'Field deleted', severity: 'success' });
                              }
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Task Schedules Tab */}
          <TabPanel value={tabValue} index={1}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Task Name</TableCell>
                    <TableCell>Field</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Scheduled Date</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cropTasks.map((task) => (
                    <TableRow key={task.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{task.taskName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {task.description}
                        </Typography>
                      </TableCell>
                      <TableCell>{task.fieldName}</TableCell>
                      <TableCell>
                        <Chip label={task.taskType} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{new Date(task.scheduledDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(task.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={task.priority.toUpperCase()} 
                          size="small" 
                          color={getTaskPriorityColor(task.priority) as any}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={task.status} 
                          size="small" 
                          color={getTaskStatusColor(task.status) as any}
                          onClick={() => {
                            const statuses: CropTask['status'][] = ['pending', 'in-progress', 'completed'];
                            const currentIndex = statuses.indexOf(task.status);
                            const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                            handleUpdateTaskStatus(task.id, nextStatus);
                          }}
                          sx={{ cursor: 'pointer' }}
                        />
                      </TableCell>
                      <TableCell>{task.assignedTo}</TableCell>
                      <TableCell>{task.estimatedDuration}h</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => openTaskDialog(task)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Fertilizer Applications Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ mb: 2 }}>
              <Alert severity="info">
                Total Fertilizer Cost: <strong>${totalFertilizerCost.toLocaleString()}</strong>
              </Alert>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Field</TableCell>
                    <TableCell>Fertilizer Type</TableCell>
                    <TableCell>Amount/Area</TableCell>
                    <TableCell>Total Amount</TableCell>
                    <TableCell>Application Date</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Cost</TableCell>
                    <TableCell>Applied By</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fertilizerApplications.map((app) => (
                    <TableRow key={app.id} hover>
                      <TableCell>{app.fieldName}</TableCell>
                      <TableCell>{app.fertilizerType}</TableCell>
                      <TableCell>
                        {app.amountPerArea} {app.unit}/acre
                      </TableCell>
                      <TableCell>
                        {app.totalAmount} {app.unit}
                      </TableCell>
                      <TableCell>{new Date(app.applicationDate).toLocaleDateString()}</TableCell>
                      <TableCell>{app.applicationMethod}</TableCell>
                      <TableCell>${app.cost.toLocaleString()}</TableCell>
                      <TableCell>{app.appliedBy}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            if (window.confirm('Delete this fertilizer application?')) {
                              setFertilizerApplications(fertilizerApplications.filter(f => f.id !== app.id));
                              setSnackbar({ open: true, message: 'Application deleted', severity: 'success' });
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Pesticide Applications Tab */}
          <TabPanel value={tabValue} index={3}>
            <Box sx={{ mb: 2 }}>
              <Alert severity="info">
                Total Pesticide Cost: <strong>${totalPesticideCost.toLocaleString()}</strong>
              </Alert>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Field</TableCell>
                    <TableCell>Pesticide Type</TableCell>
                    <TableCell>Target Pest</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Application Date</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Cost</TableCell>
                    <TableCell>Applied By</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pesticideApplications.map((app) => (
                    <TableRow key={app.id} hover>
                      <TableCell>{app.fieldName}</TableCell>
                      <TableCell>{app.pesticideType}</TableCell>
                      <TableCell>{app.targetPest}</TableCell>
                      <TableCell>
                        {app.amount} {app.unit}
                      </TableCell>
                      <TableCell>{new Date(app.applicationDate).toLocaleDateString()}</TableCell>
                      <TableCell>{app.applicationMethod}</TableCell>
                      <TableCell>${app.cost.toLocaleString()}</TableCell>
                      <TableCell>{app.appliedBy}</TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            if (window.confirm('Delete this pesticide application?')) {
                              setPesticideApplications(pesticideApplications.filter(p => p.id !== app.id));
                              setSnackbar({ open: true, message: 'Application deleted', severity: 'success' });
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Crop Field Dialog */}
      <Dialog open={fieldDialogOpen} onClose={() => setFieldDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingField ? 'Edit Crop Field' : 'Add Crop Field'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Field Name"
                value={fieldFormData.name}
                onChange={(e) => setFieldFormData({ ...fieldFormData, name: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Crop Type"
                value={fieldFormData.cropType}
                onChange={(e) => setFieldFormData({ ...fieldFormData, cropType: e.target.value })}
                fullWidth
                required
                placeholder="e.g., Maize, Wheat, Tomatoes"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Variety"
                value={fieldFormData.variety}
                onChange={(e) => setFieldFormData({ ...fieldFormData, variety: e.target.value })}
                fullWidth
                placeholder="e.g., Hybrid DK-8031"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Area"
                type="number"
                value={fieldFormData.area}
                onChange={(e) => setFieldFormData({ ...fieldFormData, area: parseFloat(e.target.value) })}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={fieldFormData.unit}
                  label="Unit"
                  onChange={(e) => setFieldFormData({ ...fieldFormData, unit: e.target.value as any })}
                >
                  <MenuItem value="acres">Acres</MenuItem>
                  <MenuItem value="hectares">Hectares</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Planting Date"
                type="date"
                value={fieldFormData.plantingDate}
                onChange={(e) => setFieldFormData({ ...fieldFormData, plantingDate: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Expected Harvest Date"
                type="date"
                value={fieldFormData.expectedHarvestDate}
                onChange={(e) => setFieldFormData({ ...fieldFormData, expectedHarvestDate: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Growth Stage</InputLabel>
                <Select
                  value={fieldFormData.growthStage}
                  label="Growth Stage"
                  onChange={(e) => setFieldFormData({ ...fieldFormData, growthStage: e.target.value as any })}
                >
                  <MenuItem value="planted">Planted</MenuItem>
                  <MenuItem value="germination">Germination</MenuItem>
                  <MenuItem value="vegetative">Vegetative</MenuItem>
                  <MenuItem value="flowering">Flowering</MenuItem>
                  <MenuItem value="maturity">Maturity</MenuItem>
                  <MenuItem value="harvested">Harvested</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Expected Yield"
                type="number"
                value={fieldFormData.expectedYield}
                onChange={(e) => setFieldFormData({ ...fieldFormData, expectedYield: parseFloat(e.target.value) })}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Yield Unit"
                value={fieldFormData.yieldUnit}
                onChange={(e) => setFieldFormData({ ...fieldFormData, yieldUnit: e.target.value })}
                fullWidth
                placeholder="kg, tons"
              />
            </Grid>
            {fieldFormData.growthStage === 'harvested' && (
              <>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Actual Harvest Date"
                    type="date"
                    value={fieldFormData.actualHarvestDate || ''}
                    onChange={(e) => setFieldFormData({ ...fieldFormData, actualHarvestDate: e.target.value })}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    label="Actual Yield"
                    type="number"
                    value={fieldFormData.actualYield || ''}
                    onChange={(e) => setFieldFormData({ ...fieldFormData, actualYield: parseFloat(e.target.value) })}
                    fullWidth
                  />
                </Grid>
              </>
            )}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
                value={fieldFormData.notes}
                onChange={(e) => setFieldFormData({ ...fieldFormData, notes: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFieldDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveField}>
            {editingField ? 'Update' : 'Add'} Field
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fertilizer Application Dialog */}
      <Dialog open={fertilizerDialogOpen} onClose={() => setFertilizerDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Fertilizer Application</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Select Field</InputLabel>
                <Select
                  value={fertilizerFormData.fieldId}
                  label="Select Field"
                  onChange={(e) => setFertilizerFormData({ ...fertilizerFormData, fieldId: e.target.value })}
                >
                  {cropFields.filter(f => f.status === 'active').map((field) => (
                    <MenuItem key={field.id} value={field.id}>
                      {field.name} - {field.cropType} ({field.area} {field.unit})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Fertilizer Type"
                value={fertilizerFormData.fertilizerType}
                onChange={(e) => setFertilizerFormData({ ...fertilizerFormData, fertilizerType: e.target.value })}
                fullWidth
                required
                placeholder="e.g., NPK 17:17:17, Urea"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Application Date"
                type="date"
                value={fertilizerFormData.applicationDate}
                onChange={(e) => setFertilizerFormData({ ...fertilizerFormData, applicationDate: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Amount per Area"
                type="number"
                value={fertilizerFormData.amountPerArea}
                onChange={(e) =>
                  setFertilizerFormData({ ...fertilizerFormData, amountPerArea: parseFloat(e.target.value) })
                }
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Unit"
                value={fertilizerFormData.unit}
                onChange={(e) => setFertilizerFormData({ ...fertilizerFormData, unit: e.target.value })}
                fullWidth
                placeholder="kg, liters"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Total Cost ($)"
                type="number"
                value={fertilizerFormData.cost}
                onChange={(e) => setFertilizerFormData({ ...fertilizerFormData, cost: parseFloat(e.target.value) })}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Application Method"
                value={fertilizerFormData.applicationMethod}
                onChange={(e) => setFertilizerFormData({ ...fertilizerFormData, applicationMethod: e.target.value })}
                fullWidth
                placeholder="Broadcasting, Top dressing"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Applied By"
                value={fertilizerFormData.appliedBy}
                onChange={(e) => setFertilizerFormData({ ...fertilizerFormData, appliedBy: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
                value={fertilizerFormData.notes}
                onChange={(e) => setFertilizerFormData({ ...fertilizerFormData, notes: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFertilizerDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveFertilizer}>
            Record Application
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pesticide Application Dialog */}
      <Dialog open={pesticideDialogOpen} onClose={() => setPesticideDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Pesticide Application</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Select Field</InputLabel>
                <Select
                  value={pesticideFormData.fieldId}
                  label="Select Field"
                  onChange={(e) => setPesticideFormData({ ...pesticideFormData, fieldId: e.target.value })}
                >
                  {cropFields.filter(f => f.status === 'active').map((field) => (
                    <MenuItem key={field.id} value={field.id}>
                      {field.name} - {field.cropType} ({field.area} {field.unit})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Pesticide Type"
                value={pesticideFormData.pesticideType}
                onChange={(e) => setPesticideFormData({ ...pesticideFormData, pesticideType: e.target.value })}
                fullWidth
                required
                placeholder="e.g., Duduthrin, Ridomil"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Target Pest/Disease"
                value={pesticideFormData.targetPest}
                onChange={(e) => setPesticideFormData({ ...pesticideFormData, targetPest: e.target.value })}
                fullWidth
                placeholder="e.g., Fall Armyworm, Blight"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Application Date"
                type="date"
                value={pesticideFormData.applicationDate}
                onChange={(e) => setPesticideFormData({ ...pesticideFormData, applicationDate: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Application Method"
                value={pesticideFormData.applicationMethod}
                onChange={(e) => setPesticideFormData({ ...pesticideFormData, applicationMethod: e.target.value })}
                fullWidth
                placeholder="Spraying, Dusting"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Amount"
                type="number"
                value={pesticideFormData.amount}
                onChange={(e) => setPesticideFormData({ ...pesticideFormData, amount: parseFloat(e.target.value) })}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Unit"
                value={pesticideFormData.unit}
                onChange={(e) => setPesticideFormData({ ...pesticideFormData, unit: e.target.value })}
                fullWidth
                placeholder="ml, grams"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Total Cost ($)"
                type="number"
                value={pesticideFormData.cost}
                onChange={(e) => setPesticideFormData({ ...pesticideFormData, cost: parseFloat(e.target.value) })}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Applied By"
                value={pesticideFormData.appliedBy}
                onChange={(e) => setPesticideFormData({ ...pesticideFormData, appliedBy: e.target.value })}
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
                value={pesticideFormData.notes}
                onChange={(e) => setPesticideFormData({ ...pesticideFormData, notes: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPesticideDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePesticide}>
            Record Application
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Task Creation/Edit Dialog */}
      <Dialog 
        open={taskDialogOpen} 
        onClose={() => setTaskDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingTask ? 'Edit Crop Task' : 'Add New Crop Task'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Field</InputLabel>
              <Select
                value={taskFormData.fieldId}
                label="Field"
                onChange={(e) => setTaskFormData({ 
                  ...taskFormData, 
                  fieldId: e.target.value,
                  fieldName: cropFields.find((f: CropField) => f.id === e.target.value)?.name || ''
                })}
              >
                {cropFields.map((field: CropField) => (
                  <MenuItem key={field.id} value={field.id}>
                    {field.name} - {field.cropType}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Task Type</InputLabel>
              <Select
                value={taskFormData.taskType}
                label="Task Type"
                onChange={(e) => setTaskFormData({ ...taskFormData, taskType: e.target.value as CropTask['taskType'] })}
              >
                <MenuItem value="watering">Watering</MenuItem>
                <MenuItem value="weeding">Weeding</MenuItem>
                <MenuItem value="fertilizing">Fertilizing</MenuItem>
                <MenuItem value="pest-control">Pest Control</MenuItem>
                <MenuItem value="pruning">Pruning</MenuItem>
                <MenuItem value="harvesting">Harvesting</MenuItem>
                <MenuItem value="soil-prep">Soil Preparation</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              required
              label="Task Name"
              value={taskFormData.taskName}
              onChange={(e) => setTaskFormData({ ...taskFormData, taskName: e.target.value })}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={taskFormData.description}
              onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Scheduled Date"
                  value={taskFormData.scheduledDate}
                  onChange={(e) => setTaskFormData({ ...taskFormData, scheduledDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Due Date"
                  value={taskFormData.dueDate}
                  onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={taskFormData.priority}
                    label="Priority"
                    onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value as CropTask['priority'] })}
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={taskFormData.status}
                    label="Status"
                    onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value as CropTask['status'] })}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="overdue">Overdue</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <TextField
              fullWidth
              label="Assigned To"
              value={taskFormData.assignedTo}
              onChange={(e) => setTaskFormData({ ...taskFormData, assignedTo: e.target.value })}
              placeholder="Worker name or team"
            />

            <TextField
              fullWidth
              type="number"
              label="Estimated Duration (hours)"
              value={taskFormData.estimatedDuration}
              onChange={(e) => setTaskFormData({ ...taskFormData, estimatedDuration: parseFloat(e.target.value) || 0 })}
              InputProps={{ inputProps: { min: 0, step: 0.5 } }}
            />

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Notes"
              value={taskFormData.notes}
              onChange={(e) => setTaskFormData({ ...taskFormData, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveTask} 
            variant="contained"
            disabled={!taskFormData.fieldId || !taskFormData.taskName || !taskFormData.scheduledDate || !taskFormData.dueDate}
          >
            {editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CropPlanningDashboard;

