import firestore from '@react-native-firebase/firestore';
import OfflineStorageService from './OfflineStorageService';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';

export class OfflineTaskService {
  private static readonly COLLECTION_NAME = 'tasks';

  // Create a new task (with offline support)
  static async createTask(userId: string, taskData: CreateTaskRequest): Promise<Task> {
    const isOnline = await OfflineStorageService.isOnline();
    
    const task: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: taskData.title,
      description: taskData.description,
      status: 'pending',
      priority: taskData.priority,
      category: taskData.category,
      assignedTo: taskData.assignedTo,
      assignedBy: userId,
      dueDate: taskData.dueDate,
      estimatedTime: taskData.estimatedTime,
      location: taskData.location,
      animalIds: taskData.animalIds,
      cropIds: taskData.cropIds,
      equipment: taskData.equipment,
      notes: taskData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isOnline) {
      try {
        // Try to create online first
        const docRef = await firestore()
          .collection(this.COLLECTION_NAME)
          .add(task);
        
        task.id = docRef.id;
        
        // Update local storage
        await this.updateLocalTask(task);
        
        return task;
      } catch (error) {
        console.error('Failed to create task online, storing offline:', error);
      }
    }

    // Store offline
    await OfflineStorageService.queueAction({
      type: 'CREATE',
      collection: this.COLLECTION_NAME,
      documentId: task.id,
      data: task,
      userId,
    });

    // Store locally for immediate access
    await this.updateLocalTask(task);

    return task;
  }

  // Update a task (with offline support)
  static async updateTask(userId: string, taskUpdate: UpdateTaskRequest): Promise<Task> {
    const isOnline = await OfflineStorageService.isOnline();
    const existingTask = await this.getLocalTask(taskUpdate.id);
    
    if (!existingTask) {
      throw new Error('Task not found');
    }

    const updatedTask: Task = {
      ...existingTask,
      ...taskUpdate,
      updatedAt: new Date().toISOString(),
    };

    if (isOnline) {
      try {
        // Try to update online first
        await firestore()
          .collection(this.COLLECTION_NAME)
          .doc(taskUpdate.id)
          .update(updatedTask);
        
        // Update local storage
        await this.updateLocalTask(updatedTask);
        
        return updatedTask;
      } catch (error) {
        console.error('Failed to update task online, storing offline:', error);
      }
    }

    // Store offline
    await OfflineStorageService.queueAction({
      type: 'UPDATE',
      collection: this.COLLECTION_NAME,
      documentId: taskUpdate.id,
      data: updatedTask,
      userId,
    });

    // Update locally for immediate access
    await this.updateLocalTask(updatedTask);

    return updatedTask;
  }

  // Delete a task (with offline support)
  static async deleteTask(userId: string, taskId: string): Promise<void> {
    const isOnline = await OfflineStorageService.isOnline();

    if (isOnline) {
      try {
        // Try to delete online first
        await firestore()
          .collection(this.COLLECTION_NAME)
          .doc(taskId)
          .delete();
        
        // Remove from local storage
        await this.removeLocalTask(taskId);
        
        return;
      } catch (error) {
        console.error('Failed to delete task online, storing offline:', error);
      }
    }

    // Queue offline deletion
    await OfflineStorageService.queueAction({
      type: 'DELETE',
      collection: this.COLLECTION_NAME,
      documentId: taskId,
      data: {},
      userId,
    });

    // Mark as deleted locally (or remove immediately)
    await this.removeLocalTask(taskId);
  }

  // Get tasks for a user (offline-first)
  static async getUserTasks(userId: string, forceOnline = false): Promise<Task[]> {
    const isOnline = await OfflineStorageService.isOnline();
    
    if (isOnline && forceOnline) {
      try {
        // Fetch from server
        const snapshot = await firestore()
          .collection(this.COLLECTION_NAME)
          .where('assignedTo', '==', userId)
          .orderBy('createdAt', 'desc')
          .get();
        
        const tasks: Task[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Task));
        
        // Update local storage with fresh data
        await this.updateLocalTasks(tasks);
        
        return tasks;
      } catch (error) {
        console.error('Failed to fetch tasks online, using local data:', error);
      }
    }

    // Return local data
    return this.getLocalUserTasks(userId);
  }

  // Get a single task by ID (offline-first)
  static async getTask(taskId: string, forceOnline = false): Promise<Task | null> {
    const isOnline = await OfflineStorageService.isOnline();
    
    if (isOnline && forceOnline) {
      try {
        const doc = await firestore()
          .collection(this.COLLECTION_NAME)
          .doc(taskId)
          .get();
        
        if (doc.exists()) {
          const task: Task = { id: doc.id, ...doc.data() } as Task;
          await this.updateLocalTask(task);
          return task;
        }
      } catch (error) {
        console.error('Failed to fetch task online, using local data:', error);
      }
    }

    // Return local data
    return this.getLocalTask(taskId);
  }

  // Sync tasks from server (background sync)
  static async syncTasks(userId: string): Promise<{ updated: number; errors: number }> {
    const isOnline = await OfflineStorageService.isOnline();
    
    if (!isOnline) {
      return { updated: 0, errors: 1 };
    }

    try {
      const snapshot = await firestore()
        .collection(this.COLLECTION_NAME)
        .where('assignedTo', '==', userId)
        .get();
      
      const serverTasks: Task[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Task));
      
      // Get local tasks
      const localTasks = await this.getLocalUserTasks(userId);
      
      // Merge and resolve conflicts
      const mergedTasks = this.mergeTasks(localTasks, serverTasks);
      
      // Update local storage
      await this.updateLocalTasks(mergedTasks);
      
      return { updated: mergedTasks.length, errors: 0 };
    } catch (error) {
      console.error('Error syncing tasks:', error);
      return { updated: 0, errors: 1 };
    }
  }

  // Private helper methods
  private static async updateLocalTask(task: Task): Promise<void> {
    const localTasks = await this.getLocalUserTasks(task.assignedTo);
    const existingIndex = localTasks.findIndex(t => t.id === task.id);
    
    if (existingIndex >= 0) {
      localTasks[existingIndex] = task;
    } else {
      localTasks.push(task);
    }
    
    await OfflineStorageService.storeOfflineData(this.COLLECTION_NAME, localTasks);
  }

  private static async updateLocalTasks(tasks: Task[]): Promise<void> {
    await OfflineStorageService.storeOfflineData(this.COLLECTION_NAME, tasks);
  }

  private static async removeLocalTask(taskId: string): Promise<void> {
    const localTasks = await OfflineStorageService.getOfflineData(this.COLLECTION_NAME) as Task[];
    const filteredTasks = localTasks.filter(task => task.id !== taskId);
    await OfflineStorageService.storeOfflineData(this.COLLECTION_NAME, filteredTasks);
  }

  // Get all tasks (for admin/manager view)
  static async getAllTasks(): Promise<Task[]> {
    const isOnline = await OfflineStorageService.isOnline();
    
    if (isOnline) {
      try {
        // Try to fetch from server first
        const snapshot = await firestore()
          .collection(this.COLLECTION_NAME)
          .orderBy('createdAt', 'desc')
          .get();
        
        const serverTasks: Task[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Task));
        
        // Get local tasks for merging
        const localTasks = await OfflineStorageService.getOfflineData(this.COLLECTION_NAME) as Task[] || [];
        
        // Merge and store locally
        const mergedTasks = this.mergeTasks(localTasks, serverTasks);
        await this.updateLocalTasks(mergedTasks);
        
        return mergedTasks;
      } catch (error) {
        console.error('Failed to fetch all tasks online, using offline data:', error);
      }
    }
    
    // Return local tasks
    return await OfflineStorageService.getOfflineData(this.COLLECTION_NAME) as Task[] || [];
  }

  private static async getLocalTask(taskId: string): Promise<Task | null> {
    const localTasks = await OfflineStorageService.getOfflineData(this.COLLECTION_NAME) as Task[];
    return localTasks.find(task => task.id === taskId) || null;
  }

  private static async getLocalUserTasks(userId: string): Promise<Task[]> {
    const localTasks = await OfflineStorageService.getOfflineData(this.COLLECTION_NAME) as Task[];
    return localTasks.filter(task => task.assignedTo === userId);
  }

  private static mergeTasks(localTasks: Task[], serverTasks: Task[]): Task[] {
    const mergedMap = new Map<string, Task>();
    
    // Add all local tasks
    localTasks.forEach(task => mergedMap.set(task.id, task));
    
    // Merge server tasks (resolve conflicts)
    serverTasks.forEach(serverTask => {
      const localTask = mergedMap.get(serverTask.id);
      
      if (localTask) {
        // Conflict resolution: use most recent timestamp
        const merged = OfflineStorageService.mergeData(localTask, serverTask);
        mergedMap.set(serverTask.id, merged);
      } else {
        mergedMap.set(serverTask.id, serverTask);
      }
    });
    
    return Array.from(mergedMap.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}

export default OfflineTaskService;