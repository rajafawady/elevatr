// Hook for managing sync status and indicators
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import * as dataSync from '@/services/dataSync';

export interface SyncStatus {
  isLoading: boolean;
  isError: boolean;
  lastSyncTime: Date | null;
  syncMessage: string;
  hasLocalDataToSync: boolean;
  progress?: {
    currentStep: string;
    totalSteps: number;
    completedSteps: number;
  };
}

export const useSyncStatus = () => {
  const { user, isLocalUser, hasLocalDataToSync } = useAuth();  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isLoading: false,
    isError: false,
    lastSyncTime: null,
    syncMessage: '',
    hasLocalDataToSync: false,
    progress: {
      currentStep: 'idle',
      totalSteps: 0,
      completedSteps: 0,
    },
  });

  // Update local data sync status
  useEffect(() => {
    setSyncStatus(prev => ({
      ...prev,
      hasLocalDataToSync: hasLocalDataToSync || false,
    }));
  }, [hasLocalDataToSync]);
  // Sync local data to Firebase
  const syncToCloud = useCallback(async () => {
    if (!user || isLocalUser) return null;

    setSyncStatus(prev => ({
      ...prev,
      isLoading: true,
      isError: false,
      syncMessage: 'Preparing to sync local data...',
      progress: {
        currentStep: 'preparing',
        totalSteps: 3,
        completedSteps: 0,
      },
    }));

    try {
      // Step 1: Checking local data
      setSyncStatus(prev => ({
        ...prev,
        syncMessage: 'Checking local data...',
        progress: {
          currentStep: 'checking',
          totalSteps: 3,
          completedSteps: 1,
        },
      }));

      // Step 2: Uploading to cloud
      setSyncStatus(prev => ({
        ...prev,
        syncMessage: 'Uploading to cloud...',
        progress: {
          currentStep: 'uploading',
          totalSteps: 3,
          completedSteps: 2,
        },
      }));

      const result = await dataSync.syncLocalDataToFirebase(user);
      
      // Step 3: Completing sync
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        isError: !result.success,
        lastSyncTime: new Date(),
        syncMessage: result.success
          ? `Synced ${result.synced.sprints} sprints and ${result.synced.progress} progress records`
          : `Sync failed: ${result.errors.join(', ')}`,
        hasLocalDataToSync: !result.success,
        progress: {
          currentStep: result.success ? 'completed' : 'error',
          totalSteps: 3,
          completedSteps: result.success ? 3 : 2,
        },
      }));      return result;
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        syncMessage: 'Sync failed due to network error',
        progress: {
          currentStep: 'error',
          totalSteps: 3,
          completedSteps: 1,
        },
      }));
      return null;
    }
  }, [user, isLocalUser]);

  // Cache data locally when signing out
  const cacheToLocal = useCallback(async () => {
    if (!user || isLocalUser) return;

    setSyncStatus(prev => ({
      ...prev,
      isLoading: true,
      syncMessage: 'Caching data for offline use...',
    }));

    try {
      await dataSync.cacheFirebaseDataLocally(user);
      
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        syncMessage: 'Data cached successfully',
        lastSyncTime: new Date(),
      }));
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        syncMessage: 'Failed to cache data',
      }));
    }
  }, [user, isLocalUser]);

  // Check if sync is needed
  const needsSync = useCallback(() => {
    return isLocalUser && hasLocalDataToSync;
  }, [isLocalUser, hasLocalDataToSync]);

  // Get sync indicator status
  const getSyncIndicator = useCallback(() => {
    if (syncStatus.isLoading) {
      return { status: 'syncing', color: 'blue', message: syncStatus.syncMessage };
    }
    
    if (syncStatus.isError) {
      return { status: 'error', color: 'red', message: 'Sync failed' };
    }
    
    if (isLocalUser && hasLocalDataToSync) {
      return { status: 'needs-sync', color: 'amber', message: 'Local data needs syncing' };
    }
    
    if (isLocalUser) {
      return { status: 'local', color: 'gray', message: 'Working locally' };
    }
    
    return { status: 'synced', color: 'green', message: 'Synced' };
  }, [syncStatus, isLocalUser, hasLocalDataToSync]);

  return {
    syncStatus,
    syncToCloud,
    cacheToLocal,
    needsSync,
    getSyncIndicator,
  };
};
