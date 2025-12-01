import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Avatar,
  Alert,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { farmService } from '../services/farms';
import { usersService } from '../services/users';

interface ManagerUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

const WorkerManagement: React.FC = () => {
  const farmId = (typeof window !== 'undefined' ? localStorage.getItem('farmId') : null) || '';
  const [managers, setManagers] = useState<ManagerUser[]>([]);
  const [owner, setOwner] = useState<ManagerUser | null>(null);
  // No visible loading indicator is used; avoid unused state warnings
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [error, setError] = useState<string | null>(null);
  const [addId, setAddId] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [emailMatches, setEmailMatches] = useState<ManagerUser[]>([]);
  const [inviteLoading, setInviteLoading] = useState(false);

  const loadManagers = useCallback(async () => {
    if (!farmId) return;
    setError(null);
    try {
      const farm = await farmService.getFarmById(farmId);
      const mgrs = ((farm as any).managers || []).map((u: any) => ({
        id: u.id || u._id,
        firstName: u.firstName || '',
        lastName: u.lastName || '',
        email: u.email || '',
      }));
      const own = (farm as any).owner ? {
        id: (farm as any).owner.id || (farm as any).owner._id,
        firstName: (farm as any).owner.firstName || '',
        lastName: (farm as any).owner.lastName || '',
        email: (farm as any).owner.email || '',
      } : null;
      setManagers(mgrs);
      setOwner(own);
    } catch (e: any) {
      setError(e.message || 'Failed to load managers');
    }
  }, [farmId]);

  useEffect(() => { loadManagers(); }, [loadManagers]);

  const addManager = async () => {
    if (!farmId || !addId.trim()) return;
    try {
      await farmService.updateFarmManagers(
        farmId,
        Array.from(new Set([...(managers.map(m => m.id)), addId.trim()]))
      );
      setSnackbar({ open: true, message: 'Manager added (if authorized)', severity: 'success' });
      setAddId('');
      await loadManagers();
    } catch (e: any) {
      setSnackbar({ open: true, message: e.message || 'Failed to add manager', severity: 'error' });
    }
  };

  const searchByEmail = async () => {
    if (!addEmail.trim()) return;
    try {
      const results = await usersService.searchByEmail(addEmail.trim());
      setEmailMatches(results as any);
      if (results.length === 1) {
        setAddId(results[0].id);
      }
      if (results.length === 0) {
        setSnackbar({ open: true, message: 'No users found for that email. You can invite them as a manager.', severity: 'info' });
      }
    } catch (e: any) {
      setSnackbar({ open: true, message: e.message || 'Search failed', severity: 'error' });
    }
  };

  const inviteByEmail = async () => {
    if (!farmId || !addEmail.trim()) return;
    setInviteLoading(true);
    try {
      await farmService.inviteManagerByEmail(farmId, addEmail.trim());
      setSnackbar({ open: true, message: 'Invite sent (or user added) successfully', severity: 'success' });
      setAddEmail('');
      setEmailMatches([]);
      await loadManagers();
    } catch (e: any) {
      setSnackbar({ open: true, message: e.message || 'Failed to invite manager', severity: 'error' });
    } finally {
      setInviteLoading(false);
    }
  };

  const removeManager = async (managerId: string) => {
    if (!farmId) return;
    if (!window.confirm('Remove this manager from the farm?')) return;
    try {
      await farmService.updateFarmManagers(
        farmId,
        managers.filter(m => m.id !== managerId).map(m => m.id)
      );
      setSnackbar({ open: true, message: 'Manager removed (if authorized)', severity: 'success' });
      await loadManagers();
    } catch (e: any) {
      setSnackbar({ open: true, message: e.message || 'Failed to remove manager', severity: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5">Worker Management</Typography>
      </Box>

      {!farmId && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Please select a farm first.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      <Card>
        <CardContent>
          <Box display="flex" gap={2} alignItems="center" mb={2}>
            <TextField
              label="Add manager by user ID"
              value={addId}
              onChange={(e) => setAddId(e.target.value)}
              size="small"
              placeholder="Paste user id"
            />
            <Button variant="contained" startIcon={<AddIcon />} onClick={addManager} disabled={!addId.trim()}>
              Add Manager
            </Button>
          </Box>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Manager</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {owner && (
                  <TableRow key={owner.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar>
                          {owner.firstName.charAt(0)}{owner.lastName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {owner.firstName} {owner.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {owner.id.slice(-8)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{owner.email}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label="owner" size="small" color="secondary" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip size="small" label="Owner" />
                    </TableCell>
                  </TableRow>
                )}
                {managers.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar>
                          {m.firstName.charAt(0)}{m.lastName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="bold">
                            {m.firstName} {m.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {m.id.slice(-8)}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{m.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label="manager" size="small" color="primary" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Remove Manager">
                        <IconButton size="small" onClick={() => removeManager(m.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {(!owner && managers.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No managers found for this farm yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>Add by Email</Typography>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                label="User email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                size="small"
                type="email"
                placeholder="name@example.com"
              />
              <Button variant="outlined" onClick={searchByEmail}>Find</Button>
              {addEmail && emailMatches.length === 0 && (
                <Button variant="contained" color="primary" onClick={inviteByEmail} disabled={inviteLoading}>
                  {inviteLoading ? 'Inviting...' : 'Invite as Manager'}
                </Button>
              )}
            </Box>
            {emailMatches.length > 0 && (
              <Box mt={1}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Select a match below to add as manager:
                </Typography>
                {emailMatches.map((u) => (
                  <Box key={u.id} display="flex" alignItems="center" justifyContent="space-between" sx={{ p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{u.firstName} {u.lastName}</Typography>
                      <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                    </Box>
                    <Button size="small" variant="contained" onClick={() => { setAddId(u.id); addManager(); }}>Add</Button>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WorkerManagement;