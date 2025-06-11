'use client';

import { ElevatrButton } from './ElevatrButton';
import { ElevatrCard } from './ElevatrCard';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export function ErrorDisplay({ 
  title = "Something went wrong", 
  message = "We encountered an error while loading this content. Please try again.",
  onRetry,
  showRetry = true 
}: ErrorBoundaryProps) {
  return (
    <ElevatrCard variant="glass" className="max-w-md mx-auto mt-8 elevatr-animate-fade-in">
      <div className="elevatr-card-header">
        <h3 className="flex items-center gap-2 text-destructive font-bold text-lg">
          <AlertTriangle className="h-5 w-5" />
          {title}
        </h3>
      </div>
      <div className="elevatr-card-content space-y-4">
        <p className="text-muted-foreground">{message}</p>
        {showRetry && onRetry && (
          <ElevatrButton onClick={onRetry} variant="secondary" className="w-full">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </ElevatrButton>
        )}
      </div>
    </ElevatrCard>
  );
}
