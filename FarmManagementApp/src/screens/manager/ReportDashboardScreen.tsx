import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  FAB,
  Badge,
  Surface,
  useTheme,
  Portal,
  Modal,
  List,
  Divider,
  ProgressBar,
  IconButton,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ReportGenerationService, {
  ReportTemplate,
  GeneratedReport,
  ReportConfiguration,
} from '../../services/ReportGenerationService';

const { width } = Dimensions.get('window');

interface ReportDashboardScreenProps {
  navigation: any;
}

const ReportDashboardScreen: React.FC<ReportDashboardScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [configurations, setConfigurations] = useState<ReportConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load templates, reports, and configurations
      const templatesData = ReportGenerationService.getTemplates();
      const reportsData = ReportGenerationService.getReports();
      const configurationsData = ReportGenerationService.getConfigurations();
      
      setTemplates(templatesData);
      setReports(reportsData);
      setConfigurations(configurationsData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load report data');
      console.error('Report data loading error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const categories = ReportGenerationService.getCategories();

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const recentReports = reports
    .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
    .slice(0, 5);

  const getStatusColor = (status: GeneratedReport['status']) => {
    switch (status) {
      case 'completed': return theme.colors.primary;
      case 'generating': return theme.colors.tertiary;
      case 'failed': return theme.colors.error;
      case 'expired': return theme.colors.outline;
      default: return theme.colors.outline;
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      operational: 'cog',
      financial: 'trending-up',
      compliance: 'shield-check',
      analytics: 'chart-line',
      weather: 'weather-cloudy',
      custom: 'tools',
    };
    return iconMap[category] || 'file-document';
  };

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setModalVisible(true);
  };

  const handleGenerateReport = async (template: ReportTemplate) => {
    try {
      // In production, would show parameter input dialog
      const defaultParameters = {
        date: new Date(),
        dateRange: {
          start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          end: new Date(),
        },
      };

      const reportId = await ReportGenerationService.generateReport(
        template.id,
        defaultParameters
      );

      Alert.alert(
        'Report Generation Started',
        `${template.name} is being generated. You'll be notified when it's ready.`,
        [{ text: 'OK' }]
      );

      setModalVisible(false);
      
      // Refresh reports to show the new one
      setTimeout(() => loadData(), 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate report');
      console.error('Report generation error:', error);
    }
  };

  const handleCreateCustomReport = () => {
    Alert.alert(
      'Custom Report Builder',
      'Custom report builder will allow you to create personalized reports with specific data and layouts.',
      [{ text: 'OK' }]
    );
  };

  const handleScheduleReport = () => {
    Alert.alert(
      'Schedule Reports',
      'Report scheduling will allow you to automatically generate and deliver reports on a regular basis.',
      [{ text: 'OK' }]
    );
  };

  const formatFileSize = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text variant="bodyLarge">Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Report Statistics */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Report Overview
            </Text>
            <View style={styles.statsGrid}>
              <StatCard
                title="Templates"
                value={templates.length.toString()}
                icon="file-document-multiple"
                color={theme.colors.primary}
              />
              <StatCard
                title="Generated"
                value={reports.length.toString()}
                icon="file-check"
                color={theme.colors.secondary}
              />
              <StatCard
                title="Scheduled"
                value={configurations.filter(c => c.scheduling?.enabled).length.toString()}
                icon="calendar-clock"
                color={theme.colors.tertiary}
              />
              <StatCard
                title="Recent"
                value={reports.filter(r => 
                  new Date(r.generatedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                ).length.toString()}
                icon="clock-outline"
                color={theme.colors.outline}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Recent Reports */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium">Recent Reports</Text>
              <Button mode="text" onPress={() => navigation.navigate('ReportHistory')}>
                View All
              </Button>
            </View>

            {recentReports.length === 0 ? (
              <Text variant="bodyMedium" style={styles.emptyText}>
                No reports generated yet
              </Text>
            ) : (
              recentReports.map((report) => (
                <Surface key={report.id} style={styles.reportCard} elevation={1}>
                  <View style={styles.reportHeader}>
                    <View style={styles.reportInfo}>
                      <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                        {report.name}
                      </Text>
                      <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                        {formatDate(report.generatedAt)}
                      </Text>
                    </View>
                    <View style={styles.reportStatus}>
                      <Chip 
                        mode="outlined" 
                        compact
                        style={{ backgroundColor: getStatusColor(report.status) + '20' }}
                      >
                        {report.status}
                      </Chip>
                    </View>
                  </View>

                  {report.status === 'generating' && (
                    <View style={styles.progressContainer}>
                      <ProgressBar 
                        progress={(report.progress || 0) / 100} 
                        color={theme.colors.primary}
                        style={styles.progressBar}
                      />
                      <Text variant="bodySmall">{report.progress}% complete</Text>
                    </View>
                  )}

                  {report.status === 'completed' && (
                    <View style={styles.reportFooter}>
                      <Text variant="bodySmall">
                        {report.metadata.recordCount} records • {formatFileSize(report.fileSize || 0)}
                      </Text>
                      <Button mode="text" compact onPress={() => {
                        Alert.alert('Download', `Downloading ${report.name}...`);
                      }}>
                        Download
                      </Button>
                    </View>
                  )}
                </Surface>
              ))
            )}
          </Card.Content>
        </Card>

        {/* Category Filter */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Report Templates
            </Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              <Chip
                mode={selectedCategory === 'all' ? 'flat' : 'outlined'}
                onPress={() => setSelectedCategory('all')}
                style={styles.categoryChip}
              >
                All ({templates.length})
              </Chip>
              {categories.map((category: any) => (
                <Chip
                  key={category.value}
                  mode={selectedCategory === category.value ? 'flat' : 'outlined'}
                  onPress={() => setSelectedCategory(category.value)}
                  style={styles.categoryChip}
                >
                  {category.label} ({category.count})
                </Chip>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Report Templates */}
        <View style={styles.templatesGrid}>
          {filteredTemplates.map((template) => (
            <Card key={template.id} style={styles.templateCard}>
              <Card.Content>
                <View style={styles.templateHeader}>
                  <Icon 
                    name={getCategoryIcon(template.category)} 
                    size={24} 
                    color={theme.colors.primary} 
                  />
                  <View style={styles.templateBadges}>
                    {template.isCustomizable && (
                      <Badge size={8} style={{ backgroundColor: theme.colors.secondary }} />
                    )}
                  </View>
                </View>

                <Text variant="titleSmall" style={styles.templateTitle}>
                  {template.name}
                </Text>
                
                <Text variant="bodySmall" style={styles.templateDescription}>
                  {template.description}
                </Text>

                <View style={styles.templateTags}>
                  {template.tags.slice(0, 3).map((tag: string, index: number) => (
                    <Chip key={index} mode="outlined" compact style={styles.templateTag}>
                      {tag}
                    </Chip>
                  ))}
                  {template.tags.length > 3 && (
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      +{template.tags.length - 3}
                    </Text>
                  )}
                </View>

                <View style={styles.templateFooter}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    ~{template.estimatedGenerationTime}s
                  </Text>
                  <Button 
                    mode="text" 
                    compact 
                    onPress={() => handleTemplateSelect(template)}
                  >
                    Generate
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Quick Actions
            </Text>
            
            <View style={styles.quickActions}>
              <QuickActionCard
                title="Custom Report"
                description="Build a personalized report"
                icon="tools"
                onPress={handleCreateCustomReport}
              />
              <QuickActionCard
                title="Schedule Reports"
                description="Automate report generation"
                icon="calendar-clock"
                onPress={handleScheduleReport}
              />
              <QuickActionCard
                title="Export Data"
                description="Raw data export options"
                icon="database-export"
                onPress={() => navigation.navigate('DataExport')}
              />
              <QuickActionCard
                title="Report History"
                description="View all generated reports"
                icon="history"
                onPress={() => navigation.navigate('ReportHistory')}
              />
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateCustomReport}
        label="New Report"
      />

      {/* Template Details Modal */}
      <Portal>
        <Modal 
          visible={modalVisible} 
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedTemplate && (
            <Card>
              <Card.Content>
                <View style={styles.modalHeader}>
                  <Icon 
                    name={getCategoryIcon(selectedTemplate.category)} 
                    size={32} 
                    color={theme.colors.primary} 
                  />
                  <View style={styles.modalTitleContainer}>
                    <Text variant="titleLarge">{selectedTemplate.name}</Text>
                    <Chip mode="outlined" compact>
                      {selectedTemplate.category}
                    </Chip>
                  </View>
                </View>

                <Text variant="bodyMedium" style={styles.modalDescription}>
                  {selectedTemplate.description}
                </Text>

                <Divider style={styles.modalDivider} />

                <Text variant="titleSmall" style={styles.modalSectionTitle}>
                  Report Sections
                </Text>
                {selectedTemplate.sections.map((section: any) => (
                  <List.Item
                    key={section.id}
                    title={section.name}
                    description={section.type}
                    left={() => (
                      <Icon 
                        name={section.required ? 'check-circle' : 'circle-outline'} 
                        size={20} 
                        color={section.required ? theme.colors.primary : theme.colors.outline} 
                      />
                    )}
                  />
                ))}

                <Divider style={styles.modalDivider} />

                <Text variant="titleSmall" style={styles.modalSectionTitle}>
                  Output Formats
                </Text>
                <View style={styles.formatChips}>
                  {selectedTemplate.outputFormats.map((format: string) => (
                    <Chip key={format} mode="outlined" compact style={styles.formatChip}>
                      {format.toUpperCase()}
                    </Chip>
                  ))}
                </View>

                <View style={styles.modalFooter}>
                  <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                    Estimated generation time: ~{selectedTemplate.estimatedGenerationTime} seconds
                  </Text>
                  <View style={styles.modalActions}>
                    <Button mode="outlined" onPress={() => setModalVisible(false)}>
                      Cancel
                    </Button>
                    <Button 
                      mode="contained" 
                      onPress={() => handleGenerateReport(selectedTemplate)}
                    >
                      Generate Report
                    </Button>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}
        </Modal>
      </Portal>
    </View>
  );
};

// Helper Components
const StatCard: React.FC<{
  title: string;
  value: string;
  icon: string;
  color: string;
}> = ({ title, value, icon, color }) => (
  <View style={styles.statCard}>
    <Icon name={icon} size={24} color={color} />
    <Text variant="headlineSmall" style={[styles.statValue, { color }]}>
      {value}
    </Text>
    <Text variant="bodySmall" style={styles.statTitle}>
      {title}
    </Text>
  </View>
);

const QuickActionCard: React.FC<{
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
}> = ({ title, description, icon, onPress }) => {
  const theme = useTheme();
  
  return (
    <Surface style={styles.quickActionCard} elevation={1}>
      <IconButton 
        icon={icon} 
        size={24} 
        iconColor={theme.colors.primary}
        onPress={onPress}
      />
      <View style={styles.quickActionContent}>
        <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
          {title}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {description}
        </Text>
      </View>
      <IconButton 
        icon="chevron-right" 
        size={20} 
        iconColor={theme.colors.onSurfaceVariant}
        onPress={onPress}
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    margin: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 16,
  },

  // Statistics
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    alignItems: 'center',
    padding: 8,
    minWidth: 80,
  },
  statValue: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  statTitle: {
    textAlign: 'center',
    marginTop: 2,
    color: '#666',
  },

  // Recent Reports
  reportCard: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reportInfo: {
    flex: 1,
  },
  reportStatus: {
    marginLeft: 8,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    marginBottom: 4,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Category Filter
  categoryScroll: {
    marginTop: 8,
  },
  categoryChip: {
    marginRight: 8,
  },

  // Templates Grid
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 4,
  },
  templateCard: {
    width: (width - 32) / 2,
    margin: 4,
    elevation: 2,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateBadges: {
    flexDirection: 'row',
  },
  templateTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  templateDescription: {
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  templateTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateTag: {
    marginRight: 4,
    marginBottom: 4,
  },
  templateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Quick Actions
  quickActions: {
    gap: 8,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  quickActionContent: {
    flex: 1,
    marginLeft: 8,
  },

  // Modal
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  modalDescription: {
    marginBottom: 16,
    lineHeight: 20,
  },
  modalDivider: {
    marginVertical: 12,
  },
  modalSectionTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  formatChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  formatChip: {
    marginRight: 4,
  },
  modalFooter: {
    marginTop: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  // FAB
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },

  bottomSpacing: {
    height: 80,
  },
});

export default ReportDashboardScreen;