'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookOpen, Calendar, Plus } from 'lucide-react';
import Link from 'next/link';
import { useSprintStore, useUserProgressStore } from '@/stores';
import { Sprint, UserProgress } from '@/types';

interface TodayJournalProps {
  userId: string;
}

export function TodayJournal({ userId }: TodayJournalProps) {
  const { activeSprint, loading: sprintLoading } = useSprintStore();
  const { userProgress, loading: progressLoading } = useUserProgressStore();
  const loading = sprintLoading || progressLoading;

  const getCurrentDay = () => {
    if (!activeSprint) return null;
    
    const startDate = new Date(activeSprint.startDate);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= activeSprint.duration ? diffDays.toString() : null;
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Today's Journal
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

  if (!activeSprint || !currentDay) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Today's Journal
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Today's Journal
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

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Reflect on your progress and plan for tomorrow.
          </p>
          <Button asChild className="w-full">
            <Link href={`/journal/${currentDay}`}>
              <BookOpen className="h-4 w-4 mr-2" />
              Open Day {currentDay} Journal
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
