import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const WorkerTaskListScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Worker Task List Screen - Coming Soon</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, color: '#666' },
});

export default WorkerTaskListScreen;