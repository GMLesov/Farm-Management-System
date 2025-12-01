import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { setupSocketIO, socketService } from '@/services/socketService';
import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('socketService', () => {
  let mockIO: any;
  let mockSocket: any;
  let authMiddleware: any;
  let connectionHandler: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock socket
    mockSocket = {
      id: 'test-socket-id',
      userId: undefined,
      farmId: undefined,
      handshake: {
        auth: {},
        headers: {},
      },
      join: jest.fn(),
      leave: jest.fn(),
      emit: jest.fn(),
      to: jest.fn().mockReturnThis(),
      on: jest.fn((event: string, handler: Function) => {
        // Store handlers for testing
        if (event === 'join_crop_monitoring') mockSocket._joinCropHandler = handler;
        if (event === 'leave_crop_monitoring') mockSocket._leaveCropHandler = handler;
        if (event === 'join_irrigation_control') mockSocket._joinIrrigationHandler = handler;
        if (event === 'leave_irrigation_control') mockSocket._leaveIrrigationHandler = handler;
        if (event === 'irrigation_command') mockSocket._irrigationCommandHandler = handler;
        if (event === 'crop_data_update') mockSocket._cropDataUpdateHandler = handler;
        if (event === 'weather_alert_subscription') mockSocket._weatherAlertHandler = handler;
        if (event === 'disconnect') mockSocket._disconnectHandler = handler;
      }),
    };

    // Create mock IO server
    mockIO = {
      use: jest.fn((middleware: Function) => {
        authMiddleware = middleware;
      }),
      on: jest.fn((event: string, handler: Function) => {
        if (event === 'connection') {
          connectionHandler = handler;
        }
      }),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    // Setup environment
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe('setupSocketIO', () => {
    it('should configure authentication middleware', () => {
      setupSocketIO(mockIO as unknown as SocketIOServer);

      expect(mockIO.use).toHaveBeenCalled();
      expect(mockIO.on).toHaveBeenCalledWith('connection', expect.any(Function));
    });

    it('should authenticate socket with valid token from auth header', () => {
      setupSocketIO(mockIO as unknown as SocketIOServer);

      const mockNext = jest.fn();
      const mockDecoded = { id: 'user-123', farmId: 'farm-456' };
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      mockSocket.handshake.auth.token = 'valid-token';

      authMiddleware(mockSocket, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(mockSocket.userId).toBe('user-123');
      expect(mockSocket.farmId).toBe('farm-456');
      expect(mockNext).toHaveBeenCalledWith();
      expect(logger.info).toHaveBeenCalledWith('Socket authenticated for user: user-123');
    });

    it('should authenticate socket with token from authorization header', () => {
      setupSocketIO(mockIO as unknown as SocketIOServer);

      const mockNext = jest.fn();
      const mockDecoded = { id: 'user-789', farmId: 'farm-101' };
      (jwt.verify as jest.Mock).mockReturnValue(mockDecoded);

      mockSocket.handshake.headers.authorization = 'Bearer header-token';

      authMiddleware(mockSocket, mockNext);

      expect(jwt.verify).toHaveBeenCalledWith('header-token', 'test-secret');
      expect(mockSocket.userId).toBe('user-789');
      expect(mockSocket.farmId).toBe('farm-101');
      expect(mockNext).toHaveBeenCalledWith();
    });

    it('should reject socket connection without token', () => {
      setupSocketIO(mockIO as unknown as SocketIOServer);

      const mockNext = jest.fn();

      authMiddleware(mockSocket, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new Error('Authentication error: Token not provided'));
      expect(logger.error).not.toHaveBeenCalled();
    });

    it('should reject socket connection without JWT_SECRET', () => {
      delete process.env.JWT_SECRET;
      setupSocketIO(mockIO as unknown as SocketIOServer);

      const mockNext = jest.fn();
      mockSocket.handshake.auth.token = 'some-token';

      authMiddleware(mockSocket, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new Error('Authentication error: JWT_SECRET not configured'));
    });

    it('should reject socket connection with invalid token', () => {
      setupSocketIO(mockIO as unknown as SocketIOServer);

      const mockNext = jest.fn();
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      mockSocket.handshake.auth.token = 'invalid-token';

      authMiddleware(mockSocket, mockNext);

      expect(logger.error).toHaveBeenCalledWith('Socket authentication error:', expect.any(Error));
      expect(mockNext).toHaveBeenCalledWith(new Error('Authentication error: Invalid token'));
    });
  });

  describe('connection handler', () => {
    beforeEach(() => {
      setupSocketIO(mockIO as unknown as SocketIOServer);
      mockSocket.userId = 'user-123';
      mockSocket.farmId = 'farm-456';
    });

    it('should handle new socket connection and join farm room', () => {
      connectionHandler(mockSocket);

      expect(logger.info).toHaveBeenCalledWith('User user-123 connected via Socket.IO');
      expect(mockSocket.join).toHaveBeenCalledWith('farm:farm-456');
      expect(mockSocket.join).toHaveBeenCalledWith('user:user-123');
      expect(logger.info).toHaveBeenCalledWith('User user-123 joined farm room: farm-456');
    });

    it('should handle connection without farmId', () => {
      mockSocket.farmId = undefined;

      connectionHandler(mockSocket);

      expect(mockSocket.join).toHaveBeenCalledWith('user:user-123');
      expect(mockSocket.join).not.toHaveBeenCalledWith(expect.stringContaining('farm:'));
    });

    it('should send welcome message on connection', () => {
      connectionHandler(mockSocket);

      expect(mockSocket.emit).toHaveBeenCalledWith('connected', {
        message: 'Successfully connected to Farm Management System',
        userId: 'user-123',
        farmId: 'farm-456',
        timestamp: expect.any(String),
      });
    });

    it('should handle join_crop_monitoring event', () => {
      connectionHandler(mockSocket);

      mockSocket._joinCropHandler('crop-789');

      expect(mockSocket.join).toHaveBeenCalledWith('crop:crop-789');
      expect(logger.info).toHaveBeenCalledWith('User user-123 joined crop monitoring: crop-789');
    });

    it('should handle leave_crop_monitoring event', () => {
      connectionHandler(mockSocket);

      mockSocket._leaveCropHandler('crop-789');

      expect(mockSocket.leave).toHaveBeenCalledWith('crop:crop-789');
      expect(logger.info).toHaveBeenCalledWith('User user-123 left crop monitoring: crop-789');
    });

    it('should handle join_irrigation_control event', () => {
      connectionHandler(mockSocket);

      mockSocket._joinIrrigationHandler('system-101');

      expect(mockSocket.join).toHaveBeenCalledWith('irrigation:system-101');
      expect(logger.info).toHaveBeenCalledWith('User user-123 joined irrigation control: system-101');
    });

    it('should handle leave_irrigation_control event', () => {
      connectionHandler(mockSocket);

      mockSocket._leaveIrrigationHandler('system-101');

      expect(mockSocket.leave).toHaveBeenCalledWith('irrigation:system-101');
      expect(logger.info).toHaveBeenCalledWith('User user-123 left irrigation control: system-101');
    });

    it('should handle irrigation_command and broadcast status update', () => {
      connectionHandler(mockSocket);

      const commandData = {
        systemId: 'system-202',
        command: 'start' as const,
        duration: 3600,
      };

      mockSocket._irrigationCommandHandler(commandData);

      expect(logger.info).toHaveBeenCalledWith('Irrigation command from user user-123:', commandData);
      expect(mockSocket.to).toHaveBeenCalledWith('irrigation:system-202');
      expect(mockSocket.emit).toHaveBeenCalledWith('irrigation_status_update', {
        systemId: 'system-202',
        status: 'start',
        timestamp: expect.any(String),
        triggeredBy: 'user-123',
      });
      expect(mockSocket.emit).toHaveBeenCalledWith('irrigation_command_ack', {
        systemId: 'system-202',
        command: 'start',
        status: 'received',
      });
    });

    it('should handle irrigation_command with schedule command', () => {
      connectionHandler(mockSocket);

      const scheduleData = {
        systemId: 'system-303',
        command: 'schedule' as const,
        scheduleTime: '2025-11-13T08:00:00Z',
      };

      mockSocket._irrigationCommandHandler(scheduleData);

      expect(mockSocket.emit).toHaveBeenCalledWith('irrigation_command_ack', {
        systemId: 'system-303',
        command: 'schedule',
        status: 'received',
      });
    });

    it('should handle crop_data_update and broadcast to crop subscribers', () => {
      connectionHandler(mockSocket);

      const cropData = {
        cropId: 'crop-404',
        sensorData: { temperature: 25, humidity: 60 },
        timestamp: '2025-11-12T10:30:00Z',
      };

      mockSocket._cropDataUpdateHandler(cropData);

      expect(logger.info).toHaveBeenCalledWith('Crop data update from user user-123:', cropData);
      expect(mockSocket.to).toHaveBeenCalledWith('crop:crop-404');
      expect(mockSocket.emit).toHaveBeenCalledWith('crop_sensor_data', {
        cropId: 'crop-404',
        data: { temperature: 25, humidity: 60 },
        timestamp: '2025-11-12T10:30:00Z',
        source: 'user-123',
      });
    });

    it('should handle weather_alert_subscription', () => {
      connectionHandler(mockSocket);

      const location = { lat: 40.7128, lng: -74.0060 };

      mockSocket._weatherAlertHandler(location);

      expect(mockSocket.join).toHaveBeenCalledWith('weather:40.71,-74.01');
      expect(logger.info).toHaveBeenCalledWith('User user-123 subscribed to weather alerts for: weather:40.71,-74.01');
    });

    it('should handle disconnect event', () => {
      connectionHandler(mockSocket);

      mockSocket._disconnectHandler('client namespace disconnect');

      expect(logger.info).toHaveBeenCalledWith('User user-123 disconnected: client namespace disconnect');
    });
  });

  describe('socketService helper functions', () => {
    beforeEach(() => {
      mockIO.to = jest.fn().mockReturnValue({
        emit: jest.fn(),
      });
    });

    describe('emitToUser', () => {
      it('should emit event to specific user room', () => {
        const eventData = { message: 'Test message' };

        socketService.emitToUser(mockIO, 'user-555', 'test-event', eventData);

        expect(mockIO.to).toHaveBeenCalledWith('user:user-555');
        expect(mockIO.to('user:user-555').emit).toHaveBeenCalledWith('test-event', eventData);
      });
    });

    describe('emitToFarm', () => {
      it('should emit event to farm room', () => {
        const eventData = { update: 'Farm update' };

        socketService.emitToFarm(mockIO, 'farm-666', 'farm-update', eventData);

        expect(mockIO.to).toHaveBeenCalledWith('farm:farm-666');
        expect(mockIO.to('farm:farm-666').emit).toHaveBeenCalledWith('farm-update', eventData);
      });
    });

    describe('emitToCrop', () => {
      it('should emit event to crop monitoring room', () => {
        const eventData = { sensorData: { temp: 22 } };

        socketService.emitToCrop(mockIO, 'crop-777', 'crop-sensor-update', eventData);

        expect(mockIO.to).toHaveBeenCalledWith('crop:crop-777');
        expect(mockIO.to('crop:crop-777').emit).toHaveBeenCalledWith('crop-sensor-update', eventData);
      });
    });

    describe('emitToIrrigation', () => {
      it('should emit event to irrigation control room', () => {
        const eventData = { status: 'active' };

        socketService.emitToIrrigation(mockIO, 'system-888', 'status-change', eventData);

        expect(mockIO.to).toHaveBeenCalledWith('irrigation:system-888');
        expect(mockIO.to('irrigation:system-888').emit).toHaveBeenCalledWith('status-change', eventData);
      });
    });

    describe('emitWeatherAlert', () => {
      it('should emit weather alert to location subscribers with rounded coordinates', () => {
        const alertData = { type: 'storm', severity: 'high' };

        socketService.emitWeatherAlert(mockIO, 40.7128, -74.0060, alertData);

        expect(mockIO.to).toHaveBeenCalledWith('weather:40.71,-74.01');
        expect(mockIO.to('weather:40.71,-74.01').emit).toHaveBeenCalledWith('weather_alert', alertData);
      });

      it('should round coordinates correctly for negative values', () => {
        const alertData = { type: 'frost' };

        socketService.emitWeatherAlert(mockIO, -33.8688, 151.2093, alertData);

        expect(mockIO.to).toHaveBeenCalledWith('weather:-33.87,151.21');
      });
    });

    describe('broadcastNotification', () => {
      it('should broadcast notification to all connected clients', () => {
        const notification = {
          id: 'notif-999',
          title: 'System Update',
          message: 'Maintenance scheduled',
        };

        socketService.broadcastNotification(mockIO, notification);

        expect(mockIO.emit).toHaveBeenCalledWith('system_notification', notification);
      });
    });
  });
});
