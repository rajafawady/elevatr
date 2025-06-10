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

export function Dashboard() {
  const { user } = useAuth();
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.displayName?.split(' ')[0] || 'there'}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your career sprint progress
        </p>
      </div>

      {/* Stats Overview */}
      <StatsOverview userProgress={userProgress} />

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Active Sprint & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <ActiveSprint sprint={activeSprint} userProgress={userProgress} />
          <QuickActions />
        </div>

        {/* Right Column - Today's Journal & Recent Activity */}
        <div className="space-y-6">
          <TodayJournal userId={user?.uid || ''} />
          <RecentActivity userId={user?.uid || ''} />
        </div>
      </div>
    </div>
  );
}
