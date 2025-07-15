
// src/context/auth-context.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { app } from '@/lib/firebase';
import { getFirestore, collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';


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

const db = getFirestore(app);
const usersCollection = collection(db, 'users');


async function getOrCreateUser(email: string): Promise<User> {
    const q = query(usersCollection, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        // User exists, return user data
        const userDoc = querySnapshot.docs[0];
        return userDoc.data() as User;
    } else {
        // User does not exist, create a new user document
        console.log(`User ${email} not found in Firestore. Creating new user...`);
        const newUser: User = {
            name: 'Super Admin',
            email: email,
            avatar: 'https://placehold.co/100x100.png'
        };
        // Use email as the document ID for simplicity in this mock system
        const userDocRef = doc(db, "users", email);
        await setDoc(userDocRef, newUser);
        console.log(`New user ${email} created in Firestore.`);
        return newUser;
    }
}


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
    
    // Step 1: Check mock credentials (password check)
    if (credentials.email !== 'dev@sidepe.com' || credentials.password !== 'admin123') {
        setLoading(false);
        return false;
    }

    try {
        // Step 2: Get or create user in Firestore
        const firestoreUser = await getOrCreateUser(credentials.email);

        // Step 3: Set user state and save to localStorage
        localStorage.setItem('sehati-user', JSON.stringify(firestoreUser));
        setUser(firestoreUser);
        setLoading(false);
        return true;

    } catch (error) {
        console.error("Error during login with Firestore:", error);
        setLoading(false);
        return false;
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
