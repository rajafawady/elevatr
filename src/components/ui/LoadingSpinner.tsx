import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'pulse' | 'dots';
  className?: string;
}

export function LoadingSpinner({ size = 'md', variant = 'default', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  };

  if (variant === 'gradient') {
    return (
      <div
        className={cn(
          'elevatr-animate-spin rounded-full border-2 border-transparent',
          sizeClasses[size],
          className
        )}
        style={{
          background: 'conic-gradient(from 0deg, hsl(var(--primary)), hsl(var(--accent)), hsl(var(--primary)))',
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), white calc(100% - 2px))',
          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 2px), white calc(100% - 2px))',
        }}
      />
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center justify-center', className)}>
        <div className={cn(
          'rounded-full bg-primary elevatr-animate-pulse',
          sizeClasses[size]
        )} />
      </div>
    );
  }

  if (variant === 'dots') {
    const dotSize = size === 'xs' ? 'h-1 w-1' : 
                   size === 'sm' ? 'h-1.5 w-1.5' :
                   size === 'md' ? 'h-2 w-2' :
                   size === 'lg' ? 'h-2.5 w-2.5' : 'h-3 w-3';
    
    return (
      <div className={cn('flex items-center space-x-1', className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn('rounded-full bg-primary elevatr-animate-bounce', dotSize)}
            style={{
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.6s'
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'elevatr-animate-spin rounded-full border-2 border-muted border-t-primary elevatr-glow',
        sizeClasses[size],
        className
      )}
    />
  );
}
