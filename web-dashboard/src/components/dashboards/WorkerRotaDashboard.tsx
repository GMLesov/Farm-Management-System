import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Select,
  FormControl,
  InputLabel,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  Assignment as TaskIcon,
  CheckCircle as ApproveIcon,
  Cancel as DenyIcon,
  Pending as PendingIcon,
  Event as LeaveIcon,
  SwapHoriz as SwapIcon,
  CheckCircle
} from '@mui/icons-material';

interface Worker {
  id: number;
  name: string;
  role: string;
  avatar: string;
}

interface TaskAllocation {
  id: number;
  workerId: number;
  workerName: string;
  task: string;
  date: string;
  shift: 'morning' | 'afternoon' | 'night';
  status: 'assigned' | 'completed' | 'pending';
}

interface LeaveRequest {
  id: number;
  workerId: number;
  workerName: string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'denied';
  submittedDate: string;
}

const WorkerRotaDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Team Schedule Data - Who is on/off
  const teamSchedule = [
    { id: 1, name: 'John Doe', date: '2025-11-14', shift: 'Morning (7AM-3PM)', status: 'on' },
    { id: 2, name: 'Jane Smith', date: '2025-11-14', shift: 'Morning (7AM-3PM)', status: 'on' },
    { id: 3, name: 'Mike Johnson', date: '2025-11-14', shift: 'Afternoon (3PM-11PM)', status: 'on' },
    { id: 4, name: 'Sarah Williams', date: '2025-11-14', shift: 'Off - Annual Leave', status: 'off' },
    { id: 5, name: 'Tom Brown', date: '2025-11-14', shift: 'Morning (7AM-3PM)', status: 'on' },
    { id: 6, name: 'John Doe', date: '2025-11-15', shift: 'Afternoon (3PM-11PM)', status: 'on' },
    { id: 7, name: 'Jane Smith', date: '2025-11-15', shift: 'Off - Rest Day', status: 'off' },
    { id: 8, name: 'Mike Johnson', date: '2025-11-15', shift: 'Morning (7AM-3PM)', status: 'on' },
    { id: 9, name: 'Sarah Williams', date: '2025-11-15', shift: 'Morning (7AM-3PM)', status: 'on' },
    { id: 10, name: 'Tom Brown', date: '2025-11-15', shift: 'Off - Rest Day', status: 'off' },
    { id: 11, name: 'John Doe', date: '2025-11-16', shift: 'Off - Rest Day', status: 'off' },
    { id: 12, name: 'Jane Smith', date: '2025-11-16', shift: 'Morning (7AM-3PM)', status: 'on' },
    { id: 13, name: 'Mike Johnson', date: '2025-11-16', shift: 'Afternoon (3PM-11PM)', status: 'on' },
    { id: 14, name: 'Sarah Williams', date: '2025-11-16', shift: 'Morning (7AM-3PM)', status: 'on' },
    { id: 15, name: 'Tom Brown', date: '2025-11-16', shift: 'Morning (7AM-3PM)', status: 'on' },
    { id: 16, name: 'John Doe', date: '2025-11-17', shift: 'Morning (7AM-3PM)', status: 'on' },
    { id: 17, name: 'Jane Smith', date: '2025-11-17', shift: 'Afternoon (3PM-11PM)', status: 'on' },
    { id: 18, name: 'Mike Johnson', date: '2025-11-17', shift: 'Off - Rest Day', status: 'off' },
    { id: 19, name: 'Sarah Williams', date: '2025-11-17', shift: 'Morning (7AM-3PM)', status: 'on' },
    { id: 20, name: 'Tom Brown', date: '2025-11-17', shift: 'Morning (7AM-3PM)', status: 'on' },
  ];

  const workers: Worker[] = [
    { id: 1, name: 'John Doe', role: 'Farm Worker', avatar: 'JD' },
    { id: 2, name: 'Jane Smith', role: 'Livestock Manager', avatar: 'JS' },
    { id: 3, name: 'Mike Johnson', role: 'Crop Specialist', avatar: 'MJ' },
    { id: 4, name: 'Sarah Williams', role: 'Equipment Operator', avatar: 'SW' },
    { id: 5, name: 'Tom Brown', role: 'Farm Worker', avatar: 'TB' }
  ];

  const [taskAllocations, setTaskAllocations] = useState<TaskAllocation[]>([
    { id: 1, workerId: 1, workerName: 'John Doe', task: 'Feed Cattle - Barn A', date: '2025-11-14', shift: 'morning', status: 'assigned' },
    { id: 2, workerId: 1, workerName: 'John Doe', task: 'Irrigate Field 3', date: '2025-11-14', shift: 'afternoon', status: 'assigned' },
    { id: 3, workerId: 2, workerName: 'Jane Smith', task: 'Health Check - Dairy Cows', date: '2025-11-14', shift: 'morning', status: 'completed' },
    { id: 4, workerId: 3, workerName: 'Mike Johnson', task: 'Apply Fertilizer - Field 5', date: '2025-11-14', shift: 'morning', status: 'pending' },
    { id: 5, workerId: 4, workerName: 'Sarah Williams', task: 'Tractor Maintenance', date: '2025-11-14', shift: 'afternoon', status: 'assigned' },
    { id: 6, workerId: 5, workerName: 'Tom Brown', task: 'Harvest Wheat - Field 2', date: '2025-11-14', shift: 'morning', status: 'assigned' }
  ]);

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    { id: 1, workerId: 1, workerName: 'John Doe', type: 'Vacation', startDate: '2025-12-20', endDate: '2025-12-25', reason: 'Holiday', status: 'pending', submittedDate: '2025-11-13' },
    { id: 2, workerId: 2, workerName: 'Jane Smith', type: 'Sick Leave', startDate: '2025-11-10', endDate: '2025-11-11', reason: 'Flu', status: 'approved', submittedDate: '2025-11-09' },
    { id: 3, workerId: 3, workerName: 'Mike Johnson', type: 'Personal', startDate: '2025-11-18', endDate: '2025-11-19', reason: 'Family event', status: 'pending', submittedDate: '2025-11-14' }
  ]);

  const [newTask, setNewTask] = useState({
    workerId: 0,
    task: '',
    date: selectedDate,
    shift: 'morning' as 'morning' | 'afternoon' | 'night'
  });

  const handleAddTask = () => {
    if (!newTask.workerId || !newTask.task) return;
    
    const worker = workers.find(w => w.id === newTask.workerId);
    const task: TaskAllocation = {
      id: taskAllocations.length + 1,
      workerId: newTask.workerId,
      workerName: worker?.name || '',
      task: newTask.task,
      date: newTask.date,
      shift: newTask.shift,
      status: 'assigned'
    };
    
    setTaskAllocations([...taskAllocations, task]);
    setOpenTaskDialog(false);
    setNewTask({ workerId: 0, task: '', date: selectedDate, shift: 'morning' });
  };

  const handleLeaveAction = (id: number, action: 'approved' | 'denied') => {
    setLeaveRequests(leaveRequests.map(req =>
      req.id === id ? { ...req, status: action } : req
    ));
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'morning': return 'primary';
      case 'afternoon': return 'warning';
      case 'night': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'assigned': return 'info';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getLeaveStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'denied': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const todaysTasks = taskAllocations.filter(t => t.date === selectedDate);
  const pendingLeaves = leaveRequests.filter(r => r.status === 'pending');

  const renderTeamSchedule = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>Worker Rota</Typography>
        <TextField
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          size="small"
          label="Select Date"
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      {/* Schedule for next 3 days */}
      <Grid container spacing={3}>
        {['2025-11-14', '2025-11-15', '2025-11-16', '2025-11-17'].map((date) => (
          <Grid size={{ xs: 12, md: 6 }} key={date}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, color: 'primary.main' }}>
                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </Typography>

              {/* Workers On Duty */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="success.main" fontWeight="bold" sx={{ mb: 1 }}>
                  ✓ On Duty ({teamSchedule.filter(s => s.date === date && s.status === 'on').length})
                </Typography>
                <List sx={{ p: 0 }}>
                  {teamSchedule.filter(s => s.date === date && s.status === 'on').map((schedule) => (
                    <Paper key={schedule.id} elevation={0} sx={{ mb: 1, p: 1.5, bgcolor: 'success.50' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'success.main' }}>
                          {schedule.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {schedule.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {schedule.shift}
                          </Typography>
                        </Box>
                        <CheckCircle sx={{ color: 'success.main' }} />
                      </Box>
                    </Paper>
                  ))}
                </List>
              </Box>

              {/* Workers Off Duty */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" sx={{ mb: 1 }}>
                  ✕ Off Duty ({teamSchedule.filter(s => s.date === date && s.status === 'off').length})
                </Typography>
                <List sx={{ p: 0 }}>
                  {teamSchedule.filter(s => s.date === date && s.status === 'off').map((schedule) => (
                    <Paper key={schedule.id} elevation={0} sx={{ mb: 1, p: 1.5, bgcolor: 'grey.100' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'grey.400' }}>
                          {schedule.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2">
                            {schedule.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {schedule.shift}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))}
                </List>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Summary Card */}
      <Card sx={{ mt: 3, bgcolor: 'primary.50' }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            📊 Staffing Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h4" color="success.main">
                {teamSchedule.filter(s => s.status === 'on').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">Total On-Duty Shifts</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h4" color="text.secondary">
                {teamSchedule.filter(s => s.status === 'off').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">Total Off-Duty</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h4" color="primary.main">
                {workers.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">Total Workers</Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="h4" color="info.main">
                100%
              </Typography>
              <Typography variant="caption" color="text.secondary">Coverage Rate</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );

  const renderTaskAllocation = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            size="small"
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label="Daily"
              color={viewMode === 'daily' ? 'primary' : 'default'}
              onClick={() => setViewMode('daily')}
            />
            <Chip
              label="Weekly"
              color={viewMode === 'weekly' ? 'primary' : 'default'}
              onClick={() => setViewMode('weekly')}
            />
            <Chip
              label="Monthly"
              color={viewMode === 'monthly' ? 'primary' : 'default'}
              onClick={() => setViewMode('monthly')}
            />
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenTaskDialog(true)}
        >
          Assign Task
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary.main">{todaysTasks.length}</Typography>
              <Typography variant="body2" color="text.secondary">Total Tasks Today</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="success.main">
                {todaysTasks.filter(t => t.status === 'completed').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Completed</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="info.main">
                {todaysTasks.filter(t => t.status === 'assigned').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">In Progress</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="warning.main">
                {todaysTasks.filter(t => t.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Pending</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Task Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Worker</TableCell>
              <TableCell>Task</TableCell>
              <TableCell>Shift</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {todaysTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {task.workerName.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    {task.workerName}
                  </Box>
                </TableCell>
                <TableCell>{task.task}</TableCell>
                <TableCell>
                  <Chip label={task.shift} size="small" color={getShiftColor(task.shift)} />
                </TableCell>
                <TableCell>{new Date(task.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip label={task.status} size="small" color={getStatusColor(task.status)} />
                </TableCell>
                <TableCell>
                  <IconButton size="small" color="primary">
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderLeaveManagement = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Leave Requests</Typography>
        <Badge badgeContent={pendingLeaves.length} color="error">
          <Chip icon={<PendingIcon />} label="Pending Approvals" color="warning" />
        </Badge>
      </Box>

      <Grid container spacing={3}>
        {/* Pending Requests */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Pending Requests ({pendingLeaves.length})
            </Typography>
            <List>
              {leaveRequests.filter(r => r.status === 'pending').map((request) => (
                <Paper key={request.id} elevation={0} sx={{ mb: 2, p: 2, bgcolor: 'warning.50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'start', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      {request.workerName.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {request.workerName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {request.type}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        <strong>Reason:</strong> {request.reason}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Submitted: {new Date(request.submittedDate).toLocaleDateString()}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<ApproveIcon />}
                          onClick={() => handleLeaveAction(request.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DenyIcon />}
                          onClick={() => handleLeaveAction(request.id, 'denied')}
                        >
                          Deny
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              ))}
              {pendingLeaves.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 3 }}>
                  No pending leave requests
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Approved/Denied Requests */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Recent Decisions
            </Typography>
            <List>
              {leaveRequests.filter(r => r.status !== 'pending').map((request) => (
                <ListItem key={request.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: request.status === 'approved' ? 'success.main' : 'error.main' }}>
                      {request.workerName.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={request.workerName}
                    secondary={
                      <>
                        {request.type} • {new Date(request.startDate).toLocaleDateString()}
                        <Chip
                          label={request.status}
                          size="small"
                          color={getLeaveStatusColor(request.status)}
                          sx={{ ml: 1 }}
                        />
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
        <Tab label="Team Schedule" icon={<CalendarIcon />} iconPosition="start" />
        <Tab label="Task Allocation" icon={<TaskIcon />} iconPosition="start" />
        <Tab 
          label="Leave Requests" 
          icon={
            <Badge badgeContent={pendingLeaves.length} color="error">
              <LeaveIcon />
            </Badge>
          } 
          iconPosition="start" 
        />
      </Tabs>

      {tabValue === 0 && renderTeamSchedule()}
      {tabValue === 1 && renderTaskAllocation()}
      {tabValue === 2 && renderLeaveManagement()}

      {/* Add Task Dialog */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign New Task</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Select Worker</InputLabel>
            <Select
              value={newTask.workerId}
              onChange={(e) => setNewTask({ ...newTask, workerId: Number(e.target.value) })}
              label="Select Worker"
            >
              {workers.map((worker) => (
                <MenuItem key={worker.id} value={worker.id}>
                  {worker.name} - {worker.role}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Task Description"
            value={newTask.task}
            onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            type="date"
            label="Date"
            value={newTask.date}
            onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <FormControl fullWidth>
            <InputLabel>Shift</InputLabel>
            <Select
              value={newTask.shift}
              onChange={(e) => setNewTask({ ...newTask, shift: e.target.value as 'morning' | 'afternoon' | 'night' })}
              label="Shift"
            >
              <MenuItem value="morning">Morning</MenuItem>
              <MenuItem value="afternoon">Afternoon</MenuItem>
              <MenuItem value="night">Night</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddTask}>
            Assign Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkerRotaDashboard;
