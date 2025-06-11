'use client';
import { ElevatrCard, ElevatrCardHeader, ElevatrCardContent, ElevatrCardTitle, ElevatrButton, ElevatrBadge, ElevatrProgress } from '@/components/ui/ElevatrTheme';
import { BookOpen, Calendar, Plus, Clock } from 'lucide-react';
import Link from 'next/link';
import { useSprintStore, useUserProgressStore } from '@/stores';

export function TodayJournal() {
  const { activeSprint, loading: sprintLoading } = useSprintStore();
  const { userProgress, loading: progressLoading } = useUserProgressStore();
  const loading = sprintLoading || progressLoading;
  
  const getCurrentDay = () => {
    if (!activeSprint) return null;
    
    try {
      const startDate = new Date(activeSprint.startDate);
      if (isNaN(startDate.getTime())) {
        return null;
      }
      
      const currentDate = new Date();
      const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays <= activeSprint.duration ? diffDays.toString() : null;
    } catch (error) {
      console.error('Error calculating current day:', error);
      return null;
    }
  };

  const getTodayProgress = () => {
    const currentDay = getCurrentDay();
    if (!currentDay || !activeSprint || !userProgress) return 0;

    const day = activeSprint.days.find(d => d.day === currentDay);
    if (!day) return 0;

    const totalTasks = day.coreTasks.length + day.specialTasks.length;
    const completedTasks = userProgress.taskStatuses.filter(
      ts => ts.dayId === currentDay && ts.completed
    ).length;

    return Math.round((completedTasks / totalTasks) * 100);
  };

  const getTodayJournalEntry = () => {
    const currentDay = getCurrentDay();
    if (!currentDay || !userProgress) return null;
    
    return userProgress.journalEntries.find(entry => entry.dayId === currentDay);
  };
  if (loading) {
    return (
      <ElevatrCard variant="glass" className="p-6">
        <ElevatrCardHeader>
          <ElevatrCardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg elevatr-gradient-journal">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold">Today's Journal</div>
              <div className="text-sm text-muted-foreground font-normal">Loading...</div>
            </div>
          </ElevatrCardTitle>
        </ElevatrCardHeader>
        <ElevatrCardContent>
          <div className="elevatr-skeleton space-y-4">
            <div className="elevatr-skeleton-text"></div>
            <div className="elevatr-skeleton-text"></div>
            <div className="h-20 elevatr-skeleton rounded"></div>
          </div>
        </ElevatrCardContent>
      </ElevatrCard>
    );
  }
  const currentDay = getCurrentDay();
  const todayProgress = getTodayProgress();
  const todayJournal = getTodayJournalEntry();

  if (!activeSprint || !currentDay) {
    return (
      <ElevatrCard variant="glass" className="p-6">
        <ElevatrCardHeader>
          <ElevatrCardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-lg elevatr-gradient-journal">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            Today's Journal
          </ElevatrCardTitle>
        </ElevatrCardHeader>
        <ElevatrCardContent className="text-center py-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full elevatr-gradient-journal flex items-center justify-center elevatr-animate-bounce-subtle">
            <Plus className="h-8 w-8 text-white" />
          </div>
          <p className="text-muted-foreground text-sm mb-4">
            No active sprint found. Start a new sprint to begin journaling.
          </p>
          <Link href="/sprint/new">
            <ElevatrButton variant="primary" size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Start Sprint
            </ElevatrButton>
          </Link>
        </ElevatrCardContent>
      </ElevatrCard>
    );
  }

  return (
    <ElevatrCard variant="journal" className="p-6">
      <ElevatrCardHeader>
        <ElevatrCardTitle className="flex items-center gap-3">
          <div className="p-2 rounded-lg elevatr-gradient-journal">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-bold">Today's Journal</div>
            <div className="text-sm text-muted-foreground font-normal flex items-center gap-2">
              <ElevatrBadge variant="journal" size="sm">Day {currentDay}</ElevatrBadge>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </ElevatrCardTitle>
      </ElevatrCardHeader>
      <ElevatrCardContent className="space-y-4">
        {/* Today's Progress */}
        <div className="glass-panel p-4">
          <ElevatrProgress 
            value={todayProgress} 
            variant="journal" 
            showPercentage 
            animated 
          />
        </div>

        {/* Journal Content */}
        {todayJournal ? (
          <div className="space-y-3">
            <div className="glass-panel p-4">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-journal" />
                Today's Reflection
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {todayJournal.content.length > 150 
                  ? `${todayJournal.content.slice(0, 150)}...` 
                  : todayJournal.content || "No content yet..."}
              </p>
              {todayJournal.content && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/50 pt-2">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {todayJournal.content.split(/\s+/).filter(word => word.length > 0).length} words
                  </span>                  
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Just now
                  </span>
                </div>
              )}
            </div>
            <Link href={`/journal/${currentDay}`}>
              <ElevatrButton variant="accent" size="lg" className="w-full group">
                <BookOpen className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                Continue Writing
              </ElevatrButton>
            </Link>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full elevatr-gradient-journal flex items-center justify-center elevatr-animate-float">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <p className="text-muted-foreground mb-4 text-sm">
              Reflect on your progress and plan for tomorrow.
            </p>
            <Link href={`/journal/${currentDay}`}>
              <ElevatrButton variant="motivation" size="lg" className="group">
                <Plus className="h-4 w-4 mr-2 group-hover:rotate-180 transition-transform duration-300" />
                Start Day {currentDay} Journal
              </ElevatrButton>
            </Link>
          </div>
        )}
      </ElevatrCardContent>
    </ElevatrCard>
  );
}
