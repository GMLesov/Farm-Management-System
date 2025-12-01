import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, TextField, Typography, Alert, Stack, Paper } from '@mui/material';
import { farmService } from '../services/farms';
import { Farm } from '../types/api';
import { useNavigate } from 'react-router-dom';

const SelectFarm: React.FC = () => {
  const navigate = useNavigate();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');

  const loadFarms = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await farmService.getMyFarms();
      setFarms(list);
    } catch (e: any) {
      setError(e.message || 'Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadFarms(); }, []);

  const selectFarm = (farmId: string) => {
    localStorage.setItem('farmId', farmId);
    navigate('/', { replace: true });
  };

  const createFarm = async () => {
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const created = await farmService.createFarm({
        name: name.trim(),
        description: 'Created from web dashboard',
        location: {
          address: 'Unknown address',
          city: 'Unknown',
          state: 'Unknown',
          country: 'Unknown',
          zipCode: '00000',
          latitude: 0,
          longitude: 0,
        },
        size: 1,
        soilType: 'loam',
        climateZone: 'temperate',
      } as any);
      localStorage.setItem('farmId', (created as any).id || (created as any)._id || '');
      navigate('/', { replace: true });
    } catch (e: any) {
      setError(e.message || 'Failed to create farm');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Select Your Farm
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Choose an existing farm or create a new one to continue.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 3,
        }}
      >
        {farms.map((farm) => (
          <Paper key={(farm as any).id || (farm as any)._id} variant="outlined">
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>{farm.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {(farm as any).id || (farm as any)._id}
                </Typography>
              </Box>
              <Button variant="contained" onClick={() => selectFarm(((farm as any).id || (farm as any)._id))}>
                Use Farm
              </Button>
            </Box>
          </Paper>
        ))}
        {!loading && farms.length === 0 && (
          <Alert severity="info">No farms found for your account. Create a new farm below.</Alert>
        )}
      </Box>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>Create a New Farm</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Farm Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <Button onClick={createFarm} variant="contained" disabled={creating}>
              {creating ? 'Creating…' : 'Create Farm'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SelectFarm;
