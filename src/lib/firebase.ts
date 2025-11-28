// src/lib/firebase.ts
import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyBWJoWerUztk9opWD1J6I45TwhdoDp6dnY",
  authDomain: "sehati-kopi-digital-fy12l.firebaseapp.com",
  databaseURL: "https://sehati-kopi-digital-fy12l-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "sehati-kopi-digital-fy12l",
  storageBucket: "sehati-kopi-digital-fy12l.firebasestorage.app",
  messagingSenderId: "1013267327927",
  appId: "1:1013267327927:web:fce6c5d0f7e2b834871632"
};


// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Connect to emulators in development.
if (process.env.NODE_ENV === 'development') {
    // This is a common pattern to avoid reconnecting on hot reloads.
    // The emulators don't throw an error if you connect more than once,
    // but it's good practice to avoid it.
    if ((auth as any)._emulatorConfig === undefined) {
        connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
        console.log("Firebase Auth emulator connected.");
    }
    if ((db as any)._settings.host !== "127.0.0.1:8080") {
        connectFirestoreEmulator(db, "127.0.0.1", 8080);
        console.log("Firestore emulator connected.");
    }
}

export { app, auth, db };
