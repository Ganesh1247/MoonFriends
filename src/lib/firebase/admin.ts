import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

function getFirebaseAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Parse the service account key from environment variable
  let serviceAccount: ServiceAccount;
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!raw || raw === '{}') {
      console.warn(
        '⚠️ FIREBASE_SERVICE_ACCOUNT_KEY not set. Admin SDK will use application default credentials.'
      );
      return initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
    serviceAccount = JSON.parse(raw) as ServiceAccount;
  } catch {
    throw new Error(
      'Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Ensure it is valid JSON.'
    );
  }

  return initializeApp({
    credential: cert(serviceAccount),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const app = getFirebaseAdminApp();

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);
export const adminStorage = getStorage(app);
export default app;
