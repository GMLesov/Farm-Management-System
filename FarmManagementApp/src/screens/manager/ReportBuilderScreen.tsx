import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  TextInput,
  Switch,
  Chip,
  Divider,
  List,
  useTheme,
  Surface,
  IconButton,
  Checkbox,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ReportGenerationService, {
  ReportTemplate,
  ReportSection,
  ReportParameter,
} from '../../services/ReportGenerationService';

interface ReportBuilderScreenProps {
  navigation: any;
  route: {
    params?: {
      templateId?: string;
    };
  };
}

const ReportBuilderScreen: React.FC<ReportBuilderScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const templateId = route.params?.templateId;
  
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [selectedDataSources, setSelectedDataSources] = useState<string[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [parameters, setParameters] = useState<{ [key: string]: any }>({});
  const [outputFormat, setOutputFormat] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [schedulingEnabled, setSchedulingEnabled] = useState(false);
  const [template, setTemplate] = useState<ReportTemplate | null>(null);

  const availableDataSources = [
    { id: 'crops', name: 'Crop Data', description: 'Plant varieties, growth stages, harvest data', icon: 'sprout' },
    { id: 'livestock', name: 'Livestock Records', description: 'Animal health, breeding, production data', icon: 'cow' },
    { id: 'tasks', name: 'Task Management', description: 'Work assignments, completion status, time tracking', icon: 'clipboard-check' },
    { id: 'financial', name: 'Financial Data', description: 'Revenue, expenses, profitability analysis', icon: 'currency-usd' },
    { id: 'weather', name: 'Weather Analytics', description: 'Weather history, forecasts, agricultural indices', icon: 'weather-cloudy' },
    { id: 'inventory', name: 'Inventory Management', description: 'Stock levels, equipment, supplies tracking', icon: 'package-variant' },
    { id: 'staff', name: 'Staff & Labor', description: 'Worker assignments, hours, productivity metrics', icon: 'account-group' },
    { id: 'compliance', name: 'Compliance Records', description: 'Certifications, inspections, regulatory data', icon: 'shield-check' },
  ];

  const availableSections = [
    { 
      id: 'executive_summary', 
      name: 'Executive Summary', 
      type: 'summary', 
      description: 'High-level overview with key metrics and insights',
      icon: 'chart-box'
    },
    { 
      id: 'data_tables', 
      name: 'Data Tables', 
      type: 'table', 
      description: 'Detailed tabular data with filtering and sorting',
      icon: 'table'
    },
    { 
      id: 'charts_graphs', 
      name: 'Charts & Graphs', 
      type: 'chart', 
      description: 'Visual data representation with various chart types',
      icon: 'chart-line'
    },
    { 
      id: 'kpi_metrics', 
      name: 'KPI Metrics', 
      type: 'kpi', 
      description: 'Key performance indicators with trend analysis',
      icon: 'speedometer'
    },
    { 
      id: 'timeline_events', 
      name: 'Timeline & Events', 
      type: 'timeline', 
      description: 'Chronological view of activities and milestones',
      icon: 'timeline'
    },
    { 
      id: 'image_gallery', 
      name: 'Images & Photos', 
      type: 'image', 
      description: 'Photo documentation and visual evidence',
      icon: 'image-multiple'
    },
    { 
      id: 'custom_text', 
      name: 'Custom Text', 
      type: 'text', 
      description: 'Custom notes, observations, and commentary',
      icon: 'text'
    },
  ];

  useEffect(() => {
    if (templateId) {
      const existingTemplate = ReportGenerationService.getTemplate(templateId);
      if (existingTemplate) {
        setTemplate(existingTemplate);
        setReportName(existingTemplate.name);
        setReportDescription(existingTemplate.description);
        setSelectedDataSources(existingTemplate.dataRequirements);
        setSelectedSections(existingTemplate.sections.map(s => s.id));
        setOutputFormat(existingTemplate.outputFormats[0] as any);
      }
    }
  }, [templateId]);

  const handleDataSourceToggle = (dataSourceId: string) => {
    setSelectedDataSources(prev => 
      prev.includes(dataSourceId)
        ? prev.filter(id => id !== dataSourceId)
        : [...prev, dataSourceId]
    );
  };

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections(prev => 
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleParameterChange = (paramId: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [paramId]: value,
    }));
  };

  const validateReport = (): boolean => {
    if (!reportName.trim()) {
      Alert.alert('Validation Error', 'Please enter a report name');
      return false;
    }

    if (selectedDataSources.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one data source');
      return false;
    }

    if (selectedSections.length === 0) {
      Alert.alert('Validation Error', 'Please select at least one report section');
      return false;
    }

    return true;
  };

  const handleSaveTemplate = async () => {
    if (!validateReport()) return;

    try {
      const newTemplate: Omit<ReportTemplate, 'id'> = {
        name: reportName,
        category: 'custom',
        description: reportDescription || 'Custom report created by user',
        icon: 'file-document-edit',
        dataRequirements: selectedDataSources,
        sections: selectedSections.map(sectionId => {
          const sectionDef = availableSections.find(s => s.id === sectionId);
          return {
            id: sectionId,
            name: sectionDef?.name || sectionId,
            type: sectionDef?.type as any || 'table',
            required: false,
            configurable: true,
            dataSource: selectedDataSources[0] || 'general',
          };
        }),
        parameters: [
          {
            id: 'dateRange',
            name: 'Date Range',
            type: 'dateRange',
            required: true,
          },
        ],
        outputFormats: [outputFormat],
        estimatedGenerationTime: 30,
        isCustomizable: true,
        tags: ['custom', ...selectedDataSources.slice(0, 3)],
      };

      const templateId = ReportGenerationService.createCustomTemplate(newTemplate);
      
      Alert.alert(
        'Template Saved',
        'Your custom report template has been saved successfully.',
        [
          { text: 'Create Another', style: 'cancel' },
          { 
            text: 'Generate Report', 
            onPress: () => navigation.navigate('ReportDashboard', { generateTemplate: templateId })
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save report template');
      console.error('Template save error:', error);
    }
  };

  const handleGenerateReport = async () => {
    if (!validateReport()) return;

    try {
      // Create a temporary template for immediate generation
      const tempTemplate: Omit<ReportTemplate, 'id'> = {
        name: reportName,
        category: 'custom',
        description: reportDescription || 'One-time custom report',
        icon: 'file-document',
        dataRequirements: selectedDataSources,
        sections: selectedSections.map(sectionId => {
          const sectionDef = availableSections.find(s => s.id === sectionId);
          return {
            id: sectionId,
            name: sectionDef?.name || sectionId,
            type: sectionDef?.type as any || 'table',
            required: false,
            configurable: true,
            dataSource: selectedDataSources[0] || 'general',
          };
        }),
        parameters: [],
        outputFormats: [outputFormat],
        estimatedGenerationTime: 30,
        isCustomizable: true,
        tags: ['custom'],
      };

      const templateId = ReportGenerationService.createCustomTemplate(tempTemplate);
      
      const defaultParameters = {
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
      };

      const reportId = await ReportGenerationService.generateReport(
        templateId,
        defaultParameters
      );

      Alert.alert(
        'Report Generation Started',
        'Your custom report is being generated. You\'ll be notified when it\'s ready.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate report');
      console.error('Report generation error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Report Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Report Information
            </Text>
            
            <TextInput
              label="Report Name"
              value={reportName}
              onChangeText={setReportName}
              mode="outlined"
              style={styles.input}
              placeholder="Enter a descriptive name for your report"
            />
            
            <TextInput
              label="Description (Optional)"
              value={reportDescription}
              onChangeText={setReportDescription}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
              placeholder="Describe what this report will show"
            />
          </Card.Content>
        </Card>

        {/* Data Sources */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Select Data Sources
            </Text>
            <Text variant="bodySmall" style={styles.subtitle}>
              Choose which farm data to include in your report
            </Text>
            
            {availableDataSources.map((source) => (
              <Surface key={source.id} style={styles.optionCard} elevation={1}>
                <View style={styles.optionHeader}>
                  <View style={styles.optionInfo}>
                    <Icon name={source.icon} size={24} color={theme.colors.primary} />
                    <View style={styles.optionText}>
                      <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                        {source.name}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {source.description}
                      </Text>
                    </View>
                  </View>
                  <Checkbox
                    status={selectedDataSources.includes(source.id) ? 'checked' : 'unchecked'}
                    onPress={() => handleDataSourceToggle(source.id)}
                  />
                </View>
              </Surface>
            ))}
          </Card.Content>
        </Card>

        {/* Report Sections */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Report Sections
            </Text>
            <Text variant="bodySmall" style={styles.subtitle}>
              Select how you want your data to be presented
            </Text>
            
            {availableSections.map((section) => (
              <Surface key={section.id} style={styles.optionCard} elevation={1}>
                <View style={styles.optionHeader}>
                  <View style={styles.optionInfo}>
                    <Icon name={section.icon} size={24} color={theme.colors.secondary} />
                    <View style={styles.optionText}>
                      <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                        {section.name}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {section.description}
                      </Text>
                    </View>
                  </View>
                  <Checkbox
                    status={selectedSections.includes(section.id) ? 'checked' : 'unchecked'}
                    onPress={() => handleSectionToggle(section.id)}
                  />
                </View>
              </Surface>
            ))}
          </Card.Content>
        </Card>

        {/* Output Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Output Settings
            </Text>
            
            <Text variant="bodyMedium" style={styles.label}>
              Output Format
            </Text>
            <View style={styles.formatOptions}>
              {(['pdf', 'excel', 'csv'] as const).map((format) => (
                <Chip
                  key={format}
                  mode={outputFormat === format ? 'flat' : 'outlined'}
                  onPress={() => setOutputFormat(format)}
                  style={styles.formatChip}
                >
                  {format.toUpperCase()}
                </Chip>
              ))}
            </View>

            <Divider style={styles.divider} />

            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text variant="bodyMedium">Enable Scheduling</Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Automatically generate this report on a regular basis
                </Text>
              </View>
              <Switch
                value={schedulingEnabled}
                onValueChange={setSchedulingEnabled}
              />
            </View>

            {schedulingEnabled && (
              <Surface style={styles.schedulingCard} elevation={1}>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                  Scheduling Options
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Advanced scheduling options will be available after saving the template.
                </Text>
              </Surface>
            )}
          </Card.Content>
        </Card>

        {/* Preview */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Report Preview
            </Text>
            
            <Surface style={styles.previewCard} elevation={1}>
              <View style={styles.previewHeader}>
                <Icon name="file-document" size={32} color={theme.colors.primary} />
                <View style={styles.previewInfo}>
                  <Text variant="titleSmall" style={{ fontWeight: 'bold' }}>
                    {reportName || 'Custom Report'}
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    {selectedDataSources.length} data sources • {selectedSections.length} sections
                  </Text>
                </View>
              </View>

              <View style={styles.previewSections}>
                <Text variant="bodySmall" style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  Data Sources:
                </Text>
                <View style={styles.previewTags}>
                  {selectedDataSources.map((sourceId) => {
                    const source = availableDataSources.find(s => s.id === sourceId);
                    return (
                      <Chip key={sourceId} mode="outlined" compact style={styles.previewTag}>
                        {source?.name}
                      </Chip>
                    );
                  })}
                </View>

                <Text variant="bodySmall" style={{ fontWeight: 'bold', marginBottom: 4, marginTop: 8 }}>
                  Sections:
                </Text>
                <View style={styles.previewTags}>
                  {selectedSections.map((sectionId) => {
                    const section = availableSections.find(s => s.id === sectionId);
                    return (
                      <Chip key={sectionId} mode="outlined" compact style={styles.previewTag}>
                        {section?.name}
                      </Chip>
                    );
                  })}
                </View>

                <Text variant="bodySmall" style={{ marginTop: 8 }}>
                  Output: <Text style={{ fontWeight: 'bold' }}>{outputFormat.toUpperCase()}</Text>
                  {schedulingEnabled && ' • Scheduled'}
                </Text>
              </View>
            </Surface>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.actionButton}
        >
          Cancel
        </Button>
        <Button
          mode="outlined"
          onPress={handleSaveTemplate}
          style={styles.actionButton}
          disabled={!reportName.trim() || selectedDataSources.length === 0}
        >
          Save Template
        </Button>
        <Button
          mode="contained"
          onPress={handleGenerateReport}
          style={styles.actionButton}
          disabled={!reportName.trim() || selectedDataSources.length === 0}
        >
          Generate Now
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    color: '#666',
    marginBottom: 12,
  },
  input: {
    marginBottom: 12,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
  },

  // Options
  optionCard: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    marginLeft: 12,
    flex: 1,
  },

  // Format Options
  formatOptions: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  formatChip: {
    marginRight: 8,
  },

  // Switch Row
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  switchInfo: {
    flex: 1,
  },

  // Scheduling
  schedulingCard: {
    padding: 12,
    marginTop: 12,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
  },

  // Preview
  previewCard: {
    padding: 16,
    borderRadius: 8,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewInfo: {
    marginLeft: 12,
    flex: 1,
  },
  previewSections: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  previewTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  previewTag: {
    marginRight: 4,
    marginBottom: 4,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    elevation: 4,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },

  divider: {
    marginVertical: 12,
  },
  bottomSpacing: {
    height: 16,
  },
});

export default ReportBuilderScreen;