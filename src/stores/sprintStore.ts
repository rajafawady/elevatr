import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Sprint } from '@/types';
import { 
  getSprintsByUser, 
  getSprint, 
  createSprint, 
  updateSprint,
  getActiveSprint 
} from '@/services/firebase';
import * as localStorageService from '@/services/localStorage';

interface SprintState {
  // State
  sprints: Sprint[];
  activeSprint: Sprint | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadSprints: (userId: string) => Promise<void>;
  loadActiveSprint: (userId: string) => Promise<void>;
  loadSprint: (sprintId: string) => Promise<Sprint | null>;
  addSprint: (sprint: Omit<Sprint, 'id'>) => Promise<string>;
  updateSprintOptimistic: (sprintId: string, updates: Partial<Sprint>) => Promise<void>;
  clearError: () => void;
  clearSprints: () => void;
}

export const useSprintStore = create<SprintState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        sprints: [],
        activeSprint: null,
        loading: false,
        error: null,        // Load all sprints for a user
        loadSprints: async (userId: string) => {
          const state = get();
          
          // Return cached data if available
          if (state.sprints.length > 0) {
            return;
          }
          
          set({ loading: true, error: null });
          
          try {
            let sprints: Sprint[];
            
            if (localStorageService.isLocalUser(userId)) {
              // Load from local storage
              sprints = localStorageService.getLocalSprints(userId);
            } else {
              // Load from Firebase
              sprints = await getSprintsByUser(userId);
            }
            
            set({ 
              sprints, 
              loading: false,
              error: null 
            });
          } catch (error) {
            console.error('Error loading sprints:', error);
            set({ 
              loading: false, 
              error: 'Failed to load sprints' 
            });
          }
        },        // Load active sprint for a user
        loadActiveSprint: async (userId: string) => {
          const state = get();
          
          // Return cached data if available
          if (state.activeSprint) {
            return;
          }
          
          set({ loading: true, error: null });
          
          try {
            let activeSprint: Sprint | null;
            
            if (localStorageService.isLocalUser(userId)) {
              // Load from local storage
              activeSprint = localStorageService.getLocalActiveSprint(userId);
            } else {
              // Load from Firebase
              activeSprint = await getActiveSprint(userId);
            }
            
            set({ 
              activeSprint, 
              loading: false,
              error: null 
            });
          } catch (error) {
            console.error('Error loading active sprint:', error);
            set({ 
              loading: false, 
              error: 'Failed to load active sprint' 
            });
          }
        },        // Load a specific sprint
        loadSprint: async (sprintId: string) => {
          const state = get();
          
          // Check if sprint is already cached
          const cachedSprint = state.sprints.find(s => s.id === sprintId);
          if (cachedSprint) {
            return cachedSprint;
          }
          
          set({ loading: true, error: null });
          
          try {
            const sprint = await getSprint(sprintId);
            
            if (sprint) {
              // Add to cache
              set(state => ({ 
                sprints: [...state.sprints.filter(s => s.id !== sprintId), sprint],
                loading: false,
                error: null 
              }));
            } else {
              set({ loading: false, error: 'Sprint not found' });
            }
            
            return sprint;
          } catch (error) {
            console.error('Error loading sprint:', error);
            set({ 
              loading: false, 
              error: 'Failed to load sprint' 
            });
            return null;
          }
        },        // Add a new sprint
        addSprint: async (sprintData: Omit<Sprint, 'id'>) => {
          set({ loading: true, error: null });
          
          try {
            let sprintId: string;
            let newSprint: Sprint;
            
            if (localStorageService.isLocalUser(sprintData.userId)) {
              // Create in local storage
              newSprint = localStorageService.addLocalSprint(sprintData.userId, sprintData);
              sprintId = newSprint.id;
            } else {
              // Create in Firebase
              sprintId = await createSprint(sprintData.userId, sprintData);
              newSprint = { ...sprintData, id: sprintId };
            }
            
            set(state => {
              let updatedSprints = [...state.sprints];
              
              // If the new sprint is active, mark previous active sprints as completed
              if (newSprint.status === 'active') {
                updatedSprints = updatedSprints.map(sprint => 
                  sprint.status === 'active' 
                    ? { ...sprint, status: 'completed' as const, updatedAt: new Date().toISOString() }
                    : sprint
                );
              }
              
              // Add the new sprint
              updatedSprints.push(newSprint);
              
              return {
                sprints: updatedSprints,
                activeSprint: newSprint.status === 'active' ? newSprint : state.activeSprint,
                loading: false,
                error: null 
              };
            });
            
            return sprintId;
          } catch (error) {
            console.error('Error creating sprint:', error);
            set({ 
              loading: false, 
              error: 'Failed to create sprint' 
            });
            throw error;
          }
        },// Update sprint with optimistic updates
        updateSprintOptimistic: async (sprintId: string, updates: Partial<Sprint>) => {
          const state = get();
          
          // Find the sprint to get the userId
          const sprint = state.sprints.find(s => s.id === sprintId);
          if (!sprint) {
            console.error('Sprint not found for update');
            return;
          }
          
          // Optimistic update
          set(state => ({
            sprints: state.sprints.map(sprint => 
              sprint.id === sprintId 
                ? { ...sprint, ...updates, updatedAt: new Date().toISOString() }
                : sprint
            ),
            activeSprint: state.activeSprint?.id === sprintId 
              ? { ...state.activeSprint, ...updates, updatedAt: new Date().toISOString() }
              : state.activeSprint
          }));
          
          try {
            if (localStorageService.isLocalUser(sprint.userId)) {
              // Update in local storage
              localStorageService.updateLocalSprint(sprint.userId, sprintId, updates);
            } else {
              // Update in Firebase
              await updateSprint(sprintId, updates);
            }
          } catch (error) {
            // Revert optimistic update on error
            set(state);
            console.error('Error updating sprint:', error);
            set({ error: 'Failed to update sprint' });
            throw error;
          }
        },

        // Clear error
        clearError: () => {
          set({ error: null });
        },

        // Clear sprints (for logout)
        clearSprints: () => {
          set({ 
            sprints: [], 
            activeSprint: null, 
            loading: false, 
            error: null 
          });
        },
      }),
      {
        name: 'sprint-store',
        partialize: (state) => ({ 
          sprints: state.sprints, 
          activeSprint: state.activeSprint 
        }),
      }
    ),
    { name: 'SprintStore' }
  )
);
