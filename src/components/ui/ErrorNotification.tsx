// Error notification component for displaying user-friendly error messages
'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, X, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { AppError, getErrorDisplayMessage, getErrorActionText } from '@/services/errorHandling';

interface ErrorNotificationProps {
  error: AppError | null;
  onRetry?: () => void;
  onDismiss: () => void;
  autoHide?: boolean;
  className?: string;
}

export function ErrorNotification({ 
  error, 
  onRetry, 
  onDismiss, 
  autoHide = false,
  className = '' 
}: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);
      
      if (autoHide && error.type !== 'auth') {
        const timer = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onDismiss, 300); // Wait for animation
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [error, autoHide, onDismiss]);

  if (!error || !isVisible) return null;

  const getErrorIcon = () => {
    switch (error.type) {
      case 'network':
        return <WifiOff className="w-5 h-5" />;
      case 'auth':
        return <AlertCircle className="w-5 h-5" />;
      case 'sync':
        return <RefreshCw className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getErrorColor = () => {
    switch (error.type) {
      case 'network':
        return 'amber';
      case 'auth':
        return 'red';
      case 'sync':
        return 'blue';
      case 'storage':
        return 'orange';
      default:
        return 'red';
    }
  };

  const color = getErrorColor();
  const actionText = getErrorActionText(error);
  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md ${className}`}>
      <ElevatrCard variant="glass" className={`p-4 border-l-4 border-l-${color}-500 bg-${color}-50 dark:bg-${color}-900/20 shadow-lg transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 text-${color}-500`}>
            {getErrorIcon()}
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium text-${color}-800 dark:text-${color}-200`}>
              {error.message}
            </h3>
            {error.details && (
              <p className={`mt-1 text-sm text-${color}-700 dark:text-${color}-300`}>
                {error.details}
              </p>
            )}
            {actionText && onRetry && (
              <div className="mt-3">
                <ElevatrButton
                  variant="secondary"
                  size="sm"
                  onClick={onRetry}
                  className={`bg-${color}-600 hover:bg-${color}-700 text-white`}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {actionText}
                </ElevatrButton>
              </div>
            )}
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onDismiss, 300);
            }}
            className={`flex-shrink-0 ml-4 text-${color}-400 hover:text-${color}-600 dark:hover:text-${color}-300`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </ElevatrCard>
    </div>
  );
}

// Toast-style error notifications
interface ErrorToastProps {
  errors: AppError[];
  onRetry?: (error: AppError) => void;
  onDismiss: (index: number) => void;
  maxVisible?: number;
}

export function ErrorToast({ 
  errors, 
  onRetry, 
  onDismiss, 
  maxVisible = 3 
}: ErrorToastProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything until mounted on client to prevent hydration issues
  if (!isMounted || errors.length === 0) {
    return null;
  }

  const visibleErrors = errors.slice(0, maxVisible);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleErrors.map((error, index) => (
        <ErrorNotification
          key={`${error.type}-${index}`}
          error={error}
          onRetry={onRetry ? () => onRetry(error) : undefined}
          onDismiss={() => onDismiss(index)}
          autoHide={true}
        />
      ))}      {errors.length > maxVisible && (
        <ElevatrCard variant="glass" className="p-3 bg-gray-100 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            +{errors.length - maxVisible} more errors
          </p>
        </ElevatrCard>
      )}
    </div>
  );
}

// Inline error display for forms and components
interface InlineErrorProps {
  error: AppError | null;
  className?: string;
}

export function InlineError({ error, className = '' }: InlineErrorProps) {
  if (!error) return null;

  return (
    <div className={`flex items-center mt-2 text-sm text-red-600 dark:text-red-400 ${className}`}>
      <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
      <span>{getErrorDisplayMessage(error)}</span>
    </div>
  );
}

// Network status indicator
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't render anything until mounted on client to prevent hydration issues
  if (!isMounted || isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2">
      <div className="flex items-center justify-center">
        <WifiOff className="w-4 h-4 mr-2" />        <span className="text-sm font-medium">
          You&apos;re offline. Changes will sync when connection is restored.
        </span>
      </div>
    </div>
  );
}
