import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { DashboardMetrics, Animal, Crop, Task } from '../../types';

interface DashboardState {
  metrics: DashboardMetrics | null;
  recentAnimals: Animal[];
  recentCrops: Crop[];
  recentTasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  metrics: null,
  recentAnimals: [],
  recentCrops: [],
  recentTasks: [],
  loading: false,
  error: null,
};

export const fetchDashboardMetrics = createAsyncThunk(
  'dashboard/fetchMetrics',
  async (farmId: string) => {
    try {
      // Fetch animals
      const animalsQuery = query(
        collection(firestore, 'animals'),
        where('farmId', '==', farmId)
      );
      const animalsSnapshot = await getDocs(animalsQuery);
      const animals = animalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Animal[];

      // Fetch crops
      const cropsQuery = query(
        collection(firestore, 'crops'),
        where('farmId', '==', farmId)
      );
      const cropsSnapshot = await getDocs(cropsQuery);
      const crops = cropsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Crop[];

      // Fetch tasks
      const tasksQuery = query(
        collection(firestore, 'tasks'),
        where('farmId', '==', farmId)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];

      // Calculate metrics
      const totalAnimals = animals.length;
  const healthyAnimals = animals.filter(animal => animal.healthStatus === 'healthy').length;
  const sickAnimals = animals.filter(animal => animal.healthStatus === 'sick').length;

      const totalCrops = crops.length;
      const activeCrops = crops.filter(crop => crop.stage === 'growing').length;
      const harvestedCrops = crops.filter(crop => crop.stage === 'harvested').length;

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'completed').length;
      const pendingTasks = tasks.filter(task => task.status === 'pending').length;

      // Calculate total area
  // Note: additional metrics like in-progress tasks, quarantined animals,
  // total crop area, and completion rates can be added here when the UI needs them.

      const metrics: DashboardMetrics = {
        totalAnimals,
        healthyAnimals,
        sickAnimals,
        totalCrops,
        activeCrops,
        harvestedCrops,
        totalTasks,
        completedTasks,
        overdueTasks: 0, // Would need to calculate based on due dates
        pendingTasks,
        totalWorkers: 0, // Would need to fetch from users collection
        activeWorkers: 0, // Would need to calculate active users
        totalRevenue: 0, // Would need financial data
        totalExpenses: 0, // Would need financial data
        profitMargin: 0, // Would need financial calculations
        period: 'month' as const,
        updatedAt: new Date(),
      };

      // Get recent items
      const recentAnimalsQuery = query(
        collection(firestore, 'animals'),
        where('farmId', '==', farmId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentAnimalsSnapshot = await getDocs(recentAnimalsQuery);
      const recentAnimals = recentAnimalsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Animal[];

      const recentCropsQuery = query(
        collection(firestore, 'crops'),
        where('farmId', '==', farmId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentCropsSnapshot = await getDocs(recentCropsQuery);
      const recentCrops = recentCropsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Crop[];

      const recentTasksQuery = query(
        collection(firestore, 'tasks'),
        where('farmId', '==', farmId),
        orderBy('createdAt', 'desc'),
        limit(5)
      );
      const recentTasksSnapshot = await getDocs(recentTasksQuery);
      const recentTasks = recentTasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];

      return {
        metrics,
        recentAnimals,
        recentCrops,
        recentTasks,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetDashboard: (state) => {
      state.metrics = null;
      state.recentAnimals = [];
      state.recentCrops = [];
      state.recentTasks = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDashboardMetrics.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
      state.loading = false;
      state.metrics = action.payload.metrics;
      state.recentAnimals = action.payload.recentAnimals;
      state.recentCrops = action.payload.recentCrops;
      state.recentTasks = action.payload.recentTasks;
    });
    builder.addCase(fetchDashboardMetrics.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch dashboard metrics';
    });
  },
});

export const { clearError, resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;