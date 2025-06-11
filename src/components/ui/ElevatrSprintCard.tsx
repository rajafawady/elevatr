'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ElevatrSprintCardProps {
  title: string;
  description?: string;
  status: 'active' | 'planning' | 'completed';
  progress?: number;
  startDate?: string;
  endDate?: string;
  tasksCount?: number;
  completedTasks?: number;
  className?: string;
  onClick?: () => void;
}

export function ElevatrSprintCard({
  title,
  description,
  status,
  progress,
  startDate,
  endDate,
  tasksCount,
  completedTasks,
  className,
  onClick
}: ElevatrSprintCardProps) {
  const statusClasses = {
    active: "sprint-card-active",
    planning: "sprint-card-planning",
    completed: "sprint-card-completed"
  };

  const statusLabels = {
    active: "Active Sprint",
    planning: "Planning",
    completed: "Completed"
  };

  const statusColors = {
    active: "text-primary",
    planning: "text-purple-600 dark:text-purple-400",
    completed: "text-success"
  };

  return (
    <div 
      className={cn(
        "elevatr-card rounded-xl p-6 transition-all duration-300",
        statusClasses[status],
        onClick && "elevatr-card-interactive cursor-pointer elevatr-hover-lift",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs font-medium px-2 py-1 rounded-full bg-background/50",
            statusColors[status]
          )}>
            {statusLabels[status]}
          </span>
        </div>
      </div>

      {progress !== undefined && (
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="elevatr-progress">
            <div 
              className="elevatr-progress-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          {startDate && endDate && (
            <span className="text-muted-foreground">
              {startDate} - {endDate}
            </span>
          )}
          {tasksCount !== undefined && (
            <span className="text-muted-foreground">
              {completedTasks || 0} / {tasksCount} tasks
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

interface ElevatrTaskCardProps {
  title: string;
  description?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
  tags?: string[];
  timeEstimate?: string;
  className?: string;
  onClick?: () => void;
}

export function ElevatrTaskCard({
  title,
  description,
  priority,
  status,
  dueDate,
  tags,
  timeEstimate,
  className,
  onClick
}: ElevatrTaskCardProps) {
  const priorityClasses = {
    high: "task-priority-high",
    medium: "task-priority-medium",
    low: "task-priority-low"
  };

  const priorityColors = {
    high: "text-destructive",
    medium: "text-badge",
    low: "text-success"
  };

  const statusIcons = {
    pending: "○",
    'in-progress': "◐",
    completed: "●"
  };

  const statusColors = {
    pending: "text-muted-foreground",
    'in-progress': "text-primary",
    completed: "text-success"
  };

  return (
    <div 
      className={cn(
        "elevatr-card rounded-lg p-4 transition-all duration-300",
        priorityClasses[priority],
        onClick && "elevatr-card-interactive cursor-pointer elevatr-hover-lift",
        status === 'completed' && "opacity-75",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={cn("text-lg font-medium mt-0.5", statusColors[status])}>
          {statusIcons[status]}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={cn(
              "font-medium text-foreground",
              status === 'completed' && "line-through"
            )}>
              {title}
            </h4>
            <span className={cn(
              "text-xs font-medium px-2 py-1 rounded bg-background/50 flex-shrink-0",
              priorityColors[priority]
            )}>
              {priority.toUpperCase()}
            </span>
          </div>
          
          {description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {description}
            </p>
          )}
          
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            {dueDate && (
              <span>Due: {dueDate}</span>
            )}
            {timeEstimate && (
              <span>Est: {timeEstimate}</span>
            )}
          </div>
          
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
