import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('sl_token') || null);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sl_user')) || null; } catch { return null; }
  });

  function persist(t, u) {
    localStorage.setItem('sl_token', t);
    localStorage.setItem('sl_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  }

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data.token, data.user);
    return data.user;
  }, []);

  // Owner: creates a new organisation
  const registerOrg = useCallback(async (orgName, name, email, password) => {
    const { data } = await api.post('/auth/register/org', { orgName, name, email, password });
    persist(data.token, data.user);
    return data.user;
  }, []);

  // Admin: joins existing org with invite code
  const registerAdmin = useCallback(async (inviteCode, name, email, password) => {
    const { data } = await api.post('/auth/register/admin', { inviteCode, name, email, password });
    persist(data.token, data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('sl_token');
    localStorage.removeItem('sl_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      token, user, login,
      registerOrg, registerAdmin,
      logout,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
