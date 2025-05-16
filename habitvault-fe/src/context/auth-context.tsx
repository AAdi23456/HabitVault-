"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Import API configuration
import { API_ENDPOINTS, createAuthHeaders, apiUtils } from "@/lib/api-config";

// Define the shape of the authentication state
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Define the User type
interface User {
  id: string;
  email: string;
  // Add any other user properties returned by your API
}

// Define the shape of auth responses
interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

// Backend API response interfaces
interface BackendLoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

interface BackendRegisterResponse {
  success: boolean;
  message?: string;
}

// Define the shape of the auth context
interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (email: string, password: string, username?: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

// Create the auth context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props interface
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing session on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // First check if there's stored user data
        const userStr = localStorage.getItem("user");
        let user = null;
        
        if (userStr) {
          user = JSON.parse(userStr);
          
          // Verify session with the server
          try {
            console.log("Verifying session with server...");
            const response = await fetch(API_ENDPOINTS.AUTH.ME, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.user) {
                // Update user data with latest from server
                user = data.user;
                localStorage.setItem("user", JSON.stringify(user));
                console.log("Session verified successfully");
              } else {
                // Server says no valid session
                console.log("Server reported no valid session");
                localStorage.removeItem("user");
                user = null;
              }
            } else {
              console.log("Failed to verify session:", response.status);
              // Keep using cached user data but log the issue
            }
          } catch (error) {
            console.error("Error verifying session:", error);
            // Keep using cached user data if server is unavailable
          }
        }
        
        setAuthState({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        });
        
      } catch (error) {
        console.error("Authentication check failed:", error);
        localStorage.removeItem("user");
        
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      // Call the backend API
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important: This allows cookies to be sent and received
        body: JSON.stringify({ email, password }),
      });
      
      console.log(response);
      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || `Login failed with status: ${response.status}`,
        };
      }
      
      const data: BackendLoginResponse = await response.json();
      
      if (data.success && data.user) {
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // The auth cookie is automatically handled by the browser
        // since the backend is setting the cookie
        
        // Update auth state
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          isLoading: false,
        });
        
        return {
          success: true,
          message: data.message || "Login successful",
          user: data.user,
        };
      } else {
        return {
          success: false,
          message: data.message || "Invalid email or password",
        };
      }
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Login failed. Please try again.",
      };
    }
  };

  // Register function
  const register = async (email: string, password: string, username?: string): Promise<AuthResponse> => {
    try {
      // Call the backend API
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Allow cookies
        body: JSON.stringify({ email, password, username }),
      });
      
      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.message || `Registration failed with status: ${response.status}`,
        };
      }
      
      const data: BackendRegisterResponse = await response.json();
      
      return {
        success: data.success,
        message: data.message || (data.success ? "Registration successful" : "Registration failed"),
      };
    } catch (error) {
      console.error("Registration failed:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Registration failed. Please try again.",
      };
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      // Call backend logout endpoint to clear cookies if available
      try {
        await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
          method: 'POST',
          credentials: 'include',
        });
      } catch (e) {
        console.error("Logout endpoint failed:", e);
        // Continue with local logout even if endpoint fails
      }
      
      // Clear local user data
      localStorage.removeItem("user");
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Combine state and functions to provide through context
  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
} 