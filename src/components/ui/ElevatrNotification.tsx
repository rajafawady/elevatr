'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ElevatrNotificationProps {
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  className?: string;
}

export function ElevatrNotification({
  type,
  title,
  message,
  icon,
  action,
  onDismiss,
  className
}: ElevatrNotificationProps) {
  const typeClasses = {
    success: "border-success/20 bg-success/5",
    warning: "border-badge/20 bg-badge/5",
    info: "border-primary/20 bg-primary/5",
    error: "border-destructive/20 bg-destructive/5"
  };

  const typeColors = {
    success: "text-success",
    warning: "text-badge",
    info: "text-primary", 
    error: "text-destructive"
  };

  const defaultIcons = {
    success: "✓",
    warning: "⚠",
    info: "ℹ",
    error: "✕"
  };

  return (
    <div className={cn(
      "glass-panel p-4 border rounded-xl",
      typeClasses[type],
      "elevatr-animate-slide-in-right",
      className
    )}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
          "bg-background/50",
          typeColors[type]
        )}>
          {icon || defaultIcons[type]}
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-foreground">{title}</h4>
          {message && (
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          )}
          {action && (
            <button
              onClick={action.onClick}
              className={cn(
                "text-sm font-medium mt-2 hover:underline",
                typeColors[type]
              )}
            >
              {action.label}
            </button>
          )}
        </div>
        
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

interface ElevatrTooltipProps {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function ElevatrTooltip({
  children,
  content,
  side = 'top',
  className
}: ElevatrTooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const sideClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2"
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className={cn(
          "absolute z-50 px-2 py-1 text-xs text-white bg-foreground rounded whitespace-nowrap",
          "elevatr-animate-fade-in-scale",
          sideClasses[side],
          className
        )}>
          {content}
        </div>
      )}
    </div>
  );
}

interface ElevatrEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

export function ElevatrEmptyState({
  icon,
  title,
  description,
  action,
  className
}: ElevatrEmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center py-12 px-6",
      className
    )}>
      {icon && (
        <div className="text-muted-foreground mb-4 elevatr-animate-bounce-subtle">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "elevatr-button",
            action.variant === 'secondary' ? "elevatr-button-secondary" : ""
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
