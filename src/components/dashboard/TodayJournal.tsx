'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookOpen, Calendar, Plus, Clock } from 'lucide-react';
import Link from 'next/link';
import { useSprintStore, useUserProgressStore } from '@/stores';

export function TodayJournal() {
  const { activeSprint, loading: sprintLoading } = useSprintStore();
  const { userProgress, loading: progressLoading } = useUserProgressStore();
  const loading = sprintLoading || progressLoading;
  
  const getCurrentDay = () => {
    if (!activeSprint) return null;
    
    try {
      const startDate = new Date(activeSprint.startDate);
      if (isNaN(startDate.getTime())) {
        return null;
      }
      
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays <= activeSprint.duration ? diffDays.toString() : null;
    } catch (error) {
      console.error('Error calculating current day:', error);
      return null;
    }
  };

  const getTodayProgress = () => {
    const currentDay = getCurrentDay();
    if (!currentDay || !activeSprint || !userProgress) return 0;

    const day = activeSprint.days.find(d => d.day === currentDay);
    if (!day) return 0;

    const totalTasks = day.coreTasks.length + day.specialTasks.length;
    const completedTasks = userProgress.taskStatuses.filter(
      ts => ts.dayId === currentDay && ts.completed
    ).length;

    return Math.round((completedTasks / totalTasks) * 100);
  };

  const getTodayJournalEntry = () => {
    const currentDay = getCurrentDay();
    if (!currentDay || !userProgress) return null;
    
    return userProgress.journalEntries.find(entry => entry.dayId === currentDay);
  };

  if (loading) {
    return (
      <Card variant="gradient">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20">
              <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-lg font-bold">Today's Journal</div>
              <div className="text-sm text-muted-foreground font-normal">Loading...</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentDay = getCurrentDay();
  const todayProgress = getTodayProgress();
  const todayJournal = getTodayJournalEntry();

  if (!activeSprint || !currentDay) {
    return (
      <Card variant="gradient" hover>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20">
              <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            Today's Journal
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex items-center justify-center">
            <Plus className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            No active sprint found. Start a new sprint to begin journaling.
          </p>
          <Button variant="gradient" size="lg" asChild>
            <Link href="/sprint/new">
              <Plus className="h-4 w-4 mr-2" />
              Start Sprint
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="gradient" hover>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20">
            <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <div className="text-lg font-bold">Today's Journal</div>
            <div className="text-sm text-muted-foreground font-normal">
              Day {currentDay} of {activeSprint.duration} • {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Today's Progress */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200/50 dark:border-orange-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Today's Progress</span>
            <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{todayProgress}%</span>
          </div>
          <div className="w-full bg-white/60 dark:bg-gray-800/60 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-500 rounded-full h-2 transition-all duration-700 ease-out progress-bar"
              style={{ width: `${todayProgress}%` }}
            />
          </div>
        </div>

        {/* Journal Content */}
        {todayJournal ? (
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50 backdrop-blur-sm">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Today's Reflection
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {todayJournal.content.length > 150 
                  ? `${todayJournal.content.slice(0, 150)}...` 
                  : todayJournal.content || "No content yet..."}
              </p>
              {todayJournal.content && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/50 pt-2">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {todayJournal.content.split(/\s+/).filter(word => word.length > 0).length} words
                  </span>                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Just now
                  </span>
                </div>
              )}
            </div>
            <Button variant="glass" size="lg" className="w-full group" asChild>
              <Link href={`/journal/${currentDay}`}>
                <BookOpen className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                Continue Writing
              </Link>
            </Button>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 flex items-center justify-center">
              <Plus className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <p className="text-muted-foreground mb-4 text-sm">
              Reflect on your progress and plan for tomorrow.
            </p>
            <Button variant="gradient" size="lg" className="group" asChild>
              <Link href={`/journal/${currentDay}`}>
                <Plus className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                Start Day {currentDay} Journal
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
