import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  TextField,
  Typography,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Agriculture as AgricultureIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Organization {
  _id: string;
  name: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface Farm {
  _id: string;
  name: string;
  description?: string;
  organization: {
    _id: string;
    name: string;
  };
  location?: {
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  size?: {
    value: number;
    unit: string;
  };
  farmType?: string[];
  manager: {
    _id: string;
    name: string;
    email: string;
  };
  workers: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
  }>;
  isActive: boolean;
}

const FARM_TYPES = ['crops', 'livestock', 'dairy', 'poultry', 'mixed', 'organic', 'other'];
const SIZE_UNITS = ['acres', 'hectares', 'sqft', 'sqm'];

const FarmManagement: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentFarm, setCurrentFarm] = useState<Farm | null>(null);

  // Form states
  const [farmForm, setFarmForm] = useState({
    name: '',
    description: '',
    organization: '',
    location: {
      address: '',
      city: '',
      state: '',
      country: '',
      coordinates: {
        latitude: 0,
        longitude: 0,
      },
    },
    size: {
      value: 0,
      unit: 'acres',
    },
    farmType: [] as string[],
    manager: '',
    workers: [] as string[],
  });

  useEffect(() => {
    fetchFarms();
    fetchOrganizations();
    fetchUsers();
  }, []);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/farms-multi', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFarms(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching farms');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/organizations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrganizations(response.data);
    } catch (err: any) {
      console.error('Error fetching organizations:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/workers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err: any) {
      console.error('Error fetching users:', err);
    }
  };

  const handleCreateFarm = () => {
    setIsEditing(false);
    setFarmForm({
      name: '',
      description: '',
      organization: organizations[0]?._id || '',
      location: {
        address: '',
        city: '',
        state: '',
        country: '',
        coordinates: {
          latitude: 0,
          longitude: 0,
        },
      },
      size: {
        value: 0,
        unit: 'acres',
      },
      farmType: [],
      manager: '',
      workers: [],
    });
    setOpenDialog(true);
  };

  const handleEditFarm = (farm: Farm) => {
    setIsEditing(true);
    setCurrentFarm(farm);
    setFarmForm({
      name: farm.name,
      description: farm.description || '',
      organization: farm.organization._id,
      location: farm.location || {
        address: '',
        city: '',
        state: '',
        country: '',
        coordinates: { latitude: 0, longitude: 0 },
      } as any,
      size: farm.size || { value: 0, unit: 'acres' },
      farmType: farm.farmType || [],
      manager: farm.manager._id,
      workers: farm.workers.map((w) => w._id),
    });
    setOpenDialog(true);
  };

  const handleSaveFarm = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = isEditing
        ? `http://localhost:5000/api/farms-multi/${currentFarm?._id}`
        : 'http://localhost:5000/api/farms-multi';

      const method = isEditing ? 'put' : 'post';

      await axios[method](url, farmForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccess(
        isEditing ? 'Farm updated successfully' : 'Farm created successfully'
      );
      setOpenDialog(false);
      fetchFarms();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving farm');
    }
  };

  const handleDeleteFarm = async (farmId: string) => {
    if (!window.confirm('Are you sure you want to delete this farm?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/farms-multi/${farmId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Farm deleted successfully');
      fetchFarms();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error deleting farm');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          <AgricultureIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Farm Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateFarm}
        >
          New Farm
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {farms.map((farm) => (
          <Grid size={{ xs: 12, md: 6 }} key={farm._id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6">{farm.name}</Typography>
                  <Box>
                    <IconButton size="small" onClick={() => handleEditFarm(farm)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteFarm(farm._id)}
                      color="error"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {farm.description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {farm.description}
                  </Typography>
                )}

                <Divider sx={{ my: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Organization
                    </Typography>
                    <Typography>{farm.organization.name}</Typography>
                  </Grid>

                  {farm.location?.city && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        <LocationIcon
                          fontSize="small"
                          sx={{ verticalAlign: 'middle', mr: 0.5 }}
                        />
                        Location
                      </Typography>
                      <Typography>
                        {farm.location.city}
                        {farm.location.state && `, ${farm.location.state}`}
                        {farm.location.country && `, ${farm.location.country}`}
                      </Typography>
                    </Grid>
                  )}

                  {farm.size && farm.size.value > 0 && (
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Size
                      </Typography>
                      <Typography>
                        {farm.size.value} {farm.size.unit}
                      </Typography>
                    </Grid>
                  )}

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      <PersonIcon
                        fontSize="small"
                        sx={{ verticalAlign: 'middle', mr: 0.5 }}
                      />
                      Manager
                    </Typography>
                    <Typography>{farm.manager.name}</Typography>
                  </Grid>

                  {farm.farmType && farm.farmType.length > 0 && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Farm Types
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {farm.farmType.map((type) => (
                          <Chip key={type} label={type} size="small" />
                        ))}
                      </Box>
                    </Grid>
                  )}

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Workers ({farm.workers.length})
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {farm.workers.slice(0, 3).map((worker) => (
                        <Chip
                          key={worker._id}
                          label={worker.name}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {farm.workers.length > 3 && (
                        <Chip
                          label={`+${farm.workers.length - 3} more`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {farms.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Typography color="text.secondary" align="center">
              No farms found. Create your first farm to get started.
            </Typography>
          </Grid>
        )}
      </Grid>

      {/* Create/Edit Farm Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {isEditing ? 'Edit Farm' : 'Create New Farm'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Farm Name"
                fullWidth
                required
                value={farmForm.name}
                onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={farmForm.description}
                onChange={(e) => setFarmForm({ ...farmForm, description: e.target.value })}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Organization</InputLabel>
                <Select
                  value={farmForm.organization}
                  label="Organization"
                  onChange={(e) =>
                    setFarmForm({ ...farmForm, organization: e.target.value })
                  }
                >
                  {organizations.map((org) => (
                    <MenuItem key={org._id} value={org._id}>
                      {org.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                Location
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label="Address"
                fullWidth
                value={farmForm.location.address}
                onChange={(e) =>
                  setFarmForm({
                    ...farmForm,
                    location: { ...farmForm.location, address: e.target.value },
                  })
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="City"
                fullWidth
                value={farmForm.location.city}
                onChange={(e) =>
                  setFarmForm({
                    ...farmForm,
                    location: { ...farmForm.location, city: e.target.value },
                  })
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="State"
                fullWidth
                value={farmForm.location.state}
                onChange={(e) =>
                  setFarmForm({
                    ...farmForm,
                    location: { ...farmForm.location, state: e.target.value },
                  })
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Country"
                fullWidth
                value={farmForm.location.country}
                onChange={(e) =>
                  setFarmForm({
                    ...farmForm,
                    location: { ...farmForm.location, country: e.target.value },
                  })
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Latitude"
                fullWidth
                type="number"
                value={farmForm.location.coordinates.latitude}
                onChange={(e) =>
                  setFarmForm({
                    ...farmForm,
                    location: {
                      ...farmForm.location,
                      coordinates: {
                        ...farmForm.location.coordinates,
                        latitude: parseFloat(e.target.value),
                      },
                    },
                  })
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Longitude"
                fullWidth
                type="number"
                value={farmForm.location.coordinates.longitude}
                onChange={(e) =>
                  setFarmForm({
                    ...farmForm,
                    location: {
                      ...farmForm.location,
                      coordinates: {
                        ...farmForm.location.coordinates,
                        longitude: parseFloat(e.target.value),
                      },
                    },
                  })
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Size"
                fullWidth
                type="number"
                value={farmForm.size.value}
                onChange={(e) =>
                  setFarmForm({
                    ...farmForm,
                    size: { ...farmForm.size, value: parseFloat(e.target.value) },
                  })
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={farmForm.size.unit}
                  label="Unit"
                  onChange={(e) =>
                    setFarmForm({
                      ...farmForm,
                      size: { ...farmForm.size, unit: e.target.value },
                    })
                  }
                >
                  {SIZE_UNITS.map((unit) => (
                    <MenuItem key={unit} value={unit}>
                      {unit}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Farm Types</InputLabel>
                <Select
                  multiple
                  value={farmForm.farmType}
                  label="Farm Types"
                  onChange={(e) =>
                    setFarmForm({ ...farmForm, farmType: e.target.value as string[] })
                  }
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value} size="small" />
                      ))}
                    </Box>
                  )}
                >
                  {FARM_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Select all that apply</FormHelperText>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Manager</InputLabel>
                <Select
                  value={farmForm.manager}
                  label="Manager"
                  onChange={(e) => setFarmForm({ ...farmForm, manager: e.target.value })}
                >
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Workers</InputLabel>
                <Select
                  multiple
                  value={farmForm.workers}
                  label="Workers"
                  onChange={(e) =>
                    setFarmForm({ ...farmForm, workers: e.target.value as string[] })
                  }
                  renderValue={(selected) => `${selected.length} workers selected`}
                >
                  {users.map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Select workers for this farm</FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveFarm}>
            {isEditing ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FarmManagement;
