import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { CurrentUser } from '../types/auth';

interface AuthContextType {
  user: CurrentUser | null;
  token: string | null;
  login: (token: string, user: CurrentUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<CurrentUser | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (newToken: string, newUser: CurrentUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
