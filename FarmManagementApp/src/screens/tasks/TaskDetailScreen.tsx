import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const TaskDetailScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Task Detail Screen - Coming Soon</Text>
  </View>
);

export const AddTaskScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Add Task Screen - Coming Soon</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, color: '#666' },
});

export default TaskDetailScreen;