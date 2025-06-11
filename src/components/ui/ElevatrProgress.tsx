'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ElevatrProgressProps {
  value: number;
  max?: number;
  className?: string;
  variant?: 'primary' | 'accent' | 'success' | 'journal' | 'motivation';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  animated?: boolean;
}

export function ElevatrProgress({ 
  value, 
  max = 100, 
  className, 
  variant = 'primary',
  size = 'md',
  showPercentage = false,
  animated = true
}: ElevatrProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const containerClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4"
  };

  const variantClasses = {
    primary: "",
    accent: "elevatr-progress-accent",
    success: "elevatr-progress-success", 
    journal: "elevatr-progress-journal",
    motivation: "elevatr-progress-motivation"
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className={cn(
        "elevatr-progress",
        containerClasses[size],
        variantClasses[variant]
      )}>
        <div 
          className={cn(
            "elevatr-progress-bar",
            animated && "transition-all duration-500 ease-out"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{Math.round(percentage)}%</span>
          <span>{value} / {max}</span>
        </div>
      )}
    </div>
  );
}

interface ElevatrStatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
  variant?: 'primary' | 'success' | 'accent' | 'journal';
}

export function ElevatrStatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
  variant = 'primary'
}: ElevatrStatCardProps) {
  return (
    <div className={cn(
      "elevatr-stat-card",
      variant === 'primary' && "elevatr-stat-card-primary",
      variant === 'success' && "elevatr-stat-card-success",
      variant === 'accent' && "elevatr-stat-card-accent",
      variant === 'journal' && "elevatr-stat-card-journal",
      "elevatr-hover-lift",
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4 text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
      
      {trend && (
        <div className="flex items-center mt-3 pt-3 border-t border-border/50">
          <span className={cn(
            "text-xs font-medium",
            trend.isPositive !== false ? "text-success" : "text-destructive"
          )}>
            {trend.isPositive !== false ? "↗" : "↘"} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-muted-foreground ml-2">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

interface ElevatrStatusIndicatorProps {
  status: 'active' | 'completed' | 'error' | 'pending';
  className?: string;
  children?: React.ReactNode;
}

export function ElevatrStatusIndicator({ 
  status, 
  className, 
  children 
}: ElevatrStatusIndicatorProps) {
  const statusClasses = {
    active: "elevatr-status-indicator elevatr-status-active",
    completed: "elevatr-status-indicator elevatr-status-completed", 
    error: "elevatr-status-indicator elevatr-status-error",
    pending: "elevatr-status-indicator elevatr-status-pending"
  };

  return (
    <div className={cn(statusClasses[status], className)}>
      {children}
    </div>
  );
}
