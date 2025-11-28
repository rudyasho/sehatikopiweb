// src/lib/users-data.ts
'use server';

import { authAdmin } from './firebase-admin';
import { SUPER_ADMIN_EMAIL, type AppUser } from '@/context/auth-context';

export type { AppUser } from '@/context/auth-context';

export type CreateUserFormData = {
  displayName: string;
  email: string;
  password?: string;
};

export async function listAllUsers(): Promise<AppUser[]> {
  if (!authAdmin) {
    throw new Error("Firebase Admin SDK for Auth is not initialized.");
  }
  
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
    if (!authAdmin) {
        throw new Error("Firebase Admin SDK for Auth is not initialized.");
    }
    
    try {
        await authAdmin.createUser({
            email: userData.email,
            password: userData.password,
            displayName: userData.displayName,
        });
    } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
            throw new Error('A user with this email address already exists.');
        }
        throw new Error(error.message || 'Failed to create user account.');
    }
}

export async function setUserRole(uid: string, role: 'Admin' | 'User'): Promise<void> {
    if (!authAdmin) {
        throw new Error("Firebase Admin SDK for Auth is not initialized.");
    }
    const userToUpdate = await authAdmin.getUser(uid);
    if (userToUpdate.email === SUPER_ADMIN_EMAIL) {
        throw new Error("Cannot change the role of the Super Admin account.");
    }

    await authAdmin.setCustomUserClaims(uid, { role });
}

export async function updateUserDisabledStatus(uid: string, disabled: boolean) {
    if (!authAdmin) {
        throw new Error("Firebase Admin SDK for Auth is not initialized.");
    }
    const userToUpdate = await authAdmin.getUser(uid);
    if (userToUpdate.email === SUPER_ADMIN_EMAIL) {
        throw new Error("Cannot modify the Super Admin account.");
    }
    await authAdmin.updateUser(uid, { disabled });
}

export async function deleteUserAccount(uid: string) {
    if (!authAdmin) {
        throw new Error("Firebase Admin SDK for Auth is not initialized.");
    }
     const userToDelete = await authAdmin.getUser(uid);
    if (userToDelete.email === SUPER_ADMIN_EMAIL) {
        throw new Error("Cannot delete the Super Admin account.");
    }
    await authAdmin.deleteUser(uid);
}
