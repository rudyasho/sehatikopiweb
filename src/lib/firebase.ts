
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";

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

    // Initialize Firebase only if it hasn't been initialized yet
    return !getApps().length ? initializeApp(config) : getApp();
}

// Initialize the app and export it
const app = initializeFirebaseApp(firebaseConfig);

export { app };
