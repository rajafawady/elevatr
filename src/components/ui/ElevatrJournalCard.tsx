'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ElevatrJournalCardProps {
  date: string;
  mood?: number; // 1-5 scale
  reflection?: string;
  achievements?: string[];
  challenges?: string[];
  goals?: string[];
  gratitude?: string[];
  className?: string;
  onClick?: () => void;
}

export function ElevatrJournalCard({
  date,
  mood,
  reflection,
  achievements,
  challenges,
  goals,
  gratitude,
  className,
  onClick
}: ElevatrJournalCardProps) {
  const moodEmojis = ['😟', '😕', '😐', '😊', '😄'];
  const moodColors = [
    'text-red-500',
    'text-orange-500', 
    'text-yellow-500',
    'text-green-500',
    'text-emerald-500'
  ];

  return (
    <div 
      className={cn(
        "journal-card rounded-xl p-6 transition-all duration-300",
        onClick && "cursor-pointer elevatr-hover-lift",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{date}</h3>
        {mood && (
          <div className="flex items-center gap-2">
            <span className={cn("text-lg", moodColors[mood - 1])}>
              {moodEmojis[mood - 1]}
            </span>
            <span className="text-sm text-muted-foreground">
              Mood: {mood}/5
            </span>
          </div>
        )}
      </div>

      {reflection && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-journal-foreground mb-2">Reflection</h4>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {reflection}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements && achievements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-success mb-2 flex items-center gap-1">
              ✅ Achievements
            </h4>
            <ul className="space-y-1">
              {achievements.slice(0, 2).map((achievement, index) => (
                <li key={index} className="text-xs text-muted-foreground">
                  • {achievement}
                </li>
              ))}
              {achievements.length > 2 && (
                <li className="text-xs text-muted-foreground">
                  +{achievements.length - 2} more...
                </li>
              )}
            </ul>
          </div>
        )}

        {challenges && challenges.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-badge mb-2 flex items-center gap-1">
              ⚡ Challenges
            </h4>
            <ul className="space-y-1">
              {challenges.slice(0, 2).map((challenge, index) => (
                <li key={index} className="text-xs text-muted-foreground">
                  • {challenge}
                </li>
              ))}
              {challenges.length > 2 && (
                <li className="text-xs text-muted-foreground">
                  +{challenges.length - 2} more...
                </li>
              )}
            </ul>
          </div>
        )}

        {goals && goals.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-primary mb-2 flex items-center gap-1">
              🎯 Goals
            </h4>
            <ul className="space-y-1">
              {goals.slice(0, 2).map((goal, index) => (
                <li key={index} className="text-xs text-muted-foreground">
                  • {goal}
                </li>
              ))}
              {goals.length > 2 && (
                <li className="text-xs text-muted-foreground">
                  +{goals.length - 2} more...
                </li>
              )}
            </ul>
          </div>
        )}

        {gratitude && gratitude.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-accent mb-2 flex items-center gap-1">
              🙏 Gratitude
            </h4>
            <ul className="space-y-1">
              {gratitude.slice(0, 2).map((item, index) => (
                <li key={index} className="text-xs text-muted-foreground">
                  • {item}
                </li>
              ))}
              {gratitude.length > 2 && (
                <li className="text-xs text-muted-foreground">
                  +{gratitude.length - 2} more...
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

interface ElevatrFloatingActionButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
  variant?: 'primary' | 'motivation';
}

export function ElevatrFloatingActionButton({
  onClick,
  icon,
  label,
  className,
  variant = 'motivation'
}: ElevatrFloatingActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "elevatr-fab",
        variant === 'primary' && "elevatr-gradient-primary",
        className
      )}
      aria-label={label}
    >
      {icon || (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      )}
    </button>
  );
}
