import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Animal {
  _id: string;
  type: string;
  name?: string;
  tagNumber: string;
  breed?: string;
  gender: string;
  healthStatus: string;
  [key: string]: any;
}

interface AnimalState {
  animals: Animal[];
  selectedAnimal: Animal | null;
  loading: boolean;
  error: string | null;
  filters: {
    type?: string;
    healthStatus?: string;
    search?: string;
  };
}

const initialState: AnimalState = {
  animals: [],
  selectedAnimal: null,
  loading: false,
  error: null,
  filters: {},
};

const animalSlice = createSlice({
  name: 'animals',
  initialState,
  reducers: {
    setAnimals: (state, action: PayloadAction<Animal[]>) => {
      state.animals = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedAnimal: (state, action: PayloadAction<Animal | null>) => {
      state.selectedAnimal = action.payload;
    },
    addAnimal: (state, action: PayloadAction<Animal>) => {
      state.animals.unshift(action.payload);
    },
    updateAnimal: (state, action: PayloadAction<Animal>) => {
      const index = state.animals.findIndex(a => a._id === action.payload._id);
      if (index !== -1) {
        state.animals[index] = action.payload;
      }
      if (state.selectedAnimal?._id === action.payload._id) {
        state.selectedAnimal = action.payload;
      }
    },
    deleteAnimal: (state, action: PayloadAction<string>) => {
      state.animals = state.animals.filter(a => a._id !== action.payload);
      if (state.selectedAnimal?._id === action.payload) {
        state.selectedAnimal = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setFilters: (state, action: PayloadAction<Partial<AnimalState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
});

export const {
  setAnimals,
  setSelectedAnimal,
  addAnimal,
  updateAnimal,
  deleteAnimal,
  setLoading,
  setError,
  setFilters,
  clearFilters,
} = animalSlice.actions;

export default animalSlice.reducer;
