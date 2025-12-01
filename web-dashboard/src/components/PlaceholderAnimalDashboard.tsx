import React from 'react';
import { Box, Typography, Card, CardContent, Alert } from '@mui/material';
import PetsIcon from '@mui/icons-material/Pets';

const PlaceholderAnimalDashboard: React.FC = () => {
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <PetsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
          Animal Management
        </Typography>
      </Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Enhanced Animal Management Dashboard is being updated for MUI v7 compatibility.
      </Alert>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Coming Soon</Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive animal management with photo tracking, health records, breeding management, and analytics.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PlaceholderAnimalDashboard;
