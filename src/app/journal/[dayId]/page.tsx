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
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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
            setLastSaved(new Date(existingEntry.updatedAt));
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
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      setSaving(false);
    }
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
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/sprint/${activeSprint.id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Day {dayId} Journal
          </h1>
          <p className="text-muted-foreground">
            Reflect on your progress and insights from today
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastSaved && (
            <span className="text-sm text-muted-foreground">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
          <Button onClick={handleSave} disabled={saving}>
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
            </CardHeader>
            <CardContent>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your reflection for today..."
                className="w-full h-96 p-4 border border-input rounded-md bg-background text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <div className="mt-4 text-sm text-muted-foreground">
                {content.length} characters • {content.split(/\s+/).filter(word => word.length > 0).length} words
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
                    key={index}
                    onClick={() => {
                      const newContent = content + (content ? '\n\n' : '') + prompt + '\n\n';
                      setContent(newContent);
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
