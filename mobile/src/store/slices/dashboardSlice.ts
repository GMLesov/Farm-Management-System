import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { firestore } from '../../services/firebase';
import { DashboardMetrics, DashboardState, ChartData } from '../../types';

// Async thunks
export const fetchDashboardMetrics = createAsyncThunk(
  'dashboard/fetchMetrics',
  async (farmId: string) => {
    try {
      // Fetch animals data
      const animalsSnapshot = await firestore()
        .collection('animals')
        .where('farmId', '==', farmId)
        .get();
      
      const animals = animalsSnapshot.docs.map(doc => doc.data());
      const totalAnimals = animals.length;
      const healthyAnimals = animals.filter(a => a.healthStatus === 'healthy').length;
      const sickAnimals = animals.filter(a => a.healthStatus === 'sick').length;

      // Fetch crops data
      const cropsSnapshot = await firestore()
        .collection('crops')
        .where('farmId', '==', farmId)
        .get();
      
      const crops = cropsSnapshot.docs.map(doc => doc.data());
      const totalCrops = crops.length;
      const activeCrops = crops.filter(c => c.stage !== 'harvested').length;
      const harvestedCrops = crops.filter(c => c.stage === 'harvested').length;

      // Fetch tasks data
      const tasksSnapshot = await firestore()
        .collection('tasks')
        .where('farmId', '==', farmId)
        .get();
      
      const tasks = tasksSnapshot.docs.map(doc => doc.data());
      const pendingTasks = tasks.filter(t => t.status === 'pending').length;
      const overdueTasks = tasks.filter(t => 
        t.status !== 'completed' && new Date(t.dueDate.toDate()) < new Date()
      ).length;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const completedTasksToday = tasks.filter(t => 
        t.status === 'completed' && 
        t.completedAt && 
        new Date(t.completedAt.toDate()) >= today && 
        new Date(t.completedAt.toDate()) < tomorrow
      ).length;

      // Fetch expenses for this month
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      const expensesSnapshot = await firestore()
        .collection('expenses')
        .where('farmId', '==', farmId)
        .where('date', '>=', startOfMonth)
        .where('date', '<=', endOfMonth)
        .get();
      
      const monthlyExpenses = expensesSnapshot.docs
        .reduce((sum, doc) => sum + doc.data().amount, 0);

      // Fetch revenue for this month
      const revenueSnapshot = await firestore()
        .collection('revenue')
        .where('farmId', '==', farmId)
        .where('date', '>=', startOfMonth)
        .where('date', '<=', endOfMonth)
        .get();
      
      const monthlyRevenue = revenueSnapshot.docs
        .reduce((sum, doc) => sum + doc.data().amount, 0);

      // Calculate feed consumption today
      const feedConsumptionToday = animals.reduce((total, animal) => {
        const todayFeeding = animal.feedLog?.filter((feed: any) => {
          const feedDate = new Date(feed.date.toDate());
          return feedDate >= today && feedDate < tomorrow;
        }) || [];
        return total + todayFeeding.reduce((sum: number, feed: any) => sum + feed.quantity, 0);
      }, 0);

      // Count upcoming vaccinations (next 7 days)
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      const upcomingVaccinations = animals.reduce((count, animal) => {
        const upcomingVacs = animal.vaccinations?.filter((vac: any) => {
          if (vac.nextDueDate) {
            const dueDate = new Date(vac.nextDueDate.toDate());
            return dueDate >= today && dueDate <= nextWeek;
          }
          return false;
        }) || [];
        return count + upcomingVacs.length;
      }, 0);

      const metrics: DashboardMetrics = {
        totalAnimals,
        healthyAnimals,
        sickAnimals,
        totalCrops,
        activeCrops,
        harvestedCrops,
        pendingTasks,
        overdueTasks,
        completedTasksToday,
        monthlyExpenses,
        monthlyRevenue,
        feedConsumptionToday,
        upcomingVaccinations,
      };

      return metrics;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const fetchChartData = createAsyncThunk(
  'dashboard/fetchChartData',
  async (farmId: string) => {
    try {
      // Get data for last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date;
      }).reverse();

      const labels = last7Days.map(date => 
        date.toLocaleDateString('en-US', { weekday: 'short' })
      );

      // Fetch task completion data
      const tasksSnapshot = await firestore()
        .collection('tasks')
        .where('farmId', '==', farmId)
        .where('status', '==', 'completed')
        .get();

      const tasks = tasksSnapshot.docs.map(doc => doc.data());
      const taskCompletionData = last7Days.map(date => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return tasks.filter(task => {
          if (task.completedAt) {
            const completedDate = new Date(task.completedAt.toDate());
            return completedDate >= startOfDay && completedDate <= endOfDay;
          }
          return false;
        }).length;
      });

      // Fetch expense data
      const expensesSnapshot = await firestore()
        .collection('expenses')
        .where('farmId', '==', farmId)
        .get();

      const expenses = expensesSnapshot.docs.map(doc => doc.data());
      const expenseData = last7Days.map(date => {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        return expenses
          .filter(expense => {
            const expenseDate = new Date(expense.date.toDate());
            return expenseDate >= startOfDay && expenseDate <= endOfDay;
          })
          .reduce((sum, expense) => sum + expense.amount, 0);
      });

      const chartData = {
        animalHealth: {
          labels: ['Healthy', 'Sick', 'Treatment', 'Quarantine'],
          datasets: [{ data: [0, 0, 0, 0] }],
        },
        taskCompletion: {
          labels,
          datasets: [{ data: taskCompletionData }],
        },
        expenses: {
          labels,
          datasets: [{ data: expenseData }],
        },
        feedConsumption: {
          labels,
          datasets: [{ data: Array(7).fill(0) }],
        },
      };

      return chartData;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

// Initial state
const initialState: DashboardState = {
  metrics: null,
  isLoading: false,
  error: null,
  chartData: {
    animalHealth: { labels: [], datasets: [] },
    taskCompletion: { labels: [], datasets: [] },
    expenses: { labels: [], datasets: [] },
    feedConsumption: { labels: [], datasets: [] },
  },
};

// Dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateMetricsLocally: (state, action: PayloadAction<Partial<DashboardMetrics>>) => {
      if (state.metrics) {
        state.metrics = { ...state.metrics, ...action.payload };
      }
    },
    setChartData: (state, action: PayloadAction<Partial<DashboardState['chartData']>>) => {
      state.chartData = { ...state.chartData, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    // Fetch dashboard metrics
    builder.addCase(fetchDashboardMetrics.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
      state.isLoading = false;
      state.metrics = action.payload;
    });
    builder.addCase(fetchDashboardMetrics.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to fetch dashboard metrics';
    });

    // Fetch chart data
    builder.addCase(fetchChartData.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchChartData.fulfilled, (state, action) => {
      state.isLoading = false;
      state.chartData = action.payload;
    });
    builder.addCase(fetchChartData.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to fetch chart data';
    });
  },
});

export const { clearError, updateMetricsLocally, setChartData } = dashboardSlice.actions;
export default dashboardSlice.reducer;