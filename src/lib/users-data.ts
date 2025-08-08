// src/lib/users-data.ts
'use server';

import { admin } from './firebase-admin';
import { SUPER_ADMIN_EMAIL } from '@/context/auth-context';


/**
 * Lists all users from Firebase Authentication.
 */
export async function listAllUsers() {
  if (!admin) {
    throw new Error("Firebase Admin SDK is not initialized.");
  }
  
  const userRecords = await admin.auth().listUsers();
  
  return userRecords.users.map(user => ({
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    creationTime: user.metadata.creationTime,
    disabled: user.disabled,
  }));
}

/**
 * Updates the disabled status of a user account.
 * @param uid - The UID of the user to update.
 * @param disabled - The new disabled status.
 */
export async function updateUserDisabledStatus(uid: string, disabled: boolean) {
    if (!admin) {
        throw new Error("Firebase Admin SDK is not initialized.");
    }
    const userToUpdate = await admin.auth().getUser(uid);
    if (userToUpdate.email === SUPER_ADMIN_EMAIL) {
        throw new Error("Cannot modify the Super Admin account.");
    }
    await admin.auth().updateUser(uid, { disabled });
}


/**
 * Deletes a user account permanently.
 * @param uid - The UID of the user to delete.
 */
export async function deleteUserAccount(uid: string) {
    if (!admin) {
        throw new Error("Firebase Admin SDK is not initialized.");
    }
     const userToDelete = await admin.auth().getUser(uid);
    if (userToDelete.email === SUPER_ADMIN_EMAIL) {
        throw new Error("Cannot delete the Super Admin account.");
    }
    await admin.auth().deleteUser(uid);
}
