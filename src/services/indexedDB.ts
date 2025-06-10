// IndexedDB service using Dexie for guest and authenticated user data
import Dexie, { Table } from 'dexie';
import { Sprint, UserProgress, TaskStatus, JournalEntry, User } from '@/types';

export interface GuestData {
  id?: number;
  guestId: string;
  sprints: Sprint[];
  userProgress: UserProgress[];
  user: User;
  createdAt: string;
  updatedAt: string;
}

export interface CachedUserData {
  id?: number;
  userId: string;
  sprints: Sprint[];
  userProgress: UserProgress[];
  user: User;
  lastSyncAt: string;
  isStale: boolean;
}

export interface SyncQueue {
  id?: number;
  userId: string;
  operation: 'create' | 'update' | 'delete';
  entityType: 'sprint' | 'progress' | 'task' | 'journal';
  entityId: string;
  data: any;
  timestamp: string;
  retryCount: number;
  lastAttempt?: string;
}

export class ElevatrDB extends Dexie {
  // Guest data tables
  guestData!: Table<GuestData>;
  
  // Cached authenticated user data
  cachedUserData!: Table<CachedUserData>;
  
  // Sync queue for offline changes
  syncQueue!: Table<SyncQueue>;
  
  constructor() {
    super('ElevatrDB');
    
    this.version(1).stores({
      guestData: '++id, guestId, createdAt, updatedAt',
      cachedUserData: '++id, userId, lastSyncAt, isStale',
      syncQueue: '++id, userId, entityType, timestamp, retryCount'
    });
  }
}

export const db = new ElevatrDB();

// Guest data management
export const saveGuestData = async (guestId: string, data: Omit<GuestData, 'id' | 'guestId' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  const now = new Date().toISOString();
  
  try {
    const existing = await db.guestData.where('guestId').equals(guestId).first();
    
    if (existing) {
      await db.guestData.update(existing.id!, {
        ...data,
        updatedAt: now
      });
    } else {
      await db.guestData.add({
        guestId,
        ...data,
        createdAt: now,
        updatedAt: now
      });
    }
  } catch (error) {
    console.error('Error saving guest data:', error);
    throw error;
  }
};

export const getGuestData = async (guestId: string): Promise<GuestData | null> => {
  try {
    const data = await db.guestData.where('guestId').equals(guestId).first();
    return data || null;
  } catch (error) {
    console.error('Error getting guest data:', error);
    return null;
  }
};

export const deleteGuestData = async (guestId: string): Promise<void> => {
  try {
    await db.guestData.where('guestId').equals(guestId).delete();
  } catch (error) {
    console.error('Error deleting guest data:', error);
    throw error;
  }
};

// Cached user data management
export const cacheUserData = async (userId: string, data: Omit<CachedUserData, 'id' | 'userId' | 'lastSyncAt' | 'isStale'>): Promise<void> => {
  const now = new Date().toISOString();
  
  try {
    const existing = await db.cachedUserData.where('userId').equals(userId).first();
    
    if (existing) {
      await db.cachedUserData.update(existing.id!, {
        ...data,
        lastSyncAt: now,
        isStale: false
      });
    } else {
      await db.cachedUserData.add({
        userId,
        ...data,
        lastSyncAt: now,
        isStale: false
      });
    }
  } catch (error) {
    console.error('Error caching user data:', error);
    throw error;
  }
};

export const getCachedUserData = async (userId: string): Promise<CachedUserData | null> => {
  try {
    const data = await db.cachedUserData.where('userId').equals(userId).first();
    return data || null;
  } catch (error) {
    console.error('Error getting cached user data:', error);
    return null;
  }
};

export const markUserDataStale = async (userId: string): Promise<void> => {
  try {
    await db.cachedUserData.where('userId').equals(userId).modify({ isStale: true });
  } catch (error) {
    console.error('Error marking user data as stale:', error);
  }
};

export const deleteCachedUserData = async (userId: string): Promise<void> => {
  try {
    await db.cachedUserData.where('userId').equals(userId).delete();
  } catch (error) {
    console.error('Error deleting cached user data:', error);
    throw error;
  }
};

// Sync queue management
export const addToSyncQueue = async (item: Omit<SyncQueue, 'id' | 'timestamp' | 'retryCount'>): Promise<void> => {
  try {
    await db.syncQueue.add({
      ...item,
      timestamp: new Date().toISOString(),
      retryCount: 0
    });
  } catch (error) {
    console.error('Error adding to sync queue:', error);
    throw error;
  }
};

export const getSyncQueue = async (userId: string): Promise<SyncQueue[]> => {
  try {
    return await db.syncQueue.where('userId').equals(userId).toArray();
  } catch (error) {
    console.error('Error getting sync queue:', error);
    return [];
  }
};

export const removeSyncQueueItem = async (id: number): Promise<void> => {
  try {
    await db.syncQueue.delete(id);
  } catch (error) {
    console.error('Error removing sync queue item:', error);
  }
};

export const incrementSyncRetry = async (id: number): Promise<void> => {
  try {
    const item = await db.syncQueue.get(id);
    if (item) {
      await db.syncQueue.update(id, {
        retryCount: item.retryCount + 1,
        lastAttempt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error incrementing sync retry:', error);
  }
};

// Utility functions
export const clearAllGuestData = async (): Promise<void> => {
  try {
    await db.guestData.clear();
  } catch (error) {
    console.error('Error clearing guest data:', error);
    throw error;
  }
};

export const clearAllCachedData = async (): Promise<void> => {
  try {
    await db.cachedUserData.clear();
  } catch (error) {
    console.error('Error clearing cached data:', error);
    throw error;
  }
};

export const getDatabaseStats = async () => {
  try {
    const [guestCount, cachedCount, syncQueueCount] = await Promise.all([
      db.guestData.count(),
      db.cachedUserData.count(),
      db.syncQueue.count()
    ]);
    
    return {
      guestData: guestCount,
      cachedData: cachedCount,
      syncQueue: syncQueueCount
    };
  } catch (error) {
    console.error('Error getting database stats:', error);
    return { guestData: 0, cachedData: 0, syncQueue: 0 };
  }
};

export const clearGuestData = async (guestId: string): Promise<void> => {
  try {
    await db.guestData.where('guestId').equals(guestId).delete();
  } catch (error) {
    console.error('Error clearing guest data for ID:', guestId, error);
    throw error;
  }
};
