// Error handling service for user-friendly error messages
import { AuthError } from 'firebase/auth';
import { FirestoreError } from 'firebase/firestore';

export interface AppError {
  type: 'auth' | 'sync' | 'storage' | 'network' | 'general';
  message: string;
  details?: string;
  retryable: boolean;
  action?: string;
}

// Authentication error handling
export const handleAuthError = (error: AuthError | Error): AppError => {
  if ('code' in error) {
    const authError = error as AuthError;
    switch (authError.code) {
      case 'auth/popup-closed-by-user':
        return {
          type: 'auth',
          message: 'Sign-in was cancelled',
          details: 'Please try signing in again',
          retryable: true,
          action: 'retry'
        };
      case 'auth/popup-blocked':
        return {
          type: 'auth',
          message: 'Pop-up blocked by browser',
          details: 'Please allow pop-ups for this site and try again',
          retryable: true,
          action: 'allow-popup'
        };
      case 'auth/network-request-failed':
        return {
          type: 'network',
          message: 'Network connection failed',
          details: 'Please check your internet connection and try again',
          retryable: true,
          action: 'retry'
        };
      case 'auth/too-many-requests':
        return {
          type: 'auth',
          message: 'Too many failed attempts',
          details: 'Please wait a few minutes before trying again',
          retryable: true,
          action: 'wait'
        };
      case 'auth/user-disabled':
        return {
          type: 'auth',
          message: 'Account has been disabled',
          details: 'Please contact support for assistance',
          retryable: false,
          action: 'contact-support'
        };
      default:
        return {
          type: 'auth',
          message: 'Authentication failed',
          details: authError.message || 'An unexpected error occurred during sign-in',
          retryable: true,
          action: 'retry'
        };
    }
  }

  return {
    type: 'auth',
    message: 'Authentication error',
    details: error.message || 'An unexpected error occurred',
    retryable: true,
    action: 'retry'
  };
};

// Firestore error handling
export const handleFirestoreError = (error: FirestoreError | Error): AppError => {
  if ('code' in error) {
    const firestoreError = error as FirestoreError;
    switch (firestoreError.code) {
      case 'permission-denied':
        return {
          type: 'auth',
          message: 'Permission denied',
          details: 'You don\'t have permission to access this data. Please sign in again.',
          retryable: true,
          action: 'sign-in'
        };
      case 'unavailable':
        return {
          type: 'network',
          message: 'Service temporarily unavailable',
          details: 'Firestore is temporarily unavailable. Your data will sync when the service is restored.',
          retryable: true,
          action: 'auto-retry'
        };
      case 'deadline-exceeded':
        return {
          type: 'network',
          message: 'Request timeout',
          details: 'The request took too long. Please try again.',
          retryable: true,
          action: 'retry'
        };
      case 'resource-exhausted':
        return {
          type: 'storage',
          message: 'Quota exceeded',
          details: 'Storage quota has been exceeded. Please contact support.',
          retryable: false,
          action: 'contact-support'
        };
      default:
        return {
          type: 'storage',
          message: 'Data sync failed',
          details: firestoreError.message || 'Failed to sync data with cloud storage',
          retryable: true,
          action: 'retry'
        };
    }
  }

  return {
    type: 'storage',
    message: 'Storage error',
    details: error.message || 'An unexpected storage error occurred',
    retryable: true,
    action: 'retry'
  };
};

// Sync error handling
export const handleSyncError = (error: Error, context: 'upload' | 'download' | 'merge'): AppError => {
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return {
      type: 'network',
      message: 'Sync failed due to network error',
      details: 'Please check your internet connection and try again',
      retryable: true,
      action: 'retry'
    };
  }

  if (error.message.includes('quota') || error.message.includes('storage')) {
    return {
      type: 'storage',
      message: 'Storage limit reached',
      details: 'Your account has reached its storage limit. Please free up space or upgrade your plan.',
      retryable: false,
      action: 'upgrade'
    };
  }

  return {
    type: 'sync',
    message: `Failed to ${context} data`,
    details: `An error occurred while trying to ${context} your data: ${error.message}`,
    retryable: true,
    action: 'retry'
  };
};

// Local storage error handling
export const handleLocalStorageError = (error: Error, operation: string): AppError => {
  if (error.message.includes('QuotaExceededError') || error.message.includes('quota')) {
    return {
      type: 'storage',
      message: 'Local storage full',
      details: 'Your browser\'s local storage is full. Please clear some data or browser cache.',
      retryable: false,
      action: 'clear-cache'
    };
  }

  return {
    type: 'storage',
    message: `Failed to ${operation}`,
    details: `Local storage operation failed: ${error.message}`,
    retryable: true,
    action: 'retry'
  };
};

// Generic error handler
export const handleGenericError = (error: Error, context?: string): AppError => {
  return {
    type: 'general',
    message: context ? `${context} failed` : 'An error occurred',
    details: error.message || 'An unexpected error occurred',
    retryable: true,
    action: 'retry'
  };
};

// Get user-friendly error message for display
export const getErrorDisplayMessage = (error: AppError): string => {
  let message = error.message;
  
  if (error.details) {
    message += `: ${error.details}`;
  }
  
  if (error.retryable && error.action === 'retry') {
    message += ' Please try again.';
  }
  
  return message;
};

// Get suggested action text
export const getErrorActionText = (error: AppError): string | null => {
  switch (error.action) {
    case 'retry':
      return 'Try Again';
    case 'sign-in':
      return 'Sign In';
    case 'allow-popup':
      return 'Allow Pop-ups';
    case 'contact-support':
      return 'Contact Support';
    case 'clear-cache':
      return 'Clear Cache';
    case 'upgrade':
      return 'Upgrade Plan';
    case 'auto-retry':
      return null; // Will retry automatically
    case 'wait':
      return null; // User should wait
    default:
      return error.retryable ? 'Try Again' : null;
  }
};

// Check if error should trigger automatic retry
export const shouldAutoRetry = (error: AppError): boolean => {
  return error.retryable && ['network', 'storage'].includes(error.type) && error.action === 'auto-retry';
};

// Get retry delay in milliseconds
export const getRetryDelay = (attempt: number): number => {
  // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
  return Math.min(1000 * Math.pow(2, attempt), 30000);
};
