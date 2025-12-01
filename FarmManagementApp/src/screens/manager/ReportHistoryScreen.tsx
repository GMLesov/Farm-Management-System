import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Chip,
  Surface,
  useTheme,
  IconButton,
  Menu,
  Divider,
  ProgressBar,
  Searchbar,
  FAB,
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ReportGenerationService, {
  GeneratedReport,
  ReportTemplate,
} from '../../services/ReportGenerationService';

interface ReportHistoryScreenProps {
  navigation: any;
}

const ReportHistoryScreen: React.FC<ReportHistoryScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const reportsData = ReportGenerationService.getReports();
      const templatesData = ReportGenerationService.getTemplates();
      
      setReports(reportsData);
      setTemplates(templatesData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load report history');
      console.error('Report history loading error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredAndSortedReports = (() => {
    let filtered = reports;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(report =>
        report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(report => report.category === categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.generatedAt).getTime() - new Date(b.generatedAt).getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  })();

  const getStatusColor = (status: GeneratedReport['status']) => {
    switch (status) {
      case 'completed': return theme.colors.primary;
      case 'generating': return theme.colors.tertiary;
      case 'failed': return theme.colors.error;
      case 'expired': return theme.colors.outline;
      default: return theme.colors.outline;
    }
  };

  const getStatusIcon = (status: GeneratedReport['status']) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'generating': return 'clock-outline';
      case 'failed': return 'alert-circle';
      case 'expired': return 'clock-alert';
      default: return 'help-circle';
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

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString([], {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleDownloadReport = (report: GeneratedReport) => {
    if (report.status !== 'completed') {
      Alert.alert('Error', 'Report is not ready for download');
      return;
    }

    Alert.alert(
      'Download Report',
      `Downloading ${report.name}...`,
      [{ text: 'OK' }]
    );
  };

  const handleDeleteReport = (reportId: string) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to delete this report? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            ReportGenerationService.deleteReport(reportId);
            loadData();
          },
        },
      ]
    );
  };

  const handleRegenerateReport = async (report: GeneratedReport) => {
    try {
      const reportId = await ReportGenerationService.generateReport(
        report.templateId,
        report.parameters
      );

      Alert.alert(
        'Report Regeneration Started',
        'A new version of this report is being generated.',
        [{ text: 'OK' }]
      );

      loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to regenerate report');
    }
  };

  const toggleMenu = (reportId: string) => {
    setMenuVisible(prev => ({
      ...prev,
      [reportId]: !prev[reportId],
    }));
  };

  const statusOptions = [
    { value: 'all', label: 'All Status', count: reports.length },
    { value: 'completed', label: 'Completed', count: reports.filter(r => r.status === 'completed').length },
    { value: 'generating', label: 'Generating', count: reports.filter(r => r.status === 'generating').length },
    { value: 'failed', label: 'Failed', count: reports.filter(r => r.status === 'failed').length },
    { value: 'expired', label: 'Expired', count: reports.filter(r => r.status === 'expired').length },
  ];

  const categories = ReportGenerationService.getCategories();
  const categoryOptions = [
    { value: 'all', label: 'All Categories', count: reports.length },
    ...categories.map(cat => ({
      value: cat.value,
      label: cat.label,
      count: reports.filter(r => r.category === cat.value).length,
    })),
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text variant="bodyLarge">Loading report history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <Surface style={styles.searchContainer} elevation={1}>
        <Searchbar
          placeholder="Search reports..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
          {/* Status Filter */}
          <View style={styles.filterGroup}>
            <Text variant="bodySmall" style={styles.filterLabel}>Status:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {statusOptions.map((option) => (
                <Chip
                  key={option.value}
                  mode={statusFilter === option.value ? 'flat' : 'outlined'}
                  onPress={() => setStatusFilter(option.value)}
                  style={styles.filterChip}
                  compact
                >
                  {option.label} ({option.count})
                </Chip>
              ))}
            </ScrollView>
          </View>

          {/* Category Filter */}
          <View style={styles.filterGroup}>
            <Text variant="bodySmall" style={styles.filterLabel}>Category:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categoryOptions.map((option) => (
                <Chip
                  key={option.value}
                  mode={categoryFilter === option.value ? 'flat' : 'outlined'}
                  onPress={() => setCategoryFilter(option.value)}
                  style={styles.filterChip}
                  compact
                >
                  {option.label} ({option.count})
                </Chip>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* Sort Options */}
        <View style={styles.sortContainer}>
          <Text variant="bodySmall" style={styles.sortLabel}>Sort by:</Text>
          <View style={styles.sortOptions}>
            {(['date', 'name', 'status'] as const).map((option) => (
              <Chip
                key={option}
                mode={sortBy === option ? 'flat' : 'outlined'}
                onPress={() => {
                  if (sortBy === option) {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(option);
                    setSortOrder('desc');
                  }
                }}
                style={styles.sortChip}
                compact
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
                {sortBy === option && (
                  <Icon 
                    name={sortOrder === 'asc' ? 'chevron-up' : 'chevron-down'} 
                    size={14} 
                  />
                )}
              </Chip>
            ))}
          </View>
        </View>
      </Surface>

      {/* Reports List */}
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        style={styles.reportsList}
      >
        {filteredAndSortedReports.length === 0 ? (
          <Card style={styles.card}>
            <Card.Content style={styles.emptyContainer}>
              <Icon name="file-document-outline" size={64} color={theme.colors.outline} />
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No Reports Found
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'Generate your first report to get started'
                }
              </Text>
              {(!searchQuery && statusFilter === 'all' && categoryFilter === 'all') && (
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('ReportBuilder')}
                  style={styles.emptyButton}
                >
                  Create First Report
                </Button>
              )}
            </Card.Content>
          </Card>
        ) : (
          filteredAndSortedReports.map((report) => (
            <Card key={report.id} style={styles.card}>
              <Card.Content>
                <View style={styles.reportHeader}>
                  <View style={styles.reportTitleSection}>
                    <View style={styles.reportIconContainer}>
                      <Icon 
                        name={getCategoryIcon(report.category)} 
                        size={24} 
                        color={theme.colors.primary} 
                      />
                      <Icon 
                        name={getStatusIcon(report.status)} 
                        size={16} 
                        color={getStatusColor(report.status)}
                        style={styles.statusIcon}
                      />
                    </View>
                    <View style={styles.reportInfo}>
                      <Text variant="titleSmall" style={styles.reportTitle}>
                        {report.name}
                      </Text>
                      <Text variant="bodySmall" style={styles.reportDate}>
                        {formatDate(report.generatedAt)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.reportActions}>
                    <Chip 
                      mode="outlined" 
                      compact
                      style={[
                        styles.statusChip,
                        { backgroundColor: getStatusColor(report.status) + '20' }
                      ]}
                    >
                      {report.status}
                    </Chip>
                    <Menu
                      visible={menuVisible[report.id] || false}
                      onDismiss={() => toggleMenu(report.id)}
                      anchor={
                        <IconButton
                          icon="dots-vertical"
                          size={20}
                          onPress={() => toggleMenu(report.id)}
                        />
                      }
                    >
                      {report.status === 'completed' && (
                        <Menu.Item
                          onPress={() => {
                            toggleMenu(report.id);
                            handleDownloadReport(report);
                          }}
                          title="Download"
                          leadingIcon="download"
                        />
                      )}
                      <Menu.Item
                        onPress={() => {
                          toggleMenu(report.id);
                          handleRegenerateReport(report);
                        }}
                        title="Regenerate"
                        leadingIcon="refresh"
                      />
                      <Divider />
                      <Menu.Item
                        onPress={() => {
                          toggleMenu(report.id);
                          handleDeleteReport(report.id);
                        }}
                        title="Delete"
                        leadingIcon="delete"
                      />
                    </Menu>
                  </View>
                </View>

                <View style={styles.reportMeta}>
                  <View style={styles.metaItem}>
                    <Icon name="folder" size={14} color={theme.colors.onSurfaceVariant} />
                    <Text variant="bodySmall" style={styles.metaText}>
                      {report.category}
                    </Text>
                  </View>
                  {report.metadata.recordCount > 0 && (
                    <View style={styles.metaItem}>
                      <Icon name="database" size={14} color={theme.colors.onSurfaceVariant} />
                      <Text variant="bodySmall" style={styles.metaText}>
                        {report.metadata.recordCount} records
                      </Text>
                    </View>
                  )}
                  {report.fileSize && (
                    <View style={styles.metaItem}>
                      <Icon name="file" size={14} color={theme.colors.onSurfaceVariant} />
                      <Text variant="bodySmall" style={styles.metaText}>
                        {formatFileSize(report.fileSize)}
                      </Text>
                    </View>
                  )}
                </View>

                {report.status === 'generating' && (
                  <View style={styles.progressContainer}>
                    <ProgressBar 
                      progress={(report.progress || 0) / 100} 
                      color={theme.colors.primary}
                      style={styles.progressBar}
                    />
                    <Text variant="bodySmall" style={styles.progressText}>
                      {report.progress}% complete
                    </Text>
                  </View>
                )}

                {report.status === 'failed' && report.error && (
                  <View style={styles.errorContainer}>
                    <Icon name="alert-circle" size={16} color={theme.colors.error} />
                    <Text variant="bodySmall" style={[styles.errorText, { color: theme.colors.error }]}>
                      {report.error}
                    </Text>
                  </View>
                )}

                {report.status === 'expired' && (
                  <View style={styles.warningContainer}>
                    <Icon name="clock-alert" size={16} color={theme.colors.outline} />
                    <Text variant="bodySmall" style={[styles.warningText, { color: theme.colors.outline }]}>
                      This report has expired and is no longer available for download
                    </Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('ReportBuilder')}
        label="New Report"
      />
    </View>
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

  // Search and Filters
  searchContainer: {
    padding: 12,
    elevation: 2,
    backgroundColor: 'white',
  },
  searchbar: {
    marginBottom: 12,
  },
  filtersScroll: {
    marginBottom: 8,
  },
  filterGroup: {
    marginBottom: 8,
  },
  filterLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  filterChip: {
    marginRight: 8,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontWeight: 'bold',
    marginRight: 8,
    color: '#666',
  },
  sortOptions: {
    flexDirection: 'row',
  },
  sortChip: {
    marginRight: 8,
  },

  // Reports List
  reportsList: {
    flex: 1,
  },
  card: {
    margin: 8,
    elevation: 2,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  emptyButton: {
    marginTop: 8,
  },

  // Report Cards
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reportTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reportIconContainer: {
    position: 'relative',
    marginRight: 12,
  },
  statusIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontWeight: 'bold',
    marginBottom: 2,
  },
  reportDate: {
    color: '#666',
  },
  reportActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    marginRight: 8,
  },

  // Meta Information
  reportMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    marginLeft: 4,
    color: '#666',
  },

  // Progress
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    marginBottom: 4,
  },
  progressText: {
    textAlign: 'right',
    color: '#666',
  },

  // Error and Warning
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 4,
  },
  errorText: {
    marginLeft: 8,
    flex: 1,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  warningText: {
    marginLeft: 8,
    flex: 1,
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

export default ReportHistoryScreen;