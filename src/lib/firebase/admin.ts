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
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!raw || raw.trim() === '' || raw.trim() === '{}') {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY is not set. Add it in Vercel Settings → Environment Variables.'
    );
  }

  try {
    // Attempt 1: direct parse (works when Vercel preserves real newlines in the JSON)
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Attempt 2: Vercel sometimes double-escapes newlines — try replacing \\n with \n first
      parsed = JSON.parse(raw.replace(/\\n/g, '\n'));
    }

    // Guarantee private_key uses real newline characters (not the two-char sequence)
    if (parsed.private_key) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    }

    serviceAccount = parsed as ServiceAccount;
  } catch (e) {
    throw new Error(
      `Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: ${e instanceof Error ? e.message : e}. ` +
      'Paste the raw JSON file content (not the .env.local value) into Vercel.'
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
