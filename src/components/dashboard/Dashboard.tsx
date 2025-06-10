'use client';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { ActiveSprint } from '@/components/dashboard/ActiveSprint';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { TodayJournal } from '@/components/dashboard/TodayJournal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useSprintStore, useUserProgressStore, useAppStore } from '@/stores';
import { SyncIndicator } from '@/components/ui/SyncIndicator';

export function Dashboard() {
  const { user, isLocalUser, isGuest, signInWithGoogle } = useAuth();
  const { activeSprint, loading: sprintLoading, loadActiveSprint } = useSprintStore();
  const { userProgress, loading: progressLoading, loadUserProgress } = useUserProgressStore();
  const { globalLoading } = useAppStore();

  // Load data when component mounts or user changes
  useEffect(() => {
    if (user?.uid) {
      loadActiveSprint(user.uid);
    }
  }, [user?.uid, loadActiveSprint]);

  useEffect(() => {
    if (user?.uid && activeSprint?.id) {
      loadUserProgress(user.uid, activeSprint.id);
    }
  }, [user?.uid, activeSprint?.id, loadUserProgress]);

  const loading = sprintLoading || progressLoading || globalLoading;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.displayName?.split(' ')[0] || 'there'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your career sprint progress
        </p>
          {/* Local User Notification */}
        {isLocalUser && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  You&apos;re working locally
                </h3>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                  Your data is stored on this device only. Sign in with Google to sync your progress across devices and keep your data safe in the cloud.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Guest User Notification */}
        {isGuest && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  You&apos;re in guest mode
                </h3>
                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Your data is stored temporarily and may be lost when you close your browser. Sign in to save your progress permanently and access it from any device.
                </p>
                <button
                  onClick={async () => {
                    try {
                      await signInWithGoogle();
                    } catch (error) {
                      console.error('Error signing in:', error);
                    }
                  }}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 dark:text-blue-200 dark:bg-blue-800 dark:hover:bg-blue-700 transition-colors"
                >
                  Sign In to Save Data
                </button>
              </div>
            </div>
          </div>
        )}
      </div>      {/* Stats Overview */}
      <StatsOverview userProgress={userProgress} />

      {/* Sync Status for Local Users */}
      {isLocalUser && (
        <SyncIndicator showDetails={true} className="mb-6" />
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Active Sprint & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <ActiveSprint sprint={activeSprint} userProgress={userProgress} />
          <QuickActions />
        </div>

        {/* Right Column - Today's Journal & Recent Activity */}
        <div className="space-y-6">
          <TodayJournal />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
