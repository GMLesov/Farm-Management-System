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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Stack,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Assessment,
  Download,
  Visibility,
  Delete,
  Schedule,
  Settings,
  Add,
  Print,
  Email,
  CloudDownload,
  PictureAsPdf,
  TableChart,
  BarChart,
  TrendingUp,
  AttachMoney,
  Agriculture,
  Pets,
} from '@mui/icons-material';

interface Report {
  id: string;
  name: string;
  type: 'financial' | 'production' | 'inventory' | 'analytics';
  description: string;
  lastGenerated: string;
  format: 'PDF' | 'Excel' | 'CSV';
  status: 'ready' | 'generating' | 'scheduled';
  size: string;
}

const ReportsDashboard: React.FC = () => {
  const [reports] = useState<Report[]>([
    {
      id: '1',
      name: 'Monthly Financial Summary',
      type: 'financial',
      description: 'Complete financial overview including income, expenses, and profit analysis',
      lastGenerated: '2025-11-01T08:00:00',
      format: 'PDF',
      status: 'ready',
      size: '2.4 MB',
    },
    {
      id: '2',
      name: 'Crop Production Report',
      type: 'production',
      description: 'Detailed crop yield and production efficiency metrics',
      lastGenerated: '2025-10-28T14:30:00',
      format: 'Excel',
      status: 'ready',
      size: '1.8 MB',
    },
    {
      id: '3',
      name: 'Livestock Inventory',
      type: 'inventory',
      description: 'Current livestock count, health status, and breeding records',
      lastGenerated: '2025-11-02T16:45:00',
      format: 'CSV',
      status: 'ready',
      size: '856 KB',
    },
    {
      id: '4',
      name: 'Annual Analytics Report',
      type: 'analytics',
      description: 'Comprehensive year-over-year performance analysis',
      lastGenerated: '2025-10-25T10:15:00',
      format: 'PDF',
      status: 'generating',
      size: 'Generating...',
    },
  ]);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    name: '',
    type: 'financial' as const,
    description: '',
    format: 'PDF' as const,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState({ name: '', type: '' });
  const [selectedFormat, setSelectedFormat] = useState('PDF');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  
  // State for custom Material-UI dialogs
  const [emailConfirmOpen, setEmailConfirmOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [scheduleInput, setScheduleInput] = useState('weekly');
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: '', name: '' });

  // Helper function to generate mock PDF content
  const generateMockReportContent = (report: Report) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #2e7d32; }
            .header { border-bottom: 2px solid #2e7d32; padding-bottom: 20px; margin-bottom: 20px; }
            .section { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border: 1px solid #ddd; }
            th { background-color: #2e7d32; color: white; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${report.name}</h1>
            <p><strong>Type:</strong> ${report.type}</p>
            <p><strong>Generated:</strong> ${new Date(report.lastGenerated).toLocaleString()}</p>
            <p><strong>Status:</strong> ${report.status}</p>
          </div>
          
          <div class="section">
            <h2>Report Summary</h2>
            <p>${report.description}</p>
          </div>

          <div class="section">
            <h2>Sample Data</h2>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Total Revenue</td><td>$50,000</td><td>✓</td></tr>
                <tr><td>Total Expenses</td><td>$32,000</td><td>✓</td></tr>
                <tr><td>Net Profit</td><td>$18,000</td><td>✓</td></tr>
                <tr><td>Growth Rate</td><td>12.5%</td><td>✓</td></tr>
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>AgriTech Pro - Farm Management System</p>
            <p>Report ID: ${report.id} | Format: ${report.format}</p>
          </div>
        </body>
      </html>
    `;
  };

  // Handler functions
  const handleExportAllData = () => {
    setSnackbar({ open: true, message: 'Preparing comprehensive data export...', severity: 'info' });
    
    setTimeout(() => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `Farm_Data_Complete_Export_${timestamp}.csv`;
      
      // Generate comprehensive CSV with all farm data
      const csvContent = `Category,Item,Value,Unit,Status,Date
Animals,Cattle,45,heads,Healthy,2025-11-13
Animals,Chickens,200,heads,Healthy,2025-11-13
Animals,Sheep,30,heads,Healthy,2025-11-13
Crops,Wheat,500,kg,Harvested,2025-11-13
Crops,Corn,750,kg,Growing,2025-11-13
Crops,Tomatoes,300,kg,Ready,2025-11-13
Financial,Revenue,50000,USD,Received,2025-11-13
Financial,Expenses,32000,USD,Paid,2025-11-13
Financial,Net Profit,18000,USD,Current,2025-11-13
Equipment,Tractors,3,units,Operational,2025-11-13
Equipment,Harvesters,2,units,Operational,2025-11-13
Equipment,Irrigation Systems,5,units,Active,2025-11-13
Inventory,Fertilizer,500,kg,Available,2025-11-13
Inventory,Seeds,200,kg,Available,2025-11-13
Inventory,Feed,1500,kg,Available,2025-11-13`;

      // Create and download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({ open: true, message: 'Complete farm data exported successfully!', severity: 'success' });
    }, 1500);
  };

  const handleEmailReports = () => {
    setEmailConfirmOpen(true);
  };

  const handleEmailConfirm = () => {
    setEmailConfirmOpen(false);
    setSnackbar({ open: true, message: 'Sending reports via email... Check your inbox shortly.', severity: 'info' });
    setTimeout(() => {
      setSnackbar({ open: true, message: 'Reports sent successfully to your email!', severity: 'success' });
    }, 2000);
  };

  const handleScheduleReports = () => {
    setScheduleDialogOpen(true);
  };

  const handleScheduleConfirm = () => {
    if (scheduleInput && scheduleInput.trim()) {
      setScheduleDialogOpen(false);
      setSnackbar({ open: true, message: `Reports scheduled for ${scheduleInput} generation!`, severity: 'success' });
    } else {
      setSnackbar({ open: true, message: 'Please enter a valid schedule', severity: 'error' });
    }
  };

  const handleReportSettings = () => {
    setSettingsDialogOpen(true);
  };

  const handleSettingsEnable = () => {
    setSettingsDialogOpen(false);
    setSnackbar({ open: true, message: 'Automatic report generation enabled!', severity: 'success' });
  };

  const handleSettingsDisable = () => {
    setSettingsDialogOpen(false);
    setSnackbar({ open: true, message: 'Automatic report generation disabled.', severity: 'info' });
  };

  const handleGenerateReport = (templateName: string, templateType: string) => {
    setSelectedTemplate({ name: templateName, type: templateType });
    setGenerateDialogOpen(true);
  };

  const handleGenerateCustomReport = () => {
    if (!newReport.name.trim()) {
      setSnackbar({ open: true, message: 'Please enter a report name', severity: 'error' });
      return;
    }

    setDialogOpen(false);
    setSnackbar({ open: true, message: `Generating ${newReport.name}...`, severity: 'info' });

    setTimeout(() => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      let content = '';
      let fileName = '';
      let mimeType = '';

      // Determine format and generate content
      const format = newReport.format === 'PDF' || newReport.format === 'Excel' ? 'HTML' : 'CSV';

      if (format === 'CSV') {
        // Generate CSV based on report type
        content = generateCSVContent(newReport.type);
        fileName = `${newReport.name.replace(/\s+/g, '_')}_${timestamp}.csv`;
        mimeType = 'text/csv';
      } else {
        // Generate HTML report
        content = generateHTMLReport(newReport.name, newReport.type, newReport.description);
        fileName = `${newReport.name.replace(/\s+/g, '_')}_${timestamp}.html`;
        mimeType = 'text/html';
      }

      // Create and download
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSnackbar({ open: true, message: `${newReport.name} generated and downloaded successfully!`, severity: 'success' });
      
      // Reset form
      setNewReport({ name: '', type: 'financial', description: '', format: 'PDF' });
    }, 1500);
  };

  const generateCSVContent = (type: string) => {
    switch(type) {
      case 'financial':
        return 'Date,Category,Amount,Type,Description\n' +
               '2025-11-01,Sales,$15000,Income,Crop Sales Revenue\n' +
               '2025-11-02,Equipment,$3500,Expense,Tractor Maintenance\n' +
               '2025-11-03,Feed,$1200,Expense,Animal Feed Purchase\n' +
               '2025-11-04,Sales,$8500,Income,Livestock Sales\n';
      case 'production':
        return 'Date,Product,Quantity,Unit,Yield,Quality\n' +
               '2025-11-01,Wheat,500,kg,95%,Excellent\n' +
               '2025-11-02,Corn,750,kg,92%,Good\n' +
               '2025-11-03,Milk,200,liters,98%,Premium\n';
      case 'inventory':
        return 'Item,Category,Quantity,Unit,Status,Location,Value\n' +
               'Cattle,Livestock,45,heads,Healthy,Barn A,$67500\n' +
               'Chickens,Livestock,200,heads,Healthy,Coop 1,$3000\n' +
               'Sheep,Livestock,30,heads,Healthy,Barn B,$15000\n' +
               'Tractors,Equipment,3,units,Operational,Garage,$45000\n' +
               'Harvesters,Equipment,2,units,Operational,Garage,$80000\n' +
               'Fertilizer,Supplies,500,kg,Available,Storage,$2500\n' +
               'Animal Feed,Supplies,1500,kg,Available,Feed Storage,$3000\n';
      case 'analytics':
        return 'Metric,Value,Previous,Change,Trend\n' +
               'Revenue,$50000,$45000,+11.1%,Up\n' +
               'Expenses,$32000,$35000,-8.6%,Down\n' +
               'Net Profit,$18000,$10000,+80%,Up\n';
      default:
        return 'Data\nSample data generated\n';
    }
  };

  const generateHTMLReport = (name: string, type: string, description: string) => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 1200px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
            .header h1 { color: white; margin: 0; }
            .section { background: white; padding: 25px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
            th { background-color: #2e7d32; color: white; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${name}</h1>
            <p>Generated: ${new Date().toLocaleString()}</p>
            <p>Type: ${type}</p>
          </div>
          <div class="section">
            <h2>Description</h2>
            <p>${description || 'Custom farm management report'}</p>
          </div>
          <div class="section">
            <h2>Report Data</h2>
            ${getDetailedTable(type)}
          </div>
        </body>
      </html>
    `;
  };

  const handleConfirmGenerate = (format: string = 'PDF') => {
    setGenerateDialogOpen(false);
    setSnackbar({ open: true, message: `Generating ${selectedTemplate.name}... This may take a few moments.`, severity: 'info' });
    
    // Generate report content based on template type
    setTimeout(() => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      let content = '';
      let fileName = '';
      let mimeType = '';

      if (format === 'CSV') {
        // Generate CSV content
        switch(selectedTemplate.type) {
          case 'financial':
            content = 'Date,Category,Amount,Type,Description\n' +
                     '2025-11-01,Sales,$15000,Income,Crop Sales Revenue\n' +
                     '2025-11-02,Equipment,$3500,Expense,Tractor Maintenance\n' +
                     '2025-11-03,Feed,$1200,Expense,Animal Feed Purchase\n' +
                     '2025-11-04,Sales,$8500,Income,Livestock Sales\n' +
                     '2025-11-05,Labor,$4000,Expense,Worker Salaries\n';
            break;
          case 'production':
            content = 'Date,Product,Quantity,Unit,Yield,Quality\n' +
                     '2025-11-01,Wheat,500,kg,95%,Excellent\n' +
                     '2025-11-02,Corn,750,kg,92%,Good\n' +
                     '2025-11-03,Milk,200,liters,98%,Premium\n' +
                     '2025-11-04,Eggs,1200,units,96%,Grade A\n';
            break;
          case 'inventory':
            content = 'Item,Category,Quantity,Unit,Status,Location,Value,Last Updated\n' +
                     'Cattle,Livestock,45,heads,Healthy,Barn A,$67500,2025-11-13\n' +
                     'Chickens,Livestock,200,heads,Healthy,Coop 1,$3000,2025-11-13\n' +
                     'Sheep,Livestock,30,heads,Healthy,Barn B,$15000,2025-11-13\n' +
                     'Pigs,Livestock,25,heads,Healthy,Barn C,$12500,2025-11-13\n' +
                     'Tractor,Equipment,3,units,Operational,Garage,$45000,2025-11-10\n' +
                     'Harvester,Equipment,2,units,Operational,Garage,$80000,2025-11-10\n' +
                     'Irrigation System,Equipment,5,units,Active,Field,$25000,2025-11-12\n' +
                     'Plows,Equipment,4,units,Operational,Garage,$8000,2025-11-10\n' +
                     'Seeders,Equipment,2,units,Operational,Garage,$6000,2025-11-10\n' +
                     'Fertilizer,Supplies,500,kg,Available,Storage Room A,$2500,2025-11-12\n' +
                     'Seeds - Wheat,Supplies,200,kg,Available,Storage Room B,$1200,2025-11-08\n' +
                     'Seeds - Corn,Supplies,150,kg,Available,Storage Room B,$900,2025-11-08\n' +
                     'Pesticides,Supplies,80,liters,Available,Chemical Storage,$1600,2025-11-09\n' +
                     'Animal Feed,Supplies,1500,kg,Available,Feed Storage,$3000,2025-11-11\n' +
                     'Hay Bales,Supplies,300,bales,Available,Hay Barn,$4500,2025-11-07\n' +
                     'Wheat Stock,Crops,500,kg,Ready,Grain Silo,$2000,2025-11-13\n' +
                     'Corn Stock,Crops,750,kg,Growing,Field 1,$3000,2025-11-13\n' +
                     'Tomatoes,Crops,300,kg,Ready,Greenhouse,$1500,2025-11-13\n' +
                     'Potatoes,Crops,400,kg,Harvested,Cold Storage,$800,2025-11-12\n' +
                     'Fuel - Diesel,Supplies,500,liters,Available,Fuel Tank,$750,2025-11-10\n';
            break;
          case 'analytics':
            content = 'Metric,Value,Previous,Change,Trend\n' +
                     'Revenue,$50000,$45000,+11.1%,Up\n' +
                     'Expenses,$32000,$35000,-8.6%,Down\n' +
                     'Net Profit,$18000,$10000,+80%,Up\n' +
                     'Production,2650kg,2400kg,+10.4%,Up\n';
            break;
        }
        fileName = `${selectedTemplate.name.replace(/\s+/g, '_')}_${timestamp}.csv`;
        mimeType = 'text/csv';
      } else {
        // Generate HTML content
        content = `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>${selectedTemplate.name}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; max-width: 1200px; margin: 0 auto; }
                h1 { color: #2e7d32; border-bottom: 3px solid #2e7d32; padding-bottom: 15px; }
                h2 { color: #424242; margin-top: 30px; }
                .header { background: linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%); color: white; padding: 30px; border-radius: 8px; margin-bottom: 30px; }
                .header h1 { color: white; border: none; margin: 0; }
                .meta { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px; }
                .meta-item { background: rgba(255,255,255,0.1); padding: 10px; border-radius: 4px; }
                .section { background: white; padding: 25px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
                th { background-color: #2e7d32; color: white; font-weight: bold; }
                tr:hover { background-color: #f5f5f5; }
                .summary-cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
                .card { background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; }
                .card h3 { margin: 0; color: #2e7d32; font-size: 32px; }
                .card p { margin: 10px 0 0 0; color: #666; }
                .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #e0e0e0; color: #666; text-align: center; }
                @media print { body { padding: 20px; } }
              </style>
            </head>
            <body>
              <div class="header">
                <h1>${selectedTemplate.name}</h1>
                <div class="meta">
                  <div class="meta-item"><strong>Generated:</strong> ${new Date().toLocaleString()}</div>
                  <div class="meta-item"><strong>Type:</strong> ${selectedTemplate.type}</div>
                  <div class="meta-item"><strong>Format:</strong> ${format}</div>
                  <div class="meta-item"><strong>Status:</strong> Complete</div>
                </div>
              </div>

              <div class="section">
                <h2>Executive Summary</h2>
                <p>${getTemplateDescription(selectedTemplate.type)}</p>
              </div>

              <div class="section">
                <h2>Key Metrics</h2>
                <div class="summary-cards">
                  ${getKeyMetrics(selectedTemplate.type)}
                </div>
              </div>

              <div class="section">
                <h2>Detailed Data</h2>
                ${getDetailedTable(selectedTemplate.type)}
              </div>

              <div class="footer">
                <p><strong>AgriTech Pro - Farm Management System</strong></p>
                <p>Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              </div>
            </body>
          </html>
        `;
        fileName = `${selectedTemplate.name.replace(/\s+/g, '_')}_${timestamp}.html`;
        mimeType = 'text/html';
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSnackbar({ open: true, message: `${selectedTemplate.name} generated and downloaded successfully!`, severity: 'success' });
    }, 1500);
  };

  const getTemplateDescription = (type: string) => {
    switch(type) {
      case 'financial': return 'Comprehensive analysis of farm financial performance including revenue, expenses, and profitability metrics.';
      case 'production': return 'Detailed overview of crop yields and production efficiency across all farming operations.';
      case 'inventory': return 'Complete inventory tracking of livestock, equipment, and supplies with current status.';
      case 'analytics': return 'Performance trends and insights showing year-over-year growth and key indicators.';
      default: return 'Farm management report with comprehensive data analysis.';
    }
  };

  const getKeyMetrics = (type: string) => {
    switch(type) {
      case 'financial':
        return `
          <div class="card"><h3>$50,000</h3><p>Total Revenue</p></div>
          <div class="card"><h3>$32,000</h3><p>Total Expenses</p></div>
          <div class="card"><h3>$18,000</h3><p>Net Profit</p></div>
          <div class="card"><h3>12.5%</h3><p>Growth Rate</p></div>
        `;
      case 'production':
        return `
          <div class="card"><h3>2,650</h3><p>Total Yield (kg)</p></div>
          <div class="card"><h3>95%</h3><p>Efficiency</p></div>
          <div class="card"><h3>23</h3><p>Active Fields</p></div>
          <div class="card"><h3>+10%</h3><p>YoY Growth</p></div>
        `;
      case 'inventory':
        return `
          <div class="card"><h3>300</h3><p>Total Livestock</p></div>
          <div class="card"><h3>16</h3><p>Equipment Items</p></div>
          <div class="card"><h3>20</h3><p>Supply Items</p></div>
          <div class="card"><h3>$284,750</h3><p>Total Value</p></div>
        `;
      case 'analytics':
        return `
          <div class="card"><h3>+80%</h3><p>Profit Growth</p></div>
          <div class="card"><h3>95%</h3><p>Quality Score</p></div>
          <div class="card"><h3>-8.6%</h3><p>Cost Reduction</p></div>
          <div class="card"><h3>4.8</h3><p>Rating</p></div>
        `;
      default: return '';
    }
  };

  const getDetailedTable = (type: string) => {
    switch(type) {
      case 'financial':
        return `
          <table>
            <thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Type</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td>2025-11-01</td><td>Sales</td><td>$15,000</td><td>Income</td><td>Crop Sales Revenue</td></tr>
              <tr><td>2025-11-02</td><td>Equipment</td><td>$3,500</td><td>Expense</td><td>Tractor Maintenance</td></tr>
              <tr><td>2025-11-03</td><td>Feed</td><td>$1,200</td><td>Expense</td><td>Animal Feed Purchase</td></tr>
              <tr><td>2025-11-04</td><td>Sales</td><td>$8,500</td><td>Income</td><td>Livestock Sales</td></tr>
              <tr><td>2025-11-05</td><td>Labor</td><td>$4,000</td><td>Expense</td><td>Worker Salaries</td></tr>
            </tbody>
          </table>
        `;
      case 'production':
        return `
          <table>
            <thead><tr><th>Date</th><th>Product</th><th>Quantity</th><th>Unit</th><th>Yield</th><th>Quality</th></tr></thead>
            <tbody>
              <tr><td>2025-11-01</td><td>Wheat</td><td>500</td><td>kg</td><td>95%</td><td>Excellent</td></tr>
              <tr><td>2025-11-02</td><td>Corn</td><td>750</td><td>kg</td><td>92%</td><td>Good</td></tr>
              <tr><td>2025-11-03</td><td>Milk</td><td>200</td><td>liters</td><td>98%</td><td>Premium</td></tr>
              <tr><td>2025-11-04</td><td>Eggs</td><td>1,200</td><td>units</td><td>96%</td><td>Grade A</td></tr>
            </tbody>
          </table>
        `;
      case 'inventory':
        return `
          <table>
            <thead><tr><th>Item</th><th>Category</th><th>Quantity</th><th>Unit</th><th>Status</th><th>Location</th><th>Value</th></tr></thead>
            <tbody>
              <tr><td colspan="7" style="background: #e8f5e9; font-weight: bold;">LIVESTOCK</td></tr>
              <tr><td>Cattle</td><td>Livestock</td><td>45</td><td>heads</td><td>Healthy</td><td>Barn A</td><td>$67,500</td></tr>
              <tr><td>Chickens</td><td>Livestock</td><td>200</td><td>heads</td><td>Healthy</td><td>Coop 1</td><td>$3,000</td></tr>
              <tr><td>Sheep</td><td>Livestock</td><td>30</td><td>heads</td><td>Healthy</td><td>Barn B</td><td>$15,000</td></tr>
              <tr><td>Pigs</td><td>Livestock</td><td>25</td><td>heads</td><td>Healthy</td><td>Barn C</td><td>$12,500</td></tr>
              <tr><td colspan="7" style="background: #e3f2fd; font-weight: bold;">EQUIPMENT</td></tr>
              <tr><td>Tractors</td><td>Equipment</td><td>3</td><td>units</td><td>Operational</td><td>Garage</td><td>$45,000</td></tr>
              <tr><td>Harvesters</td><td>Equipment</td><td>2</td><td>units</td><td>Operational</td><td>Garage</td><td>$80,000</td></tr>
              <tr><td>Irrigation Systems</td><td>Equipment</td><td>5</td><td>units</td><td>Active</td><td>Field</td><td>$25,000</td></tr>
              <tr><td>Plows</td><td>Equipment</td><td>4</td><td>units</td><td>Operational</td><td>Garage</td><td>$8,000</td></tr>
              <tr><td>Seeders</td><td>Equipment</td><td>2</td><td>units</td><td>Operational</td><td>Garage</td><td>$6,000</td></tr>
              <tr><td colspan="7" style="background: #fff3e0; font-weight: bold;">SUPPLIES</td></tr>
              <tr><td>Fertilizer</td><td>Supplies</td><td>500</td><td>kg</td><td>Available</td><td>Storage Room A</td><td>$2,500</td></tr>
              <tr><td>Seeds - Wheat</td><td>Supplies</td><td>200</td><td>kg</td><td>Available</td><td>Storage Room B</td><td>$1,200</td></tr>
              <tr><td>Seeds - Corn</td><td>Supplies</td><td>150</td><td>kg</td><td>Available</td><td>Storage Room B</td><td>$900</td></tr>
              <tr><td>Pesticides</td><td>Supplies</td><td>80</td><td>liters</td><td>Available</td><td>Chemical Storage</td><td>$1,600</td></tr>
              <tr><td>Animal Feed</td><td>Supplies</td><td>1,500</td><td>kg</td><td>Available</td><td>Feed Storage</td><td>$3,000</td></tr>
              <tr><td>Hay Bales</td><td>Supplies</td><td>300</td><td>bales</td><td>Available</td><td>Hay Barn</td><td>$4,500</td></tr>
              <tr><td>Fuel - Diesel</td><td>Supplies</td><td>500</td><td>liters</td><td>Available</td><td>Fuel Tank</td><td>$750</td></tr>
              <tr><td colspan="7" style="background: #f3e5f5; font-weight: bold;">CROPS IN STORAGE</td></tr>
              <tr><td>Wheat Stock</td><td>Crops</td><td>500</td><td>kg</td><td>Ready</td><td>Grain Silo</td><td>$2,000</td></tr>
              <tr><td>Corn Stock</td><td>Crops</td><td>750</td><td>kg</td><td>Growing</td><td>Field 1</td><td>$3,000</td></tr>
              <tr><td>Tomatoes</td><td>Crops</td><td>300</td><td>kg</td><td>Ready</td><td>Greenhouse</td><td>$1,500</td></tr>
              <tr><td>Potatoes</td><td>Crops</td><td>400</td><td>kg</td><td>Harvested</td><td>Cold Storage</td><td>$800</td></tr>
              <tr><td colspan="6" style="background: #2e7d32; color: white; font-weight: bold; text-align: right;">TOTAL INVENTORY VALUE</td><td style="background: #2e7d32; color: white; font-weight: bold;">$284,750</td></tr>
            </tbody>
          </table>
        `;
      case 'analytics':
        return `
          <table>
            <thead><tr><th>Metric</th><th>Current Value</th><th>Previous Period</th><th>Change</th><th>Trend</th></tr></thead>
            <tbody>
              <tr><td>Revenue</td><td>$50,000</td><td>$45,000</td><td>+11.1%</td><td>📈 Up</td></tr>
              <tr><td>Expenses</td><td>$32,000</td><td>$35,000</td><td>-8.6%</td><td>📉 Down</td></tr>
              <tr><td>Net Profit</td><td>$18,000</td><td>$10,000</td><td>+80%</td><td>📈 Up</td></tr>
              <tr><td>Production</td><td>2,650 kg</td><td>2,400 kg</td><td>+10.4%</td><td>📈 Up</td></tr>
            </tbody>
          </table>
        `;
      default: return '';
    }
  };

  const handleDownloadReport = (reportId: string, reportName: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;

    setSnackbar({ open: true, message: `Downloading ${reportName}...`, severity: 'info' });
    
    // Generate HTML content
    const htmlContent = generateMockReportContent(report);
    
    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportName.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    setTimeout(() => {
      setSnackbar({ open: true, message: `${reportName} downloaded successfully!`, severity: 'success' });
    }, 500);
  };

  const handleViewReport = (reportId: string, reportName: string) => {
    const report = reports.find(r => r.id === reportId);
    if (!report) return;
    
    setViewingReport(report);
    setViewDialogOpen(true);
    setSnackbar({ open: true, message: `Opening ${reportName}...`, severity: 'info' });
  };

  const handlePrintReport = (reportId: string, reportName: string) => {
    setSnackbar({ open: true, message: `Preparing ${reportName} for printing...`, severity: 'info' });
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleDeleteReport = (reportId: string, reportName: string) => {
    setDeleteTarget({ id: reportId, name: reportName });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setSnackbar({ open: true, message: `${deleteTarget.name} deleted successfully!`, severity: 'success' });
  };

  const handleBulkExport = (exportType: string) => {
    setSnackbar({ open: true, message: `Preparing ${exportType} export...`, severity: 'info' });
    
    // Simulate export process
    setTimeout(() => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${exportType.replace(/\s+/g, '_')}_${timestamp}.csv`;
      
      // Generate CSV content based on export type
      let csvContent = '';
      switch(exportType) {
        case 'Full Farm Data':
          csvContent = 'Category,Item,Value,Date\n' +
                      'Animals,Total Count,150,2025-11-13\n' +
                      'Crops,Active Fields,23,2025-11-13\n' +
                      'Financial,Revenue,$50000,2025-11-13\n' +
                      'Equipment,Total Items,45,2025-11-13\n';
          break;
        case 'Financial Data':
          csvContent = 'Date,Type,Category,Amount,Description\n' +
                      '2025-11-01,Income,Sales,$5000,Crop Sales\n' +
                      '2025-11-02,Expense,Equipment,$1200,Tractor Maintenance\n' +
                      '2025-11-03,Income,Sales,$3500,Livestock Sales\n' +
                      '2025-11-04,Expense,Feed,$800,Animal Feed Purchase\n';
          break;
        case 'Production Analytics':
          csvContent = 'Date,Product,Quantity,Unit,Quality Score\n' +
                      '2025-11-01,Wheat,500,kg,95%\n' +
                      '2025-11-02,Corn,750,kg,92%\n' +
                      '2025-11-03,Milk,200,liters,98%\n' +
                      '2025-11-04,Eggs,1000,units,96%\n';
          break;
      }
      
      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSnackbar({ open: true, message: `${exportType} exported successfully!`, severity: 'success' });
    }, 1500);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financial': return <AttachMoney />;
      case 'production': return <Agriculture />;
      case 'inventory': return <Pets />;
      case 'analytics': return <TrendingUp />;
      default: return <Assessment />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'financial': return 'success';
      case 'production': return 'primary';
      case 'inventory': return 'warning';
      case 'analytics': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'success';
      case 'generating': return 'info';
      case 'scheduled': return 'warning';
      default: return 'default';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'PDF': return <PictureAsPdf />;
      case 'Excel': return <TableChart />;
      case 'CSV': return <TableChart />;
      default: return <Download />;
    }
  };

  const reportTemplates = [
    {
      name: 'Financial Summary',
      type: 'financial',
      description: 'Income, expenses, and profit analysis',
      icon: <AttachMoney />,
    },
    {
      name: 'Production Report',
      type: 'production',
      description: 'Crop yields and production metrics',
      icon: <Agriculture />,
    },
    {
      name: 'Inventory Report',
      type: 'inventory',
      description: 'Livestock and equipment inventory',
      icon: <Pets />,
    },
    {
      name: 'Analytics Dashboard',
      type: 'analytics',
      description: 'Performance trends and insights',
      icon: <BarChart />,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Main Heading */}
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
        Reports Dashboard
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Generate Report
        </Button>
      </Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        Reports are automatically generated monthly. You can also create custom reports on demand.
      </Alert>

      {/* Quick Actions */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button variant="outlined" startIcon={<Download />} onClick={handleExportAllData}>
              Export All Data
            </Button>
            <Button variant="outlined" startIcon={<Email />} onClick={handleEmailReports}>
              Email Reports
            </Button>
            <Button variant="outlined" startIcon={<Schedule />} onClick={handleScheduleReports}>
              Schedule Reports
            </Button>
            <Button variant="outlined" startIcon={<Settings />} onClick={handleReportSettings}>
              Report Settings
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Report Templates
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {reportTemplates.map((template, index) => (
              <Card key={index} sx={{ minWidth: 200, cursor: 'pointer', '&:hover': { boxShadow: 4 } }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ fontSize: 48, color: 'primary.main', mb: 1 }}>
                    {template.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {template.description}
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="small" 
                    startIcon={<Add />}
                    onClick={() => handleGenerateReport(template.name, template.type)}
                  >
                    Generate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Generated Reports */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Generated Reports
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Report Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Format</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Generated</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTypeIcon(report.type)}
                        <Box>
                          <Typography variant="subtitle2">{report.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {report.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.type}
                        color={getTypeColor(report.type) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getFormatIcon(report.format)}
                        {report.format}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.status}
                        color={getStatusColor(report.status) as any}
                        size="small"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(report.lastGenerated).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{report.size}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        color="primary" 
                        disabled={report.status === 'generating'}
                        onClick={() => handleDownloadReport(report.id, report.name)}
                        title="Download Report"
                      >
                        <Download />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="secondary" 
                        disabled={report.status === 'generating'}
                        onClick={() => handleViewReport(report.id, report.name)}
                        title="View Report"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="info" 
                        disabled={report.status === 'generating'}
                        onClick={() => handlePrintReport(report.id, report.name)}
                        title="Print Report"
                      >
                        <Print />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteReport(report.id, report.name)}
                        title="Delete Report"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Bulk Export Options
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CloudDownload />
              </ListItemIcon>
              <ListItemText
                primary="Full Farm Data Export"
                secondary="Export all farm data including animals, crops, financial records, and more"
              />
              <ListItemSecondaryAction>
                <Button variant="outlined" size="small" onClick={() => handleBulkExport('Full Farm Data')}>
                  Export
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <TableChart />
              </ListItemIcon>
              <ListItemText
                primary="Financial Data Export"
                secondary="Export all financial transactions and summaries"
              />
              <ListItemSecondaryAction>
                <Button variant="outlined" size="small" onClick={() => handleBulkExport('Financial Data')}>
                  Export
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem>
              <ListItemIcon>
                <Assessment />
              </ListItemIcon>
              <ListItemText
                primary="Production Analytics Export"
                secondary="Export crop and livestock production data"
              />
              <ListItemSecondaryAction>
                <Button variant="outlined" size="small" onClick={() => handleBulkExport('Production Analytics')}>
                  Export
                </Button>
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Generate Report Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Custom Report</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Report Name"
              value={newReport.name}
              onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={newReport.type}
                label="Report Type"
                onChange={(e) => setNewReport({ ...newReport, type: e.target.value as any })}
              >
                <MenuItem value="financial">Financial</MenuItem>
                <MenuItem value="production">Production</MenuItem>
                <MenuItem value="inventory">Inventory</MenuItem>
                <MenuItem value="analytics">Analytics</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Export Format</InputLabel>
              <Select
                value={newReport.format}
                label="Export Format"
                onChange={(e) => setNewReport({ ...newReport, format: e.target.value as any })}
              >
                <MenuItem value="PDF">PDF</MenuItem>
                <MenuItem value="Excel">Excel</MenuItem>
                <MenuItem value="CSV">CSV</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Description"
              value={newReport.description}
              onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleGenerateCustomReport} startIcon={<Download />}>
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Viewer Dialog */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={() => setViewDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { height: '80vh' } }}
      >
        <DialogTitle>
          {viewingReport?.name}
          <IconButton
            onClick={() => setViewDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Delete />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {viewingReport && (
            <Box>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Report Details</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Type</Typography>
                      <Chip label={viewingReport.type} size="small" sx={{ mt: 0.5 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Format</Typography>
                      <Chip label={viewingReport.format} size="small" sx={{ mt: 0.5 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Status</Typography>
                      <Chip label={viewingReport.status} color="success" size="small" sx={{ mt: 0.5 }} />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">Size</Typography>
                      <Typography variant="body1">{viewingReport.size}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">Last Generated</Typography>
                    <Typography variant="body1">
                      {new Date(viewingReport.lastGenerated).toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Report Preview</Typography>
                  <Typography variant="body2" paragraph>{viewingReport.description}</Typography>
                  
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>Sample Data Preview</Typography>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Metric</strong></TableCell>
                          <TableCell><strong>Value</strong></TableCell>
                          <TableCell><strong>Status</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>Total Revenue</TableCell>
                          <TableCell>$50,000</TableCell>
                          <TableCell><Chip label="Active" color="success" size="small" /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Total Expenses</TableCell>
                          <TableCell>$32,000</TableCell>
                          <TableCell><Chip label="Active" color="success" size="small" /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Net Profit</TableCell>
                          <TableCell>$18,000</TableCell>
                          <TableCell><Chip label="Active" color="success" size="small" /></TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Growth Rate</TableCell>
                          <TableCell>12.5%</TableCell>
                          <TableCell><Chip label="Trending Up" color="info" size="small" /></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            startIcon={<Download />} 
            onClick={() => viewingReport && handleDownloadReport(viewingReport.id, viewingReport.name)}
          >
            Download
          </Button>
          <Button 
            startIcon={<Print />} 
            onClick={() => window.print()}
          >
            Print
          </Button>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Template Generate Confirmation Dialog */}
      <Dialog open={generateDialogOpen} onClose={() => setGenerateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate {selectedTemplate.name}</DialogTitle>
        <DialogContent>
          <Typography>
            Generate the {selectedTemplate.name} with the latest data. Choose your preferred export format below.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Export Format</InputLabel>
              <Select 
                value={selectedFormat} 
                label="Export Format"
                onChange={(e) => setSelectedFormat(e.target.value)}
              >
                <MenuItem value="HTML">HTML (Viewable in Browser)</MenuItem>
                <MenuItem value="CSV">CSV (Spreadsheet)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenerateDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => handleConfirmGenerate(selectedFormat)} startIcon={<Download />}>
            Generate & Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Confirmation Dialog */}
      <Dialog 
        open={emailConfirmOpen} 
        onClose={() => setEmailConfirmOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(126, 58, 242, 0.05) 0%, rgba(91, 33, 182, 0.05) 100%)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Email color="primary" />
            <Typography variant="h6">Email Reports</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Send weekly report summary to your registered email address?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEmailConfirm} startIcon={<Email />}>
            Send Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Reports Dialog */}
      <Dialog 
        open={scheduleDialogOpen} 
        onClose={() => setScheduleDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(126, 58, 242, 0.05) 0%, rgba(91, 33, 182, 0.05) 100%)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule color="primary" />
            <Typography variant="h6">Schedule Reports</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Enter schedule for automatic report generation:
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Schedule (e.g., daily, weekly, monthly)"
            type="text"
            fullWidth
            variant="outlined"
            value={scheduleInput}
            onChange={(e) => setScheduleInput(e.target.value)}
            placeholder="weekly"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleScheduleConfirm} startIcon={<Schedule />}>
            Set Schedule
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog 
        open={settingsDialogOpen} 
        onClose={() => setSettingsDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(126, 58, 242, 0.05) 0%, rgba(91, 33, 182, 0.05) 100%)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings color="primary" />
            <Typography variant="h6">Report Settings</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Enable automatic report generation?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            When enabled, reports will be automatically generated based on your schedule.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSettingsDisable}>Disable</Button>
          <Button variant="contained" onClick={handleSettingsEnable} color="success">
            Enable
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteConfirmOpen} 
        onClose={() => setDeleteConfirmOpen(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.05) 0%, rgba(211, 47, 47, 0.05) 100%)',
            backdropFilter: 'blur(10px)',
          }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Delete color="error" />
            <Typography variant="h6">Delete Report</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteConfirm} startIcon={<Delete />}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportsDashboard;