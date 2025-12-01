import { io, Socket } from 'socket.io-client';
import { NotificationData } from '../types/notification';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private listeners: Map<string, Function[]> = new Map();

  connect(token: string, farmId?: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    try {
      // Disconnect existing socket if any
      this.disconnect();

      const serverUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
      
      this.socket = io(serverUrl, {
        auth: {
          token: token.startsWith('Bearer ') ? token.slice(7) : token
        },
        query: farmId ? { farmId } : undefined,
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true
      });

      this.setupEventListeners();
      
    } catch (error) {
      console.error('Socket connection error:', error);
      this.handleReconnect(token, farmId);
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.reconnectDelay = 1000;
      this.emit('socket:connected', { socketId: this.socket?.id });
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('Socket disconnected:', reason);
      this.emit('socket:disconnected', { reason });
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      this.emit('socket:error', { error: error.message });
    });

    // Notification events
    this.socket.on('notification:new', (data: NotificationData) => {
      console.log('New notification received:', data);
      this.emit('notification:new', data);
    });

    this.socket.on('notification:animal_health', (data: NotificationData) => {
      console.log('Animal health notification:', data);
      this.emit('notification:animal_health', data);
    });

    this.socket.on('notification:feed_alert', (data: NotificationData) => {
      console.log('Feed alert notification:', data);
      this.emit('notification:feed_alert', data);
    });

    this.socket.on('notification:veterinary_reminder', (data: NotificationData) => {
      console.log('Veterinary reminder:', data);
      this.emit('notification:veterinary_reminder', data);
    });

    this.socket.on('notification:breeding_update', (data: NotificationData) => {
      console.log('Breeding update:', data);
      this.emit('notification:breeding_update', data);
    });

    this.socket.on('notification:system_alert', (data: NotificationData) => {
      console.log('System alert:', data);
      this.emit('notification:system_alert', data);
    });

    // Farm events
    this.socket.on('farm:user_joined', (data: { userId: string; farmId: string }) => {
      console.log('User joined farm:', data);
      this.emit('farm:user_joined', data);
    });

    this.socket.on('farm:user_left', (data: { userId: string; farmId: string }) => {
      console.log('User left farm:', data);
      this.emit('farm:user_left', data);
    });

    // Animal subscription events
    this.socket.on('animal:health_update', (data: any) => {
      console.log('Animal health update:', data);
      this.emit('animal:health_update', data);
    });

    this.socket.on('animal:location_update', (data: any) => {
      console.log('Animal location update:', data);
      this.emit('animal:location_update', data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      console.log('Socket disconnected manually');
    }
  }

  private handleReconnect(token: string, farmId?: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('socket:max_reconnect_failed');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelay}ms`);

    setTimeout(() => {
      this.connect(token, farmId);
    }, this.reconnectDelay);

    // Exponential backoff
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
  }

  // Event subscription methods
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!this.listeners.has(event)) return;

    if (callback) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.listeners.delete(event);
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket event callback for ${event}:`, error);
        }
      });
    }
  }

  // Socket.IO specific methods
  joinFarmRoom(farmId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join:farm', { farmId });
    }
  }

  leaveFarmRoom(farmId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave:farm', { farmId });
    }
  }

  subscribeToAnimal(animalId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('subscribe:animal', { animalId });
    }
  }

  unsubscribeFromAnimal(animalId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe:animal', { animalId });
    }
  }

  // Send real-time updates
  sendAnimalHealthUpdate(animalId: string, healthData: any): void {
    if (this.socket?.connected) {
      this.socket.emit('animal:health_update', { animalId, healthData });
    }
  }

  sendAnimalLocationUpdate(animalId: string, locationData: any): void {
    if (this.socket?.connected) {
      this.socket.emit('animal:location_update', { animalId, locationData });
    }
  }

  // Utility methods
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  getConnectionState(): {
    connected: boolean;
    socketId?: string;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected(),
      socketId: this.getSocketId(),
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

export const socketService = new SocketService();
export default socketService;