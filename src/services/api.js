/**
 * API Service
 * 
 * Centralized service for all API calls to the NestJS backend.
 * Uses JWT tokens from Supabase for authentication.
 * NO MOCKS - Ready for real backend integration.
 */

import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Make authenticated API requests with JWT token
 */
async function apiRequest(endpoint, options = {}) {
  try {
    // Get JWT token from Supabase
    const token = await authService.getAccessToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Add JWT to Authorization header
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

// ============================================================================
// API SERVICE - READY FOR BACKEND INTEGRATION
// ============================================================================

export const apiService = {
  /**
   * USER ENDPOINTS
   * GET /api/auth/profile
   * PATCH /api/auth/profile
   */
  user: {
    async getProfile() {
      return apiRequest('/auth/profile');
    },

    async updateProfile(profileData) {
      return apiRequest('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(profileData)
      });
    }
  },

  /**
   * DASHBOARD ENDPOINTS
   * GET /api/dashboard/summary
   * GET /api/dashboard/workflow-status
   */
  dashboard: {
    async getSummary() {
      return apiRequest('/dashboard/summary');
    },

    async getWorkflowStatus() {
      return apiRequest('/dashboard/workflow-status');
    }
  },

  /**
   * CLIENTS ENDPOINTS
   * GET /api/clients
   * GET /api/clients/:id
   * POST /api/clients
   */
  clients: {
    async getAll() {
      return apiRequest('/clients');
    },

    async getById(id) {
      return apiRequest(`/clients/${id}`);
    },

    async create(clientData) {
      return apiRequest('/clients', {
        method: 'POST',
        body: JSON.stringify(clientData)
      });
    }
  },

  /**
   * PROJECTS ENDPOINTS
   * GET /api/projects
   * GET /api/projects/:id
   * POST /api/projects
   */
  projects: {
    async getAll() {
      return apiRequest('/projects');
    },

    async getById(id) {
      return apiRequest(`/projects/${id}`);
    },

    async create(projectData) {
      return apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify(projectData)
      });
    }
  },

  /**
   * SAMPLES ENDPOINTS
   * GET /api/samples
   * GET /api/samples/:id
   * POST /api/samples
   */
  samples: {
    async getAll() {
      return apiRequest('/samples');
    },

    async getById(id) {
      return apiRequest(`/samples/${id}`);
    },

    async create(sampleData) {
      return apiRequest('/samples', {
        method: 'POST',
        body: JSON.stringify(sampleData)
      });
    }
  }
};

export default apiService;
