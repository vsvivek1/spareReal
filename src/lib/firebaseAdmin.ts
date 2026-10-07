import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const adminApp = getApps().length
  ? getApp()
  : initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
        // Vercel's env var UI stores the PEM with literal "\n" escapes.
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n")
      }),
      // Same bucket the client SDKs upload listing/vehicle photos to.
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
    });

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
