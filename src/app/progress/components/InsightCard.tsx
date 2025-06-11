'use client';

import React from 'react';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface InsightCardProps {
  title: string;
  description: string;
  trend?: 'up' | 'down' | 'neutral';
  value?: string | number;
  icon?: React.ReactNode;
}

export function InsightCard({ title, description, trend, value, icon }: InsightCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-success" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <ElevatrCard variant="glass" className="p-4 elevatr-hover-lift group">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {trend && getTrendIcon()}
          </div>
          <p className="text-sm text-muted-foreground mb-2">{description}</p>
          {value && (
            <div className={`text-lg font-bold ${getTrendColor()}`}>
              {value}
            </div>
          )}
        </div>
      </div>
    </ElevatrCard>
  );
}
