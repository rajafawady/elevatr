'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookOpen, Calendar, Plus } from 'lucide-react';
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
      // Validate the date
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
      <Card>        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Today&apos;s Journal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
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
      <Card>        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Today&apos;s Journal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm mb-4">
            No active sprint found. Start a new sprint to begin journaling.
          </p>
          <Button asChild size="sm">
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
    <Card>      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Today&apos;s Journal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Day {currentDay} of {activeSprint.duration}
          </div>
          <div className="text-sm font-medium">
            {todayProgress}% Complete
          </div>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary rounded-full h-2 transition-all duration-300"
            style={{ width: `${todayProgress}%` }}
          />
        </div>

        {/* Journal Content Preview */}
        {todayJournal ? (
          <div className="space-y-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2">Today&apos;s Reflection</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {todayJournal.content.length > 150 
                  ? `${todayJournal.content.slice(0, 150)}...` 
                  : todayJournal.content || "No content yet..."}
              </p>
              {todayJournal.content && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {todayJournal.content.split(/\s+/).filter(word => word.length > 0).length} words
                </div>
              )}
            </div>
            <Button asChild className="w-full" variant="outline">
              <Link href={`/journal/${currentDay}`}>
                <BookOpen className="h-4 w-4 mr-2" />
                Continue Writing
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Reflect on your progress and plan for tomorrow.
            </p>
            <Button asChild className="w-full">
              <Link href={`/journal/${currentDay}`}>
                <BookOpen className="h-4 w-4 mr-2" />
                Start Day {currentDay} Journal
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
