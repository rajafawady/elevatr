'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ElevatrButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'motivation' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function ElevatrButton({ 
  children, 
  className, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button'
}: ElevatrButtonProps) {
  const baseClasses = "elevatr-button elevatr-focus-ring font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "",
    secondary: "elevatr-button-secondary",
    accent: "elevatr-button-accent",
    success: "elevatr-button-success",
    motivation: "elevatr-gradient-motivation",
    destructive: "elevatr-gradient-destructive"
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-xl",
    lg: "px-8 py-4 text-lg rounded-xl"
  };

  return (
    <button 
      type={type}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        loading && "cursor-wait",
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
