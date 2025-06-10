'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { Card, CardContent } from './Card';
import { LoadingSpinner } from './LoadingSpinner';
import { CheckCircle, AlertCircle, Upload, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SyncStep {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  status: 'pending' | 'active' | 'completed' | 'error';
}

export function SyncProgressIndicator() {
  const { user, loading: authLoading, hasLocalDataToSync } = useAuth();
  const { syncStatus } = useSyncStatus();
  const [isVisible, setIsVisible] = useState(false);
  const [steps, setSteps] = useState<SyncStep[]>([]);
  // Show the indicator when user is authenticating or syncing
  useEffect(() => {
    const shouldShow = (authLoading && !user) || 
                      (user && hasLocalDataToSync && syncStatus.isLoading) ||
                      (syncStatus.isLoading) ||
                      (user && hasLocalDataToSync && !syncStatus.isLoading && syncStatus.syncMessage === '');
    
    if (shouldShow) {
      setIsVisible(true);
      if (steps.length === 0) {
        initializeSteps();
      }
    } else if (isVisible && !syncStatus.isLoading && !authLoading) {
      // Keep visible for a moment to show completion
      setTimeout(() => setIsVisible(false), 2000);
    }
  }, [authLoading, user, hasLocalDataToSync, syncStatus.isLoading, syncStatus.syncMessage, isVisible, steps.length]);

  const initializeSteps = () => {
    const newSteps: SyncStep[] = [
      {
        id: 'auth',
        label: 'Authenticating',
        description: 'Signing you in...',
        icon: Users,
        status: 'pending'
      },
      {
        id: 'sync',
        label: 'Syncing Data',
        description: 'Uploading your local progress...',
        icon: Upload,
        status: 'pending'
      },
      {
        id: 'complete',
        label: 'Complete',
        description: 'Ready to go!',
        icon: CheckCircle,
        status: 'pending'
      }
    ];

    setSteps(newSteps);
  };

  // Update step statuses based on current state
  useEffect(() => {
    if (steps.length === 0) return;

    setSteps(prevSteps => prevSteps.map(step => {
      switch (step.id) {
        case 'auth':
          if (user) {
            return { ...step, status: 'completed' };
          } else if (authLoading) {
            return { ...step, status: 'active' };
          }
          return { ...step, status: 'pending' };

        case 'sync':
          if (user && !hasLocalDataToSync && !syncStatus.isLoading) {
            return { ...step, status: 'completed' };
          } else if (user && (hasLocalDataToSync || syncStatus.isLoading)) {
            return { ...step, status: 'active' };
          } else if (user) {
            return { ...step, status: 'pending' };
          }
          return { ...step, status: 'pending' };

        case 'complete':
          if (user && !hasLocalDataToSync && !syncStatus.isLoading && !authLoading) {
            return { ...step, status: 'completed' };
          }
          return { ...step, status: 'pending' };

        default:
          return step;
      }
    }));
  }, [user, authLoading, hasLocalDataToSync, syncStatus.isLoading, steps.length]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Setting Up Your Account</h2>
            <p className="text-sm text-muted-foreground">
              {syncStatus.syncMessage || 'Getting everything ready...'}
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {step.status === 'active' ? (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <LoadingSpinner size="sm" className="text-primary-foreground" />
                    </div>
                  ) : step.status === 'completed' ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  ) : step.status === 'error' ? (
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                      <AlertCircle className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <step.icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium",
                    step.status === 'completed' && "text-green-600 dark:text-green-400",
                    step.status === 'active' && "text-primary",
                    step.status === 'error' && "text-red-600 dark:text-red-400",
                    step.status === 'pending' && "text-muted-foreground"
                  )}>
                    {step.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Sync details */}
          {syncStatus.isLoading && hasLocalDataToSync && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                💾 Syncing your local progress to the cloud...
              </p>
            </div>
          )}

          {syncStatus.isError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-xs text-red-600 dark:text-red-400">
                ⚠️ Sync encountered an issue. Your data is safe and will retry automatically.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
