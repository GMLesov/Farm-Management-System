import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Agriculture,
  Pets,
  Assignment,
  Assessment,
  GetApp,
  TrendingUp,
  PieChart,
  BarChart,
  TableChart,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import ReportGenerator from './ReportGenerator';
import DataExport from './DataExport';

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
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Dashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Sample data for charts
  const monthlyData = [
    { month: 'Jan', animals: 220, crops: 15, tasks: 45, revenue: 12000 },
    { month: 'Feb', animals: 235, crops: 18, tasks: 52, revenue: 15000 },
    { month: 'Mar', animals: 245, crops: 16, tasks: 48, revenue: 14500 },
    { month: 'Apr', animals: 250, crops: 20, tasks: 55, revenue: 18000 },
    { month: 'May', animals: 245, crops: 18, tasks: 62, revenue: 16500 },
    { month: 'Jun', animals: 240, crops: 22, tasks: 58, revenue: 19000 },
  ];

  const animalHealthData = [
    { name: 'Healthy', value: 220, color: '#4caf50' },
    { name: 'Sick', value: 15, color: '#f44336' },
    { name: 'Treatment', value: 10, color: '#ff9800' },
  ];

  const cropStageData = [
    { name: 'Planting', value: 3, color: '#2196f3' },
    { name: 'Growing', value: 12, color: '#4caf50' },
    { name: 'Harvesting', value: 2, color: '#ff9800' },
    { name: 'Harvested', value: 6, color: '#9c27b0' },
  ];

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExportData = () => {
    setExportDialogOpen(true);
  };

  return (
    <Box>
      {/* Main Heading */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Farm Management Web Dashboard
      </Typography>
      {/* App Bar */}
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Farm Management Web Dashboard
          </Typography>
          <Button color="inherit" startIcon={<Assessment />} onClick={() => setReportDialogOpen(true)}>
            Generate Report
          </Button>
          <Button color="inherit" startIcon={<GetApp />} onClick={handleExportData}>
            Export Data
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl">
        {/* Statistics Cards */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="primary">
                    245
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Animals
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    +5 from last month
                  </Typography>
                </Box>
                <Pets fontSize="large" color="primary" />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="success.main">
                    23
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Crops
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    +2 new plantings
                  </Typography>
                </Box>
                <Agriculture fontSize="large" color="success" />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="info.main">
                    89%
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Task Completion
                  </Typography>
                  <Typography variant="caption" color="info.main">
                    156/175 completed
                  </Typography>
                </Box>
                <Assignment fontSize="large" color="info" />
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ minWidth: 200, flex: 1 }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="h4" color="secondary.main">
                    $19,000
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Monthly Revenue
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    +15% growth
                  </Typography>
                </Box>
                <TrendingUp fontSize="large" color="secondary" />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Tabs for different views */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
            <Tab icon={<BarChart />} label="Analytics" />
            <Tab icon={<PieChart />} label="Health & Status" />
            <Tab icon={<TrendingUp />} label="Trends" />
            <Tab icon={<TableChart />} label="Data Tables" />
          </Tabs>

          {/* Analytics Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box display="flex" flexDirection="column" gap={3}>
              <Box display="flex" gap={3} flexWrap="wrap">
                <Paper sx={{ p: 2, flex: 1, minWidth: 400 }}>
                  <Typography variant="h6" gutterBottom>
                    Monthly Overview
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="animals" stackId="1" stroke="#2196f3" fill="#2196f3" />
                      <Area type="monotone" dataKey="crops" stackId="1" stroke="#4caf50" fill="#4caf50" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>

                <Paper sx={{ p: 2, flex: 1, minWidth: 400 }}>
                  <Typography variant="h6" gutterBottom>
                    Task Completion Trends
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="tasks" stroke="#ff9800" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Box>

              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Revenue Analysis
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                    <Legend />
                    <Bar dataKey="revenue" fill="#9c27b0" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </Paper>
            </Box>
          </TabPanel>

          {/* Health & Status Tab */}
          <TabPanel value={tabValue} index={1}>
            <Box display="flex" flexDirection="column" gap={3}>
              <Box display="flex" gap={3} flexWrap="wrap">
                <Paper sx={{ p: 2, flex: 1, minWidth: 400 }}>
                  <Typography variant="h6" gutterBottom>
                    Animal Health Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={animalHealthData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {animalHealthData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </Paper>

                <Paper sx={{ p: 2, flex: 1, minWidth: 400 }}>
                  <Typography variant="h6" gutterBottom>
                    Crop Stage Distribution
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={cropStageData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {cropStageData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </Paper>
              </Box>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Current Status Summary
                </Typography>
                <Box display="flex" gap={2} flexWrap="wrap">
                  <Chip label="245 Total Animals" color="primary" variant="outlined" />
                  <Chip label="220 Healthy (90%)" color="success" />
                  <Chip label="15 Sick (6%)" color="error" />
                  <Chip label="10 In Treatment (4%)" color="warning" />
                  <Chip label="23 Active Crops" color="success" variant="outlined" />
                  <Chip label="12 Growing" color="success" />
                  <Chip label="6 Harvested" color="info" />
                  <Chip label="89% Task Completion" color="primary" />
                </Box>
              </Paper>
            </Box>
          </TabPanel>

          {/* Trends Tab */}
          <TabPanel value={tabValue} index={2}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                6-Month Trend Analysis
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="animals" stroke="#2196f3" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="crops" stroke="#4caf50" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="tasks" stroke="#ff9800" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#9c27b0" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </TabPanel>

          {/* Data Tables Tab */}
          <TabPanel value={tabValue} index={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Detailed Data Management
              </Typography>
              <Box display="flex" gap={2} mb={2}>
                <Button variant="outlined" startIcon={<Pets />}>
                  View Animal Records
                </Button>
                <Button variant="outlined" startIcon={<Agriculture />}>
                  View Crop Data
                </Button>
                <Button variant="outlined" startIcon={<Assignment />}>
                  View Task History
                </Button>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Advanced data tables with filtering, sorting, and export capabilities would be implemented here.
                This includes detailed animal records, crop lifecycle data, task assignments, and financial records.
              </Typography>
            </Paper>
          </TabPanel>
        </Paper>

        {/* Report Generation Dialog */}
        <ReportGenerator 
          open={reportDialogOpen} 
          onClose={() => setReportDialogOpen(false)} 
        />

        {/* Data Export Dialog */}
        <DataExport 
          open={exportDialogOpen} 
          onClose={() => setExportDialogOpen(false)} 
        />
      </Container>
    </Box>
  );
};

export default Dashboard;