'use client';

import { useState, useEffect, useCallback } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { CheckCircle2, Circle, BookOpen, Calendar, Target, Sparkles } from 'lucide-react';
import { Sprint, UserProgress, TaskStatus } from '@/types';
import { useUserProgressStore } from '@/stores/userProgressStore';

interface DayDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sprint: Sprint | null;
  userProgress: UserProgress | null;
  sprintDay: string;
  date: Date;
  userId: string;
}

export function DayDetailsDialog({
  isOpen,
  onClose,
  sprint,
  userProgress,
  sprintDay,
  date,
  userId
}: DayDetailsDialogProps) {
  const [journalContent, setJournalContent] = useState('');
  const [saving, setSaving] = useState(false);

  // Use global user progress store actions
  const updateTaskStatusOptimistic = useUserProgressStore(state => state.updateTaskStatusOptimistic);
  const updateJournalOptimistic = useUserProgressStore(state => state.updateJournalOptimistic);

  // All hooks must be called before any return
  const getTaskStatus = useCallback((taskType: 'core' | 'special', taskIndex: number): TaskStatus | undefined => {
    return userProgress?.taskStatuses.find(
      ts => ts.dayId === `Day ${sprintDay}` && ts.taskType === taskType && ts.taskIndex === taskIndex
    );
  }, [userProgress, sprintDay]);

  const handleTaskToggle = useCallback(async (taskType: 'core' | 'special', taskIndex: number, task: string) => {
    if (!sprint) return;
    try {
      setSaving(true);
      const currentStatus = getTaskStatus(taskType, taskIndex);
      await updateTaskStatusOptimistic(
        userId,
        sprint.id,
        `Day ${sprintDay}`,
        taskType,
        taskIndex,
        !currentStatus?.completed
      );
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setSaving(false);
    }
  }, [userId, sprint, sprintDay, userProgress, updateTaskStatusOptimistic, getTaskStatus]);

  const handleJournalSave = useCallback(async () => {
    if (!sprint) return;
    try {
      setSaving(true);
      await updateJournalOptimistic(
        userId,
        sprint.id,
        `Day ${sprintDay}`,
        journalContent
      );
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      setSaving(false);
    }
  }, [userId, sprint, sprintDay, journalContent, updateJournalOptimistic]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Initialize journal content when dialog opens
  useEffect(() => {
    if (isOpen && userProgress) {
      const existingJournal = userProgress.journalEntries.find(entry => entry.dayId == `Day ${sprintDay}`);
      setJournalContent(existingJournal?.content || '');
    }
  }, [isOpen, userProgress, sprintDay]);

  // Debug logs to trace why dialog might not render
  if (!sprint) {
    console.log('DayDetailsDialog: sprint is null');
    return null;
  }
  if (!userProgress) {
    console.log('DayDetailsDialog: userProgress is null');
    return null;
  }
  console.log('DayDetailsDialog: sprint.days =', sprint.days, 'sprintDay =', sprintDay);
  console.log('DayDetailsDialog: sprint.days day values =', sprint.days.map(d => d.day));
  const day = sprint.days.find(d => d.day === `Day ${sprintDay}`);
  if (!day) {
    console.log('DayDetailsDialog: day not found for sprintDay', sprintDay);
    return null;
  }
  const existingJournal = userProgress.journalEntries.find(entry => entry.dayId == sprintDay);

  const completedTasks = day.coreTasks.length + day.specialTasks.length;
  const completedCount = userProgress.taskStatuses.filter(
    ts => ts.dayId === sprintDay && ts.completed
  ).length;  return (
    
    
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Day ${sprintDay} - ${formatDate(date)}`}
      size="xl"
    >
      <div className="m-auto space-y-3 sm:space-y-4 lg:space-y-5 max-h-full">        
        {/* Day Header */}
        <div className="p-3 sm:p-4 lg:p-5 rounded-xl border border-primary/30 dark:border-primary/30 shadow-sm dark:shadow-md bg-white/80 dark:bg-slate-800/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 lg:gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-primary shrink-0" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sprint Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {completedCount}/{completedTasks} Tasks Complete
              </div>
              {completedCount === completedTasks && completedTasks > 0 && (
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-success shrink-0" />
              )}
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
          {/* Core Tasks */}
        {day.coreTasks.length > 0 && (
          <ElevatrCard variant="glass" className="border-primary/30 dark:border-primary/30 bg-white/90 dark:bg-slate-800/80">
            <div className="elevatr-card-header bg-primary/8 dark:bg-primary/10 border-primary/20 dark:border-primary/25">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2.5 text-slate-900 dark:text-slate-100">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
                Core Tasks
                <span className="text-sm font-normal text-slate-700 dark:text-slate-400">
                  ({day.coreTasks.filter((_, i) => getTaskStatus('core', i)?.completed).length}/{day.coreTasks.length})
                </span>
              </h3>
            </div>
            
            <div className="elevatr-card-content">
              <div className="grid gap-2 sm:gap-3 lg:gap-4 grid-cols-1 xl:grid-cols-2">
                {day.coreTasks.map((task, index) => {
                    const taskStatus = getTaskStatus('core', index);
                    const isCompleted = taskStatus?.completed || false;
                    const toggleTask = () => handleTaskToggle('core', index, task.description);
                    
                    return (                      
                    
                    <div
                        key={index}
                        className={`
                          flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.005] active:scale-[0.995] bg-white dark:bg-slate-700/80
                          ${isCompleted 
                            ? 'border-success/30 dark:border-success/40 shadow-success/10 text-slate-700 dark:text-slate-300' 
                            : 'border-slate-300 dark:border-slate-600 hover:border-primary/50 hover:bg-primary/10 dark:hover:bg-primary/12 shadow-sm'
                          }
                        `}
                        onClick={toggleTask}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleTask();
                          }}
                          disabled={saving}
                          className="mt-0.5 disabled:opacity-50 hover:scale-110 transition-transform shrink-0"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-success" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-400 dark:text-slate-500 hover:text-primary" />
                          )}
                        </button>                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-accent dark:text-accent mb-1">
                            {task.category}
                          </div>
                          <div className={`text-sm leading-relaxed ${isCompleted ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                            {task.description}
                          </div>
                          {taskStatus?.completedAt && (
                            <div className="text-xs text-success mt-1.5 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Completed {new Date(taskStatus.completedAt).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                })}
              </div>
            </div>
          </ElevatrCard>
        )}        
        
        
        {/* Special Tasks */}
        {day.specialTasks.length > 0 && (
          <ElevatrCard variant="glass" className="border-accent/30 dark:border-accent/30 bg-white/90 dark:bg-slate-800/80">
            <div className="elevatr-card-header bg-accent/8 dark:bg-accent/10 border-accent/20 dark:border-accent/25">
              <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2.5 text-slate-900 dark:text-slate-100">
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-accent shrink-0" />
                Special Tasks
                <span className="text-sm font-normal text-slate-700 dark:text-slate-400">
                  ({day.specialTasks.filter((_, i) => getTaskStatus('special', i)?.completed).length}/{day.specialTasks.length})
                </span>
              </h3>
            </div>
            
            
            <div className="elevatr-card-content">
              <div className="grid gap-2 sm:gap-3 lg:gap-4 grid-cols-1 xl:grid-cols-2">
                {day.specialTasks.map((task, index) => {
                const taskStatus = getTaskStatus('special', index);
                const isCompleted = taskStatus?.completed || false;
                const toggleTask = () => handleTaskToggle('special', index, task);
                
                return (                  
                
                <div
                    key={index}
                       className={`
                          flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.005] active:scale-[0.995] bg-white dark:bg-slate-700/80
                          ${isCompleted 
                            ? 'border-success/30 dark:border-success/40 shadow-success/10 text-slate-700 dark:text-slate-300' 
                            : 'border-slate-300 dark:border-slate-600 hover:border-primary/50 hover:bg-primary/10 dark:hover:bg-primary/12 shadow-sm'
                          }
                        `}
                    onClick={toggleTask}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTask();
                      }}
                      disabled={saving}
                      className="mt-0.5 disabled:opacity-50 hover:scale-110 transition-transform shrink-0"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-400 dark:text-slate-500 hover:text-accent" />
                      )}
                    </button>                    
                    
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm leading-relaxed ${isCompleted ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {task}
                      </div>
                      {taskStatus?.completedAt && (
                        <div className="text-xs text-success mt-1.5 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Completed {new Date(taskStatus.completedAt).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </ElevatrCard>
        )}        
        </div>
          
          {/* Journal Section */}
        <ElevatrCard variant="glass" className="border-accent/30 dark:border-accent/30 bg-white/90 dark:bg-slate-800/80">
          <div className="elevatr-card-header bg-accent/8 dark:bg-accent/10 border-accent/20 dark:border-accent/25">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2.5 text-slate-900 dark:text-slate-100">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-accent shrink-0" />
              Daily Journal
              {existingJournal && (
                <span className="text-sm font-normal text-slate-700 dark:text-slate-400">
                  (Saved)
                </span>
              )}
            </h3>
          </div>
          
          <div className="elevatr-card-content space-y-3 sm:space-y-4">
            <div className="relative">              <textarea
                value={journalContent}
                onChange={(e) => setJournalContent(e.target.value)}
                placeholder="How did today go? What did you learn? What challenges did you face? What would you do differently?"
                className="w-full min-h-[100px] sm:min-h-[120px] lg:min-h-[140px] p-3 sm:p-4 border-2 border-slate-300 dark:border-slate-600 rounded-xl 
                          bg-white dark:bg-slate-700/90 resize-y 
                          focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 
                          transition-all text-sm leading-relaxed text-slate-800 dark:text-slate-200
                          placeholder:text-slate-500 dark:placeholder:text-slate-400"
                maxLength={2000}
              />
              <div className="absolute bottom-3 right-3 text-xs text-slate-600 dark:text-slate-400 bg-white/95 dark:bg-slate-800/90 px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600">
                {journalContent.length}/2000
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">              <div className="flex items-center gap-2">
                {existingJournal && (
                  <div className="text-xs text-slate-700 dark:text-slate-300 bg-success/15 dark:bg-success/25 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1 border border-success/30 dark:border-success/40">
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    <span className="hidden sm:inline">Last updated:</span>
                    <span className="sm:hidden">Updated:</span>
                    {new Date(existingJournal.updatedAt as any).toLocaleDateString()}
                  </div>
                )}
              </div>
              <ElevatrButton
                variant="accent"
                size="sm"
                onClick={handleJournalSave}
                disabled={saving || !journalContent.trim()}
                loading={saving}
                className="sm:w-auto w-full min-w-[120px] sm:min-w-[140px]"
              >
                {saving ? 'Saving...' : existingJournal ? 'Update Journal' : 'Save Journal Entry'}
              </ElevatrButton>
            </div>
          </div>
        </ElevatrCard>
      </div>
    </Dialog>
  );
}
