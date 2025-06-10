// Data migration service for converting between guest and authenticated user data
import { User, Sprint, UserProgress, TaskStatus, JournalEntry } from '@/types';
import * as guestService from './guestService';
import * as indexedDB from './indexedDB';
import * as firebaseService from './firebase';

export interface MigrationResult {
  success: boolean;
  migratedData: {
    sprints: number;
    tasks: number;
    journalEntries: number;
  };
  errors: string[];
}

export interface DataToMigrate {
  sprints: Sprint[];
  userProgress: UserProgress[];
  totalTasks: number;
  totalJournalEntries: number;
}

// Check if there's guest data to migrate
export const hasGuestDataToMigrate = async (): Promise<boolean> => {
  try {
    const guestId = guestService.getGuestId();
    return await guestService.hasGuestData(guestId);
  } catch (error) {
    console.error('Error checking guest data to migrate:', error);
    return false;
  }
};

// Get guest data summary for migration prompt
export const getGuestDataSummary = async (): Promise<DataToMigrate | null> => {
  try {
    const guestId = guestService.getGuestId();
    const guestData = await guestService.loadGuestData(guestId);
    
    if (!guestData) return null;
    
    const totalTasks = guestData.userProgress.reduce((total, progress) => 
      total + progress.taskStatuses.length, 0
    );
    
    const totalJournalEntries = guestData.userProgress.reduce((total, progress) => 
      total + progress.journalEntries.length, 0
    );
    
    // Only return data if there's something meaningful to migrate
    const hasSprintsWithContent = guestData.sprints.length > 0;
    const hasProgressWithContent = totalTasks > 0 || totalJournalEntries > 0;
    
    if (!hasSprintsWithContent && !hasProgressWithContent) {
      return null;
    }
    
    return {
      sprints: guestData.sprints,
      userProgress: guestData.userProgress,
      totalTasks,
      totalJournalEntries
    };
  } catch (error) {
    console.error('Error getting guest data summary:', error);
    return null;
  }
};

// Migrate guest data to authenticated user account
export const migrateGuestDataToUser = async (firebaseUser: User): Promise<MigrationResult> => {
  const result: MigrationResult = {
    success: true,
    migratedData: { sprints: 0, tasks: 0, journalEntries: 0 },
    errors: []
  };
  
  try {
    const guestId = guestService.getGuestId();
    const guestData = await guestService.loadGuestData(guestId);
    
    if (!guestData) {
      result.errors.push('No guest data found to migrate');
      result.success = false;
      return result;
    }
    
    console.log('🔄 Starting migration of guest data to Firebase user:', firebaseUser.uid);
    
    // Migrate sprints
    for (const sprint of guestData.sprints) {
      try {
        // Update sprint to belong to Firebase user
        const migratedSprint: Sprint = {
          ...sprint,
          userId: firebaseUser.uid,
          updatedAt: new Date().toISOString()
        };
        
        // Create sprint in Firebase (or update if it exists)
        await firebaseService.updateSprint(sprint.id, migratedSprint);
        result.migratedData.sprints++;
        
        console.log('✅ Migrated sprint:', sprint.title);
      } catch (error) {
        console.error('❌ Error migrating sprint:', sprint.title, error);
        result.errors.push(`Failed to migrate sprint: ${sprint.title}`);
      }
    }
    
    // Migrate user progress
    for (const progress of guestData.userProgress) {
      try {
        // Update progress to belong to Firebase user
        const migratedProgress: UserProgress = {
          ...progress,
          userId: firebaseUser.uid
        };
          // Update task statuses
        for (const taskStatus of migratedProgress.taskStatuses) {
          await firebaseService.updateTaskStatus(
            firebaseUser.uid,
            progress.sprintId,
            taskStatus
          );
          result.migratedData.tasks++;
        }
        
        // Update journal entries
        for (const journalEntry of migratedProgress.journalEntries) {
          const migratedEntry: JournalEntry = {
            ...journalEntry,
            userId: firebaseUser.uid
          };
          
          await firebaseService.updateJournalEntry(
            firebaseUser.uid,
            progress.sprintId,
            migratedEntry
          );
          result.migratedData.journalEntries++;
        }
        
        console.log('✅ Migrated progress for sprint:', progress.sprintId);
      } catch (error) {
        console.error('❌ Error migrating progress:', progress.sprintId, error);
        result.errors.push(`Failed to migrate progress for sprint: ${progress.sprintId}`);
      }
    }
    
    // If migration was successful, delete guest data
    if (result.errors.length === 0) {
      await guestService.deleteGuestData(guestId);
      console.log('✅ Guest data successfully migrated and cleaned up');
    } else {
      result.success = false;
      console.log('⚠️ Migration completed with errors, keeping guest data as backup');
    }
    
  } catch (error) {
    console.error('❌ Error during migration process:', error);
    result.success = false;
    result.errors.push('Unexpected error during migration');
  }
  
  return result;
};

// Convert authenticated user data to guest format (for logout)
export const convertUserDataToGuest = async (user: User): Promise<string> => {
  try {
    console.log('🔄 Converting authenticated user data to guest format');
    
    // Create new guest session
    const newGuestId = guestService.createNewGuestSession();
    
    // Get user's data from Firebase
    const [sprints] = await Promise.all([
      firebaseService.getSprintsByUser(user.uid)
    ]);
    
    // Get user progress for all sprints
    const userProgress: UserProgress[] = [];
    for (const sprint of sprints) {
      try {
        const progress = await firebaseService.getUserProgress(user.uid, sprint.id);
        if (progress) {
          // Convert to guest format
          const guestProgress: UserProgress = {
            ...progress,
            userId: newGuestId
          };
          userProgress.push(guestProgress);
        }
      } catch (error) {
        console.error('Error getting progress for sprint:', sprint.id, error);
      }
    }
    
    // Convert sprints to guest format
    const guestSprints = sprints.map(sprint => ({
      ...sprint,
      userId: newGuestId
    }));
    
    // Create guest user
    const guestUser = guestService.createGuestUser(newGuestId);
    
    // Save to IndexedDB
    await guestService.saveGuestProgress(newGuestId, guestSprints, userProgress, guestUser);
    
    console.log('✅ Successfully converted user data to guest format');
    return newGuestId;
    
  } catch (error) {
    console.error('❌ Error converting user data to guest:', error);
    throw error;
  }
};

// Sync local changes to remote when coming back online
export const syncLocalToRemote = async (userId: string): Promise<void> => {
  try {
    console.log('🔄 Syncing local changes to remote for user:', userId);
    
    const syncQueue = await indexedDB.getSyncQueue(userId);
    
    for (const item of syncQueue) {
      try {
        switch (item.entityType) {
          case 'sprint':
            if (item.operation === 'update') {
              await firebaseService.updateSprint(item.entityId, item.data);
            } else if (item.operation === 'create') {
              await firebaseService.createSprint(userId, item.data);
            }
            break;
              case 'progress':
            if (item.operation === 'update') {
              // Handle progress updates
              await firebaseService.updateTaskStatus(
                userId,
                item.data.sprintId,
                item.data
              );
            }
            break;
            
          case 'journal':
            if (item.operation === 'update') {
              await firebaseService.updateJournalEntry(
                userId,
                item.data.sprintId,
                item.data
              );
            }
            break;
        }
        
        // Remove from sync queue after successful sync
        await indexedDB.removeSyncQueueItem(item.id!);
        
      } catch (error) {
        console.error('Error syncing item:', item, error);
        
        // Increment retry count
        await indexedDB.incrementSyncRetry(item.id!);
        
        // Remove items that have failed too many times (after 5 retries)
        if (item.retryCount >= 5) {
          console.warn('Removing item from sync queue after 5 failed attempts:', item);
          await indexedDB.removeSyncQueueItem(item.id!);
        }
      }
    }
    
    console.log('✅ Local to remote sync completed');
    
  } catch (error) {
    console.error('❌ Error during local to remote sync:', error);
    throw error;
  }
};

// Sync remote changes to local cache
export const syncRemoteToLocal = async (userId: string): Promise<void> => {
  try {
    console.log('🔄 Syncing remote changes to local cache for user:', userId);
    
    // Get latest data from Firebase
    const [sprints] = await Promise.all([
      firebaseService.getSprintsByUser(userId)
    ]);
    
    // Get user progress for all sprints
    const userProgress: UserProgress[] = [];
    for (const sprint of sprints) {
      try {
        const progress = await firebaseService.getUserProgress(userId, sprint.id);
        if (progress) {
          userProgress.push(progress);
        }
      } catch (error) {
        console.error('Error getting progress for sprint:', sprint.id, error);
      }
    }
    
    // Get user data
    const userData = await firebaseService.getUser(userId);
    
    if (userData) {
      // Cache in IndexedDB
      await indexedDB.cacheUserData(userId, {
        sprints,
        userProgress,
        user: userData
      });
      
      console.log('✅ Remote to local sync completed');
    }
    
  } catch (error) {
    console.error('❌ Error during remote to local sync:', error);
    throw error;
  }
};

// Queue operation for later sync (offline mode)
export const queueForSync = async (
  userId: string,
  operation: 'create' | 'update' | 'delete',
  entityType: 'sprint' | 'progress' | 'task' | 'journal',
  entityId: string,
  data: any
): Promise<void> => {
  try {
    await indexedDB.addToSyncQueue({
      userId,
      operation,
      entityType,
      entityId,
      data
    });
    
    console.log('📝 Queued operation for sync:', { operation, entityType, entityId });  } catch (error) {
    console.error('Error queuing operation for sync:', error);
    throw error;
  }
};

// Clear guest data without migrating
export const clearGuestData = async (guestId: string): Promise<void> => {
  try {
    console.log('🗑️ Clearing guest data for:', guestId);
    
    // Clear from IndexedDB
    await indexedDB.clearGuestData(guestId);
    
    // Clear guest ID from localStorage
    localStorage.removeItem('elevatr_guest_id');
    
    console.log('✅ Guest data cleared successfully');
  } catch (error) {
    console.error('Error clearing guest data:', error);
    throw error;
  }
};
