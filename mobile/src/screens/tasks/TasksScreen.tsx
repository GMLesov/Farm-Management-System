import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {taskService} from '../../services/apiService';

const TasksScreen = ({navigation}: any) => {
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const loadTasks = async () => {
    try {
      setRefreshing(true);
      const response = await taskService.getTasks();
      setTasks(response.data || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in_progress': return '#FF9800';
      case 'pending': return '#2196F3';
      default: return '#757575';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return 'alert-circle';
      case 'medium': return 'alert';
      case 'low': return 'information';
      default: return 'circle';
    }
  };

  const renderTask = ({item}: any) => (
    <TouchableOpacity
      style={styles.taskCard}
      onPress={() => navigation.navigate('TaskDetail', {taskId: item._id})}>
      <View style={styles.taskHeader}>
        <Icon name={getPriorityIcon(item.priority)} size={24} color={getStatusColor(item.status)} />
        <View style={styles.taskInfo}>
          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.taskDescription} numberOfLines={2}>{item.description}</Text>
        </View>
      </View>
      <View style={styles.taskFooter}>
        <Text style={[styles.status, {color: getStatusColor(item.status)}]}>
          {item.status?.replace('_', ' ').toUpperCase()}
        </Text>
        <Text style={styles.dueDate}>{new Date(item.dueDate).toLocaleDateString()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {['all', 'pending', 'in_progress', 'completed'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterActive]}
            onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f.replace('_', ' ').toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <FlatList
        data={filter === 'all' ? tasks : tasks.filter((t: any) => t.status === filter)}
        renderItem={renderTask}
        keyExtractor={(item: any) => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadTasks} />}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks found</Text>}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTask')}>
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  filterContainer: {flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0'},
  filterButton: {flex: 1, padding: 10, margin: 5, borderRadius: 20, backgroundColor: '#f0f0f0', alignItems: 'center'},
  filterActive: {backgroundColor: '#4CAF50'},
  filterText: {fontSize: 12, color: '#666', fontWeight: '600'},
  filterTextActive: {color: '#fff'},
  taskCard: {backgroundColor: '#fff', margin: 10, padding: 15, borderRadius: 8, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4},
  taskHeader: {flexDirection: 'row', marginBottom: 10},
  taskInfo: {flex: 1, marginLeft: 15},
  taskTitle: {fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5},
  taskDescription: {fontSize: 14, color: '#666'},
  taskFooter: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f0f0f0'},
  status: {fontSize: 12, fontWeight: 'bold'},
  dueDate: {fontSize: 12, color: '#999'},
  emptyText: {textAlign: 'center', marginTop: 50, fontSize: 16, color: '#999'},
  fab: {position: 'absolute', right: 20, bottom: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.3, shadowRadius: 4},
});

export default TasksScreen;
