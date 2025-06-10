// Data synchronization service between local storage and Firebase
import { User, Sprint, UserProgress } from '@/types';
import * as localStorageService from './localStorage';
import * as firebase from './firebase';

export interface SyncResult {
  success: boolean;
  synced: {
    sprints: number;
    progress: number;
  };
  errors: string[];
}

// Sync local data to Firebase when user signs in
export const syncLocalDataToFirebase = async (firebaseUser: User): Promise<SyncResult> => {
  const result: SyncResult = {
    success: true,
    synced: { sprints: 0, progress: 0 },
    errors: []
  };

  try {
    // Check if there's local data to sync
    const localUser = localStorageService.getLocalUser();
    if (!localUser) {
      return result; // No local data to sync
    }

    const localData = localStorageService.getAllLocalData(localUser.uid);
    console.log('Syncing local data to Firebase:', localData);

    // Sync sprints
    for (const localSprint of localData.sprints) {
      try {
        // Create a new sprint in Firebase (don't try to preserve local IDs)
        const firebaseSprintData = {
          ...localSprint,
          userId: firebaseUser.uid, // Update to Firebase user ID
        };
        delete (firebaseSprintData as any).id; // Remove local ID
        delete (firebaseSprintData as any).createdAt;
        delete (firebaseSprintData as any).updatedAt;

        const newSprintId = await firebase.createSprint(firebaseUser.uid, firebaseSprintData);
        
        // Find corresponding local progress and sync it
        const localProgress = localData.progress.find((p: UserProgress) => p.sprintId === localSprint.id);
        if (localProgress) {
          try {
            // Update progress to use new Firebase sprint ID and user ID
            const progressToSync: UserProgress = {
              ...localProgress,
              userId: firebaseUser.uid,
              sprintId: newSprintId,
            };

            // Sync task statuses
            for (const taskStatus of progressToSync.taskStatuses) {
              await firebase.updateTaskStatus(firebaseUser.uid, newSprintId, taskStatus);
            }

            // Sync journal entries
            for (const journalEntry of progressToSync.journalEntries) {
              await firebase.updateJournalEntry(firebaseUser.uid, newSprintId, {
                ...journalEntry,
                userId: firebaseUser.uid,
              });
            }

            result.synced.progress++;
          } catch (error) {
            console.error('Error syncing progress for sprint:', error);
            result.errors.push(`Failed to sync progress for sprint: ${localSprint.title}`);
          }
        }

        result.synced.sprints++;
      } catch (error) {
        console.error('Error syncing sprint:', error);
        result.errors.push(`Failed to sync sprint: ${localSprint.title}`);
        result.success = false;
      }
    }

    // Clear local data after successful sync
    if (result.success && result.errors.length === 0) {
      localStorageService.clearAllLocalData(localUser.uid);
      console.log('Local data cleared after successful sync');
    }

  } catch (error) {
    console.error('Error during sync process:', error);
    result.success = false;
    result.errors.push('Unexpected error during sync process');
  }

  return result;
};

// Cache Firebase data locally when user signs out
export const cacheFirebaseDataLocally = async (firebaseUser: User): Promise<void> => {
  try {
    console.log('Caching Firebase data locally for user:', firebaseUser.uid);

    // Get all user data from Firebase
    const [sprints, activeSprint] = await Promise.all([
      firebase.getSprintsByUser(firebaseUser.uid),
      firebase.getActiveSprint(firebaseUser.uid)
    ]);

    // Cache user data
    const cacheKey = `cached_user_${firebaseUser.uid}`;
    localStorageService.cacheUserData(firebaseUser.uid, {
      user: firebaseUser,
      sprints,
      activeSprint,
      timestamp: Date.now()
    }, cacheKey);

    // Cache progress data for each sprint
    for (const sprint of sprints) {
      try {
        const progress = await firebase.getUserProgress(firebaseUser.uid, sprint.id);
        if (progress) {
          localStorageService.cacheUserData(firebaseUser.uid, progress, `progress_${sprint.id}`);
        }
      } catch (error) {
        console.error('Error caching progress for sprint:', sprint.id, error);
      }
    }

    console.log('Successfully cached Firebase data locally');
  } catch (error) {
    console.error('Error caching Firebase data:', error);
  }
};

// Restore cached data when user comes back
export const restoreCachedData = (userId: string) => {
  try {
    const cacheKey = `cached_user_${userId}`;
    const cachedData = localStorageService.getCachedUserData(userId, cacheKey, 24 * 60 * 60 * 1000); // 24 hours cache
    
    if (cachedData) {
      console.log('Restored cached data for user:', userId);
      return cachedData;
    }
    
    return null;
  } catch (error) {
    console.error('Error restoring cached data:', error);
    return null;
  }
};

// Clean up cached data older than specified time
export const cleanupOldCache = (maxAgeMs: number = 7 * 24 * 60 * 60 * 1000): void => {
  try {
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith('elevatr_cached_')) {
        try {
          const data = window.localStorage.getItem(key);
          if (data) {
            const parsed = JSON.parse(data);
            if (parsed.timestamp && Date.now() - parsed.timestamp > maxAgeMs) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // If we can't parse it, it's probably corrupted, remove it
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => window.localStorage.removeItem(key));
    console.log(`Cleaned up ${keysToRemove.length} old cache entries`);
  } catch (error) {
    console.error('Error cleaning up old cache:', error);
  }
};

// Check if user has local data that needs syncing
export const hasLocalDataToSync = (): boolean => {
  try {
    const localUser = localStorageService.getLocalUser();
    if (!localUser) return false;

    const sprints = localStorageService.getLocalSprints(localUser.uid);
    return sprints.length > 0;
  } catch (error) {
    console.error('Error checking for local data:', error);
    return false;
  }
};

// Merge local and Firebase data (in case of conflicts)
export const mergeUserData = async (
  localData: { sprints: Sprint[], progress: UserProgress[] },
  firebaseData: { sprints: Sprint[], progress: UserProgress[] }
): Promise<{ sprints: Sprint[], progress: UserProgress[] }> => {
  try {
    // Simple merge strategy: keep all data, Firebase data takes precedence for conflicts
    const mergedSprints = [...firebaseData.sprints];
    const mergedProgress = [...firebaseData.progress];

    // Add local sprints that don't conflict
    for (const localSprint of localData.sprints) {
      const hasConflict = firebaseData.sprints.some(fs => 
        fs.title === localSprint.title && 
        Math.abs(new Date(fs.createdAt).getTime() - new Date(localSprint.createdAt).getTime()) < 24 * 60 * 60 * 1000 // Same day
      );

      if (!hasConflict) {
        mergedSprints.push(localSprint);
        
        // Also add corresponding progress
        const localProgressForSprint = localData.progress.find((p: UserProgress) => p.sprintId === localSprint.id);
        if (localProgressForSprint) {
          mergedProgress.push(localProgressForSprint);
        }
      }
    }

    return {
      sprints: mergedSprints,
      progress: mergedProgress
    };
  } catch (error) {
    console.error('Error merging user data:', error);
    // On error, return Firebase data as fallback
    return firebaseData;
  }
};

// Get storage statistics
export const getStorageStats = () => {
  try {
    const storageUsage = localStorageService.getStorageUsage();
    const localUser = localStorageService.getLocalUser();
    const hasLocalData = localUser ? localStorageService.getLocalSprints(localUser.uid).length > 0 : false;

    return {
      localStorage: storageUsage,
      hasLocalData,
      localUserId: localUser?.uid,
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return {
      localStorage: { used: 0, available: 0 },
      hasLocalData: false,
      localUserId: null,
    };
  }
};
