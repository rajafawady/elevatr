'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Sprint } from '@/types';
import { Calendar, CheckCircle, Clock, Play } from 'lucide-react';
import { calculateProgress, getDaysRemaining } from '@/lib/utils';
import Link from 'next/link';

interface ActiveSprintProps {
  sprint: Sprint | null;
}

export function ActiveSprint({ sprint }: ActiveSprintProps) {
  if (!sprint) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Active Sprint
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No active sprint found. Start a new sprint to begin tracking your progress.
            </p>
            <Button asChild>
              <Link href="/sprint/new">
                Start New Sprint
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }  const progressData = calculateProgress(sprint);
  const daysRemaining = getDaysRemaining(sprint.endDate);
  
  // Calculate total tasks from core and special tasks
  const totalTasks = sprint.days.reduce((acc, day) => 
    acc + day.coreTasks.length + day.specialTasks.length, 0
  );
  
  // For now, we'll show 0 completed tasks since we need task status data
  const completedTasks = 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          Active Sprint: {sprint.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Progress</span>
            <span>{Math.round(progressData.percentage)}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all duration-300"
              style={{ width: `${progressData.percentage}%` }}
            />
          </div>
        </div>

        {/* Sprint Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              Days Left
            </div>
            <div className="text-2xl font-bold">{daysRemaining}</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              <CheckCircle className="h-4 w-4" />
              Tasks Done
            </div>
            <div className="text-2xl font-bold">{completedTasks}/{totalTasks}</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              Total Days
            </div>
            <div className="text-2xl font-bold">{sprint.days.length}</div>
          </div>
        </div>

        {/* Description */}
        {sprint.description && (
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className="text-sm text-muted-foreground">{sprint.description}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button asChild className="flex-1">
            <Link href={`/sprint/${sprint.id}`}>
              View Sprint
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tasks">
              View Tasks
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
