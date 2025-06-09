'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { JournalEntry, TaskStatus } from '@/types';
import { getRecentJournalEntries, getRecentTaskUpdates } from '@/services/firebase';
import { Clock, BookOpen, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
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
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRecentActivity = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const [journalEntries, taskUpdates] = await Promise.all([
          getRecentJournalEntries(userId, 5),
          getRecentTaskUpdates(userId, 5),
        ]);        const journalActivities: ActivityItem[] = journalEntries.map((entry: JournalEntry) => ({
          id: entry.id,
          type: 'journal',
          title: 'Journal Entry',
          description: entry.content.slice(0, 100) + (entry.content.length > 100 ? '...' : ''),
          timestamp: toDate(entry.createdAt),
          icon: BookOpen,
          href: `/journal/${entry.id}`,
        }));const taskActivities: ActivityItem[] = taskUpdates
          .filter((task: TaskStatus) => task.id && task.title) // Only include tasks with id and title
          .map((task: TaskStatus) => ({
            id: task.id!,
            type: 'task',
            title: task.completed ? 'Task Completed' : 'Task Updated',
            description: task.title!,
            timestamp: toDate(task.updatedAt),
            icon: task.completed ? CheckCircle : XCircle,
            href: `/tasks/${task.id}`,
          }));

        const allActivities = [...journalActivities, ...taskActivities]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 10);

        setActivities(allActivities);
      } catch (error) {
        console.error('Error loading recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecentActivity();
  }, [userId]);

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
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
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
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No recent activity found. Start by creating a journal entry or completing some tasks.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/journal/new">
                Add Journal Entry
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={`${activity.type}-${activity.id}`} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {activity.title}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {activity.description}
                  </p>
                  {activity.href && (
                    <Button variant="link" size="sm" className="h-auto p-0 mt-1" asChild>
                      <Link href={activity.href}>
                        View details
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {activities.length >= 10 && (
              <div className="text-center pt-4 border-t">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/activity">
                    <MoreHorizontal className="h-4 w-4 mr-2" />
                    View All Activity
                  </Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
