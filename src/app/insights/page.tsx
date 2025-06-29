'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { PredictiveAnalytics } from '@/components/analytics/PredictiveAnalytics';
import { PersonalizedCoaching } from '@/components/coaching/PersonalizedCoaching';
import { SmartInsights } from '@/components/dashboard/SmartInsights';
import { useTaskStore, useSprintStore, useUserProgressStore } from '@/stores';
import { useRouter } from 'next/navigation';
import { 
  Brain, 
  BarChart3, 
  Heart, 
  TrendingUp,
  Activity,
  Target,
  ArrowLeft,
  Zap,
  Calendar,
  Award
} from 'lucide-react';

export default function InsightsPage() {
  const { user } = useAuth();
  const { tasks, loading: tasksLoading } = useTaskStore();
  const { sprints, loading: sprintsLoading } = useSprintStore();
  const { userProgress, loading: progressLoading } = useUserProgressStore();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<'overview' | 'analytics' | 'coaching'>('overview');

  const loading = tasksLoading || sprintsLoading || progressLoading;

  // Advanced metrics calculations
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const activeSprints = sprints?.filter(s => s.status === 'active').length || 0;
  const completionRate = userProgress ? Math.round(userProgress.stats.completionPercentage) : 0;
  const currentStreak = userProgress ? userProgress.streaks.currentTaskStreak : 0;
  const longestStreak = userProgress ? userProgress.streaks.longestTaskStreak : 0;
  const journalEntries = userProgress ? userProgress.journalEntries.length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6 elevatr-animate-fade-in-scale">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full elevatr-gradient-primary flex items-center justify-center elevatr-animate-pulse-glow">
            <LoadingSpinner size="xl" variant="gradient" />
          </div>
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Generating advanced insights...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 elevatr-animate-fade-in">
        <div className="flex items-center gap-4">
          <ElevatrButton 
            variant="secondary" 
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </ElevatrButton>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold elevatr-gradient-text">Advanced Insights</h1>
            <p className="text-muted-foreground mt-1">
              Deep AI-powered analysis of your career development journey
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <ElevatrButton
          variant={activeSection === 'overview' ? 'primary' : 'secondary'}
          onClick={() => setActiveSection('overview')}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Intelligence Overview
        </ElevatrButton>
        <ElevatrButton
          variant={activeSection === 'analytics' ? 'primary' : 'secondary'}
          onClick={() => setActiveSection('analytics')}
        >
          <Brain className="w-4 h-4 mr-2" />
          Predictive Analytics
        </ElevatrButton>
        <ElevatrButton
          variant={activeSection === 'coaching' ? 'primary' : 'secondary'}
          onClick={() => setActiveSection('coaching')}
        >
          <Heart className="w-4 h-4 mr-2" />
          AI Coaching
        </ElevatrButton>
      </div>

      {/* Intelligence Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-8">
          {/* Comprehensive Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <ElevatrCard variant="stat" theme="primary" className="p-4">
              <div className="elevatr-card-content flex flex-col gap-2 p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Total Tasks</p>
                    <p className="text-xl font-bold">{totalTasks}</p>
                  </div>
                  <Target className="w-5 h-5 text-primary" />
                </div>
              </div>
            </ElevatrCard>

            <ElevatrCard variant="stat" theme="success" className="p-4">
              <div className="elevatr-card-content flex flex-col gap-2 p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Completed</p>
                    <p className="text-xl font-bold">{completedTasks}</p>
                  </div>
                  <Award className="w-5 h-5 text-success" />
                </div>
              </div>
            </ElevatrCard>

            <ElevatrCard variant="stat" theme="accent" className="p-4">
              <div className="elevatr-card-content flex flex-col gap-2 p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Completion Rate</p>
                    <p className="text-xl font-bold">{completionRate}%</p>
                  </div>
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
              </div>
            </ElevatrCard>

            <ElevatrCard variant="stat" theme="motivation" className="p-4">
              <div className="elevatr-card-content flex flex-col gap-2 p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Current Streak</p>
                    <p className="text-xl font-bold">{currentStreak}</p>
                  </div>
                  <Zap className="w-5 h-5 text-motivation" />
                </div>
              </div>
            </ElevatrCard>

            <ElevatrCard variant="stat" theme="journal" className="p-4">
              <div className="elevatr-card-content flex flex-col gap-2 p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Best Streak</p>
                    <p className="text-xl font-bold">{longestStreak}</p>
                  </div>
                  <Activity className="w-5 h-5 text-journal" />
                </div>
              </div>
            </ElevatrCard>

            <ElevatrCard variant="stat" theme="primary" className="p-4">
              <div className="elevatr-card-content flex flex-col gap-2 p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Journal Entries</p>
                    <p className="text-xl font-bold">{journalEntries}</p>
                  </div>
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
              </div>
            </ElevatrCard>
          </div>

          {/* Enhanced Smart Insights - Full View */}
          <div className="elevatr-animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <SmartInsights 
              sprints={sprints || []} 
              userProgress={userProgress ? [userProgress] : []}
              showExpanded={true}
            />
          </div>

          {/* Performance Analysis */}
          <ElevatrCard variant="glass" className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg elevatr-gradient-accent">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold elevatr-gradient-text">Performance Analysis</h2>
                <p className="text-sm text-muted-foreground">
                  Detailed breakdown of your productivity patterns
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Task Completion Trends</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">This week</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full">
                        <div 
                          className="h-2 bg-primary rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(completionRate, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{completionRate}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Overall average</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full">
                        <div 
                          className="h-2 bg-accent rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(completionRate * 0.9, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{Math.round(completionRate * 0.9)}%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Productivity Insights</h3>
                <div className="space-y-3">
                  {completionRate >= 80 && (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Award className="w-4 h-4" />
                      <span>Excellent performance this week!</span>
                    </div>
                  )}
                  {currentStreak >= 7 && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Zap className="w-4 h-4" />
                      <span>Great momentum with {currentStreak}-day streak</span>
                    </div>
                  )}
                  {totalTasks > 0 && completedTasks / totalTasks >= 0.7 && (
                    <div className="flex items-center gap-2 text-sm text-purple-600">
                      <Target className="w-4 h-4" />
                      <span>Strong task completion ratio</span>
                    </div>
                  )}
                  {journalEntries >= 5 && (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <Calendar className="w-4 h-4" />
                      <span>Good reflection habit with {journalEntries} entries</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ElevatrCard>
        </div>
      )}

      {/* Predictive Analytics Section */}
      {activeSection === 'analytics' && (
        <PredictiveAnalytics
          tasks={tasks}
          sprints={sprints || []}
          userProgress={userProgress ? [userProgress] : []}
        />
      )}

      {/* AI Coaching Section */}
      {activeSection === 'coaching' && (
        <PersonalizedCoaching
          tasks={tasks}
          sprints={sprints || []}
          userProgress={userProgress ? [userProgress] : []}
        />
      )}
    </div>
  );
}
