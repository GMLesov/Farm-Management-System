import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
} from '@mui/material';
import {
  Description as PdfIcon,
  TableChart as ExcelIcon,
  Storage as CsvIcon,
  CheckCircle,
} from '@mui/icons-material';

interface ReportGeneratorProps {
  open: boolean;
  onClose: () => void;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ open, onClose }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [reportConfig, setReportConfig] = useState({
    type: '',
    format: 'pdf',
    dateRange: 'last-month',
    includeCharts: true,
    includeRawData: false,
  });
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const steps = ['Select Report Type', 'Configure Options', 'Generate Report'];

  const reportTypes = [
    {
      value: 'comprehensive',
      label: 'Comprehensive Farm Report',
      description: 'Complete overview including animals, crops, tasks, and financial data',
    },
    {
      value: 'animals',
      label: 'Animal Health & Management',
      description: 'Detailed animal records, health status, breeding, and medical history',
    },
    {
      value: 'crops',
      label: 'Crop Production Analysis',
      description: 'Crop lifecycle, yield analysis, and agricultural performance metrics',
    },
    {
      value: 'tasks',
      label: 'Task Performance Report',
      description: 'Task completion rates, worker productivity, and operational efficiency',
    },
    {
      value: 'financial',
      label: 'Financial Summary',
      description: 'Revenue, expenses, profit margins, and financial performance analysis',
    },
  ];

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      generateReport();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const generateReport = async () => {
    setGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setGenerating(false);
    setGenerated(true);
    setActiveStep(steps.length);
  };

  const handleClose = () => {
    setActiveStep(0);
    setGenerated(false);
    setGenerating(false);
    setReportConfig({
      type: '',
      format: 'pdf',
      dateRange: 'last-month',
      includeCharts: true,
      includeRawData: false,
    });
    onClose();
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <PdfIcon color="error" />;
      case 'excel': return <ExcelIcon color="success" />;
      case 'csv': return <CsvIcon color="info" />;
      default: return <PdfIcon />;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Choose Report Type
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              {reportTypes.map((type) => (
                <Box
                  key={type.value}
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: reportConfig.type === type.value ? 'primary.main' : 'grey.300',
                    borderRadius: 1,
                    cursor: 'pointer',
                    backgroundColor: reportConfig.type === type.value ? 'primary.50' : 'background.paper',
                  }}
                  onClick={() => setReportConfig({ ...reportConfig, type: type.value })}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {type.label}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {type.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configure Report Options
            </Typography>
            <Box display="flex" flexDirection="column" gap={3}>
              <Box display="flex" gap={3} flexWrap="wrap">
                <FormControl sx={{ minWidth: 200, flex: 1 }}>
                  <InputLabel>Format</InputLabel>
                  <Select
                    value={reportConfig.format}
                    label="Format"
                    onChange={(e) => setReportConfig({ ...reportConfig, format: e.target.value })}
                  >
                    <MenuItem value="pdf">
                      <Box display="flex" alignItems="center" gap={1}>
                        <PdfIcon color="error" />
                        PDF Document
                      </Box>
                    </MenuItem>
                    <MenuItem value="excel">
                      <Box display="flex" alignItems="center" gap={1}>
                        <ExcelIcon color="success" />
                        Excel Spreadsheet
                      </Box>
                    </MenuItem>
                    <MenuItem value="csv">
                      <Box display="flex" alignItems="center" gap={1}>
                        <CsvIcon color="info" />
                        CSV Data
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 200, flex: 1 }}>
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={reportConfig.dateRange}
                    label="Date Range"
                    onChange={(e) => setReportConfig({ ...reportConfig, dateRange: e.target.value })}
                  >
                    <MenuItem value="last-week">Last Week</MenuItem>
                    <MenuItem value="last-month">Last Month</MenuItem>
                    <MenuItem value="last-quarter">Last Quarter</MenuItem>
                    <MenuItem value="last-year">Last Year</MenuItem>
                    <MenuItem value="custom">Custom Range</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {reportConfig.dateRange === 'custom' && (
                <Box display="flex" gap={3} flexWrap="wrap">
                  <TextField
                    label="Start Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 200, flex: 1 }}
                  />
                  <TextField
                    label="End Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 200, flex: 1 }}
                  />
                </Box>
              )}

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Include Options
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  <Chip
                    label="Charts & Graphs"
                    color={reportConfig.includeCharts ? 'primary' : 'default'}
                    onClick={() => setReportConfig({ 
                      ...reportConfig, 
                      includeCharts: !reportConfig.includeCharts 
                    })}
                    clickable
                  />
                  <Chip
                    label="Raw Data Tables"
                    color={reportConfig.includeRawData ? 'primary' : 'default'}
                    onClick={() => setReportConfig({ 
                      ...reportConfig, 
                      includeRawData: !reportConfig.includeRawData 
                    })}
                    clickable
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              Generate Report
            </Typography>
            {generating ? (
              <Box>
                <CircularProgress size={60} sx={{ mb: 2 }} />
                <Typography variant="body1">
                  Generating your {reportTypes.find(t => t.value === reportConfig.type)?.label}...
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  This may take a few moments
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography variant="body1" gutterBottom>
                  Ready to generate your report with the following configuration:
                </Typography>
                <Box display="flex" justifyContent="center" alignItems="center" gap={1} mb={2}>
                  {getFormatIcon(reportConfig.format)}
                  <Typography variant="body2">
                    {reportTypes.find(t => t.value === reportConfig.type)?.label} 
                    ({reportConfig.format.toUpperCase()})
                  </Typography>
                </Box>
                <Typography variant="body2" color="textSecondary">
                  Date Range: {reportConfig.dateRange.replace('-', ' ').toUpperCase()}
                </Typography>
              </Box>
            )}
          </Box>
        );

      default:
        return (
          <Box textAlign="center">
            <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Report Generated Successfully!
            </Typography>
            <Alert severity="success" sx={{ mb: 2 }}>
              Your {reportTypes.find(t => t.value === reportConfig.type)?.label} has been generated 
              and is ready for download.
            </Alert>
            <Button variant="contained" color="primary">
              Download Report
            </Button>
          </Box>
        );
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5">
          Farm Report Generator
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ width: '100%', mb: 3 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ mt: 3 }}>
          {renderStepContent(activeStep)}
        </Box>
      </DialogContent>

      {!generated && (
        <DialogActions>
          <Button onClick={handleClose}>
            Cancel
          </Button>
          {activeStep > 0 && (
            <Button onClick={handleBack} disabled={generating}>
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={!reportConfig.type || generating}
          >
            {activeStep === steps.length - 1 ? 'Generate Report' : 'Next'}
          </Button>
        </DialogActions>
      )}
      
      {generated && (
        <DialogActions>
          <Button onClick={handleClose} variant="contained">
            Close
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ReportGenerator;