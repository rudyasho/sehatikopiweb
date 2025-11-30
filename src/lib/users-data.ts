// src/lib/users-data.ts
'use server';

import { getAuth, getDb } from './firebase-admin';
import { SUPER_ADMIN_EMAIL, type AppUser } from '@/context/auth-context';

export type { AppUser } from '@/context/auth-context';

export type CreateUserFormData = {
  displayName: string;
  email: string;
  password?: string;
};

// This type is for creating the document in Firestore
type FirestoreUser = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  role?: 'Super Admin' | 'Admin' | 'User';
  createdAt?: string;
};

export async function createUserInFirestore(userData: FirestoreUser) {
    const dbAdmin = getDb();
    if (!dbAdmin) throw new Error("Firestore is not initialized.");
    const authAdmin = getAuth();
    if (!authAdmin) throw new Error("Firebase Auth is not initialized.");
    const userRef = dbAdmin.collection('users').doc(userData.uid);
    const userDoc = await userRef.get();

    // Only create the document if it doesn't already exist
    if (!userDoc.exists) {
        const role = userData.email === SUPER_ADMIN_EMAIL ? 'Super Admin' : (userData.role || 'User');
        await userRef.set({
            ...userData,
            role: role,
            createdAt: new Date().toISOString(),
        });
        
        // Also set custom claims if it's the super admin
        if (role === 'Super Admin') {
             await authAdmin.setCustomUserClaims(userData.uid, { role: 'Super Admin' });
        }
    }
}

export async function listAllUsers(): Promise<AppUser[]> {
  const authAdmin = getAuth();
  if (!authAdmin) throw new Error("Firebase Auth is not initialized.");
  
  const userRecords = await authAdmin.listUsers();
  
  return userRecords.users.map(user => {
    const customClaims = (user.customClaims || {}) as { role?: string };
    let role = customClaims.role || 'User';
    if (user.email === SUPER_ADMIN_EMAIL) {
        role = 'Super Admin';
    }

    // This is a simplified version of Firebase's UserInfo for our AppUser type.
    // It's important to only include serializable properties.
    return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        disabled: user.disabled,
        emailVerified: user.emailVerified,
        // Custom property
        role: role as 'Super Admin' | 'Admin' | 'User',
    };
  });
}

export async function createUser(userData: CreateUserFormData) {
    const authAdmin = getAuth();
    if (!authAdmin) throw new Error("Firebase Auth is not initialized.");
    
    try {
        const userRecord = await authAdmin.createUser({
            email: userData.email,
            password: userData.password,
            displayName: userData.displayName,
        });

        // Also create the user document in Firestore
        await createUserInFirestore({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: userRecord.displayName,
            role: 'User'
        });

    } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
            throw new Error('A user with this email address already exists.');
        }
        throw new Error(error.message || 'Failed to create user account.');
    }
}

export async function setUserRole(uid: string, role: 'Admin' | 'User'): Promise<void> {
    const dbAdmin = getDb();
    if (!dbAdmin) throw new Error("Firestore is not initialized.");
    const authAdmin = getAuth();
    if (!authAdmin) throw new Error("Firebase Auth is not initialized.");
    const userToUpdate = await authAdmin.getUser(uid);
    if (userToUpdate.email === SUPER_ADMIN_EMAIL) {
        throw new Error("Cannot change the role of the Super Admin account.");
    }

    await authAdmin.setCustomUserClaims(uid, { role });

    // Also update the role in the Firestore document
    const userRef = dbAdmin.collection('users').doc(uid);
    await userRef.update({ role });
}

export async function updateUserDisabledStatus(uid: string, disabled: boolean) {
    const authAdmin = getAuth();
    if (!authAdmin) throw new Error("Firebase Auth is not initialized.");
    const userToUpdate = await authAdmin.getUser(uid);
    if (userToUpdate.email === SUPER_ADMIN_EMAIL) {
        throw new Error("Cannot modify the Super Admin account.");
    }
    await authAdmin.updateUser(uid, { disabled });
}

export async function deleteUserAccount(uid: string) {
    const dbAdmin = getDb();
    if (!dbAdmin) throw new Error("Firestore is not initialized.");
    const authAdmin = getAuth();
    if (!authAdmin) throw new Error("Firebase Auth is not initialized.");
    const userToDelete = await authAdmin.getUser(uid);
    if (userToDelete.email === SUPER_ADMIN_EMAIL) {
        throw new Error("Cannot delete the Super Admin account.");
    }
    // Delete from Auth
    await authAdmin.deleteUser(uid);
    // Delete from Firestore
    await dbAdmin.collection('users').doc(uid).delete();
}

    