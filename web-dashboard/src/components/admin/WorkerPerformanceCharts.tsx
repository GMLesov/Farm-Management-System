import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  Avatar,
  Grid,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tabs,
  Tab
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Star as StarIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface WorkerPerformance {
  worker: {
    _id: string;
    name: string;
    avatar?: string;
  };
  tasksCompleted: number;
  tasksInProgress: number;
  tasksPending: number;
  averageRating: number;
  averageCompletionTime: number;
  onTimeCompletionRate: number;
}

const WorkerPerformanceCharts: React.FC = () => {
  const [performances, setPerformances] = useState<WorkerPerformance[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/workers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const workersData = await response.json();

      if (workersData.success) {
        // Fetch tasks for each worker
        const performancePromises = workersData.workers.map(async (worker: any) => {
          const tasksRes = await fetch(`/api/tasks?assignedTo=${worker._id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const tasksData = await tasksRes.json();

          if (tasksData.success) {
            const tasks = tasksData.tasks;
            const completedTasks = tasks.filter((t: any) => t.status === 'completed');
            
            // Calculate metrics
            const avgRating = completedTasks.length > 0
              ? completedTasks.reduce((sum: number, t: any) => sum + (t.rating || 0), 0) / completedTasks.length
              : 0;

            const avgCompletionTime = completedTasks.length > 0
              ? completedTasks.reduce((sum: number, t: any) => {
                  const start = new Date(t.createdAt).getTime();
                  const end = new Date(t.completedAt).getTime();
                  return sum + (end - start) / (1000 * 60); // minutes
                }, 0) / completedTasks.length
              : 0;

            const onTimeCount = completedTasks.filter((t: any) => {
              return new Date(t.completedAt) <= new Date(t.dueDate);
            }).length;

            const onTimeRate = completedTasks.length > 0
              ? (onTimeCount / completedTasks.length) * 100
              : 0;

            return {
              worker: {
                _id: worker._id,
                name: worker.name,
                avatar: worker.avatar
              },
              tasksCompleted: tasks.filter((t: any) => t.status === 'completed').length,
              tasksInProgress: tasks.filter((t: any) => t.status === 'in-progress').length,
              tasksPending: tasks.filter((t: any) => t.status === 'pending').length,
              averageRating: avgRating,
              averageCompletionTime: Math.round(avgCompletionTime),
              onTimeCompletionRate: Math.round(onTimeRate)
            };
          }

          return null;
        });

        const results = await Promise.all(performancePromises);
        setPerformances(results.filter(Boolean) as WorkerPerformance[]);
      }
    } catch (err) {
      console.error('Failed to fetch performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const taskCompletionData = performances.map(p => ({
    name: p.worker.name.split(' ')[0],
    completed: p.tasksCompleted,
    inProgress: p.tasksInProgress,
    pending: p.tasksPending
  }));

  const ratingData = performances
    .filter(p => p.averageRating > 0)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 10)
    .map(p => ({
      name: p.worker.name.split(' ')[0],
      rating: p.averageRating.toFixed(1)
    }));

  const completionTimeData = performances
    .filter(p => p.averageCompletionTime > 0)
    .sort((a, b) => a.averageCompletionTime - b.averageCompletionTime)
    .slice(0, 10)
    .map(p => ({
      name: p.worker.name.split(' ')[0],
      time: p.averageCompletionTime
    }));

  const onTimeData = performances
    .filter(p => p.onTimeCompletionRate > 0)
    .sort((a, b) => b.onTimeCompletionRate - a.onTimeCompletionRate)
    .slice(0, 10)
    .map(p => ({
      name: p.worker.name.split(' ')[0],
      rate: p.onTimeCompletionRate
    }));

  const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336'];

  const topPerformers = performances
    .filter(p => p.averageRating > 0)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader
        avatar={<TrendingUpIcon color="primary" />}
        title="Worker Performance Analytics"
        subheader="Comprehensive performance metrics and insights"
      />

      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
      >
        <Tab label="Overview" />
        <Tab label="Task Completion" />
        <Tab label="Quality Ratings" />
        <Tab label="Efficiency" />
      </Tabs>

      <CardContent>
        {loading ? (
          <Box sx={{ py: 4 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              Loading performance data...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Overview Tab */}
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" gutterBottom>
                    Top Performers
                  </Typography>
                  <List>
                    {topPerformers.map((perf, index) => (
                      <ListItem
                        key={perf.worker._id}
                        sx={{
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                          bgcolor: index === 0 ? 'action.hover' : 'background.paper'
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar src={perf.worker.avatar}>
                            {index + 1}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={perf.worker.name}
                          secondary={
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip
                                icon={<StarIcon />}
                                label={`${perf.averageRating.toFixed(1)}/5`}
                                size="small"
                                color="primary"
                              />
                              <Chip
                                icon={<CheckIcon />}
                                label={`${perf.tasksCompleted} tasks`}
                                size="small"
                              />
                              <Chip
                                icon={<SpeedIcon />}
                                label={`${perf.onTimeCompletionRate}% on-time`}
                                size="small"
                              />
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" gutterBottom>
                    Overall Statistics
                  </Typography>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Tasks Completed
                      </Typography>
                      <Typography variant="h4">
                        {performances.reduce((sum, p) => sum + p.tasksCompleted, 0)}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Average Rating
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h4">
                          {(performances.reduce((sum, p) => sum + p.averageRating, 0) / performances.length).toFixed(1)}
                        </Typography>
                        <StarIcon color="warning" />
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Average On-Time Rate
                      </Typography>
                      <Typography variant="h4">
                        {Math.round(performances.reduce((sum, p) => sum + p.onTimeCompletionRate, 0) / performances.length)}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={performances.reduce((sum, p) => sum + p.onTimeCompletionRate, 0) / performances.length}
                        sx={{ mt: 1, height: 8, borderRadius: 4 }}
                      />
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            )}

            {/* Task Completion Tab */}
            {activeTab === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Task Status by Worker
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={taskCompletionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" fill="#4caf50" name="Completed" />
                    <Bar dataKey="inProgress" fill="#2196f3" name="In Progress" />
                    <Bar dataKey="pending" fill="#ff9800" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}

            {/* Quality Ratings Tab */}
            {activeTab === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Average Worker Ratings (Top 10)
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={ratingData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 5]} />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="rating" fill="#ff9800" name="Rating">
                      {ratingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}

            {/* Efficiency Tab */}
            {activeTab === 3 && (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" gutterBottom>
                    Average Completion Time (Top 10 Fastest)
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={completionTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="time" fill="#2196f3" name="Minutes" />
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" gutterBottom>
                    On-Time Completion Rate (Top 10)
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={onTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="rate" fill="#4caf50" name="%" />
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>
              </Grid>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkerPerformanceCharts;
