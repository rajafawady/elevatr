'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Plus, CheckCircle, Clock, AlertCircle, Filter } from 'lucide-react';
import { Task, TaskPriority } from '@/types';
import { useTaskStore } from '@/stores';
import { format } from 'date-fns';

export default function TasksPage() {
  const { user } = useAuth();
  const { tasks, loading, updateTaskOptimistic } = useTaskStore();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'blocked'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');

  // Helper function to convert Date or Timestamp to Date
  const toDate = (dateValue: Date | any): Date => {
    if (dateValue instanceof Date) {
      return dateValue;
    }
    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    }
    return new Date(dateValue);
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
  const filteredTasks = tasks.filter((task: Task) => {
    if (filter !== 'all' && task.status !== filter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    return true;
  });const getStatusIcon = (status: 'active' | 'completed' | 'blocked') => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'active': return <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'blocked': return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'low': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      default: return 'bg-muted text-muted-foreground';
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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Tasks</h1>
            <p className="text-muted-foreground mt-1">
              Manage your career development tasks
            </p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed' | 'blocked')}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
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
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Task Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{tasks.length}</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tasks.filter((t: Task) => t.status === 'active').length}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tasks.filter((t: Task) => t.status === 'completed').length}
                </p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Blocked</p>                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tasks.filter((t: Task) => t.status === 'blocked').length}
                </p>
              </div>
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-full">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No tasks found</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create your first task
              </Button>
            </Card>          ) : (
            filteredTasks.map((task: Task) => (
              <Card key={task.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => handleToggleTask(task)}
                      className="mt-1 transition-colors hover:scale-105"
                    >
                      {getStatusIcon(task.status)}
                    </button>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${
                        task.status === 'completed' 
                          ? 'line-through text-gray-500' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>                        {task.dueDate && (
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
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
