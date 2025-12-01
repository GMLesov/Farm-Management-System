import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { connectivityService, offlineSyncManager } from '../../services/offlineSync';

interface OfflineState {
  isOnline: boolean;
  isInternetReachable: boolean;
  syncInProgress: boolean;
  pendingSyncCount: number;
  lastSyncTime: string | null;
  offlineMode: boolean;
  autoSync: boolean;
}

const initialState: OfflineState = {
  isOnline: false,
  isInternetReachable: false,
  syncInProgress: false,
  pendingSyncCount: 0,
  lastSyncTime: null,
  offlineMode: true, // Default to offline-first mode
  autoSync: true,
};

// Async thunks
export const initializeOfflineServices = createAsyncThunk(
  'offline/initializeServices',
  async () => {
    await connectivityService.initialize();
    await offlineSyncManager.initialize();
    
    return {
      connectivity: connectivityService.getState(),
      pendingSyncCount: await offlineSyncManager.getPendingSyncCount(),
    };
  }
);

export const triggerManualSync = createAsyncThunk(
  'offline/triggerManualSync',
  async () => {
    await offlineSyncManager.triggerSync();
    return {
      syncTime: new Date().toISOString(),
      pendingSyncCount: await offlineSyncManager.getPendingSyncCount(),
    };
  }
);

export const toggleOfflineMode = createAsyncThunk(
  'offline/toggleOfflineMode',
  async (enabled: boolean) => {
    // Store preference and return new state
    return { offlineMode: enabled };
  }
);

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    updateConnectivity: (state, action: PayloadAction<{
      isConnected: boolean;
      isInternetReachable: boolean;
    }>) => {
      state.isOnline = action.payload.isConnected;
      state.isInternetReachable = action.payload.isInternetReachable;
    },
    setSyncInProgress: (state, action: PayloadAction<boolean>) => {
      state.syncInProgress = action.payload;
    },
    updatePendingSyncCount: (state, action: PayloadAction<number>) => {
      state.pendingSyncCount = action.payload;
    },
    setLastSyncTime: (state, action: PayloadAction<string>) => {
      state.lastSyncTime = action.payload;
    },
    setAutoSync: (state, action: PayloadAction<boolean>) => {
      state.autoSync = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(initializeOfflineServices.fulfilled, (state, action) => {
        state.isOnline = action.payload.connectivity.isConnected;
        state.isInternetReachable = action.payload.connectivity.isInternetReachable;
        state.pendingSyncCount = action.payload.pendingSyncCount;
      })
      .addCase(triggerManualSync.pending, (state) => {
        state.syncInProgress = true;
      })
      .addCase(triggerManualSync.fulfilled, (state, action) => {
        state.syncInProgress = false;
        state.lastSyncTime = action.payload.syncTime;
        state.pendingSyncCount = action.payload.pendingSyncCount;
      })
      .addCase(triggerManualSync.rejected, (state) => {
        state.syncInProgress = false;
      })
      .addCase(toggleOfflineMode.fulfilled, (state, action) => {
        state.offlineMode = action.payload.offlineMode;
      });
  },
});

export const {
  updateConnectivity,
  setSyncInProgress,
  updatePendingSyncCount,
  setLastSyncTime,
  setAutoSync,
} = offlineSlice.actions;

export default offlineSlice.reducer;