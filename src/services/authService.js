/**
 * Authentication Service - SUPABASE ONLY
 * 
 * NO MOCKS - Only real Supabase authentication with JWT tokens
 * Manages all authentication operations using Supabase Auth
 */

import { supabase } from '../config/supabase';

export const authService = {
  /**
   * Sign in with email and password
   * Uses Supabase Auth - Returns JWT token
   */
  async signIn(email, password) {
    try {
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Get passwordChanged status from backend
      let passwordChanged = false;
      try {
        const token = data.session?.access_token;
        if (token) {
          const response = await fetch('http://localhost:3000/api/users/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const userData = await response.json();
            passwordChanged = userData.passwordChanged || false;
          }
        }
      } catch (err) {
        console.error('Error fetching user data from backend:', err);
      }

      return {
        user: {
          ...data.user,
          passwordChanged
        },
        session: data.session,
        error: null
      };
    } catch (error) {
      console.error('Supabase sign in error:', error);
      return {
        user: null,
        session: null,
        error: error.message || 'Error al iniciar sesión'
      };
    }
  },

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Supabase sign out error:', error);
      return { error: error.message || 'Error al cerrar sesión' };
    }
  },

  /**
   * Get current session with JWT token
   */
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  },

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    try {
      const session = await this.getCurrentSession();
      return session !== null;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get JWT access token
   */
  async getAccessToken() {
    try {
      const session = await this.getCurrentSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  /**
   * Refresh JWT token
   */
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return { session: data.session, error: null };
    } catch (error) {
      console.error('Error refreshing session:', error);
      return { session: null, error: error.message };
    }
  },

  /**
   * Listen to authentication state changes
   */
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(session?.user || null, session);
      }
    );
    return subscription;
  }
};

export default authService;
