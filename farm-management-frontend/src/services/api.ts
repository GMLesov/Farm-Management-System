import {
  NotificationData,
  NotificationResponse,
  NotificationFilter,
  TestNotificationRequest,
  NotificationConnectionStatus
} from '../types/notification';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export interface GetNotificationsParams extends NotificationFilter {
  page?: number;
  limit?: number;
  unread_only?: boolean;
}

export const notificationApi = {
  // Get notifications with pagination and filtering
  async getNotifications(params: GetNotificationsParams = {}): Promise<NotificationResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const response = await fetch(
      `${API_BASE_URL}/api/notifications?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    return handleResponse<NotificationResponse>(response);
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/${notificationId}/read`,
      {
        method: 'PATCH',
        headers: getAuthHeaders()
      }
    );

    return handleResponse<{ success: boolean; message: string }>(response);
  },

  // Delete notification
  async deleteNotification(notificationId: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/${notificationId}`,
      {
        method: 'DELETE',
        headers: getAuthHeaders()
      }
    );

    return handleResponse<{ success: boolean; message: string }>(response);
  },

  // Send test notification (development only)
  async sendTestNotification(data: TestNotificationRequest): Promise<{ success: boolean; message: string }> {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/test`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      }
    );

    return handleResponse<{ success: boolean; message: string }>(response);
  },

  // Get connection status
  async getConnectionStatus(): Promise<NotificationConnectionStatus> {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/status`,
      {
        method: 'GET',
        headers: getAuthHeaders()
      }
    );

    return handleResponse<NotificationConnectionStatus>(response);
  },

  // Mark all notifications as read for a farm
  async markAllAsRead(farmId: string): Promise<{ success: boolean; message: string; count: number }> {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/mark-all-read`,
      {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ farmId })
      }
    );

    return handleResponse<{ success: boolean; message: string; count: number }>(response);
  },

  // Clear all read notifications for a farm
  async clearAllRead(farmId: string): Promise<{ success: boolean; message: string; count: number }> {
    const response = await fetch(
      `${API_BASE_URL}/api/notifications/clear-read`,
      {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ farmId })
      }
    );

    return handleResponse<{ success: boolean; message: string; count: number }>(response);
  }
};