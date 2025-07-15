// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBWJoWerUztk9opWD1J6I45TwhdoDp6dnY",
  authDomain: "sehati-kopi-digital-fy12l.firebaseapp.com",
  projectId: "sehati-kopi-digital-fy12l",
  storageBucket: "sehati-kopi-digital-fy12l.appspot.com",
  messagingSenderId: "1013267327927",
  appId: "1:1013267327927:web:fce6c5d0f7e2b834871632"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
