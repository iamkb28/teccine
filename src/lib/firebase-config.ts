import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getDatabase, Database } from 'firebase/database';

// Firebase configuration - replace with your own config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

// Initialize Firebase
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let realtimeDB: Database | null = null;

export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error(
        'Firebase configuration is missing. Please set up your Firebase environment variables.'
      );
    }
    app = initializeApp(firebaseConfig);
  }
  return app;
};

export const getFirestoreDB = (): Firestore => {
  if (!db) {
    getFirebaseApp();
    db = getFirestore(app!);
  }
  return db;
};

export const getRealtimeDB = (): Database => {
  if (!realtimeDB) {
    getFirebaseApp();
    realtimeDB = getDatabase(app!);
  }
  return realtimeDB;
};
