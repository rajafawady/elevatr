import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Task } from '@/types';
import { 
  getTasksByUser, 
  updateTask
} from '@/services/firebase';

interface TaskState {
  // State
  tasks: Task[];
  loading: boolean;
  updating: string | null; // Track which task is being updated
  error: string | null;
  
  // Actions
  loadTasks: (userId: string) => Promise<void>;
  updateTaskOptimistic: (taskId: string, updates: Partial<Task>) => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<string>;
  toggleTaskStatus: (taskId: string, completed: boolean) => Promise<void>;
  clearError: () => void;
  clearTasks: () => void;
  setUpdating: (taskId: string | null) => void;
}

export const useTaskStore = create<TaskState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        tasks: [],
        loading: false,
        updating: null,
        error: null,

        // Load all tasks for a user
        loadTasks: async (userId: string) => {
          const state = get();
          
          // Return cached data if available
          if (state.tasks.length > 0) {
            return;
          }
          
          set({ loading: true, error: null });
          
          try {
            const tasks = await getTasksByUser(userId);
            set({ 
              tasks, 
              loading: false,
              error: null 
            });
          } catch (error) {
            console.error('Error loading tasks:', error);
            set({ 
              loading: false, 
              error: 'Failed to load tasks' 
            });
          }
        },

        // Update task with optimistic updates
        updateTaskOptimistic: async (taskId: string, updates: Partial<Task>) => {
          const state = get();
          
          // Optimistic update
          set(state => ({
            tasks: state.tasks.map(task => 
              task.id === taskId 
                ? { 
                    ...task, 
                    ...updates, 
                    updatedAt: new Date(),
                    ...(updates.status === 'completed' && !task.completedAt ? { completedAt: new Date() } : {})
                  }
                : task
            )
          }));
          
          try {
            await updateTask(taskId, updates);
          } catch (error) {
            // Revert optimistic update on error
            set(state);
            console.error('Error updating task:', error);
            set({ error: 'Failed to update task' });
            throw error;
          }
        },        // Add a new task (simplified version)
        addTask: async (taskData: Omit<Task, 'id'>) => {
          set({ loading: true, error: null });
          
          try {
            // For now, we'll create a temporary task ID
            // In a real implementation, you'd call a Firebase function to create the task
            const taskId = `temp-${Date.now()}`;
            
            const newTask = { 
              ...taskData, 
              id: taskId,
              createdAt: new Date(),
              updatedAt: new Date()
            };
            
            set(state => ({ 
              tasks: [...state.tasks, newTask],
              loading: false,
              error: null 
            }));
            
            return taskId;
          } catch (error) {
            console.error('Error creating task:', error);
            set({ 
              loading: false, 
              error: 'Failed to create task' 
            });
            throw error;
          }
        },

        // Toggle task completion status
        toggleTaskStatus: async (taskId: string, completed: boolean) => {
          const taskKey = taskId;
          set({ updating: taskKey });
          
          try {
            await get().updateTaskOptimistic(taskId, {
              status: completed ? 'completed' : 'active',
              completedAt: completed ? new Date() : null
            });
          } finally {
            set({ updating: null });
          }
        },

        // Set updating status
        setUpdating: (taskId: string | null) => {
          set({ updating: taskId });
        },

        // Clear error
        clearError: () => {
          set({ error: null });
        },

        // Clear tasks (for logout)
        clearTasks: () => {
          set({ 
            tasks: [], 
            loading: false, 
            updating: null,
            error: null 
          });
        },
      }),
      {
        name: 'task-store',
        partialize: (state) => ({ tasks: state.tasks }),
      }
    ),
    { name: 'TaskStore' }
  )
);
