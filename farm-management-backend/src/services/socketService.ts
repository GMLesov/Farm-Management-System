import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger';

interface SocketWithAuth extends Socket {
  userId?: string;
  farmId?: string;
}

export const setupSocketIO = (io: SocketIOServer): void => {
  // Authentication middleware for Socket.IO
  io.use((socket: any, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        return next(new Error('Authentication error: JWT_SECRET not configured'));
      }

      const decoded = jwt.verify(token, jwtSecret) as any;
      socket.userId = decoded.id;
      socket.farmId = decoded.farmId;
      
      logger.info(`Socket authenticated for user: ${socket.userId}`);
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: SocketWithAuth) => {
    logger.info(`User ${socket.userId} connected via Socket.IO`);

    // Join user to their farm room for targeted updates
    if (socket.farmId) {
      socket.join(`farm:${socket.farmId}`);
      logger.info(`User ${socket.userId} joined farm room: ${socket.farmId}`);
    }

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle real-time events
    socket.on('join_crop_monitoring', (cropId: string) => {
      socket.join(`crop:${cropId}`);
      logger.info(`User ${socket.userId} joined crop monitoring: ${cropId}`);
    });

    socket.on('leave_crop_monitoring', (cropId: string) => {
      socket.leave(`crop:${cropId}`);
      logger.info(`User ${socket.userId} left crop monitoring: ${cropId}`);
    });

    socket.on('join_irrigation_control', (systemId: string) => {
      socket.join(`irrigation:${systemId}`);
      logger.info(`User ${socket.userId} joined irrigation control: ${systemId}`);
    });

    socket.on('leave_irrigation_control', (systemId: string) => {
      socket.leave(`irrigation:${systemId}`);
      logger.info(`User ${socket.userId} left irrigation control: ${systemId}`);
    });

    // Handle irrigation control commands
    socket.on('irrigation_command', (data: {
      systemId: string;
      command: 'start' | 'stop' | 'schedule';
      duration?: number;
      scheduleTime?: string;
    }) => {
      logger.info(`Irrigation command from user ${socket.userId}:`, data);
      
      // Broadcast to all users monitoring this irrigation system
      socket.to(`irrigation:${data.systemId}`).emit('irrigation_status_update', {
        systemId: data.systemId,
        status: data.command,
        timestamp: new Date().toISOString(),
        triggeredBy: socket.userId,
      });

      // Acknowledge command received
      socket.emit('irrigation_command_ack', {
        systemId: data.systemId,
        command: data.command,
        status: 'received',
      });
    });

    // Handle crop data updates
    socket.on('crop_data_update', (data: {
      cropId: string;
      sensorData: any;
      timestamp: string;
    }) => {
      logger.info(`Crop data update from user ${socket.userId}:`, data);
      
      // Broadcast to all users monitoring this crop
      socket.to(`crop:${data.cropId}`).emit('crop_sensor_data', {
        cropId: data.cropId,
        data: data.sensorData,
        timestamp: data.timestamp,
        source: socket.userId,
      });
    });

    // Handle weather alerts
    socket.on('weather_alert_subscription', (location: { lat: number; lng: number }) => {
      const locationKey = `weather:${location.lat.toFixed(2)},${location.lng.toFixed(2)}`;
      socket.join(locationKey);
      logger.info(`User ${socket.userId} subscribed to weather alerts for: ${locationKey}`);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`User ${socket.userId} disconnected: ${reason}`);
    });

    // Send welcome message
    socket.emit('connected', {
      message: 'Successfully connected to Farm Management System',
      userId: socket.userId,
      farmId: socket.farmId,
      timestamp: new Date().toISOString(),
    });
  });

  logger.info('Socket.IO server configured and ready');
};

// Helper functions for emitting events from other parts of the application
export const socketService = {
  // Emit to specific user
  emitToUser: (io: SocketIOServer, userId: string, event: string, data: any) => {
    io.to(`user:${userId}`).emit(event, data);
  },

  // Emit to all users in a farm
  emitToFarm: (io: SocketIOServer, farmId: string, event: string, data: any) => {
    io.to(`farm:${farmId}`).emit(event, data);
  },

  // Emit to all users monitoring a crop
  emitToCrop: (io: SocketIOServer, cropId: string, event: string, data: any) => {
    io.to(`crop:${cropId}`).emit(event, data);
  },

  // Emit to all users monitoring an irrigation system
  emitToIrrigation: (io: SocketIOServer, systemId: string, event: string, data: any) => {
    io.to(`irrigation:${systemId}`).emit(event, data);
  },

  // Emit weather alerts to location subscribers
  emitWeatherAlert: (io: SocketIOServer, lat: number, lng: number, alertData: any) => {
    const locationKey = `weather:${lat.toFixed(2)},${lng.toFixed(2)}`;
    io.to(locationKey).emit('weather_alert', alertData);
  },

  // Broadcast system-wide notifications
  broadcastNotification: (io: SocketIOServer, notification: any) => {
    io.emit('system_notification', notification);
  },
};