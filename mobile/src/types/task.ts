export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskCategory = 
  | 'feeding'
  | 'health_check'
  | 'cleaning'
  | 'maintenance'
  | 'harvesting'
  | 'planting'
  | 'monitoring'
  | 'other';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category?: TaskCategory;
  assignedTo: string;
  assignedBy: string;
  dueDate: string;
  completedDate?: string;
  estimatedTime?: number; // in minutes
  actualTime?: number; // in minutes
  location?: string;
  animalIds?: string[];
  cropIds?: string[];
  equipment?: string[];
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  category?: TaskCategory;
  assignedTo: string;
  dueDate: string;
  estimatedTime?: number;
  location?: string;
  animalIds?: string[];
  cropIds?: string[];
  equipment?: string[];
  notes?: string;
}

export interface UpdateTaskRequest {
  id: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDate?: string;
  estimatedTime?: number;
  actualTime?: number;
  location?: string;
  animalIds?: string[];
  cropIds?: string[];
  equipment?: string[];
  notes?: string;
  attachments?: string[];
}

export interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: {
    status?: TaskStatus;
    priority?: TaskPriority;
    category?: TaskCategory;
    assignedTo?: string;
    dateRange?: {
      start: string;
      end: string;
    };
  };
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  completionRate: number;
  averageCompletionTime: number;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: string;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  action: string;
  oldValue?: any;
  newValue?: any;
  timestamp: string;
}