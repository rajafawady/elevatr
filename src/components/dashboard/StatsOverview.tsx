'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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
      icon: Target,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Days Completed',
      value: userProgress?.stats?.totalDaysCompleted || 0,
      icon: Trophy,
      color: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Task Streak',
      value: userProgress?.streaks?.currentTaskStreak || 0,
      icon: TrendingUp,
      color: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Completion %',
      value: userProgress?.stats?.completionPercentage || 0,
      icon: Calendar,
      color: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>          <CardContent>
            <div className="text-2xl font-bold">
              {stat.title === 'Completion %' ? `${stat.value}%` : stat.value}
            </div>
            <p className="text-xs text-muted-foreground">
              {stat.title === 'Task Streak' && stat.value > 0 && 'consecutive days'}
              {stat.title === 'Days Completed' && 'in current sprint'}
              {stat.title === 'Tasks Completed' && 'in current sprint'}
              {stat.title === 'Completion %' && 'of current sprint'}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
