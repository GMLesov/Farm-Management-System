import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Subheading,
  FAB,
  Chip,
  Surface,
  Text,
  IconButton,
  Paragraph,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { RootState, AppDispatch } from '../../store';
// import { fetchTasks, updateTaskStatus } from '../../store/slices/tasksSlice';
import { Task, TaskStatus, TaskPriority } from '../../types/task';
import OfflineTaskService from '../../services/OfflineTaskService';

const TasksScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  // const { tasks, isLoading } = useSelector((state: RootState) => state.tasks);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load tasks using OfflineTaskService
  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const loadedTasks = await OfflineTaskService.getAllTasks();
      setTasks(loadedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const handleStatusUpdate = async (taskId: string, status: TaskStatus) => {
    try {
      const currentUser = user?.email || '';
      await OfflineTaskService.updateTask(currentUser, { id: taskId, status });
      await loadTasks(); // Reload tasks after update
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const getFilteredTasks = () => {
    if (filterStatus === 'all') return tasks;
    return tasks.filter(task => task.status === filterStatus);
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#757575';
    }
  };

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'keyboard-arrow-up';
      case 'medium': return 'remove';
      case 'low': return 'keyboard-arrow-down';
      default: return 'remove';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'pending': return '#ff9800';
      case 'in_progress': return '#2196f3';
      case 'completed': return '#4caf50';
      case 'overdue': return '#f44336';
      default: return '#757575';
    }
  };

  const renderTaskCard = (task: Task) => (
    <Card key={task.id} style={styles.taskCard} elevation={2}>
      <Card.Content>
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleContainer}>
            <Title style={styles.taskTitle}>{task.title}</Title>
            <View style={styles.priorityContainer}>
              <Icon 
                name={getPriorityIcon(task.priority)} 
                size={16} 
                color={getPriorityColor(task.priority)}
              />
              <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                {task.priority.toUpperCase()}
              </Text>
            </View>
          </View>
          <Chip 
            mode="outlined"
            style={[styles.statusChip, { borderColor: getStatusColor(task.status) }]}
            textStyle={{ color: getStatusColor(task.status) }}
          >
            {task.status.replace('_', ' ').toUpperCase()}
          </Chip>
        </View>

        <Paragraph style={styles.taskDescription}>
          {task.description}
        </Paragraph>

        <View style={styles.taskDetails}>
          <View style={styles.detailItem}>
            <Icon name="schedule" size={16} color="#666" />
            <Text style={styles.detailText}>
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </Text>
          </View>
          {task.category && (
            <View style={styles.detailItem}>
              <Icon name="category" size={16} color="#666" />
              <Text style={styles.detailText}>{task.category}</Text>
            </View>
          )}
        </View>

        <View style={styles.taskActions}>
          {task.status === 'pending' && (
            <IconButton
              icon="play-arrow"
              size={20}
              onPress={() => handleStatusUpdate(task.id, 'in_progress')}
              style={styles.actionButton}
            />
          )}
          {task.status === 'in_progress' && (
            <IconButton
              icon="check"
              size={20}
              onPress={() => handleStatusUpdate(task.id, 'completed')}
              style={styles.actionButton}
            />
          )}
          <IconButton
            icon="info"
            size={20}
            onPress={() => {/* Navigate to task detail */}}
            style={styles.actionButton}
          />
        </View>
      </Card.Content>
    </Card>
  );

  const filteredTasks = getFilteredTasks();

  return (
    <View style={styles.container}>
      {/* Filter Chips */}
      <Surface style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'pending', 'in_progress', 'completed', 'overdue'].map((status) => (
            <Chip
              key={status}
              mode={filterStatus === status ? 'flat' : 'outlined'}
              selected={filterStatus === status}
              onPress={() => setFilterStatus(status as TaskStatus | 'all')}
              style={styles.filterChip}
            >
              {status === 'all' ? 'All Tasks' : status.replace('_', ' ').toUpperCase()}
            </Chip>
          ))}
        </ScrollView>
      </Surface>

      {/* Tasks List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredTasks.length > 0 ? (
          <>
            <View style={styles.statsContainer}>
              <Surface style={styles.statCard}>
                <Text style={styles.statNumber}>{tasks.filter(t => t.status === 'pending').length}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </Surface>
              <Surface style={styles.statCard}>
                <Text style={styles.statNumber}>{tasks.filter(t => t.status === 'in_progress').length}</Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </Surface>
              <Surface style={styles.statCard}>
                <Text style={styles.statNumber}>{tasks.filter(t => t.status === 'completed').length}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </Surface>
            </View>

            {filteredTasks.map(renderTaskCard)}
          </>
        ) : (
          <Surface style={styles.emptyContainer}>
            <Icon name="assignment" size={64} color="#ccc" />
            <Title style={styles.emptyTitle}>No Tasks Found</Title>
            <Paragraph style={styles.emptyText}>
              {filterStatus === 'all' 
                ? "You don't have any tasks assigned yet."
                : `No ${filterStatus.replace('_', ' ')} tasks found.`
              }
            </Paragraph>
          </Surface>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="add"
        style={styles.fab}
        onPress={() => {/* Navigate to add task screen */}}
        label="Add Task"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    padding: 16,
    elevation: 2,
  },
  filterChip: {
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statCard: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  taskCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitleContainer: {
    flex: 1,
    marginRight: 16,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  taskDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    margin: 0,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    borderRadius: 12,
    marginTop: 32,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
});

export default TasksScreen;