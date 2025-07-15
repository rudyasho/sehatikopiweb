// src/lib/users-data.ts
'use server';

import { admin } from './firebase-admin';

export type AppUser = {
  uid: string;
  email: string | undefined;
  displayName: string | undefined;
  creationTime: string;
  disabled: boolean;
};

/**
 * Lists all users from Firebase Authentication.
 */
export async function listAllUsers(): Promise<AppUser[]> {
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
export async function updateUserDisabledStatus(uid: string, disabled: boolean): Promise<void> {
    if (!admin) {
        throw new Error("Firebase Admin SDK is not initialized.");
    }
    await admin.auth().updateUser(uid, { disabled });
}


/**
 * Deletes a user account permanently.
 * @param uid - The UID of the user to delete.
 */
export async function deleteUserAccount(uid: string): Promise<void> {
    if (!admin) {
        throw new Error("Firebase Admin SDK is not initialized.");
    }
    await admin.auth().deleteUser(uid);
}
