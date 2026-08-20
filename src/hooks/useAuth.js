import React, { createContext, useContext, useEffect, useState } from 'react';
import { mockUsers } from '../data/mockUsers';

const AuthContext = createContext(null);
const SESSION_KEY = 'proauth-demo-user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else sessionStorage.removeItem(SESSION_KEY);
  }, [user]);

  const login = (email, password, role) => {
    const match = mockUsers.find(account => account.email === email && account.password === password && account.role === role);
    if (!match) return false;
    setUser(match);
    return true;
  };

  const logout = () => setUser(null);
  return React.createElement(AuthContext.Provider, { value: { user, role: user?.role || null, isAuthenticated: Boolean(user), login, logout } }, children);
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth must be used inside AuthProvider');
  return auth;
}

