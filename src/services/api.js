/**
 * API Service
 * 
 * Centralized service for all API calls to the NestJS backend.
 * Uses JWT tokens from Supabase for authentication.
 * NO MOCKS - Ready for real backend integration.
 */

import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const CLIENTS_API_URL = import.meta.env.VITE_CLIENTS_API_URL || 'http://localhost:3000/api/clients';

function buildApiUrl(baseUrl, endpoint = '') {
  if (!endpoint) return baseUrl;

  if (endpoint.startsWith('?')) {
    return `${baseUrl}${endpoint}`;
  }

  const normalizedBase = baseUrl.replace(/\/$/, '');
  const normalizedEndpoint = endpoint.replace(/^\//, '');
  return `${normalizedBase}/${normalizedEndpoint}`;
}

/**
 * Make authenticated API requests with JWT token
 */
async function apiRequest(endpoint, options = {}, baseUrl = API_URL) {
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

    const response = await fetch(buildApiUrl(baseUrl, endpoint), {
      ...options,
      headers
    });

    // Handle empty responses (like 204 No Content or successful DELETE with no body)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }

    // Try to parse JSON only if there's content
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;

    if (!response.ok) {
      throw new Error(data?.message || `API error: ${response.status}`);
    }

    return data;
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
    async getAll(params = {}) {
      const searchParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });

      const query = searchParams.toString();
      const endpoint = query ? `?${query}` : '';

      return apiRequest(endpoint, {}, CLIENTS_API_URL);
    },

    async getById(id) {
      return apiRequest(`/${id}`, {}, CLIENTS_API_URL);
    },

    async create(clientData) {
      return apiRequest('', {
        method: 'POST',
        body: JSON.stringify(clientData)
      }, CLIENTS_API_URL);
    },

    async update(id, clientData) {
      return apiRequest(`/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(clientData)
      }, CLIENTS_API_URL);
    },

    async remove(id) {
      return apiRequest(`/${id}`, {
        method: 'DELETE'
      }, CLIENTS_API_URL);
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
   * PATCH /api/samples/:id
   * DELETE /api/samples/:id
   */
  samples: {
    async getAll(projectId = null) {
      let endpoint = '/samples';
      if (projectId) {
        endpoint += `?projectId=${projectId}`;
      }
      return apiRequest(endpoint);
    },

    async getById(id) {
      return apiRequest(`/samples/${id}`);
    },

    async create(sampleData) {
      return apiRequest('/samples', {
        method: 'POST',
        body: JSON.stringify(sampleData)
      });
    },

    async createWithValues(sampleData) {
      return apiRequest('/samples/with-values', {
        method: 'POST',
        body: JSON.stringify(sampleData)
      });
    },

    async update(id, sampleData) {
      return apiRequest(`/samples/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(sampleData)
      });
    },

    async updateWithValues(id, sampleData) {
      return apiRequest(`/samples/${id}/with-values`, {
        method: 'PATCH',
        body: JSON.stringify(sampleData)
      });
    },

    async remove(id) {
      return apiRequest(`/samples/${id}`, {
        method: 'DELETE'
      });
    }
  },

  /**
   * TEMPLATES ENDPOINTS
   * GET /api/templates
   * GET /api/templates/:id
   * POST /api/templates
   * POST /api/templates/with-fields
   * PATCH /api/templates/:id
   * DELETE /api/templates/:id
   */
  templates: {
    async getAll() {
      return apiRequest('/templates');
    },

    async getById(id) {
      return apiRequest(`/templates/${id}`);
    },

    async create(templateData) {
      return apiRequest('/templates', {
        method: 'POST',
        body: JSON.stringify(templateData)
      });
    },

    async createWithFields(templateWithFieldsData) {
      return apiRequest('/templates/with-fields', {
        method: 'POST',
        body: JSON.stringify(templateWithFieldsData)
      });
    },

    async update(id, templateData) {
      return apiRequest(`/templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(templateData)
      });
    },

    async remove(id) {
      return apiRequest(`/templates/${id}`, {
        method: 'DELETE'
      });
    }
  }
};

export default apiService;
