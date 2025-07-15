
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function initializeFirebaseApp(config: FirebaseOptions) {
    // Check if all required environment variables are set
    if (
        !config.apiKey ||
        !config.authDomain ||
        !config.projectId ||
        !config.storageBucket ||
        !config.messagingSenderId ||
        !config.appId
    ) {
        console.warn("Firebase config is incomplete. Using fallback or expecting emulator. Some features might not work.");
        // You might want to throw an error here in a production environment
        // throw new Error("Firebase configuration is missing in environment variables.");
    }

    return !getApps().length ? initializeApp(config) : getApp();
}

const app = initializeFirebaseApp(firebaseConfig);

export { app };
