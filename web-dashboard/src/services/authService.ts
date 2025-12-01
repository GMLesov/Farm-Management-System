import { apiService } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface WorkerLoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'admin' | 'worker';
}

export interface User {
  _id: string;
  email?: string;
  username?: string;
  name: string;
  role: 'admin' | 'worker';
  phone?: string;
  avatar?: string;
  isActive: boolean;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

class AuthService {
  // Admin login
  async loginAdmin(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<any>('/auth/login', credentials);
      
      // ApiResponse returns { success, data?, message?, error? }
      // But auth endpoints return { success, token, user } directly
      const authData = response as any;
      if (authData?.token && authData?.user) {
        this.setSession(authData.token, authData.user);
        return { success: true, token: authData.token, user: authData.user };
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      throw error;
    }
  }

  // Worker login
  async loginWorker(credentials: WorkerLoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiService.post<any>('/auth/worker-login', credentials);
      
      // ApiResponse returns { success, data?, message?, error? }
      // But auth endpoints return { success, token, user } directly
      const authData = response as any;
      if (authData?.token && authData?.user) {
        this.setSession(authData.token, authData.user);
        return { success: true, token: authData.token, user: authData.user };
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      throw error;
    }
  }

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiService.post<any>('/auth/register', data);
      
      // ApiResponse returns { success, data?, message?, error? }
      // But auth endpoints return { success, token, user } directly
      const authData = response as any;
      if (authData?.token && authData?.user) {
        this.setSession(authData.token, authData.user);
        return { success: true, token: authData.token, user: authData.user };
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      throw error;
    }
  }

  // Get current user profile
  async getProfile(): Promise<User> {
    try {
      const response = await apiService.get<User>('/auth/me');
      return response.data!;
    } catch (error) {
      throw error;
    }
  }

  // Logout
  logout(): void {
    this.clearSession();
    window.location.href = '/login';
  }

  // Session management
  private setSession(token: string, user: User): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    apiService.setAuthToken(token);
  }

  private clearSession(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    apiService.clearAuthToken();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Check if current user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  // Check if current user is worker
  isWorker(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'worker';
  }
}

export const authService = new AuthService();
