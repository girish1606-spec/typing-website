import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('typespeed_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from stored token
  const refreshProfile = useCallback(async () => {
    const storedToken = localStorage.getItem('typespeed_token');
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getProfile();
      if (res && res.success && res.user) {
        setUser(res.user);
      } else {
        localStorage.removeItem('typespeed_token');
        setUser(null);
      }
    } catch {
      localStorage.removeItem('typespeed_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res && res.token && res.user) {
      localStorage.setItem('typespeed_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const developerLogin = async (email, password) => {
    const res = await api.developerLogin({ email, password });
    if (res && res.token && res.user) {
      localStorage.setItem('typespeed_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const developerRegister = async (devData) => {
    const res = await api.developerRegister(devData);
    if (res && res.token && res.user) {
      localStorage.setItem('typespeed_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res && res.token && res.user) {
      localStorage.setItem('typespeed_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('typespeed_token');
    setToken(null);
    setUser(null);
  };

  const isDeveloper = user && user.role === 'developer';
  const isPremium = user && user.subscriptionStatus === 'active';
  const isSubscriptionPending = user && user.subscriptionStatus === 'pending';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isDeveloper,
        isPremium,
        isSubscriptionPending,
        login,
        developerLogin,
        developerRegister,
        register,
        logout,
        refreshProfile,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
