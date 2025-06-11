'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ElevatrCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'glass-strong' | 'interactive' | 'stat' | 'journal' | 'progress';
  theme?: 'primary' | 'success' | 'accent' | 'journal' | 'motivation';
  hover?: boolean;
  onClick?: () => void;
}

export function ElevatrCard({ 
  children, 
  className, 
  variant = 'default',
  theme,
  hover = false,
  onClick 
}: ElevatrCardProps) {
  const baseClasses = "rounded-xl transition-all duration-300 p-4";
  
  const variantClasses = {
    default: "elevatr-card",
    glass: "glass-card",
    'glass-strong': "glass-card-strong",
    interactive: "elevatr-card elevatr-card-interactive",
    stat: "elevatr-stat-card",
    journal: "journal-card",
    progress: "progress-card"
  };

  const themeClasses = {
    primary: "elevatr-stat-card-primary",
    success: "elevatr-stat-card-success", 
    accent: "elevatr-stat-card-accent",
    journal: "elevatr-stat-card-journal",
    motivation: "elevatr-gradient-motivation text-white"
  };

  const hoverClasses = hover ? "elevatr-hover-lift cursor-pointer" : "";

  return (
    <div 
      className={cn(
        baseClasses,
        variantClasses[variant],
        theme && themeClasses[theme],
        hoverClasses,
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface ElevatrCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function ElevatrCardHeader({ children, className }: ElevatrCardHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

interface ElevatrCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function ElevatrCardContent({ children, className }: ElevatrCardContentProps) {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  );
}

interface ElevatrCardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function ElevatrCardTitle({ children, className }: ElevatrCardTitleProps) {
  return (
    <h3 className={cn("text-lg font-semibold text-foreground", className)}>
      {children}
    </h3>
  );
}

interface ElevatrCardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function ElevatrCardDescription({ children, className }: ElevatrCardDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}
