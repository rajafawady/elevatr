'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { ElevatrJournalCard } from '@/components/ui/ElevatrJournalCard';
import { ElevatrNotification } from '@/components/ui/ElevatrNotification';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CalendarDays, Plus, BookOpen, ArrowRight, Calendar } from 'lucide-react';
import { useSprintStore, useUserProgressStore } from '@/stores';
import { format } from 'date-fns';
import Link from 'next/link';

interface JournalEntryDisplay {
  dayId: string;
  date: Date;
  title: string;
  preview: string;
  wordCount: number;
  sprintDay: number;
}

export default function JournalPage() {
  const { user } = useAuth();
  const { activeSprint, loading: sprintLoading } = useSprintStore();
  const { userProgress, loading: progressLoading } = useUserProgressStore();
  const loading = sprintLoading || progressLoading;
  const getJournalEntries = (): JournalEntryDisplay[] => {
    if (!activeSprint || !userProgress) return [];

    const entries: JournalEntryDisplay[] = [];
    
    // Create entries for each day of the sprint
    activeSprint.days.forEach((day) => {
      const existingEntry = userProgress.journalEntries.find(
        entry => entry.dayId === day.day
      );
      
      const dayNumber = parseInt(day.day);
      // Safely parse the start date
      let entryDate: Date;
      try {
        entryDate = new Date(activeSprint.startDate);
        // Validate the date
        if (isNaN(entryDate.getTime())) {
          entryDate = new Date(); // Fallback to current date
        }
        entryDate.setDate(entryDate.getDate() + dayNumber - 1);
      } catch (error) {
        console.error('Error parsing sprint start date:', error);
        entryDate = new Date(); // Fallback to current date
      }
      
      entries.push({
        dayId: day.day,
        date: entryDate,
        title: `Day ${day.day} Reflection`,
        preview: existingEntry?.content 
          ? (existingEntry.content.length > 100 
              ? `${existingEntry.content.slice(0, 100)}...` 
              : existingEntry.content)
          : 'No reflection written yet...',
        wordCount: existingEntry?.content 
          ? existingEntry.content.split(/\s+/).filter(word => word.length > 0).length 
          : 0,
        sprintDay: dayNumber
      });
    });
    
    // Sort by day number (most recent first)
    return entries.sort((a, b) => b.sprintDay - a.sprintDay);
  };
  const getCurrentDay = () => {
    if (!activeSprint) return null;
    
    try {
      const startDate = new Date(activeSprint.startDate);
      // Validate the date
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (!activeSprint) {
    return (
      <div className="p-0 md:p-6 max-w-full overflow-x-hidden">
        <ElevatrNotification
          type="info"
          title="No Active Sprint"
          message="You need an active sprint to start journaling about your career development."
          icon={<BookOpen className="h-5 w-5" />}
          action={{
            label: "Create New Sprint",
            onClick: () => window.location.href = "/sprint/new"
          }}
        />
      </div>
    );
  }

  const journalEntries = getJournalEntries();
  const currentDay = getCurrentDay();

  return (
    <div className="p-0 md:p-6 max-w-full overflow-x-hidden space-y-8">
      <div className="mb-8 elevatr-animate-fade-in">
        <h1 className="text-3xl font-bold elevatr-gradient-text">Journal</h1>
        <p className="text-muted-foreground mt-1">
          Reflect on your career development journey
        </p>
      </div>      {/* Current Day Quick Action */}
      {currentDay && (
        <ElevatrCard
          variant="interactive"
          theme="journal"
          className="mb-6"
        >
            <div className="elevatr-card-content">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">
                Day {currentDay} Reflection
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
              </div>
              <div className="w-full sm:w-auto">
              <Link href={`/journal/${currentDay}`}>
                <ElevatrButton variant="motivation" className="w-full sm:w-auto">
                <BookOpen className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">Write Today&apos;s Entry</span>
                <span className="xs:hidden">Write Entry</span>
                </ElevatrButton>
              </Link>
              </div>
            </div>
            </div>
        </ElevatrCard>
      )}      {/* Sprint Journal Entries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between elevatr-animate-fade-in elevatr-animate-delay-2">
          <h2 className="text-xl font-semibold">
            {activeSprint.title} - Journal Entries
          </h2>
          <div className="text-sm text-muted-foreground">
            {journalEntries.filter(e => e.wordCount > 0).length} of {journalEntries.length} days completed
          </div>
        </div>

        {journalEntries.length === 0 ? (
          <ElevatrCard variant="glass" className="elevatr-animate-fade-in elevatr-animate-delay-3">
            <div className="elevatr-card-content text-center py-8">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Sprint Days</h3>
              <p className="text-muted-foreground">
                Your sprint doesn&apos;t have any configured days yet.
              </p>
            </div>
          </ElevatrCard>
        ) : (
          <div className="elevatr-grid">
            {journalEntries.map((entry, index) => (
              <ElevatrCard key={entry.dayId} variant="interactive" hover className={`elevatr-animate-fade-in elevatr-animate-delay-${Math.min(index + 3, 6)}`}>
                <div className="elevatr-card-content">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <h3 className="font-semibold">{entry.title}</h3>
                        <span className="text-xs bg-muted px-2 py-1 rounded-full">
                          {isNaN(entry.date.getTime()) ? 'Invalid Date' : format(entry.date, 'MMM d')}
                        </span>
                        {entry.sprintDay.toString() === currentDay && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                            Today
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm mb-3 leading-relaxed">
                        {entry.preview}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{entry.wordCount} words</span>
                        <span>{isNaN(entry.date.getTime()) ? 'Unknown Day' : format(entry.date, 'EEEE')}</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Link href={`/journal/${entry.dayId}`}>
                        <ElevatrButton variant="secondary" size="sm">
                          {entry.wordCount > 0 ? 'Edit' : 'Write'}
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </ElevatrButton>
                      </Link>
                    </div>
                  </div>
                </div>
              </ElevatrCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
