// Enhanced data sync service with guest mode and migration support
import { User, Sprint, UserProgress } from '@/types';
import * as guestService from './guestService';
import * as dataMigration from './dataMigration';
import * as indexedDB from './indexedDB';
import * as firebaseService from './firebase';
import * as localStorageService from './localStorage';

export interface SyncStatus {
  isOnline: boolean;
  lastSyncAt: string | null;
  pendingChanges: number;
  syncInProgress: boolean;
  hasLocalChanges: boolean;
}

export interface AppStartupResult {
  user: User | null;
  needsMigration: boolean;
  migrationData?: dataMigration.DataToMigrate;
  syncStatus: SyncStatus;
}

// Check app startup state and determine user mode
export const initializeApp = async (): Promise<AppStartupResult> => {
  try {
    console.log('🚀 Initializing app and checking user state...');
    
    // Check if we have guest data to migrate
    const needsMigration = await dataMigration.hasGuestDataToMigrate();
    let migrationData: dataMigration.DataToMigrate | undefined;
    
    if (needsMigration) {
      migrationData = await dataMigration.getGuestDataSummary() || undefined;
      console.log('📊 Found guest data to migrate:', migrationData);
    }
    
    // Initialize guest user if no authenticated user
    let user: User | null = null;
    
    // Check for existing local user first
    const localUser = localStorageService.getLocalUser();
    if (localUser) {
      console.log('👤 Found existing local user:', localUser.uid);
      user = localUser;
    } else {
      // Check for guest data
      const guestId = guestService.getGuestId();
      const guestData = await guestService.loadGuestData(guestId);
      
      if (guestData) {
        console.log('👤 Found existing guest data, using guest user');
        user = guestData.user;
      } else {
        console.log('👤 No existing user data, creating new guest user');
        user = guestService.createGuestUser();
        
        // Save initial guest data
        await guestService.saveGuestProgress(guestId, [], [], user);
      }
    }
    
    // Get sync status
    const syncStatus = await getSyncStatus(user);
    
    return {
      user,
      needsMigration,
      migrationData,
      syncStatus
    };
    
  } catch (error) {
    console.error('❌ Error initializing app:', error);
    
    // Fallback to creating a new guest user
    const guestUser = guestService.createGuestUser();
    return {
      user: guestUser,
      needsMigration: false,
      syncStatus: {
        isOnline: navigator.onLine,
        lastSyncAt: null,
        pendingChanges: 0,
        syncInProgress: false,
        hasLocalChanges: false
      }
    };
  }
};

// Handle user authentication and data migration
export const handleUserAuthentication = async (firebaseUser: User): Promise<{
  success: boolean;
  migrationResult?: dataMigration.MigrationResult;
  error?: string;
}> => {
  try {
    console.log('🔐 Handling user authentication for:', firebaseUser.uid);
    
    // Check if we need to migrate guest data
    const needsMigration = await dataMigration.hasGuestDataToMigrate();
    
    if (needsMigration) {
      console.log('🔄 Migrating guest data to authenticated user...');
      const migrationResult = await dataMigration.migrateGuestDataToUser(firebaseUser);
      
      if (migrationResult.success) {
        console.log('✅ Guest data migration successful');
        
        // Sync remote data to local cache
        await dataMigration.syncRemoteToLocal(firebaseUser.uid);
        
        return { success: true, migrationResult };
      } else {
        console.error('❌ Guest data migration failed:', migrationResult.errors);
        return { 
          success: false, 
          migrationResult,
          error: `Migration failed: ${migrationResult.errors.join(', ')}`
        };
      }
    } else {
      console.log('ℹ️ No guest data to migrate, syncing remote data');
      
      // No migration needed, just sync remote data
      await dataMigration.syncRemoteToLocal(firebaseUser.uid);
      
      return { success: true };
    }
    
  } catch (error) {
    console.error('❌ Error handling user authentication:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Handle user logout with options
export const handleUserLogout = async (
  user: User,
  option: 'delete' | 'convert' | 'keep'
): Promise<{ success: boolean; newGuestId?: string; error?: string }> => {
  try {
    console.log('🚪 Handling user logout with option:', option);
    
    switch (option) {
      case 'delete':
        // Delete all local data
        await indexedDB.clearAllCachedData();
        await indexedDB.clearAllGuestData();
        localStorageService.clearAllLocalData(user.uid);
        
        console.log('🗑️ All local data deleted');
        return { success: true };
        
      case 'convert':
        // Convert current data to new guest session
        const newGuestId = await dataMigration.convertUserDataToGuest(user);
        
        console.log('🔄 Data converted to guest session:', newGuestId);
        return { success: true, newGuestId };
        
      case 'keep':
        // Keep data as cached for potential return
        await indexedDB.cacheUserData(user.uid, {
          sprints: await firebaseService.getSprintsByUser(user.uid),
          userProgress: [],
          user
        });
        
        console.log('💾 Data cached for potential return');
        return { success: true };
        
      default:
        return { success: false, error: 'Invalid logout option' };
    }
    
  } catch (error) {
    console.error('❌ Error handling user logout:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Get current sync status
export const getSyncStatus = async (user: User | null): Promise<SyncStatus> => {
  if (!user) {
    return {
      isOnline: navigator.onLine,
      lastSyncAt: null,
      pendingChanges: 0,
      syncInProgress: false,
      hasLocalChanges: false
    };
  }
  
  try {
    const isGuest = guestService.isGuestUser(user.uid);
    const isOnline = navigator.onLine;
    
    if (isGuest) {
      // For guest users, check if they have any data
      const hasData = await guestService.hasGuestData(user.uid);
      
      return {
        isOnline,
        lastSyncAt: null,
        pendingChanges: 0,
        syncInProgress: false,
        hasLocalChanges: hasData
      };
    } else {
      // For authenticated users, check sync queue
      const syncQueue = await indexedDB.getSyncQueue(user.uid);
      const cachedData = await indexedDB.getCachedUserData(user.uid);
      
      return {
        isOnline,
        lastSyncAt: cachedData?.lastSyncAt || null,
        pendingChanges: syncQueue.length,
        syncInProgress: false,
        hasLocalChanges: syncQueue.length > 0
      };
    }
    
  } catch (error) {
    console.error('Error getting sync status:', error);
    return {
      isOnline: navigator.onLine,
      lastSyncAt: null,
      pendingChanges: 0,
      syncInProgress: false,
      hasLocalChanges: false
    };
  }
};

// Sync data based on user type
export const syncUserData = async (user: User): Promise<{ success: boolean; error?: string }> => {
  try {
    const isGuest = guestService.isGuestUser(user.uid);
    
    if (isGuest) {
      console.log('👤 Guest user - no remote sync needed');
      return { success: true };
    }
    
    if (!navigator.onLine) {
      console.log('📴 Offline - queueing changes for later sync');
      return { success: true };
    }
    
    console.log('🔄 Syncing authenticated user data...');
    
    // Sync local changes to remote
    await dataMigration.syncLocalToRemote(user.uid);
    
    // Sync remote changes to local
    await dataMigration.syncRemoteToLocal(user.uid);
    
    console.log('✅ User data sync completed');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error syncing user data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Sync failed'
    };
  }
};

// Save data with appropriate storage method
export const saveUserData = async (
  user: User,
  data: {
    sprints?: Sprint[];
    userProgress?: UserProgress[];
  }
): Promise<{ success: boolean; error?: string }> => {
  try {
    const isGuest = guestService.isGuestUser(user.uid);
    
    if (isGuest) {
      // Save to IndexedDB for guest users
      const existingData = await guestService.loadGuestData(user.uid);
      
      const updatedSprints = data.sprints || existingData?.sprints || [];
      const updatedProgress = data.userProgress || existingData?.userProgress || [];
      
      await guestService.saveGuestProgress(user.uid, updatedSprints, updatedProgress, user);
      
      console.log('💾 Guest data saved to IndexedDB');
      return { success: true };
    } else {
      // Save to Firebase for authenticated users
      if (navigator.onLine) {
        // Direct save to Firebase
        if (data.sprints) {
          for (const sprint of data.sprints) {
            await firebaseService.updateSprint(sprint.id, sprint);
          }
        }
        
        if (data.userProgress) {
          for (const progress of data.userProgress) {
            // Update progress data
            for (const taskStatus of progress.taskStatuses) {
              await firebaseService.updateTaskStatus(
                user.uid,
                progress.sprintId,
                taskStatus
              );
            }
          }
        }
        
        console.log('☁️ Data saved to Firebase');
        return { success: true };
      } else {
        // Queue for later sync
        if (data.sprints) {
          for (const sprint of data.sprints) {
            await dataMigration.queueForSync(
              user.uid,
              'update',
              'sprint',
              sprint.id,
              sprint
            );
          }
        }
        
        if (data.userProgress) {
          for (const progress of data.userProgress) {
            await dataMigration.queueForSync(
              user.uid,
              'update',
              'progress',
              progress.sprintId,
              progress
            );
          }
        }
        
        console.log('📝 Data queued for sync when online');
        return { success: true };
      }
    }
    
  } catch (error) {
    console.error('❌ Error saving user data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Save failed'
    };
  }
};

// Load data based on user type
export const loadUserData = async (user: User): Promise<{
  sprints: Sprint[];
  userProgress: UserProgress[];
  fromCache: boolean;
}> => {
  try {
    const isGuest = guestService.isGuestUser(user.uid);
    
    if (isGuest) {
      // Load from IndexedDB for guest users
      const guestData = await guestService.loadGuestData(user.uid);
      
      return {
        sprints: guestData?.sprints || [],
        userProgress: guestData?.userProgress || [],
        fromCache: true
      };
    } else {
      // Load for authenticated users
      if (navigator.onLine) {
        try {
          // Try to load from Firebase first
          const sprints = await firebaseService.getSprintsByUser(user.uid);
          const userProgress: UserProgress[] = [];
          
          for (const sprint of sprints) {
            const progress = await firebaseService.getUserProgress(user.uid, sprint.id);
            if (progress) {
              userProgress.push(progress);
            }
          }
          
          // Cache the data
          await indexedDB.cacheUserData(user.uid, {
            sprints,
            userProgress,
            user
          });
          
          console.log('☁️ Data loaded from Firebase');
          return { sprints, userProgress, fromCache: false };
          
        } catch (error) {
          console.warn('⚠️ Failed to load from Firebase, falling back to cache');
        }
      }
      
      // Load from cache
      const cachedData = await indexedDB.getCachedUserData(user.uid);
      
      return {
        sprints: cachedData?.sprints || [],
        userProgress: cachedData?.userProgress || [],
        fromCache: true
      };
    }
    
  } catch (error) {
    console.error('❌ Error loading user data:', error);
    return { sprints: [], userProgress: [], fromCache: true };
  }
};

// Get storage statistics
export const getStorageStats = async () => {
  try {
    const dbStats = await indexedDB.getDatabaseStats();
    const localStorageSize = new Blob([JSON.stringify(localStorage)]).size;
    
    return {
      indexedDB: dbStats,
      localStorage: `${Math.round(localStorageSize / 1024)} KB`,
      total: `${Math.round((localStorageSize + 1000000) / 1024)} KB` // Rough estimate
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return {
      indexedDB: { guestData: 0, cachedData: 0, syncQueue: 0 },
      localStorage: '0 KB',
      total: '0 KB'
    };
  }
};

// Setup network change listeners
export const setupNetworkListeners = (onStatusChange: (status: SyncStatus) => void) => {
  const handleOnline = async () => {
    console.log('🌐 App is now online');
    // Trigger sync for authenticated users
    const localUser = localStorageService.getLocalUser();
    if (localUser && !guestService.isGuestUser(localUser.uid)) {
      await syncUserData(localUser);
    }
    
    // Update sync status
    const status = await getSyncStatus(localUser);
    onStatusChange(status);
  };
  
  const handleOffline = async () => {
    console.log('📴 App is now offline');
    const localUser = localStorageService.getLocalUser();
    const status = await getSyncStatus(localUser);
    onStatusChange(status);
  };
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
};
