
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";


// Client-side Firebase configuration should ONLY use public environment variables.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function initializeFirebaseApp(config: FirebaseOptions) {
    // Check if all necessary keys are present
    const isConfigured = config && config.apiKey && config.projectId;

    if (!isConfigured) {
        console.warn("Client-side Firebase config is incomplete or missing. Firebase features like Auth will be disabled. Please check your NEXT_PUBLIC_ environment variables.");
        return null;
    }

    const app = !getApps().length ? initializeApp(config) : getApp();

    // Connect to emulators in development
    if (process.env.NODE_ENV === 'development') {
      try {
        const auth = getAuth(app);
        connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });

        const db = getFirestore(app);
        connectFirestoreEmulator(db, "127.0.0.1", 8080);
        console.log("Firebase client connected to Auth and Firestore emulators.");

      } catch (e) {
         // This can happen with hot-reloading. The connection was already made.
         // console.warn("Firebase client emulator connection error:", e);
      }
    }

    return app;
}

// Initialize the app and export it
const app = initializeFirebaseApp(firebaseConfig);

export { app };
