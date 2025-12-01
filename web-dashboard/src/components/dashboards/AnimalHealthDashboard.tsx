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
  List,
  ListItem,
  ListItemText,
  Divider,
  Grid,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Pets,
  LocalHospital,
  Favorite,
  CalendarToday,
  Schedule,
  Warning,
  CheckCircle,
  RestaurantMenu,
  Vaccines,
} from '@mui/icons-material';

interface AnimalGroup {
  id: string;
  name: string;
  type: 'cattle' | 'poultry' | 'sheep' | 'pigs' | 'goats';
  category: string; // e.g., 'Dairy Cows', 'Broilers', 'Layers', 'Weaners'
  count: number;
  feedingSchedule: FeedingSchedule;
}

interface FeedingSchedule {
  feedType: string;
  amountPerAnimal: number;
  unit: string;
  frequency: string; // e.g., 'Twice daily', 'Three times daily'
  times: string[]; // e.g., ['07:00', '18:00']
  notes: string;
}

interface BreedingRecord {
  id: string;
  animalId: string;
  animalName: string;
  animalType: string;
  matingDate: string;
  expectedDeliveryDate: string;
  gestationPeriod: number; // in days
  sireId?: string;
  expectedLitterSize?: number;
  actualDeliveryDate?: string;
  actualLitterSize?: number;
  status: 'pending' | 'delivered' | 'overdue';
  notes: string;
}

interface TreatmentSchedule {
  id: string;
  name: string;
  type: 'dosing' | 'dipping' | 'vaccination' | 'other';
  animalGroup: string;
  frequency: string; // e.g., 'Weekly', 'Monthly', 'Quarterly'
  lastTreatmentDate: string;
  nextTreatmentDate: string;
  medicine: string;
  dosage: string;
  status: 'upcoming' | 'due' | 'overdue' | 'completed';
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

const AnimalHealthDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [breedingDialogOpen, setBreedingDialogOpen] = useState(false);
  const [treatmentDialogOpen, setTreatmentDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<AnimalGroup | null>(null);
  const [editingBreeding, setEditingBreeding] = useState<BreedingRecord | null>(null);
  const [editingTreatment, setEditingTreatment] = useState<TreatmentSchedule | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const [animalGroups, setAnimalGroups] = useState<AnimalGroup[]>([
    {
      id: 'g1',
      name: 'Dairy Cows - Main Herd',
      type: 'cattle',
      category: 'Dairy Cows',
      count: 50,
      feedingSchedule: {
        feedType: 'Dairy Meal Concentrate + Silage',
        amountPerAnimal: 8,
        unit: 'kg',
        frequency: 'Twice daily',
        times: ['06:00', '17:00'],
        notes: 'Increase concentrate by 1kg for high-yield cows',
      },
    },
    {
      id: 'g2',
      name: 'Broiler Chickens - Batch A',
      type: 'poultry',
      category: 'Broilers',
      count: 500,
      feedingSchedule: {
        feedType: 'Broiler Starter',
        amountPerAnimal: 0.12,
        unit: 'kg',
        frequency: 'Three times daily',
        times: ['07:00', '13:00', '18:00'],
        notes: 'Switch to grower feed at week 3',
      },
    },
    {
      id: 'g3',
      name: 'Layer Hens',
      type: 'poultry',
      category: 'Layers',
      count: 300,
      feedingSchedule: {
        feedType: 'Layer Mash',
        amountPerAnimal: 0.13,
        unit: 'kg',
        frequency: 'Twice daily',
        times: ['08:00', '16:00'],
        notes: 'Supplement with oyster shells for calcium',
      },
    },
    {
      id: 'g4',
      name: 'Pig Weaners',
      type: 'pigs',
      category: 'Weaners',
      count: 40,
      feedingSchedule: {
        feedType: 'Weaner Pellets',
        amountPerAnimal: 1.5,
        unit: 'kg',
        frequency: 'Twice daily',
        times: ['07:30', '16:30'],
        notes: 'Ensure clean water always available',
      },
    },
    {
      id: 'g5',
      name: 'Breeding Sows',
      type: 'pigs',
      category: 'Breeding Stock',
      count: 15,
      feedingSchedule: {
        feedType: 'Sow & Weaner Mix',
        amountPerAnimal: 3,
        unit: 'kg',
        frequency: 'Twice daily',
        times: ['07:00', '17:00'],
        notes: 'Increase feed 2 weeks before farrowing',
      },
    },
  ]);

  const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>([
    {
      id: 'b1',
      animalId: 'cow-123',
      animalName: 'Bessie',
      animalType: 'Dairy Cow',
      matingDate: '2025-08-15',
      expectedDeliveryDate: '2025-11-23',
      gestationPeriod: 280,
      expectedLitterSize: 1,
      status: 'overdue',
      notes: 'First-time mother, monitor closely',
    },
    {
      id: 'b2',
      animalId: 'sow-045',
      animalName: 'Sow #45',
      animalType: 'Pig',
      matingDate: '2025-09-20',
      expectedDeliveryDate: '2025-12-04',
      gestationPeriod: 114,
      expectedLitterSize: 10,
      status: 'pending',
      notes: 'Healthy sow with good breeding history',
    },
    {
      id: 'b3',
      animalId: 'sow-052',
      animalName: 'Sow #52',
      animalType: 'Pig',
      matingDate: '2025-10-01',
      expectedDeliveryDate: '2025-12-24',
      gestationPeriod: 114,
      expectedLitterSize: 12,
      status: 'pending',
      notes: 'Second litter',
    },
    {
      id: 'b4',
      animalId: 'cow-089',
      animalName: 'Daisy',
      animalType: 'Dairy Cow',
      matingDate: '2025-07-10',
      expectedDeliveryDate: '2025-10-17',
      gestationPeriod: 280,
      actualDeliveryDate: '2025-10-19',
      actualLitterSize: 1,
      status: 'delivered',
      notes: 'Healthy calf, female',
    },
  ]);

  const [treatmentSchedules, setTreatmentSchedules] = useState<TreatmentSchedule[]>([
    {
      id: 't1',
      name: 'Cattle Dipping',
      type: 'dipping',
      animalGroup: 'All Cattle',
      frequency: 'Weekly',
      lastTreatmentDate: '2025-11-06',
      nextTreatmentDate: '2025-11-13',
      medicine: 'Acaricide Dip',
      dosage: '5 liters per 100 animals',
      status: 'due',
      notes: 'Use dipping tank, ensure complete immersion',
    },
    {
      id: 't2',
      name: 'Cattle Deworming',
      type: 'dosing',
      animalGroup: 'All Cattle',
      frequency: 'Quarterly',
      lastTreatmentDate: '2025-09-15',
      nextTreatmentDate: '2025-12-15',
      medicine: 'Ivermectin',
      dosage: '1ml per 50kg body weight',
      status: 'upcoming',
      notes: 'Rotate with different dewormers to prevent resistance',
    },
    {
      id: 't3',
      name: 'Poultry Vaccination - Newcastle',
      type: 'vaccination',
      animalGroup: 'All Poultry',
      frequency: 'Every 3 months',
      lastTreatmentDate: '2025-10-01',
      nextTreatmentDate: '2025-12-01',
      medicine: 'Newcastle Disease Vaccine',
      dosage: 'Eye drop method',
      status: 'upcoming',
      notes: 'Administer via eye drop for best results',
    },
    {
      id: 't4',
      name: 'Pig Vaccination - Swine Fever',
      type: 'vaccination',
      animalGroup: 'All Pigs',
      frequency: 'Annually',
      lastTreatmentDate: '2025-01-15',
      nextTreatmentDate: '2026-01-15',
      medicine: 'Swine Fever Vaccine',
      dosage: '2ml per animal',
      status: 'upcoming',
      notes: 'Mandatory vaccination',
    },
    {
      id: 't5',
      name: 'Broiler Coccidiosis Prevention',
      type: 'dosing',
      animalGroup: 'Broiler Chickens',
      frequency: 'Weekly',
      lastTreatmentDate: '2025-11-10',
      nextTreatmentDate: '2025-11-17',
      medicine: 'Coccidiostat in water',
      dosage: '1ml per liter of water',
      status: 'overdue',
      notes: 'Critical for young broilers',
    },
  ]);

  const [groupFormData, setGroupFormData] = useState<Partial<AnimalGroup>>({
    name: '',
    type: 'cattle',
    category: '',
    count: 0,
    feedingSchedule: {
      feedType: '',
      amountPerAnimal: 0,
      unit: 'kg',
      frequency: '',
      times: [],
      notes: '',
    },
  });

  const [breedingFormData, setBreedingFormData] = useState<Partial<BreedingRecord>>({
    animalId: '',
    animalName: '',
    animalType: '',
    matingDate: '',
    gestationPeriod: 280,
    expectedLitterSize: 1,
    notes: '',
  });

  const [treatmentFormData, setTreatmentFormData] = useState<Partial<TreatmentSchedule>>({
    name: '',
    type: 'dosing',
    animalGroup: '',
    frequency: '',
    nextTreatmentDate: '',
    medicine: '',
    dosage: '',
    notes: '',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const calculateExpectedDelivery = (matingDate: string, gestationPeriod: number): string => {
    const date = new Date(matingDate);
    date.setDate(date.getDate() + gestationPeriod);
    return date.toISOString().split('T')[0];
  };

  const getBreedingStatus = (expectedDate: string, actualDate?: string): 'pending' | 'delivered' | 'overdue' => {
    if (actualDate) return 'delivered';
    const today = new Date();
    const expected = new Date(expectedDate);
    return today > expected ? 'overdue' : 'pending';
  };

  const getTreatmentStatus = (nextDate: string, lastDate: string): 'upcoming' | 'due' | 'overdue' | 'completed' => {
    const today = new Date();
    const next = new Date(nextDate);
    const daysDiff = Math.floor((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'overdue';
    if (daysDiff === 0) return 'due';
    if (daysDiff <= 7) return 'upcoming';
    return 'upcoming';
  };

  const handleSaveGroup = () => {
    if (!groupFormData.name || !groupFormData.count || !groupFormData.feedingSchedule?.feedType) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }
    const newGroup: AnimalGroup = {
      ...groupFormData as AnimalGroup,
      id: `g-${Date.now()}`,
    };
    setAnimalGroups([...animalGroups, newGroup]);
    setSnackbar({ open: true, message: 'Animal group added successfully!', severity: 'success' });
    setGroupDialogOpen(false);
    setEditingGroup(null);
  };

  const handleSaveBreeding = () => {
    if (!breedingFormData.animalName || !breedingFormData.matingDate || !breedingFormData.gestationPeriod) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    const expectedDeliveryDate = calculateExpectedDelivery(
      breedingFormData.matingDate!,
      breedingFormData.gestationPeriod!
    );
    const status = getBreedingStatus(expectedDeliveryDate, breedingFormData.actualDeliveryDate);

    if (editingBreeding) {
      setBreedingRecords(breedingRecords.map(b =>
        b.id === editingBreeding.id
          ? { ...b, ...breedingFormData, expectedDeliveryDate, status } as BreedingRecord
          : b
      ));
      setSnackbar({ open: true, message: 'Breeding record updated successfully!', severity: 'success' });
    } else {
      const newRecord: BreedingRecord = {
        id: `b-${Date.now()}`,
        ...breedingFormData,
        expectedDeliveryDate,
        status,
      } as BreedingRecord;
      setBreedingRecords([...breedingRecords, newRecord]);
      setSnackbar({ open: true, message: 'Breeding record added successfully!', severity: 'success' });
    }

    setBreedingDialogOpen(false);
    setEditingBreeding(null);
  };

  const handleSaveTreatment = () => {
    if (!treatmentFormData.name || !treatmentFormData.medicine || !treatmentFormData.nextTreatmentDate) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const status = getTreatmentStatus(treatmentFormData.nextTreatmentDate!, today);

    if (editingTreatment) {
      setTreatmentSchedules(treatmentSchedules.map(t =>
        t.id === editingTreatment.id
          ? { ...t, ...treatmentFormData, status } as TreatmentSchedule
          : t
      ));
      setSnackbar({ open: true, message: 'Treatment schedule updated successfully!', severity: 'success' });
    } else {
      const newSchedule: TreatmentSchedule = {
        id: `t-${Date.now()}`,
        ...treatmentFormData,
        lastTreatmentDate: today,
        status,
      } as TreatmentSchedule;
      setTreatmentSchedules([...treatmentSchedules, newSchedule]);
      setSnackbar({ open: true, message: 'Treatment schedule added successfully!', severity: 'success' });
    }

    setTreatmentDialogOpen(false);
    setEditingTreatment(null);
  };

  const openGroupDialog = (group?: AnimalGroup) => {
    if (group) {
      setEditingGroup(group);
      setGroupFormData(group);
    } else {
      setEditingGroup(null);
      setGroupFormData({
        name: '',
        type: 'cattle',
        category: '',
        count: 0,
        feedingSchedule: {
          feedType: '',
          amountPerAnimal: 0,
          unit: 'kg',
          frequency: '',
          times: [],
          notes: '',
        },
      });
    }
    setGroupDialogOpen(true);
  };

  const openBreedingDialog = (record?: BreedingRecord) => {
    if (record) {
      setEditingBreeding(record);
      setBreedingFormData(record);
    } else {
      setEditingBreeding(null);
      setBreedingFormData({
        animalId: '',
        animalName: '',
        animalType: '',
        matingDate: '',
        gestationPeriod: 280,
        expectedLitterSize: 1,
        notes: '',
      });
    }
    setBreedingDialogOpen(true);
  };

  const openTreatmentDialog = (schedule?: TreatmentSchedule) => {
    if (schedule) {
      setEditingTreatment(schedule);
      setTreatmentFormData(schedule);
    } else {
      setEditingTreatment(null);
      setTreatmentFormData({
        name: '',
        type: 'dosing',
        animalGroup: '',
        frequency: '',
        nextTreatmentDate: '',
        medicine: '',
        dosage: '',
        notes: '',
      });
    }
    setTreatmentDialogOpen(true);
  };

  const totalAnimals = animalGroups.reduce((sum, g) => sum + g.count, 0);
  const pendingDeliveries = breedingRecords.filter(b => b.status === 'pending').length;
  const overdueDeliveries = breedingRecords.filter(b => b.status === 'overdue').length;
  const upcomingTreatments = treatmentSchedules.filter(t => t.status === 'due' || t.status === 'overdue').length;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>Animal Health & Breeding</Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
            Track animal health, treatments, and breeding records.
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Total Animals</Typography>
                  <Typography variant="h5">{totalAnimals}</Typography>
                </Box>
                <Pets sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Pending Deliveries</Typography>
                  <Typography variant="h5">{pendingDeliveries}</Typography>
                </Box>
                <Favorite sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Overdue Deliveries</Typography>
                  <Typography variant="h5" color="error.main">{overdueDeliveries}</Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Treatments Due</Typography>
                  <Typography variant="h5" color="warning.main">{upcomingTreatments}</Typography>
                </Box>
                <LocalHospital sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      {(overdueDeliveries > 0 || upcomingTreatments > 0) && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>Attention Required:</strong> {overdueDeliveries > 0 && `${overdueDeliveries} deliveries are overdue. `}
          {upcomingTreatments > 0 && `${upcomingTreatments} treatments are due or overdue.`}
        </Alert>
      )}

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Feeding Schedules" icon={<RestaurantMenu />} iconPosition="start" />
          <Tab label="Breeding Records" icon={<Favorite />} iconPosition="start" />
          <Tab label="Treatment Schedules" icon={<Vaccines />} iconPosition="start" />
        </Tabs>

        <CardContent>
          {/* Feeding Schedules Tab */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Group Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Count</TableCell>
                    <TableCell>Feed Type</TableCell>
                    <TableCell>Amount per Animal</TableCell>
                    <TableCell>Frequency</TableCell>
                    <TableCell>Feeding Times</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {animalGroups.map((group) => (
                    <TableRow key={group.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{group.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {group.category}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={group.type} size="small" />
                      </TableCell>
                      <TableCell>{group.count} animals</TableCell>
                      <TableCell>{group.feedingSchedule.feedType}</TableCell>
                      <TableCell>
                        {group.feedingSchedule.amountPerAnimal} {group.feedingSchedule.unit}
                      </TableCell>
                      <TableCell>{group.feedingSchedule.frequency}</TableCell>
                      <TableCell>
                        {group.feedingSchedule.times.join(', ')}
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => openGroupDialog(group)}>
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            if (window.confirm('Delete this animal group?')) {
                              setAnimalGroups(animalGroups.filter(g => g.id !== group.id));
                              setSnackbar({ open: true, message: 'Group deleted', severity: 'success' });
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

          {/* Breeding Records Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => openBreedingDialog()}>
                Add Breeding Record
              </Button>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Animal</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Mating Date</TableCell>
                    <TableCell>Expected Delivery</TableCell>
                    <TableCell>Days to Go</TableCell>
                    <TableCell>Expected Litter</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {breedingRecords.map((record) => {
                    const daysToGo = Math.floor(
                      (new Date(record.expectedDeliveryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <TableRow key={record.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2">{record.animalName}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {record.animalId}
                          </Typography>
                        </TableCell>
                        <TableCell>{record.animalType}</TableCell>
                        <TableCell>{new Date(record.matingDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {new Date(record.expectedDeliveryDate).toLocaleDateString()}
                          {record.actualDeliveryDate && (
                            <Typography variant="caption" display="block" color="success.main">
                              Delivered: {new Date(record.actualDeliveryDate).toLocaleDateString()}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.status === 'delivered' ? (
                            <Chip label="Completed" size="small" color="success" />
                          ) : daysToGo < 0 ? (
                            <Chip label={`${Math.abs(daysToGo)} days overdue`} size="small" color="error" />
                          ) : (
                            <Chip label={`${daysToGo} days`} size="small" color="info" />
                          )}
                        </TableCell>
                        <TableCell>
                          {record.expectedLitterSize}
                          {record.actualLitterSize && ` (Actual: ${record.actualLitterSize})`}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={record.status}
                            size="small"
                            color={
                              record.status === 'delivered' ? 'success' :
                              record.status === 'overdue' ? 'error' : 'info'
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => openBreedingDialog(record)}>
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              if (window.confirm('Delete this breeding record?')) {
                                setBreedingRecords(breedingRecords.filter(b => b.id !== record.id));
                                setSnackbar({ open: true, message: 'Record deleted', severity: 'success' });
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

          {/* Treatment Schedules Tab */}
          <TabPanel value={tabValue} index={2}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" startIcon={<Add />} onClick={() => openTreatmentDialog()}>
                Add Treatment Schedule
              </Button>
            </Box>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Treatment Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Animal Group</TableCell>
                    <TableCell>Medicine</TableCell>
                    <TableCell>Frequency</TableCell>
                    <TableCell>Last Treatment</TableCell>
                    <TableCell>Next Treatment</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {treatmentSchedules.map((schedule) => (
                    <TableRow key={schedule.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{schedule.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Dosage: {schedule.dosage}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={schedule.type} size="small" />
                      </TableCell>
                      <TableCell>{schedule.animalGroup}</TableCell>
                      <TableCell>{schedule.medicine}</TableCell>
                      <TableCell>{schedule.frequency}</TableCell>
                      <TableCell>{new Date(schedule.lastTreatmentDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(schedule.nextTreatmentDate).toLocaleDateString()}
                        </Typography>
                        {schedule.status === 'overdue' && (
                          <Typography variant="caption" color="error">
                            Overdue!
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={schedule.status}
                          size="small"
                          color={
                            schedule.status === 'completed' ? 'success' :
                            schedule.status === 'overdue' ? 'error' :
                            schedule.status === 'due' ? 'warning' : 'info'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => openTreatmentDialog(schedule)}>
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            if (window.confirm('Delete this treatment schedule?')) {
                              setTreatmentSchedules(treatmentSchedules.filter(t => t.id !== schedule.id));
                              setSnackbar({ open: true, message: 'Schedule deleted', severity: 'success' });
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

      {/* Animal Group Dialog */}
      <Dialog open={groupDialogOpen} onClose={() => setGroupDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingGroup ? 'Edit Animal Group' : 'Add Animal Group'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Group Name"
                value={groupFormData.name}
                onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Animal Type</InputLabel>
                <Select
                  value={groupFormData.type}
                  label="Animal Type"
                  onChange={(e) => setGroupFormData({ ...groupFormData, type: e.target.value as any })}
                >
                  <MenuItem value="cattle">Cattle</MenuItem>
                  <MenuItem value="poultry">Poultry</MenuItem>
                  <MenuItem value="sheep">Sheep</MenuItem>
                  <MenuItem value="pigs">Pigs</MenuItem>
                  <MenuItem value="goats">Goats</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Category"
                value={groupFormData.category}
                onChange={(e) => setGroupFormData({ ...groupFormData, category: e.target.value })}
                fullWidth
                placeholder="e.g., Dairy Cows, Broilers, Layers"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Number of Animals"
                type="number"
                value={groupFormData.count}
                onChange={(e) => setGroupFormData({ ...groupFormData, count: parseInt(e.target.value) })}
                fullWidth
                required
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }}>Feeding Schedule</Divider>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Feed Type"
                value={groupFormData.feedingSchedule?.feedType}
                onChange={(e) =>
                  setGroupFormData({
                    ...groupFormData,
                    feedingSchedule: { ...groupFormData.feedingSchedule!, feedType: e.target.value },
                  })
                }
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Amount per Animal"
                type="number"
                value={groupFormData.feedingSchedule?.amountPerAnimal}
                onChange={(e) =>
                  setGroupFormData({
                    ...groupFormData,
                    feedingSchedule: { ...groupFormData.feedingSchedule!, amountPerAnimal: parseFloat(e.target.value) },
                  })
                }
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Unit"
                value={groupFormData.feedingSchedule?.unit}
                onChange={(e) =>
                  setGroupFormData({
                    ...groupFormData,
                    feedingSchedule: { ...groupFormData.feedingSchedule!, unit: e.target.value },
                  })
                }
                fullWidth
                placeholder="kg, liters"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Frequency"
                value={groupFormData.feedingSchedule?.frequency}
                onChange={(e) =>
                  setGroupFormData({
                    ...groupFormData,
                    feedingSchedule: { ...groupFormData.feedingSchedule!, frequency: e.target.value },
                  })
                }
                fullWidth
                placeholder="Twice daily, Three times daily"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Feeding Times (comma-separated)"
                value={groupFormData.feedingSchedule?.times?.join(', ')}
                onChange={(e) =>
                  setGroupFormData({
                    ...groupFormData,
                    feedingSchedule: {
                      ...groupFormData.feedingSchedule!,
                      times: e.target.value.split(',').map(t => t.trim()),
                    },
                  })
                }
                fullWidth
                placeholder="07:00, 18:00"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
                value={groupFormData.feedingSchedule?.notes}
                onChange={(e) =>
                  setGroupFormData({
                    ...groupFormData,
                    feedingSchedule: { ...groupFormData.feedingSchedule!, notes: e.target.value },
                  })
                }
                fullWidth
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGroupDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveGroup}>
            {editingGroup ? 'Update' : 'Add'} Group
          </Button>
        </DialogActions>
      </Dialog>

      {/* Breeding Record Dialog */}
      <Dialog open={breedingDialogOpen} onClose={() => setBreedingDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBreeding ? 'Edit Breeding Record' : 'Add Breeding Record'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Animal Name"
                value={breedingFormData.animalName}
                onChange={(e) => setBreedingFormData({ ...breedingFormData, animalName: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Animal ID"
                value={breedingFormData.animalId}
                onChange={(e) => setBreedingFormData({ ...breedingFormData, animalId: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Animal Type"
                value={breedingFormData.animalType}
                onChange={(e) => setBreedingFormData({ ...breedingFormData, animalType: e.target.value })}
                fullWidth
                placeholder="e.g., Dairy Cow, Pig, Sheep"
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Mating Date"
                type="date"
                value={breedingFormData.matingDate}
                onChange={(e) => setBreedingFormData({ ...breedingFormData, matingDate: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Gestation Period (days)"
                type="number"
                value={breedingFormData.gestationPeriod}
                onChange={(e) => setBreedingFormData({ ...breedingFormData, gestationPeriod: parseInt(e.target.value) })}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Expected Litter Size"
                type="number"
                value={breedingFormData.expectedLitterSize}
                onChange={(e) =>
                  setBreedingFormData({ ...breedingFormData, expectedLitterSize: parseInt(e.target.value) })
                }
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Actual Delivery Date"
                type="date"
                value={breedingFormData.actualDeliveryDate || ''}
                onChange={(e) => setBreedingFormData({ ...breedingFormData, actualDeliveryDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            {breedingFormData.actualDeliveryDate && (
              <Grid size={{ xs: 12 }}>
                <TextField
                  label="Actual Litter Size"
                  type="number"
                  value={breedingFormData.actualLitterSize || ''}
                  onChange={(e) =>
                    setBreedingFormData({ ...breedingFormData, actualLitterSize: parseInt(e.target.value) })
                  }
                  fullWidth
                />
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
                value={breedingFormData.notes}
                onChange={(e) => setBreedingFormData({ ...breedingFormData, notes: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBreedingDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveBreeding}>
            {editingBreeding ? 'Update' : 'Add'} Record
          </Button>
        </DialogActions>
      </Dialog>

      {/* Treatment Schedule Dialog */}
      <Dialog open={treatmentDialogOpen} onClose={() => setTreatmentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTreatment ? 'Edit Treatment Schedule' : 'Add Treatment Schedule'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Treatment Name"
                value={treatmentFormData.name}
                onChange={(e) => setTreatmentFormData({ ...treatmentFormData, name: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Treatment Type</InputLabel>
                <Select
                  value={treatmentFormData.type}
                  label="Treatment Type"
                  onChange={(e) => setTreatmentFormData({ ...treatmentFormData, type: e.target.value as any })}
                >
                  <MenuItem value="dosing">Dosing (Deworming)</MenuItem>
                  <MenuItem value="dipping">Dipping (External Parasites)</MenuItem>
                  <MenuItem value="vaccination">Vaccination</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Animal Group"
                value={treatmentFormData.animalGroup}
                onChange={(e) => setTreatmentFormData({ ...treatmentFormData, animalGroup: e.target.value })}
                fullWidth
                required
                placeholder="e.g., All Cattle, Broilers"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Medicine / Chemical"
                value={treatmentFormData.medicine}
                onChange={(e) => setTreatmentFormData({ ...treatmentFormData, medicine: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Dosage"
                value={treatmentFormData.dosage}
                onChange={(e) => setTreatmentFormData({ ...treatmentFormData, dosage: e.target.value })}
                fullWidth
                placeholder="e.g., 1ml per 50kg"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Frequency"
                value={treatmentFormData.frequency}
                onChange={(e) => setTreatmentFormData({ ...treatmentFormData, frequency: e.target.value })}
                fullWidth
                placeholder="e.g., Weekly, Monthly"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Next Treatment Date"
                type="date"
                value={treatmentFormData.nextTreatmentDate}
                onChange={(e) => setTreatmentFormData({ ...treatmentFormData, nextTreatmentDate: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
                value={treatmentFormData.notes}
                onChange={(e) => setTreatmentFormData({ ...treatmentFormData, notes: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTreatmentDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTreatment}>
            {editingTreatment ? 'Update' : 'Add'} Schedule
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
    </Box>
  );
};

export default AnimalHealthDashboard;

