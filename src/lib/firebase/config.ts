import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

let analyticsReady = false;
let analyticsInstance: import("firebase/analytics").Analytics | null = null;

function isLocalHost(): boolean {
  if (typeof window === "undefined") return true;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

/** client-only */
export async function initAnalytics(): Promise<void> {
  if (typeof window === "undefined") return;
  if (isLocalHost()) return;
  if (!firebaseConfig.measurementId) return;
  if (analyticsReady) return;

  const { getAnalytics, isSupported } = await import("firebase/analytics");
  if (!(await isSupported())) return;

  analyticsInstance = getAnalytics(app);
  analyticsReady = true;
}

/** pause/resume collection (e.g. skip /admin). not running if Analytics was never started. */
export async function setAnalyticsCollection(enabled: boolean): Promise<void> {
  if (!analyticsReady || isLocalHost()) return;
  const { setAnalyticsCollectionEnabled, getAnalytics } =
    await import("firebase/analytics");
  setAnalyticsCollectionEnabled(
    analyticsInstance ?? getAnalytics(app),
    enabled,
  );
}
