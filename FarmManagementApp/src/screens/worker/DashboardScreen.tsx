import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  IconButton,
  Chip,
  ProgressBar,
  Surface,
  Divider,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { RootState, AppDispatch } from '../../store';
import { fetchTasksByUser } from '../../store/slices/taskSlice';
import { OfflineStatusBar } from '../../components/OfflineStatus';

const WorkerDashboardScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { tasks, isLoading } = useSelector((state: RootState) => state.tasks);
  const [refreshing, setRefreshing] = useState(false);

  const pendingTasks = tasks.filter(task => task.status === 'pending' || task.status === 'in-progress');
  const completedToday = tasks.filter(task => 
    task.status === 'completed' && 
    new Date(task.updatedAt).toDateString() === new Date().toDateString()
  );

  const onRefresh = React.useCallback(async () => {
    if (user?.farmId) {
      setRefreshing(true);
      await dispatch(fetchTasksByUser({ farmId: user.farmId, userId: user.uid }));
      setRefreshing(false);
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user?.farmId) {
      dispatch(fetchTasksByUser({ farmId: user.farmId, userId: user.uid }));
    }
  }, [dispatch, user]);

  const quickActions = [
    {
      title: 'Log Animal Health',
      description: 'Record health observations',
      icon: 'pets',
      color: '#4CAF50',
      onPress: () => {}, // Will be implemented later
    },
    {
      title: 'Record Feeding',
      description: 'Log feeding activities',
      icon: 'restaurant',
      color: '#FF9800',
      onPress: () => {}, // Will be implemented later
    },
    {
      title: 'Crop Observations',
      description: 'Report crop conditions',
      icon: 'grass',
      color: '#8BC34A',
      onPress: () => {}, // Will be implemented later
    },
    {
      title: 'Complete Task',
      description: 'Mark tasks as done',
      icon: 'task_alt',
      color: '#2196F3',
      onPress: () => navigation.navigate('TaskList' as never),
    },
    {
      title: 'Equipment Log',
      description: 'Record equipment usage',
      icon: 'build',
      color: '#607D8B',
      onPress: () => {}, // Will be implemented later
    },
    {
      title: 'Field Report',
      description: 'Submit field observations',
      icon: 'description',
      color: '#9C27B0',
      onPress: () => {}, // Will be implemented later
    },
  ];

  return (
    <View style={styles.container}>
      <OfflineStatusBar />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Welcome Section */}
        <Surface style={styles.welcomeCard}>
          <Title style={styles.welcomeTitle}>Welcome back, {user?.name}!</Title>
          <Paragraph style={styles.welcomeText}>
            Ready to start your farm work? Check your tasks and quick actions below.
          </Paragraph>
        </Surface>

        {/* Tasks Overview */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Title>Today's Progress</Title>
              <IconButton
                icon="refresh"
                onPress={onRefresh}
                disabled={refreshing}
              />
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{pendingTasks.length}</Text>
                <Text style={styles.statLabel}>Pending Tasks</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
                  {completedToday.length}
                </Text>
                <Text style={styles.statLabel}>Completed Today</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {completedToday.length > 0 ? 
                    Math.round((completedToday.length / (pendingTasks.length + completedToday.length)) * 100) : 0
                  }%
                </Text>
                <Text style={styles.statLabel}>Progress</Text>
              </View>
            </View>
            {(pendingTasks.length + completedToday.length) > 0 && (
              <ProgressBar
                progress={completedToday.length / (pendingTasks.length + completedToday.length)}
                color="#4CAF50"
                style={styles.progressBar}
              />
            )}
          </Card.Content>
        </Card>

        {/* Quick Actions */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>Quick Actions</Title>
            <View style={styles.quickActions}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.actionButton, { borderColor: action.color }]}
                  onPress={action.onPress}
                >
                  <Icon name={action.icon} size={32} color={action.color} />
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Urgent Tasks */}
        {pendingTasks.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Urgent Tasks</Title>
              {pendingTasks.slice(0, 3).map((task) => (
                <View key={task.id} style={styles.taskItem}>
                  <View style={styles.taskContent}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskDescription}>{task.description}</Text>
                    <View style={styles.taskMeta}>
                      <Chip
                        mode="outlined"
                        style={[
                          styles.priorityChip,
                          {
                            borderColor:
                              task.priority === 'high'
                                ? '#f44336'
                                : task.priority === 'medium'
                                ? '#ff9800'
                                : '#4caf50',
                          },
                        ]}
                      >
                        {task.priority} priority
                      </Chip>
                      <Text style={styles.taskDue}>
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <IconButton
                    icon="arrow-right"
                    onPress={() => {
                      // Navigate to task details when implemented
                      console.log('Navigate to task details:', task.id);
                    }}
                  />
                </View>
              ))}
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('TaskList' as never)}
                style={styles.viewAllButton}
              >
                View All Tasks
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  welcomeCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  card: {
    margin: 16,
    elevation: 2,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
    color: '#333',
  },
  actionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  priorityChip: {
    marginRight: 12,
  },
  taskDue: {
    fontSize: 12,
    color: '#666',
  },
  viewAllButton: {
    marginTop: 16,
  },
});

export default WorkerDashboardScreen;