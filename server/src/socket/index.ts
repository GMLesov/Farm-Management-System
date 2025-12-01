import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

export interface SocketUser {
  id: string;
  email: string;
  role: string;
}

export const initializeSocket = (httpServer: HttpServer) => {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: ['http://localhost:3000', 'http://localhost:3002'],
      credentials: true
    }
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      const decoded = jwt.verify(token, JWT_SECRET) as SocketUser;
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user as SocketUser;
    console.log(`✅ User connected: ${user.email} (${socket.id})`);

    // Join user to their personal room
    socket.join(`user:${user.id}`);
    
    // Join role-based rooms
    socket.join(`role:${user.role}`);

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${user.email} (${socket.id})`);
    });

    // Task events
    socket.on('task:created', (data) => {
      console.log('📋 Task created:', data);
      // Broadcast to all admins and assigned user
      io.to('role:admin').to('role:manager').emit('task:new', data);
      if (data.assignedTo) {
        io.to(`user:${data.assignedTo}`).emit('task:assigned', data);
      }
    });

    socket.on('task:updated', (data) => {
      console.log('📝 Task updated:', data);
      io.emit('task:changed', data);
    });

    socket.on('task:completed', (data) => {
      console.log('✅ Task completed:', data);
      io.to('role:admin').to('role:manager').emit('task:done', data);
    });

    // Animal events
    socket.on('animal:created', (data) => {
      console.log('🐄 Animal created:', data);
      io.emit('animal:new', data);
    });

    socket.on('animal:updated', (data) => {
      console.log('📝 Animal updated:', data);
      io.emit('animal:changed', data);
    });

    socket.on('animal:health-alert', (data) => {
      console.log('⚠️ Animal health alert:', data);
      io.to('role:admin').to('role:manager').emit('animal:alert', data);
    });

    // Feeding schedule events
    socket.on('feeding:scheduled', (data) => {
      console.log('🍽️ Feeding scheduled:', data);
      io.emit('feeding:new', data);
    });

    socket.on('feeding:reminder', (data) => {
      console.log('🔔 Feeding reminder:', data);
      io.to('role:worker').to('role:manager').emit('feeding:reminder', data);
    });

    // Breeding events
    socket.on('breeding:recorded', (data) => {
      console.log('🐣 Breeding recorded:', data);
      io.to('role:admin').to('role:manager').emit('breeding:new', data);
    });

    socket.on('breeding:due-soon', (data) => {
      console.log('📅 Breeding due soon:', data);
      io.to('role:admin').to('role:manager').emit('breeding:alert', data);
    });

    // Crop events
    socket.on('crop:created', (data) => {
      console.log('🌱 Crop created:', data);
      io.emit('crop:new', data);
    });

    socket.on('crop:harvest-ready', (data) => {
      console.log('🌾 Crop harvest ready:', data);
      io.to('role:admin').to('role:manager').emit('crop:alert', data);
    });

    // Notification events
    socket.on('notification:send', (data) => {
      console.log('🔔 Notification:', data);
      if (data.targetUserId) {
        io.to(`user:${data.targetUserId}`).emit('notification:received', data);
      } else {
        io.emit('notification:broadcast', data);
      }
    });
  });

  return io;
};

// Helper functions to emit events from API routes
export const emitTaskCreated = (io: SocketServer, task: any) => {
  io.to('role:admin').to('role:manager').emit('task:new', task);
  if (task.assignedTo) {
    io.to(`user:${task.assignedTo}`).emit('task:assigned', task);
  }
};

export const emitAnimalUpdate = (io: SocketServer, animal: any) => {
  io.emit('animal:changed', animal);
};

export const emitBreedingAlert = (io: SocketServer, record: any) => {
  io.to('role:admin').to('role:manager').emit('breeding:alert', record);
};

export const emitFeedingReminder = (io: SocketServer, schedule: any) => {
  io.to('role:worker').to('role:manager').emit('feeding:reminder', schedule);
};
