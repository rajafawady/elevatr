// Sync status indicator component
'use client';

import { useState, useEffect } from 'react';
import { 
  Cloud, 
  CloudOff, 
  Database, 
  Wifi, 
  WifiOff,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw
} from 'lucide-react';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import * as syncService from '@/services/syncService';
import { useAuth } from '@/contexts/AuthContext';

interface SyncIndicatorProps {
  showDetails?: boolean;
  className?: string;
}

export function SyncIndicator({ showDetails = false, className = '' }: SyncIndicatorProps) {
  const { user, isGuest } = useAuth();
  const [syncStatus, setSyncStatus] = useState<syncService.SyncStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateSyncStatus = async () => {
      if (user) {
        const status = await syncService.getSyncStatus(user);
        setSyncStatus(status);      } else if (isGuest) {
        // For guest users, show offline status
        setSyncStatus({
          isOnline: navigator.onLine,
          lastSyncAt: null,
          pendingChanges: 0,
          syncInProgress: false,
          hasLocalChanges: false
        });
      }
    };

    updateSyncStatus();

    // Setup network listeners
    const cleanup = syncService.setupNetworkListeners((status) => {
      if (user) {
        setSyncStatus(status);
      } else if (isGuest) {
        setSyncStatus(prev => prev ? { ...prev, isOnline: navigator.onLine } : null);
      }
    });

    // Update status every 30 seconds
    const interval = setInterval(updateSyncStatus, 30000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, [user, isGuest]);

  const handleRefresh = async () => {
    if (!user || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await syncService.syncUserData(user);
      const newStatus = await syncService.getSyncStatus(user);
      setSyncStatus(newStatus);
    } catch (error) {
      console.error('Error refreshing sync:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = () => {
    if (!syncStatus) return <Database className="w-4 h-4 text-gray-400" />;
    
    if (isGuest) {
      return syncStatus.isOnline ? 
        <WifiOff className="w-4 h-4 text-amber-500" /> : 
        <WifiOff className="w-4 h-4 text-red-500" />;
    }
      if (syncStatus.syncInProgress || isRefreshing) {
      return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
    }
    
    if (!syncStatus.isOnline) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    
    if (syncStatus.pendingChanges > 0) {
      return syncStatus.isOnline ? 
        <Clock className="w-4 h-4 text-amber-500" /> : 
        <CloudOff className="w-4 h-4 text-amber-500" />;
    }
    
    return syncStatus.isOnline ? 
      <CheckCircle className="w-4 h-4 text-green-500" /> : 
      <CloudOff className="w-4 h-4 text-gray-500" />;
  };

  const getStatusMessage = () => {
    if (!syncStatus) return 'Checking sync status...';
    
    if (isGuest) {
      return syncStatus.isOnline ? 
        'Working offline as guest' : 
        'Offline - working as guest';
    }
      if (syncStatus.syncInProgress || isRefreshing) {
      return 'Syncing...';
    }
    
    if (!syncStatus.isOnline) {
      return 'Connection error - offline';
    }
    
    if (syncStatus.pendingChanges > 0) {
      return syncStatus.isOnline ? 
        `${syncStatus.pendingChanges} changes pending` : 
        `${syncStatus.pendingChanges} changes offline`;
    }
    
    return syncStatus.isOnline ? 'All changes synced' : 'Offline';
  };

  const needsSync = () => {
    return syncStatus && syncStatus.pendingChanges > 0 && syncStatus.isOnline;
  };

  const handleSyncAction = async () => {
    if (isGuest) {
      // Could trigger sign-in flow
      return;
    }
    
    await handleRefresh();
  };

  if (!showDetails) {
    return (
      <div className={`flex items-center ${className}`}>
        {getStatusIcon()}
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {getStatusMessage()}
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getStatusIcon()}
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              Sync Status
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getStatusMessage()}
            </p>
          </div>
        </div>        {(needsSync() || (!syncStatus?.isOnline && !isGuest)) && (
          <ElevatrButton
            variant="secondary"
            size="sm"
            onClick={handleSyncAction}
            disabled={syncStatus?.syncInProgress || isRefreshing}
            className="ml-4"
          >
            {(syncStatus?.syncInProgress || isRefreshing) ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : isGuest ? (
              <>
                <Cloud className="w-4 h-4 mr-2" />
                Sign In to Sync
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4 mr-2" />
                Sync Now
              </>
            )}
          </ElevatrButton>
        )}
      </div>      {/* Expandable details */}
      {(syncStatus?.lastSyncAt || !syncStatus?.isOnline || isGuest) && (
        <div className="mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            {isExpanded ? 'Hide details' : 'Show details'}
          </button>
          
          {isExpanded && (
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-sm space-y-1">
                {syncStatus?.lastSyncAt && (
                  <div className="text-gray-600 dark:text-gray-400">
                    Last sync: {new Date(syncStatus.lastSyncAt).toLocaleString()}
                  </div>
                )}
                {!syncStatus?.isOnline && (
                  <div className="text-red-600 dark:text-red-400">
                    Connection lost - working offline
                  </div>
                )}
                {isGuest && (
                  <div className="text-amber-600 dark:text-amber-400">
                    Working in guest mode - data stored locally only. Sign in to sync across devices.
                  </div>
                )}
                {syncStatus?.pendingChanges && syncStatus.pendingChanges > 0 && (
                  <div className="text-gray-600 dark:text-gray-400">
                    {syncStatus.pendingChanges} changes waiting to sync
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
