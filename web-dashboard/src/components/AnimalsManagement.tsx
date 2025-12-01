import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { animalService } from '../services/animals';
import { Animal } from '../types/api';

const speciesOptions: Animal['species'][] = ['cattle', 'pig', 'sheep', 'goat', 'chicken', 'horse', 'other'];
const genderOptions: Animal['gender'][] = ['male', 'female'];
const healthOptions: Animal['healthStatus'][] = ['healthy', 'sick', 'injured', 'quarantine', 'deceased'];

const AnimalsManagement: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const farmId = user?.farmId || (typeof window !== 'undefined' ? localStorage.getItem('farmId') || undefined : undefined);

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({ open: false, message: '', severity: 'success' });

  const [form, setForm] = useState({
    tagNumber: '',
    name: '',
    species: 'cattle' as Animal['species'],
    gender: 'female' as Animal['gender'],
    healthStatus: 'healthy' as Animal['healthStatus'],
    acquisitionType: 'purchased' as 'purchased' | 'born_on_farm' | 'inherited' | 'gifted',
    acquisitionDate: new Date().toISOString().split('T')[0],
  });

  const canLoad = useMemo(() => Boolean(farmId), [farmId]);

  const loadAnimals = async () => {
    if (!farmId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await animalService.getAnimals(farmId, { page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' });
      setAnimals(res.data || []);
    } catch (e: any) {
      setError(e.message || 'Failed to load animals');
      setAnimals([]); // Ensure animals is always an array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canLoad) loadAnimals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canLoad]);

  const resetForm = () => {
    setForm({
      tagNumber: '',
      name: '',
      species: 'cattle',
      gender: 'female',
      healthStatus: 'healthy',
      acquisitionType: 'purchased',
      acquisitionDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleCreate = async () => {
    if (!farmId) {
      setSnackbar({ open: true, message: 'No farm selected. Please sign in and select a farm.', severity: 'error' });
      return;
    }
    if (!form.tagNumber.trim()) {
      setSnackbar({ open: true, message: 'Tag number is required', severity: 'error' });
      return;
    }
    setCreating(true);
    try {
      const payload = {
        farm: farmId,
        tagNumber: form.tagNumber.trim(),
        name: form.name.trim() || undefined,
        species: form.species,
        gender: form.gender,
        healthStatus: form.healthStatus,
        acquisitionInfo: {
          type: form.acquisitionType,
          date: form.acquisitionDate,
        },
      } as unknown as Omit<Animal, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>;

      const created = await animalService.createAnimal(payload);
      setAnimals((prev) => [created, ...prev]);
      setSnackbar({ open: true, message: 'Animal created', severity: 'success' });
      setDialogOpen(false);
      resetForm();
    } catch (e: any) {
      setSnackbar({ open: true, message: e.message || 'Failed to create animal', severity: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (animalId: string) => {
    if (!window.confirm('Delete this animal? This cannot be undone.')) return;
    try {
      await animalService.deleteAnimal(animalId);
      setAnimals((prev) => prev.filter((a) => a.id !== animalId));
      setSnackbar({ open: true, message: 'Animal deleted', severity: 'success' });
    } catch (e: any) {
      setSnackbar({ open: true, message: e.message || 'Failed to delete animal', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Animal Management</Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="Reload">
            <IconButton 
              onClick={loadAnimals} 
              disabled={!canLoad || loading}
              aria-label="reload"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Add Animal
          </Button>
        </Box>
      </Box>

      {!farmId && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please select a farm to manage animals. Go to the Select Farm page.
          <Box component="span" sx={{ ml: 1 }}>
            <Button href="/select-farm" size="small" variant="outlined">Select Farm</Button>
          </Box>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tag</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Species</TableCell>
                  <TableCell>Gender</TableCell>
                  <TableCell>Health</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(animals || []).map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>{a.tagNumber}</TableCell>
                    <TableCell>{a.name || '-'}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{a.species}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>{a.gender}</TableCell>
                    <TableCell>
                      <Chip size="small" label={a.healthStatus} color={a.healthStatus === 'healthy' ? 'success' : a.healthStatus === 'quarantine' ? 'warning' : a.healthStatus === 'deceased' ? 'default' : 'error'} sx={{ textTransform: 'capitalize' }} />
                    </TableCell>
                    <TableCell>{new Date(a.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <Tooltip title="Delete">
                        <span>
                          <IconButton 
                            color="error" 
                            onClick={() => handleDelete(a.id)} 
                            size="small"
                            aria-label="delete"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {animals.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {loading ? 'Loading animals…' : 'No animals found.'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Animal</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Tag Number"
              fullWidth
              required
              value={form.tagNumber}
              onChange={(e) => setForm((p) => ({ ...p, tagNumber: e.target.value }))}
            />
            <TextField
              label="Name"
              fullWidth
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel id="species">Species</InputLabel>
                <Select
                  labelId="species"
                  label="Species"
                  value={form.species}
                  onChange={(e) => setForm((p) => ({ ...p, species: e.target.value as Animal['species'] }))}
                >
                  {speciesOptions.map((sp) => (
                    <MenuItem key={sp} value={sp} sx={{ textTransform: 'capitalize' }}>
                      {sp}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="gender">Gender</InputLabel>
                <Select
                  labelId="gender"
                  label="Gender"
                  value={form.gender}
                  onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value as Animal['gender'] }))}
                >
                  {genderOptions.map((g) => (
                    <MenuItem key={g} value={g} sx={{ textTransform: 'capitalize' }}>
                      {g}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <FormControl fullWidth>
              <InputLabel id="health">Health Status</InputLabel>
              <Select
                labelId="health"
                label="Health Status"
                value={form.healthStatus}
                onChange={(e) => setForm((p) => ({ ...p, healthStatus: e.target.value as Animal['healthStatus'] }))}
              >
                {healthOptions.map((h) => (
                  <MenuItem key={h} value={h} sx={{ textTransform: 'capitalize' }}>
                    {h}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel id="acq-type">Acquisition Type</InputLabel>
                <Select
                  labelId="acq-type"
                  label="Acquisition Type"
                  value={form.acquisitionType}
                  onChange={(e) => setForm((p) => ({ ...p, acquisitionType: e.target.value as any }))}
                >
                  <MenuItem value="purchased">Purchased</MenuItem>
                  <MenuItem value="born_on_farm">Born on farm</MenuItem>
                  <MenuItem value="inherited">Inherited</MenuItem>
                  <MenuItem value="gifted">Gifted</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Acquisition Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={form.acquisitionDate}
                onChange={(e) => setForm((p) => ({ ...p, acquisitionDate: e.target.value }))}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={creating}>
            {creating ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AnimalsManagement;
