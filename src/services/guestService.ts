// Guest user management service
import { User, Sprint, UserProgress } from '@/types';
import * as indexedDB from './indexedDB';

const GUEST_STORAGE_KEY = 'elevatr_guest_id';

// Generate a persistent guest ID
export const generateGuestId = (): string => {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Get or create guest ID
export const getGuestId = (): string => {
  let guestId = localStorage.getItem(GUEST_STORAGE_KEY);
  
  if (!guestId) {
    guestId = generateGuestId();
    localStorage.setItem(GUEST_STORAGE_KEY, guestId);
  }
  
  return guestId;
};

// Create a new guest session with new ID
export const createNewGuestSession = (): string => {
  const newGuestId = generateGuestId();
  localStorage.setItem(GUEST_STORAGE_KEY, newGuestId);
  return newGuestId;
};

// Check if user is a guest
export const isGuestUser = (userId: string): boolean => {
  return userId.startsWith('guest_');
};

// Create guest user object
export const createGuestUser = (guestId?: string): User => {
  const id = guestId || getGuestId();
  
  return {
    uid: id,
    email: '',
    displayName: 'Guest User',
    photoURL: undefined,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    preferences: {
      darkMode: false,
      notifications: true,
      notificationTime: '09:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };
};

// Get current guest user if exists
export const getCurrentGuestUser = async (): Promise<User | null> => {
  try {
    const guestId = localStorage.getItem(GUEST_STORAGE_KEY);
    
    if (!guestId) {
      return null;
    }
    
    // Try to load guest data from IndexedDB
    const guestData = await loadGuestData(guestId);
    
    if (guestData) {
      return guestData.user;
    }
    
    // If no data in IndexedDB, create a basic guest user
    return createGuestUser(guestId);
  } catch (error) {
    console.error('Error getting current guest user:', error);
    return null;
  }
};

// Save guest data to IndexedDB
export const saveGuestProgress = async (
  guestId: string, 
  sprints: Sprint[], 
  userProgress: UserProgress[], 
  user: User
): Promise<void> => {
  try {
    await indexedDB.saveGuestData(guestId, {
      sprints,
      userProgress,
      user
    });
  } catch (error) {
    console.error('Error saving guest progress:', error);
    throw error;
  }
};

// Load guest data from IndexedDB
export const loadGuestData = async (guestId: string): Promise<{
  sprints: Sprint[];
  userProgress: UserProgress[];
  user: User;
} | null> => {
  try {
    const data = await indexedDB.getGuestData(guestId);
    
    if (data) {
      return {
        sprints: data.sprints,
        userProgress: data.userProgress,
        user: data.user
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error loading guest data:', error);
    return null;
  }
};

// Check if guest has any data
export const hasGuestData = async (guestId?: string): Promise<boolean> => {
  try {
    const id = guestId || getGuestId();
    const data = await indexedDB.getGuestData(id);
    
    return data !== null && (
      data.sprints.length > 0 || 
      data.userProgress.length > 0
    );
  } catch (error) {
    console.error('Error checking guest data:', error);
    return false;
  }
};

// Delete guest data
export const deleteGuestData = async (guestId?: string): Promise<void> => {
  try {
    const id = guestId || getGuestId();
    await indexedDB.deleteGuestData(id);
    
    // Clear the guest ID from localStorage if it matches
    const currentGuestId = localStorage.getItem(GUEST_STORAGE_KEY);
    if (currentGuestId === id) {
      localStorage.removeItem(GUEST_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error deleting guest data:', error);
    throw error;
  }
};

// Update guest data incrementally
export const updateGuestSprint = async (guestId: string, sprint: Sprint): Promise<void> => {
  try {
    const existingData = await indexedDB.getGuestData(guestId);
    
    if (existingData) {
      const updatedSprints = existingData.sprints.map(s => 
        s.id === sprint.id ? sprint : s
      );
      
      // Add sprint if it doesn't exist
      if (!updatedSprints.find(s => s.id === sprint.id)) {
        updatedSprints.push(sprint);
      }
      
      await indexedDB.saveGuestData(guestId, {
        sprints: updatedSprints,
        userProgress: existingData.userProgress,
        user: existingData.user
      });
    }
  } catch (error) {
    console.error('Error updating guest sprint:', error);
    throw error;
  }
};

export const updateGuestProgress = async (guestId: string, progress: UserProgress): Promise<void> => {
  try {
    const existingData = await indexedDB.getGuestData(guestId);
    
    if (existingData) {
      const updatedProgress = existingData.userProgress.map(p => 
        p.userId === progress.userId && p.sprintId === progress.sprintId ? progress : p
      );
      
      // Add progress if it doesn't exist
      if (!updatedProgress.find(p => p.userId === progress.userId && p.sprintId === progress.sprintId)) {
        updatedProgress.push(progress);
      }
      
      await indexedDB.saveGuestData(guestId, {
        sprints: existingData.sprints,
        userProgress: updatedProgress,
        user: existingData.user
      });
    }
  } catch (error) {
    console.error('Error updating guest progress:', error);
    throw error;
  }
};

// Update guest journal entry
export const updateGuestJournalEntry = async (
  guestId: string, 
  sprintId: string, 
  journalEntry: any
): Promise<void> => {
  try {
    const existingData = await indexedDB.getGuestData(guestId);
    
    if (existingData) {
      const updatedProgress = existingData.userProgress.map(progress => {
        if (progress.userId === guestId && progress.sprintId === sprintId) {
          // Update or add journal entry
          const existingEntryIndex = progress.journalEntries.findIndex(
            je => je.dayId === journalEntry.dayId
          );
          
          const updatedJournalEntries = [...progress.journalEntries];
          
          if (existingEntryIndex >= 0) {
            updatedJournalEntries[existingEntryIndex] = {
              ...journalEntry,
              updatedAt: new Date(),
            };
          } else {
            updatedJournalEntries.push({
              ...journalEntry,
              updatedAt: new Date(),
            });
          }
          
          return {
            ...progress,
            journalEntries: updatedJournalEntries,
          };
        }
        return progress;
      });
      
      await indexedDB.saveGuestData(guestId, {
        sprints: existingData.sprints,
        userProgress: updatedProgress,
        user: existingData.user
      });
    }
  } catch (error) {
    console.error('Error updating guest journal entry:', error);
    throw error;
  }
};

// Update guest task status
export const updateGuestTaskStatus = async (
  guestId: string, 
  sprintId: string, 
  taskStatus: any
): Promise<void> => {
  try {
    const existingData = await indexedDB.getGuestData(guestId);
    
    if (existingData) {
      const updatedProgress = existingData.userProgress.map(progress => {
        if (progress.userId === guestId && progress.sprintId === sprintId) {
          // Update or add task status
          const existingTaskIndex = progress.taskStatuses.findIndex(
            ts => ts.dayId === taskStatus.dayId && 
                  ts.taskType === taskStatus.taskType && 
                  ts.taskIndex === taskStatus.taskIndex
          );
          
          const updatedTaskStatuses = [...progress.taskStatuses];
          
          if (existingTaskIndex >= 0) {
            updatedTaskStatuses[existingTaskIndex] = {
              ...taskStatus,
              updatedAt: new Date(),
            };
          } else {
            updatedTaskStatuses.push({
              ...taskStatus,
              updatedAt: new Date(),
            });
          }
          
          // Update stats
          const completedTasks = updatedTaskStatuses.filter(ts => ts.completed).length;
          
          return {
            ...progress,
            taskStatuses: updatedTaskStatuses,
            stats: {
              ...progress.stats,
              totalTasksCompleted: completedTasks,
              completionPercentage: updatedTaskStatuses.length > 0 
                ? Math.round((completedTasks / updatedTaskStatuses.length) * 100) 
                : 0,
            }
          };
        }
        return progress;
      });
      
      await indexedDB.saveGuestData(guestId, {
        sprints: existingData.sprints,
        userProgress: updatedProgress,
        user: existingData.user
      });
    }
  } catch (error) {
    console.error('Error updating guest task status:', error);
    throw error;
  }
};

// Get guest statistics
export const getGuestStats = async (guestId?: string): Promise<{
  sprintCount: number;
  tasksCompleted: number;
  journalEntries: number;
  dataSize: string;
}> => {
  try {
    const id = guestId || getGuestId();
    const data = await indexedDB.getGuestData(id);
    
    if (!data) {
      return { sprintCount: 0, tasksCompleted: 0, journalEntries: 0, dataSize: '0 KB' };
    }
    
    const tasksCompleted = data.userProgress.reduce((total, progress) => 
      total + progress.taskStatuses.filter(ts => ts.completed).length, 0
    );
    
    const journalEntries = data.userProgress.reduce((total, progress) => 
      total + progress.journalEntries.length, 0
    );
    
    // Estimate data size
    const dataString = JSON.stringify(data);
    const sizeInBytes = new Blob([dataString]).size;
    const sizeInKB = Math.round(sizeInBytes / 1024);
    
    return {
      sprintCount: data.sprints.length,
      tasksCompleted,
      journalEntries,
      dataSize: sizeInKB > 1024 ? `${Math.round(sizeInKB / 1024)} MB` : `${sizeInKB} KB`
    };
  } catch (error) {
    console.error('Error getting guest stats:', error);
    return { sprintCount: 0, tasksCompleted: 0, journalEntries: 0, dataSize: '0 KB' };
  }
};
