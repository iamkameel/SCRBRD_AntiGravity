// Firebase Client Configuration
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "mock-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mock-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mock-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mock-storage-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "mock-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "mock-app-id",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "mock-measurement-id",
};

// Initialize Firebase (only once)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Analytics (only on client side)
let analytics: Analytics | null = null;
if (typeof window !== 'undefined' && getApps().length > 0) {
  analytics = getAnalytics(app);
}

export { analytics };
export default app;

// Export Firebase Storage for uploads
import { getStorage } from 'firebase/storage';
export const storage = getStorage(app);

// Data Connect
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@/generated/dataconnect';
export const dataconnect = getDataConnect(app, connectorConfig);
