'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ElevatrButton } from '@/components/ui/ElevatrButton';
import { ElevatrCard } from '@/components/ui/ElevatrCard';
import { Plus, CheckCircle, Clock, AlertCircle, Filter } from 'lucide-react';
import { Task, TaskPriority } from '@/types';
import { useTaskStore } from '@/stores';
import { format } from 'date-fns';
import { Tooltip } from '@/components/ui/Tooltip';

export default function TasksPage() {
  const { user } = useAuth();
  const { tasks, loading, updateTaskOptimistic } = useTaskStore();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'blocked'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [dueSoonFilter, setDueSoonFilter] = useState(false);

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
  const handleCloseNewTaskModal = () => setShowNewTaskModal(false);

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
    <div className="min-h-screen p-4 sm:p-6 md:p-8 max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 elevatr-animate-fade-in">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold elevatr-gradient-text">Tasks</h1>          <p className="text-muted-foreground mt-1">
            Manage your career development tasks
          </p>
        </div>
        <ElevatrButton variant="motivation" onClick={handleNewTaskClick}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </ElevatrButton>
      </div>

        {/* Filters */}
        <ElevatrCard variant="glass" className="mb-6">
          <div className="elevatr-card-content">
            <div className="flex gap-4 items-center justify-between">
              <Tooltip content="Filter tasks">
                <Filter className="w-4 h-4 text-primary" />
              </Tooltip>
              <div className='flex gap-2'>
                <div className="flex items-center gap-2">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed' | 'blocked')}
                    className="glass-panel border-0 rounded-md px-3 py-2 text-sm bg-background/50"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'all')}
                    className="glass-panel border-0 rounded-md px-3 py-2 text-sm bg-background/50"
                  >
                    <option value="all">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dueSoonFilter}
                      onChange={() => setDueSoonFilter(v => !v)}
                      className="accent-primary"
                    />
                    Due Soon
                  </label>
                </div>
              </div>
            </div>
          </div>
        </ElevatrCard>        {/* Task Stats */}
        {(() => {
          const stats = [
            {
              label: 'Total Tasks',
              value: tasks.length,
              icon: <Clock className="w-6 h-6 text-primary" />, 
              theme: 'primary',
              bg: 'bg-primary/10',
            },
            {
              label: 'Active',
              value: tasks.filter((t: Task) => t.status === 'active').length,
              icon: <Clock className="w-6 h-6 text-accent" />, 
              theme: 'accent',
              bg: 'bg-accent/10',
            },
            {
              label: 'Completed',
              value: tasks.filter((t: Task) => t.status === 'completed').length,
              icon: <CheckCircle className="w-6 h-6 text-success" />, 
              theme: 'success',
              bg: 'bg-success/10',
            },
            {
              label: 'Blocked',
              value: tasks.filter((t: Task) => t.status === 'blocked').length,
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
          );
        })()}

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
        </div>

        {/* New Task Modal Placeholder */}
        {showNewTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-background rounded-lg p-8 shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create New Task</h2>
              <p className="text-muted-foreground mb-4">(Task creation form coming soon...)</p>
              <ElevatrButton variant="secondary" onClick={handleCloseNewTaskModal}>Close</ElevatrButton>
            </div>
          </div>
        )}
    </div>
  );
}
