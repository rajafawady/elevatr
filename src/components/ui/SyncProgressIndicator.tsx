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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center elevatr-animate-fade-in-scale">
      <div className="glass-card-strong w-full max-w-md mx-4 elevatr-shadow-dramatic">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2 text-foreground">Setting Up Your Account</h2>
            <p className="text-sm text-muted-foreground">
              {syncStatus.syncMessage || 'Getting everything ready...'}
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-3 elevatr-animate-slide-in-right" style={{ animationDelay: `${index * 0.1}s` }}>                <div className="flex-shrink-0">
                  {step.status === 'active' ? (
                    <div className="elevatr-status-indicator elevatr-status-active">
                      <LoadingSpinner size="sm" className="text-primary-foreground" />
                    </div>
                  ) : step.status === 'completed' ? (
                    <div className="elevatr-status-indicator elevatr-status-completed">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  ) : step.status === 'error' ? (
                    <div className="elevatr-status-indicator elevatr-status-error">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="elevatr-status-indicator elevatr-status-pending">
                      <step.icon className="w-4 h-4" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium transition-colors",
                    step.status === 'completed' && "text-success",
                    step.status === 'active' && "text-primary",
                    step.status === 'error' && "text-destructive",
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

          {/* Enhanced Progress bar */}
          <div className="mt-6">
            <div className="elevatr-progress">
              <div 
                className="elevatr-progress-bar"
                style={{ 
                  width: `${(steps.filter(s => s.status === 'completed').length / steps.length) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Sync details with enhanced styling */}
          {syncStatus.isLoading && hasLocalDataToSync && (
            <div className="mt-4 glass-panel p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-2">
                <span className="motivation-badge">💾</span>
                Syncing your local progress to the cloud...
              </p>
            </div>
          )}

          {syncStatus.isError && (
            <div className="mt-4 glass-panel p-3 border-destructive/20 bg-destructive/5">
              <p className="text-xs text-destructive flex items-center gap-2">
                <span className="text-sm">⚠️</span>
                Sync encountered an issue. Your data is safe and will retry automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
