/**
 * API Configuration for HabitVault Frontend
 * This file contains configuration for connecting to the backend API
 */

// Base URL for API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    ME: `${API_BASE_URL}/auth/me`,
  },
  // Habit endpoints
  HABITS: {
    BASE: `${API_BASE_URL}/habits`,
    STATS: `${API_BASE_URL}/habits/stats/summary`,
    byId: (id: string) => `${API_BASE_URL}/habits/${id}`,
    logs: (id: string) => `${API_BASE_URL}/habits/${id}/logs`,
    updateLog: (habitId: string, date: string) => `${API_BASE_URL}/habits/${habitId}/logs/${date}`,
  },
  // User endpoints
  USER: {
    PROFILE: `${API_BASE_URL}/user/profile`,
    PREFERENCES: `${API_BASE_URL}/user/preferences`,
  },
  // Quotes endpoints
  QUOTES: {
    ALL: `${API_BASE_URL}/quotes`,
    DAILY: `${API_BASE_URL}/quotes/daily`,
    RANDOM: `${API_BASE_URL}/quotes/random`,
  },
};

// Default request options
export const defaultRequestOptions = {
  credentials: 'include' as RequestCredentials,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Function to create headers with authentication
export const createAuthHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Basic API utilities
export const apiUtils = {
  // Handle API responses consistently 
  handleResponse: async (response: Response) => {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'An error occurred');
    }
    return data;
  },
}; 