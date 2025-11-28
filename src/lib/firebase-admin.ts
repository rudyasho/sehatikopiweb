// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

// Check for the existence of Firebase Admin credentials in environment variables.
const hasAdminCredentials = 
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY;

let app: admin.app.App;

// Initialize the app only if it hasn't been initialized yet and credentials are provided.
if (!admin.apps.length) {
    if (hasAdminCredentials) {
        const serviceAccount: admin.ServiceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        };

        try {
            app = admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } catch (error: any) {
            console.error("Firebase Admin SDK initialization error:", error.message);
            // Let the app continue running, but dbAdmin and authAdmin will be null,
            // and functions using them will throw errors.
        }
    } else {
        console.warn(
            "Firebase Admin credentials are not configured. " +
            "Server-side Firebase features will be disabled. " +
            "Please check your .env file."
        );
    }
} else {
    app = admin.apps[0]!;
}

// Throw a clear error if any function tries to use dbAdmin or authAdmin without proper initialization.
const getDbAdmin = () => {
    if (!app || !hasAdminCredentials) {
        throw new Error("Firestore Admin is not initialized. Check your Firebase Admin credentials.");
    }
    return admin.firestore(app);
};

const getAuthAdmin = () => {
    if (!app || !hasAdminCredentials) {
        throw new Error("Firebase Auth Admin is not initialized. Check your Firebase Admin credentials.");
    }
    return admin.auth(app);
}


// Export getters instead of the potentially null constants
export { app as adminApp };
export const dbAdmin = hasAdminCredentials ? getDbAdmin() : null;
export const authAdmin = hasAdminCredentials ? getAuthAdmin() : null;
