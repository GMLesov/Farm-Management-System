import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  IconButton,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Person,
  Notifications,
  Security,
  Agriculture,
  Save,
  PhotoCamera,
  People,
  Add,
  Edit,
  Delete,
  LockReset,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SettingsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchParams] = useSearchParams();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Handle tab query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      const tabIndex = parseInt(tabParam, 10);
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex <= 4) {
        setTabValue(tabIndex);
      }
    }
  }, [searchParams]);

  // Profile settings
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    role: user?.role || 'worker',
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    weatherAlerts: true,
    livestockAlerts: true,
    irrigationAlerts: true,
    taskReminders: true,
    systemUpdates: false,
  });

  // Security settings
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Farm preferences
  const [farmPrefs, setFarmPrefs] = useState({
    temperatureUnit: 'celsius' as 'celsius' | 'fahrenheit',
    areaUnit: 'hectares' as 'hectares' | 'acres',
    currency: 'USD',
    timezone: 'UTC',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
  });

  // Worker management
  const [workers, setWorkers] = useState<Array<{
    id: string;
    name: string;
    email: string;
    username: string;
    password?: string;
    role: string;
    permissions: string[];
    status: 'active' | 'inactive';
  }>>([
    { id: '1', name: 'John Smith', email: 'john@farm.com', username: 'jsmith', role: 'worker', permissions: ['crops', 'animals'], status: 'active' },
    { id: '2', name: 'Jane Doe', email: 'jane@farm.com', username: 'jdoe', role: 'worker', permissions: ['equipment'], status: 'active' },
    { id: '3', name: 'Bob Wilson', email: 'bob@farm.com', username: 'bwilson', role: 'worker', permissions: ['crops'], status: 'inactive' },
  ]);
  const [workerDialogOpen, setWorkerDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<any>(null);
  const [workerForm, setWorkerForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'worker',
    permissions: [] as string[],
  });
  const [passwordForm, setPasswordForm] = useState({
    workerId: '',
    workerName: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        role: user.role || 'worker',
      });
    }
    // Load saved preferences
    const savedNotifications = localStorage.getItem('notificationSettings');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
    const savedFarmPrefs = localStorage.getItem('farmPreferences');
    if (savedFarmPrefs) {
      setFarmPrefs(JSON.parse(savedFarmPrefs));
    }
  }, [user]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // API call would go here
      localStorage.setItem('userProfile', JSON.stringify(profile));
      setSnackbar({ open: true, message: 'Profile updated successfully', severity: 'success' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to update profile', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('notificationSettings', JSON.stringify(notifications));
    setSnackbar({ open: true, message: 'Notification preferences saved', severity: 'success' });
  };

  const handleChangePassword = async () => {
    if (security.newPassword !== security.confirmPassword) {
      setSnackbar({ open: true, message: 'Passwords do not match', severity: 'error' });
      return;
    }
    if (security.newPassword.length < 8) {
      setSnackbar({ open: true, message: 'Password must be at least 8 characters', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      // API call would go here
      setSnackbar({ open: true, message: 'Password changed successfully', severity: 'success' });
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setSnackbar({ open: true, message: error.message || 'Failed to change password', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFarmPrefs = () => {
    localStorage.setItem('farmPreferences', JSON.stringify(farmPrefs));
    setSnackbar({ open: true, message: 'Farm preferences saved', severity: 'success' });
  };

  const handleOpenWorkerDialog = (worker?: any) => {
    if (worker) {
      setEditingWorker(worker);
      setWorkerForm({
        name: worker.name,
        email: worker.email,
        username: worker.username,
        password: '',
        role: worker.role,
        permissions: worker.permissions || [],
      });
    } else {
      setEditingWorker(null);
      setWorkerForm({
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'worker',
        permissions: [],
      });
    }
    setWorkerDialogOpen(true);
  };

  const handleCloseWorkerDialog = () => {
    setWorkerDialogOpen(false);
    setEditingWorker(null);
    setWorkerForm({
      name: '',
      email: '',
      username: '',
      password: '',
      role: 'worker',
      permissions: [],
    });
  };

  const handleSaveWorker = () => {
    if (editingWorker) {
      // Update existing worker
      setWorkers(workers.map(w => w.id === editingWorker.id ? { ...w, name: workerForm.name, email: workerForm.email, username: workerForm.username, role: workerForm.role, permissions: workerForm.permissions, ...(workerForm.password ? { password: workerForm.password } : {}) } : w));
      setSnackbar({ open: true, message: 'Worker updated successfully', severity: 'success' });
    } else {
      // Add new worker
      const newWorker = {
        id: String(workers.length + 1),
        name: workerForm.name,
        email: workerForm.email,
        username: workerForm.username,
        password: workerForm.password,
        role: workerForm.role,
        permissions: workerForm.permissions,
        status: 'active' as const,
      };
      setWorkers([...workers, newWorker]);
      setSnackbar({ open: true, message: 'Worker added successfully', severity: 'success' });
    }
    handleCloseWorkerDialog();
  };

  const handleDeleteWorker = (workerId: string) => {
    setWorkers(workers.filter(w => w.id !== workerId));
    setSnackbar({ open: true, message: 'Worker deleted successfully', severity: 'success' });
  };

  const handleToggleWorkerStatus = (workerId: string) => {
    setWorkers(workers.map(w => 
      w.id === workerId ? { ...w, status: w.status === 'active' ? 'inactive' : 'active' } : w
    ));
    setSnackbar({ open: true, message: 'Worker status updated', severity: 'success' });
  };

  const handleOpenPasswordDialog = (worker: any) => {
    setPasswordForm({
      workerId: worker.id,
      workerName: worker.name,
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordDialogOpen(true);
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setPasswordForm({
      workerId: '',
      workerName: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleResetPassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbar({ open: true, message: 'Passwords do not match', severity: 'error' });
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setSnackbar({ open: true, message: 'Password must be at least 8 characters', severity: 'error' });
      return;
    }
    // In production, this would call an API to update the password
    setSnackbar({ open: true, message: `Password reset successfully for ${passwordForm.workerName}`, severity: 'success' });
    handleClosePasswordDialog();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Settings
      </Typography>

      <Paper elevation={0} sx={{ borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab icon={<Person />} label="Profile" iconPosition="start" />
            <Tab icon={<Notifications />} label="Notifications" iconPosition="start" />
            <Tab icon={<Security />} label="Security" iconPosition="start" />
            <Tab icon={<Agriculture />} label="Farm Preferences" iconPosition="start" />
            {user?.role === 'manager' && (
              <Tab icon={<People />} label="User Management" iconPosition="start" />
            )}
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4} {...{} as any}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar sx={{ width: 120, height: 120, margin: '0 auto 16px' }}>
                    {profile.name?.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase()}
                  </Avatar>
                  <IconButton color="primary" component="label">
                    <PhotoCamera />
                    <input hidden accept="image/*" type="file" />
                  </IconButton>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Upload new photo
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={8} {...{} as any}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                />
                <TextField
                  fullWidth
                  label="Phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select value={profile.role} label="Role" disabled>
                    <MenuItem value="worker">Worker</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button variant="contained" startIcon={<Save />} onClick={handleSaveProfile} disabled={loading}>
                    Save Changes
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>Notification Channels</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              <FormControlLabel
                control={<Switch checked={notifications.emailNotifications} onChange={(e) => setNotifications({ ...notifications, emailNotifications: e.target.checked })} />}
                label="Email Notifications"
              />
              <FormControlLabel
                control={<Switch checked={notifications.pushNotifications} onChange={(e) => setNotifications({ ...notifications, pushNotifications: e.target.checked })} />}
                label="Push Notifications"
              />
              <FormControlLabel
                control={<Switch checked={notifications.smsNotifications} onChange={(e) => setNotifications({ ...notifications, smsNotifications: e.target.checked })} />}
                label="SMS Notifications"
              />
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Alert Types</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              <FormControlLabel
                control={<Switch checked={notifications.weatherAlerts} onChange={(e) => setNotifications({ ...notifications, weatherAlerts: e.target.checked })} />}
                label="Weather Alerts"
              />
              <FormControlLabel
                control={<Switch checked={notifications.livestockAlerts} onChange={(e) => setNotifications({ ...notifications, livestockAlerts: e.target.checked })} />}
                label="Livestock Health Alerts"
              />
              <FormControlLabel
                control={<Switch checked={notifications.irrigationAlerts} onChange={(e) => setNotifications({ ...notifications, irrigationAlerts: e.target.checked })} />}
                label="Irrigation System Alerts"
              />
              <FormControlLabel
                control={<Switch checked={notifications.taskReminders} onChange={(e) => setNotifications({ ...notifications, taskReminders: e.target.checked })} />}
                label="Task Reminders"
              />
              <FormControlLabel
                control={<Switch checked={notifications.systemUpdates} onChange={(e) => setNotifications({ ...notifications, systemUpdates: e.target.checked })} />}
                label="System Updates"
              />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" startIcon={<Save />} onClick={handleSaveNotifications}>
                Save Preferences
              </Button>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>Change Password</Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Password must be at least 8 characters long and contain letters and numbers.
            </Alert>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={security.currentPassword}
                onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={security.newPassword}
                onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={security.confirmPassword}
                onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="contained" onClick={handleChangePassword} disabled={loading || !security.currentPassword || !security.newPassword}>
                  Change Password
                </Button>
              </Box>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="h6" gutterBottom>Units & Measurements</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Temperature Unit</InputLabel>
                <Select 
                  value={farmPrefs.temperatureUnit} 
                  label="Temperature Unit" 
                  onChange={(e) => setFarmPrefs({ ...farmPrefs, temperatureUnit: e.target.value as 'celsius' | 'fahrenheit' })}
                >
                  <MenuItem value="celsius">Celsius (°C)</MenuItem>
                  <MenuItem value="fahrenheit">Fahrenheit (°F)</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Area Unit</InputLabel>
                <Select 
                  value={farmPrefs.areaUnit} 
                  label="Area Unit" 
                  onChange={(e) => setFarmPrefs({ ...farmPrefs, areaUnit: e.target.value as 'hectares' | 'acres' })}
                >
                  <MenuItem value="hectares">Hectares (ha)</MenuItem>
                  <MenuItem value="acres">Acres (ac)</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select 
                  value={farmPrefs.currency} 
                  label="Currency" 
                  onChange={(e) => setFarmPrefs({ ...farmPrefs, currency: e.target.value })}
                >
                  <MenuItem value="USD">USD ($)</MenuItem>
                  <MenuItem value="EUR">EUR (€)</MenuItem>
                  <MenuItem value="GBP">GBP (£)</MenuItem>
                  <MenuItem value="KES">KES (KSh)</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>Regional Settings</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Timezone</InputLabel>
                <Select value={farmPrefs.timezone} label="Timezone" onChange={(e) => setFarmPrefs({ ...farmPrefs, timezone: e.target.value })}>
                  <MenuItem value="UTC">UTC</MenuItem>
                  <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                  <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                  <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                  <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                  <MenuItem value="Africa/Nairobi">East Africa Time (EAT)</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select value={farmPrefs.language} label="Language" onChange={(e) => setFarmPrefs({ ...farmPrefs, language: e.target.value })}>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="sw">Swahili</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Date Format</InputLabel>
                <Select value={farmPrefs.dateFormat} label="Date Format" onChange={(e) => setFarmPrefs({ ...farmPrefs, dateFormat: e.target.value })}>
                  <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (US)</MenuItem>
                  <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (EU)</MenuItem>
                  <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="contained" startIcon={<Save />} onClick={handleSaveFarmPrefs}>
                Save Preferences
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {user?.role === 'manager' && (
          <TabPanel value={tabValue} index={4}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Worker Accounts</Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenWorkerDialog()}
                >
                  Add Worker
                </Button>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Username</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Permissions</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {workers.map((worker) => (
                      <TableRow key={worker.id}>
                        <TableCell>{worker.name}</TableCell>
                        <TableCell>{worker.email}</TableCell>
                        <TableCell>{worker.username}</TableCell>
                        <TableCell>
                          <Chip 
                            label={worker.role} 
                            size="small" 
                            color={worker.role === 'manager' ? 'primary' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {(worker.permissions || []).length > 0 ? (
                              worker.permissions.map((perm) => (
                                <Chip key={perm} label={perm} size="small" variant="outlined" />
                              ))
                            ) : (
                              <Typography variant="caption" color="text.secondary">No permissions</Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={worker.status}
                            size="small"
                            color={worker.status === 'active' ? 'success' : 'default'}
                            onClick={() => handleToggleWorkerStatus(worker.id)}
                            sx={{ cursor: 'pointer' }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenWorkerDialog(worker)}
                            title="Edit Worker"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleOpenPasswordDialog(worker)}
                            title="Reset Password"
                          >
                            <LockReset />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteWorker(worker.id)}
                            title="Delete Worker"
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </TabPanel>
        )}
      </Paper>

      {/* Worker Dialog */}
      <Dialog open={workerDialogOpen} onClose={handleCloseWorkerDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingWorker ? 'Edit Worker' : 'Add New Worker'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Full Name"
              value={workerForm.name}
              onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={workerForm.email}
              onChange={(e) => setWorkerForm({ ...workerForm, email: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Username"
              value={workerForm.username}
              onChange={(e) => setWorkerForm({ ...workerForm, username: e.target.value })}
              required
              helperText="Worker will use this username to login"
            />
            <TextField
              fullWidth
              label={editingWorker ? 'New Password (leave blank to keep current)' : 'Password'}
              type="password"
              value={workerForm.password}
              onChange={(e) => setWorkerForm({ ...workerForm, password: e.target.value })}
              required={!editingWorker}
              helperText="Minimum 8 characters"
            />
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={workerForm.role}
                label="Role"
                onChange={(e) => setWorkerForm({ ...workerForm, role: e.target.value })}
              >
                <MenuItem value="worker">Worker</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Permissions</InputLabel>
              <Select
                multiple
                value={workerForm.permissions}
                label="Permissions"
                onChange={(e) => setWorkerForm({ ...workerForm, permissions: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="crops">Crop Management</MenuItem>
                <MenuItem value="animals">Animal Management</MenuItem>
                <MenuItem value="equipment">Equipment Management</MenuItem>
                <MenuItem value="financial">Financial Access</MenuItem>
                <MenuItem value="reports">View Reports</MenuItem>
                <MenuItem value="settings">Edit Settings</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWorkerDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveWorker}
            disabled={!workerForm.name || !workerForm.email || !workerForm.username || (!editingWorker && !workerForm.password)}
          >
            {editingWorker ? 'Update' : 'Add'} Worker
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={handleClosePasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Reset Password for {passwordForm.workerName}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Alert severity="info">
              Set a new password for this worker. They will use this password along with their username to login.
            </Alert>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
              helperText="Minimum 8 characters"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
              error={passwordForm.confirmPassword !== '' && passwordForm.newPassword !== passwordForm.confirmPassword}
              helperText={
                passwordForm.confirmPassword !== '' && passwordForm.newPassword !== passwordForm.confirmPassword
                  ? 'Passwords do not match'
                  : ''
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleResetPassword}
            disabled={!passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
          >
            Reset Password
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SettingsPage;
