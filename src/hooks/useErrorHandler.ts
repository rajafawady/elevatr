// Global error handling hook for managing application errors
'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AppError, handleAuthError, handleFirestoreError, handleSyncError, handleLocalStorageError as createLocalStorageError, shouldAutoRetry, getRetryDelay } from '@/services/errorHandling';

interface ErrorQueueItem {
  id: string;
  error: AppError;
  timestamp: number;
  retryCount: number;
  retryAction?: () => Promise<void>;
}

export const useErrorHandler = () => {
  const [errors, setErrors] = useState<ErrorQueueItem[]>([]);
  const [retryTimers, setRetryTimers] = useState<Map<string, NodeJS.Timeout>>(new Map());

  // Add error to queue
  const addError = useCallback((error: AppError, retryAction?: () => Promise<void>) => {
    const errorItem: ErrorQueueItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      error,
      timestamp: Date.now(),
      retryCount: 0,
      retryAction
    };

    setErrors(prev => [...prev, errorItem]);

    // Auto-retry for certain errors
    if (shouldAutoRetry(error) && retryAction) {
      scheduleRetry(errorItem);
    }

    return errorItem.id;
  }, []);

  // Remove error from queue
  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(item => item.id !== id));
    
    // Clear any retry timer for this error
    const timer = retryTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      setRetryTimers(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
    }
  }, [retryTimers]);

  // Schedule automatic retry
  const scheduleRetry = useCallback((errorItem: ErrorQueueItem) => {
    if (errorItem.retryCount >= 3) return; // Max 3 retries

    const delay = getRetryDelay(errorItem.retryCount);
    const timer = setTimeout(async () => {
      if (errorItem.retryAction) {
        try {
          await errorItem.retryAction();
          removeError(errorItem.id);
        } catch (error) {
          // Update retry count and schedule next retry
          setErrors(prev => prev.map(item => 
            item.id === errorItem.id 
              ? { ...item, retryCount: item.retryCount + 1 }
              : item
          ));
          
          if (errorItem.retryCount + 1 < 3) {
            scheduleRetry({ ...errorItem, retryCount: errorItem.retryCount + 1 });
          }
        }
      }
    }, delay);

    setRetryTimers(prev => new Map(prev).set(errorItem.id, timer));
  }, [removeError]);

  // Manual retry
  const retryError = useCallback(async (id: string) => {
    const errorItem = errors.find(item => item.id === id);
    if (!errorItem?.retryAction) return;

    try {
      await errorItem.retryAction();
      removeError(id);
    } catch (error) {
      // Error will be re-added if retry fails
      console.error('Manual retry failed:', error);
    }
  }, [errors, removeError]);

  // Clear all errors
  const clearAllErrors = useCallback(() => {
    // Clear all timers
    retryTimers.forEach(timer => clearTimeout(timer));
    setRetryTimers(new Map());
    setErrors([]);
  }, [retryTimers]);

  // Convenience methods for different error types
  const handleAuthenticationError = useCallback((error: Error, retryAction?: () => Promise<void>) => {
    const appError = handleAuthError(error);
    return addError(appError, retryAction);
  }, [addError]);

  const handleStorageError = useCallback((error: Error, retryAction?: () => Promise<void>) => {
    const appError = handleFirestoreError(error);
    return addError(appError, retryAction);
  }, [addError]);

  const handleDataSyncError = useCallback((error: Error, context: 'upload' | 'download' | 'merge', retryAction?: () => Promise<void>) => {
    const appError = handleSyncError(error, context);
    return addError(appError, retryAction);
  }, [addError]);  const handleLocalStorageError = useCallback((error: Error, operation: string, retryAction?: () => Promise<void>): string => {
    const appError = createLocalStorageError(error, operation);
    return addError(appError, retryAction);
  }, [addError]);

  // Clean up old errors (older than 1 hour)
  useEffect(() => {
    const cleanup = setInterval(() => {
      const oneHourAgo = Date.now() - 60 * 60 * 1000;
      setErrors(prev => prev.filter(item => item.timestamp > oneHourAgo));
    }, 60000); // Check every minute

    return () => clearInterval(cleanup);
  }, []);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      retryTimers.forEach(timer => clearTimeout(timer));
    };
  }, [retryTimers]);
  return {
    errors: errors.map(item => item.error),
    errorItems: errors,
    addError,
    removeError,
    retryError,
    clearAllErrors,
    handleAuthenticationError,
    handleStorageError,
    handleDataSyncError,
    handleLocalStorageError,
    hasErrors: errors.length > 0,
    criticalErrors: errors.filter(item => !item.error.retryable),
  };
};
