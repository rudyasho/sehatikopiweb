// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const hasServiceAccount = 
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY;

let dbAdmin: admin.firestore.Firestore | null = null;
let adminApp: admin.app.App | null = null;

if (!admin.apps.length) {
    if (hasServiceAccount) {
        try {
            const serviceAccount = {
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            } as admin.ServiceAccount;

            adminApp = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            
            console.log("Firebase Admin SDK initialized successfully.");
            dbAdmin = getFirestore(adminApp);

        } catch (error: any) {
            console.error("Firebase Admin SDK initialization error:", error.message);
        }
    } else {
        console.warn("Firebase Admin environment variables are not set. Skipping Admin SDK initialization. Server-side Firebase operations will fail.");
    }
} else {
    adminApp = admin.apps[0];
    if (adminApp) {
        dbAdmin = getFirestore(adminApp);
    }
}

export { admin, dbAdmin };
