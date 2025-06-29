'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ElevatrButton } from './ElevatrButton';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Dialog({ isOpen, onClose, title, children, size = 'md' }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl',
  };  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm" />
      
      {/* Dialog Container - Accounts for sidebar on desktop */}
      <div className="mt-[5vh] relative w-full h-full flex items-center justify-center p-2 sm:p-4">
        <div
          ref={dialogRef}
          className={`
            relative w-full ${sizeClasses[size]}
            bg-white/98 dark:bg-slate-900/95 border-2 border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl
            elevatr-glass-effect
            elevatr-animate-fade-in-scale
            flex flex-col
            max-h-[94vh] sm:max-h-[85vh]
            backdrop-blur-md
            mx-auto
            dialog-content-mobile
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-5 border-b-2 text-slate-200 border-slate-200 dark:border-slate-700 flex-shrink-0 bg-slate-50/90 dark:bg-slate-800/90 rounded-t-xl">
            <h2 className="text-lg sm:text-xl font-semibold elevatr-gradient-text truncate pr-4">
              {title}
            </h2>
            <ElevatrButton
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="h-9 w-9 p-0 shrink-0 text-slate-200 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 border border-slate-300 dark:border-slate-600"
            >
              <X className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            </ElevatrButton>
          </div>
          
          {/* Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 bg-slate-50/30 dark:bg-slate-800/30">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
