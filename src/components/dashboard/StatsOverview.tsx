'use client';

import { ElevatrStatCard } from '@/components/ui/ElevatrTheme';
import { UserProgress } from '@/types';
import { Trophy, Target, Calendar, TrendingUp } from 'lucide-react';

interface StatsOverviewProps {
  userProgress: UserProgress | null;
}

export function StatsOverview({ userProgress }: StatsOverviewProps) {
  const stats = [
    {
      title: 'Tasks Completed',
      value: userProgress?.stats?.totalTasksCompleted || 0,
      icon: <Target className="w-5 h-5" />,
      variant: 'primary' as const,
      subtitle: 'in current sprint',
      trend: userProgress?.stats?.totalTasksCompleted ? {
        value: 15,
        label: 'vs last week',
        isPositive: true
      } : undefined
    },
    {
      title: 'Days Completed',
      value: userProgress?.stats?.totalDaysCompleted || 0,
      icon: <Trophy className="w-5 h-5" />,
      variant: 'success' as const,
      subtitle: 'in current sprint',
      trend: userProgress?.stats?.totalDaysCompleted ? {
        value: 10,
        label: 'vs last week',
        isPositive: true
      } : undefined
    },
    {
      title: 'Task Streak',
      value: userProgress?.streaks?.currentTaskStreak || 0,
      icon: <TrendingUp className="w-5 h-5" />,
      variant: 'accent' as const,
      subtitle: 'consecutive days',
      trend: userProgress?.streaks?.currentTaskStreak ? {
        value: 25,
        label: 'vs last month',
        isPositive: true
      } : undefined
    },
    {
      title: 'Completion Rate',
      value: `${userProgress?.stats?.completionPercentage || 0}%`,
      icon: <Calendar className="w-5 h-5" />,
      variant: 'journal' as const,
      subtitle: 'of current sprint',
      trend: userProgress?.stats?.completionPercentage ? {
        value: 8,
        label: 'vs last sprint',
        isPositive: true
      } : undefined
    },
  ];

  return (
    <div className="elevatr-grid elevatr-grid-responsive gap-6">
      {stats.map((stat, index) => (
        <div key={stat.title} className="elevatr-animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
          <ElevatrStatCard
            title={stat.title}
            value={stat.value}
            subtitle={stat.subtitle}
            icon={stat.icon}
            trend={stat.trend}
            variant={stat.variant}
          />
        </div>
      ))}
    </div>
  );
}
