import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import offlineService from '../services/offlineService';
import { COLORS, SPACING, TYPOGRAPHY } from '../config/constants';

const NetworkStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [slideAnim] = useState(new Animated.Value(-100));

  useEffect(() => {
    // Subscribe to network changes
    const unsubscribe = offlineService.onNetworkChange(async (online) => {
      setIsOnline(online);
      
      if (!online) {
        // Show offline banner
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8
        }).start();
      } else {
        // Hide banner after coming online
        const count = await offlineService.getPendingActionsCount();
        setPendingCount(count);
        
        if (count > 0) {
          // Sync offline actions
          await offlineService.syncOfflineActions();
        }
        
        setTimeout(() => {
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true
          }).start();
        }, 2000);
      }
    });

    // Check initial status
    setIsOnline(offlineService.getNetworkStatus());

    return () => unsubscribe();
  }, []);

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isOnline ? COLORS.success : COLORS.warning,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <Icon
        name={isOnline ? 'cloud-done' : 'cloud-off'}
        size={20}
        color={COLORS.text.light}
      />
      <Text style={styles.text}>
        {isOnline
          ? pendingCount > 0
            ? `Syncing ${pendingCount} action${pendingCount > 1 ? 's' : ''}...`
            : 'Back online'
          : 'No internet connection'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    zIndex: 1000,
    elevation: 5
  },
  text: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.light,
    marginLeft: SPACING.sm,
    fontWeight: '600' as const
  }
});

export default NetworkStatus;
