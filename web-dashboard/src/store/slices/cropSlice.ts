import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Crop {
  _id: string;
  name: string;
  type: string;
  fieldLocation: string;
  status: string;
  plantingDate: string;
  [key: string]: any;
}

interface CropState {
  crops: Crop[];
  selectedCrop: Crop | null;
  loading: boolean;
  error: string | null;
  filters: {
    type?: string;
    status?: string;
    search?: string;
  };
}

const initialState: CropState = {
  crops: [],
  selectedCrop: null,
  loading: false,
  error: null,
  filters: {},
};

const cropSlice = createSlice({
  name: 'crops',
  initialState,
  reducers: {
    setCrops: (state, action: PayloadAction<Crop[]>) => {
      state.crops = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedCrop: (state, action: PayloadAction<Crop | null>) => {
      state.selectedCrop = action.payload;
    },
    addCrop: (state, action: PayloadAction<Crop>) => {
      state.crops.unshift(action.payload);
    },
    updateCrop: (state, action: PayloadAction<Crop>) => {
      const index = state.crops.findIndex(c => c._id === action.payload._id);
      if (index !== -1) {
        state.crops[index] = action.payload;
      }
      if (state.selectedCrop?._id === action.payload._id) {
        state.selectedCrop = action.payload;
      }
    },
    deleteCrop: (state, action: PayloadAction<string>) => {
      state.crops = state.crops.filter(c => c._id !== action.payload);
      if (state.selectedCrop?._id === action.payload) {
        state.selectedCrop = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setFilters: (state, action: PayloadAction<Partial<CropState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
});

export const {
  setCrops,
  setSelectedCrop,
  addCrop,
  updateCrop,
  deleteCrop,
  setLoading,
  setError,
  setFilters,
  clearFilters,
} = cropSlice.actions;

export default cropSlice.reducer;
