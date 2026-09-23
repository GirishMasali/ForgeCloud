/**
 * ForgeCloud Centralized Axios API Client
 * Configures base URL, automatic JWT Bearer token attachment, and 401 handling.
 */

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Bearer token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('forgecloud_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't intercept login errors themselves
      if (!error.config.url.includes('/auth/login')) {
        localStorage.removeItem('forgecloud_token');
        localStorage.removeItem('forgecloud_user');
        window.dispatchEvent(new Event('forgecloud_auth_expired'));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
