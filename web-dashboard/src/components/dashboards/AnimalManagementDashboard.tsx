import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Alert,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Pets,
  MonitorWeight,
  VaccinesOutlined,
  LocalHospital,
  FavoriteBorder,
  Restaurant,
  TrendingUp,
  Warning,
  CheckCircle,
  Schedule,
  PregnantWoman,
} from '@mui/icons-material';


interface AnimalProfile {
  id: string;
  species: 'Cattle' | 'Pig' | 'Goat' | 'Sheep' | 'Chicken';
  breed: string;
  tagNumber: string;
  name?: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  weight: number;
  healthStatus: 'Healthy' | 'Sick' | 'Under Treatment' | 'Quarantine';
  location: string;
  motherId?: string;
  fatherId?: string;
  acquisitionDate: string;
  acquisitionType: 'Born on Farm' | 'Purchased' | 'Donated';
  purchasePrice?: number;
  currentValue: number;
  photo?: string;
}

interface HealthRecord {
  id: string;
  animalId: string;
  date: string;
  type: 'Vaccination' | 'Deworming' | 'Treatment' | 'Check-up' | 'Injury';
  description: string;
  medicine?: string;
  dosage?: string;
  cost: number;
  veterinarian: string;
  nextDueDate?: string;
  notes?: string;
}

interface WeightRecord {
  id: string;
  animalId: string;
  date: string;
  weight: number;
  bodyCondition: 1 | 2 | 3 | 4 | 5;
  notes?: string;
}

interface FeedRecord {
  id: string;
  animalId: string;
  date: string;
  feedType: string;
  quantity: number;
  unit: 'kg' | 'lbs' | 'bags';
  cost: number;
}

interface BreedingRecord {
  id: string;
  animalId: string;
  matingDate: string;
  maleId: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  numberOfOffspring?: number;
  offspringIds?: string[];
  status: 'Pregnant' | 'Delivered' | 'Failed' | 'Aborted';
  notes?: string;
}

interface FeedingSchedule {
  id: string;
  animalId: string;
  feedType: string;
  amount: number;
  unit: string;
  frequency: string;
  times: string[];
  instructions?: string;
  active: boolean;
  createdAt: string;
}

const AnimalManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalProfile | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'profile'>('list');
  const [filterSpecies, setFilterSpecies] = useState<string>('All');
  const [feedingScheduleDialog, setFeedingScheduleDialog] = useState(false);
  const [breedingDialog, setBreedingDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newFeedingSchedule, setNewFeedingSchedule] = useState({
    feedType: '',
    amount: 0,
    unit: 'kg',
    frequency: 'daily',
    times: [''],
    instructions: ''
  });
  const [newBreedingRecord, setNewBreedingRecord] = useState({
    motherId: '',
    fatherId: '',
    breedingDate: '',
    expectedDueDate: '',
    method: 'natural',
    notes: ''
  });

  // Demo Data - Animal Profiles
  const [animals, setAnimals] = useState<AnimalProfile[]>([
    {
      id: 'A001',
      species: 'Cattle',
      breed: 'Holstein Friesian',
      tagNumber: 'DC-001',
      name: 'Bella',
      dateOfBirth: '2020-03-15',
      gender: 'Female',
      weight: 550,
      healthStatus: 'Healthy',
      location: 'Dairy Barn - Pen 1',
      acquisitionDate: '2020-03-15',
      acquisitionType: 'Born on Farm',
      currentValue: 85000,
    },
    {
      id: 'A002',
      species: 'Cattle',
      breed: 'Angus',
      tagNumber: 'BC-002',
      name: 'Thunder',
      dateOfBirth: '2019-08-20',
      gender: 'Male',
      weight: 720,
      healthStatus: 'Healthy',
      location: 'Beef Barn - Pen 2',
      acquisitionDate: '2020-01-10',
      acquisitionType: 'Purchased',
      purchasePrice: 120000,
      currentValue: 180000,
    },
    {
      id: 'A003',
      species: 'Pig',
      breed: 'Large White',
      tagNumber: 'PG-003',
      dateOfBirth: '2023-05-10',
      gender: 'Female',
      weight: 85,
      healthStatus: 'Under Treatment',
      location: 'Pig House - Pen 3',
      acquisitionDate: '2023-05-10',
      acquisitionType: 'Born on Farm',
      motherId: 'A010',
      currentValue: 12000,
    },
    {
      id: 'A004',
      species: 'Goat',
      breed: 'Boer',
      tagNumber: 'GT-004',
      name: 'Bambi',
      dateOfBirth: '2022-11-05',
      gender: 'Female',
      weight: 45,
      healthStatus: 'Healthy',
      location: 'Goat Shed - Pen 1',
      acquisitionDate: '2023-01-15',
      acquisitionType: 'Purchased',
      purchasePrice: 8000,
      currentValue: 12000,
    },
    {
      id: 'A005',
      species: 'Chicken',
      breed: 'Rhode Island Red',
      tagNumber: 'CH-005',
      dateOfBirth: '2024-01-20',
      gender: 'Female',
      weight: 2.5,
      healthStatus: 'Healthy',
      location: 'Chicken Coop - Section A',
      acquisitionDate: '2024-01-20',
      acquisitionType: 'Purchased',
      purchasePrice: 500,
      currentValue: 800,
    },
  ]);

  // Demo Data - Health Records
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([
    {
      id: 'H001',
      animalId: 'A001',
      date: '2024-10-15',
      type: 'Vaccination',
      description: 'Foot and Mouth Disease (FMD) Vaccination',
      medicine: 'FMD Vaccine',
      dosage: '2ml',
      cost: 500,
      veterinarian: 'Dr. James Mwangi',
      nextDueDate: '2025-04-15',
    },
    {
      id: 'H002',
      animalId: 'A001',
      date: '2024-09-01',
      type: 'Deworming',
      description: 'Routine deworming',
      medicine: 'Ivermectin',
      dosage: '10ml',
      cost: 300,
      veterinarian: 'Dr. James Mwangi',
      nextDueDate: '2024-12-01',
    },
    {
      id: 'H003',
      animalId: 'A003',
      date: '2024-11-10',
      type: 'Treatment',
      description: 'Respiratory infection treatment',
      medicine: 'Tylosin',
      dosage: '5ml daily for 5 days',
      cost: 1200,
      veterinarian: 'Dr. Sarah Wanjiru',
      notes: 'Monitor for 7 days, isolate from other pigs',
    },
    {
      id: 'H004',
      animalId: 'A002',
      date: '2024-10-20',
      type: 'Check-up',
      description: 'Routine health check',
      cost: 800,
      veterinarian: 'Dr. James Mwangi',
      notes: 'All vitals normal, ready for breeding',
    },
  ]);

  // Demo Data - Weight Records
  const [weightRecords, setWeightRecords] = useState<WeightRecord[]>([
    { id: 'W001', animalId: 'A001', date: '2024-01-15', weight: 480, bodyCondition: 4 },
    { id: 'W002', animalId: 'A001', date: '2024-04-15', weight: 510, bodyCondition: 4 },
    { id: 'W003', animalId: 'A001', date: '2024-07-15', weight: 535, bodyCondition: 4 },
    { id: 'W004', animalId: 'A001', date: '2024-10-15', weight: 550, bodyCondition: 5 },
    { id: 'W005', animalId: 'A003', date: '2024-09-10', weight: 75, bodyCondition: 3 },
    { id: 'W006', animalId: 'A003', date: '2024-11-10', weight: 85, bodyCondition: 4 },
  ]);

  // Demo Data - Feed Records
  const [feedRecords, setFeedRecords] = useState<FeedRecord[]>([
    { id: 'F001', animalId: 'A001', date: '2024-11-14', feedType: 'Dairy Meal', quantity: 5, unit: 'kg', cost: 500 },
    { id: 'F002', animalId: 'A002', date: '2024-11-14', feedType: 'Beef Concentrate', quantity: 4, unit: 'kg', cost: 400 },
    { id: 'F003', animalId: 'A003', date: '2024-11-14', feedType: 'Pig Grower', quantity: 2, unit: 'kg', cost: 200 },
  ]);

  // Demo Data - Breeding Records
  const [breedingRecords, setBreedingRecords] = useState<BreedingRecord[]>([
    {
      id: 'B001',
      animalId: 'A001',
      matingDate: '2024-02-15',
      maleId: 'A008',
      expectedDeliveryDate: '2024-11-22',
      actualDeliveryDate: '2024-11-20',
      numberOfOffspring: 1,
      offspringIds: ['A012'],
      status: 'Delivered',
      notes: 'Healthy calf, no complications',
    },
    {
      id: 'B002',
      animalId: 'A001',
      matingDate: '2024-09-01',
      maleId: 'A008',
      expectedDeliveryDate: '2025-06-08',
      status: 'Pregnant',
      notes: 'Pregnancy confirmed, due in June 2025',
    },
  ]);

  // Demo Data - Feeding Schedules
  const [feedingSchedules, setFeedingSchedules] = useState<FeedingSchedule[]>([
    {
      id: 'FS001',
      animalId: 'A001',
      feedType: 'Dairy Meal',
      amount: 5,
      unit: 'kg',
      frequency: 'twice daily',
      times: ['06:00', '18:00'],
      instructions: 'Mix with water, serve fresh',
      active: true,
      createdAt: '2024-01-15'
    },
    {
      id: 'FS002',
      animalId: 'A002',
      feedType: 'Beef Concentrate',
      amount: 4,
      unit: 'kg',
      frequency: 'once daily',
      times: ['07:00'],
      instructions: 'Supplement with hay',
      active: true,
      createdAt: '2024-02-10'
    }
  ]);

  const [formData, setFormData] = useState<Partial<AnimalProfile>>({
    species: 'Cattle',
    gender: 'Female',
    healthStatus: 'Healthy',
    acquisitionType: 'Born on Farm',
  });

  const handleOpenDialog = (animal?: AnimalProfile) => {
    if (animal) {
      setFormData(animal);
      setSelectedAnimal(animal);
    } else {
      setFormData({
        species: 'Cattle',
        gender: 'Female',
        healthStatus: 'Healthy',
        acquisitionType: 'Born on Farm',
      });
      setSelectedAnimal(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAnimal(null);
  };

  const handleSaveAnimal = () => {
    if (selectedAnimal) {
      setAnimals(animals.map(a => a.id === selectedAnimal.id ? { ...a, ...formData } as AnimalProfile : a));
    } else {
      const newAnimal: AnimalProfile = {
        ...formData as AnimalProfile,
        id: `A${String(animals.length + 1).padStart(3, '0')}`,
      };
      setAnimals([...animals, newAnimal]);
    }
    handleCloseDialog();
  };

  const handleViewProfile = (animal: AnimalProfile) => {
    setSelectedAnimal(animal);
    setViewMode('profile');
  };

  const getFilteredAnimals = () => {
    if (filterSpecies === 'All') return animals;
    return animals.filter(a => a.species === filterSpecies);
  };

  const getAnimalHealthRecords = (animalId: string) => {
    return healthRecords.filter(r => r.animalId === animalId);
  };

  const getAnimalWeightRecords = (animalId: string) => {
    return weightRecords.filter(r => r.animalId === animalId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getAnimalBreedingRecords = (animalId: string) => {
    return breedingRecords.filter(r => r.animalId === animalId);
  };

  const calculateAge = (dateOfBirth: string) => {
    const birth = new Date(dateOfBirth);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    
    if (years > 0) return `${years}y ${months}m`;
    return `${months}m`;
  };

  const getWeightTrend = (animalId: string) => {
    const records = getAnimalWeightRecords(animalId);
    if (records.length < 2) return 0;
    
    const latest = records[0].weight;
    const previous = records[1].weight;
    return ((latest - previous) / previous) * 100;
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'success';
      case 'Sick': return 'error';
      case 'Under Treatment': return 'warning';
      case 'Quarantine': return 'error';
      default: return 'default';
    }
  };

  const getSpeciesIcon = (species: string) => {
    const iconProps = { sx: { fontSize: 40 } };
    return <Pets {...iconProps} />;
  };

  // Statistics
  const totalAnimals = animals.length;
  const healthyAnimals = animals.filter(a => a.healthStatus === 'Healthy').length;
  const sickAnimals = animals.filter(a => a.healthStatus === 'Sick' || a.healthStatus === 'Under Treatment').length;
  const pregnantAnimals = breedingRecords.filter(b => b.status === 'Pregnant').length;
  const totalValue = animals.reduce((sum, a) => sum + a.currentValue, 0);

  if (viewMode === 'profile' && selectedAnimal) {
    const animalHealthRecords = getAnimalHealthRecords(selectedAnimal.id);
    const animalWeightRecords = getAnimalWeightRecords(selectedAnimal.id);
    const animalBreedingRecords = getAnimalBreedingRecords(selectedAnimal.id);
    const weightTrend = getWeightTrend(selectedAnimal.id);

    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Button onClick={() => setViewMode('list')}>← Back to List</Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<Edit />} onClick={() => handleOpenDialog(selectedAnimal)}>
              Edit
            </Button>
            <Button variant="outlined" color="error" startIcon={<Delete />}>
              Delete
            </Button>
          </Box>
        </Box>

        {/* Success Alert */}
        {successMessage && (
          <Alert severity="success" onClose={() => setSuccessMessage(null)} sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {/* Animal Profile Header */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 3 }} sx={{ textAlign: 'center' }}>
                <Avatar sx={{ width: 150, height: 150, margin: '0 auto', bgcolor: 'primary.main' }}>
                  {getSpeciesIcon(selectedAnimal.species)}
                </Avatar>
                <Typography variant="h5" sx={{ mt: 2, fontWeight: 600 }}>
                  {selectedAnimal.name || selectedAnimal.tagNumber}
                </Typography>
                <Chip label={selectedAnimal.healthStatus} color={getHealthStatusColor(selectedAnimal.healthStatus)} sx={{ mt: 1 }} />
              </Grid>
              <Grid size={{ xs: 12, md: 9 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary">Species</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedAnimal.species}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary">Breed</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedAnimal.breed}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary">Tag Number</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedAnimal.tagNumber}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary">Gender</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedAnimal.gender}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                    <Typography variant="body1" fontWeight={600}>{new Date(selectedAnimal.dateOfBirth).toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary">Age</Typography>
                    <Typography variant="body1" fontWeight={600}>{calculateAge(selectedAnimal.dateOfBirth)}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary">Current Weight</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedAnimal.weight} kg</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary">Location</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedAnimal.location}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary">Current Value</Typography>
                    <Typography variant="body1" fontWeight={600} color="success.main">
                      ${selectedAnimal.currentValue.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary">Acquisition</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedAnimal.acquisitionType}</Typography>
                  </Grid>
                  <Grid size={{ xs: 6, md: 3 }}>
                    <Typography variant="caption" color="text.secondary">Weight Trend</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <TrendingUp color={weightTrend > 0 ? 'success' : 'error'} />
                      <Typography variant="body1" fontWeight={600} color={weightTrend > 0 ? 'success.main' : 'error.main'}>
                        {weightTrend > 0 ? '+' : ''}{weightTrend.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Tabs for Different Records */}
        <Card>
          <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
            <Tab label={`Health Records (${animalHealthRecords.length})`} icon={<LocalHospital />} iconPosition="start" />
            <Tab label={`Weight History (${animalWeightRecords.length})`} icon={<MonitorWeight />} iconPosition="start" />
            <Tab label={`Breeding Records (${animalBreedingRecords.length})`} icon={<FavoriteBorder />} iconPosition="start" />
            <Tab label="Feeding Schedule" icon={<Schedule />} iconPosition="start" />
            <Tab label="Feed History" icon={<Restaurant />} iconPosition="start" />
          </Tabs>

          <CardContent>
            {/* Health Records Tab */}
            {activeTab === 0 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Health History</Typography>
                  <Button variant="contained" startIcon={<Add />} size="small">
                    Add Health Record
                  </Button>
                </Box>
                {animalHealthRecords.length === 0 ? (
                  <Alert severity="info">No health records found</Alert>
                ) : (
                  <List>
                    {animalHealthRecords.map((record) => (
                      <React.Fragment key={record.id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: record.type === 'Treatment' ? 'error.main' : 'success.main' }}>
                              {record.type === 'Vaccination' ? <VaccinesOutlined /> : <LocalHospital />}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1">{record.description}</Typography>
                                <Chip label={record.type} size="small" />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  {new Date(record.date).toLocaleDateString()} • Dr. {record.veterinarian}
                                </Typography>
                                {record.medicine && (
                                  <Typography variant="body2">
                                    Medicine: {record.medicine} ({record.dosage})
                                  </Typography>
                                )}
                                {record.nextDueDate && (
                                  <Typography variant="body2" color="warning.main">
                                    Next due: {new Date(record.nextDueDate).toLocaleDateString()}
                                  </Typography>
                                )}
                                {record.notes && (
                                  <Typography variant="body2" color="text.secondary">
                                    Notes: {record.notes}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          <Typography variant="body2" fontWeight={600}>
                            ${record.cost}
                          </Typography>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            )}

            {/* Weight History Tab */}
            {activeTab === 1 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Weight Progress</Typography>
                  <Button variant="contained" startIcon={<Add />} size="small">
                    Record Weight
                  </Button>
                </Box>
                {animalWeightRecords.length === 0 ? (
                  <Alert severity="info">No weight records found</Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Weight (kg)</TableCell>
                          <TableCell>Change</TableCell>
                          <TableCell>Body Condition</TableCell>
                          <TableCell>Notes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {animalWeightRecords.map((record, index) => {
                          const previousWeight = animalWeightRecords[index + 1]?.weight;
                          const change = previousWeight ? record.weight - previousWeight : 0;
                          return (
                            <TableRow key={record.id}>
                              <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                              <TableCell>{record.weight} kg</TableCell>
                              <TableCell>
                                {change !== 0 && (
                                  <Chip
                                    label={`${change > 0 ? '+' : ''}${change.toFixed(1)} kg`}
                                    size="small"
                                    color={change > 0 ? 'success' : 'error'}
                                  />
                                )}
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Box
                                      key={i}
                                      sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        bgcolor: i < record.bodyCondition ? 'success.main' : 'grey.300',
                                      }}
                                    />
                                  ))}
                                  <Typography variant="caption" sx={{ ml: 1 }}>
                                    {record.bodyCondition}/5
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>{record.notes || '-'}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {/* Breeding Records Tab */}
            {activeTab === 2 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Breeding History</Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    size="small"
                    onClick={() => {
                      setNewBreedingRecord({
                        motherId: selectedAnimal?.gender === 'Female' ? selectedAnimal.id : '',
                        fatherId: selectedAnimal?.gender === 'Male' ? selectedAnimal.id : '',
                        breedingDate: '',
                        expectedDueDate: '',
                        method: 'natural',
                        notes: ''
                      });
                      setBreedingDialog(true);
                    }}
                  >
                    Add Breeding Record
                  </Button>
                </Box>
                {animalBreedingRecords.length === 0 ? (
                  <Alert severity="info">No breeding records found</Alert>
                ) : (
                  <List>
                    {animalBreedingRecords.map((record) => (
                      <React.Fragment key={record.id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: record.status === 'Delivered' ? 'success.main' : 'info.main' }}>
                              <FavoriteBorder />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1">Breeding #{record.id}</Typography>
                                <Chip label={record.status} size="small" color={record.status === 'Delivered' ? 'success' : 'info'} />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  Mating Date: {new Date(record.matingDate).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2">
                                  Expected: {new Date(record.expectedDeliveryDate).toLocaleDateString()}
                                </Typography>
                                {record.actualDeliveryDate && (
                                  <Typography variant="body2" color="success.main">
                                    Delivered: {new Date(record.actualDeliveryDate).toLocaleDateString()}
                                    {record.numberOfOffspring && ` • ${record.numberOfOffspring} offspring`}
                                  </Typography>
                                )}
                                {record.notes && (
                                  <Typography variant="body2" color="text.secondary">
                                    {record.notes}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            )}

            {/* Feeding Schedule Tab */}
            {activeTab === 3 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Feeding Schedule</Typography>
                  <Button 
                    variant="contained" 
                    startIcon={<Add />} 
                    size="small"
                    onClick={() => setFeedingScheduleDialog(true)}
                  >
                    Create Schedule
                  </Button>
                </Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Set up recurring feeding schedules to ensure consistent nutrition and track feeding compliance
                </Alert>
                {feedingSchedules.filter(s => s.animalId === selectedAnimal.id).length === 0 ? (
                  <Alert severity="warning">No feeding schedules set for this animal</Alert>
                ) : (
                  <List>
                    {feedingSchedules.filter(s => s.animalId === selectedAnimal.id).map((schedule) => (
                      <React.Fragment key={schedule.id}>
                        <ListItem>
                          <ListItemAvatar>
                            <Avatar sx={{ bgcolor: schedule.active ? 'success.main' : 'grey.500' }}>
                              <Restaurant />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="subtitle1">{schedule.feedType}</Typography>
                                <Chip 
                                  label={schedule.active ? 'Active' : 'Inactive'} 
                                  size="small" 
                                  color={schedule.active ? 'success' : 'default'}
                                />
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography variant="body2">
                                  Amount: {schedule.amount} {schedule.unit} • {schedule.frequency}
                                </Typography>
                                <Typography variant="body2">
                                  Feeding times: {schedule.times.join(', ')}
                                </Typography>
                                {schedule.instructions && (
                                  <Typography variant="body2" color="text.secondary">
                                    Instructions: {schedule.instructions}
                                  </Typography>
                                )}
                                <Typography variant="caption" color="text.secondary">
                                  Created: {new Date(schedule.createdAt).toLocaleDateString()}
                                </Typography>
                              </Box>
                            }
                          />
                          <Box>
                            <IconButton size="small" color="primary">
                              <Edit />
                            </IconButton>
                            <IconButton size="small" color="error">
                              <Delete />
                            </IconButton>
                          </Box>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                )}
              </Box>
            )}

            {/* Feed History Tab */}
            {activeTab === 4 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">Feeding History</Typography>
                  <Button variant="contained" startIcon={<Add />} size="small">
                    Record Feeding
                  </Button>
                </Box>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Feed consumption tracking helps monitor animal health and optimize costs
                </Alert>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Feed Type</TableCell>
                        <TableCell>Quantity</TableCell>
                        <TableCell>Cost</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {feedRecords.filter(r => r.animalId === selectedAnimal.id).map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                          <TableCell>{record.feedType}</TableCell>
                          <TableCell>{record.quantity} {record.unit}</TableCell>
                          <TableCell>${record.cost}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
        Animal Management
      </Typography>
      <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
        Monitor animal health records, vaccination schedules, and breeding programs
      </Typography>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Animals</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>{totalAnimals}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light' }}>
                  <Pets />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Healthy</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>{healthyAnimals}</Typography>
                  <Typography variant="caption">{((healthyAnimals / totalAnimals) * 100).toFixed(0)}% of total</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light' }}>
                  <CheckCircle />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Need Attention</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>{sickAnimals}</Typography>
                  <Typography variant="caption">Sick or Under Treatment</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.light' }}>
                  <Warning />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Value</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    ${(totalValue / 1000).toFixed(0)}K
                  </Typography>
                  <Typography variant="caption">{pregnantAnimals} Pregnant</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.light' }}>
                  <TrendingUp />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Animal Profiles</Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Filter by Species</InputLabel>
                <Select
                  value={filterSpecies}
                  label="Filter by Species"
                  onChange={(e) => setFilterSpecies(e.target.value)}
                >
                  <MenuItem value="All">All Species</MenuItem>
                  <MenuItem value="Cattle">Cattle</MenuItem>
                  <MenuItem value="Pig">Pigs</MenuItem>
                  <MenuItem value="Goat">Goats</MenuItem>
                  <MenuItem value="Sheep">Sheep</MenuItem>
                  <MenuItem value="Chicken">Chickens</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
                Add Animal
              </Button>
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tag Number</TableCell>
                  <TableCell>Name/ID</TableCell>
                  <TableCell>Species</TableCell>
                  <TableCell>Breed</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Weight</TableCell>
                  <TableCell>Health Status</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getFilteredAnimals().map((animal) => (
                  <TableRow key={animal.id}>
                    <TableCell>{animal.tagNumber}</TableCell>
                    <TableCell>{animal.name || '-'}</TableCell>
                    <TableCell>{animal.species}</TableCell>
                    <TableCell>{animal.breed}</TableCell>
                    <TableCell>{calculateAge(animal.dateOfBirth)}</TableCell>
                    <TableCell>{animal.weight} kg</TableCell>
                    <TableCell>
                      <Chip
                        label={animal.healthStatus}
                        size="small"
                        color={getHealthStatusColor(animal.healthStatus)}
                      />
                    </TableCell>
                    <TableCell>{animal.location}</TableCell>
                    <TableCell>${animal.currentValue.toLocaleString()}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleViewProfile(animal)}>
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleOpenDialog(animal)}>
                        <Edit />
                      </IconButton>
                      <IconButton size="small" color="error">
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

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{selectedAnimal ? 'Edit Animal' : 'Add New Animal'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Species"
                value={formData.species || ''}
                onChange={(e) => setFormData({ ...formData, species: e.target.value as any })}
              >
                <MenuItem value="Cattle">Cattle</MenuItem>
                <MenuItem value="Pig">Pig</MenuItem>
                <MenuItem value="Goat">Goat</MenuItem>
                <MenuItem value="Sheep">Sheep</MenuItem>
                <MenuItem value="Chicken">Chicken</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Breed"
                value={formData.breed || ''}
                onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Tag Number"
                value={formData.tagNumber || ''}
                onChange={(e) => setFormData({ ...formData, tagNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Name (Optional)"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                value={formData.dateOfBirth || ''}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Gender"
                value={formData.gender || ''}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Weight (kg)"
                value={formData.weight || ''}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Health Status"
                value={formData.healthStatus || ''}
                onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value as any })}
              >
                <MenuItem value="Healthy">Healthy</MenuItem>
                <MenuItem value="Sick">Sick</MenuItem>
                <MenuItem value="Under Treatment">Under Treatment</MenuItem>
                <MenuItem value="Quarantine">Quarantine</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Dairy Barn - Pen 1"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Acquisition Type"
                value={formData.acquisitionType || ''}
                onChange={(e) => setFormData({ ...formData, acquisitionType: e.target.value as any })}
              >
                <MenuItem value="Born on Farm">Born on Farm</MenuItem>
                <MenuItem value="Purchased">Purchased</MenuItem>
                <MenuItem value="Donated">Donated</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Current Value ($)"
                value={formData.currentValue || ''}
                onChange={(e) => setFormData({ ...formData, currentValue: parseFloat(e.target.value) })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveAnimal} variant="contained">
            {selectedAnimal ? 'Save Changes' : 'Add Animal'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feeding Schedule Dialog */}
      <Dialog open={feedingScheduleDialog} onClose={() => setFeedingScheduleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Feeding Schedule</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Alert severity="info">
              Set up a regular feeding schedule for {selectedAnimal?.name || selectedAnimal?.tagNumber}
            </Alert>
            <TextField
              label="Feed Type"
              value={newFeedingSchedule.feedType}
              onChange={(e) => setNewFeedingSchedule({ ...newFeedingSchedule, feedType: e.target.value })}
              fullWidth
              required
              placeholder="e.g., Dairy Meal, Hay, Concentrate"
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Amount"
                type="number"
                value={newFeedingSchedule.amount}
                onChange={(e) => setNewFeedingSchedule({ ...newFeedingSchedule, amount: parseFloat(e.target.value) })}
                fullWidth
                required
                inputProps={{ min: 0, step: 0.1 }}
              />
              <FormControl fullWidth required>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={newFeedingSchedule.unit}
                  label="Unit"
                  onChange={(e) => setNewFeedingSchedule({ ...newFeedingSchedule, unit: e.target.value })}
                >
                  <MenuItem value="kg">Kilograms (kg)</MenuItem>
                  <MenuItem value="lbs">Pounds (lbs)</MenuItem>
                  <MenuItem value="bags">Bags</MenuItem>
                  <MenuItem value="litres">Litres</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <FormControl fullWidth required>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={newFeedingSchedule.frequency}
                label="Frequency"
                onChange={(e) => setNewFeedingSchedule({ ...newFeedingSchedule, frequency: e.target.value })}
              >
                <MenuItem value="once daily">Once Daily</MenuItem>
                <MenuItem value="twice daily">Twice Daily</MenuItem>
                <MenuItem value="three times daily">Three Times Daily</MenuItem>
                <MenuItem value="every 6 hours">Every 6 Hours</MenuItem>
                <MenuItem value="on demand">On Demand</MenuItem>
              </Select>
            </FormControl>
            <Box>
              <Typography variant="subtitle2" gutterBottom>Feeding Times</Typography>
              {newFeedingSchedule.times.map((time, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    type="time"
                    value={time}
                    onChange={(e) => {
                      const newTimes = [...newFeedingSchedule.times];
                      newTimes[index] = e.target.value;
                      setNewFeedingSchedule({ ...newFeedingSchedule, times: newTimes });
                    }}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                  {newFeedingSchedule.times.length > 1 && (
                    <IconButton 
                      color="error" 
                      onClick={() => {
                        const newTimes = newFeedingSchedule.times.filter((_, i) => i !== index);
                        setNewFeedingSchedule({ ...newFeedingSchedule, times: newTimes });
                      }}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Box>
              ))}
              <Button 
                size="small" 
                startIcon={<Add />}
                onClick={() => setNewFeedingSchedule({ 
                  ...newFeedingSchedule, 
                  times: [...newFeedingSchedule.times, ''] 
                })}
              >
                Add Another Time
              </Button>
            </Box>
            <TextField
              label="Special Instructions"
              value={newFeedingSchedule.instructions}
              onChange={(e) => setNewFeedingSchedule({ ...newFeedingSchedule, instructions: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="e.g., Mix with water, serve fresh, supplement with hay..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedingScheduleDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              // Add the schedule
              const newSchedule: FeedingSchedule = {
                id: `FS${Date.now()}`,
                animalId: selectedAnimal?.id || '',
                ...newFeedingSchedule,
                active: true,
                createdAt: new Date().toISOString()
              };
              setFeedingSchedules([...feedingSchedules, newSchedule]);
              setFeedingScheduleDialog(false);
              setSuccessMessage(`Feeding schedule created for ${selectedAnimal?.name || selectedAnimal?.tagNumber}!`);
              setTimeout(() => setSuccessMessage(null), 5000);
              setNewFeedingSchedule({
                feedType: '',
                amount: 0,
                unit: 'kg',
                frequency: 'daily',
                times: [''],
                instructions: ''
              });
            }} 
            variant="contained"
            disabled={!newFeedingSchedule.feedType || newFeedingSchedule.amount <= 0}
          >
            Create Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Breeding Record Dialog */}
      <Dialog open={breedingDialog} onClose={() => setBreedingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PregnantWoman />
            <Typography>Record Breeding Event</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Alert severity="info">
              Record breeding information for tracking pregnancy and offspring
            </Alert>
            <FormControl fullWidth required>
              <InputLabel>Mother</InputLabel>
              <Select
                value={newBreedingRecord.motherId}
                label="Mother"
                onChange={(e) => setNewBreedingRecord({ ...newBreedingRecord, motherId: e.target.value })}
              >
                {animals.filter(a => a.gender === 'Female').map(animal => (
                  <MenuItem key={animal.id} value={animal.id}>
                    {animal.name || animal.tagNumber} - {animal.breed} ({animal.species})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Father</InputLabel>
              <Select
                value={newBreedingRecord.fatherId}
                label="Father"
                onChange={(e) => setNewBreedingRecord({ ...newBreedingRecord, fatherId: e.target.value })}
              >
                {animals.filter(a => a.gender === 'Male').map(animal => (
                  <MenuItem key={animal.id} value={animal.id}>
                    {animal.name || animal.tagNumber} - {animal.breed} ({animal.species})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Breeding Date"
              type="date"
              value={newBreedingRecord.breedingDate}
              onChange={(e) => setNewBreedingRecord({ ...newBreedingRecord, breedingDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              required
            />
            <TextField
              label="Expected Due Date"
              type="date"
              value={newBreedingRecord.expectedDueDate}
              onChange={(e) => setNewBreedingRecord({ ...newBreedingRecord, expectedDueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
              helperText="Typical gestation: Cattle 280 days, Goat 150 days, Pig 114 days"
            />
            <FormControl fullWidth>
              <InputLabel>Breeding Method</InputLabel>
              <Select
                value={newBreedingRecord.method}
                label="Breeding Method"
                onChange={(e) => setNewBreedingRecord({ ...newBreedingRecord, method: e.target.value })}
              >
                <MenuItem value="natural">Natural Breeding</MenuItem>
                <MenuItem value="artificial">Artificial Insemination</MenuItem>
                <MenuItem value="embryo_transfer">Embryo Transfer</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Notes"
              value={newBreedingRecord.notes}
              onChange={(e) => setNewBreedingRecord({ ...newBreedingRecord, notes: e.target.value })}
              fullWidth
              multiline
              rows={3}
              placeholder="Additional observations or special circumstances..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBreedingDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              // Add the breeding record
              const mother = animals.find(a => a.id === newBreedingRecord.motherId);
              const father = animals.find(a => a.id === newBreedingRecord.fatherId);
              
              const newRecord: BreedingRecord = {
                id: `B${Date.now()}`,
                animalId: newBreedingRecord.motherId,
                matingDate: newBreedingRecord.breedingDate,
                maleId: newBreedingRecord.fatherId,
                expectedDeliveryDate: newBreedingRecord.expectedDueDate,
                status: 'Pregnant',
                notes: newBreedingRecord.notes
              };
              
              setBreedingRecords([...breedingRecords, newRecord]);
              setBreedingDialog(false);
              setSuccessMessage(`Breeding record created! ${mother?.name || mother?.tagNumber} is now tracked as pregnant.`);
              setTimeout(() => setSuccessMessage(null), 5000);
              setNewBreedingRecord({
                motherId: '',
                fatherId: '',
                breedingDate: '',
                expectedDueDate: '',
                method: 'natural',
                notes: ''
              });
            }} 
            variant="contained"
            disabled={!newBreedingRecord.motherId || !newBreedingRecord.fatherId || !newBreedingRecord.breedingDate}
          >
            Record Breeding
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AnimalManagementDashboard;


