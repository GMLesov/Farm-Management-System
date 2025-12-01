import React, { useState } from 'react';
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
  Alert,
  Tabs,
  Tab,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Divider,
  Avatar,
  LinearProgress,
  Grid,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  AssignmentTurnedIn,
  Assignment,
  Person,
  CheckCircle,
  Cancel,
  Schedule,
  Warning,
  TrendingUp,
} from '@mui/icons-material';

interface TaskTemplate {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'one-time';
  estimatedDuration: number; // in hours
  priority: 'low' | 'medium' | 'high' | 'critical';
  subtasks: SubTask[];
  assignedWorkers: string[];
  createdBy: string;
  createdDate: string;
}

interface SubTask {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

interface TaskAssignment {
  id: string;
  templateId: string;
  templateTitle: string;
  workerId: string;
  workerName: string;
  assignedDate: string;
  dueDate: string;
  startedDate?: string;
  completedDate?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  completionPercentage: number;
  completedSubtasks: string[];
  notes: string;
  verifiedBy?: string;
}

interface Worker {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar?: string;
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
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const TaskManagementDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [viewTaskDialogOpen, setViewTaskDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<TaskAssignment | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  const [workers] = useState<Worker[]>([
    { id: 'w1', name: 'John Kamau', role: 'Field Worker', email: 'john@farm.com', phone: '+254 712 345 678' },
    { id: 'w2', name: 'Mary Wanjiku', role: 'Livestock Manager', email: 'mary@farm.com', phone: '+254 723 456 789' },
    { id: 'w3', name: 'Peter Mwangi', role: 'Equipment Operator', email: 'peter@farm.com', phone: '+254 734 567 890' },
    { id: 'w4', name: 'Jane Akinyi', role: 'Field Worker', email: 'jane@farm.com', phone: '+254 745 678 901' },
    { id: 'w5', name: 'David Ochieng', role: 'General Worker', email: 'david@farm.com', phone: '+254 756 789 012' },
  ]);

  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([
    {
      id: 't1',
      title: 'Daily Cattle Feeding',
      description: 'Complete feeding routine for all cattle groups',
      category: 'daily',
      estimatedDuration: 2,
      priority: 'high',
      subtasks: [
        { id: 'st1', title: 'Prepare dairy meal concentrate', description: 'Mix 400kg of concentrate', required: true },
        { id: 'st2', title: 'Distribute feed to dairy cows', description: '8kg per cow, twice daily', required: true },
        { id: 'st3', title: 'Check water troughs', description: 'Ensure all troughs are clean and full', required: true },
        { id: 'st4', title: 'Record feeding quantities', description: 'Update feeding log', required: true },
      ],
      assignedWorkers: ['w1', 'w2'],
      createdBy: 'Admin',
      createdDate: '2025-11-01',
    },
    {
      id: 't2',
      title: 'Weekly Cattle Dipping',
      description: 'Dip all cattle for tick and parasite control',
      category: 'weekly',
      estimatedDuration: 3,
      priority: 'critical',
      subtasks: [
        { id: 'st5', title: 'Prepare dipping solution', description: 'Mix 5 liters of acaricide in dipping tank', required: true },
        { id: 'st6', title: 'Round up all cattle', description: 'Bring all cattle to dipping area', required: true },
        { id: 'st7', title: 'Dip each animal', description: 'Ensure complete immersion', required: true },
        { id: 'st8', title: 'Record dipping', description: 'Update dipping log with date and chemical used', required: true },
      ],
      assignedWorkers: ['w2'],
      createdBy: 'Admin',
      createdDate: '2025-11-01',
    },
    {
      id: 't3',
      title: 'Maize Field Inspection',
      description: 'Daily inspection of maize field for pests and issues',
      category: 'daily',
      estimatedDuration: 1.5,
      priority: 'medium',
      subtasks: [
        { id: 'st9', title: 'Walk through entire field', description: 'Inspect all sections systematically', required: true },
        { id: 'st10', title: 'Check for pests', description: 'Look for fall armyworm, stalk borers', required: true },
        { id: 'st11', title: 'Check irrigation system', description: 'Ensure sprinklers are working', required: true },
        { id: 'st12', title: 'Report any issues', description: 'Document and report problems immediately', required: true },
      ],
      assignedWorkers: ['w1', 'w4'],
      createdBy: 'Admin',
      createdDate: '2025-11-05',
    },
    {
      id: 't4',
      title: 'Poultry Feed Mixing',
      description: 'Prepare and mix feed for broilers and layers',
      category: 'weekly',
      estimatedDuration: 2,
      priority: 'high',
      subtasks: [
        { id: 'st13', title: 'Collect raw materials', description: 'Maize, sunflower meal, minerals', required: true },
        { id: 'st14', title: 'Measure ingredients', description: 'Follow feed formulation ratios', required: true },
        { id: 'st15', title: 'Mix thoroughly', description: 'Use mixer for uniform distribution', required: true },
        { id: 'st16', title: 'Store in feed bags', description: 'Package in 50kg bags and label', required: true },
      ],
      assignedWorkers: ['w5'],
      createdBy: 'Admin',
      createdDate: '2025-11-03',
    },
    {
      id: 't5',
      title: 'Equipment Maintenance',
      description: 'Monthly maintenance of all farm equipment',
      category: 'monthly',
      estimatedDuration: 4,
      priority: 'medium',
      subtasks: [
        { id: 'st17', title: 'Tractor oil change', description: 'Change engine oil and filters', required: true },
        { id: 'st18', title: 'Grease all moving parts', description: 'Lubricate joints and bearings', required: true },
        { id: 'st19', title: 'Check tire pressure', description: 'Inflate to recommended PSI', required: false },
        { id: 'st20', title: 'Test all systems', description: 'Hydraulics, brakes, lights', required: true },
      ],
      assignedWorkers: ['w3'],
      createdBy: 'Admin',
      createdDate: '2025-11-01',
    },
  ]);

  const [taskAssignments, setTaskAssignments] = useState<TaskAssignment[]>([
    {
      id: 'a1',
      templateId: 't1',
      templateTitle: 'Daily Cattle Feeding',
      workerId: 'w1',
      workerName: 'John Kamau',
      assignedDate: '2025-11-13',
      dueDate: '2025-11-13',
      completedDate: '2025-11-13',
      status: 'completed',
      completionPercentage: 100,
      completedSubtasks: ['st1', 'st2', 'st3', 'st4'],
      notes: 'All tasks completed on time',
      verifiedBy: 'Admin',
    },
    {
      id: 'a2',
      templateId: 't3',
      templateTitle: 'Maize Field Inspection',
      workerId: 'w4',
      workerName: 'Jane Akinyi',
      assignedDate: '2025-11-13',
      dueDate: '2025-11-13',
      startedDate: '2025-11-13',
      status: 'in-progress',
      completionPercentage: 50,
      completedSubtasks: ['st9', 'st10'],
      notes: 'Inspection ongoing',
    },
    {
      id: 'a3',
      templateId: 't2',
      templateTitle: 'Weekly Cattle Dipping',
      workerId: 'w2',
      workerName: 'Mary Wanjiku',
      assignedDate: '2025-11-13',
      dueDate: '2025-11-13',
      status: 'pending',
      completionPercentage: 0,
      completedSubtasks: [],
      notes: 'Scheduled for this afternoon',
    },
    {
      id: 'a4',
      templateId: 't4',
      templateTitle: 'Poultry Feed Mixing',
      workerId: 'w5',
      workerName: 'David Ochieng',
      assignedDate: '2025-11-12',
      dueDate: '2025-11-12',
      status: 'overdue',
      completionPercentage: 75,
      completedSubtasks: ['st13', 'st14', 'st15'],
      notes: 'Delayed due to material shortage',
    },
  ]);

  const [templateFormData, setTemplateFormData] = useState<Partial<TaskTemplate>>({
    title: '',
    description: '',
    category: 'daily',
    estimatedDuration: 1,
    priority: 'medium',
    subtasks: [],
    assignedWorkers: [],
  });

  const [assignmentFormData, setAssignmentFormData] = useState<Partial<TaskAssignment>>({
    templateId: '',
    workerId: '',
    assignedDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [newSubtask, setNewSubtask] = useState({ title: '', description: '', required: true });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSaveTemplate = () => {
    if (!templateFormData.title || !templateFormData.description) {
      setSnackbar({ open: true, message: 'Please fill all required fields', severity: 'error' });
      return;
    }

    if (editingTemplate) {
      setTaskTemplates(taskTemplates.map(t =>
        t.id === editingTemplate.id
          ? { ...t, ...templateFormData } as TaskTemplate
          : t
      ));
      setSnackbar({ open: true, message: 'Task template updated successfully!', severity: 'success' });
    } else {
      const newTemplate: TaskTemplate = {
        ...templateFormData as TaskTemplate,
        id: `t-${Date.now()}`,
        createdBy: 'Current User',
        createdDate: new Date().toISOString().split('T')[0],
      };
      setTaskTemplates([...taskTemplates, newTemplate]);
      setSnackbar({ open: true, message: 'Task template created successfully!', severity: 'success' });
    }

    setTemplateDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleSaveAssignment = () => {
    if (!assignmentFormData.templateId || !assignmentFormData.workerId) {
      setSnackbar({ open: true, message: 'Please select task and worker', severity: 'error' });
      return;
    }

    const template = taskTemplates.find(t => t.id === assignmentFormData.templateId);
    const worker = workers.find(w => w.id === assignmentFormData.workerId);

    if (!template || !worker) return;

    const dueDate = new Date(assignmentFormData.dueDate!);
    const today = new Date();
    let status: 'pending' | 'in-progress' | 'completed' | 'overdue' = 'pending';
    
    if (dueDate < today) {
      status = 'overdue';
    }

    const newAssignment: TaskAssignment = {
      id: `a-${Date.now()}`,
      ...assignmentFormData,
      templateTitle: template.title,
      workerName: worker.name,
      status,
      completionPercentage: 0,
      completedSubtasks: [],
    } as TaskAssignment;

    setTaskAssignments([...taskAssignments, newAssignment]);
    setAssignmentDialogOpen(false);
    setSnackbar({ open: true, message: 'Task assigned successfully!', severity: 'success' });
  };

  const handleToggleSubtask = (assignmentId: string, subtaskId: string) => {
    setTaskAssignments(taskAssignments.map(assignment => {
      if (assignment.id === assignmentId) {
        const template = taskTemplates.find(t => t.id === assignment.templateId);
        if (!template) return assignment;

        const isCompleted = assignment.completedSubtasks.includes(subtaskId);
        const newCompletedSubtasks = isCompleted
          ? assignment.completedSubtasks.filter(id => id !== subtaskId)
          : [...assignment.completedSubtasks, subtaskId];

        const completionPercentage = (newCompletedSubtasks.length / template.subtasks.length) * 100;
        const allCompleted = completionPercentage === 100;

        return {
          ...assignment,
          completedSubtasks: newCompletedSubtasks,
          completionPercentage,
          status: allCompleted ? 'completed' : assignment.status === 'pending' ? 'in-progress' : assignment.status,
          completedDate: allCompleted ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return assignment;
    }));
  };

  const handleVerifyTask = (assignmentId: string) => {
    setTaskAssignments(taskAssignments.map(assignment =>
      assignment.id === assignmentId
        ? { ...assignment, verifiedBy: 'Current User' }
        : assignment
    ));
    setSnackbar({ open: true, message: 'Task verified successfully!', severity: 'success' });
  };

  const openTemplateDialog = (template?: TaskTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateFormData(template);
    } else {
      setEditingTemplate(null);
      setTemplateFormData({
        title: '',
        description: '',
        category: 'daily',
        estimatedDuration: 1,
        priority: 'medium',
        subtasks: [],
        assignedWorkers: [],
      });
    }
    setTemplateDialogOpen(true);
  };

  const openAssignmentDialog = () => {
    setAssignmentFormData({
      templateId: '',
      workerId: '',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setAssignmentDialogOpen(true);
  };

  const openViewTaskDialog = (assignment: TaskAssignment) => {
    setSelectedAssignment(assignment);
    setViewTaskDialogOpen(true);
  };

  const addSubtask = () => {
    if (!newSubtask.title) {
      setSnackbar({ open: true, message: 'Subtask title is required', severity: 'error' });
      return;
    }

    const subtask: SubTask = {
      id: `st-${Date.now()}`,
      ...newSubtask,
    };

    setTemplateFormData({
      ...templateFormData,
      subtasks: [...(templateFormData.subtasks || []), subtask],
    });

    setNewSubtask({ title: '', description: '', required: true });
  };

  const removeSubtask = (subtaskId: string) => {
    setTemplateFormData({
      ...templateFormData,
      subtasks: (templateFormData.subtasks || []).filter(st => st.id !== subtaskId),
    });
  };

  const totalTasks = taskAssignments.length;
  const completedTasks = taskAssignments.filter(a => a.status === 'completed').length;
  const inProgressTasks = taskAssignments.filter(a => a.status === 'in-progress').length;
  const overdueTasks = taskAssignments.filter(a => a.status === 'overdue').length;
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 0 }}>Task Management</Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3 }}>
          Assign, track, and manage farm tasks and worker activities.
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Total Tasks</Typography>
                  <Typography variant="h5">{totalTasks}</Typography>
                </Box>
                <Assignment sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Completed</Typography>
                  <Typography variant="h5" color="success.main">{completedTasks}</Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">In Progress</Typography>
                  <Typography variant="h5" color="info.main">{inProgressTasks}</Typography>
                </Box>
                <Schedule sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">Overdue</Typography>
                  <Typography variant="h5" color="error.main">{overdueTasks}</Typography>
                </Box>
                <Warning sx={{ fontSize: 40, color: 'error.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Overall Progress */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="h6">Overall Task Completion</Typography>
            <Typography variant="h5" color="primary">{completionRate.toFixed(0)}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={completionRate} sx={{ height: 10, borderRadius: 5 }} />
        </CardContent>
      </Card>

      {/* Alerts */}
      {overdueTasks > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <strong>Attention Required:</strong> {overdueTasks} task{overdueTasks > 1 ? 's are' : ' is'} overdue. 
          Please follow up with workers.
        </Alert>
      )}

      {/* Tabs */}
      <Card>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Active Assignments" icon={<AssignmentTurnedIn />} iconPosition="start" />
          <Tab label="Task Templates" icon={<Assignment />} iconPosition="start" />
          <Tab label="Worker Performance" icon={<Person />} iconPosition="start" />
        </Tabs>

        <CardContent>
          {/* Active Assignments Tab */}
          <TabPanel value={tabValue} index={0}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Task</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Assigned Date</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {taskAssignments.map((assignment) => (
                    <TableRow key={assignment.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{assignment.templateTitle}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {assignment.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {assignment.workerName.charAt(0)}
                          </Avatar>
                          {assignment.workerName}
                        </Box>
                      </TableCell>
                      <TableCell>{new Date(assignment.assignedDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {new Date(assignment.dueDate).toLocaleDateString()}
                        {assignment.status === 'overdue' && (
                          <Typography variant="caption" display="block" color="error">
                            Overdue!
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={assignment.completionPercentage}
                            sx={{ width: 100, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="caption">{assignment.completionPercentage.toFixed(0)}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={assignment.status}
                          size="small"
                          color={
                            assignment.status === 'completed' ? 'success' :
                            assignment.status === 'in-progress' ? 'info' :
                            assignment.status === 'overdue' ? 'error' : 'default'
                          }
                          icon={
                            assignment.status === 'completed' ? <CheckCircle /> :
                            assignment.status === 'in-progress' ? <Schedule /> : undefined
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" onClick={() => openViewTaskDialog(assignment)}>
                          View Details
                        </Button>
                        {assignment.status === 'completed' && !assignment.verifiedBy && (
                          <Button
                            size="small"
                            color="success"
                            onClick={() => handleVerifyTask(assignment.id)}
                          >
                            Verify
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Task Templates Tab */}
          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {taskTemplates.map((template) => (
                <Grid size={{ xs: 12, md: 6 }} key={template.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                        <Box>
                          <Typography variant="h6">{template.title}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {template.description}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Chip label={template.category} size="small" />
                            <Chip
                              label={template.priority}
                              size="small"
                              color={
                                template.priority === 'critical' ? 'error' :
                                template.priority === 'high' ? 'warning' :
                                template.priority === 'medium' ? 'info' : 'default'
                              }
                            />
                            <Chip label={`${template.estimatedDuration}h`} size="small" variant="outlined" />
                          </Box>
                        </Box>
                        <Box>
                          <IconButton size="small" onClick={() => openTemplateDialog(template)}>
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              if (window.confirm('Delete this template?')) {
                                setTaskTemplates(taskTemplates.filter(t => t.id !== template.id));
                                setSnackbar({ open: true, message: 'Template deleted', severity: 'success' });
                              }
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Subtasks ({template.subtasks.length}):
                      </Typography>
                      <List dense>
                        {template.subtasks.slice(0, 3).map((subtask) => (
                          <ListItem key={subtask.id} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 30 }}>
                              <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                            </ListItemIcon>
                            <ListItemText
                              primary={subtask.title}
                              primaryTypographyProps={{ variant: 'body2' }}
                            />
                          </ListItem>
                        ))}
                        {template.subtasks.length > 3 && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 4 }}>
                            +{template.subtasks.length - 3} more
                          </Typography>
                        )}
                      </List>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Assigned to: {template.assignedWorkers.length} worker(s)
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </TabPanel>

          {/* Worker Performance Tab */}
          <TabPanel value={tabValue} index={2}>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Worker</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Total Tasks</TableCell>
                    <TableCell>Completed</TableCell>
                    <TableCell>In Progress</TableCell>
                    <TableCell>Overdue</TableCell>
                    <TableCell>Completion Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workers.map((worker) => {
                    const workerTasks = taskAssignments.filter(a => a.workerId === worker.id);
                    const workerCompleted = workerTasks.filter(a => a.status === 'completed').length;
                    const workerInProgress = workerTasks.filter(a => a.status === 'in-progress').length;
                    const workerOverdue = workerTasks.filter(a => a.status === 'overdue').length;
                    const workerRate = workerTasks.length > 0 ? (workerCompleted / workerTasks.length) * 100 : 0;

                    return (
                      <TableRow key={worker.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar>{worker.name.charAt(0)}</Avatar>
                            <Box>
                              <Typography variant="subtitle2">{worker.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {worker.email}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>{worker.role}</TableCell>
                        <TableCell>{workerTasks.length}</TableCell>
                        <TableCell>
                          <Chip label={workerCompleted} size="small" color="success" />
                        </TableCell>
                        <TableCell>
                          <Chip label={workerInProgress} size="small" color="info" />
                        </TableCell>
                        <TableCell>
                          <Chip label={workerOverdue} size="small" color="error" />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={workerRate}
                              sx={{ width: 100, height: 8, borderRadius: 4 }}
                            />
                            <Typography variant="body2">{workerRate.toFixed(0)}%</Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>
        </CardContent>
      </Card>

      {/* Template Dialog */}
      <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingTemplate ? 'Edit Task Template' : 'Create Task Template'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Task Title"
                value={templateFormData.title}
                onChange={(e) => setTemplateFormData({ ...templateFormData, title: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                value={templateFormData.description}
                onChange={(e) => setTemplateFormData({ ...templateFormData, description: e.target.value })}
                fullWidth
                required
                multiline
                rows={2}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={templateFormData.category}
                  label="Category"
                  onChange={(e) => setTemplateFormData({ ...templateFormData, category: e.target.value as any })}
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="seasonal">Seasonal</MenuItem>
                  <MenuItem value="one-time">One-time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth required>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={templateFormData.priority}
                  label="Priority"
                  onChange={(e) => setTemplateFormData({ ...templateFormData, priority: e.target.value as any })}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Estimated Duration (hours)"
                type="number"
                value={templateFormData.estimatedDuration}
                onChange={(e) => setTemplateFormData({ ...templateFormData, estimatedDuration: parseFloat(e.target.value) })}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }}>Subtasks</Divider>
            </Grid>

            {/* Subtask List */}
            <Grid size={{ xs: 12 }}>
              <List>
                {(templateFormData.subtasks || []).map((subtask, index) => (
                  <ListItem
                    key={subtask.id}
                    secondaryAction={
                      <IconButton edge="end" onClick={() => removeSubtask(subtask.id)}>
                        <Delete />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <CheckCircle />
                    </ListItemIcon>
                    <ListItemText
                      primary={subtask.title}
                      secondary={subtask.description}
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Add Subtask */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Subtask Title"
                value={newSubtask.title}
                onChange={(e) => setNewSubtask({ ...newSubtask, title: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Subtask Description"
                value={newSubtask.description}
                onChange={(e) => setNewSubtask({ ...newSubtask, description: e.target.value })}
                fullWidth
                size="small"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <Button variant="outlined" onClick={addSubtask} fullWidth>
                Add
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTemplate}>
            {editingTemplate ? 'Update' : 'Create'} Template
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assignment Dialog */}
      <Dialog open={assignmentDialogOpen} onClose={() => setAssignmentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Task to Worker</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Select Task Template</InputLabel>
                <Select
                  value={assignmentFormData.templateId}
                  label="Select Task Template"
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, templateId: e.target.value })}
                >
                  {taskTemplates.map((template) => (
                    <MenuItem key={template.id} value={template.id}>
                      {template.title} - {template.category} ({template.estimatedDuration}h)
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Assign to Worker</InputLabel>
                <Select
                  value={assignmentFormData.workerId}
                  label="Assign to Worker"
                  onChange={(e) => setAssignmentFormData({ ...assignmentFormData, workerId: e.target.value })}
                >
                  {workers.map((worker) => (
                    <MenuItem key={worker.id} value={worker.id}>
                      {worker.name} - {worker.role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Assigned Date"
                type="date"
                value={assignmentFormData.assignedDate}
                onChange={(e) => setAssignmentFormData({ ...assignmentFormData, assignedDate: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Due Date"
                type="date"
                value={assignmentFormData.dueDate}
                onChange={(e) => setAssignmentFormData({ ...assignmentFormData, dueDate: e.target.value })}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
                value={assignmentFormData.notes}
                onChange={(e) => setAssignmentFormData({ ...assignmentFormData, notes: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignmentDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveAssignment}>
            Assign Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Task Dialog */}
      <Dialog
        open={viewTaskDialogOpen}
        onClose={() => setViewTaskDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Task Details</DialogTitle>
        <DialogContent>
          {selectedAssignment && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">{selectedAssignment.templateTitle}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Assigned to: {selectedAssignment.workerName}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Subtasks ({selectedAssignment.completedSubtasks.length}/{taskTemplates.find(t => t.id === selectedAssignment.templateId)?.subtasks.length || 0} completed):
              </Typography>

              <List>
                {taskTemplates
                  .find(t => t.id === selectedAssignment.templateId)
                  ?.subtasks.map((subtask) => (
                    <ListItem key={subtask.id} dense>
                      <ListItemIcon>
                        <Checkbox
                          edge="start"
                          checked={selectedAssignment.completedSubtasks.includes(subtask.id)}
                          onChange={() => handleToggleSubtask(selectedAssignment.id, subtask.id)}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={subtask.title}
                        secondary={subtask.description}
                      />
                    </ListItem>
                  ))}
              </List>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Typography variant="body2">
                    <Chip
                      label={selectedAssignment.status}
                      size="small"
                      color={
                        selectedAssignment.status === 'completed' ? 'success' :
                        selectedAssignment.status === 'in-progress' ? 'info' :
                        selectedAssignment.status === 'overdue' ? 'error' : 'default'
                      }
                    />
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Progress</Typography>
                  <Typography variant="body2">{selectedAssignment.completionPercentage.toFixed(0)}%</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Due Date</Typography>
                  <Typography variant="body2">{new Date(selectedAssignment.dueDate).toLocaleDateString()}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Completed Date</Typography>
                  <Typography variant="body2">
                    {selectedAssignment.completedDate
                      ? new Date(selectedAssignment.completedDate).toLocaleDateString()
                      : 'Not completed'}
                  </Typography>
                </Grid>
              </Grid>

              {selectedAssignment.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">Notes</Typography>
                  <Typography variant="body2">{selectedAssignment.notes}</Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewTaskDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaskManagementDashboard;


