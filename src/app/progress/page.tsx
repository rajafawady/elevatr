'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { ElevatrBadge } from '@/components/ui/ElevatrBadge';
import { 
  Target, 
  Award,
  CheckCircle,
  Zap
} from 'lucide-react';
import { Sprint, Task } from '@/types';
import { useSprintStore, useTaskStore } from '@/stores';
import { format, subDays, eachDayOfInterval, isAfter } from 'date-fns';

// Utility function to safely convert Firebase Timestamp to Date
const toDate = (timestamp: Date | { toDate?: () => Date }): Date => {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  return timestamp instanceof Date ? timestamp : new Date();
};

interface ProgressStats {
  totalSprints: number;
  completedSprints: number;
  activeSprints: number;
  totalTasks: number;
  completedTasks: number;
  currentStreak: number;
  longestStreak: number;
  averageCompletionRate: number;
  tasksThisWeek: number;
  tasksThisMonth: number;
}

interface DailyProgress {
  date: Date;
  tasksCompleted: number;
  sprintDay?: number;
}

export default function ProgressPage() {
  const { sprints, loading: sprintLoading } = useSprintStore();
  const { tasks, loading: taskLoading } = useTaskStore();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress[]>([]);
  const [recentSprints, setRecentSprints] = useState<Sprint[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const loading = sprintLoading || taskLoading;

  const loadProgressData = useCallback(async () => {
    // Calculate statistics
    const progressStats = calculateStats(sprints, tasks);
    setStats(progressStats);

    // Calculate daily progress
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const daily = calculateDailyProgress(tasks, days);
    setDailyProgress(daily);

    // Get recent sprints
    const recent = sprints
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    setRecentSprints(recent);
  }, [sprints, tasks, timeRange]);

  useEffect(() => {
    if (sprints.length > 0 && tasks.length > 0) {
      loadProgressData();
    }
  }, [sprints, tasks, loadProgressData]);

  const calculateStats = (sprints: Sprint[], tasks: Task[]): ProgressStats => {
    const completedSprints = sprints.filter(s => s.status === 'completed');
    const activeSprints = sprints.filter(s => s.status === 'active');
    const completedTasks = tasks.filter(t => t.status === 'completed');
    
    // Calculate completion rate for each sprint
    const sprintRates = sprints.map(sprint => {
      const sprintTasks = tasks.filter(t => t.sprintId === sprint.id);
      const sprintCompleted = sprintTasks.filter(t => t.status === 'completed');
      return sprintTasks.length > 0 ? (sprintCompleted.length / sprintTasks.length) * 100 : 0;
    });
    
    const averageCompletionRate = sprintRates.length > 0 
      ? sprintRates.reduce((a, b) => a + b, 0) / sprintRates.length 
      : 0;    // Calculate streaks (simplified)
    let currentStreak = 0;
    let longestStreak = 0;
    
    const today = new Date();
    const weekAgo = subDays(today, 7);
    const monthAgo = subDays(today, 30);
      const tasksThisWeek = completedTasks.filter(t => 
      t.completedAt && isAfter(toDate(t.completedAt), weekAgo)
    ).length;
    
    const tasksThisMonth = completedTasks.filter(t => 
      t.completedAt && isAfter(toDate(t.completedAt), monthAgo)
    ).length;    // Simple streak calculation based on consecutive days with completed tasks
    const uniqueDays = new Set(
      completedTasks
        .filter(t => t.completedAt)
        .map(t => format(toDate(t.completedAt!), 'yyyy-MM-dd'))
    );
    
    currentStreak = uniqueDays.size > 0 ? Math.min(uniqueDays.size, 7) : 0;
    longestStreak = Math.max(currentStreak, uniqueDays.size);

    return {
      totalSprints: sprints.length,
      completedSprints: completedSprints.length,
      activeSprints: activeSprints.length,
      totalTasks: tasks.length,
      completedTasks: completedTasks.length,
      currentStreak,
      longestStreak,
      averageCompletionRate,
      tasksThisWeek,
      tasksThisMonth
    };
  };

  const calculateDailyProgress = (tasks: Task[], days: number): DailyProgress[] => {
    const endDate = new Date();
    const startDate = subDays(endDate, days - 1);
    const dateRange = eachDayOfInterval({ start: startDate, end: endDate });    return dateRange.map(date => {
      const dayTasks = tasks.filter(t => 
        t.completedAt && 
        format(toDate(t.completedAt), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      );
      
      return {
        date,
        tasksCompleted: dayTasks.length
      };
    });
  };

  const getSprintStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!stats) {
    return <div>Error loading progress data</div>;
  }

  const maxDailyTasks = Math.max(...dailyProgress.map(d => d.tasksCompleted), 1);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Progress Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your career development journey
          </p>
        </div>        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <ElevatrCard variant="glass" className="p-6 elevatr-animate-delay-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">Total Sprints</p>
                <p className="text-2xl font-bold text-primary">{stats.totalSprints}</p>
                <p className="text-sm text-success">
                  {stats.completedSprints} completed
                </p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Target className="w-6 h-6 text-primary" />
              </div>
            </div>
          </ElevatrCard>

          <ElevatrCard variant="glass" className="p-6 elevatr-animate-delay-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">Tasks Completed</p>
                <p className="text-2xl font-bold text-success">{stats.completedTasks}</p>
                <p className="text-sm text-muted">
                  of {stats.totalTasks} total
                </p>
              </div>
              <div className="p-3 bg-success/10 rounded-full">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
            </div>
          </ElevatrCard>

          <ElevatrCard variant="glass" className="p-6 elevatr-animate-delay-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">Current Streak</p>
                <p className="text-2xl font-bold text-badge">{stats.currentStreak}</p>
                <p className="text-sm text-muted">
                  Best: {stats.longestStreak} days
                </p>
              </div>
              <div className="p-3 bg-badge/10 rounded-full">
                <Zap className="w-6 h-6 text-badge" />
              </div>
            </div>
          </ElevatrCard>

          <ElevatrCard variant="glass" className="p-6 elevatr-animate-delay-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted">Avg Completion</p>
                <p className="text-2xl font-bold text-primary">
                  {stats.averageCompletionRate.toFixed(0)}%
                </p>
                <p className="text-sm text-muted">
                  across all sprints
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-full">
                <Award className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </ElevatrCard>
        </div>

        {/* Activity Chart */}
        <ElevatrCard variant="glass" className="p-6 mb-8 elevatr-animate-delay-5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold elevatr-gradient-text">Daily Activity</h2>
            <div className="flex gap-2">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-muted hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-48 flex items-end gap-1">
            {dailyProgress.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-primary rounded-t-sm min-h-[2px] transition-all hover:bg-primary/80"
                  style={{
                    height: `${(day.tasksCompleted / maxDailyTasks) * 160}px`
                  }}
                  title={`${format(day.date, 'MMM d')}: ${day.tasksCompleted} tasks`}
                />
                <span className="text-xs text-muted mt-2">
                  {format(day.date, 'dd')}
                </span>
              </div>
            ))}
          </div>
        </ElevatrCard>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ElevatrCard variant="glass" className="p-6 elevatr-animate-delay-6">
            <h2 className="text-xl font-semibold elevatr-gradient-text mb-4">
              Recent Sprints
            </h2>
            <div className="space-y-3">
              {recentSprints.length === 0 ? (
                <p className="text-muted">No sprints yet</p>
              ) : (
                recentSprints.map((sprint) => (
                  <div key={sprint.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">
                        {sprint.title}
                      </p>
                      <p className="text-sm text-muted">
                        {format(new Date(sprint.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <ElevatrBadge 
                      variant={sprint.status === 'completed' ? 'success' : sprint.status === 'active' ? 'primary' : 'secondary'}
                    >
                      {sprint.status || 'active'}
                    </ElevatrBadge>
                  </div>
                ))
              )}
            </div>
          </ElevatrCard>

          <ElevatrCard variant="glass" className="p-6 elevatr-animate-delay-7">
            <h2 className="text-xl font-semibold elevatr-gradient-text mb-4">
              Quick Stats
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted">Tasks this week</span>
                <span className="font-semibold text-primary">
                  {stats.tasksThisWeek}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Tasks this month</span>
                <span className="font-semibold text-primary">
                  {stats.tasksThisMonth}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Active sprints</span>
                <span className="font-semibold text-primary">
                  {stats.activeSprints}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted">Completion rate</span>
                <span className="font-semibold text-success">
                  {stats.totalTasks > 0 
                    ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(0)
                    : 0}%
                </span>
              </div>
            </div>
          </ElevatrCard>
        </div>
      </div>
    </div>
  );
}
