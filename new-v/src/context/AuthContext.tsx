import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: (removeFromRecent?: boolean) => void;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsAuthReady(true);
  }, []);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    // Add to recent accounts
    const recent = JSON.parse(localStorage.getItem('recentAccounts') || '[]');
    const filtered = recent.filter((acc: any) => acc.user.email !== newUser.email);
    const updated = [{ token: newToken, user: newUser }, ...filtered].slice(0, 5);
    localStorage.setItem('recentAccounts', JSON.stringify(updated));
  };

  const logout = (removeFromRecent = false) => {
    if (removeFromRecent && user) {
      const recent = JSON.parse(localStorage.getItem('recentAccounts') || '[]');
      const filtered = recent.filter((acc: any) => acc.user.email !== user.email);
      localStorage.setItem('recentAccounts', JSON.stringify(filtered));
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
      <AuthContext.Provider value={{ user, token, login, logout, isAuthReady }}>
        {children}
      </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
