// Utility functions for common operations
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date utilities
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const formatShortDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

export const isToday = (date: Date | string): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  return today.toDateString() === checkDate.toDateString();
};

export const isPastDate = (date: Date | string): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  today.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

export const isFutureDate = (date: Date | string): boolean => {
  const today = new Date();
  const checkDate = new Date(date);
  today.setHours(0, 0, 0, 0);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate > today;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const timeDiff = endDate.getTime() - startDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

// Progress calculations
export const calculateCompletionPercentage = (
  completed: number,
  total: number
): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

export const calculateStreak = (dates: Date[]): number => {
  if (dates.length === 0) return 0;
  
  // Sort dates in descending order
  const sortedDates = dates.sort((a, b) => b.getTime() - a.getTime());
  
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (const date of sortedDates) {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    
    const dayDiff = getDaysBetween(checkDate, currentDate);
    
    if (dayDiff === 0 || dayDiff === 1) {
      streak++;
      currentDate = checkDate;
    } else {
      break;
    }
  }
    return streak;
};

// Sprint utilities
export const calculateProgress = (
  sprint: any, 
  userProgress?: any
): { completedTasks: number; totalTasks: number; percentage: number } => {
  let completedTasks = 0;
  let totalTasks = 0;
  
  sprint.days.forEach((day: any) => {
    totalTasks += day.coreTasks.length + day.specialTasks.length;
  });
  
  // Calculate completed tasks if user progress is provided
  if (userProgress && userProgress.taskStatuses) {
    completedTasks = userProgress.taskStatuses.filter((ts: any) => ts.completed).length;
  }
  
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0;
  
  return { completedTasks, totalTasks, percentage };
};

export const getDaysRemaining = (endDate: string): number => {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// Local storage utilities
export const saveToLocalStorage = (key: string, data: any): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }
};

export const getFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window !== 'undefined') {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  }
  return defaultValue;
};

export const removeFromLocalStorage = (key: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
};

// File upload utilities
export const validateJSONFile = (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        resolve(json);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

// Sprint validation
export const validateSprintData = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  // Check required fields
  if (!data.title || !data.duration || !data.days || !Array.isArray(data.days)) {
    return false;
  }
  
  // Validate duration
  if (data.duration !== 15 && data.duration !== 30) {
    return false;
  }
  
  // Validate days array
  if (data.days.length !== data.duration) {
    return false;
  }
  
  // Validate each day
  for (const day of data.days) {
    if (!day.day || !day.date || !day.coreTasks || !day.specialTasks) {
      return false;
    }
    
    if (!Array.isArray(day.coreTasks) || !Array.isArray(day.specialTasks)) {
      return false;
    }
    
    // Validate core tasks
    for (const task of day.coreTasks) {
      if (!task.category || !task.description) {
        return false;
      }
    }
  }
  
  return true;
};

// Notification utilities
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });
  }
};
