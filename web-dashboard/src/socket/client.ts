import { io, Socket } from 'socket.io-client';
import { store } from '../store';
import { addNotification } from '../store/slices/uiSlice';

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      store.dispatch(addNotification({ message: 'Connected to real-time updates', type: 'success' }));
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect manually
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        store.dispatch(addNotification({ message: 'Failed to connect to real-time updates', type: 'error' }));
      }
    });

    // Task events
    this.socket.on('task:new', (task) => {
      console.log('📋 New task received:', task);
      store.dispatch(addNotification({ message: 'New task assigned', type: 'info' }));
    });

    this.socket.on('task:assigned', (task) => {
      console.log('📋 Task assigned to you:', task);
      store.dispatch(addNotification({ message: `New task assigned: ${task.title}`, type: 'info' }));
    });

    this.socket.on('task:changed', (task) => {
      console.log('📝 Task updated:', task);
      store.dispatch(addNotification({ message: 'Task updated', type: 'info' }));
    });

    this.socket.on('task:done', (task) => {
      console.log('✅ Task completed:', task);
      store.dispatch(addNotification({ message: `Task completed: ${task.title}`, type: 'success' }));
    });

    // Animal events
    this.socket.on('animal:new', (animal) => {
      console.log('🐄 New animal:', animal);
      store.dispatch(addNotification({ message: 'New animal added', type: 'success' }));
    });

    this.socket.on('animal:changed', (animal) => {
      console.log('📝 Animal updated:', animal);
      store.dispatch(addNotification({ message: 'Animal updated', type: 'info' }));
    });

    this.socket.on('animal:alert', (data) => {
      console.log('⚠️ Animal health alert:', data);
      store.dispatch(addNotification({ message: `Health alert: ${data.animal?.name || 'Unknown'} - ${data.message}`, type: 'warning' }));
    });

    // Feeding events
    this.socket.on('feeding:new', (schedule) => {
      console.log('🍽️ New feeding schedule:', schedule);
      store.dispatch(addNotification({ message: 'New feeding schedule created', type: 'success' }));
    });

    this.socket.on('feeding:reminder', (schedule) => {
      console.log('🔔 Feeding reminder:', schedule);
      store.dispatch(addNotification({ message: `Feeding reminder: ${schedule.animal?.name || 'Unknown animal'}`, type: 'info' }));
    });

    // Breeding events
    this.socket.on('breeding:new', (record) => {
      console.log('🐣 New breeding record:', record);
      store.dispatch(addNotification({ message: 'New breeding record created', type: 'success' }));
    });

    this.socket.on('breeding:alert', (record) => {
      console.log('📅 Breeding alert:', record);
      const message = record.expectedDeliveryDate 
        ? `Breeding due soon: ${new Date(record.expectedDeliveryDate).toLocaleDateString()}`
        : 'Breeding alert';
      store.dispatch(addNotification({ message, type: 'info' }));
    });

    // Crop events
    this.socket.on('crop:new', (crop) => {
      console.log('🌱 New crop:', crop);
      store.dispatch(addNotification({ message: 'New crop added', type: 'success' }));
    });

    this.socket.on('crop:alert', (crop) => {
      console.log('🌾 Crop alert:', crop);
      store.dispatch(addNotification({ message: `Crop ready: ${crop.name}`, type: 'info' }));
    });

    // Notification events
    this.socket.on('notification:received', (notification) => {
      console.log('🔔 Notification:', notification);
      store.dispatch(addNotification({ message: notification.message || 'New notification', type: 'info' }));
    });

    this.socket.on('notification:broadcast', (notification) => {
      console.log('📢 Broadcast notification:', notification);
      store.dispatch(addNotification({ message: notification.message || 'System notification', type: 'info' }));
    });
  }

  // Emit events to server
  emitTaskCreated(task: any) {
    this.socket?.emit('task:created', task);
  }

  emitTaskUpdated(task: any) {
    this.socket?.emit('task:updated', task);
  }

  emitTaskCompleted(task: any) {
    this.socket?.emit('task:completed', task);
  }

  emitAnimalCreated(animal: any) {
    this.socket?.emit('animal:created', animal);
  }

  emitAnimalUpdated(animal: any) {
    this.socket?.emit('animal:updated', animal);
  }

  emitAnimalHealthAlert(data: any) {
    this.socket?.emit('animal:health-alert', data);
  }

  emitFeedingScheduled(schedule: any) {
    this.socket?.emit('feeding:scheduled', schedule);
  }

  emitBreedingRecorded(record: any) {
    this.socket?.emit('breeding:recorded', record);
  }

  emitCropCreated(crop: any) {
    this.socket?.emit('crop:created', crop);
  }

  emitNotification(notification: any) {
    this.socket?.emit('notification:send', notification);
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketClient = new SocketClient();
export default socketClient;
