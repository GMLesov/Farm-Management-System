import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { firestore, storage } from '../../services/firebase';
import { Animal, AnimalState, FeedingRecord, VaccinationRecord } from '../../types';

// Async thunks
export const fetchAnimals = createAsyncThunk(
  'animals/fetchAnimals',
  async (farmId: string) => {
    try {
      const snapshot = await firestore()
        .collection('animals')
        .where('farmId', '==', farmId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Animal[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const addAnimal = createAsyncThunk(
  'animals/addAnimal',
  async (animalData: Omit<Animal, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await firestore()
        .collection('animals')
        .add({
          ...animalData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() } as Animal;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const updateAnimal = createAsyncThunk(
  'animals/updateAnimal',
  async ({ id, data }: { id: string; data: Partial<Animal> }) => {
    try {
      await firestore()
        .collection('animals')
        .doc(id)
        .update({
          ...data,
          updatedAt: new Date(),
        });
      
      const doc = await firestore().collection('animals').doc(id).get();
      return { id: doc.id, ...doc.data() } as Animal;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const deleteAnimal = createAsyncThunk(
  'animals/deleteAnimal',
  async (id: string) => {
    try {
      await firestore().collection('animals').doc(id).delete();
      return id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const addFeedingRecord = createAsyncThunk(
  'animals/addFeedingRecord',
  async ({ animalId, feedingData }: { animalId: string; feedingData: Omit<FeedingRecord, 'id'> }) => {
    try {
      const animalRef = firestore().collection('animals').doc(animalId);
      const animalDoc = await animalRef.get();
      
      if (animalDoc.exists()) {
        const animal = animalDoc.data() as Animal;
        const newFeedingRecord = {
          ...feedingData,
          id: firestore().collection('animals').doc().id,
        };
        
        await animalRef.update({
          feedLog: [...(animal.feedLog || []), newFeedingRecord],
          updatedAt: new Date(),
        });
        
        return { animalId, feedingRecord: newFeedingRecord };
      } else {
        throw new Error('Animal not found');
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const addVaccinationRecord = createAsyncThunk(
  'animals/addVaccinationRecord',
  async ({ animalId, vaccinationData }: { animalId: string; vaccinationData: Omit<VaccinationRecord, 'id'> }) => {
    try {
      const animalRef = firestore().collection('animals').doc(animalId);
      const animalDoc = await animalRef.get();
      
      if (animalDoc.exists()) {
        const animal = animalDoc.data() as Animal;
        const newVaccinationRecord = {
          ...vaccinationData,
          id: firestore().collection('animals').doc().id,
        };
        
        await animalRef.update({
          vaccinations: [...(animal.vaccinations || []), newVaccinationRecord],
          updatedAt: new Date(),
        });
        
        return { animalId, vaccinationRecord: newVaccinationRecord };
      } else {
        throw new Error('Animal not found');
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

// Add health record
export const addHealthRecord = createAsyncThunk(
  'animals/addHealthRecord',
  async ({ animalId, record }: { animalId: string; record: any }) => {
    try {
      const animalRef = firestore().collection('animals').doc(animalId);
      
      // Add to medical history
      await animalRef.update({
        medicalHistory: firestore.FieldValue.arrayUnion(record),
        healthStatus: record.healthStatus,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      return { animalId, healthRecord: record };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

// Initial state
const initialState: AnimalState = {
  animals: [],
  isLoading: false,
  error: null,
  selectedAnimal: null,
};

// Animal slice
const animalSlice = createSlice({
  name: 'animals',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedAnimal: (state, action: PayloadAction<Animal | null>) => {
      state.selectedAnimal = action.payload;
    },
    updateAnimalLocally: (state, action: PayloadAction<{ id: string; data: Partial<Animal> }>) => {
      const index = state.animals.findIndex(animal => animal.id === action.payload.id);
      if (index !== -1) {
        state.animals[index] = { ...state.animals[index], ...action.payload.data };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch animals
    builder.addCase(fetchAnimals.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchAnimals.fulfilled, (state, action) => {
      state.isLoading = false;
      state.animals = action.payload;
    });
    builder.addCase(fetchAnimals.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to fetch animals';
    });

    // Add animal
    builder.addCase(addAnimal.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(addAnimal.fulfilled, (state, action) => {
      state.isLoading = false;
      state.animals.unshift(action.payload);
    });
    builder.addCase(addAnimal.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to add animal';
    });

    // Update animal
    builder.addCase(updateAnimal.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateAnimal.fulfilled, (state, action) => {
      state.isLoading = false;
      const index = state.animals.findIndex(animal => animal.id === action.payload.id);
      if (index !== -1) {
        state.animals[index] = action.payload;
      }
      if (state.selectedAnimal?.id === action.payload.id) {
        state.selectedAnimal = action.payload;
      }
    });
    builder.addCase(updateAnimal.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to update animal';
    });

    // Delete animal
    builder.addCase(deleteAnimal.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteAnimal.fulfilled, (state, action) => {
      state.isLoading = false;
      state.animals = state.animals.filter(animal => animal.id !== action.payload);
      if (state.selectedAnimal?.id === action.payload) {
        state.selectedAnimal = null;
      }
    });
    builder.addCase(deleteAnimal.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to delete animal';
    });

    // Add feeding record
    builder.addCase(addFeedingRecord.fulfilled, (state, action) => {
      const { animalId, feedingRecord } = action.payload;
      const animal = state.animals.find(a => a.id === animalId);
      if (animal) {
        animal.feedLog = [...(animal.feedLog || []), feedingRecord];
      }
      if (state.selectedAnimal?.id === animalId) {
        state.selectedAnimal.feedLog = [...(state.selectedAnimal.feedLog || []), feedingRecord];
      }
    });

    // Add vaccination record
    builder.addCase(addVaccinationRecord.fulfilled, (state, action) => {
      const { animalId, vaccinationRecord } = action.payload;
      const animal = state.animals.find(a => a.id === animalId);
      if (animal) {
        animal.vaccinations = [...(animal.vaccinations || []), vaccinationRecord];
      }
      if (state.selectedAnimal?.id === animalId) {
        state.selectedAnimal.vaccinations = [...(state.selectedAnimal.vaccinations || []), vaccinationRecord];
      }
    });

    // Add health record
    builder.addCase(addHealthRecord.fulfilled, (state, action) => {
      const { animalId, healthRecord } = action.payload;
      const animal = state.animals.find(a => a.id === animalId);
      if (animal) {
        animal.medicalHistory = [...(animal.medicalHistory || []), healthRecord];
        animal.healthStatus = healthRecord.healthStatus;
      }
      if (state.selectedAnimal?.id === animalId) {
        state.selectedAnimal.medicalHistory = [...(state.selectedAnimal.medicalHistory || []), healthRecord];
        state.selectedAnimal.healthStatus = healthRecord.healthStatus;
      }
    });
  },
});

export const { clearError, setSelectedAnimal, updateAnimalLocally } = animalSlice.actions;
export default animalSlice.reducer;