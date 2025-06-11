
import { cn } from '@/lib/utils';

interface ElevatrBadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'motivation' | 'primary' | 'success' | 'accent' | 'journal';
  size?: 'sm' | 'md';
}

export function ElevatrBadge({ 
  children, 
  className, 
  variant = 'motivation',
  size = 'sm'
}: ElevatrBadgeProps) {
  const baseClasses = "inline-flex items-center justify-center font-semibold uppercase tracking-wide border-0";
  
  const variantClasses = {
    motivation: "motivation-badge",
    primary: "elevatr-gradient-primary text-white px-2 py-1 rounded-full text-xs",
    success: "elevatr-gradient-success text-white px-2 py-1 rounded-full text-xs",
    accent: "elevatr-gradient-accent text-white px-2 py-1 rounded-full text-xs",
    journal: "elevatr-gradient-journal px-2 py-1 rounded-full text-xs"
  };

  const sizeClasses = {
    sm: variant === 'motivation' ? "" : "text-xs px-2 py-1",
    md: variant === 'motivation' ? "" : "text-sm px-3 py-1.5"
  };

  return (
    <span className={cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      className
    )}>
      {children}
    </span>
  );
}
