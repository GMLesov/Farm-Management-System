import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_CONFIG } from '../../config/constants';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: { email: string; password: string }) => {
    try {
      console.log('Attempting login to:', `${API_CONFIG.BASE_URL}/api/auth/login`);
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/login`, {
        email,
        password,
      });
      
      console.log('Login response:', response.data);
      const { user, token } = response.data;
      
      // Store token and user data
      await AsyncStorage.setItem('@farm_auth_token', token);
      await AsyncStorage.setItem('@farm_user_data', JSON.stringify(user));
      await AsyncStorage.setItem('userRole', user.role);
      
      return user;
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      const message = error.response?.data?.message || error.message || 'Login failed';
      throw new Error(message);
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async ({ 
    email, 
    password, 
    name, 
    role, 
    farmId 
  }: { 
    email: string; 
    password: string; 
    name: string; 
    role: 'manager' | 'worker';
    farmId?: string;
  }) => {
    try {
      const response = await axios.post(`${API_CONFIG.BASE_URL}/api/auth/register`, {
        email,
        password,
        name,
        role,
        farmId,
      });
      
      const { user, token } = response.data;
      
      // Store token and user data
      await AsyncStorage.setItem('@farm_auth_token', token);
      await AsyncStorage.setItem('@farm_user_data', JSON.stringify(user));
      await AsyncStorage.setItem('userRole', role);
      
      return user;
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Signup failed';
      throw new Error(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    try {
      // Clear all stored auth data
      await AsyncStorage.removeItem('@farm_auth_token');
      await AsyncStorage.removeItem('@farm_user_data');
      await AsyncStorage.removeItem('userRole');
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async () => {
    try {
      const token = await AsyncStorage.getItem('@farm_auth_token');
      const userData = await AsyncStorage.getItem('@farm_user_data');
      
      if (token && userData) {
        return JSON.parse(userData) as User;
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Login failed';
    });

    // Signup
    builder.addCase(signupUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(signupUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = true;
    });
    builder.addCase(signupUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Signup failed';
    });

    // Logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    });

    // Get current user
    builder.addCase(getCurrentUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    });
    builder.addCase(getCurrentUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to get user';
    });
  },
});

export const { clearError, setUser, updateUser } = authSlice.actions;
export default authSlice.reducer;