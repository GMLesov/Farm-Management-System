import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthenticatedSocket extends Socket {
  user?: any;
  farmId?: string;
}

interface SocketWithAuth extends Socket {
  user?: any;
  farmId?: string;
}

import { Socket } from 'socket.io';

class SocketServer {
  private io: SocketIOServer | null = null;
  private connectedUsers: Map<string, Set<string>> = new Map(); // farmId -> Set of socketIds
  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private farmUsers: Map<string, Set<string>> = new Map(); // farmId -> Set of userIds

  initialize(server: HTTPServer): void {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:19006"],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    console.log('✅ Socket.IO server initialized');
  }

  private setupMiddleware(): void {
    if (!this.io) return;

    // Authentication middleware
    this.io.use(async (socket: SocketWithAuth, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
        const user = await User.findById(decoded.userId).populate('farms');

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.user = user;
        socket.farmId = user.farms?.[0]?._id?.toString() || ''; // Default to first farm
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: SocketWithAuth) => {
      console.log(`🔌 User ${socket.user?.email} connected (${socket.id})`);

      // Join farm-specific room
      if (socket.farmId) {
        socket.join(`farm:${socket.farmId}`);
        
        // Track connected users per farm
        if (!this.connectedUsers.has(socket.farmId)) {
          this.connectedUsers.set(socket.farmId, new Set());
        }
        this.connectedUsers.get(socket.farmId)?.add(socket.id);
        
        // Track user to socket mapping
        this.userSockets.set(socket.user._id.toString(), socket.id);

        console.log(`👥 User joined farm room: farm:${socket.farmId}`);
      }

      // Handle farm switching
      socket.on('switch-farm', (farmId: string) => {
        if (socket.farmId) {
          socket.leave(`farm:${socket.farmId}`);
          this.connectedUsers.get(socket.farmId)?.delete(socket.id);
        }

        socket.farmId = farmId;
        socket.join(`farm:${farmId}`);
        
        if (!this.connectedUsers.has(farmId)) {
          this.connectedUsers.set(farmId, new Set());
        }
        this.connectedUsers.get(farmId)?.add(socket.id);

        console.log(`🔄 User switched to farm: ${farmId}`);
      });

      // Handle subscription to specific animal updates
      socket.on('subscribe-animal', (animalId: string) => {
        socket.join(`animal:${animalId}`);
        console.log(`🐄 User subscribed to animal updates: ${animalId}`);
      });

      socket.on('unsubscribe-animal', (animalId: string) => {
        socket.leave(`animal:${animalId}`);
        console.log(`🐄 User unsubscribed from animal updates: ${animalId}`);
      });

      // Handle ping/pong for connection health
      socket.on('ping', () => {
        socket.emit('pong');
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`🔌 User ${socket.user?.email} disconnected (${socket.id})`);
        
        if (socket.farmId) {
          this.connectedUsers.get(socket.farmId)?.delete(socket.id);
          if (this.connectedUsers.get(socket.farmId)?.size === 0) {
            this.connectedUsers.delete(socket.farmId);
          }
        }
        
        this.userSockets.delete(socket.user?._id?.toString());
      });
    });
  }

  // Emit to all users in a specific farm
  emitToFarm(farmId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`farm:${farmId}`).emit(event, data);
      console.log(`📡 Emitted ${event} to farm ${farmId}`);
    }
  }

  // Emit to all users subscribed to a specific animal
  emitToAnimal(animalId: string, event: string, data: any): void {
    if (this.io) {
      this.io.to(`animal:${animalId}`).emit(event, data);
      console.log(`📡 Emitted ${event} to animal ${animalId}`);
    }
  }

  // Emit to a specific user
  emitToUser(userId: string, event: string, data: any): void {
    const socketId = this.userSockets.get(userId);
    if (this.io && socketId) {
      this.io.to(socketId).emit(event, data);
      console.log(`📡 Emitted ${event} to user ${userId}`);
    }
  }

  // Emit to all connected clients
  emitToAll(event: string, data: any): void {
    if (this.io) {
      this.io.emit(event, data);
      console.log(`📡 Emitted ${event} to all clients`);
    }
  }

  // Get connected users count for a farm
  getFarmConnectionCount(farmId: string): number {
    return this.connectedUsers.get(farmId)?.size || 0;
  }

  // Get all connected farms
  getConnectedFarms(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  getIO(): SocketIOServer | null {
    return this.io;
  }

  // Close the Socket.IO server
  close(): void {
    if (this.io) {
      this.io.close();
      this.io = null;
      this.userSockets.clear();
      this.farmUsers.clear();
      console.log('Socket.IO server closed');
    }
  }
}

export const socketServer = new SocketServer();
export default socketServer;