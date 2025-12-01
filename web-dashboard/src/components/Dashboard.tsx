import React from 'react';
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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Agriculture,
  Pets,
  Assignment,
  Assessment,
  GetApp,
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  return (
    <Box>
      {/* App Bar */}
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Farm Management Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl">
        {/* Welcome Section */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to Farm Management Web Dashboard
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Comprehensive farm analytics and reporting interface
          </Typography>
        </Paper>

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
                    18
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active Crops
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
                    156
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Completed Tasks
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
                  <Typography variant="h4" color="warning.main">
                    23
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pending Tasks
                  </Typography>
                </Box>
                <Assignment fontSize="large" color="warning" />
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Health Status Overview */}
        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          <Paper sx={{ p: 3, flex: 1, minWidth: 300 }}>
            <Typography variant="h5" gutterBottom>
              Animal Health Status
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip 
                label="Healthy: 220"
                color="success"
                variant="outlined"
              />
              <Chip 
                label="Sick: 15"
                color="error"
                variant="outlined"
              />
              <Chip 
                label="Treatment: 10"
                color="warning"
                variant="outlined"
              />
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3, flex: 1, minWidth: 300 }}>
            <Typography variant="h5" gutterBottom>
              Crop Overview
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip 
                label="Total Crops: 18"
                color="primary"
                variant="outlined"
              />
              <Chip 
                label="Growing: 12"
                color="success"
                variant="outlined"
              />
              <Chip 
                label="Harvested: 6"
                color="info"
                variant="outlined"
              />
            </Box>
          </Paper>
        </Box>

        {/* Quick Actions */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Quick Actions
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<Assessment />}
              color="primary"
            >
              Generate Report
            </Button>
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              color="secondary"
            >
              Export Data
            </Button>
            <Button
              variant="outlined"
              startIcon={<Agriculture />}
            >
              Crop Analytics
            </Button>
            <Button
              variant="outlined"
              startIcon={<Pets />}
            >
              Animal Reports
            </Button>
          </Box>
        </Paper>

        {/* Demo Notice */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="info.contrastText">
            📊 <strong>Farm Management Web Dashboard Demo</strong><br />
            This comprehensive web interface provides farm managers with powerful analytics, 
            detailed reporting capabilities, and data export functions. Key features include:
            <br />• Real-time dashboard with farm metrics and KPIs
            <br />• Advanced reporting for animals, crops, tasks, and financials
            <br />• Data export in multiple formats (PDF, Excel, CSV)
            <br />• Responsive design for desktop and tablet access
            <br />• Integration with mobile app data through Firebase
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;