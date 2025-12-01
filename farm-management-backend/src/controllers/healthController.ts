import { Request, Response } from 'express';
import os from 'os';
import mongoose from 'mongoose';
import { getRedisClient } from '@/config/redis';
import { getFirebaseApp } from '@/config/firebase';
import { asyncHandler } from '@/middleware/errorHandler';

interface ServiceStatus {
  status: 'connected' | 'disconnected' | 'degraded';
  latency?: number;
  message?: string;
}

interface HealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  services: {
    mongodb: ServiceStatus;
    redis: ServiceStatus;
    firebase: ServiceStatus;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
  };
}

/**
 * Check MongoDB connection and latency
 */
const checkMongoDB = async (): Promise<ServiceStatus> => {
  try {
    if (!mongoose.connection.db) {
      return {
        status: 'disconnected',
        message: 'MongoDB not connected',
      };
    }
    
    const start = Date.now();
    await mongoose.connection.db.admin().ping();
    const latency = Date.now() - start;
    
    return {
      status: latency < 100 ? 'connected' : 'degraded',
      latency,
    };
  } catch (error) {
    return {
      status: 'disconnected',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Check Redis connection and latency
 */
const checkRedis = async (): Promise<ServiceStatus> => {
  try {
    const client = getRedisClient();
    if (!client) {
      return {
        status: 'disconnected',
        message: 'Redis client not initialized',
      };
    }
    
    const start = Date.now();
    await client.ping();
    const latency = Date.now() - start;
    
    return {
      status: latency < 50 ? 'connected' : 'degraded',
      latency,
    };
  } catch (error) {
    return {
      status: 'disconnected',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Check Firebase connection
 */
const checkFirebase = async (): Promise<ServiceStatus> => {
  try {
    const app = getFirebaseApp();
    if (!app) {
      return {
        status: 'disconnected',
        message: 'Firebase not initialized',
      };
    }
    
    // Try to access Firestore
    await app.firestore().collection('_health_check').limit(1).get();
    
    return {
      status: 'connected',
    };
  } catch (error) {
    return {
      status: 'disconnected',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Get memory usage
 */
const getMemoryUsage = () => {
  const usage = process.memoryUsage();
  const totalMemory = os.totalmem();
  const usedMemory = usage.heapUsed / 1024 / 1024; // Convert to MB
  const totalMemoryMB = totalMemory / 1024 / 1024; // Convert to MB
  
  return {
    used: Math.round(usedMemory * 100) / 100,
    total: Math.round(totalMemoryMB * 100) / 100,
    percentage: Math.round((usedMemory / totalMemoryMB) * 10000) / 100,
  };
};

/**
 * Get CPU usage (simple estimation)
 */
const getCPUUsage = () => {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type as keyof typeof cpu.times];
    }
    totalIdle += cpu.times.idle;
  });

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = 100 - (100 * idle / total);

  return {
    usage: Math.round(usage * 100) / 100,
  };
};

/**
 * Health check endpoint
 * GET /api/health
 */
export const healthCheck = asyncHandler(async (req: Request, res: Response) => {
  // Check all services in parallel
  const [mongodb, redis, firebase] = await Promise.all([
    checkMongoDB(),
    checkRedis(),
    checkFirebase(),
  ]);

  const services = { mongodb, redis, firebase };
  
  // Determine overall health status
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
  
  // MongoDB is critical
  if (mongodb.status === 'disconnected') {
    status = 'unhealthy';
  }
  
  // Redis and Firebase are optional but affect status
  if (redis.status === 'disconnected' || firebase.status === 'disconnected') {
    if (status === 'healthy') {
      status = 'degraded';
    }
  }
  
  // Check if any service is degraded
  if (
    mongodb.status === 'degraded' ||
    redis.status === 'degraded' ||
    firebase.status === 'degraded'
  ) {
    if (status === 'healthy') {
      status = 'degraded';
    }
  }

  const response: HealthResponse = {
    status,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.APP_VERSION || '1.0.0',
    services,
    memory: getMemoryUsage(),
    cpu: getCPUUsage(),
  };

  // Set appropriate status code
  const statusCode = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503;
  
  res.status(statusCode).json(response);
});

/**
 * Simple readiness check
 * GET /api/ready
 */
export const readinessCheck = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  // Check only critical services
  const mongodb = await checkMongoDB();
  
  if (mongodb.status === 'disconnected') {
    res.status(503).json({
      ready: false,
      message: 'Database not connected',
    });
    return;
  }
  
  res.status(200).json({
    ready: true,
    message: 'Service is ready',
  });
});

/**
 * Simple liveness check
 * GET /api/alive
 */
export const livenessCheck = (req: Request, res: Response) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString(),
  });
};
