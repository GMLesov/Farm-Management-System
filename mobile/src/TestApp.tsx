import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TestApp = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello Farm Manager!</Text>
      <Text style={styles.subtitle}>Mobile App is Working</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16
  },
  subtitle: {
    color: 'white',
    fontSize: 18
  }
});

export default TestApp;
