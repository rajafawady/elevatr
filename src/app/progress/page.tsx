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
  Zap,
  TrendingUp,
  Calendar
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
    <div className="min-h-screen elevatr-container-wide">
      <div className=" mx-auto p-6 space-y-8">
        {/* Enhanced Header with gradient background */}
        <div className="mb-12 text-center elevatr-animate-fade-in-up">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 rounded-full elevatr-gradient-motivation">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold elevatr-gradient-text">
              Progress Analytics
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Visualize your journey, celebrate achievements, and accelerate your career growth
          </p>
        </div>        {/* Enhanced Key Metrics with better layouts and interactions */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          <ElevatrCard 
            variant="glass" 
            className="group elevatr-hover-lift elevatr-animate-fade-in-up p-6 elevatr-animate-delay-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium text-muted-foreground">Total Sprints</p>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold elevatr-gradient-text">
                    {stats.totalSprints}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {stats.completedSprints} completed
                    </span>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Target className="w-8 h-8 text-primary" />
              </div>
            </div>
          </ElevatrCard>

          <ElevatrCard 
            variant="glass" 
            className="group elevatr-hover-lift elevatr-animate-fade-in-up p-6 elevatr-animate-delay-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-success" />
                  <p className="text-sm font-medium text-muted-foreground">Tasks Completed</p>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-success">{stats.completedTasks}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      of {stats.totalTasks} total
                    </span>
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-full bg-success/10 group-hover:bg-success/20 transition-colors">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </div>
          </ElevatrCard>

          <ElevatrCard 
            variant="glass" 
            className="group elevatr-hover-lift elevatr-animate-fade-in-up p-6 elevatr-animate-delay-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-badge" />
                  <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-badge">{stats.currentStreak}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Best: {stats.longestStreak} days
                    </span>
                    <div className="flex gap-1">
                      {[...Array(Math.min(stats.currentStreak, 7))].map((_, i) => (
                        <div 
                          key={i} 
                          className="w-1 h-4 bg-badge rounded-full elevatr-animate-fade-in-scale" 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-full bg-badge/10 group-hover:bg-badge/20 transition-colors">
                <Zap className="w-8 h-8 text-badge" />
              </div>
            </div>
          </ElevatrCard>

          <ElevatrCard 
            variant="glass" 
            className="group elevatr-hover-lift elevatr-animate-fade-in-up p-6 elevatr-animate-delay-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-accent" />
                  <p className="text-sm font-medium text-muted-foreground">Avg Completion</p>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-accent">
                    {stats.averageCompletionRate.toFixed(0)}%
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">across all sprints</span>
                    <div className="w-8 h-8 rounded-full border-2 border-accent/20 relative overflow-hidden">
                      <div 
                        className="absolute inset-0 bg-accent rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          clipPath: `polygon(50% 50%, 50% 0%, ${
                            50 + (stats.averageCompletionRate / 100) * 50
                          }% 0%, ${
                            50 + Math.sin((stats.averageCompletionRate / 100) * 2 * Math.PI) * 50
                          }% ${
                            50 - Math.cos((stats.averageCompletionRate / 100) * 2 * Math.PI) * 50
                          }%, 50% 50%)`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <Award className="w-8 h-8 text-accent" />
              </div>
            </div>
          </ElevatrCard>
        </div>        {/* Enhanced Activity Chart with better visualization */}
        <ElevatrCard 
          variant="glass" 
          className="p-8 mb-12 elevatr-animate-fade-in-up elevatr-animate-delay-5"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div className="mb-4 md:mb-0">
              <h2 className="text-2xl font-bold elevatr-gradient-text flex items-center gap-3">
                <div className="p-2 rounded-lg elevatr-gradient-primary">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3v18h18V3H3zm16 16H5V5h14v14zM9 17H7v-5h2v5zm4 0h-2V7h2v10zm4 0h-2v-3h2v3z"/>
                  </svg>
                </div>
                Daily Activity Trends
              </h2>
              <p className="text-muted-foreground mt-1">Track your consistency and momentum</p>
            </div>
            <div className="flex gap-3">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 elevatr-hover-lift ${
                    timeRange === range
                      ? 'elevatr-gradient-primary text-white shadow-lg'
                      : 'glass-panel text-muted-foreground hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last Month' : 'Last 3 Months'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Enhanced Chart with tooltips and animations */}
          <div className="relative">
            <div className="h-64 md:h-80 flex items-end justify-center gap-1 p-4 rounded-lg glass-panel relative overflow-hidden">
              {/* Chart background grid */}
              <div className="absolute inset-0 opacity-20">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute left-0 right-0 border-t border-muted-foreground/20"
                    style={{ top: `${i * 25}%` }}
                  />
                ))}
              </div>
              
              {/* Chart bars */}
              {dailyProgress.map((day, index) => {
                const height = Math.max((day.tasksCompleted / maxDailyTasks) * 220, 4);
                const isToday = format(day.date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                
                return (
                  <div 
                    key={index} 
                    className="flex-1 flex flex-col items-center group relative cursor-pointer"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                      <div className="font-medium">{format(day.date, 'MMM d, yyyy')}</div>
                      <div className="text-xs">{day.tasksCompleted} tasks completed</div>
                    </div>
                    
                    {/* Bar */}
                    <div
                      className={`w-full rounded-t-lg transition-all duration-700 ease-out group-hover:scale-110 ${
                        isToday 
                          ? 'elevatr-gradient-motivation shadow-lg' 
                          : day.tasksCompleted > 0 
                            ? 'elevatr-gradient-primary' 
                            : 'bg-muted/30'
                      }`}
                      style={{
                        height: `${height}px`
                      }}
                    />
                    
                    {/* Date label */}
                    <span className={`text-xs mt-3 transition-colors ${
                      isToday ? 'text-primary font-semibold' : 'text-muted-foreground'
                    }`}>
                      {format(day.date, timeRange === '7d' ? 'EEE' : 'dd')}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Chart legend */}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded elevatr-gradient-primary"></div>
                <span className="text-muted-foreground">Completed Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded elevatr-gradient-motivation"></div>
                <span className="text-muted-foreground">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-muted/30"></div>
                <span className="text-muted-foreground">No Activity</span>
              </div>
            </div>
          </div>
        </ElevatrCard>        {/* Enhanced Recent Activity Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Recent Sprints with improved design */}
          <ElevatrCard 
            variant="glass" 
            className="xl:col-span-2 p-6 elevatr-animate-fade-in-up elevatr-animate-delay-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg elevatr-gradient-accent">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold elevatr-gradient-text">Recent Sprints</h2>
                <p className="text-sm text-muted-foreground">Your latest career development cycles</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {recentSprints.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">No sprints yet</p>
                  <p className="text-xs text-muted-foreground">Start your first sprint to see your progress here</p>
                </div>
              ) : (
                recentSprints.map((sprint, index) => (
                  <div 
                    key={sprint.id} 
                    className="group glass-panel p-4 rounded-lg elevatr-hover-lift cursor-pointer elevatr-animate-slide-in-right"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-3 h-3 rounded-full ${
                            sprint.status === 'completed' 
                              ? 'bg-success' 
                              : sprint.status === 'active' 
                                ? 'bg-primary elevatr-animate-pulse-glow' 
                                : 'bg-muted'
                          }`} />
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {sprint.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                            </svg>
                            {format(new Date(sprint.createdAt), 'MMM d, yyyy')}
                          </span>
                          {sprint.description && (
                            <span className="truncate">{sprint.description}</span>
                          )}
                        </div>
                      </div>
                      <ElevatrBadge 
                        variant={sprint.status === 'completed' ? 'success' : sprint.status === 'active' ? 'primary' : 'accent'}
                        className="ml-3 flex-shrink-0"
                      >
                        {sprint.status || 'active'}
                      </ElevatrBadge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ElevatrCard>

          {/* Enhanced Quick Stats */}
          <ElevatrCard 
            variant="glass" 
            className="p-6 elevatr-animate-fade-in-up elevatr-animate-delay-7"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-lg elevatr-gradient-success">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold elevatr-gradient-text">Quick Insights</h2>
                <p className="text-sm text-muted-foreground">Key performance metrics</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="glass-panel p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Tasks this week</span>
                  <span className="text-lg font-bold text-primary">{stats.tasksThisWeek}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full elevatr-gradient-primary rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min((stats.tasksThisWeek / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="glass-panel p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Tasks this month</span>
                  <span className="text-lg font-bold text-success">{stats.tasksThisMonth}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full elevatr-gradient-success rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min((stats.tasksThisMonth / 30) * 100, 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="glass-panel p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Active sprints</span>
                  <span className="text-lg font-bold text-accent">{stats.activeSprints}</span>
                </div>
                <div className="flex gap-1">
                  {[...Array(Math.max(stats.activeSprints, 1))].map((_, i) => (
                    <div 
                      key={i} 
                      className={`flex-1 h-2 rounded-full ${
                        i < stats.activeSprints ? 'elevatr-gradient-accent' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="glass-panel p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Overall completion</span>
                  <span className="text-lg font-bold text-journal">
                    {stats.totalTasks > 0 
                      ? ((stats.completedTasks / stats.totalTasks) * 100).toFixed(0)
                      : 0}%
                  </span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full elevatr-gradient-journal rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` 
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
              </div>
            </div>
          </ElevatrCard>        </div>
        
        {/* Additional insights section */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-panel text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            Keep up the momentum! Your consistency is building career success.
          </div>
        </div>
        
        {/* Floating Action Button for quick actions */}
        <button className="elevatr-fab group">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-accent to-success opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
          <svg className="w-6 h-6 relative z-10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
