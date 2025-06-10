import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'gradient' | 'glass';
  size?: 'sm' | 'default' | 'lg';
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ 
  className, 
  variant = 'default',
  size = 'default',
  pulse = false,
  children,
  ...props 
}) => {
  const variants = {
    default: 'border-transparent bg-primary text-primary-foreground shadow-soft hover:bg-primary/80',
    secondary: 'border-transparent bg-secondary text-secondary-foreground shadow-soft hover:bg-secondary/80',
    destructive: 'border-transparent bg-destructive text-destructive-foreground shadow-soft hover:bg-destructive/80',
    outline: 'text-foreground border-border shadow-soft hover:bg-accent',
    success: 'border-transparent gradient-success text-white shadow-soft',
    warning: 'border-transparent gradient-warning text-white shadow-soft',
    gradient: 'border-transparent gradient-primary text-white shadow-soft',
    glass: 'glass-card text-foreground shadow-soft',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    default: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  const pulseAnimation = pulse ? 'animate-pulse-glow' : '';

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variants[variant],
        sizes[size],
        pulseAnimation,
        'animate-fade-in-scale',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
