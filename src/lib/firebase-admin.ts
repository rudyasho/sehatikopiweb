// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const hasServiceAccount = 
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY;

let dbAdmin: admin.firestore.Firestore | null = null;

if (!admin.apps.length) {
    if (hasServiceAccount) {
        try {
            const serviceAccount = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            } as admin.ServiceAccount;

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            
            console.log("Firebase Admin SDK initialized successfully.");
            dbAdmin = getFirestore();

        } catch (error: any) {
            console.error("Firebase Admin SDK initialization error:", error.message);
            throw new Error("Firebase Admin SDK could not be initialized. Check your configuration and environment variables.");
        }
    } else {
        console.warn("Firebase Admin environment variables are not set. Skipping Admin SDK initialization. Server-side Firebase operations will fail.");
    }
} else {
    // If already initialized, get the firestore instance
    dbAdmin = getFirestore();
}

export { admin, dbAdmin };
