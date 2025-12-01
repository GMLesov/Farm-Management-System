import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AnimalDetailScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Animal Detail Screen - Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, color: '#666' },
});

export default AnimalDetailScreen;