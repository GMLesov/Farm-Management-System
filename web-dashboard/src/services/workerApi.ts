import axios, { AxiosInstance } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class WorkerApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle token expiration
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/worker-login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(username: string, password: string) {
    const response = await this.api.post('/auth/worker-login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('workerTasks');
    window.location.href = '/worker-login';
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data.user;
  }

  // Tasks
  async getTasks(status?: string, priority?: string) {
    const params: any = {};
    if (status) params.status = status;
    if (priority) params.priority = priority;
    
    const response = await this.api.get('/tasks', { params });
    return response.data.tasks;
  }

  async getTask(id: string) {
    const response = await this.api.get(`/tasks/${id}`);
    return response.data.task;
  }

  async updateTaskStatus(id: string, status: string, notes?: string) {
    const response = await this.api.put(`/tasks/${id}/status`, { status, notes });
    return response.data.task;
  }

  async startTask(id: string) {
    const response = await this.api.put(`/tasks/${id}/status`, { 
      status: 'in-progress',
      startedAt: new Date().toISOString()
    });
    return response.data.task;
  }

  async completeTask(id: string, notes?: string, photos?: string[]) {
    const response = await this.api.put(`/tasks/${id}/status`, { 
      status: 'completed',
      completedAt: new Date().toISOString(),
      notes,
      photos
    });
    return response.data.task;
  }

  async addTaskNote(id: string, note: string) {
    const response = await this.api.post(`/tasks/${id}/notes`, { note });
    return response.data.task;
  }

  // Leave Requests
  async getLeaveRequests(status?: string) {
    const params: any = {};
    if (status) params.status = status;
    
    const response = await this.api.get('/leaves', { params });
    return response.data.leaves;
  }

  async createLeaveRequest(data: {
    type: string;
    startDate: string;
    endDate: string;
    reason: string;
  }) {
    const response = await this.api.post('/leaves', data);
    return response.data.leave;
  }

  async cancelLeaveRequest(id: string) {
    const response = await this.api.delete(`/leaves/${id}`);
    return response.data;
  }

  // Reports/Concerns
  async submitReport(data: {
    category: string;
    description: string;
    priority?: string;
    location?: string;
    photos?: string[];
  }) {
    // Note: You may need to create a reports endpoint
    const response = await this.api.post('/tasks', {
      title: `${data.category} Report`,
      description: data.description,
      priority: data.priority || 'medium',
      location: data.location,
      type: 'report',
      photos: data.photos,
      status: 'pending'
    });
    return response.data.task;
  }

  // Location tracking
  async updateLocation(latitude: number, longitude: number) {
    const response = await this.api.post('/workers/location', {
      latitude,
      longitude,
      timestamp: new Date().toISOString()
    });
    return response.data;
  }

  // Attendance/Check-in
  async checkIn(location?: { lat: number; lng: number }) {
    const response = await this.api.post('/workers/checkin', {
      timestamp: new Date().toISOString(),
      location
    });
    return response.data;
  }

  async checkOut() {
    const response = await this.api.post('/workers/checkout', {
      timestamp: new Date().toISOString()
    });
    return response.data;
  }

  // Calendar/Schedule
  async getSchedule(startDate?: string, endDate?: string) {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await this.api.get('/workers/schedule', { params });
    return response.data.schedule;
  }

  async getCalendarEvents() {
    const response = await this.api.get('/calendar');
    return response.data.events;
  }

  // Offline support
  async syncOfflineData(data: any) {
    const response = await this.api.post('/workers/sync', data);
    return response.data;
  }

  // File upload
  async uploadPhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('photo', file);
    
    const response = await this.api.post('/upload/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  }

  async uploadVoiceNote(blob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('voice', blob, 'voice-note.webm');
    
    const response = await this.api.post('/upload/voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  }
}

export const workerApi = new WorkerApiService();
export default workerApi;
