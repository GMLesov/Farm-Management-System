import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Chip,
  Typography,
  List,
  ListItem,
  Avatar,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Assignment as TaskIcon,
  Person as PersonIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';

interface Worker {
  _id: string;
  name: string;
  username: string;
  avatar?: string;
}

interface BulkTaskData {
  title: string;
  description: string;
  type: string;
  priority: string;
  location: string;
  dueDate: string;
  estimatedDuration: number;
}

interface BulkTaskAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const BulkTaskAssignmentDialog: React.FC<BulkTaskAssignmentDialogProps> = ({
  open,
  onClose,
  onComplete
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<string[]>([]);
  const [taskData, setTaskData] = useState<BulkTaskData>({
    title: '',
    description: '',
    type: 'other',
    priority: 'medium',
    location: '',
    dueDate: new Date().toISOString().split('T')[0],
    estimatedDuration: 60
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const steps = ['Task Details', 'Select Workers', 'Review & Assign'];

  useEffect(() => {
    if (open) {
      fetchWorkers();
    }
  }, [open]);

  const fetchWorkers = async () => {
    try {
      const response = await fetch('/api/workers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setWorkers(data.workers.filter((w: any) => w.isActive));
      }
    } catch (err) {
      console.error('Failed to fetch workers:', err);
    }
  };

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleWorkerToggle = (workerId: string) => {
    setSelectedWorkers((prev) =>
      prev.includes(workerId)
        ? prev.filter((id) => id !== workerId)
        : [...prev, workerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedWorkers.length === workers.length) {
      setSelectedWorkers([]);
    } else {
      setSelectedWorkers(workers.map((w) => w._id));
    }
  };

  const handleAssign = async () => {
    setLoading(true);
    setError(null);

    try {
      const promises = selectedWorkers.map((workerId) =>
        fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            ...taskData,
            assignedTo: workerId
          })
        })
      );

      const responses = await Promise.all(promises);
      const failed = responses.filter((r) => !r.ok);

      if (failed.length > 0) {
        setError(`${failed.length} task(s) failed to create`);
      } else {
        setSuccess(true);
        setTimeout(() => {
          onComplete();
          handleClose();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setSelectedWorkers([]);
    setTaskData({
      title: '',
      description: '',
      type: 'other',
      priority: 'medium',
      location: '',
      dueDate: new Date().toISOString().split('T')[0],
      estimatedDuration: 60
    });
    setError(null);
    setSuccess(false);
    onClose();
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Task Title"
              fullWidth
              required
              value={taskData.title}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={taskData.description}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={taskData.type}
                  label="Type"
                  onChange={(e) => setTaskData({ ...taskData, type: e.target.value })}
                >
                  <MenuItem value="planting">Planting</MenuItem>
                  <MenuItem value="harvesting">Harvesting</MenuItem>
                  <MenuItem value="irrigation">Irrigation</MenuItem>
                  <MenuItem value="fertilizing">Fertilizing</MenuItem>
                  <MenuItem value="spraying">Spraying</MenuItem>
                  <MenuItem value="weeding">Weeding</MenuItem>
                  <MenuItem value="feeding">Feeding</MenuItem>
                  <MenuItem value="cleaning">Cleaning</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={taskData.priority}
                  label="Priority"
                  onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Location"
                fullWidth
                value={taskData.location}
                onChange={(e) => setTaskData({ ...taskData, location: e.target.value })}
              />

              <TextField
                label="Due Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={taskData.dueDate}
                onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
              />
            </Box>

            <TextField
              label="Estimated Duration (minutes)"
              type="number"
              fullWidth
              value={taskData.estimatedDuration}
              onChange={(e) => setTaskData({ ...taskData, estimatedDuration: parseInt(e.target.value) })}
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Select workers to assign this task to
              </Typography>
              <Button size="small" onClick={handleSelectAll}>
                {selectedWorkers.length === workers.length ? 'Deselect All' : 'Select All'}
              </Button>
            </Box>

            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {workers.map((worker) => (
                <ListItem
                  key={worker._id}
                  component="button"
                  onClick={() => handleWorkerToggle(worker._id)}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1
                  }}
                >
                  <Checkbox
                    checked={selectedWorkers.includes(worker._id)}
                    edge="start"
                  />
                  <Avatar src={worker.avatar} sx={{ mx: 2 }}>
                    {worker.name.charAt(0)}
                  </Avatar>
                  <ListItemText
                    primary={worker.name}
                    secondary={worker.username}
                  />
                </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 2 }}>
              <Chip
                label={`${selectedWorkers.length} worker(s) selected`}
                color="primary"
              />
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              You are about to create {selectedWorkers.length} identical task(s), one for each selected worker.
            </Alert>

            <Typography variant="h6" gutterBottom>
              Task Details
            </Typography>
            <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
              <Typography variant="body2"><strong>Title:</strong> {taskData.title}</Typography>
              <Typography variant="body2"><strong>Type:</strong> {taskData.type}</Typography>
              <Typography variant="body2"><strong>Priority:</strong> {taskData.priority}</Typography>
              <Typography variant="body2"><strong>Location:</strong> {taskData.location || 'N/A'}</Typography>
              <Typography variant="body2"><strong>Due Date:</strong> {taskData.dueDate}</Typography>
              <Typography variant="body2"><strong>Duration:</strong> {taskData.estimatedDuration} min</Typography>
            </Box>

            <Typography variant="h6" gutterBottom>
              Assigned Workers ({selectedWorkers.length})
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {selectedWorkers.map((workerId) => {
                const worker = workers.find((w) => w._id === workerId);
                return worker ? (
                  <Chip
                    key={workerId}
                    avatar={<Avatar src={worker.avatar}>{worker.name.charAt(0)}</Avatar>}
                    label={worker.name}
                  />
                ) : null;
              })}
            </Box>

            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <CheckIcon sx={{ mr: 1 }} />
                Successfully created {selectedWorkers.length} task(s)!
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TaskIcon color="primary" />
          Bulk Task Assignment
        </Box>
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4, mt: 2 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent(activeStep)}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading || success}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading || success}>
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={
              (activeStep === 0 && !taskData.title) ||
              (activeStep === 1 && selectedWorkers.length === 0)
            }
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleAssign}
            disabled={loading || success || selectedWorkers.length === 0}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
          >
            {loading ? 'Creating...' : 'Assign Tasks'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkTaskAssignmentDialog;
