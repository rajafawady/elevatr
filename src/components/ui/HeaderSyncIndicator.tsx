'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { Cloud, CloudOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface HeaderSyncIndicatorProps {
  className?: string;
}

export function HeaderSyncIndicator({ className = '' }: HeaderSyncIndicatorProps) {
  const { user, loading: authLoading, hasLocalDataToSync } = useAuth();
  const { syncStatus } = useSyncStatus();
  const [isVisible, setIsVisible] = useState(false);

  // Show the indicator when user is authenticating or syncing
  useEffect(() => {
    const shouldShow = (authLoading && !user) || 
                      (user && hasLocalDataToSync && syncStatus.isLoading) ||
                      (syncStatus.isLoading);
    
    setIsVisible(shouldShow);
    
    // Auto-hide after sync completion
    if (!syncStatus.isLoading && !authLoading && isVisible) {
      const timer = setTimeout(() => setIsVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [authLoading, user, hasLocalDataToSync, syncStatus.isLoading, isVisible]);

  if (!isVisible) return null;

  const getStatusIcon = () => {
    if (authLoading) return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    if (syncStatus.isLoading) return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
    if (syncStatus.isError) return <AlertCircle className="w-4 h-4 text-red-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  const getMessage = () => {
    if (authLoading) return 'Signing in...';
    if (syncStatus.isLoading && syncStatus.progress) {
      const { currentStep, completedSteps, totalSteps } = syncStatus.progress;
      const stepName = currentStep.charAt(0).toUpperCase() + currentStep.slice(1);
      return `${stepName} (${completedSteps}/${totalSteps})`;
    }
    if (syncStatus.isLoading) return 'Syncing...';
    if (syncStatus.isError) return 'Sync failed';
    return 'Sync complete';
  };

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      {getStatusIcon()}
      <span className="hidden sm:inline text-muted-foreground">
        {getMessage()}
      </span>
    </div>
  );
}
