'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useSprintStore, useUserProgressStore } from '@/stores';
import { useOptimisticTasks } from '@/hooks/useDataSync';
import {
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Target, 
  TrendingUp,
  BookOpen,
  Award,
  Clock,
  Plus,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function SprintPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { loadSprint, sprints } = useSprintStore();
  const { userProgress, loadUserProgress } = useUserProgressStore();
  const { toggleTask, isUpdating } = useOptimisticTasks();
  
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState<{ dayId: string; taskType: 'core' | 'special' } | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('');

  // Get sprint from store
  const sprint = sprints.find(s => s.id === id) || null;

  useEffect(() => {
    const loadSprintData = async () => {
      if (!user || !id) return;

      try {
        setLoading(true);
        
        // Load sprint and user progress
        const sprintData = await loadSprint(id as string);
        if (sprintData && user) {
          await loadUserProgress(user.uid, sprintData.id);
        }
      } catch (error) {
        console.error('Error loading sprint data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSprintData();
  }, [user, id, loadSprint, loadUserProgress]);  const handleAddTask = async (dayId: string, taskType: 'core' | 'special') => {
    if (!sprint || !newTaskTitle.trim()) return;

    const updatedSprint = { ...sprint };
    const dayIndex = updatedSprint.days.findIndex(d => d.day === dayId);
    
    if (dayIndex === -1) return;

    if (taskType === 'core') {
      updatedSprint.days[dayIndex].coreTasks.push({
        category: newTaskCategory || 'General',
        description: newTaskTitle.trim()
      });
    } else {
      updatedSprint.days[dayIndex].specialTasks.push(newTaskTitle.trim());
    }

    setNewTaskTitle('');
    setNewTaskCategory('');
    setShowAddTask(null);

    // Update sprint in store
    try {
      const { updateSprintOptimistic } = useSprintStore.getState();
      await updateSprintOptimistic(sprint.id, { days: updatedSprint.days });
    } catch (error) {
      console.error('Error updating sprint:', error);
    }
  };
  const handleTaskToggle = async (dayId: string, taskType: 'core' | 'special', taskIndex: number, currentStatus: boolean) => {
    await toggleTask(dayId, taskType, taskIndex, currentStatus);
  };

  const getTaskStatus = (dayId: string, taskType: 'core' | 'special', taskIndex: number): boolean => {
    if (!userProgress) return false;
    
    const taskStatus = userProgress.taskStatuses.find(
      ts => ts.dayId === dayId && ts.taskType === taskType && ts.taskIndex === taskIndex
    );
    
    return taskStatus?.completed || false;
  };

  const getDayProgress = (dayId: string): number => {
    if (!sprint || !userProgress) return 0;
    
    const day = sprint.days.find(d => d.day === dayId);
    if (!day) return 0;
    
    const totalTasks = day.coreTasks.length + day.specialTasks.length;
    const completedTasks = userProgress.taskStatuses.filter(
      ts => ts.dayId === dayId && ts.completed
    ).length;
    
    return Math.round((completedTasks / totalTasks) * 100);  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  if (!sprint) {
    return (
      <div className="elevatr-container py-8 text-center">
        <h1 className="text-2xl font-bold mb-4 elevatr-gradient-text">Sprint not found</h1>
        <ElevatrButton variant="motivation">
          <Link href="/sprint">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </ElevatrButton>
      </div>
    );
  }

  const overallProgress = userProgress ? Math.round(
    (userProgress.taskStatuses.filter(ts => ts.completed).length / 
     (sprint.days.length * 3)) * 100
  ) : 0;  return (
    <div className="p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 elevatr-animate-fade-in">
          <ElevatrButton variant="secondary" size="sm">
            <Link href="/sprint">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </ElevatrButton>
        <div className="flex-1">
          <h1 className="text-3xl font-bold elevatr-gradient-text">{sprint.title}</h1>
          <p className="text-muted-foreground">{sprint.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{overallProgress}%</div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-muted flex items-center justify-center relative">
            <div 
              className="absolute inset-0 rounded-full border-4 border-primary"
              style={{
                clipPath: `polygon(50% 50%, 50% 0%, ${
                  50 + 50 * Math.cos((overallProgress / 100) * 2 * Math.PI - Math.PI / 2)
                }% ${
                  50 + 50 * Math.sin((overallProgress / 100) * 2 * Math.PI - Math.PI / 2)
                }%, 50% 50%)`
              }}
            />
            <Award className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Sprint Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <ElevatrCard variant="glass" className="elevatr-animate-fade-in elevatr-animate-delay-1">
          <div className="elevatr-card-content p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto text-primary mb-2" />
            <div className="text-2xl font-bold">{sprint.duration}</div>
            <div className="text-sm text-muted-foreground">Days</div>
          </div>
        </ElevatrCard>
        <ElevatrCard variant="glass" className="elevatr-animate-fade-in elevatr-animate-delay-2">
          <div className="elevatr-card-content p-4 text-center">
            <Target className="h-8 w-8 mx-auto text-success mb-2" />
            <div className="text-2xl font-bold">
              {userProgress?.taskStatuses.filter(ts => ts.completed).length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Tasks Done</div>
          </div>
        </ElevatrCard>
        <ElevatrCard variant="glass" className="elevatr-animate-fade-in elevatr-animate-delay-3">
          <div className="elevatr-card-content p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-badge mb-2" />
            <div className="text-2xl font-bold">
              {userProgress?.streaks.currentTaskStreak || 0}
            </div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </div>        </ElevatrCard>
        <ElevatrCard variant="glass" className="elevatr-animate-fade-in elevatr-animate-delay-4">
          <div className="elevatr-card-content p-4 text-center">
            <Clock className="h-8 w-8 mx-auto text-accent mb-2" />
            <div className="text-2xl font-bold">
              {userProgress?.stats.totalDaysCompleted || 0}
            </div>
            <div className="text-sm text-muted-foreground">Days Done</div>
          </div>
        </ElevatrCard>
      </div>      {/* Days Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sprint.days.map((day, dayIndex) => {
          const dayProgress = getDayProgress(day.day);
          const isCompleted = dayProgress === 100;
          
          return (
            <ElevatrCard 
              key={day.day} 
              variant="glass" 
              className={`p-4 elevatr-animate-fade-in elevatr-animate-delay-${Math.min(dayIndex + 5, 10)} ${isCompleted ? 'ring-2 ring-success' : ''}`}
            >
              <div className="elevatr-card-header pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold">{day.day}</span>
                    {isCompleted && <CheckCircle2 className="h-5 w-5 text-success" />}
                  </div>
                  <span className="text-sm font-normal text-muted-foreground">
                    {dayProgress}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2 transition-all duration-300"
                    style={{ width: `${dayProgress}%` }}
                  />
                </div>
              </div>
              <div className="elevatr-card-content space-y-3">
                {/* Core Tasks */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Core Tasks</h4>
                  <div className="space-y-2">
                    {day.coreTasks.map((task, index) => {
                      const isCompleted = getTaskStatus(day.day, 'core', index);
                      const isTaskUpdating = isUpdating(day.day, 'core', index);
                      
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <ElevatrButton
                            variant="secondary"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleTaskToggle(day.day, 'core', index, isCompleted)}
                            disabled={isTaskUpdating}
                          >
                            {isTaskUpdating ? (
                              <LoadingSpinner size="sm" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                          </ElevatrButton>
                          <span className={`text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {task.category}: {task.description}
                          </span>
                        </div>
                      );
                    })}
                    
                    {/* Add Core Task */}
                    {showAddTask?.dayId === day.day && showAddTask?.taskType === 'core' ? (
                      <div className="space-y-2 p-2 glass-panel rounded-md">
                        <input
                          type="text"
                          placeholder="Task category (e.g., Learning, Networking)"
                          value={newTaskCategory}
                          onChange={(e) => setNewTaskCategory(e.target.value)}
                          className="w-full p-2 text-sm glass-panel rounded border-0 focus:outline-none focus:ring-2 focus:ring-primary/50"
                          autoFocus
                        />
                        <input
                          type="text"
                          placeholder="Task description"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          className="w-full p-2 text-sm glass-panel rounded border-0 focus:outline-none focus:ring-2 focus:ring-primary/50"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTask(day.day, 'core')}
                        />
                        <div className="flex gap-2">
                          <ElevatrButton 
                            size="sm" 
                            onClick={() => handleAddTask(day.day, 'core')}
                            disabled={!newTaskTitle.trim()}
                            variant="motivation"
                          >
                            Add
                          </ElevatrButton>
                          <ElevatrButton 
                            size="sm" 
                            variant="secondary" 
                            onClick={() => setShowAddTask(null)}
                          >
                            <X className="h-4 w-4" />
                          </ElevatrButton>
                        </div>
                      </div>
                    ) : (
                      <ElevatrButton
                        variant="primary"
                        size="sm"
                        className="w-full justify-center text-muted-foreground "
                        onClick={() => setShowAddTask({ dayId: day.day, taskType: 'core' })}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Core Task
                      </ElevatrButton>
                    )}
                  </div>
                </div>

                {/* Special Tasks */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Special Tasks</h4>
                  <div className="space-y-2">
                    {day.specialTasks.map((task, index) => {
                      const isCompleted = getTaskStatus(day.day, 'special', index);
                      const isTaskUpdating = isUpdating(day.day, 'special', index);
                      
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <ElevatrButton
                            variant="secondary"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleTaskToggle(day.day, 'special', index, isCompleted)}
                            disabled={isTaskUpdating}
                          >
                            {isTaskUpdating ? (
                              <LoadingSpinner size="sm" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-success" />
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                          </ElevatrButton>
                          <span className={`text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {task}
                          </span>
                        </div>
                      );
                    })}
                    
                    {/* Add Special Task */}
                    {showAddTask?.dayId === day.day && showAddTask?.taskType === 'special' ? (
                      <div className="space-y-2 p-2 glass-panel rounded-md">
                        <input
                          type="text"
                          placeholder="Special task description"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          className="w-full p-2 text-sm glass-panel rounded border-0 focus:outline-none focus:ring-2 focus:ring-primary/50"
                          autoFocus
                          onKeyPress={(e) => e.key === 'Enter' && handleAddTask(day.day, 'special')}
                        />
                        <div className="flex gap-2">
                          <ElevatrButton 
                            size="sm" 
                            onClick={() => handleAddTask(day.day, 'special')}
                            disabled={!newTaskTitle.trim()}
                            variant="motivation"
                          >
                            Add
                          </ElevatrButton>
                          <ElevatrButton 
                            size="sm" 
                            variant="secondary" 
                            onClick={() => setShowAddTask(null)}
                          >
                            <X className="h-4 w-4" />
                          </ElevatrButton>
                        </div>
                      </div>
                    ) : (
                      <ElevatrButton
                        variant="primary"
                        size="sm"
                        className="w-full justify-center text-muted-foreground "
                        onClick={() => setShowAddTask({ dayId: day.day, taskType: 'special' })}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Special Task
                      </ElevatrButton>
                    )}
                  </div>
                </div>

                {/* Journal Entry Link */}
                <div className="pt-2 border-t">
                  <ElevatrButton variant="success" size="sm" className="w-full justify-center elevatr-gradient-journal text-white">
                    <Link className='flex items-center' href={`/journal/${day.day}`}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      <p>{day.day} Journal</p>
                    </Link>
                  </ElevatrButton>
                </div>
              </div>
            </ElevatrCard>
          );
        })}
      </div>
    </div>
  );
}
