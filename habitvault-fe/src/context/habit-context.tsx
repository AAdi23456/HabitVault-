"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "./auth-context";
import { API_ENDPOINTS } from "@/lib/api-config";
import { useToast } from "@/components/ui/use-toast";

// Define the Habit type
export interface Habit {
  id: string;
  name: string;
  description?: string;
  targetDays: string[];
  frequency: string;
  currentStreak: number;
  longestStreak: number;
  startDate: string;
  isActive: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
  logs?: HabitLog[]; // Add optional logs field
}

// Define the HabitLog type
export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  status: 'completed' | 'missed' | 'skipped';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Define the context state
interface HabitContextState {
  habits: Habit[];
  isLoading: boolean;
  error: string | null;
  stats: any;
}

// Define the context API
interface HabitContextType extends HabitContextState {
  fetchHabits: () => Promise<void>;
  createHabit: (habit: Partial<Habit>) => Promise<Habit | null>;
  updateHabit: (id: string, habit: Partial<Habit>) => Promise<Habit | null>;
  deleteHabit: (id: string) => Promise<boolean>;
  getHabit: (id: string) => Promise<Habit | null>;
  logHabit: (habitId: string, date: string, status: 'completed' | 'missed' | 'skipped', notes?: string) => Promise<HabitLog | null>;
  fetchHabitStats: () => Promise<void>;
}

// Create the context
const HabitContext = createContext<HabitContextType | undefined>(undefined);

// Provider props
interface HabitProviderProps {
  children: ReactNode;
}

export function HabitProvider({ children }: HabitProviderProps) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<HabitContextState>({
    habits: [],
    isLoading: false,
    error: null,
    stats: null,
  });

  // Helper function to handle API errors
  const handleApiError = useCallback((error: any, message: string) => {
    console.error(`${message}:`, error);
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
    return null;
  }, [toast]);

  // Fetch all habits for the authenticated user
  const fetchHabits = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('Not authenticated, skipping habit fetch');
      return;
    }
    
    console.log('Fetching habits...');
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(API_ENDPOINTS.HABITS.BASE, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      console.log('Habits API response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch habits: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Habits data received:', data.habits?.length || 0, 'habits');
      
      if (data.success) {
        setState(prev => ({ 
          ...prev, 
          habits: data.habits, 
          isLoading: false 
        }));
      } else {
        console.error('Failed to fetch habits:', data.message);
        setState(prev => ({ 
          ...prev, 
          error: data.message || 'Failed to fetch habits', 
          isLoading: false 
        }));
      }
    } catch (error) {
      console.error('Fetch habits error:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'An error occurred while fetching habits',
        isLoading: false 
      }));
    }
  }, [isAuthenticated]);

  // Fetch habits when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      console.log('Authentication state changed, fetching habits');
      fetchHabits();
    } else {
      console.log('No longer authenticated, clearing habits');
      setState({
        habits: [],
        isLoading: false,
        error: null,
        stats: null,
      });
    }
  }, [isAuthenticated, fetchHabits]);

  // Create a new habit
  const createHabit = useCallback(async (habit: Partial<Habit>): Promise<Habit | null> => {
    if (!isAuthenticated) return null;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(API_ENDPOINTS.HABITS.BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(habit),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create habit: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setState(prev => ({ 
          ...prev, 
          habits: [...prev.habits, data.habit], 
          isLoading: false 
        }));
        
        toast({
          title: "Success",
          description: "Habit created successfully",
        });
        
        return data.habit;
      } else {
        setState(prev => ({ 
          ...prev, 
          error: data.message || 'Failed to create habit', 
          isLoading: false 
        }));
        return null;
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'An error occurred while creating habit',
        isLoading: false 
      }));
      return handleApiError(error, 'Failed to create habit');
    }
  }, [isAuthenticated, toast, handleApiError]);

  // Update an existing habit
  const updateHabit = useCallback(async (id: string, habitData: Partial<Habit>): Promise<Habit | null> => {
    if (!isAuthenticated) return null;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(`${API_ENDPOINTS.HABITS.BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(habitData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update habit: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setState(prev => ({ 
          ...prev, 
          habits: prev.habits.map(h => h.id === id ? data.habit : h), 
          isLoading: false 
        }));
        
        toast({
          title: "Success",
          description: "Habit updated successfully",
        });
        
        return data.habit;
      } else {
        setState(prev => ({ 
          ...prev, 
          error: data.message || 'Failed to update habit', 
          isLoading: false 
        }));
        return null;
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'An error occurred while updating habit',
        isLoading: false 
      }));
      return handleApiError(error, 'Failed to update habit');
    }
  }, [isAuthenticated, toast, handleApiError]);

  // Delete a habit
  const deleteHabit = useCallback(async (id: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(`${API_ENDPOINTS.HABITS.BASE}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete habit: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setState(prev => ({ 
          ...prev, 
          habits: prev.habits.filter(h => h.id !== id), 
          isLoading: false 
        }));
        
        toast({
          title: "Success",
          description: "Habit deleted successfully",
        });
        
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          error: data.message || 'Failed to delete habit', 
          isLoading: false 
        }));
        return false;
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'An error occurred while deleting habit',
        isLoading: false 
      }));
      console.error('Delete habit error:', error);
      return false;
    }
  }, [isAuthenticated, toast]);

  // Get a single habit by ID
  const getHabit = useCallback(async (id: string): Promise<Habit | null> => {
    if (!isAuthenticated) return null;
    
    try {
      const response = await fetch(`${API_ENDPOINTS.HABITS.BASE}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch habit: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.habit;
      } else {
        toast({
          title: "Error",
          description: data.message || 'Failed to fetch habit',
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      return handleApiError(error, 'Failed to fetch habit');
    }
  }, [isAuthenticated, toast, handleApiError]);

  // Log a habit completion or missed status
  const logHabit = useCallback(async (
    habitId: string, 
    date: string, 
    status: 'completed' | 'missed' | 'skipped', 
    notes?: string
  ): Promise<HabitLog | null> => {
    if (!isAuthenticated) return null;
    
    try {
      const response = await fetch(`${API_ENDPOINTS.HABITS.BASE}/${habitId}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ date, status, notes }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to log habit: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Success",
          description: data.message || 'Habit logged successfully',
        });
        
        // Refresh habits to get updated streak info
        fetchHabits(); 
        
        return data.log;
      } else {
        toast({
          title: "Error",
          description: data.message || 'Failed to log habit',
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      return handleApiError(error, 'Failed to log habit');
    }
  }, [isAuthenticated, toast, handleApiError, fetchHabits]);

  // Fetch habit statistics for analytics
  const fetchHabitStats = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await fetch(API_ENDPOINTS.HABITS.STATS, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch habit stats: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setState(prev => ({ 
          ...prev, 
          stats: data.stats, 
          isLoading: false 
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          error: data.message || 'Failed to fetch habit stats', 
          isLoading: false 
        }));
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: 'An error occurred while fetching habit stats',
        isLoading: false 
      }));
      console.error('Fetch habit stats error:', error);
    }
  }, [isAuthenticated]);

  // Combine state and functions to provide through context
  const contextValue: HabitContextType = {
    ...state,
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    getHabit,
    logHabit,
    fetchHabitStats,
  };

  return (
    <HabitContext.Provider value={contextValue}>
      {children}
    </HabitContext.Provider>
  );
}

// Custom hook to use the habit context
export function useHabit() {
  const context = useContext(HabitContext);
  
  if (context === undefined) {
    throw new Error("useHabit must be used within a HabitProvider");
  }
  
  return context;
}
