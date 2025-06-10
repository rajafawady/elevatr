'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sprint, UserProgress } from '@/types';
import { Calendar, CheckCircle, Clock, Play } from 'lucide-react';
import { calculateProgress, getDaysRemaining } from '@/lib/utils';
import Link from 'next/link';

interface ActiveSprintProps {
  sprint: Sprint | null;
  userProgress?: UserProgress | null;
}

export function ActiveSprint({ sprint, userProgress }: ActiveSprintProps) {
  if (!sprint) {
    return (
      <Card variant="gradient" hover>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Active Sprint
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Play className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground mb-4">
              No active sprint found. Start a new sprint to begin tracking your progress.
            </p>
            <Button variant="gradient" size="lg" asChild>
              <Link href="/sprint/new">
                Start New Sprint
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }const progressData = calculateProgress(sprint, userProgress);
  const daysRemaining = getDaysRemaining(sprint.endDate);
  
  // Calculate total tasks from core and special tasks
  const totalTasks = sprint.days.reduce((acc, day) => 
    acc + day.coreTasks.length + day.specialTasks.length, 0
  );
  
  // Calculate completed tasks using user progress data
  let completedTasks = 0;
  if (userProgress && userProgress.taskStatuses) {
    completedTasks = userProgress.taskStatuses.filter(ts => ts.completed).length;
  }
  return (
    <Card variant="elevated" hover>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
            <Play className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-xl font-bold">Active Sprint</div>
            <div className="text-sm text-muted-foreground font-normal">{sprint.title}</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enhanced Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-primary font-semibold">{Math.round(progressData.percentage)}%</span>
          </div>
          <div className="relative">
            <div className="w-full bg-secondary rounded-full h-3 shadow-inner">
              <div
                className="gradient-primary rounded-full h-3 transition-all duration-700 ease-out progress-bar"
                style={{ width: `${progressData.percentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Enhanced Sprint Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200/50 dark:border-blue-700/50">
            <div className="flex items-center justify-center gap-1 text-sm text-blue-600 dark:text-blue-400 mb-2">
              <Clock className="h-4 w-4" />
              Days Left
            </div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{daysRemaining}</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200/50 dark:border-green-700/50">
            <div className="flex items-center justify-center gap-1 text-sm text-green-600 dark:text-green-400 mb-2">
              <CheckCircle className="h-4 w-4" />
              Tasks Done
            </div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{completedTasks}/{totalTasks}</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200/50 dark:border-purple-700/50">
            <div className="flex items-center justify-center gap-1 text-sm text-purple-600 dark:text-purple-400 mb-2">
              <Calendar className="h-4 w-4" />
              Total Days
            </div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{sprint.days.length}</div>
          </div>
        </div>        {/* Description */}
        {sprint.description && (
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
            <h4 className="font-medium mb-2 text-foreground">Description</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{sprint.description}</p>
          </div>
        )}

        {/* Enhanced Actions */}
        <div className="flex gap-3 pt-2">
          <Button variant="gradient" size="lg" className="flex-1" asChild>
            <Link href={`/sprint/${sprint.id}`}>
              <Play className="h-4 w-4 mr-2" />
              View Sprint
            </Link>
          </Button>
          <Button variant="glass" size="lg" className="flex-1" asChild>
            <Link href="/tasks">
              <CheckCircle className="h-4 w-4 mr-2" />
              View Tasks
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
