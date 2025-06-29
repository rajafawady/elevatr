'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useOptimisticSprints } from '@/hooks/useDataSync';
import { useSprintStore } from '@/stores';
import { Sprint } from '@/types';
import { ArrowLeft, Upload, Plus, Calendar, Target, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface UploadedDayData {
  day: number;
  date?: string;
  tasks: {
    id: string;
    title: string;
    type: string;
    isCore?: boolean;
  }[];
}

export default function NewSprintPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { createSprint, loading } = useOptimisticSprints();
  const { activeSprint, loadActiveSprint, clearActiveSprint } = useSprintStore();
  const [sprintType, setSprintType] = useState<'15-day' | '30-day'>('15-day');
  const [sprintTitle, setSprintTitle] = useState('');
  const [sprintDescription, setSprintDescription] = useState('');
  const [showActiveSprintDialog, setShowActiveSprintDialog] = useState(false);
  const [uploadedSprintData, setUploadedSprintData] = useState<UploadedDayData[] | null>(null);

  // Load active sprint when component mounts
  useEffect(() => {
    if (user) {
      // Clear cached active sprint first, then force refresh to get the latest status
      clearActiveSprint();
      loadActiveSprint(user.uid, true);
    }
  }, [user, loadActiveSprint, clearActiveSprint]);

  // Check if there's an active sprint based on dates and status
  const isSprintCurrentlyActive = (sprint: Sprint | null): boolean => {
    if (!sprint) return false;
    
    const today = new Date().toISOString().split('T')[0];
    const sprintStart = sprint.startDate;
    const sprintEnd = sprint.endDate;
    
    // A sprint is active if:
    // 1. Status is 'active' OR status is undefined (for backward compatibility)
    // 2. Today's date is between start and end dates (inclusive)
    const statusActive = !sprint.status || sprint.status === 'active';
    const dateActive = today >= sprintStart && today <= sprintEnd;
    
    return statusActive && dateActive;
  };

  const handleCreateSprintClick = () => {
    if (isSprintCurrentlyActive(activeSprint)) {
      setShowActiveSprintDialog(true);
    } else {
      handleCreateSprint();
    }
  };
  const handleCreateSprintAfterCurrent = async () => {
    if (activeSprint) {
      // Calculate the day after current sprint ends
      const currentEndDate = new Date(activeSprint.endDate);
      currentEndDate.setDate(currentEndDate.getDate() + 1);
      const newStartDate = currentEndDate.toISOString().split('T')[0];
      
      setShowActiveSprintDialog(false);
      
      try {
        await handleCreateSprint(newStartDate);
        // Show success message for scheduled sprint
        const scheduledDate = currentEndDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        alert(`Sprint successfully scheduled to start on ${scheduledDate}!`);
      } catch (error) {
        // Error will be handled by handleCreateSprint
      }
    }
  };

  const handleCreateSprint = async (customStartDate?: string) => {
    if (!user || !sprintTitle.trim()) return;

    try {      
      // Use uploaded data if available, otherwise create basic structure
      let days;
      if (uploadedSprintData && Array.isArray(uploadedSprintData)) {
        // Transform uploaded data to match Day interface
        days = uploadedSprintData.map((day, index) => {
          const startDate = new Date(customStartDate || new Date().toISOString().split('T')[0]);
          const dayDate = new Date(startDate);
          dayDate.setDate(dayDate.getDate() + index);
          const date = day.date || dayDate.toISOString().split('T')[0];
          
          // Separate core and special tasks
          const coreTasks = day.tasks
            .filter(task => task.isCore)
            .map(task => ({ category: task.type, description: task.title }));
          
          const specialTasks = day.tasks
            .filter(task => !task.isCore)
            .map(task => task.title);
          
          return {
            day: day.day.toString() || `Day ${index + 1}`,
            date,
            coreTasks,
            specialTasks,
          };
        });
      } else {
        // Create days structure with default tasks for manual entry
        days = Array.from({ length: sprintType === '15-day' ? 15 : 30 }, (_, i) => {
          const startDate = new Date(customStartDate || new Date().toISOString().split('T')[0]);
          const dayDate = new Date(startDate);
          dayDate.setDate(dayDate.getDate() + i);
          return {
            day: `Day ${i + 1}`,
            date: dayDate.toISOString().split('T')[0], // YYYY-MM-DD format
            coreTasks: [
            ],
            specialTasks: [
            ],
          };
        });
      }

      const sprintData: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'> = {
        title: sprintTitle,
        description: sprintDescription,
        userId: user.uid,
        duration: days.length <= 15 ? 15 : 30,
        startDate: customStartDate || new Date().toISOString().split('T')[0],
        endDate: (() => {
          const startDate = new Date(customStartDate || new Date().toISOString().split('T')[0]);
          startDate.setDate(startDate.getDate() + (days.length - 1));
          return startDate.toISOString().split('T')[0];
        })(),
        status: customStartDate ? 'planned' : 'active',
        days,
      };

      await createSprint(sprintData);
      router.push(`/sprint`);
    } catch (error) {
      console.error('Error creating sprint:', error);
      alert('Error creating sprint. Please try again.');
    }
  };

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
  };  if (!user) {
    return (
      <div className="elevatr-container flex items-center justify-center min-h-screen px-4">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8 elevatr-animate-fade-in">
        <Link href="/">
          <ElevatrButton variant="secondary" size="sm" className="self-start">
            <ArrowLeft className="h-5 w-5" />
          </ElevatrButton>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold elevatr-gradient-text">Create New Sprint</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            Start your journey with a structured career growth sprint
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Sprint Configuration */}
        <div className="space-y-6">
          <ElevatrCard variant="glass" className="elevatr-animate-fade-in elevatr-animate-delay-1">
            <div className="elevatr-card-header">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Sprint Details
              </h2>
            </div>
            <div className="elevatr-card-content space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-3">
                  Sprint Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={sprintTitle}
                  onChange={(e) => setSprintTitle(e.target.value)}
                  placeholder="e.g., Q2 Career Growth Sprint"                  className="w-full px-4 py-3 glass-panel rounded-lg border-0 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-3">
                  Description
                </label>
                <textarea
                  id="description"
                  value={sprintDescription}
                  onChange={(e) => setSprintDescription(e.target.value)}
                  placeholder="Describe your goals and focus areas for this sprint..."
                  rows={4}
                  className="w-full px-4 py-3 glass-panel rounded-lg border-0 bg-background/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Sprint Duration
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ElevatrButton
                    variant={sprintType === '15-day' ? 'motivation' : 'secondary'}
                    onClick={() => setSprintType('15-day')}
                    className="justify-center sm:justify-start h-12"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    15 Days
                  </ElevatrButton>
                  <ElevatrButton
                    variant={sprintType === '30-day' ? 'motivation' : 'secondary'}
                    onClick={() => setSprintType('30-day')}
                    className="justify-center sm:justify-start h-12"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    30 Days
                  </ElevatrButton>
                </div>
              </div>            </div>
          </ElevatrCard>

          <ElevatrCard variant="glass" className="elevatr-animate-fade-in elevatr-animate-delay-2">
            <div className="elevatr-card-header">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                Import Sprint Template
              </h2>
            </div>
            <div className="elevatr-card-content">
              <div className={`border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-all duration-300 ${
                uploadedSprintData 
                  ? 'border-green-400 bg-green-50 dark:bg-green-950/20' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/40'
              }`}>
                <Upload className={`h-10 w-10 mx-auto mb-4 transition-colors ${
                  uploadedSprintData ? 'text-green-600' : 'text-muted-foreground'
                }`} />
                <p className={`text-sm mb-6 transition-colors ${
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
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <ElevatrButton variant="secondary" className="min-w-[140px]">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      {uploadedSprintData ? 'Upload Different File' : 'Choose File'}
                    </label>
                  </ElevatrButton>
                  
                  {uploadedSprintData && (
                    <ElevatrButton 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => setUploadedSprintData(null)}
                      className="min-w-[80px]"
                    >
                      Clear
                    </ElevatrButton>
                  )}                </div>
              </div>
            </div>
          </ElevatrCard>
        </div>

        {/* Sprint Preview */}
        <div className="order-first xl:order-last">
          <ElevatrCard variant="glass" className="elevatr-animate-fade-in elevatr-animate-delay-3 sticky top-6">
            <div className="elevatr-card-header">
              <h2 className="text-xl font-semibold">Sprint Preview</h2>
            </div>
            <div className="elevatr-card-content">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg leading-tight">
                    {sprintTitle || 'Your Sprint Title'}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {sprintDescription || 'Sprint description will appear here'}
                  </p>
                </div>
                  <div className="bg-muted/30 rounded-xl p-4 sm:p-5 space-y-3">
                  {isSprintCurrentlyActive(activeSprint) && (
                    <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-800">
                      <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">Active Sprint Detected</span>
                      </div>
                      <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        This sprint will be scheduled after your current sprint ends
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium text-foreground">
                      {uploadedSprintData ? `${uploadedSprintData.length} days` : 
                       sprintType === '15-day' ? '15 days' : '30 days'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Total Tasks:</span>
                    <span className="font-medium text-foreground">
                      {uploadedSprintData ? 
                        uploadedSprintData.reduce((acc: number, day: UploadedDayData) => 
                          acc + (day.tasks?.length || 0), 0
                        ) + ' tasks' :
                        `${(sprintType === '15-day' ? 15 : 30) * 3} tasks (default)`
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Daily Structure:</span>
                    <span className="font-medium text-foreground text-right text-xs sm:text-sm">
                      {uploadedSprintData ? 'Custom from file' : '2 Core + 1 Special (Default)'}
                    </span>
                  </div>
                  
                  {uploadedSprintData && (
                    <div className="mt-4 pt-4 border-t border-muted-foreground/20">
                      <div className="text-xs text-green-600 dark:text-green-400 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-600 dark:bg-green-400"></div>
                        Sprint template loaded from file
                      </div>
                    </div>
                  )}
                </div>
                  <ElevatrButton
                  onClick={handleCreateSprintClick}
                  disabled={!sprintTitle.trim() || loading}
                  variant="motivation"
                  className="w-full h-12 text-base font-medium"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Create Sprint
                    </>
                  )}
                </ElevatrButton>
              </div>
            </div>
          </ElevatrCard>
        </div>
      </div>

      {/* Active Sprint Warning Dialog */}
      {showActiveSprintDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <ElevatrCard variant="glass" className="w-full max-w-md">
            <div className="elevatr-card-header">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Active Sprint Detected</h3>
                  <p className="text-sm text-muted-foreground">You already have an active sprint running</p>
                </div>
              </div>
            </div>
            <div className="elevatr-card-content space-y-4">
              {activeSprint && (
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <div className="font-medium">{activeSprint.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {activeSprint.startDate} to {activeSprint.endDate}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {activeSprint.description}
                  </div>
                </div>
              )}
              
              <p className="text-sm">
                Would you like to schedule this new sprint to start right after your current sprint ends?
              </p>
                {activeSprint && (
                <div className="text-sm bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg">
                  <div className="font-medium text-blue-900 dark:text-blue-100">New sprint will start:</div>
                  <div className="text-blue-700 dark:text-blue-300">
                    {(() => {
                      const nextDay = new Date(activeSprint.endDate);
                      nextDay.setDate(nextDay.getDate() + 1);
                      return nextDay.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>
            <div className="elevatr-card-footer flex gap-3 justify-end">
              <ElevatrButton 
                variant="secondary" 
                onClick={() => setShowActiveSprintDialog(false)}
              >
                Cancel
              </ElevatrButton>
              <ElevatrButton 
                variant="motivation" 
                onClick={handleCreateSprintAfterCurrent}
              >
                Schedule Sprint
              </ElevatrButton>
            </div>
          </ElevatrCard>
        </div>
      )}
    </div>
  );
}
