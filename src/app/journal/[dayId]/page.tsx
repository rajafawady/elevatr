'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useSprintStore, useUserProgressStore } from '@/stores';
import { ArrowLeft, Save, BookOpen, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function JournalPage() {
  const { dayId } = useParams();
  const { user } = useAuth();
  const { activeSprint, loading: sprintLoading } = useSprintStore();
  const { userProgress, loading: progressLoading, updateJournalOptimistic } = useUserProgressStore();
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const loading = sprintLoading || progressLoading;

  // Load existing journal entry when data is available
  useEffect(() => {
    if (!loading && userProgress && dayId) {
      const existingEntry = userProgress.journalEntries.find(
        entry => entry.dayId === dayId
      );
      
      if (existingEntry) {
        setContent(existingEntry.content);
        // Handle both Date and Timestamp types
        const updatedAt = existingEntry.updatedAt;
        if (updatedAt instanceof Date) {
          setLastSaved(updatedAt);
        } else if (updatedAt && typeof updatedAt.toDate === 'function') {
          // Firestore Timestamp
          setLastSaved(updatedAt.toDate());
        } else {
          setLastSaved(new Date());
        }
      }
    }
  }, [loading, userProgress, dayId]);

  const handleSave = useCallback(async () => {
    if (!user || !activeSprint || !dayId) return;

    try {
      setSaving(true);
      setSaveError(null);
      
      await updateJournalOptimistic(user.uid, activeSprint.id, dayId as string, content);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving journal entry:', error);
      setSaveError('Failed to save journal entry. Please try again.');
    } finally {
      setSaving(false);
    }
  }, [user, activeSprint, dayId, content, updateJournalOptimistic]);

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      if (content.trim()) {
        handleSave();
      }
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [content, hasUnsavedChanges, handleSave]);

  // Handle content changes
  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
    setSaveError(null);
  };

  const prompts = [
    "What did I accomplish today?",
    "What challenges did I face and how did I overcome them?",
    "What did I learn about myself or my field?",
    "How did I grow professionally today?",
    "What am I grateful for in my career journey?",
    "What would I do differently if I could repeat today?",
    "How did today's work align with my long-term goals?",
    "What skills did I practice or improve today?",
    "Who did I connect with and what did I learn from them?",
    "What insights or ideas came to me today?",
  ];
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (!activeSprint) {
    return (
      <div className="elevatr-container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4 elevatr-gradient-text">No active sprint found</h1>
        <p className="text-muted-foreground mb-4">
          You need to have an active sprint to write journal entries.
        </p>
        <ElevatrButton variant="motivation">
          <Link href="/sprint/new">
            Create New Sprint
          </Link>
        </ElevatrButton>
      </div>
    );
  }  return (
    <div className="elevatr-container py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8 elevatr-animate-fade-in">
        <ElevatrButton variant="secondary" size="sm">
          <Link href={`/sprint/${activeSprint.id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </ElevatrButton>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2 elevatr-gradient-text">
            <BookOpen className="h-6 w-6 md:h-8 md:w-8" />
            Day {dayId} Journal
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Reflect on your progress and insights from today
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 w-full md:w-auto">
          {lastSaved && (
            <span className="text-xs md:text-sm text-muted-foreground">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <ElevatrButton onClick={handleSave} disabled={saving} variant="motivation" className="w-full md:w-auto">
            {saving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </ElevatrButton>
        </div>
      </div>      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Journal Editor */}
        <div className="lg:col-span-2">
          <ElevatrCard variant="glass" className="elevatr-animate-fade-in elevatr-animate-delay-1">
            <div className="elevatr-card-header">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Day {dayId} Reflection
              </h2>
            </div>
            <div className="elevatr-card-content">
              <div className="space-y-4">
                <textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Start writing your reflection for today..."
                  className="w-full h-96 p-4 glass-panel rounded-md border-0 bg-background/50 text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                
                {/* Status indicators */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    {hasUnsavedChanges && (
                      <span className="text-badge">
                        Unsaved changes
                      </span>
                    )}
                    {saving && (
                      <span className="text-primary">
                        Saving...
                      </span>
                    )}
                    {lastSaved && !hasUnsavedChanges && (
                      <span className="text-success">
                        Saved at {lastSaved.toLocaleTimeString()}
                      </span>
                    )}
                    {saveError && (
                      <span className="text-destructive">
                        {saveError}
                      </span>
                    )}
                  </div>
                  <div className="text-muted-foreground">
                    {content.length} characters • {content.split(/\s+/).filter(word => word.length > 0).length} words
                  </div>
                </div>
              </div>
            </div>
          </ElevatrCard>
        </div>        {/* Reflection Prompts */}
        <div>
          <ElevatrCard variant="glass" className="elevatr-animate-fade-in elevatr-animate-delay-2">
            <div className="elevatr-card-header">
              <h2 className="text-xl font-semibold">Reflection Prompts</h2>
            </div>
            <div className="elevatr-card-content">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Use these prompts to guide your reflection:
                </p>
                {prompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const newContent = content + (content ? '\n\n' : '') + prompt + '\n\n';
                      handleContentChange(newContent);
                    }}
                    className="text-left w-full p-3 text-sm glass-panel rounded-md border-0 hover:bg-accent/50 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </ElevatrCard>          {/* Writing Tips */}
          <ElevatrCard variant="glass" className="mt-6 elevatr-animate-fade-in elevatr-animate-delay-3">
            <div className="elevatr-card-header">
              <h2 className="text-xl font-semibold">Writing Tips</h2>
            </div>
            <div className="elevatr-card-content">
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Be honest and authentic in your reflections</p>
                <p>• Focus on both successes and challenges</p>
                <p>• Consider how today connects to your larger goals</p>
                <p>• Note specific examples and details</p>
                <p>• Think about what you&apos;d like to remember later</p>
                <p>• Consider what you&apos;d tell a mentor or colleague</p>
              </div>
            </div>
          </ElevatrCard>
        </div>
      </div>
    </div>
  );
}
