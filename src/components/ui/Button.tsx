import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gradient' | 'glass';
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'xs';
  asChild?: boolean;
  children: React.ReactNode;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'default', 
    size = 'default', 
    asChild = false, 
    children, 
    isLoading = false,
    disabled,
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden';
      const variants = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-medium hover:shadow-strong',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-medium hover:shadow-strong',
      outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-soft hover:shadow-medium',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-soft hover:shadow-medium',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      link: 'text-primary underline-offset-4 hover:underline',
      gradient: 'btn-gradient text-white shadow-medium hover:shadow-strong',
      glass: 'glass-card text-foreground hover:bg-accent/50 shadow-medium hover:shadow-strong',
    };

    const sizes = {
      xs: 'h-8 px-3 text-xs',
      sm: 'h-9 rounded-md px-3',
      default: 'h-10 px-4 py-2',
      lg: 'h-11 rounded-md px-8 text-base',
      icon: 'h-10 w-10',
    };

    const styles = cn(baseStyles, variants[variant], sizes[size], className);

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
        className: cn(styles, (children as React.ReactElement<React.HTMLAttributes<HTMLElement>>).props.className),
        ...props,
      });
    }

    return (
      <button
        className={styles}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
        {(variant === 'gradient' || variant === 'default') && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export type { ButtonProps };