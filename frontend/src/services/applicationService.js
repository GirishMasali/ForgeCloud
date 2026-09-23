/**
 * ForgeCloud Application Service
 * Communicates with backend /api/applications CRUD endpoints.
 */

import api from './api';

export const applicationService = {
  /**
   * Retrieves list of registered applications.
   */
  async getApplications(skip = 0, limit = 100) {
    const response = await api.get('/applications', {
      params: { skip, limit },
    });
    return response.data;
  },

  /**
   * Retrieves a single application by ID.
   */
  async getApplication(id) {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  /**
   * Registers a new application.
   */
  async createApplication(payload) {
    const response = await api.post('/applications', payload);
    return response.data;
  },

  /**
   * Updates an existing application configuration.
   */
  async updateApplication(id, payload) {
    const response = await api.put(`/applications/${id}`, payload);
    return response.data;
  },

  /**
   * Deletes an application.
   */
  async deleteApplication(id) {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },

  /**
   * Retrieves platform system health.
   */
  async getHealth() {
    const response = await api.get('/health');
    return response.data;
  },
};

export default applicationService;
