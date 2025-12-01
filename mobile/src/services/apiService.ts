import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, STORAGE_KEYS } from '../config/constants';
import type { ApiResponse, AuthResponse, TasksResponse, ScheduleResponse } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, logout user
          await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
          // Navigate to login screen
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    // Try admin login first, if it fails try worker login with email as username
    try {
      const response = await this.api.post('/api/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      // If admin login fails, try worker login using email as username
      if (error.response?.status === 401 || error.response?.status === 400) {
        try {
          const workerResponse = await this.api.post('/api/auth/worker-login', { username: email, password });
          return workerResponse.data;
        } catch (workerError) {
          throw error; // Throw original error
        }
      }
      throw error;
    }
  }

  async register(data: any): Promise<AuthResponse> {
    const response = await this.api.post('/api/auth/register', data);
    return response.data;
  }

  async getProfile(): Promise<ApiResponse> {
    const response = await this.api.get('/api/auth/profile');
    return response.data;
  }

  // Task endpoints
  async getTasks(filters?: { status?: string; priority?: string }): Promise<TasksResponse> {
    const response = await this.api.get('/api/tasks', { params: filters });
    return response.data;
  }

  async getTask(id: string): Promise<ApiResponse> {
    const response = await this.api.get(`/api/tasks/${id}`);
    return response.data;
  }

  async updateTaskStatus(id: string, status: string, notes?: string): Promise<ApiResponse> {
    const response = await this.api.put(`/api/tasks/${id}`, { status, notes });
    return response.data;
  }

  async completeTask(id: string, rating?: number, feedback?: string): Promise<ApiResponse> {
    const response = await this.api.put(`/api/tasks/${id}/complete`, { rating, feedback });
    return response.data;
  }

  // Worker endpoints
  async getSchedule(date?: string): Promise<ScheduleResponse> {
    const response = await this.api.get('/api/workers/schedule', { params: { date } });
    return response.data;
  }

  async checkIn(location: { latitude: number; longitude: number }): Promise<ApiResponse> {
    const response = await this.api.post('/api/workers/checkin', { location });
    return response.data;
  }

  async checkOut(location: { latitude: number; longitude: number }): Promise<ApiResponse> {
    const response = await this.api.post('/api/workers/checkout', { location });
    return response.data;
  }

  async updateLocation(location: { latitude: number; longitude: number }): Promise<ApiResponse> {
    const response = await this.api.post('/api/workers/location', location);
    return response.data;
  }

  async syncOfflineData(actions: any[]): Promise<ApiResponse> {
    const response = await this.api.post('/api/workers/sync', { actions });
    return response.data;
  }

  async saveFCMToken(token: string): Promise<ApiResponse> {
    const response = await this.api.post('/api/workers/fcm-token', { token });
    return response.data;
  }

  // Leave endpoints
  async getLeaves(): Promise<ApiResponse> {
    const response = await this.api.get('/api/leaves');
    return response.data;
  }

  async createLeave(data: any): Promise<ApiResponse> {
    const response = await this.api.post('/api/leaves', data);
    return response.data;
  }

  async deleteLeave(id: string): Promise<ApiResponse> {
    const response = await this.api.delete(`/api/leaves/${id}`);
    return response.data;
  }

  // File upload
  async uploadPhoto(file: any): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('photo', {
      uri: file.uri,
      type: file.type || 'image/jpeg',
      name: file.fileName || 'photo.jpg'
    } as any);

    const response = await this.api.post('/api/upload/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async uploadVoiceNote(file: any): Promise<ApiResponse> {
    const formData = new FormData();
    formData.append('voice', {
      uri: file.uri,
      type: file.type || 'audio/m4a',
      name: file.fileName || 'voice.m4a'
    } as any);

    const response = await this.api.post('/api/upload/voice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
}

export default new ApiService();
