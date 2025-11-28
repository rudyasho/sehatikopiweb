// src/lib/firebase-admin.ts
import admin from 'firebase-admin';

let app: admin.app.App;

if (!admin.apps.length) {
    const serviceAccount: admin.ServiceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
    
    try {
        app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (error: any) {
        console.error("Firebase Admin SDK initialization error:", error.message);
        // If initialization fails, app remains undefined, and dbAdmin will be null.
    }
} else {
    app = admin.apps[0]!;
}

const dbAdmin = app! ? admin.firestore(app) : null;
const authAdmin = app! ? admin.auth(app) : null;


if (!dbAdmin || !authAdmin) {
    console.error("Firestore Admin or Auth Admin is not available. Please check your Firebase configuration.");
}


export { app as adminApp, dbAdmin, authAdmin };
