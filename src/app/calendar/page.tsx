'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getActiveSprint, getUserProgress } from '@/services/firebase';
import { Sprint, UserProgress } from '@/types';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, Circle, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  sprintDay?: string;
  isCompleted: boolean;
  tasksCompleted: number;
  totalTasks: number;
  hasJournal: boolean;
}

export default function CalendarPage() {
  const { user } = useAuth();
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const [sprint, progress] = await Promise.all([
          getActiveSprint(user.uid),
          getActiveSprint(user.uid).then(s => s ? getUserProgress(user.uid, s.id) : null),
        ]);

        setActiveSprint(sprint);
        setUserProgress(progress);
      } catch (error) {
        console.error('Error loading calendar data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();  }, [user]);

  const generateCalendarDays = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: CalendarDay[] = [];

    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonth.getDate() - i,
        isCurrentMonth: false,
        isCompleted: false,
        tasksCompleted: 0,
        totalTasks: 0,
        hasJournal: false,
      });
    }

    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const sprintDay = getSprintDayForDate(new Date(year, month, day));
      const dayProgress = sprintDay ? getDayProgress(sprintDay) : null;
      
      days.push({
        day,
        isCurrentMonth: true,
        sprintDay,
        isCompleted: dayProgress ? dayProgress.tasksCompleted === dayProgress.totalTasks : false,
        tasksCompleted: dayProgress?.tasksCompleted || 0,
        totalTasks: dayProgress?.totalTasks || 0,
        hasJournal: sprintDay ? hasJournalEntry(sprintDay) : false,
      });
    }

    // Add days from next month to fill the grid
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isCompleted: false,
        tasksCompleted: 0,
        totalTasks: 0,
        hasJournal: false,
      });
    }    setCalendarDays(days);
  }, [currentDate, activeSprint, userProgress]);

  useEffect(() => {
    generateCalendarDays();
  }, [generateCalendarDays]);

  const getSprintDayForDate = (date: Date): string | undefined => {
    if (!activeSprint) return undefined;
    
    // This is a simplified implementation
    // In a real app, you'd store the start date with the sprint
    const today = new Date();
    const daysSinceToday = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const sprintDayNumber = daysSinceToday + 1;
    
    if (sprintDayNumber >= 1 && sprintDayNumber <= activeSprint.duration) {
      return sprintDayNumber.toString();
    }
    
    return undefined;
  };

  const getDayProgress = (sprintDay: string) => {
    if (!activeSprint || !userProgress) return null;
    
    const day = activeSprint.days.find(d => d.day === sprintDay);
    if (!day) return null;
    
    const totalTasks = day.coreTasks.length + day.specialTasks.length;
    const completedTasks = userProgress.taskStatuses.filter(
      ts => ts.dayId === sprintDay && ts.completed
    ).length;
    
    return { tasksCompleted: completedTasks, totalTasks };
  };

  const hasJournalEntry = (sprintDay: string): boolean => {
    if (!userProgress) return false;
    
    return userProgress.journalEntries.some(entry => entry.dayId === sprintDay);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  if (loading) {
    return (
      <div className="elevatr-container flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="elevatr-container py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 elevatr-animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 elevatr-gradient-text">
            <Calendar className="h-8 w-8" />
            Sprint Calendar
          </h1>
          <p className="text-muted-foreground">
            Track your daily progress and journal entries
          </p>
        </div>
        
        {activeSprint && (
          <ElevatrCard variant="stat" theme="primary" className="elevatr-animate-fade-in elevatr-animate-delay-1">
            <div className="elevatr-card-content text-center">
              <div className="text-sm text-muted-foreground">Active Sprint</div>
              <div className="font-semibold">{activeSprint.title}</div>
              <div className="text-sm">
                {userProgress?.stats.completionPercentage || 0}% Complete
              </div>
            </div>
          </ElevatrCard>
        )}
      </div>

      {!activeSprint ? (
        <ElevatrCard variant="glass" className="elevatr-animate-fade-in elevatr-animate-delay-2">
          <div className="elevatr-card-content text-center py-12">            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Active Sprint</h2>
            <p className="text-muted-foreground mb-4">
              Create a sprint to start tracking your daily progress.
            </p>            <Link href="/sprint/new">
              <ElevatrButton variant="motivation">
                Create New Sprint
              </ElevatrButton>
            </Link>
          </div>
        </ElevatrCard>
      ) : (
        <ElevatrCard variant="glass" className="elevatr-animate-fade-in elevatr-animate-delay-2">
          <div className="elevatr-card-header">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center gap-2">
                <ElevatrButton
                  variant="secondary"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </ElevatrButton>
                <ElevatrButton
                  variant="secondary"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </ElevatrButton>
              </div>
            </div>
          </div>
          <div className="elevatr-card-content">            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {dayNames.map(day => (
                <div key={day} className="text-center p-2 text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {calendarDays.map((calendarDay, index) => (
                <div
                  key={index}
                  className={`
                    aspect-square p-1 text-center relative border rounded-md transition-all duration-200
                    ${calendarDay.isCurrentMonth 
                      ? 'bg-background hover:bg-primary/5' 
                      : 'bg-muted/50 text-muted-foreground'
                    }
                    ${calendarDay.sprintDay 
                      ? 'ring-2 ring-primary/20' 
                      : ''
                    }
                    ${calendarDay.isCompleted 
                      ? 'bg-success/10 border-success/20' 
                      : ''
                    }
                  `}
                >
                  <div className="text-sm font-medium">
                    {calendarDay.day}
                  </div>
                  
                  {calendarDay.sprintDay && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-5">
                      <div className="text-xs text-primary font-medium">
                        Day {calendarDay.sprintDay}
                      </div>
                      
                      {calendarDay.totalTasks > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <div className="text-xs">
                            {calendarDay.tasksCompleted}/{calendarDay.totalTasks}
                          </div>
                          {calendarDay.isCompleted ? (
                            <CheckCircle2 className="h-3 w-3 text-success" />
                          ) : (
                            <Circle className="h-3 w-3" />
                          )}
                        </div>
                      )}
                      
                      {calendarDay.hasJournal && (
                        <BookOpen className="h-3 w-3 text-accent mt-1" />
                      )}
                      
                      {calendarDay.isCurrentMonth && calendarDay.sprintDay && (
                        <Link 
                          href={`/sprint/${activeSprint.id}`}
                          className="absolute inset-0 z-10"
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-6 mt-6 pt-4 border-t text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary/20 rounded"></div>
                <span>Sprint Day</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span>All Tasks Complete</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-accent" />
                <span>Journal Entry</span>
              </div>
            </div>
          </div>
        </ElevatrCard>
      )}
    </div>
  );
}
