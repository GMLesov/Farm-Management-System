import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import { OptimizedFlatList } from './OptimizedFlatList';
import { useCache, useDebounce } from '../hooks/useCache';

interface EnhancedListProps<T> {
  data?: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  fetchData: () => Promise<T[]>;
  searchQuery?: string;
  searchFilter?: (item: T, query: string) => boolean;
  itemHeight?: number;
  emptyMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
  onRefresh?: () => void;
  refreshing?: boolean;
  cacheKey: string;
  cacheTTL?: number;
}

/**
 * Enhanced list component with caching, search, and performance optimizations
 */
export function EnhancedList<T>({
  data: propData,
  renderItem,
  keyExtractor,
  fetchData,
  searchQuery = '',
  searchFilter,
  itemHeight = 80,
  emptyMessage = 'No items found',
  loadingMessage = 'Loading...',
  errorMessage = 'Failed to load data',
  onRefresh,
  refreshing = false,
  cacheKey,
  cacheTTL = 5 * 60 * 1000, // 5 minutes
}: EnhancedListProps<T>) {
  
  // Use debounced search query to avoid excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Use cache hook for data fetching
  const { 
    data: cachedData, 
    loading, 
    error, 
    refresh: refreshCache 
  } = useCache(
    cacheKey,
    fetchData,
    {
      ttl: cacheTTL,
      fallbackValue: propData || [],
      persist: true,
    }
  );

  // Use provided data or cached data
  const sourceData = propData || cachedData || [];

  // Memoized filtered data based on search query
  const filteredData = useMemo(() => {
    if (!debouncedSearchQuery || !searchFilter) {
      return sourceData;
    }
    
    return sourceData.filter(item => 
      searchFilter(item, debouncedSearchQuery.toLowerCase())
    );
  }, [sourceData, debouncedSearchQuery, searchFilter]);

  // Memoized render item to prevent unnecessary re-renders
  const memoizedRenderItem = useCallback(
    (item: T, index: number) => renderItem(item, index),
    [renderItem]
  );

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      onRefresh();
    } else {
      await refreshCache();
    }
  }, [onRefresh, refreshCache]);

  // Render loading state
  if (loading && sourceData.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.message}>{loadingMessage}</Text>
      </View>
    );
  }

  // Render error state
  if (error && sourceData.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorMessage}>{errorMessage}</Text>
        <Text style={styles.errorDetails}>{error.message}</Text>
        <Button mode="contained" onPress={handleRefresh} style={styles.retryButton}>
          Retry
        </Button>
      </View>
    );
  }

  // Render empty state
  if (filteredData.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.message}>
          {debouncedSearchQuery ? 'No results found for your search' : emptyMessage}
        </Text>
        {!debouncedSearchQuery && (
          <Button mode="outlined" onPress={handleRefresh} style={styles.retryButton}>
            Refresh
          </Button>
        )}
      </View>
    );
  }

  return (
    <OptimizedFlatList
      data={filteredData}
      renderItem={memoizedRenderItem}
      keyExtractor={keyExtractor}
      itemHeight={itemHeight}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || loading}
          onRefresh={handleRefresh}
          colors={['#4CAF50']}
          tintColor="#4CAF50"
        />
      }
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContainer: {
    flexGrow: 1,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#d32f2f',
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  retryButton: {
    marginTop: 16,
  },
});