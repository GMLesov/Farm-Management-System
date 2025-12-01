import mongoose from 'mongoose';
import { logger } from '@/utils/logger';
// Optional in-memory MongoDB for local dev without Docker/Mongo installed
let memoryServer: any | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    let mongoURI = process.env.MONGODB_URI;
    // If requested, spin up an in-memory MongoDB instance for development
    if (process.env.USE_INMEMORY_DB === 'true') {
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        mongoURI = memoryServer.getUri();
        logger.warn(`Using in-memory MongoDB instance for development at ${mongoURI}`);
      } catch (memErr) {
        logger.error('Failed to start in-memory MongoDB. Ensure mongodb-memory-server is installed.', memErr);
        throw memErr;
      }
    }
    
    if (!mongoURI) {
      logger.warn('MONGODB_URI environment variable is not defined - skipping database connection');
      return;
    }

    const options = {
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE || '10'),
      serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || '5000'),
      socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS || '45000'),
      family: 4, // Use IPv4, skip trying IPv6
    } as const;

    await mongoose.connect(mongoURI, options);

    logger.info('MongoDB connected successfully');

    // Handle connection events
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
      } catch (_) {}
      try {
        if (memoryServer) {
          await memoryServer.stop();
          memoryServer = null;
          logger.info('In-memory MongoDB stopped');
        }
      } catch (_) {}
      process.exit(0);
    });

  } catch (error) {
    const allowStart = process.env.ALLOW_START_WITHOUT_DB === 'true' || process.env.NODE_ENV === 'development';
    if (allowStart) {
      logger.warn('Failed to connect to MongoDB, but continuing startup due to development/override flag:', error as any);
      return;
    }
    logger.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
      logger.info('In-memory MongoDB stopped');
    }
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
    throw error;
  }
};