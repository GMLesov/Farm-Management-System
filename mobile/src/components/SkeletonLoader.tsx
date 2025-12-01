import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../config/constants';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonRect: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7]
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
          opacity
        },
        style
      ] as any}
    />
  );
};

export const TaskCardSkeleton: React.FC = () => (
  <View style={styles.taskCard}>
    <View style={styles.taskHeader}>
      <SkeletonRect width="60%" height={24} />
      <SkeletonRect width={80} height={24} borderRadius={12} />
    </View>
    <SkeletonRect width="100%" height={16} style={{ marginTop: SPACING.sm }} />
    <SkeletonRect width="80%" height={16} style={{ marginTop: SPACING.xs }} />
    <View style={styles.taskFooter}>
      <SkeletonRect width={100} height={16} />
      <SkeletonRect width={120} height={16} />
    </View>
  </View>
);

export const ProfileSkeleton: React.FC = () => (
  <View style={styles.profileContainer}>
    <SkeletonRect width={100} height={100} borderRadius={50} style={{ alignSelf: 'center' }} />
    <SkeletonRect width={150} height={24} style={{ marginTop: SPACING.md, alignSelf: 'center' }} />
    <SkeletonRect width={200} height={16} style={{ marginTop: SPACING.sm, alignSelf: 'center' }} />
    <SkeletonRect width={80} height={24} borderRadius={12} style={{ marginTop: SPACING.sm, alignSelf: 'center' }} />
  </View>
);

export const ScheduleSkeleton: React.FC = () => (
  <View style={styles.scheduleContainer}>
    {[1, 2, 3].map(i => (
      <View key={i} style={styles.scheduleCard}>
        <SkeletonRect width={60} height={40} />
        <View style={{ flex: 1, marginLeft: SPACING.md }}>
          <SkeletonRect width="70%" height={20} />
          <SkeletonRect width="50%" height={14} style={{ marginTop: SPACING.xs }} />
          <SkeletonRect width="60%" height={14} style={{ marginTop: SPACING.xs }} />
        </View>
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.border
  },
  taskCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    elevation: 2
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md
  },
  profileContainer: {
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: 12
  },
  scheduleContainer: {
    padding: SPACING.md
  },
  scheduleCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.md,
    elevation: 2
  }
});
