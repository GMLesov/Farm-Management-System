import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  GetApp,
  TableChart,
  Storage,
  Description,
  CheckCircle,
  Pets,
  Agriculture,
  Assignment,
  People,
  TrendingUp,
} from '@mui/icons-material';

interface DataExportProps {
  open: boolean;
  onClose: () => void;
}

const DataExport: React.FC<DataExportProps> = ({ open, onClose }) => {
  const [exportFormat, setExportFormat] = useState('excel');
  const [selectedData, setSelectedData] = useState({
    animals: true,
    crops: true,
    tasks: true,
    users: false,
    financial: false,
  });
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const dataTypes = [
    {
      key: 'animals',
      label: 'Animal Records',
      icon: <Pets />,
      description: 'Complete animal database with health records, breeding info, and medical history',
      recordCount: 245,
    },
    {
      key: 'crops',
      label: 'Crop Data',
      icon: <Agriculture />,
      description: 'Crop lifecycle data, planting schedules, harvest records, and yield information',
      recordCount: 23,
    },
    {
      key: 'tasks',
      label: 'Task Records',
      icon: <Assignment />,
      description: 'Task assignments, completion status, worker assignments, and time tracking',
      recordCount: 175,
    },
    {
      key: 'users',
      label: 'User & Worker Data',
      icon: <People />,
      description: 'User profiles, worker information, roles, and access permissions',
      recordCount: 12,
    },
    {
      key: 'financial',
      label: 'Financial Records',
      icon: <TrendingUp />,
      description: 'Revenue, expenses, profit analysis, and financial performance metrics',
      recordCount: 89,
    },
  ];

  const formatOptions = [
    {
      value: 'excel',
      label: 'Excel Spreadsheet (.xlsx)',
      icon: <TableChart color="success" />,
      description: 'Multiple sheets with formatted data, perfect for analysis',
    },
    {
      value: 'csv',
      label: 'CSV Files (.csv)',
      icon: <Storage color="info" />,
      description: 'Raw data files, compatible with any spreadsheet application',
    },
    {
      value: 'pdf',
      label: 'PDF Report (.pdf)',
      icon: <Description color="error" />,
      description: 'Formatted report with tables and summaries, ready for printing',
    },
  ];

  const handleDataTypeChange = (dataType: string) => {
    setSelectedData(prev => ({
      ...prev,
      [dataType]: !prev[dataType as keyof typeof prev],
    }));
  };

  const handleExport = async () => {
    setExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setExporting(false);
    setExported(true);
  };

  const handleClose = () => {
    setExported(false);
    setExporting(false);
    onClose();
  };

  const getSelectedCount = () => {
    return Object.values(selectedData).filter(Boolean).length;
  };

  const getTotalRecords = () => {
    return dataTypes
      .filter(type => selectedData[type.key as keyof typeof selectedData])
      .reduce((sum, type) => sum + type.recordCount, 0);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <GetApp />
          <Typography variant="h5">
            Export Farm Data
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {exported ? (
          <Box textAlign="center">
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Data Export Complete!
            </Typography>
            <Alert severity="success" sx={{ mb: 2 }}>
              Your farm data has been successfully exported and is ready for download.
            </Alert>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Exported {getTotalRecords()} records in {formatOptions.find(f => f.value === exportFormat)?.label}
            </Typography>
            <Button variant="contained" color="primary" startIcon={<GetApp />}>
              Download Export
            </Button>
          </Box>
        ) : (
          <Box>
            {exporting && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" gutterBottom>
                  Exporting your data...
                </Typography>
                <LinearProgress />
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Processing {getTotalRecords()} records
                </Typography>
              </Box>
            )}

            <Typography variant="h6" gutterBottom>
              Select Export Format
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={exportFormat}
                label="Export Format"
                onChange={(e) => setExportFormat(e.target.value)}
              >
                {formatOptions.map((format) => (
                  <MenuItem key={format.value} value={format.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {format.icon}
                      <Box>
                        <Typography variant="body1">
                          {format.label}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {format.description}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="h6" gutterBottom>
              Select Data to Export
            </Typography>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              {dataTypes.map((dataType) => (
                <Box 
                  key={dataType.key} 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    p: 1, 
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'grey.50' },
                    borderRadius: 1,
                    mb: 1
                  }}
                  onClick={() => handleDataTypeChange(dataType.key)}
                >
                  <Checkbox
                    checked={selectedData[dataType.key as keyof typeof selectedData]}
                    sx={{ mr: 1 }}
                  />
                  <Box sx={{ mr: 2 }}>
                    {dataType.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body1">
                        {dataType.label}
                      </Typography>
                      <Typography variant="caption" color="primary">
                        ({dataType.recordCount} records)
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {dataType.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Export Summary:</strong> {getSelectedCount()} data types selected, 
                {getTotalRecords()} total records will be exported in {formatOptions.find(f => f.value === exportFormat)?.label} format.
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          {exported ? 'Close' : 'Cancel'}
        </Button>
        {!exported && !exporting && (
          <Button
            onClick={handleExport}
            variant="contained"
            disabled={getSelectedCount() === 0}
            startIcon={<GetApp />}
          >
            Export Data
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DataExport;