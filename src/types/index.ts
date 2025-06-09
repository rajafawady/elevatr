// Core types for the Elevatr app
import { Timestamp } from 'firebase/firestore';

export interface Day {
  day: string;
  date: string;
  coreTasks: { category: string; description: string }[];
  specialTasks: string[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'active' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high';
  category?: string;
  sprintId?: string;
  dayId?: string;
  taskType?: 'core' | 'special';
  taskIndex?: number;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  completedAt?: Date | Timestamp | null;
  dueDate?: Date | Timestamp | null;
}

export type TaskPriority = 'low' | 'medium' | 'high';

export interface Sprint {
  id: string;
  userId: string;
  title: string;
  description: string;
  duration: 15 | 30;
  startDate: string;
  endDate: string;
  status?: 'active' | 'completed' | 'paused';
  days: Day[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskStatus {
  id?: string;
  title?: string;
  dayId: string;
  taskType: 'core' | 'special';
  taskIndex: number;
  completed: boolean;
  completedAt?: string | null;
  updatedAt: Date | Timestamp;
}

export interface JournalEntry {
  id: string;
  userId: string;
  dayId: string;
  content: string;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
}

export interface UserProgress {
  userId: string;
  sprintId: string;
  taskStatuses: TaskStatus[];
  journalEntries: JournalEntry[];
  streaks: {
    currentTaskStreak: number;
    longestTaskStreak: number;
    currentJournalStreak: number;
    longestJournalStreak: number;
  };
  stats: {
    totalTasksCompleted: number;
    totalDaysCompleted: number;
    completionPercentage: number;
  };
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string;
  lastLoginAt: string;
  preferences: {
    darkMode: boolean;
    notifications: boolean;
    notificationTime: string;
    timezone: string;
  };
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'task' | 'journal' | 'completion';
  status: 'completed' | 'missed' | 'upcoming';
}
