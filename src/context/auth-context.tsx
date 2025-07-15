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
  login: (credentials: {email: string; password: string;}) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

  const login = async (credentials: {email: string; password: string;}): Promise<boolean> => {
    setLoading(true);
    
    // Check mock credentials
    if (credentials.email !== 'dev@sidepe.com' || credentials.password !== 'admin123') {
        setLoading(false);
        return false;
    }

    try {
        // Since this is a mock auth system, we'll create the user object statically
        const loggedInUser: User = {
            name: 'Super Admin',
            email: credentials.email,
            avatar: 'https://placehold.co/100x100.png',
        };

        // Set user state and save to localStorage
        localStorage.setItem('sehati-user', JSON.stringify(loggedInUser));
        setUser(loggedInUser);
        return true;

    } catch (error) {
        console.error("Error during login process:", error);
        return false;
    } finally {
        setLoading(false);
    }
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
