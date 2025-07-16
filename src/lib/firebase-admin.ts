// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Check if the service account details are available in environment variables
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
                // Replace escaped newlines in the private key
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            } as admin.ServiceAccount;

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            
            console.log("Firebase Admin SDK initialized successfully.");
            dbAdmin = getFirestore();
            
            // Connect to emulator if the environment variable is set
            if (process.env.FIRESTORE_EMULATOR_HOST) {
              console.log(`Connecting Firebase Admin SDK to Firestore emulator at ${process.env.FIRESTORE_EMULATOR_HOST}`);
              dbAdmin.settings({
                host: process.env.FIRESTORE_EMULATOR_HOST,
                ssl: false,
              });
            }

        } catch (error: any) {
            console.error("Firebase Admin SDK initialization error:", error.message);
            // Explicitly throw error if initialization fails but was attempted
            throw new Error("Firebase Admin SDK could not be initialized. Check your configuration and environment variables.");
        }
    } else {
        console.warn("Firebase Admin environment variables are not set. Skipping Admin SDK initialization. Server-side Firebase operations will fail.");
    }
} else {
    // If app is already initialized, just get the firestore instance
    dbAdmin = getFirestore();
}

export { admin, dbAdmin };
