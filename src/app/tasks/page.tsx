'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { Plus, CheckCircle, Clock, AlertCircle, Filter, Brain, BarChart3, Calendar, CalendarDays, X, ChevronDown } from 'lucide-react';
import { Task, TaskPriority } from '@/types';
import { useTaskStore, useSprintStore, useUserProgressStore } from '@/stores';
import { format, isToday, isSameDay, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Tooltip } from '@/components/ui/Tooltip';
import { SmartTaskSuggestions } from '@/components/tasks/SmartTaskSuggestions';
import { useRouter } from 'next/navigation';

export default function TasksPage() {
  const { user } = useAuth();
  const { tasks, loading, updateTaskOptimistic, addTask } = useTaskStore();
  const { sprints, activeSprint, loadActiveSprint } = useSprintStore();
  const { userProgress } = useUserProgressStore();
  const router = useRouter();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'blocked'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [dueSoonFilter, setDueSoonFilter] = useState(false);
  const [showSmartSuggestions, setShowSmartSuggestions] = useState(true);
  
  // Date filtering state
  const [dateFilter, setDateFilter] = useState<'today' | 'custom' | 'all'>('today');
  const [customStartDate, setCustomStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [customEndDate, setCustomEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');

  useEffect(() => {
    if (user?.uid) {
      loadActiveSprint(user.uid);
    }
  }, [user?.uid, loadActiveSprint]);

  // Helper function to convert Date or Timestamp to Date
  const toDate = (dateValue: Date | { toDate?: () => Date }): Date => {
    if (dateValue instanceof Date) {
      return dateValue;
    }
    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    }
    return new Date();
  };
  const handleToggleTask = async (task: Task) => {
    if (!user) return;

    const newStatus: 'active' | 'completed' | 'blocked' = task.status === 'completed' ? 'active' : 'completed';

    try {
      await updateTaskOptimistic(task.id, {
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date() : null,
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleNewTaskClick = () => setShowNewTaskModal(true);
  const handleCloseNewTaskModal = () => {
    setShowNewTaskModal(false);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskPriority('medium');
  };
  const handleCreateTask = async () => {
    if (!user || !newTaskTitle.trim()) return;

    try {
      const today = new Date();
      const todayDayId = format(today, 'yyyy-MM-dd');
      
      const newTask = {
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim() || undefined,
        status: 'active' as const,
        priority: newTaskPriority,
        sprintId: activeSprint?.id,
        dayId: todayDayId,
        dueDate: today,
        createdAt: today,
        updatedAt: today,
      };

      await addTask(newTask);
      handleCloseNewTaskModal();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleClearAllFilters = () => {
    setDateFilter('today');
    setFilter('all');
    setPriorityFilter('all');
    setDueSoonFilter(false);
    setCustomStartDate(format(new Date(), 'yyyy-MM-dd'));
    setCustomEndDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const hasActiveFilters = dateFilter !== 'today' || filter !== 'all' || priorityFilter !== 'all' || dueSoonFilter;

  // Date filtering helper functions
  const isTaskInDateRange = (task: Task): boolean => {
    if (dateFilter === 'all') return true;
    
    const taskDate = task.dueDate ? toDate(task.dueDate) : toDate(task.createdAt);
    
    if (dateFilter === 'today') {
      return isToday(taskDate);
    }
    
    if (dateFilter === 'custom') {
      const startDate = startOfDay(new Date(customStartDate));
      const endDate = endOfDay(new Date(customEndDate));
      return isWithinInterval(taskDate, { start: startDate, end: endDate });
    }
    
    return true;
  };
  
  const handleApplyTaskSuggestion = async (taskId: string, newPriority: 'low' | 'medium' | 'high') => {
    if (!user) return;

    try {
      await updateTaskOptimistic(taskId, {
        priority: newPriority,
      });
    } catch (error) {
      console.error('Error updating task priority:', error);
    }
  };

  const isDueSoon = (dueDate: Date | { toDate?: () => Date }) => {
    const date = toDate(dueDate);
    const now = new Date();
    const soon = new Date();
    soon.setDate(now.getDate() + 3);
    return date >= now && date <= soon;
  };
  const filteredTasks = tasks.filter((task: Task) => {
    if (filter !== 'all' && task.status !== filter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    if (dueSoonFilter && (!task.dueDate || !isDueSoon(task.dueDate))) return false;
    if (!isTaskInDateRange(task)) return false;
    return true;
  });

  const getStatusIcon = (status: 'active' | 'completed' | 'blocked') => {
    switch (status) {
      case 'completed':
        return (
          <Tooltip content="Completed">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          </Tooltip>
        );
      case 'active':
        return (
          <Tooltip content="Active">
            <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </Tooltip>
        );
      case 'blocked':
        return (
          <Tooltip content="Blocked">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </Tooltip>
        );
      default:
        return (
          <Tooltip content="Unknown">
            <Clock className="w-5 h-5 text-muted-foreground" />
          </Tooltip>
        );
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'bg-destructive/20 text-destructive border-destructive/20';
      case 'medium': return 'bg-badge/20 text-badge border-badge/20';
      case 'low': return 'bg-success/20 text-success border-success/20';
      default: return 'bg-muted/20 text-muted-foreground border-muted/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 max-w-full overflow-x-hidden">      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 elevatr-animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold elevatr-gradient-text">
            Tasks {dateFilter === 'today' ? '- Today' : dateFilter === 'custom' ? `- ${format(new Date(customStartDate), 'MMM d')} to ${format(new Date(customEndDate), 'MMM d')}` : ''}
          </h1>
          <p className="text-muted-foreground mt-1">
            {dateFilter === 'today' 
              ? "Focus on today's career development tasks with AI insights"
              : "Manage your career development tasks with AI insights"
            }
          </p>
        </div>
        <div className="flex gap-2">
          <ElevatrButton 
            variant="secondary" 
            size="sm"
            onClick={() => router.push('/insights')}
          >
            <Brain className="w-4 h-4 mr-2" />
            Advanced Insights
          </ElevatrButton>
          <ElevatrButton variant="motivation" onClick={handleNewTaskClick}>
            <Plus className="w-4 h-4 mr-2" />
            New Task          </ElevatrButton>
        </div>
      </div>

      {/* Filter Summary Banner */}
      {hasActiveFilters && (
        <div className="mb-6 elevatr-animate-fade-in">
          <ElevatrCard variant="glass" className="border-l-4 border-l-primary bg-primary/5">
            <div className="elevatr-card-content py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-full bg-primary/10">
                    <Filter className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Active Filters: {filteredTasks.length} of {tasks.length} tasks shown
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {dateFilter !== 'today' && `Date: ${dateFilter === 'custom' ? `${format(new Date(customStartDate), 'MMM d')} - ${format(new Date(customEndDate), 'MMM d')}` : 'All dates'}`}
                      {filter !== 'all' && ` • Status: ${filter}`}
                      {priorityFilter !== 'all' && ` • Priority: ${priorityFilter}`}
                      {dueSoonFilter && ` • Due within 3 days`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClearAllFilters}
                  className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  Reset to Today
                </button>
              </div>
            </div>
          </ElevatrCard>
        </div>
      )}{/* Enhanced Filters */}
        <div className="mb-6 space-y-4">
          {/* Primary Filters Row */}
          <ElevatrCard variant="glass" className="overflow-hidden">
            <div className="elevatr-card-content">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Date Filter - Most Prominent */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground">Date Range</h3>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <div className="relative">
                        <select
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value as 'today' | 'custom' | 'all')}
                          className="w-full appearance-none glass-panel border border-border/50 rounded-lg px-4 py-3 text-sm bg-background/80 hover:bg-background/90 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all cursor-pointer"
                        >
                          <option value="today">📅 Today Only</option>
                          <option value="custom">📊 Custom Range</option>
                          <option value="all">🗓️ All Dates</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      </div>
                    </div>
                    
                    {dateFilter === 'custom' && (
                      <div className="flex flex-col sm:flex-row gap-2 flex-1">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-muted-foreground mb-1">From</label>
                          <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="w-full glass-panel border border-border/50 rounded-lg px-3 py-2 text-sm bg-background/80 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-muted-foreground mb-1">To</label>
                          <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="w-full glass-panel border border-border/50 rounded-lg px-3 py-2 text-sm bg-background/80 focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Priority Filters */}
                <div className="flex flex-col sm:flex-row gap-4 lg:w-96">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-md bg-accent/10">
                        <Filter className="w-3.5 h-3.5 text-accent" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Status</span>
                    </div>
                    <div className="relative">
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed' | 'blocked')}
                        className="w-full appearance-none glass-panel border border-border/50 rounded-lg px-3 py-2.5 text-sm bg-background/80 hover:bg-background/90 focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all cursor-pointer"
                      >
                        <option value="all">All Status</option>
                        <option value="active">🔵 Active</option>
                        <option value="completed">✅ Completed</option>
                        <option value="blocked">🚫 Blocked</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 rounded-md bg-motivation/10">
                        <AlertCircle className="w-3.5 h-3.5 text-motivation" />
                      </div>
                      <span className="text-sm font-medium text-foreground">Priority</span>
                    </div>
                    <div className="relative">
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
                        className="w-full appearance-none glass-panel border border-border/50 rounded-lg px-3 py-2.5 text-sm bg-background/80 hover:bg-background/90 focus:ring-2 focus:ring-motivation/50 focus:border-motivation/50 transition-all cursor-pointer"
                      >
                        <option value="all">All Priority</option>
                        <option value="high">🔴 High</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="low">🟢 Low</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ElevatrCard>

          {/* Secondary Filters & Stats Row */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Due Soon Toggle */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={dueSoonFilter}
                    onChange={() => setDueSoonFilter(v => !v)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors ${
                    dueSoonFilter ? 'bg-primary' : 'bg-muted'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                      dueSoonFilter ? 'translate-x-5' : 'translate-x-0.5'
                    } mt-0.5`}></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-foreground">Due Soon (3 days)</span>
                </div>
              </label>
            </div>            {/* Active Filters & Stats */}
            <div className="flex items-center gap-4">
              {/* Active Filters Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {dateFilter !== 'today' && (
                  <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                    <Calendar className="w-3 h-3" />
                    <span>{dateFilter === 'custom' ? 'Custom Range' : 'All Dates'}</span>
                    <button
                      onClick={() => setDateFilter('today')}
                      className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {filter !== 'all' && (
                  <div className="flex items-center gap-1 bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium">
                    <span className="capitalize">{filter}</span>
                    <button
                      onClick={() => setFilter('all')}
                      className="ml-1 hover:bg-accent/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {priorityFilter !== 'all' && (
                  <div className="flex items-center gap-1 bg-motivation/10 text-motivation px-3 py-1 rounded-full text-xs font-medium">
                    <span className="capitalize">{priorityFilter}</span>
                    <button
                      onClick={() => setPriorityFilter('all')}
                      className="ml-1 hover:bg-motivation/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {dueSoonFilter && (
                  <div className="flex items-center gap-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-medium">
                    <Clock className="w-3 h-3" />
                    <span>Due Soon</span>
                    <button
                      onClick={() => setDueSoonFilter(false)}
                      className="ml-1 hover:bg-orange-500/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                {/* Clear All Filters Button */}
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAllFilters}
                    className="flex items-center gap-1 bg-muted/50 hover:bg-muted/70 text-muted-foreground hover:text-foreground px-3 py-1 rounded-full text-xs font-medium transition-colors"
                  >
                    <X className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>

              {/* Results Counter */}
              <div className="text-sm text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-lg border border-border/30">
                <span className="font-medium text-foreground">{filteredTasks.length}</span> of {tasks.length} tasks
              </div>
            </div>
          </div>
        </div>{/* Task Stats */}
        {(() => {
          const stats = [
            {
              label: dateFilter === 'today' ? 'Today\'s Tasks' : 'Total Tasks',
              value: filteredTasks.length,
              icon: <Clock className="w-6 h-6 text-primary" />, 
              theme: 'primary',
              bg: 'bg-primary/10',
            },
            {
              label: 'Active',
              value: filteredTasks.filter((t: Task) => t.status === 'active').length,
              icon: <Clock className="w-6 h-6 text-accent" />, 
              theme: 'accent',
              bg: 'bg-accent/10',
            },
            {
              label: 'Completed',
              value: filteredTasks.filter((t: Task) => t.status === 'completed').length,
              icon: <CheckCircle className="w-6 h-6 text-success" />, 
              theme: 'success',
              bg: 'bg-success/10',
            },
            {
              label: 'Blocked',
              value: filteredTasks.filter((t: Task) => t.status === 'blocked').length,
              icon: <AlertCircle className="w-6 h-6 text-destructive" />, 
              theme: 'destructive',
              bg: 'bg-destructive/10',
            },
          ];
          return (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-10">
              {stats.map((stat, idx) => (
                <ElevatrCard
                  key={stat.label}
                  variant="stat"
                  theme={stat.theme as any}
                  className={`elevatr-animate-fade-in elevatr-animate-delay-${idx + 2} shadow-md hover:shadow-xl transition-shadow group border border-transparent px-3 py-4 sm:px-6 sm:py-6`}
                >
                  <div className="elevatr-card-content flex flex-col gap-2 p-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-2xl sm:text-3xl font-extrabold group-hover:text-primary transition-colors">{stat.value}</p>
                      </div>
                      <div className={`p-2 sm:p-3 rounded-full ${stat.bg} transition-colors group-hover:scale-110`}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                </ElevatrCard>
              ))}
            </div>
          );        })()}        {/* Smart Task Suggestions */}
        {showSmartSuggestions && tasks.length > 0 && (
          <SmartTaskSuggestions
            tasks={tasks}
            sprints={sprints || []}
            userProgress={userProgress ? [userProgress] : []}
            onApplySuggestion={handleApplyTaskSuggestion}
            className="mb-8"
          />
        )}

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <ElevatrCard variant="glass" className="text-center">
              <div className="elevatr-card-content py-8">
                <p className="text-muted-foreground mb-4">No tasks found</p>
                <p className="text-primary font-semibold mb-4">Every big journey starts with a single step. Create your first task!</p>
                <ElevatrButton variant="motivation" onClick={handleNewTaskClick}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first task
                </ElevatrButton>
              </div>
            </ElevatrCard>
          ) : (
            filteredTasks.map((task: Task, index) => (
              <ElevatrCard
                key={task.id}
                variant="interactive"
                hover
                className={`elevatr-animate-fade-in elevatr-animate-delay-${Math.min(index + 1, 6)} transition-shadow hover:shadow-lg hover:border-primary/40 cursor-pointer`}
                onClick={() => {/* Placeholder: open task details modal */}}
              >
                <div className="elevatr-card-content">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <button
                        onClick={e => { e.stopPropagation(); handleToggleTask(task); }}
                        className="mt-1 transition-colors hover:scale-105"
                        aria-label="Toggle task status"
                      >
                        {getStatusIcon(task.status)}
                      </button>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${
                          task.status === 'completed' 
                            ? 'line-through text-muted-foreground' 
                            : 'text-foreground'
                        }`}>
                          {task.title}
                        </h3>
                        {task.description && (
                          <p className="text-muted-foreground mt-1">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          {task.dueDate && (
                            <span className="text-sm text-muted-foreground">
                              Due: {format(toDate(task.dueDate), 'MMM d, yyyy')}
                            </span>
                          )}
                          {task.category && (
                            <span className="text-sm text-muted-foreground">
                              {task.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ElevatrCard>
            ))
          )}
        </div>        {/* New Task Modal */}
        {showNewTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <ElevatrCard className="w-full max-w-md">
              <div className="elevatr-card-content">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold elevatr-gradient-text">Create New Task</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays className="w-4 h-4" />
                    <span>Today - {format(new Date(), 'MMM d, yyyy')}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Task Title <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Enter task title..."
                      className="w-full glass-panel border-0 rounded-md px-3 py-2 text-sm bg-background/50 focus:ring-2 focus:ring-primary/50"
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      placeholder="Enter task description..."
                      rows={3}
                      className="w-full glass-panel border-0 rounded-md px-3 py-2 text-sm bg-background/50 focus:ring-2 focus:ring-primary/50 resize-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Priority
                    </label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as TaskPriority)}
                      className="w-full glass-panel border-0 rounded-md px-3 py-2 text-sm bg-background/50"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                  
                  {activeSprint && (
                    <div className="text-sm text-muted-foreground bg-primary/10 p-3 rounded-md">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-primary" />
                        <span>Will be added to active sprint: <strong>{activeSprint.title}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 mt-6">
                  <ElevatrButton 
                    variant="secondary" 
                    onClick={handleCloseNewTaskModal}
                    className="flex-1"
                  >
                    Cancel
                  </ElevatrButton>
                  <ElevatrButton 
                    variant="motivation" 
                    onClick={handleCreateTask}
                    disabled={!newTaskTitle.trim()}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Task
                  </ElevatrButton>
                </div>
              </div>
            </ElevatrCard>
          </div>
        )}
    </div>
  );
}
