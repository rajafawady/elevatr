'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { updateJournalEntry, getActiveSprint, getUserProgress } from '@/services/firebase';
import { JournalEntry, Sprint } from '@/types';
import { ArrowLeft, Save, BookOpen, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function JournalPage() {
  const { dayId } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [content, setContent] = useState('');  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user || !dayId) return;

      try {
        setLoading(true);
        const sprint = await getActiveSprint(user.uid);
        
        if (sprint) {
          setActiveSprint(sprint);
          
          // Load existing journal entry
          const userProgress = await getUserProgress(user.uid, sprint.id);
          const existingEntry = userProgress?.journalEntries.find(
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
      } catch (error) {
        console.error('Error loading journal data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, dayId]);
  const handleSave = async () => {
    if (!user || !activeSprint || !dayId) return;

    try {
      setSaving(true);
      setSaveError(null);
      
      const journalEntry: JournalEntry = {
        id: `${activeSprint.id}-${dayId}-${Date.now()}`,
        userId: user.uid,
        dayId: dayId as string,
        content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await updateJournalEntry(user.uid, activeSprint.id, journalEntry);
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving journal entry:', error);
      setSaveError('Failed to save journal entry. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      if (content.trim()) {
        handleSave();
      }
    }, 5000); // Auto-save after 5 seconds of inactivity

    return () => clearTimeout(autoSaveTimer);
  }, [content, hasUnsavedChanges]);

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
      <div className="container mx-auto px-6 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">No active sprint found</h1>
        <p className="text-muted-foreground mb-4">
          You need to have an active sprint to write journal entries.
        </p>
        <Button asChild>
          <Link href="/sprint/new">
            Create New Sprint
          </Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild className="self-start">
          <Link href={`/sprint/${activeSprint.id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
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
          <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
            {saving ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Journal Editor */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Day {dayId} Reflection
              </CardTitle>
            </CardHeader>            <CardContent>
              <div className="space-y-4">
                <textarea
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Start writing your reflection for today..."
                  className="w-full h-96 p-4 border border-input rounded-md bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
                
                {/* Status indicators */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    {hasUnsavedChanges && (
                      <span className="text-amber-600 dark:text-amber-400">
                        Unsaved changes
                      </span>
                    )}
                    {saving && (
                      <span className="text-blue-600 dark:text-blue-400">
                        Saving...
                      </span>
                    )}
                    {lastSaved && !hasUnsavedChanges && (
                      <span className="text-green-600 dark:text-green-400">
                        Saved at {lastSaved.toLocaleTimeString()}
                      </span>
                    )}
                    {saveError && (
                      <span className="text-red-600 dark:text-red-400">
                        {saveError}
                      </span>
                    )}
                  </div>                  <div className="text-muted-foreground">
                    {content.length} characters • {content.split(/\s+/).filter(word => word.length > 0).length} words
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reflection Prompts */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Reflection Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground mb-4">
                  Use these prompts to guide your reflection:
                </p>
                {prompts.map((prompt, index) => (
                  <button
                    key={index}                    onClick={() => {
                      const newContent = content + (content ? '\n\n' : '') + prompt + '\n\n';
                      handleContentChange(newContent);
                    }}
                    className="text-left w-full p-3 text-sm border border-input rounded-md hover:bg-accent transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Writing Tips */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Writing Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>• Be honest and authentic in your reflections</p>
                <p>• Focus on both successes and challenges</p>
                <p>• Consider how today connects to your larger goals</p>
                <p>• Note specific examples and details</p>
                <p>• Think about what you&apos;d like to remember later</p>
                <p>• Consider what you&apos;d tell a mentor or colleague</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
