import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Stack,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Pets as PetsIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminManagementPortal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { users } = useSelector((state: RootState) => state.users);
  const { animals } = useSelector((state: RootState) => state.animals);
  const { tasks } = useSelector((state: RootState) => state.tasks);

  const [currentTab, setCurrentTab] = useState(0);
  const [taskDialog, setTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '',
    dueDate: '',
    type: 'general',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleCreateTask = async () => {
    try {
      // Dispatch create task action here
      setSnackbar({ open: true, message: 'Task created successfully', severity: 'success' });
      setTaskDialog(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        assignedTo: '',
        dueDate: '',
        type: 'general',
      });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to create task', severity: 'error' });
    }
  };

  const workers = users?.filter(u => u.role === 'worker') || [];
  const managers = users?.filter(u => u.role === 'manager') || [];
  const activeTasks = tasks?.filter(t => t.status === 'pending' || t.status === 'in-progress') || [];
  const overdueTasks = tasks?.filter(t => t.status === 'overdue') || [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Admin Management Portal
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your farm operations, users, and system settings
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={handleTabChange}>
          <Tab label="Task Management" icon={<AssignmentIcon />} />
          <Tab label="User Management" icon={<PeopleIcon />} />
          <Tab label="Animal Management" icon={<PetsIcon />} />
          <Tab label="Settings" icon={<SettingsIcon />} />
        </Tabs>
      </Box>

      {/* Task Management Tab */}
      <TabPanel value={currentTab} index={0}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Task Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setTaskDialog(true)}
          >
            Create New Task
          </Button>
        </Box>

        <Stack spacing={3}>
          {/* Task Statistics */}
          <Box display="flex" gap={2} flexWrap="wrap">
            <Card sx={{ minWidth: 200, flex: 1 }}>
              <CardContent>
                <Typography variant="h6" color="primary">Active Tasks</Typography>
                <Typography variant="h3">{activeTasks.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Currently in progress
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ minWidth: 200, flex: 1 }}>
              <CardContent>
                <Typography variant="h6" color="warning.main">Overdue Tasks</Typography>
                <Typography variant="h3" color="warning.main">{overdueTasks.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Require immediate attention
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ minWidth: 200, flex: 1 }}>
              <CardContent>
                <Typography variant="h6" color="success.main">Workers Active</Typography>
                <Typography variant="h3">{workers.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Available for assignment
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Recent Tasks */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Tasks</Typography>
              <List>
                {tasks?.slice(0, 5).map((task) => (
                  <ListItem key={task.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ 
                        bgcolor: 
                          task.priority === 'high' ? 'error.main' :
                          task.priority === 'medium' ? 'warning.main' : 'success.main'
                      }}>
                        <AssignmentIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={task.title}
                      secondary={`Assigned to: ${task.assignedTo} • Due: ${new Date(task.dueDate).toLocaleDateString()}`}
                    />
                    <Chip
                      label={task.status}
                      size="small"
                      color={
                        task.status === 'completed' ? 'success' :
                        task.status === 'overdue' ? 'error' : 'primary'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Stack>
      </TabPanel>

      {/* User Management Tab */}
      <TabPanel value={currentTab} index={1}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">User Management</Typography>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add New User
          </Button>
        </Box>

        <Stack spacing={3}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Card sx={{ minWidth: 300, flex: 1 }}>
              <CardContent>
                <Typography variant="h6">Farm Workers ({workers.length})</Typography>
                <List>
                  {workers.slice(0, 3).map((worker) => (
                    <ListItem key={worker.uid}>
                      <ListItemAvatar>
                        <Avatar>{worker.name.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={worker.name} secondary={worker.email} />
                      <ListItemSecondaryAction>
                        <IconButton edge="end">
                          <EditIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>

            <Card sx={{ minWidth: 300, flex: 1 }}>
              <CardContent>
                <Typography variant="h6">Managers ({managers.length})</Typography>
                <List>
                  {managers.slice(0, 3).map((manager) => (
                    <ListItem key={manager.uid}>
                      <ListItemAvatar>
                        <Avatar>{manager.name.charAt(0)}</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={manager.name} secondary={manager.email} />
                      <ListItemSecondaryAction>
                        <IconButton edge="end">
                          <EditIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        </Stack>
      </TabPanel>

      {/* Animal Management Tab */}
      <TabPanel value={currentTab} index={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5">Animal Management</Typography>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add New Animal
          </Button>
        </Box>

        <Stack spacing={3}>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Card sx={{ minWidth: 150, flex: 1 }}>
              <CardContent>
                <Typography variant="h6">Total Animals</Typography>
                <Typography variant="h3" color="primary">{animals?.length || 0}</Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ minWidth: 150, flex: 1 }}>
              <CardContent>
                <Typography variant="h6">Healthy</Typography>
                <Typography variant="h3" color="success.main">
                  {animals?.filter(a => a.healthStatus === 'healthy').length || 0}
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ minWidth: 150, flex: 1 }}>
              <CardContent>
                <Typography variant="h6">Need Attention</Typography>
                <Typography variant="h3" color="warning.main">
                  {animals?.filter(a => a.healthStatus === 'sick' || a.healthStatus === 'treatment').length || 0}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Animal Inventory</Typography>
              <List>
                {animals?.slice(0, 10).map((animal) => (
                  <ListItem key={animal.id}>
                    <ListItemAvatar>
                      <Avatar><PetsIcon /></Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${animal.name} (${animal.species})`}
                      secondary={`${animal.breed} • ${animal.location}`}
                    />
                    <Chip
                      label={animal.healthStatus}
                      size="small"
                      color={
                        animal.healthStatus === 'healthy' ? 'success' :
                        animal.healthStatus === 'sick' ? 'error' :
                        animal.healthStatus === 'treatment' ? 'warning' : 'default'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Stack>
      </TabPanel>

      {/* Settings Tab */}
      <TabPanel value={currentTab} index={3}>
        <Typography variant="h5" gutterBottom>Farm Settings</Typography>
        
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>General Settings</Typography>
              <Stack spacing={2}>
                <TextField fullWidth label="Farm Name" defaultValue="Green Valley Farm" />
                <TextField fullWidth label="Farm Address" defaultValue="123 Farm Road" />
                <TextField fullWidth label="Contact Phone" defaultValue="+1-555-0123" />
                <TextField fullWidth label="Contact Email" defaultValue="admin@farm.com" />
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Notification Settings</Typography>
              <Stack spacing={1}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Email notifications for critical alerts"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="SMS notifications for urgent tasks"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Daily summary reports"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Animal health alerts"
                />
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Send Broadcast Message</Typography>
              <Stack spacing={2}>
                <TextField fullWidth label="Message Title" />
                <TextField fullWidth label="Message Content" multiline rows={4} />
                <FormControl fullWidth>
                  <InputLabel>Recipient Group</InputLabel>
                  <Select defaultValue="all">
                    <MenuItem value="all">All Users</MenuItem>
                    <MenuItem value="workers">Workers Only</MenuItem>
                    <MenuItem value="managers">Managers Only</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="contained" startIcon={<SendIcon />}>
                  Send Notification
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </TabPanel>

      {/* Create Task Dialog */}
      <Dialog open={taskDialog} onClose={() => setTaskDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                >
                  {workers.map((worker) => (
                    <MenuItem key={worker.uid} value={worker.uid}>
                      {worker.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Task Type</InputLabel>
                <Select
                  value={newTask.type}
                  onChange={(e) => setNewTask({ ...newTask, type: e.target.value })}
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="animal_care">Animal Care</MenuItem>
                  <MenuItem value="crop_management">Crop Management</MenuItem>
                  <MenuItem value="equipment">Equipment</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTask} variant="contained">
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

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

export default AdminManagementPortal;