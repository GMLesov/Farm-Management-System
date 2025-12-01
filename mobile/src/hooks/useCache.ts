import { useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  fallbackValue?: any;
  persist?: boolean; // Whether to persist to AsyncStorage
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/**
 * Enhanced caching hook with memory and persistent storage
 * Provides automatic cache invalidation and background updates
 */
export function useCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
) {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    fallbackValue,
    persist = true,
  } = options;

  const [data, setData] = useState<T | undefined>(fallbackValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map());

  const getCacheKey = useCallback((key: string) => `cache_${key}`, []);

  const isExpired = useCallback((entry: CacheEntry<T>) => {
    return Date.now() - entry.timestamp > entry.ttl;
  }, []);

  const getFromMemoryCache = useCallback(() => {
    const entry = cacheRef.current.get(key);
    if (entry && !isExpired(entry)) {
      return entry.data;
    }
    return null;
  }, [key, isExpired]);

  const getFromPersistentCache = useCallback(async () => {
    if (!persist) return null;
    
    try {
      const cached = await AsyncStorage.getItem(getCacheKey(key));
      if (cached) {
        const entry: CacheEntry<T> = JSON.parse(cached);
        if (!isExpired(entry)) {
          return entry.data;
        }
      }
    } catch (error) {
      console.warn('Failed to read from persistent cache:', error);
    }
    return null;
  }, [key, persist, getCacheKey, isExpired]);

  const setCache = useCallback(async (newData: T) => {
    const entry: CacheEntry<T> = {
      data: newData,
      timestamp: Date.now(),
      ttl,
    };

    // Set in memory cache
    cacheRef.current.set(key, entry);

    // Set in persistent cache
    if (persist) {
      try {
        await AsyncStorage.setItem(getCacheKey(key), JSON.stringify(entry));
      } catch (error) {
        console.warn('Failed to write to persistent cache:', error);
      }
    }
  }, [key, ttl, persist, getCacheKey]);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh) {
      // Try memory cache first
      const memoryData = getFromMemoryCache();
      if (memoryData) {
        setData(memoryData);
        return memoryData;
      }

      // Try persistent cache
      const persistentData = await getFromPersistentCache();
      if (persistentData) {
        setData(persistentData);
        // Also update memory cache
        await setCache(persistentData);
        return persistentData;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const newData = await fetcher();
      await setCache(newData);
      setData(newData);
      return newData;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      
      // Return fallback or existing data if available
      if (fallbackValue !== undefined) {
        setData(fallbackValue);
        return fallbackValue;
      }
      
      const existingData = getFromMemoryCache();
      if (existingData) {
        setData(existingData);
        return existingData;
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetcher, getFromMemoryCache, getFromPersistentCache, setCache, fallbackValue]);

  const invalidate = useCallback(async () => {
    cacheRef.current.delete(key);
    if (persist) {
      try {
        await AsyncStorage.removeItem(getCacheKey(key));
      } catch (error) {
        console.warn('Failed to remove from persistent cache:', error);
      }
    }
  }, [key, persist, getCacheKey]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    invalidate,
  };
}

/**
 * Hook for debounced values to optimize search and input performance
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook for throttled functions to limit execution frequency
 */
export function useThrottle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      if (Date.now() - lastRun.current >= delay) {
        func(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [func, delay]
  );
}