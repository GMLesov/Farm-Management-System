import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { firestore } from '../../services/firebase';
import { Task, TaskState, TaskFilter } from '../../types';

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async ({ farmId, filter }: { farmId: string; filter?: TaskFilter }) => {
    try {
      let query = firestore()
        .collection('tasks')
        .where('farmId', '==', farmId);

      if (filter?.assignedTo) {
        query = query.where('assignedTo', '==', filter.assignedTo);
      }
      if (filter?.status) {
        query = query.where('status', '==', filter.status);
      }
      if (filter?.type) {
        query = query.where('type', '==', filter.type);
      }

      const snapshot = await query.orderBy('dueDate', 'asc').get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as Task[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const addTask = createAsyncThunk(
  'tasks/addTask',
  async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const docRef = await firestore()
        .collection('tasks')
        .add({
          ...taskData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      
      const doc = await docRef.get();
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        dueDate: data?.dueDate.toDate(),
        createdAt: data?.createdAt.toDate(),
        updatedAt: data?.updatedAt.toDate(),
        completedAt: data?.completedAt?.toDate(),
      } as Task;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, data }: { id: string; data: Partial<Task> }) => {
    try {
      await firestore()
        .collection('tasks')
        .doc(id)
        .update({
          ...data,
          updatedAt: new Date(),
        });
      
      const doc = await firestore().collection('tasks').doc(id).get();
      const docData = doc.data();
      return {
        id: doc.id,
        ...docData,
        dueDate: docData?.dueDate.toDate(),
        createdAt: docData?.createdAt.toDate(),
        updatedAt: docData?.updatedAt.toDate(),
        completedAt: docData?.completedAt?.toDate(),
      } as Task;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const completeTask = createAsyncThunk(
  'tasks/completeTask',
  async ({ id, proofPhotos, notes }: { id: string; proofPhotos?: string[]; notes?: string }) => {
    try {
      const updateData: any = {
        status: 'completed',
        completedAt: new Date(),
        updatedAt: new Date(),
      };

      if (proofPhotos) updateData.proofPhotos = proofPhotos;
      if (notes) updateData.notes = notes;

      await firestore()
        .collection('tasks')
        .doc(id)
        .update(updateData);
      
      const doc = await firestore().collection('tasks').doc(id).get();
      const docData = doc.data();
      return {
        id: doc.id,
        ...docData,
        dueDate: docData?.dueDate.toDate(),
        createdAt: docData?.createdAt.toDate(),
        updatedAt: docData?.updatedAt.toDate(),
        completedAt: docData?.completedAt?.toDate(),
      } as Task;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string) => {
    try {
      await firestore().collection('tasks').doc(id).delete();
      return id;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

export const fetchTasksByUser = createAsyncThunk(
  'tasks/fetchTasksByUser',
  async ({ userId, farmId }: { userId: string; farmId: string }) => {
    try {
      const snapshot = await firestore()
        .collection('tasks')
        .where('farmId', '==', farmId)
        .where('assignedTo', '==', userId)
        .where('status', 'in', ['pending', 'in-progress'])
        .orderBy('dueDate', 'asc')
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate.toDate(),
        createdAt: doc.data().createdAt.toDate(),
        updatedAt: doc.data().updatedAt.toDate(),
        completedAt: doc.data().completedAt?.toDate(),
      })) as Task[];
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
);

// Initial state
const initialState: TaskState = {
  tasks: [],
  isLoading: false,
  error: null,
  filter: {},
};

// Task slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilter: (state, action: PayloadAction<TaskFilter>) => {
      state.filter = action.payload;
    },
    updateTaskStatus: (state, action: PayloadAction<{ id: string; status: Task['status'] }>) => {
      const task = state.tasks.find(t => t.id === action.payload.id);
      if (task) {
        task.status = action.payload.status;
        task.updatedAt = new Date();
        if (action.payload.status === 'completed') {
          task.completedAt = new Date();
        }
      }
    },
    addTaskLocally: (state, action: PayloadAction<Task>) => {
      state.tasks.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder.addCase(fetchTasks.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state.isLoading = false;
      state.tasks = action.payload;
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to fetch tasks';
    });

    // Add task
    builder.addCase(addTask.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(addTask.fulfilled, (state, action) => {
      state.isLoading = false;
      state.tasks.unshift(action.payload);
    });
    builder.addCase(addTask.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to add task';
    });

    // Update task
    builder.addCase(updateTask.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateTask.fulfilled, (state, action) => {
      state.isLoading = false;
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    });
    builder.addCase(updateTask.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to update task';
    });

    // Complete task
    builder.addCase(completeTask.fulfilled, (state, action) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    });

    // Delete task
    builder.addCase(deleteTask.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteTask.fulfilled, (state, action) => {
      state.isLoading = false;
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
    });
    builder.addCase(deleteTask.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Failed to delete task';
    });

    // Fetch tasks by user
    builder.addCase(fetchTasksByUser.fulfilled, (state, action) => {
      state.tasks = action.payload;
    });
  },
});

export const { clearError, setFilter, updateTaskStatus, addTaskLocally } = taskSlice.actions;

// Export alias for compatibility
export const loadTasks = fetchTasks;

export default taskSlice.reducer;