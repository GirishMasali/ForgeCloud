/**
 * ForgeCloud Authentication Service
 * Communicates with backend /api/auth and /api/users endpoints.
 */

import api from './api';

export const authService = {
  /**
   * Submits credentials to obtain a JWT Bearer token and user summary.
   */
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user } = response.data;
    localStorage.setItem('forgecloud_token', access_token);
    localStorage.setItem('forgecloud_user', JSON.stringify(user));
    return { token: access_token, user };
  },

  /**
   * Registers a new platform user identity.
   */
  async register(payload) {
    const response = await api.post('/auth/register', payload);
    return response.data;
  },

  /**
   * Retrieves the currently authenticated user's profile and RBAC role.
   */
  async getCurrentUser() {
    const response = await api.get('/users/me');
    const user = response.data;
    localStorage.setItem('forgecloud_user', JSON.stringify(user));
    return user;
  },

  /**
   * Clears session credentials.
   */
  logout() {
    localStorage.removeItem('forgecloud_token');
    localStorage.removeItem('forgecloud_user');
  },

  /**
   * Retrieves cached user from localStorage.
   */
  getCachedUser() {
    try {
      const data = localStorage.getItem('forgecloud_user');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  /**
   * Retrieves cached token from localStorage.
   */
  getCachedToken() {
    return localStorage.getItem('forgecloud_token');
  },
};

export default authService;
