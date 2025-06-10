import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'gradient';
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
    default: 'gradient-primary',
    success: 'gradient-success',
    warning: 'gradient-warning',
    danger: 'gradient-danger',
    gradient: 'gradient-accent',
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
    <div className={cn('relative', className)} {...props}>
      {showValue && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <span className="text-sm text-muted-foreground">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-secondary rounded-full overflow-hidden shadow-soft',
          backgroundSizes[size]
        )}
      >
        <div
          className={cn(
            'transition-all duration-700 ease-out rounded-full relative overflow-hidden',
            variants[variant],
            sizes[size],
            animated && 'progress-bar',
            striped && 'bg-stripes'
          )}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          )}
        </div>
      </div>
    </div>
  );
};
