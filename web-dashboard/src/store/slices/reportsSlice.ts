import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { Animal, Crop, Task, User, Report } from '../../types';

interface ReportsState {
  reports: Report[];
  animals: Animal[];
  crops: Crop[];
  tasks: Task[];
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  reports: [],
  animals: [],
  crops: [],
  tasks: [],
  users: [],
  loading: false,
  error: null,
};

export const fetchReportsData = createAsyncThunk(
  'reports/fetchData',
  async ({ farmId, startDate, endDate }: { farmId: string; startDate?: Date; endDate?: Date }) => {
    try {
      // Base query conditions
      const baseConditions = [where('farmId', '==', farmId)];
      
      // Add date filters if provided
      if (startDate && endDate) {
        const startTimestamp = Timestamp.fromDate(startDate);
        const endTimestamp = Timestamp.fromDate(endDate);
        baseConditions.push(
          where('createdAt', '>=', startTimestamp),
          where('createdAt', '<=', endTimestamp)
        );
      }

      // Fetch animals
      const animalsQuery = query(
        collection(firestore, 'animals'),
        ...baseConditions,
        orderBy('createdAt', 'desc')
      );
      const animalsSnapshot = await getDocs(animalsQuery);
      const animals = animalsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Animal[];

      // Fetch crops
      const cropsQuery = query(
        collection(firestore, 'crops'),
        ...baseConditions,
        orderBy('createdAt', 'desc')
      );
      const cropsSnapshot = await getDocs(cropsQuery);
      const crops = cropsSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        plantingDate: doc.data().plantingDate?.toDate() || new Date(),
        expectedHarvestDate: doc.data().expectedHarvestDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Crop[];

      // Fetch tasks
      const tasksQuery = query(
        collection(firestore, 'tasks'),
        ...baseConditions,
        orderBy('createdAt', 'desc')
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Task[];

      // Fetch users (workers)
      const usersQuery = query(
        collection(firestore, 'users'),
        where('farmId', '==', farmId),
        orderBy('createdAt', 'desc')
      );
      const usersSnapshot = await getDocs(usersQuery);
      const users = usersSnapshot.docs.map(doc => ({ 
        uid: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as User[];

      return {
        animals,
        crops,
        tasks,
        users,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const generateReport = createAsyncThunk(
  'reports/generate',
  async ({ 
    farmId, 
    reportType, 
    startDate, 
    endDate, 
    title, 
    description 
  }: {
    farmId: string;
    reportType: 'animals' | 'crops' | 'tasks' | 'financial' | 'comprehensive';
    startDate: Date;
    endDate: Date;
    title: string;
    description?: string;
  }) => {
    try {
      // This would generate a report document
      // In a real app, this might trigger a server function to generate PDF/Excel
      const report: Report = {
        id: `report_${Date.now()}`,
        farmId,
        title,
        description: description || '',
        type: reportType,
        startDate,
        endDate,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'generated',
        downloadUrl: '', // Would be populated after generation
        fileSize: 0,
        format: 'pdf',
      };

      return report;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addReport: (state, action: PayloadAction<Report>) => {
      state.reports.unshift(action.payload);
    },
    updateReport: (state, action: PayloadAction<Report>) => {
      const index = state.reports.findIndex(report => report.id === action.payload.id);
      if (index !== -1) {
        state.reports[index] = action.payload;
      }
    },
    removeReport: (state, action: PayloadAction<string>) => {
      state.reports = state.reports.filter(report => report.id !== action.payload);
    },
    clearReportsData: (state) => {
      state.animals = [];
      state.crops = [];
      state.tasks = [];
      state.users = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch reports data
    builder.addCase(fetchReportsData.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchReportsData.fulfilled, (state, action) => {
      state.loading = false;
      state.animals = action.payload.animals;
      state.crops = action.payload.crops;
      state.tasks = action.payload.tasks;
      state.users = action.payload.users;
    });
    builder.addCase(fetchReportsData.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch reports data';
    });

    // Generate report
    builder.addCase(generateReport.fulfilled, (state, action) => {
      state.reports.unshift(action.payload);
    });
    builder.addCase(generateReport.rejected, (state, action) => {
      state.error = action.error.message || 'Failed to generate report';
    });
  },
});

export const { 
  clearError, 
  addReport, 
  updateReport, 
  removeReport, 
  clearReportsData 
} = reportsSlice.actions;
export default reportsSlice.reducer;