import React from 'react';
import { FlatList, FlatListProps } from 'react-native';

interface OptimizedFlatListProps<T> extends Omit<FlatListProps<T>, 'renderItem'> {
  renderItem: (item: T, index: number) => React.ReactElement;
}

/**
 * Optimized FlatList component with performance enhancements
 * - Implements getItemLayout for improved performance
 * - Uses removeClippedSubviews for memory optimization
 * - Implements windowSize and initialNumToRender optimizations
 */
export function OptimizedFlatList<T>({
  data,
  renderItem,
  keyExtractor,
  itemHeight = 80,
  ...props
}: OptimizedFlatListProps<T> & { itemHeight?: number }) {
  
  const getItemLayout = React.useCallback(
    (data: any, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    }),
    [itemHeight]
  );

  const memoizedRenderItem = React.useCallback(
    ({ item, index }: { item: T; index: number }) => renderItem(item, index),
    [renderItem]
  );

  return (
    <FlatList
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      removeClippedSubviews={true}
      windowSize={10}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      legacyImplementation={false}
      {...props}
    />
  );
}