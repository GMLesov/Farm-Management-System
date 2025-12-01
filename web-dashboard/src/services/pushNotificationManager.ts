// Push Notification Manager
// Handles FCM push notifications and permission requests

import { getMessaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { initializeApp, FirebaseApp } from 'firebase/app';

interface NotificationConfig {
  vapidKey: string;
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

class PushNotificationManager {
  private app: FirebaseApp | null = null;
  private messaging: any = null;
  private token: string | null = null;

  initialize(config: NotificationConfig): void {
    try {
      // Initialize Firebase
      this.app = initializeApp(config.firebaseConfig);
      
      // Check if notifications are supported
      if (!('Notification' in window)) {
        console.warn('[Push Manager] Notifications not supported');
        return;
      }

      // Initialize Firebase Cloud Messaging
      this.messaging = getMessaging(this.app);
      
      // Listen for foreground messages
      onMessage(this.messaging, (payload) => {
        console.log('[Push Manager] Foreground message:', payload);
        this.handleForegroundMessage(payload);
      });

      console.log('[Push Manager] Initialized successfully');
    } catch (error) {
      console.error('[Push Manager] Initialization failed:', error);
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('[Push Manager] Notifications not supported');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    console.log('[Push Manager] Permission status:', permission);
    return permission;
  }

  async getToken(vapidKey: string): Promise<string | null> {
    try {
      if (!this.messaging) {
        console.error('[Push Manager] Messaging not initialized');
        return null;
      }

      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('[Push Manager] Permission denied');
        return null;
      }

      this.token = await getToken(this.messaging, { vapidKey });
      console.log('[Push Manager] FCM Token:', this.token);
      return this.token;
    } catch (error) {
      console.error('[Push Manager] Get token failed:', error);
      return null;
    }
  }

  async sendTokenToServer(token: string, userId: string): Promise<void> {
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      await fetch(`${apiUrl}/workers/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ token, userId })
      });
      console.log('[Push Manager] Token sent to server');
    } catch (error) {
      console.error('[Push Manager] Failed to send token to server:', error);
    }
  }

  handleForegroundMessage(payload: MessagePayload): void {
    const { notification, data } = payload;
    
    if (!notification) return;

    // Show notification using Notification API
    const title = notification.title || 'Farm Management';
    const options = {
      body: notification.body,
      icon: notification.icon || '/logo192.png',
      badge: '/logo192.png',
      tag: data?.tag || 'default',
      data: data || {},
      requireInteraction: false
    };

    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Let service worker handle it
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options);
      });
    } else {
      // Show directly
      new Notification(title, options);
    }
  }

  // Test notification (for development)
  async showTestNotification(): Promise<void> {
    const permission = await this.requestPermission();
    if (permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is a test notification from Farm Management App',
        icon: '/logo192.png',
        tag: 'test'
      });
    }
  }

  getCurrentToken(): string | null {
    return this.token;
  }
}

export const pushManager = new PushNotificationManager();
export default pushManager;
