'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
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
      const entryDate = new Date(activeSprint.startDate);
      entryDate.setDate(entryDate.getDate() + dayNumber - 1);
      
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
    
    const startDate = new Date(activeSprint.startDate);
    const currentDate = new Date();
    const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays <= activeSprint.duration ? diffDays.toString() : null;
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h1 className="text-2xl font-bold mb-2">No Active Sprint</h1>
            <p className="text-muted-foreground mb-6">
              You need an active sprint to start journaling about your career development.
            </p>            <Link href="/sprint/new">
              <ElevatrButton variant="motivation">
                <Plus className="h-4 w-4 mr-2" />
                Create New Sprint
              </ElevatrButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const journalEntries = getJournalEntries();
  const currentDay = getCurrentDay();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Journal</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Reflect on your career development journey
          </p>
        </div>        {/* Current Day Quick Action */}
        {currentDay && (
          <ElevatrCard variant="glass" className="mb-6 border-primary/20 bg-primary/5">
            <div className="elevatr-card-content p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Today: Day {currentDay} Reflection
                  </h3>
                  <p className="text-muted">
                    {format(new Date(), 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>
                <Link href={`/journal/${currentDay}`}>
                  <ElevatrButton variant="primary">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Write Today&apos;s Entry
                  </ElevatrButton>
                </Link>
              </div>
            </div>
          </ElevatrCard>
        )}

        {/* Sprint Journal Entries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {activeSprint.title} - Journal Entries
            </h2>
            <div className="text-sm text-muted-foreground">
              {journalEntries.filter(e => e.wordCount > 0).length} of {journalEntries.length} days completed
            </div>
          </div>          {journalEntries.length === 0 ? (
            <ElevatrCard variant="glass">
              <div className="elevatr-card-content p-8 text-center">
                <CalendarDays className="mx-auto h-12 w-12 text-muted mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Sprint Days</h3>
                <p className="text-muted">
                  Your sprint doesn&apos;t have any configured days yet.
                </p>
              </div>
            </ElevatrCard>
          ) : (
            <div className="grid gap-4">
              {journalEntries.map((entry) => (
                <ElevatrCard key={entry.dayId} variant="glass" className="hover:shadow-md transition-shadow elevatr-animate-delay-1">
                  <div className="elevatr-card-content p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Calendar className="h-4 w-4 text-muted" />
                          <h3 className="font-semibold">{entry.title}</h3>
                          <span className="text-xs bg-muted px-2 py-1 rounded-full">
                            {format(entry.date, 'MMM d')}
                          </span>
                          {entry.sprintDay.toString() === currentDay && (
                            <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                              Today
                            </span>
                          )}
                        </div>
                        <p className="text-muted text-sm mb-3 leading-relaxed">
                          {entry.preview}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted">
                          <span>{entry.wordCount} words</span>
                          <span>{format(entry.date, 'EEEE')}</span>
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
    </div>
  );
}
