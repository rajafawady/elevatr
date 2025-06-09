'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { ActiveSprint } from '@/components/dashboard/ActiveSprint';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { getUserProgress, getActiveSprint } from '@/services/firebase';
import { UserProgress, Sprint } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export function Dashboard() {
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // First get the active sprint
        const sprint = await getActiveSprint(user.uid);
        setActiveSprint(sprint);
        
        // Then get the user progress for that sprint
        if (sprint) {
          const progress = await getUserProgress(user.uid, sprint.id);
          setUserProgress(progress);
        } else {
          setUserProgress(null);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);
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
          <ActiveSprint sprint={activeSprint} />
          <QuickActions />
        </div>

        {/* Right Column - Recent Activity */}
        <div>
          <RecentActivity userId={user?.uid || ''} />
        </div>
      </div>
    </div>
  );
}
