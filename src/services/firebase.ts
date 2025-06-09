// Firebase service functions for CRUD operations
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Sprint, UserProgress, TaskStatus, JournalEntry, Task } from '@/types';

// Helper functions for Date/Timestamp conversions
const getTimestamp = (date: Date | Timestamp): number => {
  if (date instanceof Date) {
    return date.getTime();
  }
  return date.toMillis();
};

const toISOString = (date: Date | Timestamp): string => {
  if (date instanceof Date) {
    return date.toISOString();
  }
  return date.toDate().toISOString();
};

// Sprint operations
export const createSprint = async (userId: string, sprintData: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const now = new Date().toISOString();
  const sprintRef = doc(collection(db, 'sprints'));
  
  const sprint: Sprint = {
    ...sprintData,
    id: sprintRef.id,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(sprintRef, sprint);

  // Create initial user progress
  const progressRef = doc(collection(db, 'userProgress'));
  const initialProgress: UserProgress = {
    userId,
    sprintId: sprint.id,
    taskStatuses: [],
    journalEntries: [],
    streaks: {
      currentTaskStreak: 0,
      longestTaskStreak: 0,
      currentJournalStreak: 0,
      longestJournalStreak: 0,
    },
    stats: {
      totalTasksCompleted: 0,
      totalDaysCompleted: 0,
      completionPercentage: 0,
    },
  };

  await setDoc(progressRef, initialProgress);

  return sprint.id;
};

export const getUserSprints = async (userId: string): Promise<Sprint[]> => {
  // Get user's progress to find associated sprints
  const progressQuery = query(
    collection(db, 'userProgress'),
    where('userId', '==', userId)
  );
  
  const progressSnap = await getDocs(progressQuery);
  const sprintIds = progressSnap.docs.map(doc => doc.data().sprintId);
  
  if (sprintIds.length === 0) return [];

  // Get sprints
  const sprints: Sprint[] = [];
  for (const sprintId of sprintIds) {
    const sprintDoc = await getDoc(doc(db, 'sprints', sprintId));
    if (sprintDoc.exists()) {
      sprints.push(sprintDoc.data() as Sprint);
    }
  }

  return sprints.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const getSprintsByUser = async (userId: string): Promise<Sprint[]> => {
  const sprintsQuery = query(
    collection(db, 'sprints'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const sprintsSnap = await getDocs(sprintsQuery);
  return sprintsSnap.docs.map(doc => doc.data() as Sprint);
};

export const getSprint = async (sprintId: string): Promise<Sprint | null> => {
  const sprintDoc = await getDoc(doc(db, 'sprints', sprintId));
  return sprintDoc.exists() ? sprintDoc.data() as Sprint : null;
};

export const updateSprint = async (sprintId: string, updates: Partial<Sprint>): Promise<void> => {
  const sprintRef = doc(db, 'sprints', sprintId);
  await updateDoc(sprintRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
};

export const deleteSprint = async (sprintId: string, userId: string): Promise<void> => {
  // Delete sprint
  await deleteDoc(doc(db, 'sprints', sprintId));
  
  // Delete associated user progress
  const progressQuery = query(
    collection(db, 'userProgress'),
    where('userId', '==', userId),
    where('sprintId', '==', sprintId)
  );
  
  const progressSnap = await getDocs(progressQuery);
  for (const progressDoc of progressSnap.docs) {
    await deleteDoc(progressDoc.ref);
  }
};

// User Progress operations
export const getUserProgress = async (userId: string, sprintId: string): Promise<UserProgress | null> => {
  const progressQuery = query(
    collection(db, 'userProgress'),
    where('userId', '==', userId),
    where('sprintId', '==', sprintId)
  );
  
  const progressSnap = await getDocs(progressQuery);
  
  if (progressSnap.empty) return null;
  
  return progressSnap.docs[0].data() as UserProgress;
};

export const updateTaskStatus = async (
  userId: string,
  sprintId: string,
  taskStatus: TaskStatus
): Promise<void> => {
  const progressQuery = query(
    collection(db, 'userProgress'),
    where('userId', '==', userId),
    where('sprintId', '==', sprintId)
  );
  
  const progressSnap = await getDocs(progressQuery);
  
  if (progressSnap.empty) {
    throw new Error('User progress not found');
  }
  
  const progressDoc = progressSnap.docs[0];  const progress = progressDoc.data() as UserProgress;
  
  // Update or add task status
  const existingIndex = progress.taskStatuses.findIndex(
    ts => ts.dayId === taskStatus.dayId && 
         ts.taskType === taskStatus.taskType && 
         ts.taskIndex === taskStatus.taskIndex
  );
  
  if (existingIndex >= 0) {
    progress.taskStatuses[existingIndex] = {
      ...taskStatus,
      updatedAt: Timestamp.now(),
    };
  } else {
    progress.taskStatuses.push({
      ...taskStatus,
      updatedAt: Timestamp.now(),
    });
  }
  
  // Recalculate stats
  const completedTasks = progress.taskStatuses.filter(ts => ts.completed).length;
  const sprint = await getSprint(sprintId);
  
  if (sprint) {
    const totalTasks = sprint.days.reduce((total, day) => 
      total + day.coreTasks.length + day.specialTasks.length, 0
    );
      progress.stats = {
      totalTasksCompleted: completedTasks,
      totalDaysCompleted: calculateCompletedDays(progress.taskStatuses, sprint),
      completionPercentage: Math.round((completedTasks / totalTasks) * 100),
    };
  }
  
  await updateDoc(progressDoc.ref, {
    taskStatuses: progress.taskStatuses,
    stats: progress.stats,
  });
};

export const updateJournalEntry = async (
  userId: string,
  sprintId: string,
  journalEntry: JournalEntry
): Promise<void> => {
  const progressQuery = query(
    collection(db, 'userProgress'),
    where('userId', '==', userId),
    where('sprintId', '==', sprintId)
  );
  
  const progressSnap = await getDocs(progressQuery);
  
  if (progressSnap.empty) {
    throw new Error('User progress not found');
  }
  
  const progressDoc = progressSnap.docs[0];
  const progress = progressDoc.data() as UserProgress;
    // Update or add journal entry
  const existingIndex = progress.journalEntries.findIndex(
    je => je.dayId === journalEntry.dayId
  );
    if (existingIndex >= 0) {
    progress.journalEntries[existingIndex] = {
      ...journalEntry,
      updatedAt: Timestamp.now(),
    };
  } else {
    progress.journalEntries.push({
      ...journalEntry,
      updatedAt: Timestamp.now(),
    });
  }
  
  await updateDoc(progressDoc.ref, {
    journalEntries: progress.journalEntries,
  });
};

// Helper functions
const calculateCompletedDays = (taskStatuses: TaskStatus[], sprint: Sprint): number => {
  let completedDays = 0;
  
  for (const day of sprint.days) {
    const dayTasks = taskStatuses.filter(ts => ts.dayId === day.day);
    const totalDayTasks = day.coreTasks.length + day.specialTasks.length;
    const completedDayTasks = dayTasks.filter(ts => ts.completed).length;
    
    // Consider a day completed if 80% of tasks are done
    if (completedDayTasks >= Math.ceil(totalDayTasks * 0.8)) {
      completedDays++;
    }
  }
  
  return completedDays;
};

// Template operations
export const getPublicTemplates = async (): Promise<Sprint[]> => {
  const templatesQuery = query(
    collection(db, 'templates'),
    orderBy('createdAt', 'desc')
  );
  
  const templatesSnap = await getDocs(templatesQuery);
  return templatesSnap.docs.map(doc => doc.data() as Sprint);
};

export const createTemplate = async (sprintData: Omit<Sprint, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const now = new Date().toISOString();
  const templateRef = doc(collection(db, 'templates'));
  
  const template: Sprint = {
    ...sprintData,
    id: templateRef.id,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(templateRef, template);
  return template.id;
};

// Recent activity functions
export const getRecentJournalEntries = async (userId: string, limit: number = 10): Promise<JournalEntry[]> => {
  const journalQuery = query(
    collection(db, 'journalEntries'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const journalSnap = await getDocs(journalQuery);
  const entries = journalSnap.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt instanceof Timestamp ? 
      doc.data().createdAt.toDate() : 
      new Date(doc.data().createdAt),
    updatedAt: doc.data().updatedAt instanceof Timestamp ? 
      doc.data().updatedAt.toDate() : 
      new Date(doc.data().updatedAt),
  } as JournalEntry));
  
  return entries.slice(0, limit);
};

export const getRecentTaskUpdates = async (userId: string, limit: number = 10): Promise<TaskStatus[]> => {
  const progressQuery = query(
    collection(db, 'userProgress'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  );
  
  const progressSnap = await getDocs(progressQuery);
  const allTasks: TaskStatus[] = [];
  
  progressSnap.docs.forEach(doc => {
    const progress = doc.data() as UserProgress;
    if (progress.taskStatuses) {
      allTasks.push(...progress.taskStatuses.map(task => ({
        ...task,
        id: `${progress.sprintId}-${task.dayId}-${task.taskIndex}`,
        title: `Day ${task.dayId} - ${task.taskType} task ${task.taskIndex + 1}`,
        updatedAt: task.completedAt ? new Date(task.completedAt) : new Date(),
      })));
    }
  });
    return allTasks
    .sort((a, b) => getTimestamp(b.updatedAt) - getTimestamp(a.updatedAt))
    .slice(0, limit);
};

// Get active sprint for user
export const getActiveSprint = async (userId: string): Promise<Sprint | null> => {
  const sprintsQuery = query(
    collection(db, 'sprints'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const sprintsSnap = await getDocs(sprintsQuery);
  
  if (sprintsSnap.empty) {
    return null;
  }
  
  // Return the most recent sprint (assuming it's the active one)
  return sprintsSnap.docs[0].data() as Sprint;
};

// Get all tasks for a user (from task statuses across all sprints)
export const getTasksByUser = async (userId: string): Promise<Task[]> => {
  const progressQuery = query(
    collection(db, 'userProgress'),
    where('userId', '==', userId)
  );
  
  const progressSnap = await getDocs(progressQuery);
  const allTasks: Task[] = [];
  
  // Get sprints to get task details
  const sprintsQuery = query(
    collection(db, 'sprints'),
    where('userId', '==', userId)
  );
  const sprintsSnap = await getDocs(sprintsQuery);
  const sprints = sprintsSnap.docs.map(doc => doc.data() as Sprint);
  
  progressSnap.docs.forEach(doc => {
    const progress = doc.data() as UserProgress;
    const sprint = sprints.find(s => s.id === progress.sprintId);
    
    if (progress.taskStatuses && sprint) {
      progress.taskStatuses.forEach(taskStatus => {        const day = sprint.days.find(d => d.day === taskStatus.dayId);
        if (day) {
          const taskArray = taskStatus.taskType === 'core' ? day.coreTasks : day.specialTasks;
          const taskItem = taskArray[taskStatus.taskIndex];
          let taskTitle = '';
          let taskDescription = '';
          
          if (taskStatus.taskType === 'core' && typeof taskItem === 'object') {
            taskTitle = taskItem.category;
            taskDescription = taskItem.description;
          } else if (taskStatus.taskType === 'special' && typeof taskItem === 'string') {
            taskTitle = taskItem;
          } else {
            taskTitle = `${taskStatus.taskType} task ${taskStatus.taskIndex + 1}`;
          }
          
          allTasks.push({
            id: `${progress.sprintId}-${taskStatus.dayId}-${taskStatus.taskType}-${taskStatus.taskIndex}`,
            title: taskTitle,
            description: taskDescription || undefined,
            status: taskStatus.completed ? 'completed' : 'active',
            priority: 'medium',
            category: taskStatus.taskType === 'core' ? 'Core' : 'Special',
            sprintId: progress.sprintId,
            dayId: taskStatus.dayId,
            taskType: taskStatus.taskType,
            taskIndex: taskStatus.taskIndex,
            createdAt: new Date(sprint.createdAt),
            updatedAt: taskStatus.completedAt ? new Date(taskStatus.completedAt) : new Date(sprint.createdAt),
            completedAt: taskStatus.completedAt ? new Date(taskStatus.completedAt) : null,
            dueDate: day.date ? new Date(day.date) : null,
          });
        }
      });
    }
  });
  
  return allTasks.sort((a, b) => getTimestamp(b.updatedAt) - getTimestamp(a.updatedAt));
};

// Update task function for the tasks page
export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<void> => {
  // Parse task ID to get sprint and task details
  const [sprintId, dayId, taskType, taskIndex] = taskId.split('-');
  
  if (!sprintId || !dayId || !taskType || taskIndex === undefined) {
    throw new Error('Invalid task ID format');
  }
  
  // Find the user progress document
  const progressQuery = query(
    collection(db, 'userProgress'),
    where('sprintId', '==', sprintId)
  );
  
  const progressSnap = await getDocs(progressQuery);
  
  if (progressSnap.empty) {
    throw new Error('User progress not found');
  }
  
  const progressDoc = progressSnap.docs[0];
  const progress = progressDoc.data() as UserProgress;
  // Update task status
  const taskStatus: TaskStatus = {
    dayId: dayId,    taskType: taskType as 'core' | 'special',
    taskIndex: parseInt(taskIndex),
    completed: updates.status === 'completed',
    completedAt: updates.status === 'completed' ? (updates.completedAt ? toISOString(updates.completedAt) : new Date().toISOString()) : null,
    updatedAt: new Date(),
  };
  
  // Update or add task status
  const existingIndex = progress.taskStatuses.findIndex(
    ts => ts.dayId === taskStatus.dayId && 
         ts.taskType === taskStatus.taskType && 
         ts.taskIndex === taskStatus.taskIndex
  );
  
  if (existingIndex >= 0) {
    progress.taskStatuses[existingIndex] = taskStatus;
  } else {
    progress.taskStatuses.push(taskStatus);
  }
  
  // Recalculate stats
  const completedTasks = progress.taskStatuses.filter(ts => ts.completed).length;
  const sprint = await getSprint(sprintId);
  
  if (sprint) {
    const totalTasks = sprint.days.reduce((total, day) => 
      total + day.coreTasks.length + day.specialTasks.length, 0
    );
    progress.stats = {
      totalTasksCompleted: completedTasks,
      totalDaysCompleted: calculateCompletedDays(progress.taskStatuses, sprint),
      completionPercentage: Math.round((completedTasks / totalTasks) * 100),
    };
  }
  
  await updateDoc(progressDoc.ref, {
    taskStatuses: progress.taskStatuses,
    stats: progress.stats,
  });
};
