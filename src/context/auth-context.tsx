// src/context/auth-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  name: string;
  email: string;
  avatar: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: {email: string; password: string;}) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUser: User = {
  name: 'Alexandre Christie',
  email: 'alex@example.com',
  avatar: 'https://placehold.co/100x100.png'
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for an existing session
    try {
      const storedUser = localStorage.getItem('sehati-user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (credentials: {email: string; password: string;}) => {
    setLoading(true);
    // Simulate an API call. In a real app, you'd validate credentials here.
    // For this mock, we'll log in the user as long as they provide any email/password.
    console.log("Attempting to log in with:", credentials.email);
    setTimeout(() => {
      const userToLogin = {...mockUser, email: credentials.email};
      localStorage.setItem('sehati-user', JSON.stringify(userToLogin));
      setUser(userToLogin);
      setLoading(false);
    }, 500);
  };

  const logout = () => {
    localStorage.removeItem('sehati-user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
