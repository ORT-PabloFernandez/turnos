'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  // Cargar sesión almacenada
  useEffect(() => {
    try {
      const savedToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      const savedUser = typeof window !== 'undefined' ? localStorage.getItem('currentUser') : null;
      if (savedToken && savedUser) {
        setToken(savedToken);
        setCurrentUser(JSON.parse(savedUser));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error en el login');

      const userToken = data.token || data.accessToken;
      const userData = data.user || data;

      setToken(userToken);
      setCurrentUser(userData);
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', userToken);
        localStorage.setItem('currentUser', JSON.stringify(userData));
      }
      return { success: true, data };
    } catch (err) {
      console.error('Error en login:', err);
      return { success: false, error: err.message };
    }
  };

  const register = async (userInput) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userInput),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error en el registro');

      if (data.token || data.accessToken) {
        const userToken = data.token || data.accessToken;
        const user = data.user || data;
        setToken(userToken);
        setCurrentUser(user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('authToken', userToken);
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      }
      return { success: true, data };
    } catch (err) {
      console.error('Error en registro:', err);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
    }
  };

  const value = useMemo(() => ({
    currentUser,
    token,
    loading,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout,
  }), [currentUser, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
