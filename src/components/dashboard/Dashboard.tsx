'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { ActiveSprint } from '@/components/dashboard/ActiveSprint';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { TodayJournal } from '@/components/dashboard/TodayJournal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ElevatrButton, ElevatrNotification, ElevatrCard } from '@/components/ui/ElevatrTheme';
import { SmartInsights } from '@/components/dashboard/SmartInsights';
import { useSprintStore, useUserProgressStore, useAppStore, useTaskStore } from '@/stores';
import { SyncIndicator } from '@/components/ui/SyncIndicator';
import { useRouter } from 'next/navigation';
import { Brain, BarChart3, TrendingUp, Target, Zap, ChevronRight } from 'lucide-react';

export function Dashboard() {
  const { user, isLocalUser, isGuest, signInWithGoogle } = useAuth();
  const { activeSprint, sprints, loading: sprintLoading, loadActiveSprint } = useSprintStore();
  const { userProgress, loading: progressLoading, loadUserProgress } = useUserProgressStore();
  const { tasks, loading: tasksLoading } = useTaskStore();
  const { globalLoading } = useAppStore();
  const router = useRouter();
  const [showAdvancedInsights, setShowAdvancedInsights] = useState(false);

  // Load data when component mounts or user changes
  useEffect(() => {
    if (user?.uid) {
      loadActiveSprint(user.uid);
    }
  }, [user?.uid, loadActiveSprint]);

  useEffect(() => {
    if (user?.uid && activeSprint?.id) {
      loadUserProgress(user.uid, activeSprint.id);
    }  }, [user?.uid, activeSprint?.id, loadUserProgress]);
  
  const loading = sprintLoading || progressLoading || globalLoading || tasksLoading;

  // Calculate AI insights for quick preview
  const hasAIData = userProgress && tasks.length > 0;
  const completionRate = userProgress ? Math.round(userProgress.stats.completionPercentage) : 0;
  const currentStreak = userProgress ? userProgress.streaks.currentTaskStreak : 0;
  const activeTasks = tasks.filter(t => t.status === 'active').length;
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
      </div>      {/* Stats Overview with AI Enhancement */}
      <div className="elevatr-animate-fade-in-up">
        <StatsOverview userProgress={userProgress} />
      </div>

      {/* AI Intelligence Preview Section */}
      {hasAIData && (
        <div className="elevatr-animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <ElevatrCard variant="glass" className="p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg elevatr-gradient-primary">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold elevatr-gradient-text">AI Intelligence Preview</h2>
                  <p className="text-sm text-muted-foreground">
                    Quick insights from your progress patterns
                  </p>
                </div>
              </div>
              <ElevatrButton 
                variant="primary" 
                size="sm"
                onClick={() => router.push('/insights')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Advanced Insights
                <ChevronRight className="w-4 h-4 ml-1" />
              </ElevatrButton>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-panel p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">Performance Score</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-primary">{completionRate}%</span>
                  <span className="text-xs text-muted-foreground">completion rate</span>
                </div>
                {completionRate >= 80 && (
                  <p className="text-xs text-green-600 mt-1">🎉 Excellent performance!</p>
                )}
                {completionRate < 60 && (
                  <p className="text-xs text-orange-600 mt-1">💡 Room for improvement</p>
                )}
              </div>
              
              <div className="glass-panel p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-accent" />
                  <span className="font-medium text-sm">Current Momentum</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-accent">{currentStreak}</span>
                  <span className="text-xs text-muted-foreground">day streak</span>
                </div>
                {currentStreak >= 7 && (
                  <p className="text-xs text-green-600 mt-1">🔥 On fire!</p>
                )}
                {currentStreak === 0 && (
                  <p className="text-xs text-blue-600 mt-1">⚡ Start your streak today</p>
                )}
              </div>
              
              <div className="glass-panel p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-motivation" />
                  <span className="font-medium text-sm">Workload Status</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-motivation">{activeTasks}</span>
                  <span className="text-xs text-muted-foreground">active tasks</span>
                </div>
                {activeTasks > 10 && (
                  <p className="text-xs text-orange-600 mt-1">⚠️ Consider prioritizing</p>
                )}
                {activeTasks <= 5 && (
                  <p className="text-xs text-green-600 mt-1">✅ Well balanced</p>
                )}
              </div>
            </div>          </ElevatrCard>
        </div>
      )}

      {/* Sync Status for Local Users */}
      {isLocalUser && (
        <div className="elevatr-animate-slide-in-right">
          <SyncIndicator showDetails={true} className="mb-6" />
        </div>
      )}      {/* Main Content Grid */}
      <div className="elevatr-grid elevatr-grid-responsive gap-8">
        {/* Left Column - Active Sprint & Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          <div className="elevatr-animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <ActiveSprint sprint={activeSprint} userProgress={userProgress} />
          </div>
          <div className="elevatr-animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <QuickActions />
          </div>
          
          {/* AI Insights Section */}
          <div className="elevatr-animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <SmartInsights 
              sprints={sprints || []} 
              userProgress={userProgress ? [userProgress] : []} 
            />
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
