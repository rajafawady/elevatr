'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useOptimisticSprints } from '@/hooks/useDataSync';
import { Sprint } from '@/types';
import { ArrowLeft, Upload, Plus, Calendar, Target } from 'lucide-react';
import Link from 'next/link';

export default function NewSprintPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { createSprint, loading, error } = useOptimisticSprints();
  const [sprintType, setSprintType] = useState<'15-day' | '30-day'>('15-day');
  const [sprintTitle, setSprintTitle] = useState('');
  const [sprintDescription, setSprintDescription] = useState('');  const handleCreateSprint = async () => {
    if (!user || !sprintTitle.trim()) return;

    try {
      // Use uploaded data if available, otherwise create basic structure
      let days;
      if (uploadedSprintData && Array.isArray(uploadedSprintData)) {
        // Use the uploaded days data
        days = uploadedSprintData.map((day, index) => ({
          ...day,
          day: day.day || `Day ${index + 1}`,
          date: day.date || (() => {
            const date = new Date();
            date.setDate(date.getDate() + index);
            return date.toISOString().split('T')[0];
          })(),
        }));      } else {
        // Create days structure with default tasks for manual entry
        days = Array.from({ length: sprintType === '15-day' ? 15 : 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i);
          return {
            day: `Day ${i + 1}`,
            date: date.toISOString().split('T')[0], // YYYY-MM-DD format
            coreTasks: [
              { category: 'Learning', description: 'Complete daily learning activity' },
              { category: 'Networking', description: 'Connect with one professional contact' }
            ],
            specialTasks: [
              'Review and plan next day activities'
            ],
          };
        });
      }      const sprintData: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'> = {
        title: sprintTitle,
        description: sprintDescription,
        userId: user.uid,
        duration: days.length <= 15 ? 15 : 30,
        startDate: new Date().toISOString().split('T')[0],
        endDate: (() => {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + (days.length - 1));
          return endDate.toISOString().split('T')[0];
        })(),
        days,
      };

      const sprintId = await createSprint(sprintData);
      router.push(`/sprint/${sprintId}`);
    } catch (error) {
      console.error('Error creating sprint:', error);
      alert('Error creating sprint. Please try again.');
    }
  };
  const [uploadedSprintData, setUploadedSprintData] = useState<any>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);
        
        // Check if it's an array of days (like test.json format)
        if (Array.isArray(parsedData)) {
          // Extract sprint info from the day structure
          const dayCount = parsedData.length;
          setSprintType(dayCount <= 15 ? '15-day' : '30-day');
          setUploadedSprintData(parsedData);
          
          // Set default title if not set
          if (!sprintTitle) {
            setSprintTitle(`Imported ${dayCount}-Day Sprint`);
          }
          if (!sprintDescription) {
            setSprintDescription(`Sprint imported from file with ${dayCount} days of structured tasks`);
          }
          
          alert(`Successfully imported sprint template with ${dayCount} days!`);
        } 
        // Check if it's a sprint object with metadata
        else if (parsedData.title || parsedData.days) {
          if (parsedData.title) setSprintTitle(parsedData.title);
          if (parsedData.description) setSprintDescription(parsedData.description);
          if (parsedData.duration) {
            setSprintType(parsedData.duration === 15 ? '15-day' : '30-day');
          }
          if (parsedData.days) {
            setUploadedSprintData(parsedData.days);
          }
          
          alert('Successfully imported sprint template!');
        } else {
          alert('Invalid sprint file format. Expected an array of days or a sprint object.');
        }
      } catch (error) {
        console.error('Error parsing sprint file:', error);
        alert('Invalid JSON file format. Please check your file and try again.');
      }
    };
    reader.readAsText(file);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Sprint</h1>
          <p className="text-muted-foreground">
            Start your journey with a structured career growth sprint
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sprint Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Sprint Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Sprint Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={sprintTitle}
                  onChange={(e) => setSprintTitle(e.target.value)}
                  placeholder="e.g., Q2 Career Growth Sprint"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={sprintDescription}
                  onChange={(e) => setSprintDescription(e.target.value)}
                  placeholder="Describe your goals and focus areas for this sprint..."
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Sprint Duration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={sprintType === '15-day' ? 'default' : 'outline'}
                    onClick={() => setSprintType('15-day')}
                    className="justify-start"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    15 Days
                  </Button>
                  <Button
                    variant={sprintType === '30-day' ? 'default' : 'outline'}
                    onClick={() => setSprintType('30-day')}
                    className="justify-start"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    30 Days
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Sprint Template
              </CardTitle>
            </CardHeader>            <CardContent>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                uploadedSprintData 
                  ? 'border-green-400 bg-green-50 dark:bg-green-950/20' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/40'
              }`}>
                <Upload className={`h-8 w-8 mx-auto mb-2 ${
                  uploadedSprintData ? 'text-green-600' : 'text-muted-foreground'
                }`} />
                <p className={`text-sm mb-4 ${
                  uploadedSprintData ? 'text-green-700 dark:text-green-400' : 'text-muted-foreground'
                }`}>
                  {uploadedSprintData 
                    ? `✓ Template loaded with ${uploadedSprintData.length} days`
                    : 'Upload a JSON file with your sprint template'
                  }
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button variant="outline" asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {uploadedSprintData ? 'Upload Different File' : 'Choose File'}
                  </label>
                </Button>
                {uploadedSprintData && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setUploadedSprintData(null)}
                    className="ml-2"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sprint Preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Sprint Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {sprintTitle || 'Your Sprint Title'}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {sprintDescription || 'Sprint description will appear here'}
                  </p>
                </div>                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Duration:</span>
                    <span className="font-medium">
                      {uploadedSprintData ? `${uploadedSprintData.length} days` : 
                       sprintType === '15-day' ? '15 days' : '30 days'}
                    </span>
                  </div>                  <div className="flex items-center justify-between text-sm mt-2">
                    <span>Total Tasks:</span>
                    <span className="font-medium">
                      {uploadedSprintData ? 
                        uploadedSprintData.reduce((acc: number, day: any) => 
                          acc + (day.coreTasks?.length || 0) + (day.specialTasks?.length || 0), 0
                        ) + ' tasks' :
                        `${(sprintType === '15-day' ? 15 : 30) * 3} tasks (default)`
                      }
                    </span>
                  </div><div className="flex items-center justify-between text-sm mt-2">
                    <span>Daily Structure:</span>
                    <span className="font-medium">
                      {uploadedSprintData ? 'Custom from file' : '2 Core + 1 Special (Default)'}
                    </span>
                  </div>
                  {uploadedSprintData && (
                    <div className="mt-3 pt-3 border-t border-muted-foreground/20">
                      <div className="text-xs text-green-600 dark:text-green-400">
                        ✓ Sprint template loaded from file
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleCreateSprint}
                  disabled={!sprintTitle.trim() || loading}
                  className="w-full"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Sprint
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
