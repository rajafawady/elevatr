import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useSprintStore, 
  useTaskStore, 
  useUserProgressStore, 
  useAppStore 
} from '@/stores';

/**
 * Custom hook to manage data synchronization across stores
 * This hook handles loading initial data and clearing data on logout
 */
export function useDataSync() {
  const { user } = useAuth();
  const { 
    loadSprints, 
    loadActiveSprint, 
    clearSprints,
    activeSprint 
  } = useSprintStore();
  const { loadTasks, clearTasks } = useTaskStore();
  const { loadUserProgress, clearUserProgress } = useUserProgressStore();
  const { updateLastDataRefresh, shouldRefreshData } = useAppStore();

  // Track previous user ID to detect user changes
  const [previousUserId, setPreviousUserId] = useState<string | null>(null);

  // Load initial data when user is authenticated or changes
  useEffect(() => {
    if (user) {
      // Check if this is a different user (user switched)
      if (previousUserId && previousUserId !== user.uid) {
        console.log('🔄 User changed, clearing store data...', { from: previousUserId, to: user.uid });
        clearSprints();
        clearTasks();
        clearUserProgress();
      }
      
      // Update previous user ID
      setPreviousUserId(user.uid);      const loadInitialData = async () => {
        // Only load if data should be refreshed or user changed
        if (shouldRefreshData() || (previousUserId && previousUserId !== user.uid)) {
          try {
            // Load sprints and active sprint concurrently
            await Promise.all([
              loadSprints(user.uid),
              loadActiveSprint(user.uid),
            ]);
            
            // Load tasks
            await loadTasks(user.uid);
            
            updateLastDataRefresh();
          } catch (error) {
            console.error('Error loading initial data:', error);
          }
        }
      };

      loadInitialData();
    } else {
      // Clear all data when user logs out
      console.log('👤 User logged out, clearing store data...');
      clearSprints();
      clearTasks();
      clearUserProgress();
      setPreviousUserId(null);
    }
  }, [user, user?.uid]);

  // Load user progress when active sprint changes
  useEffect(() => {
    if (user && activeSprint) {
      loadUserProgress(user.uid, activeSprint.id);
    }
  }, [user, activeSprint?.id]);

  return {
    isAuthenticated: !!user,
    userId: user?.uid,
  };
}

/**
 * Hook to provide optimistic task updates
 */
export function useOptimisticTasks() {
  const { user } = useAuth();
  const { activeSprint } = useSprintStore();
  const { 
    updateTaskStatusOptimistic, 
    updating, 
    setUpdating 
  } = useUserProgressStore();

  const toggleTask = async (
    dayId: string, 
    taskType: 'core' | 'special', 
    taskIndex: number, 
    currentStatus: boolean
  ) => {
    if (!user || !activeSprint) return;

    const taskKey = `${dayId}-${taskType}-${taskIndex}`;
    setUpdating(taskKey);

    try {
      await updateTaskStatusOptimistic(
        user.uid,
        activeSprint.id,
        dayId,
        taskType,
        taskIndex,
        !currentStatus
      );
    } finally {
      setUpdating(null);
    }
  };

  return {
    toggleTask,
    updating,
    isUpdating: (dayId: string, taskType: 'core' | 'special', taskIndex: number) => 
      updating === `${dayId}-${taskType}-${taskIndex}`,
  };
}

/**
 * Hook to provide sprint management with optimistic updates
 */
export function useOptimisticSprints() {
  const { user } = useAuth();
  const { 
    addSprint, 
    updateSprintOptimistic, 
    loading,
    error 
  } = useSprintStore();

  const createSprint = async (sprintData: any) => {
    if (!user) throw new Error('User not authenticated');
    
    return await addSprint({
      ...sprintData,
      userId: user.uid,
    });
  };

  const updateSprint = async (sprintId: string, updates: any) => {
    return await updateSprintOptimistic(sprintId, updates);
  };

  return {
    createSprint,
    updateSprint,
    loading,
    error,
  };
}
