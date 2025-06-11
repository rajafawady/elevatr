'use client';

import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrNotification } from '@/components/ui/ElevatrNotification';
import { useUserProgressStore } from '@/stores';
import { Clock, BookOpen, CheckCircle, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

// Utility function to safely convert Firebase Timestamp to Date
const toDate = (timestamp: Date | { toDate?: () => Date }): Date => {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date();
};

interface ActivityItem {
  id: string;
  type: 'journal' | 'task';
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}

export function RecentActivity() {
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
  };  if (loading) {
    return (
      <ElevatrCard 
        variant="glass"
        className="p-8"
      >
        <div className="elevatr-card-header">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Recent Activity</h3>
              <p className="text-sm text-muted-foreground">Loading your latest updates</p>
            </div>
          </div>
        </div>
        <div className="elevatr-card-content">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3 elevatr-animate-pulse" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="w-10 h-10 rounded-lg bg-muted/30"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted/30 rounded"></div>
                  <div className="h-3 bg-muted/20 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ElevatrCard>
    );
  }  const activities = getActivityItems();
  if (activities.length === 0) {
    return (
      <ElevatrCard variant="glass" className="p-6">
        <div className="elevatr-card-header">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Recent Activity</h3>
              <p className="text-sm text-muted-foreground">Track your journey progress</p>
            </div>
          </div>
        </div>
        <div className="elevatr-card-content text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            No recent activity. Start completing tasks or writing journal entries to see your progress here.
          </p>
        </div>
      </ElevatrCard>
    );
  }  return (
    <ElevatrCard variant="glass" className="p-6">
      <div className="elevatr-card-header">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Recent Activity</h3>
            <p className="text-sm text-muted-foreground">Latest updates from your sprint</p>
          </div>
        </div>
      </div>
      <div className="elevatr-card-content">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div 
              key={activity.id} 
              className="flex items-start gap-4 p-3 rounded-lg elevatr-card elevatr-card-interactive group elevatr-animate-slide-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                  activity.type === 'task' 
                    ? 'elevatr-stat-card-success group-hover:scale-110'
                    : 'elevatr-stat-card-journal group-hover:scale-110'
                }`}>
                  <activity.icon className={`h-5 w-5 transition-colors ${
                    activity.type === 'task' 
                      ? 'text-success group-hover:text-success/80'
                      : 'text-journal group-hover:text-journal/80'
                  }`} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                    {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                  {activity.description}
                </p>
                {activity.href && (
                  <Link 
                    href={activity.href}
                    className="inline-flex items-center text-xs text-primary hover:text-primary/80 font-medium group/link"
                  >
                    View details 
                    <svg className="w-3 h-3 ml-1 transition-transform group-hover/link:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-border/50">
          <ElevatrButton variant="secondary" size="sm" className="w-full group">
            <MoreHorizontal className="h-4 w-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
            View All Activity
          </ElevatrButton>
        </div>
      </div>
    </ElevatrCard>
  );
}
