import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger, sanitizeInput, rateLimiter } from './middleware/validators';

// Import routes
import authRoutes from './routes/auth';
import workerRoutes from './routes/workers';
import animalRoutes from './routes/animals';
import cropRoutes from './routes/crops';
import taskRoutes from './routes/tasks';
import calendarRoutes from './routes/calendar';
import leaveRoutes from './routes/leaves';
import inventoryRoutes from './routes/inventory';
import financialRoutes from './routes/financial';
import farmRoutes from './routes/farms';
import uploadRoutes from './routes/upload';
import alertRoutes from './routes/alerts';
import organizationRoutes from './routes/organizations';
import farmsMultiRoutes from './routes/farmsMulti';
import notificationRoutes from './routes/notifications';
import analyticsRoutes from './routes/analytics';
import irrigationRoutes from './routes/irrigation';

// Import Socket.io
import { initializeSocket } from './socket';

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS configuration - allow both development and production origins
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'https://farm-management-system-4w71.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security and logging middleware
app.use(requestLogger);
app.use(sanitizeInput);
app.use(rateLimiter(100, 15 * 60 * 1000)); // 100 requests per 15 minutes

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/animals', animalRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/farms-multi', farmsMultiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/irrigation', irrigationRoutes);

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    message: 'Farm Management API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler (must be before error handler)
app.use((_req: Request, res: Response) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Global error handling middleware (must be last)
app.use(errorHandler);

// Database connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/farm-management';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    // Create default admin user if it doesn't exist
    const { createDefaultAdmin } = await import('./utils/createDefaultAdmin');
    await createDefaultAdmin();
    
    // Create HTTP server
    const httpServer = createServer(app);
    
    // Initialize Socket.io
    const io = initializeSocket(httpServer);
    console.log('🔌 Socket.io initialized');
    
    // Make io available globally for routes
    app.set('io', io);
    
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
      console.log(`🔌 WebSocket ready on ws://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Handle server errors
    httpServer.on('error', (error: Error) => {
      console.error('❌ Server Error:', error);
      process.exit(1);
    });

    // Handle process termination
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM signal received: closing HTTP server');
      httpServer.close(() => {
        console.log('✅ HTTP server closed');
      });
    });

    process.on('SIGINT', () => {
      console.log('\n👋 SIGINT signal received: closing HTTP server');
      httpServer.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer().catch((error) => {
  console.error('❌ Unhandled error during server startup:', error);
  process.exit(1);
});

export default app;
