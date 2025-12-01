import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Crop } from '../../types';

interface CropsState {
  crops: Crop[];
  selectedCrop: Crop | null;
  loading: boolean;
  error: string | null;
}

const initialState: CropsState = {
  crops: [],
  selectedCrop: null,
  loading: false,
  error: null,
};

const cropsSlice = createSlice({
  name: 'crops',
  initialState,
  reducers: {
    setCrops: (state, action: PayloadAction<Crop[]>) => {
      state.crops = action.payload;
    },
    setSelectedCrop: (state, action: PayloadAction<Crop | null>) => {
      state.selectedCrop = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setCrops, 
  setSelectedCrop, 
  setLoading, 
  setError, 
  clearError 
} = cropsSlice.actions;
export default cropsSlice.reducer;