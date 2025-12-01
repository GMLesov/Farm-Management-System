import Redis from 'ioredis';
import { logger } from '@/utils/logger';

let redisClient: Redis | null = null;

export const connectRedis = async (): Promise<Redis | null> => {
  // In development or when explicitly allowed, skip Redis entirely to avoid noisy retries
  const allowStart = process.env.ALLOW_START_WITHOUT_REDIS === 'true' || process.env.NODE_ENV === 'development';
  if (allowStart) {
    logger.warn('Skipping Redis initialization due to development/override flag');
    return null;
  }

  try {

    if (!process.env.REDIS_HOST) {
      logger.warn('Redis configuration not found - skipping Redis connection');
      return null;
    }
    const redisConfig: any = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: parseInt(process.env.REDIS_DB || '0'),
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
      family: 4,
    };

    // Only add password if it exists
    if (process.env.REDIS_PASSWORD) {
      redisConfig.password = process.env.REDIS_PASSWORD;
    }

    redisClient = new Redis(redisConfig);

    // Handle Redis events early
    redisClient.on('error', (error: Error) => {
      logger.error('Redis connection error:', error);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis ready');
    });

    redisClient.on('close', () => {
      logger.warn('Redis connection closed');
    });

    redisClient.on('reconnecting', () => {
      logger.info('Redis reconnecting');
    });

    // Try a ping to verify connectivity
    try {
      await redisClient.ping();
      logger.info('Redis connected successfully');
    } catch (err) {
      if (allowStart) {
        logger.warn('Failed to connect to Redis, but continuing startup due to development/override flag:', err as any);
        return null;
      }
      throw err;
    }

    return redisClient;
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    if (allowStart) {
      logger.warn('Continuing without Redis due to development/override flag');
      return null;
    }
    throw error;
  }
};

export const getRedisClient = (): Redis | null => {
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
};

// Cache utilities
export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const client = getRedisClient();
      if (!client) return null;
      
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  },

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    try {
      const client = getRedisClient();
      if (!client) return;
      
      await client.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      logger.error(`Error setting cache key ${key}:`, error);
    }
  },

  async del(key: string): Promise<void> {
    try {
      const client = getRedisClient();
      if (!client) return;
      
      await client.del(key);
    } catch (error) {
      logger.error(`Error deleting cache key ${key}:`, error);
    }
  },

  async exists(key: string): Promise<boolean> {
    try {
      const client = getRedisClient();
      if (!client) return false;
      
      const exists = await client.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error(`Error checking cache key existence ${key}:`, error);
      return false;
    }
  },

  async increment(key: string, increment: number = 1): Promise<number> {
    try {
      const client = getRedisClient();
      if (!client) throw new Error('Redis not available');
      
      return await client.incrby(key, increment);
    } catch (error) {
      logger.error(`Error incrementing cache key ${key}:`, error);
      throw error;
    }
  },

  async expire(key: string, ttl: number): Promise<void> {
    try {
      const client = getRedisClient();
      if (!client) return;
      
      await client.expire(key, ttl);
    } catch (error) {
      logger.error(`Error setting expiration for cache key ${key}:`, error);
    }
  }
};