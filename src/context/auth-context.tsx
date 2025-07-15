
// src/context/auth-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, type User as FirebaseUser } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export type User = FirebaseUser;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Only initialize auth if the app object was created successfully
    if (app) {
      const auth = getAuth(app);
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // If firebase app is not initialized, stop loading and do nothing.
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async () => {
    if (!app) {
        console.error("Firebase not initialized, cannot log in.");
        return;
    }
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle setting the user
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email === 'dev@sidepe.com') {
        router.push('/dashboard');
      } else {
        router.push('/profile');
      }
    } catch (error) {
      console.error("Error during Google sign-in:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!app) {
        console.error("Firebase not initialized, cannot log out.");
        return;
    }
    const auth = getAuth(app);
    await signOut(auth);
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
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
