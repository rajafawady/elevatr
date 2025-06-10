// Local storage service for offline data management
import { Sprint, UserProgress, TaskStatus, JournalEntry, User } from '@/types';

const STORAGE_KEYS = {
  LOCAL_USER: 'elevatr_local_user',
  LOCAL_SPRINTS: 'elevatr_local_sprints',
  LOCAL_PROGRESS: 'elevatr_local_progress',
  CACHED_DATA_PREFIX: 'elevatr_cached_',
  USER_PREFERENCES: 'elevatr_preferences',
} as const;

// Generate unique local user ID
const generateLocalUserId = (): string => {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Local user management
export const getLocalUser = (): User | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LOCAL_USER);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    console.error('Error getting local user:', error);
    return null;
  }
};

export const createLocalUser = (preferences: Partial<User['preferences']> = {}): User => {
  const localUser: User = {
    uid: generateLocalUserId(),
    email: '',
    displayName: 'Local User',
    photoURL: undefined,
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    preferences: {
      darkMode: false,
      notifications: true,
      notificationTime: '09:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      ...preferences,
    },
  };

  try {
    localStorage.setItem(STORAGE_KEYS.LOCAL_USER, JSON.stringify(localUser));
    return localUser;
  } catch (error) {
    console.error('Error creating local user:', error);
    throw error;
  }
};

export const createLocalUserFromFirebaseUser = (firebaseUser: User): User => {
  const localUser: User = {
    uid: `cached_${firebaseUser.uid}`, // Special prefix to identify cached users
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || 'User',
    photoURL: firebaseUser.photoURL,
    createdAt: firebaseUser.createdAt,
    lastLoginAt: new Date().toISOString(),
    preferences: firebaseUser.preferences || {
      darkMode: false,
      notifications: true,
      notificationTime: '09:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    originalFirebaseUid: firebaseUser.uid, // Store original Firebase UID for sync back
  };

  try {
    localStorage.setItem(STORAGE_KEYS.LOCAL_USER, JSON.stringify(localUser));
    return localUser;
  } catch (error) {
    console.error('Error creating cached local user:', error);
    throw error;
  }
};

export const updateLocalUser = (updates: Partial<User>): User | null => {
  try {
    const currentUser = getLocalUser();
    if (!currentUser) return null;

    const updatedUser = {
      ...currentUser,
      ...updates,
      lastLoginAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEYS.LOCAL_USER, JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error('Error updating local user:', error);
    return null;
  }
};

export const clearLocalUser = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.LOCAL_USER);
  } catch (error) {
    console.error('Error clearing local user:', error);
  }
};

// Sprint management
export const getLocalSprints = (userId: string): Sprint[] => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEYS.LOCAL_SPRINTS}_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Error getting local sprints:', error);
    return [];
  }
};

export const saveLocalSprints = (userId: string, sprints: Sprint[]): void => {
  try {
    localStorage.setItem(`${STORAGE_KEYS.LOCAL_SPRINTS}_${userId}`, JSON.stringify(sprints));
  } catch (error) {
    console.error('Error saving local sprints:', error);
  }
};

export const addLocalSprint = (userId: string, sprint: Omit<Sprint, 'id'>): Sprint => {
  try {
    const sprints = getLocalSprints(userId);
    const newSprint: Sprint = {
      ...sprint,
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    sprints.push(newSprint);
    saveLocalSprints(userId, sprints);
    return newSprint;
  } catch (error) {
    console.error('Error adding local sprint:', error);
    throw error;
  }
};

export const updateLocalSprint = (userId: string, sprintId: string, updates: Partial<Sprint>): void => {
  try {
    const sprints = getLocalSprints(userId);
    const index = sprints.findIndex(s => s.id === sprintId);
    
    if (index >= 0) {
      sprints[index] = {
        ...sprints[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      saveLocalSprints(userId, sprints);
    }
  } catch (error) {
    console.error('Error updating local sprint:', error);
  }
};

export const deleteLocalSprint = (userId: string, sprintId: string): void => {
  try {
    const sprints = getLocalSprints(userId);
    const filtered = sprints.filter(s => s.id !== sprintId);
    saveLocalSprints(userId, filtered);
    
    // Also clean up associated progress
    clearLocalProgress(userId, sprintId);
  } catch (error) {
    console.error('Error deleting local sprint:', error);
  }
};

export const getLocalActiveSprint = (userId: string): Sprint | null => {
  try {
    const sprints = getLocalSprints(userId);
    // Return the most recent sprint as active
    return sprints.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0] || null;
  } catch (error) {
    console.error('Error getting local active sprint:', error);
    return null;
  }
};

// User progress management
export const getLocalProgress = (userId: string, sprintId: string): UserProgress | null => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEYS.LOCAL_PROGRESS}_${userId}_${sprintId}`);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    console.error('Error getting local progress:', error);
    return null;
  }
};

export const saveLocalProgress = (userId: string, sprintId: string, progress: UserProgress): void => {
  try {
    localStorage.setItem(`${STORAGE_KEYS.LOCAL_PROGRESS}_${userId}_${sprintId}`, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving local progress:', error);
  }
};

export const createLocalProgress = (userId: string, sprintId: string): UserProgress => {
  const progress: UserProgress = {
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

  saveLocalProgress(userId, sprintId, progress);
  return progress;
};

export const updateLocalTaskStatus = (
  userId: string,
  sprintId: string,
  taskStatus: TaskStatus
): void => {
  try {
    let progress = getLocalProgress(userId, sprintId);
    if (!progress) {
      progress = createLocalProgress(userId, sprintId);
    }

    // Update or add task status
    const existingIndex = progress.taskStatuses.findIndex(
      ts => ts.dayId === taskStatus.dayId && 
           ts.taskType === taskStatus.taskType && 
           ts.taskIndex === taskStatus.taskIndex
    );

    if (existingIndex >= 0) {
      progress.taskStatuses[existingIndex] = {
        ...taskStatus,
        updatedAt: new Date(),
      };
    } else {
      progress.taskStatuses.push({
        ...taskStatus,
        updatedAt: new Date(),
      });
    }

    // Recalculate stats
    const completedTasks = progress.taskStatuses.filter(ts => ts.completed).length;
    progress.stats = {
      ...progress.stats,
      totalTasksCompleted: completedTasks,
      completionPercentage: completedTasks > 0 ? Math.round((completedTasks / (progress.taskStatuses.length || 1)) * 100) : 0,
    };

    saveLocalProgress(userId, sprintId, progress);
  } catch (error) {
    console.error('Error updating local task status:', error);
  }
};

export const updateLocalJournalEntry = (
  userId: string,
  sprintId: string,
  journalEntry: JournalEntry
): void => {
  try {
    let progress = getLocalProgress(userId, sprintId);
    if (!progress) {
      progress = createLocalProgress(userId, sprintId);
    }

    // Update or add journal entry
    const existingIndex = progress.journalEntries.findIndex(
      je => je.dayId === journalEntry.dayId
    );

    if (existingIndex >= 0) {
      progress.journalEntries[existingIndex] = {
        ...journalEntry,
        updatedAt: new Date(),
      };
    } else {
      progress.journalEntries.push({
        ...journalEntry,
        updatedAt: new Date(),
      });
    }

    saveLocalProgress(userId, sprintId, progress);
  } catch (error) {
    console.error('Error updating local journal entry:', error);
  }
};

export const clearLocalProgress = (userId: string, sprintId: string): void => {
  try {
    localStorage.removeItem(`${STORAGE_KEYS.LOCAL_PROGRESS}_${userId}_${sprintId}`);
  } catch (error) {
    console.error('Error clearing local progress:', error);
  }
};

// Data migration helpers
export const getAllLocalData = (userId: string) => {
  try {
    return {
      user: getLocalUser(),
      sprints: getLocalSprints(userId),
      progress: getAllLocalProgress(userId),
    };
  } catch (error) {
    console.error('Error getting all local data:', error);
    return { user: null, sprints: [], progress: [] };
  }
};

export const getAllLocalProgress = (userId: string): UserProgress[] => {
  try {
    const sprints = getLocalSprints(userId);
    const progressData: UserProgress[] = [];

    sprints.forEach(sprint => {
      const progress = getLocalProgress(userId, sprint.id);
      if (progress) {
        progressData.push(progress);
      }
    });

    return progressData;
  } catch (error) {
    console.error('Error getting all local progress:', error);
    return [];
  }
};

export const clearAllLocalData = (userId: string): void => {
  try {
    const sprints = getLocalSprints(userId);
    
    // Clear sprints
    localStorage.removeItem(`${STORAGE_KEYS.LOCAL_SPRINTS}_${userId}`);
    
    // Clear progress for each sprint
    sprints.forEach(sprint => {
      localStorage.removeItem(`${STORAGE_KEYS.LOCAL_PROGRESS}_${userId}_${sprint.id}`);
    });
    
    // Clear user if it's the current local user
    const localUser = getLocalUser();
    if (localUser && localUser.uid === userId) {
      clearLocalUser();
    }
  } catch (error) {
    console.error('Error clearing all local data:', error);
  }
};

// Cache management for authenticated users
export const cacheUserData = (userId: string, data: any, key: string): void => {
  try {
    const cacheKey = `${STORAGE_KEYS.CACHED_DATA_PREFIX}${userId}_${key}`;
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching user data:', error);
  }
};

export const getCachedUserData = (userId: string, key: string, maxAge: number = 5 * 60 * 1000): any => {
  try {
    const cacheKey = `${STORAGE_KEYS.CACHED_DATA_PREFIX}${userId}_${key}`;
    const stored = localStorage.getItem(cacheKey);
    
    if (stored) {
      const { data, timestamp } = JSON.parse(stored);
      if (Date.now() - timestamp < maxAge) {
        return data;
      } else {
        // Clean up expired cache
        localStorage.removeItem(cacheKey);
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting cached user data:', error);
    return null;
  }
};

export const clearCachedUserData = (userId: string): void => {
  try {
    // Get all localStorage keys and remove cached data for this user
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(`${STORAGE_KEYS.CACHED_DATA_PREFIX}${userId}_`)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing cached user data:', error);
  }
};

// Utility functions
export const isLocalUser = (userId: string): boolean => {
  return userId.startsWith('local_') || userId.startsWith('cached_');
};

export const isCachedUser = (userId: string): boolean => {
  return userId.startsWith('cached_');
};

// User preferences management
export const getLocalUserPreferences = (userId: string): any => {
  try {
    const key = `${STORAGE_KEYS.USER_PREFERENCES}_${userId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch (error) {
    console.error('Error getting local user preferences:', error);
    return null;
  }
};

export const setLocalUserPreferences = (userId: string, preferences: any): void => {
  try {
    const key = `${STORAGE_KEYS.USER_PREFERENCES}_${userId}`;
    localStorage.setItem(key, JSON.stringify({
      ...preferences,
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error setting local user preferences:', error);
  }
};

export const getStorageUsage = (): { used: number; available: number } => {
  try {
    const test = 'test';
    let used = 0;
      // Calculate current usage
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    
    // Test available space (rough estimate)
    let available = 0;
    try {
      const testKey = 'test_storage_' + Date.now();
      const chunk = '0'.repeat(1024); // 1KB chunks
      let chunks = 0;
      
      while (chunks < 10240) { // Test up to ~10MB
        try {
          localStorage.setItem(testKey + chunks, chunk);
          chunks++;
        } catch {
          break;
        }
      }
      
      // Clean up test data
      for (let i = 0; i < chunks; i++) {
        localStorage.removeItem(testKey + i);
      }
      
      available = chunks * 1024;
    } catch (error) {
      available = 5 * 1024 * 1024; // Default 5MB estimate
    }
    
    return { used, available };
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return { used: 0, available: 5 * 1024 * 1024 };
  }
};
