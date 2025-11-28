
// src/context/auth-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, type User as FirebaseUser, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export type User = FirebaseUser;

export const SUPER_ADMIN_EMAIL = 'dev@sidepe.com';
export const ADMIN_EMAILS = [SUPER_ADMIN_EMAIL];


export type AppUser = {
  uid: string;
  email: string | null | undefined;
  displayName: string | null | undefined;
  creationTime: string;
  disabled: boolean;
};


interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
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
  
  const handleAuthSuccess = (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
          if (firebaseUser.email && ADMIN_EMAILS.includes(firebaseUser.email)) {
            router.push('/dashboard');
          } else {
            router.push('/profile');
          }
      }
  }

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
      if (!app) throw new Error("Firebase not initialized.");
      const auth = getAuth(app);
      setLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName });
        // Manually update the user in state to reflect the new displayName
        setUser({ ...userCredential.user, displayName });
        handleAuthSuccess(userCredential.user);
      } catch (error: any) {
        // Provide more specific error messages
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('This email address is already in use.');
        }
        throw new Error(error.message || 'Failed to create account.');
      } finally {
        setLoading(false);
      }
  }

  const loginWithEmail = async (email: string, password: string) => {
      if (!app) throw new Error("Firebase not initialized.");
      const auth = getAuth(app);
      setLoading(true);
      try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          handleAuthSuccess(userCredential.user);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            throw new Error('Invalid email or password.');
        }
        throw new Error(error.message || 'Failed to login.');
      } finally {
          setLoading(false);
      }
  }

  const loginWithGoogle = async () => {
    if (!app) {
        console.error("Firebase not initialized, cannot log in.");
        return;
    }
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, provider);
      handleAuthSuccess(userCredential.user);
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      throw error;
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
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithEmail, signUpWithEmail, logout }}>
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
