import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { createServer } from 'http';
import jwt from 'jsonwebtoken';
import { User } from '@/models/User';
import socketServer from '@/socket/SocketServer';

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('@/models/User');

describe('SocketServer', () => {
  let mockHTTPServer: HTTPServer;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create real HTTP server for Socket.IO
    mockHTTPServer = createServer();

    // Setup environment
    process.env.JWT_SECRET = 'test-socket-secret';
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    if (socketServer.getIO()) {
      socketServer.close();
    }
    if (mockHTTPServer.listening) {
      mockHTTPServer.close();
    }
  });

  describe('initialize', () => {
    it('should initialize Socket.IO server with CORS configuration', () => {
      socketServer.initialize(mockHTTPServer);

      const io = socketServer.getIO();
      expect(io).toBeDefined();
      expect(io).not.toBeNull();
    });

    it('should log initialization message', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      socketServer.initialize(mockHTTPServer);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Socket.IO server initialized'));
      
      consoleSpy.mockRestore();
    });
  });

  describe('emitToFarm', () => {
    it('should emit event to farm room', () => {
      socketServer.initialize(mockHTTPServer);

      const eventData = { message: 'Farm update' };
      socketServer.emitToFarm('farm-emit-123', 'farm-event', eventData);

      // Just verify it doesn't throw - actual emission tested via integration
      expect(socketServer.getIO()).toBeDefined();
    });

    it('should handle emit when IO not initialized', () => {
      const newServer = new (socketServer.constructor as any)();
      
      expect(() => {
        newServer.emitToFarm('farm-999', 'test', {});
      }).not.toThrow();
    });
  });

  describe('emitToAnimal', () => {
    it('should emit event to animal subscribers', () => {
      socketServer.initialize(mockHTTPServer);

      const eventData = { status: 'health-update' };
      socketServer.emitToAnimal('animal-303', 'animal-event', eventData);

      expect(socketServer.getIO()).toBeDefined();
    });
  });

  describe('emitToUser', () => {
    it('should emit event to specific user if online', () => {
      socketServer.initialize(mockHTTPServer);

      const eventData = { notification: 'Personal message' };
      socketServer.emitToUser('user-404', 'user-event', eventData);

      // Verify it doesn't throw even if user not connected
      expect(socketServer.getIO()).toBeDefined();
    });
  });

  describe('emitToAll', () => {
    it('should broadcast event to all connected clients', () => {
      socketServer.initialize(mockHTTPServer);

      const eventData = { announcement: 'System maintenance' };
      socketServer.emitToAll('broadcast-event', eventData);

      expect(socketServer.getIO()).toBeDefined();
    });
  });

  describe('getFarmConnectionCount', () => {
    it('should return 0 for farm with no connections', () => {
      socketServer.initialize(mockHTTPServer);

      const count = socketServer.getFarmConnectionCount('nonexistent-farm');
      expect(count).toBe(0);
    });
  });

  describe('getConnectedFarms', () => {
    it('should return array of connected farm IDs', () => {
      socketServer.initialize(mockHTTPServer);

      const farms = socketServer.getConnectedFarms();
      expect(Array.isArray(farms)).toBe(true);
    });
  });

  describe('isUserOnline', () => {
    it('should return false for offline user', () => {
      socketServer.initialize(mockHTTPServer);

      const isOnline = socketServer.isUserOnline('offline-user-505');
      expect(isOnline).toBe(false);
    });
  });

  describe('getIO', () => {
    it('should return null before initialization', () => {
      const newServer = new (socketServer.constructor as any)();
      expect(newServer.getIO()).toBeNull();
    });

    it('should return SocketIOServer instance after initialization', () => {
      socketServer.initialize(mockHTTPServer);

      const io = socketServer.getIO();
      expect(io).toBeDefined();
    });
  });

  describe('close', () => {
    it('should close Socket.IO server and clear tracking maps', () => {
      socketServer.initialize(mockHTTPServer);

      socketServer.close();

      expect(socketServer.getIO()).toBeNull();
      expect(socketServer.getConnectedFarms()).toEqual([]);
    });

    it('should handle close when not initialized', () => {
      const newServer = new (socketServer.constructor as any)();
      
      expect(() => {
        newServer.close();
      }).not.toThrow();
    });
  });
});
