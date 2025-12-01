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
  Avatar,
  Switch,
  FormControlLabel,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Person,
  Work,
  Security,
  Edit,
  Delete,
  Visibility,
  VisibilityOff,
  Badge,
  Schedule,
  AttachMoney,
  Phone,
  Email,
  LocationOn,
  CheckCircle,
  Cancel,
  Warning,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';
import ResetPasswordDialog from '../dialogs/ResetPasswordDialog';

interface Worker {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'manager' | 'supervisor' | 'worker' | 'technician';
  department: string;
  hireDate: string;
  status: 'active' | 'inactive' | 'on-leave';
  avatar?: string;
  address: string;
  salary: number;
  username: string;
  hasLogin: boolean;
  password?: string;
  confirmPassword?: string;
  lastLogin?: string;
  permissions: string[];
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
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const WorkerManagementDashboard: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ open: boolean; worker: Worker | null }>({
    open: false,
    worker: null,
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState<Partial<Worker>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'worker',
    department: '',
    address: '',
    salary: 0,
    username: '',
    hasLogin: false,
    permissions: [],
  });

  // Sample data
  useEffect(() => {
    const sampleWorkers: Worker[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@farm.com',
        phone: '+1-555-0101',
        role: 'manager',
        department: 'Operations',
        hireDate: '2023-01-15',
        status: 'active',
        address: '123 Farm Road, Rural County',
        salary: 65000,
        username: 'jsmith',
        hasLogin: true,
        lastLogin: '2024-11-02',
        permissions: ['admin', 'reports', 'workers', 'finances'],
      },
      {
        id: '2',
        firstName: 'Maria',
        lastName: 'Garcia',
        email: 'maria.garcia@farm.com',
        phone: '+1-555-0102',
        role: 'supervisor',
        department: 'Crops',
        hireDate: '2023-03-20',
        status: 'active',
        address: '456 Field Lane, Rural County',
        salary: 45000,
        username: 'mgarcia',
        hasLogin: true,
        lastLogin: '2024-11-03',
        permissions: ['crops', 'workers'],
      },
      {
        id: '3',
        firstName: 'David',
        lastName: 'Johnson',
        email: 'david.johnson@farm.com',
        phone: '+1-555-0103',
        role: 'technician',
        department: 'Equipment',
        hireDate: '2023-06-10',
        status: 'active',
        address: '789 Barn Street, Rural County',
        salary: 40000,
        username: 'djohnson',
        hasLogin: true,
        lastLogin: '2024-11-01',
        permissions: ['equipment', 'irrigation'],
      },
      {
        id: '4',
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@farm.com',
        phone: '+1-555-0104',
        role: 'worker',
        department: 'Livestock',
        hireDate: '2023-08-05',
        status: 'active',
        address: '321 Pasture Way, Rural County',
        salary: 35000,
        username: '',
        hasLogin: false,
        permissions: [],
      },
    ];
    setWorkers(sampleWorkers);
  }, []);

  const handleAddWorker = () => {
    setEditingWorker(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'worker',
      department: '',
      address: '',
      salary: 0,
      username: '',
      hasLogin: false,
      permissions: [],
    });
    setDialogOpen(true);
  };

  const handleEditWorker = (worker: Worker) => {
    setEditingWorker(worker);
    setFormData(worker);
    setDialogOpen(true);
  };

  const handleSaveWorker = () => {
    // Validate password if system login is enabled
    if (formData.hasLogin) {
      if (!editingWorker && !formData.password) {
        alert('Password is required when enabling system login');
        return;
      }
      if (formData.password && formData.password.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
    }

    if (editingWorker) {
      setWorkers(workers.map(w => w.id === editingWorker.id ? { ...formData, id: editingWorker.id } as Worker : w));
    } else {
      const newWorker: Worker = {
        ...formData,
        id: Date.now().toString(),
        hireDate: new Date().toISOString().split('T')[0],
        status: 'active',
      } as Worker;
      setWorkers([...workers, newWorker]);
    }
    setDialogOpen(false);
  };

  const handleDeleteWorker = (id: string) => {
    setWorkers(workers.filter(w => w.id !== id));
  };

  const handleResetPassword = (workerId: string, newPassword: string) => {
    // Update worker with new password (in production, this would call API)
    setWorkers(workers.map(w => 
      w.id === workerId 
        ? { ...w, hasLogin: true, username: w.username || w.email.split('@')[0] }
        : w
    ));
    setSuccessMessage(`Password reset successfully for ${resetPasswordDialog.worker?.firstName} ${resetPasswordDialog.worker?.lastName}`);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const openResetPasswordDialog = (worker: Worker) => {
    setResetPasswordDialog({ open: true, worker });
  };

  const closeResetPasswordDialog = () => {
    setResetPasswordDialog({ open: false, worker: null });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'error';
      case 'supervisor': return 'warning';
      case 'technician': return 'info';
      default: return 'primary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle color="success" />;
      case 'inactive': return <Cancel color="error" />;
      case 'on-leave': return <Warning color="warning" />;
      default: return <Cancel />;
    }
  };

  const activeWorkers = workers.filter(w => w.status === 'active').length;
  const workersWithLogin = workers.filter(w => w.hasLogin).length;
  const totalSalaries = workers.reduce((sum, w) => sum + w.salary, 0);
  const avgSalary = workers.length > 0 ? totalSalaries / workers.length : 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Main Heading */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>
        Worker Management
      </Typography>
      <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
        Manage worker profiles, roles, and assignments.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddWorker}
        >
          Add New Worker
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Person sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Total Workers</Typography>
            </Box>
            <Typography variant="h3" color="primary">
              {workers.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active employees
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
              <Typography variant="h6">Active Workers</Typography>
            </Box>
            <Typography variant="h3" color="success.main">
              {activeWorkers}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Currently working
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Security sx={{ mr: 1, color: 'info.main' }} />
              <Typography variant="h6">With Login Access</Typography>
            </Box>
            <Typography variant="h3" color="info.main">
              {workersWithLogin}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              System users
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1, minWidth: 200 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AttachMoney sx={{ mr: 1, color: 'warning.main' }} />
              <Typography variant="h6">Avg Salary</Typography>
            </Box>
            <Typography variant="h3" color="warning.main">
              ${avgSalary.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Per year
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Worker Management Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab icon={<Person />} label="All Workers" />
            <Tab icon={<Security />} label="Login Management" />
            <Tab icon={<Work />} label="Roles & Permissions" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Worker</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Hire Date</TableCell>
                  <TableCell>Salary</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {workers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>{worker.firstName[0]}{worker.lastName[0]}</Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {worker.firstName} {worker.lastName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {worker.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={worker.role} 
                        color={getRoleColor(worker.role) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{worker.department}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{worker.phone}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getStatusIcon(worker.status)}
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {worker.status}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{worker.hireDate}</TableCell>
                    <TableCell>${worker.salary.toLocaleString()}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleEditWorker(worker)} title="Edit Worker">
                        <Edit />
                      </IconButton>
                      {worker.hasLogin && (
                        <IconButton 
                          size="small" 
                          onClick={() => openResetPasswordDialog(worker)}
                          title="Reset Password"
                          color="warning"
                        >
                          <VpnKeyIcon />
                        </IconButton>
                      )}
                      <IconButton size="small" onClick={() => handleDeleteWorker(worker.id)} title="Delete Worker">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Login Access Management
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            Configure which workers have system login access and manage their credentials.
          </Alert>
          
          <List>
            {workers.map((worker, index) => (
              <React.Fragment key={worker.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar>{worker.firstName[0]}{worker.lastName[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${worker.firstName} ${worker.lastName}`}
                    secondary={worker.hasLogin ? `Username: ${worker.username}` : 'No login access'}
                  />
                  <ListItemSecondaryAction>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={worker.hasLogin}
                          onChange={(e) => {
                            const updatedWorkers = [...workers];
                            updatedWorkers[index].hasLogin = e.target.checked;
                            setWorkers(updatedWorkers);
                          }}
                        />
                      }
                      label="Login Access"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                {index < workers.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Roles & Permissions
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            To configure roles and permissions for a worker, edit their profile in the "Worker Details" tab and select a role from the dropdown.
          </Alert>
          <Alert severity="warning" sx={{ mb: 3 }}>
            Manage worker roles and their system permissions carefully. Role changes affect system access immediately.
          </Alert>

          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Card sx={{ flex: 1, minWidth: 300 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  Managers ({workers.filter(w => w.role === 'manager').length})
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Full system access, can manage all workers and operations
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip label="Admin Access" size="small" />
                  <Chip label="Financial Reports" size="small" />
                  <Chip label="Worker Management" size="small" />
                  <Chip label="System Settings" size="small" />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1, minWidth: 300 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="warning.main">
                  Supervisors ({workers.filter(w => w.role === 'supervisor').length})
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Department-specific management and worker oversight
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip label="Department Access" size="small" />
                  <Chip label="Worker Supervision" size="small" />
                  <Chip label="Basic Reports" size="small" />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1, minWidth: 300 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="info.main">
                  Technicians ({workers.filter(w => w.role === 'technician').length})
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Technical system access for equipment and maintenance
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip label="Equipment Control" size="small" />
                  <Chip label="Irrigation Systems" size="small" />
                  <Chip label="Maintenance Logs" size="small" />
                </Box>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1, minWidth: 300 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary.main">
                  Workers ({workers.filter(w => w.role === 'worker').length})
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Basic access for daily task management and updates
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <Chip label="Task Updates" size="small" />
                  <Chip label="Photo Upload" size="small" />
                  <Chip label="Basic Views" size="small" />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </Card>

      {/* Add/Edit Worker Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingWorker ? 'Edit Worker' : 'Add New Worker'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                fullWidth
              />
              <TextField
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                fullWidth
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
              />
              <TextField
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                fullWidth
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <MenuItem value="worker">Worker</MenuItem>
                  <MenuItem value="technician">Technician</MenuItem>
                  <MenuItem value="supervisor">Supervisor</MenuItem>
                  <MenuItem value="manager">Manager</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                fullWidth
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Permissions</InputLabel>
              <Select
                multiple
                value={formData.permissions || []}
                label="Permissions"
                onChange={(e) => setFormData({ ...formData, permissions: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value })}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(selected as string[]).map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="crops">Crops Management</MenuItem>
                <MenuItem value="animals">Animal Management</MenuItem>
                <MenuItem value="equipment">Equipment Management</MenuItem>
                <MenuItem value="irrigation">Irrigation Control</MenuItem>
                <MenuItem value="financial">Financial Access</MenuItem>
                <MenuItem value="reports">View Reports</MenuItem>
                <MenuItem value="workers">Manage Workers</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />

            <TextField
              label="Annual Salary"
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: parseInt(e.target.value) || 0 })}
              fullWidth
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.hasLogin}
                  onChange={(e) => setFormData({ ...formData, hasLogin: e.target.checked })}
                />
              }
              label="Enable System Login"
            />

            {formData.hasLogin && (
              <>
                <TextField
                  label="Username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  fullWidth
                  required
                  helperText="Username for system login access"
                />
                <TextField
                  label={editingWorker ? "New Password (leave blank to keep current)" : "Password"}
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  fullWidth
                  required={!editingWorker}
                  helperText="Minimum 8 characters"
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword || ''}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  fullWidth
                  required={!editingWorker}
                  error={Boolean(formData.confirmPassword && formData.password !== formData.confirmPassword)}
                  helperText={
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? "Passwords do not match"
                      : "Re-enter password to confirm"
                  }
                />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveWorker} variant="contained">
            {editingWorker ? 'Update' : 'Add'} Worker
          </Button>
        </DialogActions>
      </Dialog>

      <ResetPasswordDialog
        open={resetPasswordDialog.open}
        onClose={closeResetPasswordDialog}
        workerName={`${resetPasswordDialog.worker?.firstName || ''} ${resetPasswordDialog.worker?.lastName || ''}`}
        workerId={resetPasswordDialog.worker?.id || ''}
        onReset={handleResetPassword}
      />
    </Box>
  );
};

export default WorkerManagementDashboard;