'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getSprint, getUserProgress, updateTaskStatus } from '@/services/firebase';
import { Sprint, UserProgress, TaskStatus } from '@/types';
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Target, 
  TrendingUp,
  BookOpen,
  Award,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function SprintPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const loadSprintData = async () => {
      if (!user || !id) return;

      try {
        setLoading(true);
        const [sprintData, progressData] = await Promise.all([
          getSprint(id as string),
          getUserProgress(user.uid, id as string),
        ]);

        setSprint(sprintData);
        setUserProgress(progressData);
      } catch (error) {
        console.error('Error loading sprint data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSprintData();
  }, [user, id]);
  const handleTaskToggle = async (dayId: string, taskType: 'core' | 'special', taskIndex: number, currentStatus: boolean) => {
    if (!user || !sprint) return;

    const taskKey = `${dayId}-${taskType}-${taskIndex}`;
    setUpdating(taskKey);

    try {
      const taskStatus: TaskStatus = {
        dayId,
        taskType,
        taskIndex,
        completed: !currentStatus,
        completedAt: !currentStatus ? new Date().toISOString() : null,
        updatedAt: new Date(),
      };

      await updateTaskStatus(user.uid, sprint.id, taskStatus);

      // Update local state
      setUserProgress(prev => {
        if (!prev) return prev;
        
        const existingIndex = prev.taskStatuses.findIndex(
          ts => ts.dayId === dayId && ts.taskType === taskType && ts.taskIndex === taskIndex
        );

        const newTaskStatuses = [...prev.taskStatuses];
        if (existingIndex >= 0) {
          newTaskStatuses[existingIndex] = taskStatus;
        } else {
          newTaskStatuses.push(taskStatus);
        }

        return {
          ...prev,
          taskStatuses: newTaskStatuses,
        };
      });
    } catch (error) {
      console.error('Error updating task status:', error);
    } finally {
      setUpdating(null);
    }
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
    
    return Math.round((completedTasks / totalTasks) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="container mx-auto px-6 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Sprint not found</h1>
        <Button asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  const overallProgress = userProgress ? Math.round(
    (userProgress.taskStatuses.filter(ts => ts.completed).length / 
     (sprint.days.length * 3)) * 100
  ) : 0;  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{sprint.title}</h1>
          <p className="text-muted-foreground">{sprint.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold">{overallProgress}%</div>
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
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-bold">{sprint.duration}</div>
            <div className="text-sm text-muted-foreground">Days</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <div className="text-2xl font-bold">
              {userProgress?.taskStatuses.filter(ts => ts.completed).length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Tasks Done</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-orange-500 mb-2" />
            <div className="text-2xl font-bold">
              {userProgress?.streaks.currentTaskStreak || 0}
            </div>
            <div className="text-sm text-muted-foreground">Day Streak</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto text-purple-500 mb-2" />
            <div className="text-2xl font-bold">
              {userProgress?.stats.totalDaysCompleted || 0}
            </div>
            <div className="text-sm text-muted-foreground">Days Done</div>
          </CardContent>
        </Card>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sprint.days.map((day) => {
          const dayProgress = getDayProgress(day.day);
          const isCompleted = dayProgress === 100;
          
          return (
            <Card key={day.day} className={`${isCompleted ? 'ring-2 ring-green-500' : ''}`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    Day {day.day}
                    {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {dayProgress}%
                  </span>
                </CardTitle>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2 transition-all duration-300"
                    style={{ width: `${dayProgress}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Core Tasks */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Core Tasks</h4>
                  <div className="space-y-2">
                    {day.coreTasks.map((task, index) => {
                      const isCompleted = getTaskStatus(day.day, 'core', index);
                      const taskKey = `${day.day}-core-${index}`;
                      const isUpdating = updating === taskKey;
                      
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0"
                            onClick={() => handleTaskToggle(day.day, 'core', index, isCompleted)}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <LoadingSpinner size="sm" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                          </Button>
                          <span className={`text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {task.category}: {task.description}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Special Tasks */}
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Special Tasks</h4>
                  <div className="space-y-2">
                    {day.specialTasks.map((task, index) => {
                      const isCompleted = getTaskStatus(day.day, 'special', index);
                      const taskKey = `${day.day}-special-${index}`;
                      const isUpdating = updating === taskKey;
                      
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0"
                            onClick={() => handleTaskToggle(day.day, 'special', index, isCompleted)}
                            disabled={isUpdating}
                          >
                            {isUpdating ? (
                              <LoadingSpinner size="sm" />
                            ) : isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                          </Button>
                          <span className={`text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {task}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Journal Entry Link */}
                <div className="pt-2 border-t">
                  <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                    <Link href={`/journal/${day.day}`}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Day {day.day} Journal
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );        })}
      </div>
    </div>
  );
}
