// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyBWJoWerUztk9opWD1J6I45TwhdoDp6dnY",
  authDomain: "sehati-kopi-digital-fy12l.firebaseapp.com",
  projectId: "sehati-kopi-digital-fy12l",
  storageBucket: "sehati-kopi-digital-fy12l.appspot.com",
  messagingSenderId: "1013267327927",
  appId: "1:1013267327927:web:fce6c5d0f7e2b834871632"
};

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators in development.
// This is done outside of a useEffect or try-catch to ensure it's reliably set
// on server start in the dev environment.
if (process.env.NODE_ENV === 'development') {
    // Check if emulators are already connected to prevent errors on hot-reloads
    if ((auth as any)._emulatorConfig === undefined) {
        try {
            connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
            console.log("Firebase Auth emulator connected.");
        } catch(e) {
            console.error("Failed to connect to auth emulator", e);
        }
    }
    if ((db as any)._settings.host !== "127.0.0.1:8080") {
         try {
            connectFirestoreEmulator(db, "127.0.0.1", 8080);
            console.log("Firestore emulator connected.");
        } catch(e) {
            console.error("Failed to connect to firestore emulator", e);
        }
    }
}

export { app, auth, db };
