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


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators in development
if (process.env.NODE_ENV === 'development') {
    // Check if emulators are already running to avoid re-connecting on hot-reloads
    if ((auth as any)._emulatorConfig === undefined) {
        connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
        console.log("Firebase client connected to Auth emulator.");
    }
    if ((db as any)._settings.host !== "127.0.0.1:8080") {
        connectFirestoreEmulator(db, "127.0.0.1", 8080);
        console.log("Firebase client connected to Firestore emulator.");
    }
}

export { app };
