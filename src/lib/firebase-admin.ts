// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Check if the service account details are available in environment variables
const hasServiceAccount = 
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY;

if (hasServiceAccount && !admin.apps.length) {
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

    } catch (error: any) {
        console.error("Firebase Admin SDK initialization error:", error.message);
    }
} else if (!admin.apps.length) {
    console.warn("Firebase Admin environment variables are not set. Skipping Admin SDK initialization. Server-side Firebase operations will fail.");
}

const dbAdmin = admin.apps.length ? getFirestore() : null;

export { admin, dbAdmin };
