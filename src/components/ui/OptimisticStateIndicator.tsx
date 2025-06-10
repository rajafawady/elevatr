import { useSprintStore, useTaskStore, useUserProgressStore } from '@/stores';

export function OptimisticStateIndicator() {
  const { loading: sprintLoading, error: sprintError } = useSprintStore();
  const { loading: taskLoading, updating, error: taskError } = useTaskStore();
  const { loading: progressLoading, updating: progressUpdating, error: progressError } = useUserProgressStore();
  
  const isLoading = sprintLoading || taskLoading || progressLoading;
  const isUpdating = updating || progressUpdating;
  const hasError = sprintError || taskError || progressError;

  if (!isLoading && !isUpdating && !hasError) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50 max-w-sm">
      {isLoading && (
        <div className="bg-blue-100 border border-blue-200 text-blue-800 px-3 py-2 rounded-md text-sm mb-2">
          Loading data...
        </div>
      )}
      
      {isUpdating && (
        <div className="bg-yellow-100 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-md text-sm mb-2">
          Updating task...
        </div>
      )}
      
      {hasError && (
        <div className="bg-red-100 border border-red-200 text-red-800 px-3 py-2 rounded-md text-sm mb-2">
          {hasError}
        </div>
      )}
    </div>
  );
}
