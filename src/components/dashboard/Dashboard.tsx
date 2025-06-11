'use client';
import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { ActiveSprint } from '@/components/dashboard/ActiveSprint';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { TodayJournal } from '@/components/dashboard/TodayJournal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ElevatrButton, ElevatrNotification } from '@/components/ui/ElevatrTheme';
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
        <div className="text-center space-y-6 elevatr-animate-fade-in-scale">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full elevatr-gradient-motivation flex items-center justify-center elevatr-animate-pulse-glow">
            <LoadingSpinner size="xl" variant="gradient" />
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Preparing your insights
            </p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8 p-0 md:p-6 max-w-full overflow-x-hidden">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text mb-3">
          Welcome back, {user?.displayName?.split(' ')[0] || 'there'}! 👋
        </h1>        <p className="text-lg text-muted-foreground leading-relaxed">
          Here&apos;s an overview of your career sprint progress
        </p>{/* Local User Notification */}
        {isLocalUser && (
          <div className="mt-6">
            <ElevatrNotification
              type="warning"
              title="You're working locally"
              message="Your data is stored on this device only. Sign in with Google to sync your progress across devices and keep your data safe in the cloud."
              icon="⚠️"
            />
          </div>
        )}
        
        {/* Guest User Notification */}
        {isGuest && (
          <div className="mt-6">
            <ElevatrNotification
              type="info"
              title="You're in guest mode"
              message="Your data is stored temporarily and may be lost when you close your browser. Sign in to save your progress permanently and access it from any device."
              action={{
                label: "Sign In to Save Data",
                onClick: async () => {
                  try {
                    await signInWithGoogle();
                  } catch (error) {
                    console.error('Error signing in:', error);
                  }
                }
              }}
            />
          </div>
        )}
      </div>{/* Stats Overview */}
      <StatsOverview userProgress={userProgress} />      {/* Sync Status for Local Users */}
      {isLocalUser && (
        <div className="elevatr-animate-slide-in-right">
          <SyncIndicator showDetails={true} className="mb-6" />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="elevatr-grid elevatr-grid-responsive gap-8">
        {/* Left Column - Active Sprint & Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          <div className="elevatr-animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <ActiveSprint sprint={activeSprint} userProgress={userProgress} />
          </div>
          <div className="elevatr-animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <QuickActions />
          </div>
        </div>

        {/* Right Column - Today's Journal & Recent Activity */}
        <div className="space-y-8">
          <div className="elevatr-animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <TodayJournal />
          </div>
          <div className="elevatr-animate-fade-in-up" style={{ animationDelay: '500ms' }}>
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
