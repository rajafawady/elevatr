'use client';

import { ElevatrCard, ElevatrCardHeader, ElevatrCardContent, ElevatrCardTitle, ElevatrButton, ElevatrProgress, ElevatrEmptyState } from '@/components/ui/ElevatrTheme';
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
      <ElevatrCard variant="glass" hover>
        <ElevatrCardContent>
          <ElevatrEmptyState
            icon={<Play className="h-16 w-16" />}
            title="No Active Sprint"
            description="Start a new sprint to begin tracking your progress and achieving your career goals."
            action={{
              label: "Start New Sprint",
              onClick: () => window.location.href = '/sprint/new',
              variant: "primary"
            }}
          />
        </ElevatrCardContent>
      </ElevatrCard>
    );
  }  const progressData = calculateProgress(sprint, userProgress);
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
    <ElevatrCard variant="glass" className="p-6">
      <ElevatrCardHeader>
        <ElevatrCardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg elevatr-gradient-primary">
            <Play className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold">Active Sprint</div>
            <div className="text-sm text-muted-foreground font-normal">{sprint.title}</div>
          </div>
        </ElevatrCardTitle>
      </ElevatrCardHeader>
      <ElevatrCardContent className="space-y-6">
        {/* Enhanced Progress Bar */}
        <div className="space-y-3">
          <ElevatrProgress 
            value={progressData.percentage} 
            variant="primary" 
            showPercentage 
            animated 
          />
        </div>

        {/* Enhanced Sprint Stats */}
        <div className="elevatr-grid elevatr-grid-responsive gap-4">
          <div className="text-center p-4 rounded-lg elevatr-stat-card-primary">
            <div className="flex items-center justify-center gap-1 text-sm text-primary mb-2">
              <Clock className="h-4 w-4" />
              Days Left
            </div>
            <div className="text-2xl font-bold text-foreground">{daysRemaining}</div>
          </div>
          <div className="text-center p-4 rounded-lg elevatr-stat-card-success">
            <div className="flex items-center justify-center gap-1 text-sm text-success mb-2">
              <CheckCircle className="h-4 w-4" />
              Tasks Done
            </div>
            <div className="text-2xl font-bold text-foreground">{completedTasks}/{totalTasks}</div>
          </div>
          <div className="text-center p-4 rounded-lg elevatr-stat-card-accent">
            <div className="flex items-center justify-center gap-1 text-sm text-accent mb-2">
              <Calendar className="h-4 w-4" />
              Total Days
            </div>
            <div className="text-2xl font-bold text-foreground">{sprint.days.length}</div>
          </div>
        </div>

        {/* Description */}
        {sprint.description && (
          <div className="glass-panel p-4">
            <h4 className="font-medium mb-2 text-foreground">Description</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{sprint.description}</p>
          </div>
        )}

        {/* Enhanced Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href={`/sprint/${sprint.id}`} className="flex-1">
            <ElevatrButton variant="primary" size="lg" className="w-full">
              <Play className="h-4 w-4 mr-2" />
              View Sprint
            </ElevatrButton>
          </Link>
          <Link href="/tasks" className="flex-1">
            <ElevatrButton variant="secondary" size="lg" className="w-full">
              <CheckCircle className="h-4 w-4 mr-2" />
              View Tasks
            </ElevatrButton>
          </Link>
        </div>
      </ElevatrCardContent>
    </ElevatrCard>
  );
}
