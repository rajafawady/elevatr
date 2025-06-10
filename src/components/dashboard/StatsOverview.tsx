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
      color: 'from-blue-500 to-blue-600',
      bgColor: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
      borderColor: 'border-blue-200/50 dark:border-blue-700/50',
      textColor: 'text-blue-700 dark:text-blue-300',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Days Completed',
      value: userProgress?.stats?.totalDaysCompleted || 0,
      icon: Trophy,
      color: 'from-green-500 to-green-600',
      bgColor: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
      borderColor: 'border-green-200/50 dark:border-green-700/50',
      textColor: 'text-green-700 dark:text-green-300',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Task Streak',
      value: userProgress?.streaks?.currentTaskStreak || 0,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20',
      borderColor: 'border-orange-200/50 dark:border-orange-700/50',
      textColor: 'text-orange-700 dark:text-orange-300',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      title: 'Completion %',
      value: userProgress?.stats?.completionPercentage || 0,
      icon: Calendar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20',
      borderColor: 'border-purple-200/50 dark:border-purple-700/50',
      textColor: 'text-purple-700 dark:text-purple-300',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={stat.title} variant="interactive" className={`animate-fade-in-up border bg-gradient-to-br ${stat.bgColor} ${stat.borderColor}`} style={{ animationDelay: `${index * 100}ms` }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} shadow-soft`}>
              <stat.icon className={`h-4 w-4 text-white`} />
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className={`text-3xl font-bold ${stat.textColor} mb-2`}>
              {stat.title === 'Completion %' ? `${stat.value}%` : stat.value.toLocaleString()}
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-full bg-white/50 dark:bg-gray-800/50 rounded-full h-2 overflow-hidden`}>
                <div 
                  className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-1000 ease-out progress-bar`}
                  style={{ 
                    width: stat.title === 'Completion %' ? `${stat.value}%` : 
                           stat.title === 'Task Streak' ? `${Math.min(stat.value * 10, 100)}%` :
                           `${Math.min((stat.value / 10) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
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
