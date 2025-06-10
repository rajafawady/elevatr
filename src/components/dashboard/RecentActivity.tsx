'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useUserProgressStore } from '@/stores';
import { Clock, BookOpen, CheckCircle, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

// Utility function to safely convert Firebase Timestamp to Date
const toDate = (timestamp: Date | any): Date => {
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  return timestamp instanceof Date ? timestamp : new Date(timestamp);
};

interface RecentActivityProps {
  userId: string;
}

interface ActivityItem {
  id: string;
  type: 'journal' | 'task';
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}

export function RecentActivity({ userId }: RecentActivityProps) {
  const { userProgress, loading } = useUserProgressStore();

  // Generate activity items from user progress data
  const getActivityItems = (): ActivityItem[] => {
    const activities: ActivityItem[] = [];

    if (!userProgress) return activities;

    // Add recent task completions
    const recentTaskStatuses = userProgress.taskStatuses
      .filter(ts => ts.completed && ts.completedAt)
      .sort((a, b) => toDate(b.updatedAt).getTime() - toDate(a.updatedAt).getTime())
      .slice(0, 3);

    recentTaskStatuses.forEach((taskStatus) => {
      activities.push({
        id: `task-${taskStatus.dayId}-${taskStatus.taskType}-${taskStatus.taskIndex}`,
        type: 'task',
        title: 'Task Completed',
        description: `Completed ${taskStatus.taskType} task on Day ${taskStatus.dayId}`,
        timestamp: toDate(taskStatus.updatedAt),
        icon: CheckCircle,
        href: `/tasks`,
      });
    });

    // Add recent journal entries
    const recentJournalEntries = userProgress.journalEntries
      .sort((a, b) => toDate(b.updatedAt).getTime() - toDate(a.updatedAt).getTime())
      .slice(0, 3);

    recentJournalEntries.forEach((entry) => {
      activities.push({
        id: entry.id,
        type: 'journal',
        title: 'Journal Entry',
        description: entry.content.slice(0, 100) + (entry.content.length > 100 ? '...' : ''),
        timestamp: toDate(entry.updatedAt),
        icon: BookOpen,
        href: `/journal/${entry.dayId}`,
      });
    });

    // Sort all activities by timestamp and limit to 5 most recent
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 5);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activities = getActivityItems();

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-4">
            No recent activity. Start completing tasks or writing journal entries.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 group">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <activity.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {activity.description}
                </p>
                {activity.href && (
                  <Link 
                    href={activity.href}
                    className="text-xs text-primary hover:underline mt-1 inline-block"
                  >
                    View details →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" size="sm" className="w-full">
            <MoreHorizontal className="h-4 w-4 mr-2" />
            View All Activity
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
