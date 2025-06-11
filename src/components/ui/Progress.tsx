import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient' | 'primary' | 'accent' | 'journal';
  size?: 'sm' | 'default' | 'lg';
  showValue?: boolean;
  animated?: boolean;
  striped?: boolean;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  variant = 'default',
  size = 'default',
  showValue = false,
  animated = false,
  striped = false,
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const variants = {
    default: 'elevatr-gradient-primary',
    primary: 'elevatr-gradient-primary',
    success: 'elevatr-gradient-success',
    accent: 'elevatr-gradient-accent',
    journal: 'elevatr-gradient-journal',
    warning: 'elevatr-gradient-warning',
    danger: 'elevatr-gradient-danger',
    gradient: 'elevatr-gradient-accent',
  };

  const sizes = {
    sm: 'h-2',
    default: 'h-3',
    lg: 'h-4',
  };

  const backgroundSizes = {
    sm: 'h-2',
    default: 'h-3',
    lg: 'h-4',
  };
  return (
    <div className={cn('relative elevatr-animate-fade-in', className)} {...props}>
      {showValue && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <span className="text-sm text-muted-foreground">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-secondary/20 rounded-full overflow-hidden glass-panel',
          backgroundSizes[size]
        )}
      >
        <div
          className={cn(
            'transition-all duration-700 ease-out rounded-full relative overflow-hidden elevatr-animate-shimmer',
            variants[variant],
            sizes[size],
            animated && 'elevatr-animate-pulse',
            striped && 'bg-stripes'
          )}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent elevatr-animate-shimmer" />
          )}
        </div>
      </div>
    </div>
  );
};
