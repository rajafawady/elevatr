'use client';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { ActiveSprint } from '@/components/dashboard/ActiveSprint';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { TodayJournal } from '@/components/dashboard/TodayJournal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <LoadingSpinner size="xl" variant="gradient" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Loading your dashboard...
            </h2>
            <p className="text-muted-foreground">
              Preparing your sprint progress and insights
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="container-responsive space-y-8 animate-fade-in-up">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent mb-3">
          Welcome back, {user?.displayName?.split(' ')[0] || 'there'}! 👋
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Here's an overview of your career sprint progress
        </p>        {/* Local User Notification */}
        {isLocalUser && (
          <div className="mt-6 p-6 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 dark:from-amber-900/20 dark:via-yellow-900/20 dark:to-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-800/50 dark:to-yellow-800/50">
                <svg className="h-6 w-6 text-amber-600 dark:text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
                  You're working locally
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300 leading-relaxed">
                  Your data is stored on this device only. Sign in with Google to sync your progress across devices and keep your data safe in the cloud.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Guest User Notification */}
        {isGuest && (
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl shadow-soft hover:shadow-medium transition-all duration-300">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-800/50 dark:to-indigo-800/50">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  You're in guest mode
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-4 leading-relaxed">
                  Your data is stored temporarily and may be lost when you close your browser. Sign in to save your progress permanently and access it from any device.
                </p>
                <Button
                  onClick={async () => {
                    try {
                      await signInWithGoogle();
                    } catch (error) {
                      console.error('Error signing in:', error);
                    }
                  }}
                  variant="gradient"
                  size="sm"
                  className="inline-flex"
                >
                  Sign In to Save Data
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>      {/* Stats Overview */}
      <StatsOverview userProgress={userProgress} />      {/* Sync Status for Local Users */}
      {isLocalUser && (
        <div className="animate-slide-in-right">
          <SyncIndicator showDetails={true} className="mb-6" />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Active Sprint & Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <ActiveSprint sprint={activeSprint} userProgress={userProgress} />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <QuickActions />
          </div>
        </div>

        {/* Right Column - Today's Journal & Recent Activity */}
        <div className="space-y-8">
          <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <TodayJournal />
          </div>
          <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
