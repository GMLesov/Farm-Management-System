import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { auth, firestore } from '../../services/firebase';
import { User, AuthState } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }: { email: string; password: string }) => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const userDoc = await firestore()
        .collection('users')
        .doc(userCredential.user.uid)
        .get();
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        await AsyncStorage.setItem('userRole', userData.role);
        return userData;
      } else {
        throw new Error('User data not found');
      }
    } catch (error: any) {
      throw new Error(error.message);
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
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const userData: User = {
        uid: userCredential.user.uid,
        email,
        name,
        role,
        farmId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await firestore()
        .collection('users')
        .doc(userCredential.user.uid)
        .set(userData);

      await AsyncStorage.setItem('userRole', role);
      return userData;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    try {
      await auth().signOut();
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
      const currentUser = auth().currentUser;
      if (currentUser) {
        const userDoc = await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .get();
        
        if (userDoc.exists()) {
          return userDoc.data() as User;
        }
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