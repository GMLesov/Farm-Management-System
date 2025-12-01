import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Animal } from '../../types';

interface AnimalsState {
  animals: Animal[];
  selectedAnimal: Animal | null;
  loading: boolean;
  error: string | null;
}

const initialState: AnimalsState = {
  animals: [],
  selectedAnimal: null,
  loading: false,
  error: null,
};

const animalsSlice = createSlice({
  name: 'animals',
  initialState,
  reducers: {
    setAnimals: (state, action: PayloadAction<Animal[]>) => {
      state.animals = action.payload;
    },
    setSelectedAnimal: (state, action: PayloadAction<Animal | null>) => {
      state.selectedAnimal = action.payload;
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
  setAnimals, 
  setSelectedAnimal, 
  setLoading, 
  setError, 
  clearError 
} = animalsSlice.actions;
export default animalsSlice.reducer;