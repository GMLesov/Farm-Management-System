import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Task {
  _id: string;
  title: string;
  description?: string;
  taskType: string;
  priority: string;
  status: string;
  scheduledDate: string;
  [key: string]: any;
}

interface TaskState {
  tasks: Task[];
  upcomingTasks: Task[];
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
  filters: {
    status?: string;
    priority?: string;
    taskType?: string;
    search?: string;
  };
}

const initialState: TaskState = {
  tasks: [],
  upcomingTasks: [],
  selectedTask: null,
  loading: false,
  error: null,
  filters: {},
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.loading = false;
      state.error = null;
    },
    setUpcomingTasks: (state, action: PayloadAction<Task[]>) => {
      state.upcomingTasks = action.payload;
    },
    setSelectedTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.unshift(action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(t => t._id === action.payload._id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
      if (state.selectedTask?._id === action.payload._id) {
        state.selectedTask = action.payload;
      }
    },
    deleteTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t._id !== action.payload);
      if (state.selectedTask?._id === action.payload) {
        state.selectedTask = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setFilters: (state, action: PayloadAction<Partial<TaskState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
  },
});

export const {
  setTasks,
  setUpcomingTasks,
  setSelectedTask,
  addTask,
  updateTask,
  deleteTask,
  setLoading,
  setError,
  setFilters,
  clearFilters,
} = taskSlice.actions;

export default taskSlice.reducer;
