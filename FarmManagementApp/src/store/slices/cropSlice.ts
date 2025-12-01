import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { firestore } from '../../services/firebase';
import { Crop, CropState, FertilizerRecord, IrrigationRecord, PestControlRecord } from '../../types';

// Async thunks
export const fetchCrops = createAsyncThunk(
  'crops/fetchCrops',
  async (farmId: string) => {
    try {
      const snapshot = await firestore()
        .collection('crops')
        .where('farmId', '==', farmId)
        .orderBy('createdAt', 'desc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Crop[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const addCrop = createAsyncThunk(
  'crops/addCrop',
  async (cropData: Omit<Crop, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await firestore()
        .collection('crops')
        .add({
          ...cropData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      
      const doc = await docRef.get();
      return { id: doc.id, ...doc.data() } as Crop;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const updateCrop = createAsyncThunk(
  'crops/updateCrop',
  async ({ id, data }: { id: string; data: Partial<Crop> }) => {
    try {
      await firestore()
        .collection('crops')
        .doc(id)
        .update({
          ...data,
          updatedAt: new Date(),
        });
      
      const doc = await firestore().collection('crops').doc(id).get();
      return { id: doc.id, ...doc.data() } as Crop;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const deleteCrop = createAsyncThunk(
  'crops/deleteCrop',
  async (id: string) => {
    try {
      await firestore().collection('crops').doc(id).delete();
      return id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const addFertilizerRecord = createAsyncThunk(
  'crops/addFertilizerRecord',
  async ({ cropId, fertilizerData }: { cropId: string; fertilizerData: Omit<FertilizerRecord, 'id'> }) => {
    try {
      const cropRef = firestore().collection('crops').doc(cropId);
      const cropDoc = await cropRef.get();
      
      if (cropDoc.exists()) {
        const crop = cropDoc.data() as Crop;
        const newFertilizerRecord = {
          ...fertilizerData,
          id: firestore().collection('crops').doc().id,
        };
        
        await cropRef.update({
          fertilizerPlan: [...(crop.fertilizerPlan || []), newFertilizerRecord],
          updatedAt: new Date(),
        });
        
        return { cropId, fertilizerRecord: newFertilizerRecord };
      } else {
        throw new Error('Crop not found');
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const addIrrigationRecord = createAsyncThunk(
  'crops/addIrrigationRecord',
  async ({ cropId, irrigationData }: { cropId: string; irrigationData: Omit<IrrigationRecord, 'id'> }) => {
    try {
      const cropRef = firestore().collection('crops').doc(cropId);
      const cropDoc = await cropRef.get();
      
      if (cropDoc.exists()) {
        const crop = cropDoc.data() as Crop;
        const newIrrigationRecord = {
          ...irrigationData,
          id: firestore().collection('crops').doc().id,
        };
        
        await cropRef.update({
          irrigationSchedule: [...(crop.irrigationSchedule || []), newIrrigationRecord],
          updatedAt: new Date(),
        });
        
        return { cropId, irrigationRecord: newIrrigationRecord };
      } else {
        throw new Error('Crop not found');
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const addPestControlRecord = createAsyncThunk(
  'crops/addPestControlRecord',
  async ({ cropId, pestControlData }: { cropId: string; pestControlData: Omit<PestControlRecord, 'id'> }) => {
    try {
      const cropRef = firestore().collection('crops').doc(cropId);
      const cropDoc = await cropRef.get();
      
      if (cropDoc.exists()) {
        const crop = cropDoc.data() as Crop;
        const newPestControlRecord = {
          ...pestControlData,
          id: firestore().collection('crops').doc().id,
        };
        
        await cropRef.update({
          pestControlLog: [...(crop.pestControlLog || []), newPestControlRecord],
          updatedAt: new Date(),
        });
        
        return { cropId, pestControlRecord: newPestControlRecord };
      } else {
        throw new Error('Crop not found');
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

// Initial state
const initialState: CropState = {
  crops: [],
  isLoading: false,
  error: null,
  selectedCrop: null,
};

// Crop slice
const cropSlice = createSlice({
  name: 'crops',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCrop: (state, action: PayloadAction<Crop | null>) => {
      state.selectedCrop = action.payload;
    },
    updateCropLocally: (state, action: PayloadAction<{ id: string; data: Partial<Crop> }>) => {
      const index = state.crops.findIndex(crop => crop.id === action.payload.id);
      if (index !== -1) {
        state.crops[index] = { ...state.crops[index], ...action.payload.data };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch crops
    builder.addCase(fetchCrops.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchCrops.fulfilled, (state, action) => {
      state.isLoading = false;
      state.crops = action.payload;
    });
    builder.addCase(fetchCrops.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to fetch crops';
    });

    // Add crop
    builder.addCase(addCrop.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(addCrop.fulfilled, (state, action) => {
      state.isLoading = false;
      state.crops.unshift(action.payload);
    });
    builder.addCase(addCrop.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to add crop';
    });

    // Update crop
    builder.addCase(updateCrop.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateCrop.fulfilled, (state, action) => {
      state.isLoading = false;
      const index = state.crops.findIndex(crop => crop.id === action.payload.id);
      if (index !== -1) {
        state.crops[index] = action.payload;
      }
      if (state.selectedCrop?.id === action.payload.id) {
        state.selectedCrop = action.payload;
      }
    });
    builder.addCase(updateCrop.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to update crop';
    });

    // Delete crop
    builder.addCase(deleteCrop.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteCrop.fulfilled, (state, action) => {
      state.isLoading = false;
      state.crops = state.crops.filter(crop => crop.id !== action.payload);
      if (state.selectedCrop?.id === action.payload) {
        state.selectedCrop = null;
      }
    });
    builder.addCase(deleteCrop.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to delete crop';
    });

    // Add fertilizer record
    builder.addCase(addFertilizerRecord.fulfilled, (state, action) => {
      const { cropId, fertilizerRecord } = action.payload;
      const crop = state.crops.find(c => c.id === cropId);
      if (crop) {
        crop.fertilizerPlan = [...(crop.fertilizerPlan || []), fertilizerRecord];
      }
      if (state.selectedCrop?.id === cropId) {
        state.selectedCrop.fertilizerPlan = [...(state.selectedCrop.fertilizerPlan || []), fertilizerRecord];
      }
    });

    // Add irrigation record
    builder.addCase(addIrrigationRecord.fulfilled, (state, action) => {
      const { cropId, irrigationRecord } = action.payload;
      const crop = state.crops.find(c => c.id === cropId);
      if (crop) {
        crop.irrigationSchedule = [...(crop.irrigationSchedule || []), irrigationRecord];
      }
      if (state.selectedCrop?.id === cropId) {
        state.selectedCrop.irrigationSchedule = [...(state.selectedCrop.irrigationSchedule || []), irrigationRecord];
      }
    });

    // Add pest control record
    builder.addCase(addPestControlRecord.fulfilled, (state, action) => {
      const { cropId, pestControlRecord } = action.payload;
      const crop = state.crops.find(c => c.id === cropId);
      if (crop) {
        crop.pestControlLog = [...(crop.pestControlLog || []), pestControlRecord];
      }
      if (state.selectedCrop?.id === cropId) {
        state.selectedCrop.pestControlLog = [...(state.selectedCrop.pestControlLog || []), pestControlRecord];
      }
    });
  },
});

export const { clearError, setSelectedCrop, updateCropLocally } = cropSlice.actions;
export default cropSlice.reducer;