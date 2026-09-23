/**
 * ForgeCloud AuthContext
 * Provides global state management for authenticated user session, JWT token, and RBAC roles.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(authService.getCachedUser());
  const [token, setToken] = useState(authService.getCachedToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if stored token is still valid on initial load
    async function verifySession() {
      const cachedToken = authService.getCachedToken();
      if (cachedToken) {
        try {
          const profile = await authService.getCurrentUser();
          setUser(profile);
          setToken(cachedToken);
        } catch {
          // Token expired or invalid
          authService.logout();
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    }

    verifySession();

    // Listen for global 401 expiration event
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('forgecloud_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('forgecloud_auth_expired', handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    const { token: newToken, user: newUser } = await authService.login(email, password);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  const register = async (name, email, password, role = 'DEVELOPER') => {
    await authService.register({ name, email, password, role });
    return await login(email, password);
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const role = user?.role || null;
  const isAdmin = role === 'ADMIN';
  const isDeveloper = role === 'DEVELOPER' || role === 'ADMIN';
  const isViewer = role === 'VIEWER';
  const isAuthenticated = Boolean(token && user);

  const value = {
    user,
    token,
    role,
    isAdmin,
    isDeveloper,
    isViewer,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
