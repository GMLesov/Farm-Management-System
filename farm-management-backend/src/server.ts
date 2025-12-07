import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import dotenv from 'dotenv';

import { connectDB } from '@/config/database';
import { connectRedis } from '@/config/redis';
import { initializeFirebase } from '@/config/firebase';
import { initializeSentry } from '@/config/sentry';
import { setupSwagger } from '@/config/swagger';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { notFoundHandler } from '@/middleware/notFoundHandler';
import { socketServer } from '@/socket/SocketServer';

// Import routes
import healthRoutes from '@/routes/health';
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import farmRoutes from '@/routes/farms';
import cropRoutes from '@/routes/crops';
import animalRoutes from '@/routes/animals';
import feedRoutes from '@/routes/feed';
import veterinaryRoutes from '@/routes/veterinary';
import irrigationRoutes from '@/routes/irrigation';
import notificationRoutes from '@/routes/notifications';
import geocodeRoutes from './routes/geocode';
import analyticsRoutes from '@/routes/analytics';
import workersRoutes from '@/routes/workers';
import tasksRoutes from '@/routes/tasks';
import leavesRoutes from '@/routes/leaves';
import uploadRoutes from '@/routes/upload';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// Initialize Sentry (must be first)
initializeSentry(app);

// Initialize Socket.IO server
socketServer.initialize(httpServer);

// Trust proxy for accurate client IP addresses
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration (broadened in development to avoid preflight issues)
const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:3005'
];
const corsOrigins = process.env.CORS_ORIGIN?.split(',')?.map(o => o.trim())?.filter(Boolean) || defaultOrigins;

if ((process.env.NODE_ENV || 'development') === 'development') {
  // Explicit header injection FIRST so it applies to all responses (including preflight)
  app.use((req: express.Request, res: express.Response, next: express.NextFunction): void => {
    const origin = req.headers.origin as string | undefined;
    if (origin) {
      // Echo the requesting origin and allow credentials
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Vary', 'Origin');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
      res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] as string || 'content-type,authorization');
    }
    // Handle manual preflight short-circuit if needed
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Do not register the cors() middleware in dev to avoid it overriding our explicit headers
} else {
  app.use(cors({ origin: corsOrigins, credentials: true, optionsSuccessStatus: 200 }));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0',
  });
});

// API documentation
setupSwagger(app);

// Health check routes (no auth required)
app.use('/api/health', healthRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/veterinary', veterinaryRoutes);
app.use('/api/irrigation', irrigationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/geocode', geocodeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/workers', workersRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/leaves', leavesRoutes);
app.use('/api/upload', uploadRoutes);

// Static file serving for uploads
app.use('/uploads', express.static('uploads'));

// 404 handler
app.use(notFoundHandler);

// Global error handler (with Sentry integration)
app.use(errorHandler);

// Database and Redis connections
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();
    logger.info('✅ Database connected successfully');

    // Create default admin user if it doesn't exist
    const { createDefaultAdmin } = await import('@/utils/createDefaultAdmin');
    await createDefaultAdmin();

    // Connect to Redis (if configured)
    try {
      const redis = await connectRedis();
      if (redis) {
        logger.info('✅ Redis connected successfully');
      } else {
        logger.warn('⚠️ Redis not initialized (skipped or unavailable). Continuing without cache.');
      }
    } catch (redisError) {
      logger.warn('⚠️ Redis connection failed, continuing without cache:', redisError);
    }

    // Initialize Firebase (if configured)
    try {
      await initializeFirebase();
      logger.info('✅ Firebase initialized successfully');
    } catch (firebaseError) {
      logger.warn('⚠️ Firebase initialization failed:', firebaseError);
    }

    // Start the HTTP server
  // Use 3000 by default to align with local dev and CRA proxy
  const PORT = process.env.PORT || 3000;
    logger.info(`Starting HTTP server on port ${PORT}...`);
    httpServer.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
      logger.info(`� Health Check available at http://localhost:${PORT}/api/health`);
      logger.info(`�🔗 Socket.IO server initialized for real-time communication`);
      
      if (process.env.SENTRY_DSN) {
        logger.info(`🔍 Sentry error tracking enabled`);
      }
      
      if (process.env.NODE_ENV === 'development') {
        logger.info(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
      }
    });

    // Graceful shutdown handling
    const shutdown = async (signal: string): Promise<void> => {
      logger.info(`${signal} received. Starting graceful shutdown...`);
      
      // Close HTTP server
      httpServer.close(() => {
        logger.info('HTTP server closed');
      });

      // Close Socket.IO server
      (socketServer as any).close?.();
      logger.info('Socket.IO server closed');

      // Close database connection
      // Note: mongoose.connection.close() would go here if needed
      
      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer().catch((error) => {
  console.error('❌ Unhandled error during server startup:', error);
  logger.error('❌ Unhandled error during server startup:', error);
  process.exit(1);
});

export default app;