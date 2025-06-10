import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { UserProgress, TaskStatus } from '@/types';
import { 
  getUserProgress, 
  updateTaskStatus,
  updateJournalEntry 
} from '@/services/firebase';
import * as localStorageService from '@/services/localStorage';
import * as guestService from '@/services/guestService';

interface UserProgressState {
  // State
  userProgress: UserProgress | null;
  loading: boolean;
  updating: string | null; // Track which task is being updated
  error: string | null;
  
  // Actions
  loadUserProgress: (userId: string, sprintId: string) => Promise<void>;
  updateTaskStatusOptimistic: (
    userId: string, 
    sprintId: string, 
    dayId: string, 
    taskType: 'core' | 'special', 
    taskIndex: number, 
    completed: boolean
  ) => Promise<void>;
  updateJournalOptimistic: (
    userId: string, 
    sprintId: string, 
    dayId: string, 
    content: string
  ) => Promise<void>;
  clearError: () => void;
  clearUserProgress: () => void;
  setUpdating: (taskKey: string | null) => void;
}

export const useUserProgressStore = create<UserProgressState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        userProgress: null,
        loading: false,
        updating: null,
        error: null,        // Load user progress for a sprint
        loadUserProgress: async (userId: string, sprintId: string) => {
          const state = get();
          
          // Return cached data if available for same sprint
          if (state.userProgress?.sprintId === sprintId) {
            return;
          }
          
          set({ loading: true, error: null });
          
          try {
            let userProgress: UserProgress | null;
              if (localStorageService.isLocalUser(userId) || guestService.isGuestUser(userId)) {
              // Load from local storage for local users or IndexedDB for guest users
              if (guestService.isGuestUser(userId)) {
                // For guest users, load from IndexedDB
                const guestData = await guestService.loadGuestData(userId);
                if (guestData) {
                  userProgress = guestData.userProgress.find(p => p.sprintId === sprintId) || null;
                  if (!userProgress) {                    // Create new guest progress if it doesn't exist
                    userProgress = {
                      userId,
                      sprintId,
                      taskStatuses: [],
                      journalEntries: [],
                      streaks: {
                        currentTaskStreak: 0,
                        longestTaskStreak: 0,
                        currentJournalStreak: 0,
                        longestJournalStreak: 0,
                      },
                      stats: {
                        totalTasksCompleted: 0,
                        totalDaysCompleted: 0,
                        completionPercentage: 0,
                      },
                    };
                    if (userProgress) {
                      await guestService.updateGuestProgress(userId, userProgress);
                    }
                  }
                } else {
                  userProgress = null;
                }
              } else {
                // For local users, load from localStorage
                userProgress = localStorageService.getLocalProgress(userId, sprintId);
                if (!userProgress) {
                  // Create new local progress if it doesn't exist
                  userProgress = localStorageService.createLocalProgress(userId, sprintId);
                }
              }
            } else {
              // Load from Firebase
              userProgress = await getUserProgress(userId, sprintId);
            }
            
            set({ 
              userProgress, 
              loading: false,
              error: null 
            });
          } catch (error) {
            console.error('Error loading user progress:', error);
            set({ 
              loading: false, 
              error: 'Failed to load user progress' 
            });
          }
        },

        // Update task status with optimistic updates
        updateTaskStatusOptimistic: async (
          userId: string, 
          sprintId: string, 
          dayId: string, 
          taskType: 'core' | 'special', 
          taskIndex: number, 
          completed: boolean
        ) => {
          const taskKey = `${dayId}-${taskType}-${taskIndex}`;
          set({ updating: taskKey });
          
          const state = get();
          const currentProgress = state.userProgress;
          
          if (!currentProgress) {
            set({ updating: null });
            return;
          }
          
          // Create new task status
          const newTaskStatus: TaskStatus = {
            dayId,
            taskType,
            taskIndex,
            completed,
            completedAt: completed ? new Date().toISOString() : null,
            updatedAt: new Date(),
          };
          
          // Optimistic update
          const existingIndex = currentProgress.taskStatuses.findIndex(
            ts => ts.dayId === dayId && ts.taskType === taskType && ts.taskIndex === taskIndex
          );
          
          const newTaskStatuses = [...currentProgress.taskStatuses];
          if (existingIndex >= 0) {
            newTaskStatuses[existingIndex] = newTaskStatus;
          } else {
            newTaskStatuses.push(newTaskStatus);
          }
          
          // Update stats optimistically
          const completedTasks = newTaskStatuses.filter(ts => ts.completed).length;
          const totalTasks = 60; // Assuming 30 days * 2 tasks per day (adjust as needed)
          
          set(state => ({
            userProgress: {
              ...currentProgress,
              taskStatuses: newTaskStatuses,
              stats: {
                ...currentProgress.stats,
                totalTasksCompleted: completedTasks,
                completionPercentage: Math.round((completedTasks / totalTasks) * 100),
              }
            }
          }));            try {
            if (localStorageService.isLocalUser(userId) || guestService.isGuestUser(userId)) {
              // Update local storage for local users or IndexedDB for guest users
              if (guestService.isGuestUser(userId)) {
                // For guest users, update IndexedDB
                await guestService.updateGuestTaskStatus(userId, sprintId, newTaskStatus);
              } else {
                // For local users, update localStorage
                localStorageService.updateLocalTaskStatus(userId, sprintId, newTaskStatus);
              }
            } else {
              // Update Firebase
              await updateTaskStatus(userId, sprintId, newTaskStatus);
            }
          } catch (error) {
            // Revert optimistic update on error
            set({ userProgress: currentProgress });
            console.error('Error updating task status:', error);
            set({ error: 'Failed to update task status' });
          } finally {
            set({ updating: null });
          }
        },

        // Update journal entry with optimistic updates
        updateJournalOptimistic: async (
          userId: string, 
          sprintId: string, 
          dayId: string, 
          content: string
        ) => {
          const state = get();
          const currentProgress = state.userProgress;
          
          if (!currentProgress) return;
          
          // Optimistic update
          const existingIndex = currentProgress.journalEntries.findIndex(
            entry => entry.dayId === dayId
          );
          
          const newJournalEntry = {
            id: existingIndex >= 0 ? currentProgress.journalEntries[existingIndex].id : `temp-${dayId}`,
            userId,
            dayId,
            content,
            createdAt: existingIndex >= 0 ? currentProgress.journalEntries[existingIndex].createdAt : new Date(),
            updatedAt: new Date(),
          };
          
          const newJournalEntries = [...currentProgress.journalEntries];
          if (existingIndex >= 0) {
            newJournalEntries[existingIndex] = newJournalEntry;
          } else {
            newJournalEntries.push(newJournalEntry);
          }
          
          set(state => ({
            userProgress: {
              ...currentProgress,
              journalEntries: newJournalEntries,
            }
          }));            try {
            const journalEntry = {
              id: existingIndex >= 0 ? currentProgress.journalEntries[existingIndex].id : `temp-${dayId}`,
              userId,
              dayId,
              content,
              createdAt: existingIndex >= 0 ? currentProgress.journalEntries[existingIndex].createdAt : new Date(),
              updatedAt: new Date(),
            };
              if (localStorageService.isLocalUser(userId) || guestService.isGuestUser(userId)) {
              // Update local storage for local users or IndexedDB for guest users
              if (guestService.isGuestUser(userId)) {
                // For guest users, update IndexedDB
                await guestService.updateGuestJournalEntry(userId, sprintId, journalEntry);
              } else {
                // For local users, update localStorage
                localStorageService.updateLocalJournalEntry(userId, sprintId, journalEntry);
              }
            } else {
              // Update Firebase
              await updateJournalEntry(userId, sprintId, journalEntry);
            }
          } catch (error) {
            // Revert optimistic update on error
            set({ userProgress: currentProgress });
            console.error('Error updating journal:', error);
            set({ error: 'Failed to update journal' });
          }
        },

        // Set updating status
        setUpdating: (taskKey: string | null) => {
          set({ updating: taskKey });
        },

        // Clear error
        clearError: () => {
          set({ error: null });
        },

        // Clear user progress (for logout)
        clearUserProgress: () => {
          set({ 
            userProgress: null, 
            loading: false, 
            updating: null,
            error: null 
          });
        },
      }),
      {
        name: 'user-progress-store',
        partialize: (state) => ({ userProgress: state.userProgress }),
      }
    ),
    { name: 'UserProgressStore' }
  )
);
