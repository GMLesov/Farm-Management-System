import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  FAB,
  Searchbar,
  Chip,
  Text,
  Avatar,
  ProgressBar,
  Menu,
  IconButton,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootState, AppDispatch } from '../../store';
import { loadTasks, updateTaskStatus } from '../../store/slices/taskSlice';
import { Task } from '../../types';
import { RootStackParamList } from '../../navigation';

type TaskListNavigationProp = StackNavigationProp<RootStackParamList, 'TaskList'>;

const TaskListScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<TaskListNavigationProp>();
  
  const { tasks, isLoading } = useSelector((state: RootState) => state.tasks);
  const { user } = useSelector((state: RootState) => state.auth);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Task['status']>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | Task['priority']>('all');
  const [statusMenuVisible, setStatusMenuVisible] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (user?.farmId) {
        dispatch(loadTasks({ farmId: user.farmId }));
      }
    }, [dispatch, user])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (user?.farmId) {
      await dispatch(loadTasks({ farmId: user.farmId }));
    }
    setRefreshing(false);
  }, [dispatch, user]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    
    // Show all tasks to managers, only assigned tasks to workers
    const matchesRole = user?.role === 'manager' || task.assignedTo === user?.uid;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesRole;
  });

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'in-progress': return '#2196F3';
      case 'completed': return '#4CAF50';
      case 'overdue': return '#F44336';
      default: return '#666';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'high': return '#F44336';
      case 'urgent': return '#9C27B0';
      default: return '#666';
    }
  };

  const getPriorityIcon = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return '🟢';
      case 'medium': return '🟡';
      case 'high': return '🔴';
      case 'urgent': return '🚨';
      default: return '⚪';
    }
  };

  const getProgressValue = (task: Task) => {
    switch (task.status) {
      case 'pending': return 0;
      case 'in-progress': return 0.5;
      case 'completed': return 1;
      case 'overdue': return 0.3;
      default: return 0;
    }
  };

  const handleStatusUpdate = (taskId: string, newStatus: Task['status']) => {
    dispatch(updateTaskStatus({ id: taskId, status: newStatus }));
    setStatusMenuVisible(null);
  };

  const handleTaskPress = (task: Task) => {
    navigation.navigate('TaskDetail', { taskId: task.id });
  };

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const renderTaskCard = (task: Task) => (
    <Card key={task.id} style={styles.taskCard} onPress={() => handleTaskPress(task)}>
      <Card.Content>
        <View style={styles.taskHeader}>
          <View style={styles.taskInfo}>
            <Title style={styles.taskTitle}>{task.title}</Title>
            <Paragraph style={styles.taskDescription} numberOfLines={2}>
              {task.description}
            </Paragraph>
          </View>
          
          {user?.role === 'manager' && (
            <Menu
              visible={statusMenuVisible === task.id}
              onDismiss={() => setStatusMenuVisible(null)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={20}
                  onPress={() => setStatusMenuVisible(task.id)}
                />
              }
            >
              <Menu.Item 
                onPress={() => handleStatusUpdate(task.id, 'pending')} 
                title="Mark Pending" 
              />
              <Menu.Item 
                onPress={() => handleStatusUpdate(task.id, 'in-progress')} 
                title="Mark In Progress" 
              />
              <Menu.Item 
                onPress={() => handleStatusUpdate(task.id, 'completed')} 
                title="Mark Completed" 
              />
            </Menu>
          )}
        </View>

        <View style={styles.taskMeta}>
          <View style={styles.metaRow}>
            <Chip
              mode="outlined"
              style={[styles.statusChip, { borderColor: getStatusColor(task.status) }]}
              textStyle={{ color: getStatusColor(task.status) }}
            >
              {task.status.replace('-', ' ').toUpperCase()}
            </Chip>
            
            <View style={styles.priorityContainer}>
              <Text style={styles.priorityText}>
                {getPriorityIcon(task.priority)} {task.priority.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Progress</Text>
            <ProgressBar
              progress={getProgressValue(task)}
              color={getStatusColor(task.status)}
              style={styles.progressBar}
            />
          </View>

          <View style={styles.taskFooter}>
            <View style={styles.assigneeInfo}>
              <Avatar.Icon size={24} icon="account" style={styles.avatar} />
              <Text style={styles.assigneeText}>
                {task.assignedTo === user?.uid ? 'Assigned to you' : 'Assigned'}
              </Text>
            </View>
            
            <Text style={[
              styles.dueDateText,
              task.status === 'overdue' && styles.overdueText
            ]}>
              {formatDueDate(new Date(task.dueDate))}
            </Text>
          </View>

          {task.category && (
            <Chip mode="outlined" style={styles.categoryChip}>
              {task.category}
            </Chip>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <Searchbar
          placeholder="Search tasks..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          <TouchableOpacity onPress={() => setFilterStatus('all')}>
            <Chip
              selected={filterStatus === 'all'}
              onPress={() => setFilterStatus('all')}
              style={styles.filterChip}
            >
              All
            </Chip>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setFilterStatus('pending')}>
            <Chip
              selected={filterStatus === 'pending'}
              onPress={() => setFilterStatus('pending')}
              style={styles.filterChip}
            >
              Pending
            </Chip>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setFilterStatus('in-progress')}>
            <Chip
              selected={filterStatus === 'in-progress'}
              onPress={() => setFilterStatus('in-progress')}
              style={styles.filterChip}
            >
              In Progress
            </Chip>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setFilterStatus('completed')}>
            <Chip
              selected={filterStatus === 'completed'}
              onPress={() => setFilterStatus('completed')}
              style={styles.filterChip}
            >
              Completed
            </Chip>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Task List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {searchQuery ? 'No tasks match your search' : 'No tasks available'}
            </Text>
          </View>
        ) : (
          filteredTasks.map(renderTaskCard)
        )}
      </ScrollView>

      {/* Add Task FAB - Only for managers */}
      {user?.role === 'manager' && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => navigation.navigate('AddTask')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  searchbar: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: 8,
  },
  scrollView: {
    flex: 1,
  },
  taskCard: {
    margin: 8,
    elevation: 4,
    borderRadius: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  taskInfo: {
    flex: 1,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  taskMeta: {
    marginTop: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusChip: {
    backgroundColor: '#fff',
  },
  priorityContainer: {
    alignItems: 'flex-end',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  assigneeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 8,
    backgroundColor: '#4CAF50',
  },
  assigneeText: {
    fontSize: 12,
    color: '#666',
  },
  dueDateText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  overdueText: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  categoryChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4CAF50',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default TaskListScreen;