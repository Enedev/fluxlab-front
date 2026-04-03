/**
 * Authentication Context
 * 
 * Provides global authentication state management throughout the application.
 * Wraps the entire app to provide user data, auth state, and auth methods.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { supabase } from '../config/supabase';

// Create the auth context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Wrap your App with this to enable authentication throughout the app
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state and listen for changes
  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const currentSession = await authService.getCurrentSession();
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        }
      } catch (err) {
        console.error('Initialize auth error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
          setUser(session?.user || null);
        }
      );

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, []);

  /**
   * Handle user login
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.signIn(email, password);
      
      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      setSession(result.session);
      setUser(result.user);
      return { 
        success: true, 
        user: result.user,
        session: result.session 
      };
    } catch (err) {
      const message = err.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user logout
   */
  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await authService.signOut();
      setSession(null);
      setUser(null);
      return { success: true };
    } catch (err) {
      const message = err.message || 'Logout failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle user registration (if needed)
   */
  const signup = async (email, password, name = '') => {
    setLoading(true);
    setError(null);
    try {
      const result = await authService.signUp(email, password, name);
      
      if (result.error) {
        setError(result.error);
        return { success: false, error: result.error };
      }

      return { success: true, user: result.user };
    } catch (err) {
      const message = err.message || 'Signup failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get user role
   * For admins: returns 'admin' (from app_metadata.role)
   * For normal users: returns 'authenticated' (from base role field)
   * app_metadata.role is ONLY used for admin identification
   */
  const getUserRole = () => {
    // Check if user is admin (only admins have app_metadata.role)
    if (user?.app_metadata?.role === 'admin') {
      return 'admin';
    }
    // Normal users just have the base role
    return user?.role || null;
  };

  /**
   * Check if user has specific role
   * Special handling: only checks app_metadata.role for 'admin'
   */
  const hasRole = (role) => {
    if (role === 'admin') {
      // Only admins have app_metadata.role === 'admin'
      return user?.app_metadata?.role === 'admin';
    }
    // For other roles, check the base role field
    return user?.role === role;
  };

  /**
   * Check if user is admin
   * Convenience method - checks only app_metadata.role for admin
   */
  const isAdmin = () => {
    return user?.app_metadata?.role === 'admin';
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return session !== null && user !== null;
  };

  const value = {
    // State
    user,
    session,
    loading,
    error,
    
    // Methods
    login,
    logout,
    signup,
    
    // Utilities
    isAuthenticated,
    getUserRole,
    hasRole,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use auth context
 * Usage: const { user, loading, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
