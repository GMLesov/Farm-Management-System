import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { firestore } from '../../services/firebase';
import { Notification } from '../../types';

// Enhanced notification state interface
interface NotificationState {
  notifications: Notification[];
  settings: NotificationSettings | null;
  history: NotificationHistoryItem[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
}

interface NotificationSettings {
  taskReminders: boolean;
  vaccinationAlerts: boolean;
  harvestNotifications: boolean;
  feedingReminders: boolean;
  weatherAlerts: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  reminderTime: number;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

interface NotificationHistoryItem {
  id: string;
  title: string;
  message: string;
  type: string;
  timestamp: string;
  isRead: boolean;
}

export const updateNotificationSettings = createAsyncThunk(
  'notifications/updateSettings',
  async (settings: NotificationSettings) => {
    try {
      // Save to AsyncStorage or Firebase
      return settings;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const fetchNotificationHistory = createAsyncThunk(
  'notifications/fetchHistory',
  async (userId: string) => {
    try {
      const snapshot = await firestore()
        .collection('notificationHistory')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(100)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate().toISOString(),
      })) as NotificationHistoryItem[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const clearNotificationHistory = createAsyncThunk(
  'notifications/clearHistory',
  async (userId: string) => {
    try {
      // Clear history from Firebase
      return [];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (userId: string) => {
    try {
      const snapshot = await firestore()
        .collection('notifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
        scheduledFor: doc.data().scheduledFor?.toDate(),
      })) as Notification[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string) => {
    try {
      await firestore()
        .collection('notifications')
        .doc(notificationId)
        .update({ isRead: true });
      
      return notificationId;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (userId: string) => {
    try {
      const snapshot = await firestore()
        .collection('notifications')
        .where('userId', '==', userId)
        .where('isRead', '==', false)
        .get();

      const batch = firestore().batch();
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isRead: true });
      });

      await batch.commit();
      return snapshot.docs.map(doc => doc.id);
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async (notificationId: string) => {
    try {
      await firestore()
        .collection('notifications')
        .doc(notificationId)
        .delete();
      
      return notificationId;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const createNotification = createAsyncThunk(
  'notifications/createNotification',
  async (notificationData: Omit<Notification, 'id' | 'createdAt'>) => {
    try {
      const docRef = await firestore()
        .collection('notifications')
        .add({
          ...notificationData,
          createdAt: new Date(),
        });
      
      const doc = await docRef.get();
      return {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt.toDate(),
        scheduledFor: doc.data()?.scheduledFor?.toDate(),
      } as Notification;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

// Initial state
const initialState: NotificationState = {
  notifications: [],
  settings: null,
  history: [],
  loading: false,
  error: null,
  unreadCount: 0,
};

// Notification slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addNotificationLocally: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    },
    updateUnreadCount: (state) => {
      state.unreadCount = state.notifications.filter(n => !n.isRead).length;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    // Fetch notifications
    builder.addCase(fetchNotifications.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.loading = false;
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
    });
    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch notifications';
    });

    // Mark notification as read
    builder.addCase(markNotificationAsRead.fulfilled, (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    });

    // Mark all notifications as read
    builder.addCase(markAllNotificationsAsRead.fulfilled, (state, action) => {
      action.payload.forEach(id => {
        const notification = state.notifications.find(n => n.id === id);
        if (notification) {
          notification.isRead = true;
        }
      });
      state.unreadCount = 0;
    });

    // Delete notification
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    });

    // Create notification
    builder.addCase(createNotification.fulfilled, (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
    });

    // Update notification settings
    builder.addCase(updateNotificationSettings.fulfilled, (state, action) => {
      state.settings = action.payload;
    });

    // Fetch notification history
    builder.addCase(fetchNotificationHistory.fulfilled, (state, action) => {
      state.history = action.payload;
    });

    // Clear notification history
    builder.addCase(clearNotificationHistory.fulfilled, (state, action) => {
      state.history = [];
    });
  },
});

export const { 
  clearError, 
  addNotificationLocally, 
  updateUnreadCount, 
  clearNotifications 
} = notificationSlice.actions;
export default notificationSlice.reducer;