// src/context/auth-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, type User as FirebaseUser, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export const SUPER_ADMIN_EMAIL = 'rd.lapawawoi@gmail.com';

// This is the shape of the user object available throughout the app
export interface AppUser {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  emailVerified: boolean;
  disabled: boolean;
  role?: 'Super Admin' | 'Admin' | 'User';
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (app) {
      const auth = getAuth(app);
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const tokenResult = await firebaseUser.getIdTokenResult();
          const claims = tokenResult.claims;
          const userRole = claims.role ? (claims.role as 'Admin' | 'User') : 'User';
          
          const appUser: AppUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            disabled: false, // This is not reliably detectable on client
            role: firebaseUser.email === SUPER_ADMIN_EMAIL ? 'Super Admin' : userRole,
          };
          setUser(appUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);
  
  const handleAuthSuccess = (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
          // If the logged-in user is the super admin, always redirect to the dashboard.
          if (firebaseUser.email === SUPER_ADMIN_EMAIL) {
            router.push('/dashboard');
          } else {
            // For all other users, redirect to their profile page.
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
        
        // Force token refresh to get custom claims if any are set on creation
        await userCredential.user.getIdToken(true);

        const appUser: AppUser = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            photoURL: userCredential.user.photoURL,
            emailVerified: userCredential.user.emailVerified,
            disabled: false,
            role: 'User',
        };
        setUser(appUser);
        handleAuthSuccess(userCredential.user);
      } catch (error: any) {
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
